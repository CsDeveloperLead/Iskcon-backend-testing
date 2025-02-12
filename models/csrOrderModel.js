const mongoose = require("mongoose");
const moment = require('moment-timezone');

const csrSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email : {
            type:String,
            required:true
        },
        phone: {
            type:Number,
            required:true
        },
        amount: {
            type:Number,
            required:true
        },          
        merchantId: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
          },
        csrStatus: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"], // Enum for status
            default: "PENDING", // Default status
            required: true,
          },
          paymentId: {
            type: String, // Payment ID (e.g., Stripe payment ID)
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
    }
)

// Middleware to set the updatedAt field before saving
csrSchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});


module.exports = mongoose.model("csrOrder", csrSchema)