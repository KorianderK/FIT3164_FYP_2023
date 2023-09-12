import React from 'react';
import './styles.css';

function ComparisonOverlay({ originalImage, processedImage, onClose }) {
  
  return (

    <div className="comparison-overlay ">
      <div className="comparison-content">
        <div className="close-button" onClick={onClose}>
          &times;
        </div>
        <div className="comparison-images">
          <div className="comparison-image">
            <p>Original Image</p>
            <img
              src={originalImage}
              alt="Original"
              className="resized-image"
            />
          </div>
          <div className="comparison-image">
            <p>DCP + CLAHE Dehazed Image</p>
            <img
              src={processedImage}
              alt="DCP-CLAHE"
              className="resized-image"
            />
          </div>
          <div><h3>Dehazing Performance Metrics</h3>
          <p>Structural Similarity Index:</p>
          <p>Peak Signal-to-Noise Ratio:</p>
          <p>Mean Squared Error:</p>
          <p>Entropy (Original):</p>
          <p>Entropy (Dehazed):</p>
          </div>

        </div>
      </div>
    </div>

  );
}

export default ComparisonOverlay;