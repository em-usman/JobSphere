import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const publicRoute = ({ restricted = false }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

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

  // If authenticated and trying to access a restricted route (like signin/signup),
  // redirect to dashboard instead
  if (authState.isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise render the public route
  return <Outlet />;
};

export default publicRoute;
