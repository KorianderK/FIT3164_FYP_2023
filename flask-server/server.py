from flask import Flask, request, jsonify, send_file, Response
import cv2
import json
import numpy as np
from flask_cors import CORS
from io import BytesIO
from skimage import io, color, img_as_float
import base64
from skimage.metrics import structural_similarity as ssim
from PIL import Image, ImageEnhance, ImageOps
from torchvision.models import vgg16
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import os
from torchvision import transforms
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def apply_gaussian_blur(image, kernel_size=(3, 3)):
    """
    Apply Gaussian blur to an input image.

    Parameters:
        image (numpy.ndarray): The input image to be blurred.
        kernel_size (tuple): The size of the Gaussian kernel (width, height).
                            Default is (3, 3).

    Returns:
        numpy.ndarray: The blurred image.

    The function applies Gaussian blur to the input image using the specified
    kernel size. Gaussian blur is a common image smoothing technique that
    reduces noise and sharpens edges.
    """
    return cv2.GaussianBlur(image, kernel_size, 0)

def resize_image(image, new_width, new_height):
    """
    Resize an input image to the specified dimensions while maintaining its aspect ratio.

    Parameters:
        image (numpy.ndarray): The input image to be resized.
        new_width (int): The desired width of the resized image.
        new_height (int): The desired height of the resized image.

    Returns:
        numpy.ndarray: The resized image.

    This function resizes the input image to the specified width and height while
    preserving the original aspect ratio. It calculates the scaling factors for
    width and height, selects the minimum scaling factor to maintain aspect ratio,
    and then resizes the image accordingly.
    """
    current_height, current_width = image.shape[:2]
    width_scale = new_width / current_width
    height_scale = new_height / current_height
    min_scale = min(width_scale, height_scale)
    new_width = int(current_width * min_scale)
    new_height = int(current_height * min_scale)
    resized_image = cv2.resize(image, (new_width, new_height))
    return resized_image


def calculate_divisor(image):
    """
    Automatically calculate a divisor based on image characteristics.

    Parameters:
        image (numpy.ndarray): The input image for which the divisor is calculated.

    Returns:
        int: The calculated divisor value.

    This function calculates a divisor value for image processing based on two criteria:
    
    1. Haze Level Assessment:
       - It assesses the haze level by comparing the average pixel intensity
         of the image to a predefined haze threshold.
       - If the average intensity is below the haze threshold, a larger divisor is chosen,
         assuming a high haze level.
       - Otherwise, a smaller divisor is selected for a lower haze level.

    2. Image Contrast Assessment:
       - It assesses image contrast by computing the difference between the maximum and
         minimum pixel intensities in the grayscale version of the image.
       - If the contrast is below a specified contrast threshold, a larger divisor is
         chosen for potential contrast enhancement.
       - Otherwise, the function retains the current divisor.
    """
    # Criterion 2: Assess haze level
    haze_threshold = 150  # Adjust this threshold as needed
    average_intensity = np.mean(image)

    if average_intensity < haze_threshold:
        # Image has a high haze level, choose a larger divisor
        divisor = 50
    else:
        # Image has a lower haze level, choose a smaller divisor
        divisor = 30

    # Criterion 3: Assess image contrast
    contrast_threshold = 50  # Adjust this threshold as needed
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    contrast = np.max(gray_image) - np.min(gray_image)

    if contrast < contrast_threshold:
        # Image has low contrast, choose a larger divisor
        divisor = max(divisor, 40)
    else:
        # Image has sufficient contrast, use the current divisor

        return divisor

