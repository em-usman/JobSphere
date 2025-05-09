import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, googleProvider } from "../../config/firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  browserPopupRedirectResolver, 
  onAuthStateChanged, 
  updateProfile, 
} from "firebase/auth";
import '../Styles/style.css';

function Signup() {
  // State management for form inputs and UI status
  const [email, setEmail] = useState(''); // Stores user's email input
  const [password, setPassword] = useState(''); // Stores user's password input
  const [fullName, setFullName] = useState(''); // Stores user's full name input
  const [loading, setLoading] = useState(false); // Tracks loading state during authentication
  const [error, setError] = useState(''); // Stores error messages for display
  
  const navigate = useNavigate(); // Hook for programmatic navigation

  /**
   * Effect hook to handle authenticated user redirection
   * Checks if user is already logged in and redirects to dashboard
   */
  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is authenticated, redirect to dashboard
        navigate('/dashboard');
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [navigate]);

  /**
   * Handles email/password signup form submission
   * @param {Event} e - Form submission event
   */
  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Set loading state and clear previous errors
    setLoading(true);
    setError('');

    try {
      // Step 1: Create user account with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      // Step 2: Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // On success: redirect to dashboard and show success message
      navigate('/dashboard');
      toast.success('Account created successfully! Welcome!');
    } catch (error) {
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in instead.');
          toast.error('Email already in use.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters long.');
          toast.error('Please choose a stronger password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          toast.error('Invalid email format.');
          break;
        default:
          setError('Signup failed. Please try again.');
          toast.error(`Error: ${error.message}`);
      }
    } finally {
      // Reset loading state regardless of success/failure
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth signup flow
   * Uses Firebase's Google authentication provider
   */
  const handleGoogleSignup = async () => {
    setError(''); // Clear previous errors

    try {
      // Initiate Google sign-in with popup
      await signInWithPopup(
        auth, 
        googleProvider, 
        browserPopupRedirectResolver
      );

      // On success: redirect and show success message
      toast.success('Google signup successful!');
      navigate('/dashboard');
    } catch (error) {
      // Ignore popup closed by user error, show others
      if (error.code !== 'auth/popup-closed-by-user') {
        setError('Google signup failed. Please try again.');
        toast.error(`Google authentication error: ${error.message}`);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        {/* Form tabs - currently only showing signup option */}
        <div className="form-tabs">
          <button className="tab-active">SIGN UP</button>
        </div>

        {/* Main signup form */}
        <form className="login-form" onSubmit={handleSignup}>
          {/* Full name input field */}
          <div className="form-group">
            <label htmlFor="fullName">FULL NAME</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name" // Helps browsers with autofill
            />
          </div>

          {/* Email input field */}
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" // Helps browsers with autofill
            />
          </div>

          {/* Password input field */}
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password (min 6 characters)"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" // Helps browsers with autofill
            />
          </div>

          {/* Error message display */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit button with loading state */}
          <button 
            type="submit" 
            className="signin-btn" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                CREATING ACCOUNT...
              </>
            ) : (
              'SIGN UP'
            )}
          </button>

          {/* Link to sign in page for existing users */}
          <div className="create-account">
            <span>Already have an account?</span>
            <Link to="/signin" className="create-account-link">Sign In</Link>
          </div>

          {/* Divider for alternative signup options */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Google signup button */}
          <button 
            type="button" 
            className="google-signin-btn" 
            onClick={handleGoogleSignup}
            disabled={loading}
            aria-label="Sign up with Google"
          >
            {/* Google logo SVG */}
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;