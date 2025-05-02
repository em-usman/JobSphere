import React, { useEffect, useState } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import '../Dashboard/dashboard.css';

function MyPosts() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts when user changes
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const q = query(
          collection(db, 'jobs'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [currentUser]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', postId));
      setJobPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="job-posts-container">
        <h1 className="job-posts-title">MY POSTS</h1>
        <p>Loading your job posts...</p>
      </div>
    );
  }

  return (
    <div className="job-posts-container">
      <h1 className="job-posts-title">MY POSTS</h1>

      {jobPosts.length === 0 ? (
        <p>No job posts found.</p>
      ) : (
        <div className="job-posts-grid">
          {jobPosts.map((job) => (
            <div key={job.id} className="job-post-card">
              <div className="job-post-image">
                {job.mediaUrl ? (
                  job.mediaType === 'video' ? (
                    <video src={job.mediaUrl} controls />
                  ) : (
                    <img src={job.mediaUrl} alt={job.jobTitle} />
                  )
                ) : (
                  <div className="job-post-image-placeholder">
                    <span>{job.companyName?.charAt(0)?.toUpperCase() || 'J'}</span>
                  </div>
                )}
              </div>

              <div className="job-post-content">
                <h2 className="job-title">{job.jobTitle || 'Untitled Position'}</h2>
                <p className="job-company">{job.companyName || 'Company not specified'}</p>
                <div className="job-description">
                  {job.description || 'No description provided.'}
                </div>

                <div className="salary-info-label">Salary Package</div>
                <div className="job-salary-amount">
                  {job.salaryPackage || 'Not specified'}
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

                <div className="card-buttons">
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(job.id)}
                    aria-label="Delete post"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPosts;