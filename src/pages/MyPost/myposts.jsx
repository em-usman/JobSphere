import React, { useEffect, useState } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import '../Dashboard/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyPosts() {
  // State management for component data
  const [jobPosts, setJobPosts] = useState([]); // Array of job posts created by user
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [currentUser, setCurrentUser] = useState(null); // Currently authenticated user
  const [newPostAdded, setNewPostAdded] = useState(null); // Tracks newly added posts for highlighting

  const navigate = useNavigate(); // Navigation hook for routing

  // Effect to monitor authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user); // Update current user when auth state changes
    });
    return () => unsubscribe(); // Cleanup: unsubscribe from auth listener on unmount
  }, []);

  // Effect to fetch user's job posts when currentUser changes
  useEffect(() => {
    const fetchMyPosts = async () => {
      // Skip if no authenticated user
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true); // Activate loading state
      try {
        // Create query to get jobs where userId matches current user
        const q = query(
          collection(db, 'jobs'),
          where('userId', '==', currentUser.uid)
        );
        
        // Execute query and transform documents
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() // Spread document data into post object
        }));

        // Detect and highlight newly added posts
        if (jobPosts.length > 0 && posts.length > jobPosts.length) {
          const newPostId = posts.find(p => !jobPosts.some(j => j.id === p.id))?.id;
          setNewPostAdded(newPostId);
          // Remove highlight after 1.3 seconds
          setTimeout(() => setNewPostAdded(null), 1300);
        }

        setJobPosts(posts); // Update job posts state
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch posts'); // Show error notification
      } finally {
        setLoading(false); // Deactivate loading state
      }
    };

    fetchMyPosts(); // Invoke the fetch function
  }, [currentUser]); // Dependency: runs when currentUser changes

  /**
   * Handles deletion of a job post
   * @param {string} postId - ID of the post to delete
   */
  const handleDelete = async (postId) => {
    // Confirm deletion with user
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'jobs', postId)); // Delete document from Firestore
      setJobPosts(prev => prev.filter(post => post.id !== postId)); // Update local state
      toast.success('Post deleted successfully!'); // Show success notification
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post'); // Show error notification
    }
  };

  /**
   * Navigates to PostJob component in update mode
   * @param {object} job - Job post data to update
   */
  const handleUpdate = (job) => {
    navigate('/postjob', { state: { jobToUpdate: job } });
  };

  // Render loading state while fetching data
  if (loading) {
    return (
      <div className="job-posts-container">
        <h1 className="job-posts-title">MY POSTS</h1>
        <p>Loading your job posts...</p>
      </div>
    );
  }

  // Main component render
  return (
    <div className="job-posts-container">
      <h1 className="job-posts-title">MY POSTS</h1>

      {/* Conditional rendering based on posts availability */}
      {jobPosts.length === 0 ? (
        <p>No job posts found.</p>
      ) : (
        <div className="job-posts-grid">
          {/* Map through job posts and render cards */}
          {jobPosts.map((job) => (
            <div 
              key={job.id} 
              // Apply 'new-post' class if this is a newly added post
              className={`job-post-card ${newPostAdded === job.id ? 'new-post' : ''}`}
            >
              {/* Media display section (image/video) */}
              <div className="job-post-image">
                {job.mediaUrl ? (
                  job.mediaType === 'video' ? (
                    // Video player with controls
                    <video 
                      src={job.mediaUrl} 
                      controls 
                      playsInline // Required for iOS inline playback
                      muted={false} // Ensure audio is enabled
                      preload='metadata' // Load minimal data initially
                      // Generate thumbnail from video URL
                      poster={job.mediaUrl.replace(/\.(mp4|mov|webm|mkv)$/, '.jpg')} 
                    />
                  ) : (
                    // Image display
                    <img src={job.mediaUrl} alt={job.jobTitle} />
                  )
                ) : (
                  // Placeholder when no media is available
                  <div className="media-placeholder">
                    {job.mediaType === 'video' ? (
                      <i className="fas fa-video"></i>
                    ) : (
                      <i className="fas fa-image"></i>
                    )}
                  </div>
                )}
              </div>

              {/* Job post content section */}
              <div className="job-post-content">
                <h2 className="job-title">{job.jobTitle || 'Untitled Position'}</h2>
                <p className="job-company">{job.companyName || 'Company not specified'}</p>
                <div className="job-description">
                  {job.description || 'No description provided.'}
                </div>

                {/* Salary information */}
                <div className="salary-info-label">Salary Package</div>
                <div className="job-salary-amount">
                  {job.salaryPackage || 'Not specified'}
                </div>

                {/* Contact information */}
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

                {/* Action buttons */}
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