import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // For showing notifications
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from "../../config/firebase"; // Firebase config
import '../Styles/style.css'; 
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  browserPopupRedirectResolver,
  onAuthStateChanged
} from "firebase/auth";

function Signin() {
  // State variables for input fields and error/loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // For redirecting to another page
  const location = useLocation(); // For accessing location state (e.g., redirected from a protected route)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is already logged in, redirect to dashboard
      if (user) {
        navigate('/dashboard');
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Handle email/password sign in
  const handleEmailSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submit
    setEmailLoading(true); // Show loading indicator on button
    setError(''); // Reset error state

    try {
      // Attempt to sign in using email and password
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      const from = location.state?.from || '/dashboard'; // Redirect to intended page or dashboard
      navigate(from);
    } catch (error) {
      console.error("Email sign-in error:", error);

      // Show custom message for invalid credentials
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
        toast.error('Invalid email or password. Please try again.');
      } else {
        // Show generic error message
        setError(error.message);
        toast.error('Too many failed attempts. Please try again later.');
      }
    } finally {
      setEmailLoading(false); // Hide loading indicator
    }
  };

  // Handle Google sign-in with popup
  const handleGoogleSignIn = async () => {
    setError('');

    try {
      // Open Google sign-in popup
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      console.log("Google sign-in successful", result.user);
      toast.success('Signed In successfully!');
      navigate('/dashboard'); // Redirect after successful login
    } catch (error) {
      // Only handle errors if popup wasn't manually closed by user
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google sign-in error:", error);

        if (error.code === 'auth/cancelled-popup-request') {
          setError('Multiple popups detected. Please try again.');
          toast.error('Multiple popups detected. Please try again.');
        } else {
          setError(`Authentication failed: ${error.message}`);
          toast.error('Authentication failed. Please try again.');
        }
      }
    }
  };

  // Render Sign In form and UI
  return (
    <div className="login-container">
      <div className="form-container">
        {/* Sign In Tab */}
        <div className="form-tabs">
          <button className="tab-active">SIGN IN</button>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleEmailSignIn}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="signin-btn" disabled={emailLoading}>
            {emailLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Optional Forgot Password Link */}
          {/* 
          <div className="forgot-password">
            <a href="/forgot-password">Forgot your password?</a>
          </div> 
          */}

          {/* Signup Redirect */}
          <div className="create-account">
            <span>Don't have an account? </span>
            <Link to="/signup" className="create-account-link">Create one</Link>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Google Sign-In Button */}
          <button type="button" className="google-signin-btn" onClick={handleGoogleSignIn}>
            {/* Google Icon SVG */}
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
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
            Sign In with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signin;
