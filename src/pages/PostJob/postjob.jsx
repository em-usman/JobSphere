import React, { useState, useEffect, useRef } from 'react';
import './postjob.css';
import {
  db,
  collection,
  addDoc,
  serverTimestamp
} from '../../config/firebase';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

function PostJob() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    description: '',
    email: '',
    address: '',
    salaryPackage: '',
    mediaType: 'image'
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      setCharCount(value.length);
    }

    setFormData(prev => {
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
    }
  };

  const uploadToCloudinary = async (file, mediaType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'jobsphere_uploads');

      const cloudName = 'df3y6jl0q';
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
      return data.secure_url;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      let mediaUrl = '';

      if (file) {
        const mediaType = formData.mediaType === 'image' ? 'image' : 'video';
        mediaUrl = await uploadToCloudinary(file, mediaType);
      }

      const docRef = await addDoc(collection(db, 'jobs'), {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        description: formData.description,
        email: formData.email,
        address: formData.address,
        salaryPackage: formData.salaryPackage,
        mediaType: formData.mediaType,
        mediaUrl: mediaUrl,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        createdBy: currentUser.displayName || currentUser.email
      });

      console.log('Job post created with ID: ', docRef.id);

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

      alert('Job posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error posting job: ', err);
      setError('Failed to post job. Please try again: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-content">
        <h1 className="post-job-title">Post a New Job</h1>
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
              Job Description* <span className="char-count">{charCount}/500</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job role, responsibilities, and requirements..."
              maxLength="500"
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
              <span className="file-name">{file ? file.name : 'No file selected'}</span>
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
              {isLoading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
