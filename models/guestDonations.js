// models/Order.js
const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Define the Order schema
const guestDonationSchema = new mongoose.Schema({
    guestDonationId: {
        type: String, // UUID type
        default: () => require("uuid").v4(), // Automatically generate UUID
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"], // Enum for payment status
        default: "PENDING", // Default payment status
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
guestDonationSchema.pre("save", function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
    }
    next();
});

// Create and export the Order model
module.exports = mongoose.model("GuestDonation", guestDonationSchema);