def automatic_window_size(image, divisor):
    """
    Automatically calculate an adaptive window size for image processing.

    Parameters:
        image (numpy.ndarray): The input image for which the window size is calculated.
        divisor (int): A divisor value calculated based on image characteristics.

    Returns:
        int: The calculated adaptive window size.

    This function calculates an adaptive window size for image processing based on an initial
    window size, a minimum window size, and a divisor value. The divisor value is determined
    by assessing image characteristics such as haze level and contrast.
    
    - It computes an initial window size based on the dimensions of the input image.
    - It applies a lower limit to the window size to avoid very small windows.
    - The function then selects a window size that is either a fixed percentage of the initial size
      or the minimum size, whichever is larger. This adaptive window size helps balance the
      trade-off between capturing fine details and processing efficiency.
    """
    # Calculate an initial window size based on the image dimensions
    height, width = image.shape[:2]
    initial_window_size = max(height, width) // divisor  # Adjust the divisor as needed
    
    # Apply a lower limit to the window size to avoid very small windows
    min_window_size = 3
    
    # Use a fixed percentage of the initial size or the minimum size, whichever is larger
    window_size = max(initial_window_size, min_window_size)
    
    return window_size

def calculate_dark_channel(image, window_size):
    """
    Calculate the dark channel of an input image using erosion.

    Parameters:
        image (numpy.ndarray): The input image for which the dark channel is calculated.
        window_size (int): The size of the square window used for dark channel computation.

    Returns:
        numpy.ndarray: The computed dark channel image.

    This function calculates the dark channel of the input image using erosion. The dark
    channel is a low-intensity channel that represents the minimum pixel value within a
    local window of the image. It's often used in haze and fog removal techniques.
    
    - The input image is first converted to grayscale.
    - Erosion is applied using a square window of the specified size (window_size).
    - The result is the dark channel image that highlights regions with low intensity values.
    """
    # convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # calculate the dark channel by applying erosion
    dark_channel = cv2.erode(gray_image, np.ones((window_size, window_size)))
    return dark_channel

def estimate_atmospheric_light(image, dark_channel, top_percentage=0.001):
    """
    Estimate the atmospheric light of an image based on its dark channel.

    Parameters:
        image (numpy.ndarray): The input image for which atmospheric light is estimated.
        dark_channel (numpy.ndarray): The dark channel image of the input image.
        top_percentage (float): The percentage of top pixels to consider when estimating
                                atmospheric light. Default is 0.001 (0.1%).

    Returns:
        numpy.ndarray: The estimated atmospheric light as a 3-channel color vector.

    This function estimates the atmospheric light of an image based on its dark channel.
    Atmospheric light represents the maximum radiance value in outdoor scenes and is
    essential for dehazing algorithms.
    
    - The dark channel is flattened to a 1D array, and a specified percentage of the top
      pixels with the highest intensity values are selected.
    - The atmospheric light is estimated as the maximum color value (R, G, B) among the selected
      pixels in the original image.
    """
    flat_dark_channel = dark_channel.reshape(-1)
    num_pixels = len(flat_dark_channel)
    num_top_pixels = int(num_pixels * top_percentage)
    
    sorted_indices = np.argsort(flat_dark_channel)
    top_indices = sorted_indices[-num_top_pixels:]
    
    atmospheric_light = np.max(image.reshape(-1, 3)[top_indices], axis=0)
    return atmospheric_light

def estimate_transmission(dark_channel, atmospheric_light, omega=0.75):
    """
    Estimate the transmission map of an image based on its dark channel and atmospheric light.

    Parameters:
        dark_channel (numpy.ndarray): The dark channel image of the input image.
        atmospheric_light (numpy.ndarray): The estimated atmospheric light as a 3-channel color vector.
        omega (float): A weight factor for transmission calculation. Default is 0.75.

    Returns:
        numpy.ndarray: The estimated transmission map as a grayscale image.

    This function estimates the transmission map of an image, which represents the proportion
    of light that is not scattered or absorbed in the atmosphere. The transmission map is a key
    component in image dehazing algorithms.
    
    - The atmospheric light is adjusted to consider the maximum channel value.
    - The transmission map is computed as 1 minus the product of the dark channel and
      atmospheric light, weighted by the omega parameter.
    """
    atmospheric_light = max(atmospheric_light)
    transmission = 1 - omega * (dark_channel.astype(np.float32) / atmospheric_light)
    return transmission

