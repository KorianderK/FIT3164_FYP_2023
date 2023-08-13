import React from 'react';

function Navbar(props)  {

    const navbarStyle = {
        background: 'linear-gradient(-45deg, #ffcc70, #96e6a1, #74caff, #bc99c4)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimate 10s ease infinite'
    };

      const textStyles = {
        color: 'white', // Set text color to white
        fontWeight: 'bold', // Set text to bold
        fontSize: '25px',
        margin: '0', // Remove default margin for <p> element
        marginLeft: '8px', // Add margin to the left of the text
        paddingTop: '10px', // Add padding to the top
        paddingBottom: '10px' // Add padding to the bottom
    };

    return (
        <div className='ui top inverted attached menu' style={navbarStyle}>
            <span className='item link grey' onClick={props.onToggleMenu}>
            <i className='bars icon'></i>
            </span>
            <p style={textStyles}>Image Dehazer Webapp V1.3</p>
        </div>
    );
}

export default Navbar;