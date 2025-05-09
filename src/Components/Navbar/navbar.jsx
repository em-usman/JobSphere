import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import './navbar.css';

function Navbar({ onSearch }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const isLoggingOut = useRef(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const getUserInitial = () => {
    if (!currentUser) return '?';
    return currentUser.displayName
      ? currentUser.displayName.charAt(0).toUpperCase()
      : currentUser.email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user && !isLoggingOut.current) {
        navigate('/signin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      
      if (
        showMobileSearch &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest('.mobile-search-toggle')
      ) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileSearch]);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      isLoggingOut.current = true;
      navigate('/home');
      await signOut(auth);
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    } catch (error) {
      console.error('Error logging out:', error);
      isLoggingOut.current = false;
    }
  };

  return (
    <>
      <nav className="navbar dashboard-navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            JobSphere
          </Link>

          <div className="desktop-search">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>

          <div className="navbar-right-section">
            <button 
              className="mobile-search-toggle"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
            
            <div className="profile-section">
              <div
                className="profile-circle"
                onClick={toggleProfileMenu}
                ref={profileButtonRef}
                title="Profile"
              >
                {getUserInitial()}
              </div>

              {isProfileMenuOpen && (
                <div className="profile-dropdown" ref={profileMenuRef}>
                  <div className="profile-header">
                    <div className="profile-avatar">{getUserInitial()}</div>
                    <div className="profile-info">
                      <span className="profile-name">{currentUser?.displayName || 'User'}</span>
                      <span className="profile-email">{currentUser?.email}</span>
                    </div>
                  </div>
                  <ul className="profile-menu">
                    <li>
                      <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/myposts" onClick={() => setIsProfileMenuOpen(false)}>
                        My Posts
                      </Link>
                    </li>
                    <li>
                      <Link to="/postjob" onClick={() => setIsProfileMenuOpen(false)}>
                        Post a Job
                      </Link>
                    </li>
                    <li><div className="menu-divider"></div></li>
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="logout-button"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showMobileSearch && (
        <div className="mobile-search-popup">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              ref={searchInputRef}
              autoFocus
            />
            <button 
              className="close-search"
              onClick={() => setShowMobileSearch(false)}
              aria-label="Close search"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;