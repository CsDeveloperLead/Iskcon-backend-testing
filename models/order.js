// models/Order.js
const { required } = require("joi");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const product = require("./product");

// Define the Order schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String, // UUID type
    default: () => require("uuid").v4(), // Automatically generate UUID
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  orderItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String, required: true },
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

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"], // Enum for payment status
    default: "PENDING", // Default payment status
    required: true,
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