def enhance_visibility(hazy_image, transmission_map, atmospheric_light):
    """
    Enhance the visibility of a hazy image using the transmission map and atmospheric light.

    Parameters:
        hazy_image (numpy.ndarray): The hazy input image to be enhanced.
        transmission_map (numpy.ndarray): The estimated transmission map of the hazy image.
        atmospheric_light (numpy.ndarray): The estimated atmospheric light as a 3-channel color vector.

    Returns:
        numpy.ndarray: The enhanced image with improved visibility.

    This function enhances the visibility of a hazy image by removing the effects of haze and fog.
    It utilizes the estimated transmission map and atmospheric light to perform the dehazing.
    
    - An empty array, estimated_scene_radiance, is initialized with the same dimensions as
      the hazy image.
    - The function loops through the red (R), green (G), and blue (B) channels.
    - For each channel, it computes the estimated scene radiance by removing the haze
      contribution based on the transmission map and atmospheric light.
    - The result is an enhanced image with improved visibility, and pixel values are clipped
      to the range [0, 255] for valid image representation.
    """
    estimated_scene_radiance = np.zeros_like(hazy_image, dtype=np.float32)
    
    for c in range(3):  # loop through rgb channels
        estimated_scene_radiance[:, :, c] = (hazy_image[:, :, c] - atmospheric_light[c] * (1 - transmission_map)) / np.maximum(transmission_map, 0.01)
    
    enhanced_image = np.clip(estimated_scene_radiance, 0, 255).astype(np.uint8)
    return enhanced_image

def apply_guided_filter(input_image, guided_image, radius=100, epsilon=1.02):
    """
    Apply a guided filter to enhance an input image using a guided image.

    Parameters:
        input_image (numpy.ndarray): The input image to be enhanced.
        guided_image (numpy.ndarray): The guided image used for guidance during filtering.
        radius (int): The radius of the local window for filtering. Default is 70.
        epsilon (float): A regularization parameter to stabilize filtering. Default is 0.02.

    Returns:
        numpy.ndarray: The enhanced image.

    This function applies a guided filter to enhance the input image based on the information
    provided by a guided image. Guided filtering is a technique for image enhancement that
    preserves important structures and details while smoothing other areas.
    
    - A guided filter is created using the guided_image, with a specified radius and epsilon.
    - The guided filter is then applied to the input_image to obtain the enhanced result.
    """
    guided_filter = cv2.ximgproc.createGuidedFilter(guided_image, radius, epsilon)
    output = guided_filter.filter(input_image)
    return output

def apply_clahe(image, clip_limit=0.5, grid_size=(5, 5)):
    """
    Apply Contrast Limited Adaptive Histogram Equalization (CLAHE) to enhance an input image.

    Parameters:
        image (numpy.ndarray): The input image to be enhanced.
        clip_limit (float): The clip limit for contrast enhancement. Default is 0.5.
        grid_size (tuple): The size of the grid for image division. Default is (5, 5).

    Returns:
        numpy.ndarray: The enhanced image.

    This function applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to the input
    image, enhancing both its luminance and color. CLAHE is a contrast enhancement technique
    that improves the visibility of details in images.
    
    - The input image is converted to the LAB color space to separate luminance (L) and color
      information.
    - CLAHE is applied to the luminance channel (L) using the specified clip_limit and grid_size.
    - The processed luminance channel is merged back with the original color channels (A and B).
    - The final enhanced image is converted back to the BGR color space.
    """
    lab_image = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab_image)
    
    # Apply CLAHE to the L channel (luminance)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
    clahe_l_channel = clahe.apply(l_channel)
    
    # Merge the processed L channel back with the original color channels
    processed_lab_image = cv2.merge((clahe_l_channel, a_channel, b_channel))
    
    # Convert back to BGR color space
    enhanced_image = cv2.cvtColor(processed_lab_image, cv2.COLOR_LAB2BGR)
    
    return enhanced_image

