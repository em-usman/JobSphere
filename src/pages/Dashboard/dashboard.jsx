// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { db, collection, query, orderBy, onSnapshot } from '../../config/firebase';

function Dashboard() {
  const [jobPosts, setJobPosts] = useState([]);           // Store job post data
  const [loading, setLoading] = useState(true);           // Track loading state
  const [newPostAdded, setNewPostAdded] = useState(null); // Used to highlight a newly added post

  useEffect(() => {
    // Query Firestore collection 'jobs', ordered by creation time (descending)
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    
    // Real-time listener to get updates from Firestore
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Detect if a new post was added (compared to existing state)
      if (jobPosts.length > 0 && jobs.length > jobPosts.length) {
        const newPostId = jobs.find(j => !jobPosts.some(p => p.id === j.id))?.id;
        setNewPostAdded(newPostId);

        // Remove highlight after 1.5s
        setTimeout(() => setNewPostAdded(null), 1500);
      }
      
      setJobPosts(jobs);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to posts:', error);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();

  }, [jobPosts.length]); // Dependency to detect changes in length

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading job posts...</p>
      </div>
    );
  }

  return (
    <div className="job-posts-container">
      <h1 className="job-posts-title">Available Job Opportunities</h1>

      <div className="job-posts-grid">
        {jobPosts.map((job) => (
          <div 
            key={job.id} 
            className={`job-post-card ${newPostAdded === job.id ? 'new-post' : ''}`} // Add animation class if new
          >

            {/* Creator info section */}
            <div className="creator-info">
              <div className="creator-avatar">
                {job.createdBy?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="creator-name">
                {job.createdBy || 'Unknown Creator'}
              </span>
            </div>

            {/* Media section (image or video) */}
            <div className="job-post-image">
              {job.mediaUrl ? (
                job.mediaType === 'video' ? (
                  <video src={job.mediaUrl} controls />
                ) : (
                  <img 
                    src={job.mediaUrl} 
                    alt={job.jobTitle || 'Job post image'} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'fallback-image.jpg'; // Fallback if image fails
                    }}
                  />
                )
              ) : (
                // Placeholder if no media
                <div className="job-post-image-placeholder">
                  <span>{job.companyName?.charAt(0)?.toUpperCase() || 'J'}</span>
                </div>
              )}
            </div>

            {/* Job content/details */}
            <div className="job-post-content">
              <h2 className="job-title">
                {job.jobTitle || 'Untitled Position'}
              </h2>
              <p className="job-company">
                {job.companyName || 'Company not specified'}
              </p>
              <div className="job-description">
                {job.description || 'No description provided.'}
              </div>

              {/* Salary Info */}
              <div className="salary-info-label">Salary Package</div>
              <div className="job-salary-amount">
                {job.salaryPackage || 'Not disclosed'}
              </div>

              {/* Contact Info */}
              <div className="contact-info-label">Contact Information</div>
              <div className="job-contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: {job.email || 'Not provided'}</span>
                </div>
                {job.address && (
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Address: {job.address}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
