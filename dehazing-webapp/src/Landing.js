import React, { useState, useEffect } from 'react';
import './home.css';
import Loading from './Loading';

// Define an array of image URLs
const images = [
  'url(https://metro.co.uk/wp-content/uploads/2018/06/gettyimages-682966492.jpg?quality=90&strip=all)',
  'url(https://wallpapercave.com/wp/wp4941878.jpg)',
  'url(https://wallpapercave.com/wp/wp4941977.jpg)',
  'url(https://wallpapercave.com/wp/wp4942008.jpg)',
  'url(https://wallpapercave.com/wp/wp4942012.jpg)',
  'url(https://wallpapercave.com/wp/wp4941976.jpg)',
  'url(https://wallpapercave.com/wp/wp3291081.jpg)',
  'url(https://wallpapercave.com/wp/wp4941929.jpg)'
];

function Landingpage() {
  const [showLoading, setShowLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Move the changeBackgroundImage function inside the useEffect callback
    const changeBackgroundImage = () => {
      const newIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(newIndex);
    };

    const imageChangeInterval = setInterval(changeBackgroundImage, 7000);

    return () => {
      clearInterval(imageChangeInterval);
    };
  }, [currentImageIndex]);

  const handleGetStartedClick = () => {
    setShowLoading(true);

    // Simulate a loading process (replace this with your actual logic)
    setTimeout(() => {
      setShowLoading(false);
    }, 150); // Simulated 0.15-second loading time
  };

  return (
    <div className="home-container fade-in">
      <header className="hero" style={{ backgroundImage: images[currentImageIndex] }}>
        <h1 className="app-title">ClearView: Effective Dehazing Solutions</h1>
        <p className="app-description">Enhance your photos by removing haze and improving clarity, performance metrics included!</p>
        <a href="/userguide" onClick={handleGetStartedClick} className="cta-button">User Guide</a>
      </header>
      <section className="features">
        <div className="feature">
          <h2>Easy to Use</h2>
          <p>User-friendly interface makes dehazing images a breeze.</p>
        </div>
        <div className="feature">
          <h2>High-Quality Results</h2>
          <p>State-of-the-art algorithms implemented for effective dehazing performance.</p>
        </div>
        <div className="feature">
          <h2>Fast Processing</h2>
          <p>Minimal time needed for efficient dehazing.</p>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2023 ClearView MDS-13. All rights reserved.</p>
      </footer>

      {showLoading && <Loading />}
    </div>
  );
}

export default Landingpage;
