// models/Order.js
const mongoose = require('mongoose');

// Define the Order schema
const orderSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.UUID,  // UUID type
        default: () => require('uuid').v4(), // Automatically generate UUID
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.UUID,  // Foreign key to the Users collection (UUID)
        required: true,
        ref: 'User',  // Reference to the 'User' collection
    },
    orderItems: [
        {
            quantity: {
                type: Number,
                required: true,
            },
            products:[{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }],
            price: {
                type: Number,
                required: true,
            },
            orderItemsId: {
                type: mongoose.Schema.Types.UUID,  // UUID type
                default: () => require('uuid').v4(), // Automatically generate UUID
            },
            orderId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        flatNo: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        }
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            enum: ['CASH_ON_DELIVERY', 'ONLINE_PAYMENT'],  // Enum for payment method
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID'],  // Enum for payment status
            default: 'PENDING',  // Default payment status
            required: true,
        },
        paymentId: {
            type: String,  // Payment ID (e.g., Stripe payment ID)
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],  // Enum for status
        default: 'PENDING',  // Default status
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
});

// Middleware to set the updatedAt field before saving
orderSchema.pre('save', function (next) {
    // Update the updatedAt field to current time in IST
    this.updatedAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    if (!this.createdAt) {
        // Set the createdAt field if not already set
        this.createdAt = moment().tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss');
    }
    next();
});

// Create and export the Order model
module.exports = mongoose.model('Order', orderSchema);


