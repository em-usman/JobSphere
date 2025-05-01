import React from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from '../src/pages/Home/home';
import SignIn from './auth/SignIn/signin';
import SignUp from './auth/SignUp/signup';
import PrivateRoute from './PrivateRoute/privateRoute';
import PublicRoute from './PublicRoute/publicRoute';
import Dashboard from './pages/Dashboard/dashboard';
import MyPosts from './pages/MyPost/myposts';
import PostJob from './pages/PostJob/postjob'
import Profile from './pages/Profile/profile' 


import Navbar from './Components/Navbar/navbar'; // Import Navbar

// Navbar only shows on private pages
const AppLayout = () => {
  return (
    <>
      <Navbar />
      <div>
        <Outlet /> {/* Render nested private routes here */}
      </div>
    </>
  );
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute restricted={true} />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Private routes with Navbar */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/myposts" element={<MyPosts />} />
              <Route path="/postjob" element={<PostJob />} />
              <Route path="/profile" element={<Profile/>}/>
              {/* Add more private pages here */}
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={3000}
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
