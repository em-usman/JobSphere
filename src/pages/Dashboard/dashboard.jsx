// Dashboard.jsx
import React from 'react';
import './dashboard.css';

function Dashboard() {
  const jobPosts = [
    // {
    //   id: 1,
    //   createdBy: 'Ali Khan',
    //   title: 'Frontend Developer',
    //   company: 'Tech Solutions',
    //   description: 'We are looking for a passionate React.js developer to join our growing team...',
    //   email: 'ali@example.com',
    //   address: 'Lahore, Pakistan',
    //   imageUrl: '../src/assests/home_bg.jpg',
    // },
    {
      id: 2,
      createdBy: 'Sara Ahmed',
      title: 'Backend Engineer',
      company: 'Innovatech',
      description: 'Join us as a Node.js backend engineer to build scalable APIs and services...',
      email: 'sara@example.com',
      address: 'Karachi, Pakistan',
      imageUrl: '',
    },
    {
      id: 3,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '../../src/assets/home_bg.jpg',
    },
    {
      id: 4,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '',
    },
    {
      id: 5,
      createdBy: 'Sara Ahmed',
      title: 'Backend Engineer',
      company: 'Innovatech',
      description: 'Join us as a Node.js backend engineer to build scalable APIs and services...',
      email: 'sara@example.com',
      address: 'Karachi, Pakistan',
      imageUrl: '',
    },
    {
      id: 6,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '../../src/assets/home_bg.jpg',
    },
    {
      id: 7,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '',
    },
    {
      id: 8,
      createdBy: 'Sara Ahmed',
      title: 'Backend Engineer',
      company: 'Innovatech',
      description: 'Join us as a Node.js backend engineer to build scalable APIs and services...',
      email: 'sara@example.com',
      address: 'Karachi, Pakistan',
      imageUrl: '',
    },
    {
      id: 9,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '../../src/assets/home_bg.jpg',
    },
    {
      id: 10,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '',
    },
    {
      id: 11,
      createdBy: 'Sara Ahmed',
      title: 'Backend Engineer',
      company: 'Innovatech',
      description: 'Join us as a Node.js backend engineer to build scalable APIs and services...',
      email: 'sara@example.com',
      address: 'Karachi, Pakistan',
      imageUrl: '',
    },
    {
      id: 12,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '../../src/assets/home_bg.jpg',
    }
    // ... (other jobs same as before)
  ];

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
              {job.imageUrl ? (
                <img src={job.imageUrl} alt={job.title} />
              ) : (
                <div className="job-post-image-placeholder">
                  <span>{job.company?.charAt(0) || 'U'}</span>
                </div>
              )}
            </div>

            {/* Job Content */}
            <div className="job-post-content">
              <h2 className="job-title">{job.title}</h2>
              <p className="job-company">{job.company}</p>
              <div className="job-description">
                {job.description.length > 100
                  ? `${job.description.substring(0, 100)}...`
                  : job.description}
              </div>

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