def brighten_image(image, brightness_factor=1.5):
    """
    Brighten an input image by scaling pixel values.
    
    Parameters:
        image (numpy.ndarray): The input image to be brightened.
        brightness_factor (float): The factor by which to brighten the image. Default is 1.5.
    
    Returns:
        numpy.ndarray: The brightened image.
    """
    # Ensure the brightness factor is within a valid range
    brightness_factor = max(0, brightness_factor)
    
    # Scale the image pixel values by the brightness factor
    brightened_image = cv2.convertScaleAbs(image, alpha=brightness_factor, beta=0)
    
    return brightened_image

def increase_contrast(image, alpha=2.0, beta=0):
    """
    Increase the overall contrast of an image using linear contrast adjustment.

    Parameters:
        image (numpy.ndarray): The input image to be contrast-adjusted.
        alpha (float): Scaling factor for contrast adjustment. Default is 2.0.
        beta (float): Offset factor for contrast adjustment. Default is 0.

    Returns:
        numpy.ndarray: The contrast-adjusted image.
    """
    contrast_adjusted_image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    return contrast_adjusted_image

#************************** PERFORMANCE METRICS **************************
# Modify the function signatures to accept image arrays instead of file paths
def calculate_ssim(original_image, dehazed_image):
    # No need to load images, use the provided image arrays directly

    # Convert images to grayscale if necessary
    if original_image.shape[-1] == 3:
        original_image = color.rgb2gray(original_image)
    if dehazed_image.shape[-1] == 3:
        dehazed_image = color.rgb2gray(dehazed_image)

    # Ensure both images have the same data type and range
    original_image = img_as_float(original_image)
    dehazed_image = img_as_float(dehazed_image)

    # Calculate SSIM with data_range specified as 1.0 for floating-point images
    ssim_value = ssim(original_image, dehazed_image, data_range=1.0)

    return ssim_value

def calculate_psnr(original_image, dehazed_image):
    # No need to load images, use the provided image arrays directly

    # Ensure both images have the same shape and data type
    if original_image.shape != dehazed_image.shape:
        raise ValueError("Both images should have the same dimensions.")

    # Calculate the Mean Squared Error (MSE)
    mse = np.mean((original_image - dehazed_image) ** 2)

    # Calculate the maximum pixel value (assuming pixel values are in the range [0, 255])
    max_pixel_value = 255.0

    # Calculate the PSNR
    psnr = 20 * np.log10(max_pixel_value / np.sqrt(mse))

    return psnr

def calculate_mse(original_image, dehazed_image):
    # No need to load images, use the provided image arrays directly

    # Ensure both images have the same shape and data type
    if original_image.shape != dehazed_image.shape:
        raise ValueError("Both images should have the same dimensions.")

    # Calculate the Mean Squared Error (MSE)
    mse = np.mean((original_image - dehazed_image) ** 2)

    return mse

def calculate_entropy(image):
    # No need to load images, use the provided image array directly

    # Convert the image to grayscale if necessary
    if image.shape[-1] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Calculate the histogram of the image
    histogram = cv2.calcHist([image], [0], None, [256], [0, 256])

    # Normalize the histogram
    histogram /= histogram.sum()

    # Calculate entropy
    entropy = -np.sum(histogram * np.log2(histogram + np.finfo(float).eps))

    return entropy

