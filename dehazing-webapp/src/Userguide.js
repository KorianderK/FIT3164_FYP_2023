import React from 'react';
import './userguide.css';

function Userguide() {
  return (
    <div className="user-guide-container fade-in">
      <header className="user-image">
        <h1 className="user-app-title">User Guide</h1>
        <p className="user-guide-description">Learn how to enhance your images by following our step-by-step instructions.</p>
        
      </header>
      <section className="user-features">
        <div className="user-feature">
          <h2>Step 1</h2>
          <p>Navigate to either the DCP or GAN dehazers from the side menu, located at the top left corner of the web app.</p> 
        </div>
        <div className="user-feature">
          <h2>Step 2</h2>
          <p>Drag and drop or Select images, then click Process Image. Click on Compare Images to view the results.</p>
        </div>
        <div className="user-feature">
          <h2>Step 3</h2>
          <p>The Dehazed Image, along with the Original/ Ground Truth Images will be displayed, along with some metrics. </p>
        </div>
        <div className="user-feature">
          <h2>Step 4</h2>
          <p>Click on the "Show Performance Metrics" Button (if applicable) to display various performance metrics. </p>
        </div>
      </section>
      <footer className="user-footer">
      <p>&copy; 2023 MDS-13. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Userguide;