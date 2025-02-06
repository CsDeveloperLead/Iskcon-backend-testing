// models/Order.js
const { required } = require("joi");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Define the Order schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.UUID, // UUID type
    default: () => require("uuid").v4(), // Automatically generate UUID
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.UUID, 
    required: true,
    ref: "User", 
  },
  orderItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
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
  orderStatus: {
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
orderSchema.pre("save", function (next) {
  // Update the updatedAt field to current time in IST
  this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  if (!this.createdAt) {
    // Set the createdAt field if not already set
    this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }
  next();
});

// Create and export the Order model
module.exports = mongoose.model("Order", orderSchema);
