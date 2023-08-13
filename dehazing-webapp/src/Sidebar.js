import React, { useEffect } from 'react';
import cn from 'classnames';

function Sidebar(props) {

    const classes = cn(
        'ui', 'sidebar', 'overlay', 'left', 'menu', 'animating', 
        {'visible': props.toggleMenu}
        );

    const menuItemStyle = {
        fontSize: '18px', // You can adjust the font size as needed
        };



    return(
            
        <div className={classes}>
            <ul>
                <li className="item link" style={menuItemStyle}><i className='book icon'></i>User Guide</li>
                <li className="item link" style={menuItemStyle}><i className='users icon'></i> Meet the Team</li>
                <li className="item link" style={menuItemStyle}><i className='question icon'></i> About this Project</li>
                <li className="item link" style={menuItemStyle}><i className='twitter icon'></i> Contact and Socials</li>
            </ul>
        </div>

    );
}

export default Sidebar;