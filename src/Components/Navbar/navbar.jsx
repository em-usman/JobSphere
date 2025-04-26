import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import './navbar.css';

function Navbar() {
  // State for menu and user management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // References for DOM elements and tracking logout state
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const isLoggingOut = useRef(false); // Track logout process to prevent redirect flashes
  const navigate = useNavigate();

  // Extract the user's initial for the profile circle
  const getUserInitial = () => {
    if (!currentUser) return '?';
    return currentUser.displayName
      ? currentUser.displayName.charAt(0).toUpperCase()
      : currentUser.email.charAt(0).toUpperCase();
  };

  // Monitor auth state and handle redirects
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      // Only redirect to signin if not actively logging out
      if (!user && !isLoggingOut.current) {
        navigate('/signin');
      }
    });
    return () => unsubscribe(); // Clean up listener on component unmount
  }, [navigate]);

  // Handle clicks outside the profile menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle profile dropdown menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  // Improved logout handler to prevent navigation flashes
  const handleLogout = async () => {
    try {
      // Set flag to prevent redirect to signin page
      isLoggingOut.current = true;
      
      // Navigate to home page first
      navigate('/home');
      
      // Then sign out of Firebase
      await signOut(auth);
      
      // Reset the flag after a delay to allow for future auth state changes
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    } catch (error) {
      console.error('Error logging out:', error);
      isLoggingOut.current = false; // Reset flag on error
    }
  };

  return (
    <nav className="navbar dashboard-navbar">
      <div className="navbar-container">
        {/* App logo/name with link to dashboard */}
        <Link to="/dashboard" className="navbar-logo">
          JobSphere
        </Link>

        {/* Profile section with dropdown menu */}
        <div className="profile-section">
          {/* Profile circle that shows user initial */}
          <div
            className="profile-circle"
            onClick={toggleProfileMenu}
            ref={profileButtonRef}
            title="Profile"
          >
            {getUserInitial()}
          </div>

          {/* Profile dropdown menu - only shown when isProfileMenuOpen is true */}
          {isProfileMenuOpen && (
            <div className="profile-dropdown" ref={profileMenuRef}>
              {/* User info header section */}
              <div className="profile-header">
                <div className="profile-avatar">{getUserInitial()}</div>
                <div className="profile-info">
                  <span className="profile-name">{currentUser?.displayName || 'User'}</span>
                  <span className="profile-email">{currentUser?.email}</span>
                </div>
              </div>
              {/* Menu options */}
              <ul className="profile-menu">
                <li>
                  <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)}>
                    My Profile
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
                {/* Divider line */}
                <li><div className="menu-divider"></div></li>
                {/* Logout button */}
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
    </nav>
  );
}

export default Navbar;