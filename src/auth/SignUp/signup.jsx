import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already authenticated, redirect to dashboard
        navigate('/dashboard');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with the full name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
    
      // Navigate to dashboard page after successful signup
      navigate('/dashboard');
      toast.success('Signup successful!');
    } catch (error) {
      console.error('Signup error:', error);
  
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try signing in instead.');
        toast.error('This email is already in use.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
        toast.error('Weak password: minimum 6 characters.');
      } else {
        setError(error.message);
        toast.error(`Signup failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    setError('');
  
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      console.log("Google sign-up successful", result.user);
  
      toast.success('Signed up successfully!');
  
      navigate('/dashboard');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google sign-up error:", error);
        setError(error.message);
        toast.error(`Google signup failed: ${error.message}`);
      }
    }
  };
  

  return (
    <div className="login-container">
      <div className="form-container">
        <div className="form-tabs">
          <button className="tab-active">SIGN UP</button>
        </div>
        
        <form className="login-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="fullName">FULL NAME</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
          
          <div className="create-account">
            <span>Already have an account?</span>
            <Link to="/signin" className="create-account-link">Sign In</Link>
          </div>
          
          <div className="divider"><span>OR</span></div>
          
          <button 
            type="button" 
            className="google-signin-btn" 
            onClick={handleGoogleSignup}
            disabled={loading}
          >
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