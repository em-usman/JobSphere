import React, { useState } from 'react';
import './home.css';

function App() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="job-portal">
      <header className="header">
        <div className="logo">JobPortal</div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="/">Home</a>
          {/* <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a> */}
          <div className="auth-buttons">
            <button className="login-btn">Login</button>
            <button className="signup-btn">Sign Up</button>
          </div>
        </div>

        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <p className="job-offers-text">We have 850,000 great job offers you deserve!</p>
          <h1>
            Your Dream<br />
            <span className="highlight">Job is Waiting</span>
          </h1>
        </div>
      </main>
    </div>
  );
}

export default App;
//   );
// }

// export default home;