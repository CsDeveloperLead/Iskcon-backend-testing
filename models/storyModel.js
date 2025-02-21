const mongoose = require("mongoose");
const moment = require('moment-timezone');

const storySchema = new mongoose.Schema(
  {
    storyId: {
        type: String,
        required: true,
        unique: true,
        default: () => require('uuid').v4(),
    },
    typeOfMedia: {
      type: String,
      required: true,
      enum: ["image", "video"], 
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
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
      }
  }
);

storySchema.pre('save', function (next) {
  // Update the `updatedAt` field to current time in IST
  this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  if (!this.createdAt) {
    // Set the `createdAt` field if not already set
    this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
  }
  next();

});

module.exports = mongoose.model("Story", storySchema);