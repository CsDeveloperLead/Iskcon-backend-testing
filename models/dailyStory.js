const mongoose = require('mongoose');
const moment = require('moment-timezone');

const dailyStorySchema = new mongoose.Schema(
    {
        story: [
            {
                title: { type: String },
                description: { type: String },
                Image: { type: String }
            }
        ],
        createdAt: {
            type: String, // Store as string for custom format
            default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
        },
        updatedAt: {
            type: String, // Store as string for custom format
            default: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'), // Set default to current time in IST
        },
    },
)

// Middleware to set the updatedAt field before saving
dailyStorySchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});

module.exports = mongoose.model("DailyStory", dailyStorySchema)