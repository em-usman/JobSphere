// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

/**
 * Contact Schema Definition
 * Defines the structure and validation rules for contact form submissions
 */
const contactSchema = new mongoose.Schema({
  // Visitor's full name - required field
  name: {
    type: String,        // Data type
    required: true      // Mandatory field
  },
  
  // Visitor's email address - required field
  email: {
    type: String,       // Data type
    required: true     // Mandatory field
  },
  
  // Visitor's phone number - optional field
  phone: {
    type: String,       // Data type
    required: false    // Optional field
  },
  
  // Subject of the contact request - required with specific allowed values
  subject: {
    type: String,       // Data type
    required: true,    // Mandatory field
    enum: [            // Allowed values
      'General Inquiry', 
      'Technical Support', 
      'Job Posting Issue', 
      'Account Problem', 
      'Other'
    ]
  },
  
  // Detailed message from visitor - required field
  message: {
    type: String,       // Data type
    required: true     // Mandatory field
  },
  
  // Optional user ID if the submitter is logged in
  userId: {
    type: String,       // Data type
    required: false    // Optional field (for anonymous submissions)
  },
  
  // Status tracking for contact requests
  status: {
    type: String,       // Data type
    enum: [            // Allowed status values
      'New',           // Default status for new submissions
      'In Progress',   // When being handled by support
      'Resolved'       // When issue is resolved
    ],
    default: 'New'     // Default value when not specified
  },
  
  // Automatic timestamp when document is created
  createdAt: {
    type: Date,        // Data type (Date object)
    default: Date.now  // Automatically set to current date/time
  }
});

/**
 * Export the Contact model
 * Creates a model from the schema that can be used to interact with the 'contacts' collection
 * Mongoose automatically pluralizes the model name to determine the collection name
 */
module.exports = mongoose.model('Contact', contactSchema);