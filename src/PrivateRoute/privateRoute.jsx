import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const privateRoute = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        isAuthenticated: !!user,
        isLoading: false,
        user
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return authState.isAuthenticated ? 
    <Outlet /> : 
    <Navigate to="/signin" state={{ from: location.pathname }} replace />;
};

export default privateRoute;
