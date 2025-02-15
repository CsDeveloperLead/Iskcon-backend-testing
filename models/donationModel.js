// models/Order.js
const { required } = require("joi");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const product = require("./product");

// Define the Order schema
const donationSchema = new mongoose.Schema({
  donationId: {
    type: String, // UUID type
    default: () => require("uuid").v4(), // Automatically generate UUID
    required: true,
    unique: true,
  },
  userId: {
  type: String, 
  required: true,
  ref: "User", 
  },
  donationItems: [
    {
      donationItemsId: { type: String, required: true },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  merchantId: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  paymentDetails: {
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"], // Enum for payment status
      default: "PENDING", // Default payment status
      required: true,
    },
    paymentId: {
      type: String, // Payment ID (e.g., Stripe payment ID)
      required: true,
    },
  },
  donationOrderStatus: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"], // Enum for status
    default: "PENDING", // Default status
    required: true,
  },
  createdAt: {
    type: String, // Store as string for custom format
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"), // Set default to current time in IST
  },
  updatedAt: {
    type: String, // Store as string for custom format
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"), // Set default to current time in IST
  },
});

// Middleware to set the updatedAt field before saving
donationSchema.pre("save", function (next) {
  // Update the updatedAt field to current time in IST
  this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  if (!this.createdAt) {
    // Set the createdAt field if not already set
    this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }
  next();
});

// Create and export the Order model
module.exports = mongoose.model("Donation", donationSchema);
