import React from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import './styles.css';
import 'semantic-ui-css/semantic.min.css';

function Sidebar(props) {

  const classes = cn(
    'ui sidebar',
    'vertical',
    'left',
    'menu',
    'animating',
    { 'visible': props.toggleMenu },
    { 'hidden': !props.toggleMenu }
  );

  const menuItemStyle = {
    fontSize: '18px',
  };

  // Function to close the sidebar when a link is clicked
  function closeSidebar() {
    props.setLoading(true);
    props.toggleSidebar();
  }

  return (
    <div className={classes}>
      <ul>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/home' onClick={closeSidebar}><i className='home icon'></i>Home</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/image-dehaze-dcp' onClick={closeSidebar}><i className='file image outline icon'></i>DCP Dehazer</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/image-dehaze-gan' onClick={closeSidebar}><i className='microchip icon'></i>GAN Dehazer</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/userguide' onClick={closeSidebar}><i className='book icon'></i>User Guide</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/team' onClick={closeSidebar}><i className='users icon'></i> Meet the Team</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/about' onClick={closeSidebar}><i className='question icon'></i> About this Project</Link></li>
        <li className="item link" style={menuItemStyle}><Link className= 'custom-link-styles' to='/contact' onClick={closeSidebar}><i className='twitter icon'></i> Contact Us</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
