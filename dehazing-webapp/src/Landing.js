import React, { useState } from 'react';
import './home.css';
import Loading from './Loading';

function Landingpage() {
  const [showLoading, setShowLoading] = useState(false);

  const handleGetStartedClick = () => {
    setShowLoading(true);

    // Simulate a loading process (replace this with your actual logic)
    setTimeout(() => {
      setShowLoading(false);
    }, 150); // Simulated 0.15-second loading time
  };

  return (
    <div className="home-container fade-in">
      <header className="hero">
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
        <p>&copy; 2023 MDS-13. All rights reserved.</p>
      </footer>

      {showLoading && <Loading />}
    </div>
  );
}

export default Landingpage;
