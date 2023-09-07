import React from 'react';
import './styles.css';

function ComparisonOverlay({ originalImage, processedImage, onClose, imageDimensions }) {
  return (
    <div className="comparison-overlay">
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
              style={{
                maxWidth: `${imageDimensions.width}px`,
                maxHeight: `${imageDimensions.height}px`,
              }}
            />
          </div>
          <div className="comparison-image">
            <p>DCP + CLAHE Dehazed Image</p>
            <img
              src={processedImage}
              alt="DCP-CLAHE"
              className="resized-image"
              style={{
                maxWidth: `${imageDimensions.width}px`,
                maxHeight: `${imageDimensions.height}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparisonOverlay;