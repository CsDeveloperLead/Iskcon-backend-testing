const mongoose = require("mongoose");
const moment = require('moment-timezone');

const donateSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: [{
            type: String,
            required: true
        }],
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        faqs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Faq'
            }
        ],
        donationsCategory: [
            {
                title: {
                    type: String,
                    required: true
                },
                donationTypes: [
                    {
                        title: {
                            type: String,
                            required: true
                        },
                        amount: {
                            type: Number,
                            required: true
                        }
                    }
                ]
            }
        ],
        accountDetails: {
            accountName: {
                type: String,
                required: true
            },
            accountNumber: {
                type: Number,
                required: true
            },
            bankName: {
                type: String,
                required: true
            },
            ifscCode: {
                type: String,
                required: true
            },
            branchName: {
                type: String,
                required: true
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
donateSchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});


module.exports = mongoose.model("Donate", donateSchema)