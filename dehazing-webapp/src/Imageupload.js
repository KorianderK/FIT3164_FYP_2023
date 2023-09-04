import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import axios from 'axios';
import './styles.css';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [grayImage, setGrayImage] = useState(null);

  async function uploadImage(selectedFile) {
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Send a POST request to your Flask API endpoint
      const response = await axios.post(
        'http://127.0.0.1:5000/api/convert_to_grayscale',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'arraybuffer',
        }
      );

      // Create a Blob from the ArrayBuffer
      const blob = new Blob([response.data], { type: 'image/jpeg' });

      // Create a data URL from the Blob
      const imageUrl = URL.createObjectURL(blob);

      console.log('Blob URL:', imageUrl);

      // Set the grayscale image URL in your component state
      setGrayImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  function handleChange(e) {
    const selectedFile = e.target.files[0];

    console.log(selectedFile);

    if (selectedFile) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setFile(URL.createObjectURL(selectedFile));
      } else {
        window.alert('Invalid file type. Please select an image file.');
      }
    }
  }

  function handleRemove() {
    setFile(null);
    setGrayImage(null);
  }

  function handleGreyscale() {
    if (file) {
      // Call the function to upload the selected image
      uploadImage(file);
    }
  }

  return (
    
    <div className="App">
      {!file ? (
        <div>
          <label htmlFor="fileInput" className="upload-button-label">
            <i className="search icon" />
            Select Image
          </label>
          <input id="fileInput" type="file" accept=".jpg, .jpeg, .png" onChange={handleChange} hidden />
        </div>
      ) : (
        <div className="image-container">
          <p>Your Uploaded Image</p>
          <img src={file} alt="Uploaded" />
          <div>
            <Button className="remove-button" color="red" onClick={handleRemove}>
              Remove Image
            </Button>
            <Button className="grayscale-button" onClick={handleGreyscale}>
              Greyscale Image
            </Button>
          </div>
          <div>
          </div>
        </div>
      )}

    {grayImage && (
    <div className="image-container">
        <p>Grayscale Image</p>
        <img src={grayImage} alt="Grayscale" />
    </div>
    )}
    </div>
  );
}

export default ImageUpload;
