import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // For showing user notifications
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from "../../config/firebase"; // Firebase authentication config
import '../Styles/style.css'; // Component-specific styles
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  browserPopupRedirectResolver,
  onAuthStateChanged
} from "firebase/auth";

function Signin() {
  // State management for form inputs and UI status
  const [email, setEmail] = useState(''); // Stores user's email input
  const [password, setPassword] = useState(''); // Stores user's password input
  const [emailLoading, setEmailLoading] = useState(false); // Tracks loading state during email sign-in
  const [googleLoading, setGoogleLoading] = useState(false); // Tracks loading state during Google sign-in
  const [error, setError] = useState(''); // Stores and displays authentication errors
  
  // Navigation hooks
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation(); // For accessing route state (e.g., redirected from protected route)

  /**
   * Effect hook to handle authenticated user redirection
   * Checks if user is already logged in and redirects appropriately
   */
  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to dashboard or previously attempted protected route
        const redirectPath = location.state?.from || '/dashboard';
        navigate(redirectPath, { replace: true });
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [navigate, location.state]);

  /**
   * Handles email/password authentication
   * @param {Event} e - Form submission event
   */
  const handleEmailSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setEmailLoading(true); // Show loading indicator
    setError(''); // Clear previous errors

    try {
      // Authenticate user with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Show success message
      toast.success('Welcome back! Signed in successfully.');
      
      // Redirect to intended page or dashboard
      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Authentication error:", error);
      
      // Handle specific Firebase authentication errors
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          toast.error('Invalid credentials. Please check your email and password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Account temporarily locked. Try again later or reset your password.');
          toast.error('Account temporarily locked due to multiple failed attempts.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          toast.error('Account disabled. Contact support for assistance.');
          break;
        default:
          setError('Sign in failed. Please try again.');
          toast.error('Authentication error. Please try again.');
      }
    } finally {
      setEmailLoading(false); // Reset loading state
    }
  };

  /**
   * Handles Google OAuth authentication
   * Uses Firebase's Google provider with popup
   */
  const handleGoogleSignIn = async () => {
    setError(''); // Clear previous errors
    setGoogleLoading(true); // Show loading state

    try {
      // Initiate Google sign-in with popup
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      
      // Show success message
      toast.success('Google authentication successful!');
      
      // Redirect to dashboard or previously attempted protected route
      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // Only handle errors if popup wasn't manually closed by user
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google authentication error:", error);
        
        // Handle specific Google auth errors
        if (error.code === 'auth/account-exists-with-different-credential') {
          setError('This email is already registered with another method. Try email sign-in.');
          toast.error('Account exists with different authentication method.');
        } else {
          setError('Google sign-in failed. Please try again.');
          toast.error('Google authentication error. Please try again.');
        }
      }
    } finally {
      setGoogleLoading(false); // Reset loading state
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        {/* Form header tabs */}
        <div className="form-tabs">
          <button className="tab-active">SIGN IN</button>
        </div>

        {/* Main sign-in form */}
        <form className="login-form" onSubmit={handleEmailSignIn}>
          {/* Email input field */}
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email" // Helps with browser autofill
              aria-describedby="emailHelp" // For accessibility
            />
          </div>

          {/* Password input field */}
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              autoComplete="current-password" // Helps with browser autofill
            />
          </div>

          {/* Error message display */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Submit button with loading state */}
          <button 
            type="submit" 
            className="signin-btn" 
            disabled={emailLoading}
            aria-busy={emailLoading}
          >
            {emailLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                SIGNING IN...
              </>
            ) : (
              'SIGN IN'
            )}
          </button>

          {/* Forgot password link (commented out but available for implementation) */}
          {/* <div className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div> */}

          {/* Sign-up redirect link */}
          <div className="create-account">
            <span>Don't have an account? </span>
            <Link to="/signup" className="create-account-link">Create one</Link>
          </div>

          {/* Divider for alternative authentication methods */}
          <div className="divider" aria-hidden="true">
            <span>OR</span>
          </div>

          {/* Google sign-in button */}
          <button 
            type="button" 
            className="google-signin-btn" 
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            aria-label="Sign in with Google"
          >
            {/* Google logo SVG */}
            {googleLoading ? (
              <span className="spinner" aria-hidden="true"></span>
            ) : (
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signin;