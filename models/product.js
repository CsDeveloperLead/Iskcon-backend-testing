const mongoose = require('mongoose');
const moment = require('moment-timezone');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4(), // Automatically generate UUID
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number, // For precise decimal storage
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [{
    type: String, // Assuming images are stored as URLs or file paths
    required: true,
  }],
  category: {
    type: String,
    required: true,
  },
 createdAt: {
     type: String, // Store as string for custom format
     default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
   },
   updatedAt: {
     type: String, // Store as string for custom format
     default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
   },
});

productSchema.pre('save', function(next) {
  // Update the `updatedAt` field to current time in IST
  this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  if (!this.createdAt) {
    // Set the `createdAt` field if not already set
    this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  }
  next();
   
});

// Export the model
module.exports = mongoose.model('Product', productSchema);