// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { db, collection, getDocs, query, orderBy } from '../../config/firebase';

function Dashboard() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobPosts(jobs);
      } catch (error) {
        console.error('Error fetching job posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading job posts...</div>;
  }

  return (
    <div className="job-posts-container">
      <h1 className="job-posts-title">Available Job Opportunities</h1>

      <div className="job-posts-grid">
        {jobPosts.map((job) => (
          <div key={job.id} className="job-post-card">
            {/* Creator info */}
            <div className="creator-info">
              <div className="creator-avatar">{job.createdBy?.charAt(0)}</div>
              <span className="creator-name">{job.createdBy}</span>
            </div>

            {/* Job Image */}
            <div className="job-post-image">
              {job.mediaUrl ? (
                job.mediaType === 'image' ? (
                  <img src={job.mediaUrl} alt={job.jobTitle} />
                ) : (
                  <video src={job.mediaUrl} controls />
                )
              ) : (
                <div className="job-post-image-placeholder">
                  <span>{job.companyName?.charAt(0) || 'U'}</span>
                </div>
              )}
            </div>

            {/* Job Content */}
            <div className="job-post-content">
              <h2 className="job-title">{job.jobTitle}</h2>
              <p className="job-company">{job.companyName}</p>
              <div className="job-description">
                {job.description.length > 100
                  ? `${job.description.substring(0, 100)}...`
                  : job.description}
              </div>

              {/* Salary Info Section */}
              <div className="salary-info-label">Salary Package</div>
              <div className="job-salary-amount">{job.salaryPackage}</div>

              {/* Contact Info Section */}
              <div className="contact-info-label">Contact Information</div>
              <div className="job-contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email: {job.email}</span>
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
