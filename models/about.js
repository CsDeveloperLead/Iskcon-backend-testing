const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Use moment-timezone for handling IST

// Define the About schema
const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String, // Assuming images are stored as URLs or file paths
    required: true,
  }],
  createdAt: {
    type: String, // Store as string for custom format
    default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
  },
  updatedAt: {
    type: String, // Store as string for custom format
    default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
  },
});

// Middleware to set the `updatedAt` field before saving
aboutSchema.pre('save', function(next) {
  // Update the `updatedAt` field to current time in IST
  this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  if (!this.createdAt) {
    // Set the `createdAt` field if not already set
    this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  }
  next();
});

// Create the model from the schema
module.exports = mongoose.model('About', aboutSchema);

