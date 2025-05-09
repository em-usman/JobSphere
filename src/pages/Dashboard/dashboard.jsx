import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';
import { db, collection, query, orderBy, onSnapshot } from '../../config/firebase';

function Dashboard() {
  const { searchTerm } = useOutletContext();
  const [jobPosts, setJobPosts] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostAdded, setNewPostAdded] = useState(null);
  const videoRefs = useRef({});

  const togglePlayPause = (jobId) => {
    const video = videoRefs.current[jobId];
    if (!video) return;

    if (video.paused) {
      video.play();
      video.parentElement.classList.add('playing');
    } else {
      video.pause();
      video.parentElement.classList.remove('playing');
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (jobPosts.length > 0 && jobs.length > jobPosts.length) {
          const newPostId = jobs.find(j => !jobPosts.some(p => p.id === j.id))?.id;
          setNewPostAdded(newPostId);
          setTimeout(() => setNewPostAdded(null), 1500);
        }
        
        setJobPosts(jobs);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to posts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobPosts.length]);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredJobs(jobPosts);
    } else {
      const filtered = jobPosts.filter(job => 
        job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.salaryPackage && job.salaryPackage.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobPosts]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading job posts...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="job-posts-container">
        <div className="job-posts-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className={`job-post-card ${newPostAdded === job.id ? 'new-post' : ''}`}
              >
                <div className="creator-info">
                  <div className="creator-avatar">
                    {job.createdBy?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="creator-name">
                    {job.createdBy || 'Unknown Creator'}
                  </span>
                </div>

                {/* Job Image/Video */}
                <div 
                  className={`job-post-image ${job.mediaType === 'video' ? 'has-video' : ''}`}
                  onClick={() => job.mediaType === 'video' && togglePlayPause(job.id)}
                >
                  {job.mediaUrl ? (
                    job.mediaType === 'video' ? (
                      <video 
                      controls 
                      playsInline // Required for iOS inline playback
                      muted={false} // Ensure audio is enabled
                      preload='metadata' // Load minimal data initially
                      // Generate thumbnail from video URL
                      poster={job.mediaUrl.replace(/\.(mp4|mov|webm|mkv)$/, '.jpg')} 
                        ref={el => videoRefs.current[job.id] = el}
                        src={job.mediaUrl}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img 
                        src={job.mediaUrl} 
                        alt={job.jobTitle || 'Job post image'} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'fallback-image.jpg';
                        }}
                      />
                    )
                  ) : (
                    <div className="job-post-image-placeholder">
                      <span>{job.companyName?.charAt(0)?.toUpperCase() || 'J'}</span>
                    </div>
                  )}
                </div>

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

                  <div className="salary-info-label">Salary Package</div>
                  <div className="job-salary-amount">
                    {job.salaryPackage || 'Not disclosed'}
                  </div>

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
            ))
          ) : (
            <div className="no-results">
              <p>No jobs found matching "{searchTerm}"</p>
              <p className="try-different">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;