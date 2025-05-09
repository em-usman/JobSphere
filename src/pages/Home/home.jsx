import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import ContactForm from '../../Components/Contact/ContactForm';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  }

  // Optional: Automatically update active link on scroll
  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById('contact-form');
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          setActiveLink('contact');
        } else {
          setActiveLink('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="job-portal">
        <header className="header">
          <div className="logo">JobSphere</div>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a
           href="#"
           className={activeLink === 'home' ? 'active-link' : ''}
           onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.history.pushState(null, null, '/home'); // Clean URL to just /home
          setActiveLink('home');
          closeMenu();
       }}
      > 
         Home
       </a>

         <a
         href="#contact-form"
         className={activeLink === 'contact' ? 'active-link' : ''}
         onClick={(e) => {
         e.preventDefault();
        const contactSection = document.getElementById('contact-form');
        if (contactSection) {
         contactSection.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, null, '#contact-form');
        setActiveLink('contact');
        closeMenu();
      }
      }} 
     >
       Contact
      </a>

            <div className="auth-buttons">
              <Link to="/signin" className="login-btn">
                Sign In
              </Link>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </div>
          </div>

          <div
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
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

      <ContactForm />
    </>
  );
}

export default Home;
