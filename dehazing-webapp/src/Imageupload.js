import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import './styles.css';

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
        // Simulate a 1-second loading period
        setTimeout(() => {
          setGrayedImage(URL.createObjectURL(result));
          setIsLoading(false); // Turn off loading indicator after the delay
        }, 1000); // 1000 milliseconds = 3 seconds
      } else {
        console.error('Error processing the image.');
        setIsLoading(false); // Turn off loading indicator in case of an error
      }
    } catch (error) {
      console.error('Error processing the image:', error);
      setIsLoading(false); // Turn off loading indicator in case of an error
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
        <div className="image-container fade-in">
          <p>Your Uploaded Image</p>
          <img src={file} alt="Uploaded" className="fade-in responsive-image"/>
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
      {grayedImage && (
        <div className="image-container fade-in">
          <p>Grayscaled Image</p>
          <img src={grayedImage} alt="Grayscale" className="fade-in responsive-image"/>
        </div>
      )}
    </div>
  );
}

export default Imageupload;