// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Contact model
const Contact = require('./models/Contact');

// Initialize Express application
const app = express();
// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

/**
 * CORS Configuration
 * - Allow requests from your frontend URL
 * - Permits the appropriate HTTP methods
 * - Enables credentials (cookies, authorization headers)
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174', // Use environment variable or default
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * MongoDB Connection
 * - Connects to MongoDB using URI from environment variables
 * - Includes options for better connection reliability
 * - Logs success or error message
 */
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    // console.log('Please ensure your MongoDB Atlas connection string is correct');
    // console.log('And that your IP address is whitelisted in the MongoDB Atlas dashboard');
  });

/**
 * POST /api/contact - Contact Form Submission Endpoint
 * - Receives contact form data
 * - Validates required fields
 * - Saves to MongoDB
 * - Returns appropriate responses
 */
app.post('/api/contact', async (req, res) => {
  // Log incoming request data for debugging
  console.log('Received contact form data:', req.body);
  
  try {
    // Destructure form data from request body
    const { name, email, phone, subject, message, userId } = req.body;
    
    // Validation - Check required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create new Contact document
    const newContact = new Contact({
      name,
      email,
      phone: phone || '', // Set empty string if phone not provided
      subject,
      message,
      userId: userId || null // Set null if userId not provided
    });
    
    // Save document to MongoDB
    await newContact.save();
    
    // Return success response with saved contact data
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      contact: newContact 
    });
  } catch (error) {
    // Log and return error response if something fails
    console.error('Error submitting contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

/**
 * Default route for API health check
 */
// app.get('/', (req, res) => {
//   res.send('API is running correctly');
// });

/**
 * Start Express Server
 * - Listens on specified PORT
 * - Logs server start message with URL
 */
// add you mongodb ip address in place of 1.2.3.4
app.listen(PORT, '1.2.3.4', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});