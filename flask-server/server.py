# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import base64
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "*"}})

# def convert_to_grayscale(image):
#     gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     return gray_image

# @app.route('/api/convert_to_grayscale', methods=['POST'])

# def process_image():
#     try:
#         # Get the uploaded image file from the request
#         file = request.files['image']

#         if file:
#             # Read the image using OpenCV
#             image_data = np.fromstring(file.read(), np.uint8)
#             image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)

#             # Add debugging output to check image dimensions
#             print('Image Dimensions:', image.shape)

#             # Convert the image to grayscale
#             gray_image = convert_to_grayscale(image)

#             # Encode the grayscale image to base64
#             _, buffer = cv2.imencode('.jpg', gray_image)
#             base64_image = base64.b64encode(buffer).decode()

#             return jsonify({'gray_image': base64_image})
#         else:
#             return jsonify({'error': 'No image file received'})

#     except Exception as e:
#         return jsonify({'error': f'Bad Request: {str(e)}'}, 400)

# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify, send_file
import cv2
import numpy as np
import io
from flask_cors import CORS  # Import the CORS module

app = Flask(__name__)
CORS(app)
# Function to convert an image to grayscale using OpenCV
def convert_to_grayscale(image_bytes):
    try:
        # Read the image from bytes
        image_np = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        
        # Convert the image to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Encode the grayscale image to bytes
        _, gray_image_bytes = cv2.imencode('.jpg', gray_image)
        
        return gray_image_bytes.tobytes()
    except Exception as e:
        print("Error converting to grayscale:", str(e))
        return None

@app.route('/api/convert_to_grayscale', methods=['POST'])
def upload_file():
    try:
        # Check if the 'image' field is present in the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'})

        file = request.files['image']

        # Check if the file has an allowed extension
        allowed_extensions = {'jpg', 'jpeg', 'png'}
        if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
            # Convert the uploaded image to grayscale
            grayscale_image_bytes = convert_to_grayscale(file.read())

            if grayscale_image_bytes is not None:
                # Return the grayscale image as a response
                return send_file(
                    io.BytesIO(grayscale_image_bytes),
                    mimetype='image/jpeg',
                    as_attachment=True,
                    attachment_filename='grayscale_image.jpg'
                )
            else:
                return jsonify({'error': 'Failed to convert image to grayscale'})

        return jsonify({'error': 'Invalid file type. Please select an image file.'})

    except Exception as e:
        print("Error processing image:", str(e))
        return jsonify({'error': 'An error occurred while processing the image'})

if __name__ == '__main__':
    app.run(debug=True)
