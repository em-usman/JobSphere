// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import './dashboard.css'; 

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigate after a short delay to avoid race conditions
      setTimeout(() => {
        navigate('/home');
      }, 20);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span className="user-email">{currentUser?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <h2>Welcome to Your Dashboard</h2>
        <p>You are logged in as: <strong>{currentUser?.email}</strong></p>
        
        {/* Dashboard content goes here */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Your Activity</h3>
            <p>No recent activity</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <ul>
              <li>View profile</li>
              <li>Update settings</li>
              <li>Check notifications</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

