import React, { useState } from 'react';
// import { Button } from 'semantic-ui-react';
// import ComparisonOverlay from './Comparisonoverlay';
import './styles.css';

function GAN() {
  const [file, setFile] = useState(null);
  const [dehazedImage, setDehazedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData] = useState(new FormData());
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showComparison, setShowComparison] = useState(false);
  


  // Function to toggle the comparison overlay
  const toggleComparisonOverlay = () => {
    setShowComparison(!showComparison);
  };

  const handleChange = (selectedFile) => {
    if (selectedFile) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setFile(URL.createObjectURL(selectedFile));
        formData.set('image', selectedFile);
      } else {
        window.alert('Invalid file type. Please select an image file.');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    handleChange(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    setFile(null);
    setDehazedImage(null);
    formData.delete('image');
    setImageDimensions({ width: 0, height: 0 });
  };

  const handleProcessImage = async () => {
    if (!file) {
      console.error('No image selected.');
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
        setTimeout(() => {
          setDehazedImage(URL.createObjectURL(result));
          setIsLoading(false);
        }, 200);
      } else {
        console.error('Error processing the image.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing the image:', error);
      setIsLoading(false);
    }
  };

  const calculateAspectRatio = (image) => {
    return image.width / image.height;
  };

  const handleImageLoad = (e) => {
    const image = e.target;
    const aspectRatio = calculateAspectRatio(image);
  
    let targetWidth, targetHeight;
  
    if (aspectRatio >= 1.3 && aspectRatio <= 2.39) {
      targetWidth = 720;
      targetHeight = 480;
    } else if (aspectRatio >= 1.0 && aspectRatio <= 1.3) {
      targetWidth = 480;
      targetHeight = 720;
    } else {
      targetWidth = 720;
      targetHeight = 480;
    }
  
    setImageDimensions({ width: targetWidth, height: targetHeight });
  };

  return (
    <div className="App">
      <div className="drop-area" onDrop={handleDrop} onDragOver={handleDragOver} >
        <i className="upload icon"></i> {/* Semantic UI upload icon */}
        <h1>Single Image GAN Image Dehazer</h1>
        <p>Drag & Drop an Image or</p>
        <label htmlFor="fileInput" className='select-image-text'>
          Select Image
        </label>
        <input
          id="fileInput"
          type="file"
          name="image"
          accept=".jpg, .jpeg, .png"
          onChange={(e) => handleChange(e.target.files[0])}
          hidden
        />
      </div>
    </div>
  );
}

export default GAN;
