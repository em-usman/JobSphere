// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { db, collection, query, orderBy, onSnapshot } from '../../config/firebase';

function Dashboard() {
  // State to store array of job postings
  const [jobPosts, setJobPosts] = useState([]);
  
  // Loading state to show spinner while data is being fetched
  const [loading, setLoading] = useState(true);
  
  // Tracks ID of newly added post for highlight animation
  const [newPostAdded, setNewPostAdded] = useState(null);

  // Effect hook to fetch and listen for job post updates
  useEffect(() => {
    // Create Firestore query for jobs collection, ordered by creation date (newest first)
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    
    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(
      q,
      // Success callback - runs when data changes
      (querySnapshot) => {
        // Transform Firestore documents into job objects with id
        const jobs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Check if new post was added by comparing array lengths
        if (jobPosts.length > 0 && jobs.length > jobPosts.length) {
          // Find the ID of the new post
          const newPostId = jobs.find(j => !jobPosts.some(p => p.id === j.id))?.id;
          setNewPostAdded(newPostId);

          // Remove highlight after 1.5 seconds
          setTimeout(() => setNewPostAdded(null), 1500);
        }
        
        // Update jobs list and disable loading state
        setJobPosts(jobs);
        setLoading(false);
      },
      // Error callback
      (error) => {
        console.error('Error listening to posts:', error);
        setLoading(false);
      }
    );

    // Cleanup function - unsubscribe from Firestore listener when component unmounts
    return () => unsubscribe();
  }, [jobPosts.length]); // Only re-run effect when jobPosts length changes

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading job posts...</p>
      </div>
    );
  }

  // Main component render
  return (
    <div className="job-posts-container">
      <h1 className="job-posts-title">Available Job Opportunities</h1>

      {/* Grid layout for job post cards */}
      <div className="job-posts-grid">
        {jobPosts.map((job) => (
          <div 
            key={job.id} 
            // Add 'new-post' class if this is a newly added post
            className={`job-post-card ${newPostAdded === job.id ? 'new-post' : ''}`}
          >
            {/* Post creator information section */}
            <div className="creator-info">
              <div className="creator-avatar">
                {/* Show first letter of creator's name or 'U' as default */}
                {job.createdBy?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="creator-name">
                {job.createdBy || 'Unknown Creator'}
              </span>
            </div>

            {/* Media display section - handles both images and videos */}
            <div className="job-post-image">
              {job.mediaUrl ? (
                job.mediaType === 'video' ? (
                  // Video player with controls
                  <video 
                    src={job.mediaUrl} 
                    controls 
                    playsInline  // Required for iOS inline playback
                    preload="metadata" // Load minimal data initially
                    muted={false} // Ensure audio is not muted
                    // Generate thumbnail URL by replacing video extension with .jpg
                    poster={job.mediaUrl.replace(/\.(mp4|mov|webm|mkv)$/, '.jpg')}
                  />
                ) : (
                  // Image display with error fallback
                  <img 
                    src={job.mediaUrl} 
                    alt={job.jobTitle || 'Job post image'} 
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'fallback-image.jpg'; // Fallback image
                    }}
                  />
                )
              ) : (     
                // Placeholder when no media is available
                <div className="media-placeholder">
                  {job.mediaType === 'video' ? (
                    <i className="fas fa-video"></i> // Video icon
                  ) : (
                    <i className="fas fa-image"></i> // Image icon
                  )}
                </div>
              )}
            </div>

            {/* Job post content/details section */}
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

              {/* Salary information section */}
              <div className="salary-info-label">Salary Package</div>
              <div className="job-salary-amount">
                {job.salaryPackage || 'Not disclosed'}
              </div>

              {/* Contact information section */}
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