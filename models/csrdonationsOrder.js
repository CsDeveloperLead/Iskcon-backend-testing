const mongoose = require("mongoose");
const moment = require('moment-timezone');

const donateOrderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        contact: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            default: 0,
        },
        csdDonationType:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "CSRDonate",
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
donateOrderSchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});


module.exports = mongoose.model("CSRDonateOrder", donateOrderSchema)