@app.route('/api/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify(message='No file part'), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify(message='No selected file'), 400

    try:
        image_np = np.fromfile(image_file, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Apply Gaussian blur to the image before processing
        blurred_image = apply_gaussian_blur(image, kernel_size=(3, 3))

        # Calculate the divisor
        selected_divisor = calculate_divisor(blurred_image)
        # print(f"Selected Divisor: {selected_divisor}")

        # Calculate the automatic window size
        window_size = automatic_window_size(blurred_image, selected_divisor)

        # Calculate the dark channel of the image to detect haze or fog.
        dark_channel = calculate_dark_channel(blurred_image, window_size)

        # Estimate the atmospheric light based on the dark channel and image.
        atmospheric_light = estimate_atmospheric_light(blurred_image, dark_channel)

        # Calculate the transmission map, which represents the haze or fog in the image.
        transmission = estimate_transmission(dark_channel, atmospheric_light)

        # Enhance visibility by removing haze using the transmission map and atmospheric light.
        enhanced = enhance_visibility(blurred_image, transmission, atmospheric_light)

        # Apply guided filter to the enhanced image
        guided_filtered_image = apply_guided_filter(enhanced, blurred_image)

        # Apply CLAHE to enhance both luminance and color
        enhanced_image = apply_clahe(guided_filtered_image, clip_limit=0.7, grid_size=(15, 15))

        # enhanced_bright_image = brighten_image(enhanced_image, brightness_factor=1.2)
        contrast_image = increase_contrast(enhanced_image, alpha=1.15)

        # Calculate SSIM, PSNR, MSE, and entropy using the modified functions
        ssim_value = calculate_ssim(image, enhanced_image)
        psnr_value = calculate_psnr(image, enhanced_image)
        mse_value = calculate_mse(image, enhanced_image)
        entropy_value_original = calculate_entropy(image)
        entropy_value_dehazed = calculate_entropy(enhanced_image)

        # Convert float32 values to native float
        metrics_data = {
            "ssim": float(ssim_value),
            "psnr": float(psnr_value),
            "mse": float(mse_value),
            "entropy_original": float(entropy_value_original),
            "entropy_dehazed": float(entropy_value_dehazed)
        }
        # Convert metrics_data to JSON
        metrics_data_json = json.dumps(metrics_data)

        # Encode the enhanced image as JPEG
        _, encoded_image = cv2.imencode('.jpg', enhanced_image)

        # Convert the image to base64
        image_base64 = base64.b64encode(encoded_image.tobytes()).decode('utf-8')

        # Create a dictionary to store both the image and metrics_data
        response_data = {
            "image": image_base64,  # Store the image as a base64-encoded string
            "metrics_data": metrics_data_json
        }

        # Return response_data as a JSON response
        return jsonify(response_data)

    except Exception as e:
        return jsonify(message='Error processing the image'), 500
    
# Generator model class
class DehazingGenerator(nn.Module):
    def __init__(self):
        super(DehazingGenerator, self).__init__()
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(64, 3, kernel_size=3, stride=1, padding=1)

    def forward(self, x):
        x = self.conv1(x)
        x = nn.ReLU()(x)
        x = self.conv2(x)
        return x
    
def save_image(tensor):
    img = tensor.clone().cpu().detach().numpy()
    img = img.transpose(1, 2, 0)
    img = (img * 255).astype(np.uint8)
    np.clip(img, 0, 255, out=img)
    img = Image.fromarray(img)
    return img

# Function to dehaze an image and return dehazed image and metrics
def dehaze_image_gan(image_path, model_path):
    transform = transforms.Compose([transforms.ToTensor()])
    # Load the trained model
    model = DehazingGenerator()
    model.load_state_dict(torch.load(model_path))
    model.eval()

    # Preprocess the image
    hazy_img = Image.open(image_path)
    enhancer = ImageEnhance.Contrast(hazy_img)
    hazy_img = enhancer.enhance(2.0)
    hazy_img = ImageOps.autocontrast(hazy_img)
    hazy_img = transform(hazy_img)
    hazy_img = hazy_img.unsqueeze(0)  # Add a batch dimension

    # Dehaze the image
    with torch.no_grad():
        dehazed_img = model(hazy_img)
    dehazed_img_final = save_image(dehazed_img.squeeze())

    return dehazed_img_final
def image_to_base64(image):
    # Convert a PIL image to a base64-encoded string
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return image_base64
    
@app.route('/api/process-image-gan', methods=['POST'])
def process_image_gan():
    if 'image2' not in request.files:
        return jsonify(message='No file part'), 400

    image1 = request.files['image1']
    image2 = request.files['image2']

    if image1.filename and image2.filename == '':
        return jsonify(message='No selected file'), 400

    try:
        image_np1 = np.fromfile(image1, np.uint8)
        image1_np1 = cv2. imdecode(image_np1, cv2.IMREAD_COLOR)
        image_np2 = np.fromfile(image2, np.uint8)
        image2_np2 = cv2.imdecode(image_np2, cv2.IMREAD_COLOR)

        # Define the path to your GAN model weights
        model_path = 'dehazing_generator_improved.pth'

        # # Check if the file exists
        # if os.path.exists(model_path):
        #     print(f"The model weights file '{model_path}' exists.")
        # else:
        #     print(f"The model weights file '{model_path}' does not exist. Please provide the correct path.")
        # Dehaze the input image
        dehazed_image = dehaze_image_gan(image2, model_path)

        dehazed_image_arr = np.asarray(dehazed_image)

        # Calculate SSIM, PSNR, MSE, and entropy using the modified functions for ground truth image vs dehazed image.
        ssim_value_gtvd = calculate_ssim(image1_np1 , dehazed_image_arr)
        psnr_value_gtvd = calculate_psnr(image1_np1, dehazed_image_arr)
        mse_value_gtvd = calculate_mse(image1_np1 , dehazed_image_arr)
        entropy_value_original_gtvd = calculate_entropy(image1_np1)
        entropy_value_dehazed_gtvd = calculate_entropy(dehazed_image_arr)

        # Calculate SSIM, PSNR, MSE, and entropy using the modified functions for hazy image vs dehazed image.
        ssim_value_hvd = calculate_ssim(image2_np2 , dehazed_image_arr)
        psnr_value_hvd = calculate_psnr(image2_np2, dehazed_image_arr)
        mse_value_hvd = calculate_mse(image2_np2 , dehazed_image_arr)
        entropy_value_original_hvd = calculate_entropy(image2_np2)
        entropy_value_dehazed_hvd = calculate_entropy(dehazed_image_arr)

        # Convert float32 values to native float
        metrics_data = {
            "ssim_gtvd": float(ssim_value_gtvd),
            "psnr_gtvd": float(psnr_value_gtvd),
            "mse_gtvd": float(mse_value_gtvd),
            "entropy_original_gtvd": float(entropy_value_original_gtvd),
            "entropy_dehazed_gtvd": float(entropy_value_dehazed_gtvd),
            "ssim_hvd": float(ssim_value_hvd),
            "psnr_hvd": float(psnr_value_hvd),
            "mse_hvd": float(mse_value_hvd),
            "entropy_hazy": float(entropy_value_original_hvd),
            "entropy_dehazed": float(entropy_value_dehazed_hvd)
        }

        # Convert metrics_data to JSON
        metrics_data_json = json.dumps(metrics_data)

        # # Encode the dehazed image as JPEG
        # _, encoded_image = cv2.imencode('.jpg', dehazed_image_arr)

        # # Convert the image to base64
        # image_base64 = base64.b64encode(encoded_image.tobytes()).decode('utf-8')
        dehazed_image_base64 = image_to_base64(dehazed_image)


        # Create a dictionary to store both the image and metrics
        response_data = {
            "image": dehazed_image_base64,  # Store the image as a base64-encoded string
            "metrics_data": metrics_data_json
        }

        # Return response_data as a JSON response
        return jsonify(response_data)

    except Exception as e:
        return jsonify(message='Error processing the image'), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
