// components/Contact/ContactForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './ContactForm.css';

const ContactForm = () => {
  // const { currentUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry', // Default selection
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      // Add userId from Firebase Auth if user is logged in
      // const userData = {
      //   ...formData,
      //   userId: currentUser ? currentUser.uid : null
      // };
      
      // Make API call to your Express server
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.success) {
        setStatus({ submitting: false, submitted: true, error: null });
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: ''
        });
        setTimeout(() => {
          setStatus(prev => ({ ...prev, submitted: false }));
        }, 5000); // Hide success message after 5 seconds
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ 
        submitting: false, 
        submitted: false, 
        error: 'Failed to submit the form. Please try again later.'
      });
    }
  };

  return (
    <>
    <section id="contact-form">

    <div className="contact-form-container">
      <h2>Contact Us</h2>
      
      <div className="contact-info-section">
        <div className="contact-info-item">
          <div className="info-icon">
            <i className="location-icon"></i>
          </div>
          <div className="info-text">
            <p>Address: University of Agriculture Faisalabad, Main Campus</p>
          </div>
        </div>
        
        <div className="contact-info-item">
          <div className="info-icon">
            <i className="phone-icon"></i>
          </div>
          <div className="info-text">
            <p>Phone: <a href="tel:+123456789">+1 234 4567 89</a></p>
          </div>
        </div>
        
        <div className="contact-info-item">
          <div className="info-icon">
            <i className="email-icon"></i>
          </div>
          <div className="info-text">
            <p>Email: <a href="mailto:info@yoursite.com">info@uaf.edu.pk</a></p>
          </div>
        </div>
        
        <div className="contact-info-item">
          <div className="info-icon">
            <i className="website-icon"></i>
          </div>
          <div className="info-text">
            <p>Website: <a href="https://yoursite.com" target="_blank">yoursite.com</a></p>
          </div>
        </div>
      </div>
      
      <div className="form-content">
        <div className="contact-form-section">
          <h3>Contact Us</h3>
          
          {status.submitted && (
            <div className="success-message">
              Thank you for reaching out! Your message has been submitted successfully. 
              We'll get back to you shortly.
            </div>
          )}
          
          {status.error && (
            <div className="error-message">
              {status.error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">FULL NAME</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Job Posting Issue">Job Posting Issue</option>
                <option value="Account Problem">Account Problem</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">MESSAGE</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Please describe your issue or question"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={status.submitting}
              className="submit-button"
            >
              {status.submitting ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        </div>
        
        <div className="form-image">
          <img src="../src/assets/contact_us.avif" alt="contact" />
        </div>
      </div>
    </div>
  </section>
  <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} JobSphere. All Rights Reserved.</p>
        </div>
      </footer>
  </>
  );
};

export default ContactForm;