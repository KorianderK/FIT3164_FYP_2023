import React, {useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Imageupload from './Imageupload';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';

function App() {
    const [toggle, setToggle] = useState(false);

    function toggleMenu () {
        setToggle(!toggle);
    }

    return (
        <div>
            <Navbar onToggleMenu={toggleMenu} />
            <div className='ui attached pushable' style={{height: '100vh'}}>
                <Sidebar toggleMenu={toggle} />
                <div className='pusher'>
                    <Imageupload/>
                </div>
            </div>
        </div>
    );
}

export default App;