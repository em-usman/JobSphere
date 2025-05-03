// Importing necessary modules and Firebase config
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify'; // For showing notifications
import 'react-toastify/dist/ReactToastify.css';
import './postjob.css';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from '../../config/firebase';
import { auth } from '../../config/firebase';
import { cloudName } from '../../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

function PostJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobToUpdate = location.state?.jobToUpdate;
  const isUpdateMode = !!jobToUpdate; // Check if in update mode

  const fileInputRef = useRef(null);

  // State for job form inputs
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    description: '',
    email: '',
    address: '',
    salaryPackage: '',
    mediaType: 'image'
  });

  // Additional states
  const [file, setFile] = useState(null); // File object
  const [filePreview, setFilePreview] = useState(null); // For previewing selected file
  const [isLoading, setIsLoading] = useState(false); // Loading state for submit button
  const [error, setError] = useState(null); // To store and show form errors
  const [charCount, setCharCount] = useState(0); // Character count for description
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user

  // Check user authentication and set default email if not updating
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);

        // Set user email if creating a new job
        if (!isUpdateMode) {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } else {
        navigate('/login'); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate, isUpdateMode]);

  // Populate form with job data if in update mode
  useEffect(() => {
    if (jobToUpdate) {
      setFormData({
        jobTitle: jobToUpdate.jobTitle || '',
        companyName: jobToUpdate.companyName || '',
        description: jobToUpdate.description || '',
        email: jobToUpdate.email || '',
        address: jobToUpdate.address || '',
        salaryPackage: jobToUpdate.salaryPackage || '',
        mediaType: jobToUpdate.mediaType || 'image'
      });

      // Update character count and preview
      setCharCount(jobToUpdate.description ? jobToUpdate.description.length : 0);

      if (jobToUpdate.mediaUrl) {
        setFilePreview(jobToUpdate.mediaUrl);
      }
    }
  }, [jobToUpdate]);

  // Handle text inputs and description character count
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      setCharCount(value.length);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input and preview generation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };

  // Upload selected file to Cloudinary
  const uploadToCloudinary = async (file, mediaType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'jobsphere_uploads');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url; // Return Cloudinary URL
    } catch (error) {
      throw error;
    }
  };

  // Submit handler: creates or updates job post
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      let mediaUrl = jobToUpdate?.mediaUrl || '';

      // Upload new file if selected
      if (file) {
        const mediaType = formData.mediaType === 'image' ? 'image' : 'video';
        mediaUrl = await uploadToCloudinary(file, mediaType);
      }

      // Construct job object
      const jobData = {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        description: formData.description,
        email: formData.email,
        address: formData.address,
        salaryPackage: formData.salaryPackage,
        mediaType: formData.mediaType,
        mediaUrl: mediaUrl,
        userId: currentUser.uid,
        createdBy: currentUser.displayName || currentUser.email
      };

      if (isUpdateMode) {
        // Update existing job in Firestore
        const jobRef = doc(db, 'jobs', jobToUpdate.id);
        await updateDoc(jobRef, {
          ...jobData,
          updatedAt: serverTimestamp()
        });
        toast.success('Job updated successfully!');
      } else {
        // Create new job in Firestore
        jobData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'jobs'), jobData);
        console.log('Job post created with ID: ', docRef.id);
        toast.success('Job posted successfully!');
      }

      // Reset form after submission
      setFormData({
        jobTitle: '',
        companyName: '',
        description: '',
        email: currentUser.email || '',
        address: '',
        salaryPackage: '',
        mediaType: 'image'
      });

      setFile(null);
      setFilePreview(null);
      setCharCount(0);

      navigate('/dashboard'); // Navigate to dashboard after success
    } catch (err) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'posting'} job: `, err);
      setError(`Failed to ${isUpdateMode ? 'update' : 'post'} job. Please try again: ` + err.message);
      setError(err.message); // Set error message to show in UI
      toast.error(`Failed to ${isUpdateMode ? 'update' : 'post'} job. Please try again.`);
    } finally {
      setIsLoading(false); // Re-enable form
    }
  };

  // Open hidden file input on button click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    // JSX rendering form UI
    <div className="post-job-container">
      <div className="post-job-content">
        <h1 className="post-job-title">{isUpdateMode ? 'Update Job' : 'Post a New Job'}</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="post-job-form">
          <div className="form-group">
            <label htmlFor="jobTitle">Job Title*</label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name*</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Tech Solutions"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Job Description* <span className="char-count">{charCount}/150</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job role, responsibilities, and requirements..."
              maxLength="150"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="email">Contact Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. jobs@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Job Location*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Lahore, Pakistan"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salaryPackage">Salary Package*</label>
            <input
              type="text"
              id="salaryPackage"
              name="salaryPackage"
              value={formData.salaryPackage}
              onChange={handleChange}
              placeholder="e.g. $60,000 - $80,000 per year"
              required
            />
          </div>

          <div className="form-group">
            <label>Media Type</label>
            <div className="media-type-selector">
              <div className={`media-option ${formData.mediaType === 'image' ? 'active' : ''}`}>
                <input
                  type="radio"
                  id="imageOption"
                  name="mediaType"
                  value="image"
                  checked={formData.mediaType === 'image'}
                  onChange={handleChange}
                />
                <label htmlFor="imageOption">Upload Image</label>
              </div>
              <div className={`media-option ${formData.mediaType === 'video' ? 'active' : ''}`}>
                <input
                  type="radio"
                  id="videoOption"
                  name="mediaType"
                  value="video"
                  checked={formData.mediaType === 'video'}
                  onChange={handleChange}
                />
                <label htmlFor="videoOption">Upload Video</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mediaFile">
              {formData.mediaType === 'image' ? 'Upload Company Logo or Job Image' : 'Upload Intro Video'}
            </label>
            <input
              type="file"
              id="mediaFile"
              accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              className="file-input"
              ref={fileInputRef}
              style={{ display: 'none' }}
            />

            <div className="file-input-wrapper">
              <button type="button" className="file-input-button" onClick={handleBrowseClick}>
                Browse Files
              </button>
              <span className="file-name">{file ? file.name : filePreview && !file ? 'Current file' : 'No file selected'}</span>
            </div>

            {filePreview && formData.mediaType === 'image' && (
              <div className="image-preview">
                <img src={filePreview} alt="Preview" />
              </div>
            )}

            {filePreview && formData.mediaType === 'video' && (
              <div className="video-preview">
                <video src={filePreview} controls></video>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (isUpdateMode ? 'Updating...' : 'Posting...') : (isUpdateMode ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;