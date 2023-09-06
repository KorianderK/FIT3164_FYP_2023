import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import './styles.css';

function Imageupload() {
  const [file, setFile] = useState(null);
  const [dehazedImage, setDehazedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData] = useState(new FormData()); // Initialize formData
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setFile(URL.createObjectURL(selectedFile));
        formData.set('image', selectedFile); // Update formData with the selected file
      } else {
        window.alert('Invalid file type. Please select an image file.');
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setDehazedImage(null);
    formData.delete('image'); // Remove the image from formData when removing it from the UI
    setImageDimensions({ width: 0, height: 0 }); // Reset image dimensions
  };

  const handleProcessImage = async () => {
    if (!file) {
      console.error('No image selected.'); // Log an error message
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        const result = await response.blob();
        // Simulate a 1-second loading period
        setTimeout(() => {
          setDehazedImage(URL.createObjectURL(result));
          setIsLoading(false); // Turn off loading indicator after the delay
        }, 200); // 1000 milliseconds = 3 seconds
      } else {
        console.error('Error processing the image.');
        setIsLoading(false); // Turn off loading indicator in case of an error
      }
    } catch (error) {
      console.error('Error processing the image:', error);
      setIsLoading(false); // Turn off loading indicator in case of an error
    }
  };

  // Function to calculate the aspect ratio
  const calculateAspectRatio = (image) => {
    return image.width / image.height;
  };

  const handleImageLoad = (e) => {
    const image = e.target;
    const aspectRatio = calculateAspectRatio(image);
  
    // Now you have the aspectRatio value, which is width/height.
    console.log('Aspect Ratio:', aspectRatio);
  
    // Define the target dimensions based on the aspect ratio
    let targetWidth, targetHeight;
  
    if (aspectRatio >= 1.3 && aspectRatio <= 2.39) {
      // Landscape aspect ratio range (1.3 to 2.39)
      targetWidth = 720;
      targetHeight = 480;
    } else if (aspectRatio >= 1.0 && aspectRatio <= 1.3) {
      // Portrait aspect ratio range (1.0 to 1.3)
      targetWidth = 480;
      targetHeight = 720;
    } else {
      // If the aspect ratio doesn't fall into the specified ranges, use defaults
      targetWidth = 720; // Default landscape width
      targetHeight = 480; // Default landscape height
    }
  
    setImageDimensions({ width: targetWidth, height: targetHeight });
  };

  return (
    <div className="App">
      {!file ? (
        <div>
          <label htmlFor="fileInput" className="upload-button-label">
            <i className="search icon" />
            Select Image
          </label>
          <input id="fileInput" type="file" name="image" accept=".jpg, .jpeg, .png" onChange={handleChange} hidden />
        </div>
      ) : (
        <div className="image-container fade-in">
          <p>Your Uploaded Image</p>
          <img
            src={file}
            alt="Uploaded"
            className="fade-in resized-image"
            onLoad={handleImageLoad}
            style={{
              maxWidth: `${imageDimensions.width}px`,
              maxHeight: `${imageDimensions.height}px`,
            }}
          />
          <div></div>
          <Button className="remove-button fade-in" color="red" onClick={handleRemove}>
            Remove Image
          </Button>
          <Button className="process-button fade-in" onClick={handleProcessImage} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Process Image'}
          </Button>
        </div>
      )}

      {/* Display grayscale image if available */}
      {dehazedImage && (
        <div className="image-container fade-in">
          <p>DCP + CLAHE Dehazed Image</p>
          <img src={dehazedImage} alt="DCP_Processed" className="fade-in resized-image" 
          style={{
              maxWidth: `${imageDimensions.width}px`,
              maxHeight: `${imageDimensions.height}px`,
            }} />
        </div>
      )}
    </div>
  );
}

export default Imageupload;
