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
  // Navigation and location hooks for routing and accessing state
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in update mode by looking for job data in location state
  const jobToUpdate = location.state?.jobToUpdate;
  const isUpdateMode = !!jobToUpdate; // Boolean flag for update mode

  // Ref for file input to trigger it programmatically
  const fileInputRef = useRef(null);

  // State for job form inputs with initial values
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    description: '',
    email: '',
    address: '',
    salaryPackage: '',
    mediaType: 'image' // Default to image upload
  });

  // Additional component states
  const [file, setFile] = useState(null); // Stores the selected file object
  const [filePreview, setFilePreview] = useState(null); // URL for previewing selected file
  const [isLoading, setIsLoading] = useState(false); // Loading state for submit button
  const [error, setError] = useState(null); // Stores form validation errors
  const [charCount, setCharCount] = useState(0); // Character counter for description
  const [currentUser, setCurrentUser] = useState(null); // Stores authenticated user data

  // Effect to handle user authentication and set default email
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);

        // Set user email if creating a new job (not in update mode)
        if (!isUpdateMode) {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } else {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate, isUpdateMode]);

  // Effect to populate form when in update mode
  useEffect(() => {
    if (jobToUpdate) {
      // Set form fields with existing job data
      setFormData({
        jobTitle: jobToUpdate.jobTitle || '',
        companyName: jobToUpdate.companyName || '',
        description: jobToUpdate.description || '',
        email: jobToUpdate.email || '',
        address: jobToUpdate.address || '',
        salaryPackage: jobToUpdate.salaryPackage || '',
        mediaType: jobToUpdate.mediaType || 'image'
      });

      // Update character count based on existing description
      setCharCount(jobToUpdate.description ? jobToUpdate.description.length : 0);
      
      // Set file preview if media URL exists
      if (jobToUpdate.mediaUrl) {
        setFilePreview(jobToUpdate.mediaUrl);
      }
    }
  }, [jobToUpdate]);

  // Handler for form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update character count for description field
    if (name === 'description') setCharCount(value.length);
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for file input changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Reset input value to allow re-selecting same file
    e.target.value = '';
    
    // Define valid file types based on mediaType
    const validTypes = formData.mediaType === 'image'
      ? ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
      : ['video/mp4', 'video/mov', 'video/webm', 'video/mkv'];

    // Set max file size (5MB for images, 20MB for videos)
    const maxSize = formData.mediaType === 'image' ? 1 * 1024 * 1024 : 5 * 1024 * 1024;

    // Validate file type
    if (!validTypes.includes(selectedFile.type)) {
        setError(`Invalid file type. Please upload a ${formData.mediaType === 'image' ? 'JPEG, PNG, JPG, or GIF' : 'MP4, WebM, MKV, or MOV'}`);
        return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
        toast.error(`File too large. Max ${formData.mediaType === 'image' ? '1MB' : '5MB'} allowed.`);
        return;
    }

    // Update file state and create preview URL
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setError(null); // Clear any previous errors
  };

  // Function to upload file to Cloudinary
  const uploadToCloudinary = async (file, mediaType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'jobsphere_uploads'); // Cloudinary upload preset
      formData.append('resource_type', mediaType);

      // Construct upload URL based on media type
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`;
      
      // Send upload request
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });

      if (!response.ok) throw new Error('Upload failed');
      
      // Return secure URL of uploaded file
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload ${mediaType}: ${error.message}`);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return; // Ensure user is authenticated

    try {
      setIsLoading(true);
      setError(null);
      
      // Use existing media URL if in update mode and no new file selected
      let mediaUrl = jobToUpdate?.mediaUrl || '';

      // Upload new file if one was selected
      if (file) {
        mediaUrl = await uploadToCloudinary(file, formData.mediaType);
      } 
      // Require file for new posts with media type selected
      else if (!jobToUpdate?.mediaUrl && formData.mediaType !== 'none') {
        throw new Error('Please select a file to upload');
      }

      // Construct job data object
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
        createdBy: currentUser.displayName || currentUser.email.split('@')[0], // Use display name or email prefix
      };

      // Handle update or create based on mode
      if (isUpdateMode) {
        // Update existing document in Firestore
        await updateDoc(doc(db, 'jobs', jobToUpdate.id), {
          ...jobData,
          updatedAt: serverTimestamp() // Add update timestamp
        });
        toast.success('Job updated successfully!');
      } else {
        // Add new document to Firestore
        jobData.createdAt = serverTimestamp(); // Add creation timestamp
        await addDoc(collection(db, 'jobs'), jobData);
        toast.success('Job posted successfully!');
      }

      // Reset form after successful submission
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

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Helper function to trigger file input click
  const handleBrowseClick = () => fileInputRef.current?.click();

  return (
    // Main container for the form
    <div className="post-job-container">
      <div className="post-job-content">
        <h1 className="post-job-title">{isUpdateMode ? 'Update Job' : 'Post a New Job'}</h1>
        {error && <div className="error-message">{error}</div>}

        {/* Job posting form */}
        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Job Title Field */}
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

          {/* Company Name Field */}
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

          {/* Job Description Field with character counter */}
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

          {/* Contact Email Field */}
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

          {/* Job Location Field */}
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

          {/* Salary Package Field */}
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

          {/* Media Type Selection (Image/Video) */}
          <div className="form-group">
            <label>Media Type</label>
            <div className="media-type-selector">
              {['image', 'video'].map(type => (
                <div key={type} className={`media-option ${formData.mediaType === type ? 'active' : ''}`}>
                  <input
                    type="radio"
                    id={`${type}Option`}
                    name="mediaType"
                    value={type}
                    checked={formData.mediaType === type}
                    onChange={handleChange}
                  />
                  <label htmlFor={`${type}Option`}>Upload {type.charAt(0).toUpperCase() + type.slice(1)}</label>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="form-group">
            <label htmlFor="mediaFile">
              {formData.mediaType === 'image' 
                ? 'Upload Company Logo or Job Image (JPEG, PNG, JPG, or GIF)' 
                : 'Upload Intro Video (MP4, WebM, MKV, or MOV)'}
            </label>
            <input
              className='file-input'
              type="file"
              id="mediaFile"
              accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <div className="file-input-wrapper">
              <button type="button" className='file-input-button' onClick={handleBrowseClick}>
                Browse Files
              </button>
              <span className='file-name'>
                {file ? file.name : filePreview ? 'File selected' : 'No file chosen'}
              </span>
            </div>

            {/* Media Preview Section */}
            {filePreview && (
              <div className="media-preview-container">
                {formData.mediaType === 'image' ? (
                  <div className="image-preview">
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    onLoad={() => URL.revokeObjectURL(filePreview)} // Clean up memory
                  />
                  </div>
                ) : (
                  <div className="video-preview">
                  <video
                    muted={false}
                    playsInline
                    preload='metadata'
                    src={filePreview}
                    controls
                    onLoadedMetadata={() => URL.revokeObjectURL(filePreview)} // Clean up memory
                  />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Form Submission Button */}
          <div className='form-actions'>
          <button type="submit" className='submit-button' disabled={isLoading}>
            {isLoading ? (isUpdateMode ? 'Updating...' : 'Posting...') : (isUpdateMode ? 'Update Job' : 'Post Job')}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;