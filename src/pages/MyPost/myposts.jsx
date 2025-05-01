// UserPosts.jsx
import React, { useState, useEffect } from 'react';
import './myposts.css';

function UserPosts() {
  // Mock current user - in a real app, this would come from authentication
  const currentUser = {
    id: 1,
    name: 'Ali Khan',
    email: 'ali@example.com'
  };

  // Sample job posts data (in a real app, this would be fetched from an API)
  const allJobPosts = [
    {
      id: 1,
      createdBy: 'Ali Khan',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      description: 'We are looking for a passionate React.js developer to join our growing team...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '',
      createdAt: '2025-04-25T14:30:00Z'
    },
    {
      id: 2,
      createdBy: 'Sara Ahmed',
      title: 'Backend Engineer',
      company: 'Innovatech',
      description: 'Join us as a Node.js backend engineer to build scalable APIs and services...',
      email: 'sara@example.com',
      address: 'Karachi, Pakistan',
      imageUrl: '',
      createdAt: '2025-04-26T09:15:00Z'
    },
    {
      id: 3,
      createdBy: 'Ali Khan',
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      description: 'Looking for a talented UI/UX designer with experience in Figma and Adobe XD...',
      email: 'ali@example.com',
      address: 'Lahore, Pakistan',
      imageUrl: '',
      createdAt: '2025-04-27T11:45:00Z'
    },
    {
      id: 4,
      createdBy: 'Ali Khan',
      title: 'Mobile Developer',
      company: 'AppWave',
      description: 'Join our team to build cutting-edge mobile applications using React Native...',
      email: 'ali@example.com',
      address: 'Islamabad, Pakistan',
      imageUrl: '',
      createdAt: '2025-04-23T16:20:00Z'
    }
  ];

  // Filter posts to show only current user's posts
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    company: '',
    description: '',
    address: ''
  });

  useEffect(() => {
    // Filter posts to show only those created by the current user
    const filteredPosts = allJobPosts.filter(post => post.createdBy === currentUser.name);
    setUserPosts(filteredPosts);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Delete post handler (frontend only)
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      const updatedPosts = userPosts.filter(post => post.id !== postId);
      setUserPosts(updatedPosts);
    }
  };

  // Edit post handlers
  const handleEditClick = (post) => {
    setIsEditing(post.id);
    setEditFormData({
      title: post.title,
      company: post.company,
      description: post.description,
      address: post.address
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = (e, postId) => {
    e.preventDefault();
    
    const updatedPosts = userPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          title: editFormData.title,
          company: editFormData.company,
          description: editFormData.description,
          address: editFormData.address
        };
      }
      return post;
    });
    
    setUserPosts(updatedPosts);
    setIsEditing(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
  };

  return (
    <div className="user-posts-container">
      <h1 className="user-posts-title">My Job Postings</h1>
      
      {userPosts.length === 0 ? (
        <div className="no-posts-message">
          <p>You haven't created any job postings yet.</p>
        </div>
      ) : (
        <div className="user-posts-grid">
          {userPosts.map((post) => (
            <div key={post.id} className="user-post-card">
              {isEditing === post.id ? (
                // Edit form
                <div className="edit-form-container">
                  <form onSubmit={(e) => handleEditSubmit(e, post.id)}>
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        name="company"
                        value={editFormData.company}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="edit-form-actions">
                      <button type="submit" className="save-btn">Save Changes</button>
                      <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                // Normal post view
                <>
                  {/* Post Header with Company Initial */}
                  <div className="post-header">
                    <div className="company-logo">
                      {post.company.charAt(0)}
                    </div>
                    <div className="post-meta">
                      <h2 className="post-title">{post.title}</h2>
                      <h3 className="post-company">{post.company}</h3>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="post-content">
                    <p className="post-description">
                      {post.description.length > 100
                        ? `${post.description.substring(0, 100)}...`
                        : post.description}
                    </p>
                    
                    <div className="post-details">
                      <div className="post-location">
                        <i className="location-icon">📍</i>
                        <span>{post.address}</span>
                      </div>
                      <div className="post-datetime">
                        <i className="time-icon">🕒</i>
                        <span>Posted: {formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Actions */}
                  <div className="post-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditClick(post)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPosts;