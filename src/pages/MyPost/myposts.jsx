import React, { useEffect, useState } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import '../Dashboard/dashboard.css';
import { useNavigate } from 'react-router-dom';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyPosts() {
  // State to store job posts
  const [jobPosts, setJobPosts] = useState([]);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to store currently authenticated user
  const [currentUser, setCurrentUser] = useState(null);

  // State to detect and highlight a newly added post
  const [newPostAdded, setNewPostAdded] = useState(null);

  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  // Fetch job posts when the current user changes
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Query posts where userId matches the current user
        const q = query(
          collection(db, 'jobs'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Highlight a newly added post by comparing previous and current posts
        if (jobPosts.length > 0 && posts.length > jobPosts.length) {
          const newPostId = posts.find(p => !jobPosts.some(j => j.id === p.id))?.id;
          setNewPostAdded(newPostId);
          toast.success('New post added!');
          setTimeout(() => setNewPostAdded(null), 1300); // Remove highlight after 1.5s
        }

        setJobPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch job posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [currentUser]);

  // Delete a job post
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'jobs', postId)); // Delete from Firestore
      setJobPosts(prev => prev.filter(post => post.id !== postId)); // Update state
      toast.success('Post deleted successfully!'); // Show success message
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  // Navigate to the post job page with the post data for updating
  const handleUpdate = (job) => {
    navigate('/postjob', { state: { jobToUpdate: job } });
  };

  // Show loading state while fetching data
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
            // Highlight new post with a class
            <div key={job.id} className={`job-post-card ${newPostAdded === job.id ? 'new-post' : ''}`}>
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
                    className="update-btn" 
                    onClick={() => handleUpdate(job)}
                  >
                    Update
                  </button>
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
