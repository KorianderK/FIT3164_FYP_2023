import React, { useState, useEffect } from 'react';
import './styles.css';

function Loading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === '...') {
          return '';
        } else {
          return prevDots + '.';
        }
      });
    }, 150); // Adjust the interval duration as needed (150ms for 0.15 second intervals)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="loading-dimmer"> {/* Add a container for the dimmer */}
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading{dots}</div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
