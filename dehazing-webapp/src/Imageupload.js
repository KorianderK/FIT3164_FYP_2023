import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import './styles.css';
// import axios from 'axios';

function Imageupload() {
  const [file, setFile] = useState(null);
  const [grayedImage, setGrayedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData] = useState(new FormData()); // Initialize formData

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
    setGrayedImage(null);
    formData.delete('image'); // Remove the image from formData when removing it from the UI
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
        setGrayedImage(URL.createObjectURL(result));
      } else {
        console.error('Error processing the image.');
      }
    } catch (error) {
      console.error('Error processing the image:', error);
    } finally {
      setIsLoading(false);
    }
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
        <div className="image-container">
          <p>Your Uploaded Image</p>
          <img src={file} alt="Uploaded" />
          <div></div>
          <Button className="remove-button" color="red" onClick={handleRemove}>
            Remove Image
          </Button>
          <Button className="process-button" onClick={handleProcessImage} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Process Image'}
          </Button>
        </div>
      )}

      {/* Display grayscale image if available */}
      {grayedImage && (
        <div className="image-container">
          <p>Grayscale Image</p>
          <img src={grayedImage} alt="Grayscale" />
        </div>
      )}
    </div>
  );
}

export default Imageupload;
