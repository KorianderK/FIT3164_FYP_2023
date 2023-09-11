import React, { useState, useEffect } from 'react';
import About from './About';
import Landingpage from './Landing';
import Userguide from './Userguide';
import Contact from './Contact';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Team from './Team';
import DCP from './dcp';
import GAN from './gan';
import Loading from './Loading';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function toggleMenu() {
    setToggle(!toggle);
  }

  function setLoading(loading) {
    setIsLoading(loading);
  }

  function closeSidebar() {
    setToggle(false);
  }

  useEffect(() => {
    // Simulate a 0.8-second delay before hiding the loading screen
    if (isLoading) {
      const delayTimer = setTimeout(() => {
        setIsLoading(false);
      }, 400); // 400 milliseconds (0.4 seconds)

      // Clean up the timer in case the component unmounts
      return () => clearTimeout(delayTimer);
    }
  }, [isLoading]);

  return (
    <Router>
      <div>
        <Navbar onToggleMenu={toggleMenu} closeSidebar={closeSidebar} setLoading={setLoading} />
        <div className='ui attached pushable' style={{ height: '100vh' }}>
          <Sidebar toggleMenu={toggle} toggleSidebar={toggleMenu} setLoading={setLoading} />
          <div className={`pusher ${toggle ? 'dimmed' : ''}`}>
            {isLoading ? (
              <Loading />
            ) : (
              <Routes>
                <Route path='/home' element={<Landingpage />} />
                <Route path='/landing' element={<Landingpage />} />
                <Route path='/team' element={<Team />} />
                <Route path='/userguide' element={<Userguide />} />               
                <Route path='/contact' element={<Contact />} />
                <Route path='/about' element={<About />} />
                <Route path='/image-dehaze-dcp' element={<DCP />} />
                <Route path='/image-dehaze-gan' element={<GAN />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
