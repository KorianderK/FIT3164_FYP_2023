import React from 'react';
import './styles.css';

function ComparisonOverlayGAN({ gtImage, hazyImage, processedImage, onClose, metricsData }) {
  function roundToSignificantDigits(value, significantDigits) {
    if (value === 0) return 0;
    const multiplier = Math.pow(10, significantDigits - Math.floor(Math.log10(Math.abs(value))) - 1);
    return Math.round(value * multiplier) / multiplier;
  }

  const metrics = JSON.parse(metricsData);

  const roundedMetrics = {
    ssim: roundToSignificantDigits(metrics.ssim, 4),
    psnr: roundToSignificantDigits(metrics.psnr, 4),
    mse: roundToSignificantDigits(metrics.mse, 4),
    entropy_original: roundToSignificantDigits(metrics.entropy_original, 4),
    entropy_dehazed: roundToSignificantDigits(metrics.entropy_dehazed, 4),
  };

  return (
    <div className="comparison-overlay">
      <div className="comparison-content">
        <div className="close-button" onClick={onClose}>
          &times;
        </div>
        <div className="comparison-images">
          <div className="comparison-image">
            <p>Ground Truth Image</p>
            <img src={gtImage} alt="Original" className="resized-image" />
          </div>
          <div className="comparison-image">
            <p>Hazy Image</p>
            <img src={hazyImage} alt="DCP-CLAHE" className="resized-image" />
          </div>
          <div className="comparison-image">
            <p>Dehazed Image</p>
            <img src={processedImage} alt="Second Original" className="resized-image" />
          </div>
        </div>
        <div>
          <h3>Dehazing Performance Metrics</h3>
          <p>Structural Similarity Index: {roundedMetrics.ssim}</p>
          <p>Peak Signal-to-Noise Ratio: {roundedMetrics.psnr}</p>
          <p>Mean Squared Error: {roundedMetrics.mse}</p>
          <p>Entropy (Original): {roundedMetrics.entropy_original}</p>
          <p>Entropy (Dehazed): {roundedMetrics.entropy_dehazed}</p>
        </div>
      </div>
    </div>
  );
}

export default ComparisonOverlayGAN;
