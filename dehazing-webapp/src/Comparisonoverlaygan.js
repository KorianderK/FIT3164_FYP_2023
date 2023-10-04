import React, { useState } from 'react';
import './styles.css';

function ComparisonOverlayGAN({ gtImage, hazyImage, processedImage, onClose, metricsData }) {
  function roundToSignificantDigits(value, significantDigits) {
    if (value === 0) return 0;
    const multiplier = Math.pow(10, significantDigits - Math.floor(Math.log10(Math.abs(value))) - 1);
    return Math.round(value * multiplier) / multiplier;
  }

  const metrics = JSON.parse(metricsData);

  const roundedMetrics = {
    ssim_gtvd: roundToSignificantDigits(metrics.ssim_gtvd, 4),
    psnr_gtvd: roundToSignificantDigits(metrics.psnr_gtvd, 4),
    mse_gtvd: roundToSignificantDigits(metrics.mse_gtvd, 4),
    entropy_original_gtvd: roundToSignificantDigits(metrics.entropy_original_gtvd, 4),
    entropy_dehazed_gtvd: roundToSignificantDigits(metrics.entropy_dehazed_gtvd, 4),
    ssim_hvd: roundToSignificantDigits(metrics.ssim_hvd, 4),
    psnr_hvd: roundToSignificantDigits(metrics.psnr_hvd, 4),
    mse_hvd: roundToSignificantDigits(metrics.mse_hvd, 4),
    entropy_hazy: roundToSignificantDigits(metrics.entropy_hazy, 4),
    entropy_dehazed: roundToSignificantDigits(metrics.entropy_dehazed, 4),
  };

  // State to control the visibility of performance metrics sections
  const [showMetrics, setShowMetrics] = useState(false);

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
        <button onClick={() => setShowMetrics(!showMetrics)}>
          {showMetrics ? 'Hide Performance Metrics' : 'Show Performance Metrics'}
        </button>
        
        {showMetrics && (
          <>
            <div>
              <h3>Dehazing Performance Metrics (GT vs Dehazed)</h3>
              <p>Structural Similarity Index: {roundedMetrics.ssim_gtvd}</p>
              <p>Peak Signal-to-Noise Ratio: {roundedMetrics.psnr_gtvd}</p>
              <p>Mean Squared Error: {roundedMetrics.mse_gtvd}</p>
              <p>Entropy (GT): {roundedMetrics.entropy_original_gtvd}</p>
              <p>Entropy (Dehazed): {roundedMetrics.entropy_dehazed_gtvd}</p>
            </div>
            <div>
              <h3>Dehazing Performance Metrics (Hazy vs Dehazed)</h3>
              <p>Structural Similarity Index: {roundedMetrics.ssim_hvd}</p>
              <p>Peak Signal-to-Noise Ratio: {roundedMetrics.psnr_hvd}</p>
              <p>Mean Squared Error: {roundedMetrics.mse_hvd}</p>
              <p>Entropy (Hazy): {roundedMetrics.entropy_hazy}</p>
              <p>Entropy (Dehazed): {roundedMetrics.entropy_dehazed}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ComparisonOverlayGAN;
