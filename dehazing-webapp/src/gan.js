import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import ComparisonOverlayGAN from './Comparisonoverlaygan';
import './styles.css';

function GAN() {
  const [file1, setFile1] = useState(null); // First image
  const [file2, setFile2] = useState(null); // Second image
  const [dehazedImage, setDehazedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData] = useState(new FormData());
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showComparison, setShowComparison] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [metricsData, setMetricsData] = useState(null);

  // Function to toggle the comparison overlay
  const toggleComparisonOverlay = () => {
    setShowComparison(!showComparison);
    setIsBlurred(!showComparison); // Toggle the blur background effect
  };

  const handleChange = (selectedFile, isFile1) => {
    if (selectedFile) {
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        if (isFile1) {
          setFile1(URL.createObjectURL(selectedFile));
          formData.set('image1', selectedFile);
        } else {
          setFile2(URL.createObjectURL(selectedFile));
          formData.set('image2', selectedFile);
        }
      } else {
        window.alert('Invalid file type. Please select an image file.');
      }
    }
  };

  const handleDrop = (e, isFile1) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    handleChange(selectedFile, isFile1);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    setFile1(null);
    setFile2(null);
    setDehazedImage(null);
    formData.delete('image1');
    formData.delete('image2');
    setImageDimensions({ width: 0, height: 0 });
  };

  const handleProcessImage = async () => {
    if (!file1 || !file2) {
      console.error('Both images are required.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/process-image-gan', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        const result = await response.json(); // Parse the JSON response

        // Decode the base64 image data
        const decodedImageData = atob(result.image);

        // Create a blob from the decoded image data
        const blob = new Blob([new Uint8Array([...decodedImageData].map((char) => char.charCodeAt(0)))], {
          type: 'image/jpeg',
        });

        // Create a URL from the blob
        setDehazedImage(URL.createObjectURL(blob));

        setMetricsData(result.metrics_data); // Set metrics data in state
        setIsLoading(false);
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
    <div>
      <div className={`App ${isBlurred ? 'blur-background' : ''}`}>
        <div className="image-container fade-in">
          <div className="horizontal-drop-container">
            {/* First Drop Area */}

              {!file1 && (
                <div
                  className={`drop-area ${file1 ? 'file-uploaded' : ''}`}
                  onDrop={(e) => handleDrop(e, true)}
                  onDragOver={handleDragOver}
                >
                <>
                  <i className="upload icon"></i>
                  <h1>GAN Clear</h1>
                  <p>Drag & Drop your image here or</p>
                  <label htmlFor="fileInput1" className="select-image-text">
                    Select Ground Truth Image
                  </label>
                  <input
                    id="fileInput1"
                    type="file"
                    name="image1"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => handleChange(e.target.files[0], true)}
                    hidden
                  />
                </>
            </div>
              )}
              {file1 && (
                <img
                  src={file1}
                  alt="Uploaded"
                  className="fade-in resized-image"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: `${imageDimensions.width}px`,
                    maxHeight: `${imageDimensions.height}px`,
                  }}
                />
              )}


            {/* Second Drop Area */}
              {!file2 && (
                <div
                className={`drop-area ${file1 ? 'file-uploaded' : ''}`}
                onDrop={(e) => handleDrop(e, true)}
                onDragOver={handleDragOver}
              >
                <>
                  <i className="upload icon"></i>
                  <h1>GAN Hazy</h1>
                  <p>Drag & Drop your image here or</p>
                  <label htmlFor="fileInput2" className="select-image-text">
                    Select Hazy Image
                  </label>
                  <input
                    id="fileInput2"
                    type="file"
                    name="image2"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => handleChange(e.target.files[0], false)}
                    hidden
                  />
                </>
                </div>
              )}
              {file2 && (
                <img
                  src={file2}
                  alt="Uploaded"
                  className="fade-in resized-image"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: `${imageDimensions.width}px`,
                    maxHeight: `${imageDimensions.height}px`,
                  }}
                />
              )}
          </div>
        </div>
      <div className="button-container">

      {(file1 || file2) && (
          <Button className="remove-button fade-in" color="red" onClick={handleRemove}>
            Remove Images
          </Button>
        )}
        {file1 && file2 && (
          <>
            {dehazedImage ? (
              <Button className="compare-button fade-in" onClick={toggleComparisonOverlay}>
                Compare Images
              </Button>
            ) : (
              <Button className="process-button fade-in" onClick={handleProcessImage} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Process Image'}
              </Button>
            )}
          </>
        )}


      </div>
    </div>

      {showComparison && (
        <ComparisonOverlayGAN
          gtImage={file1}
          hazyImage={file2}
          processedImage={dehazedImage}
          onClose={toggleComparisonOverlay}
          imageDimensions={imageDimensions}
          metricsData={metricsData}
        />
      )}
      <footer className="gan-footer fade-in">
      <p>&copy; 2023 ClearView MDS-13. All rights reserved.</p>
      </footer>
    </div>

  );
}

export default GAN;
