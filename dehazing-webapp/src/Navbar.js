import React from 'react';
import { Link } from 'react-router-dom';

function Navbar(props) {
  const navbarStyle = {
    background:
      'linear-gradient(-45deg, #ffcc70, #96e6a1, #74caff, #bc99c4)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimate 10s ease infinite',
  };

  const textStyles = {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '25px',
    margin: '0',
    marginLeft: '8px',
    paddingTop: '10px',
    paddingBottom: '10px',
  };

  // Function to handle menu button click and toggle the sidebar
  const handleMenuButtonClick = () => {
    props.onToggleMenu(); // Call the function to toggle the sidebar
  };

  // Function to handle link click and close sidebar
  const handleLinkClick = () => {
    props.closeSidebar(); // Call the closeSidebar function passed as a prop
    props.setLoading(true);
  };


  return (
    <div className="ui top inverted attached menu" style={navbarStyle}>
      <span className="item link grey" onClick={handleMenuButtonClick}>
        <i className="bars icon"></i>
      </span>
      {/* Use the Link component to navigate to the landing page */}
      <Link
        to="/landing"
        style={{ textDecoration: 'none' }}
        onClick={handleLinkClick}
      >
        <p style={textStyles}>Image Dehazer Webapp V1.4</p>
      </Link>
    </div>
  );
}

export default Navbar;
