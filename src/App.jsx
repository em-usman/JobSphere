import React from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/pages/Home/home'; //  path of home page
import SignIn from './auth/SignIn/signin'; // path of sign in page
import SignUp from './auth/SignUp/signup'; // path of sign up page css
import PrivateRoute from './PrivateRoute/privateRoute';
import PublicRoute from './PublicRoute/publicRoute';
import Dashboard  from './pages/Dashboard/dashboard';

function App() {
  return (
    <>
    <Router>
      <Routes>
        {/* Public routes that redirect to dashboard if already logged in */}
        <Route element={<PublicRoute restricted={true} />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        
        {/* Protected routes - require authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more private routes here */}
        </Route>
        
        {/* Redirect root to dashboard - will be handled by PrivateRoute */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>

    <ToastContainer
        position="top-center"
        autoClose={3000} // Toast disappears after 3 seconds (optional)
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />

    </>
  );
}

export default App;
