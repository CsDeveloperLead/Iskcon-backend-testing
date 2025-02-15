const mongoose = require("mongoose");
const moment = require('moment-timezone');

const liveDarshanSchema = new mongoose.Schema(
    {
        youtubeLiveLink: {
            type: String,
            required: false, // Optional field for embedding YouTube live streams
            validate: {
                validator: function (v) {
                    // Basic validation for YouTube links
                    return /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/.test(v);
                },
                message: props => `${props.value} is not a valid YouTube embed URL!`
            }
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
liveDarshanSchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});

module.exports = mongoose.model("LiveDarshan", liveDarshanSchema)