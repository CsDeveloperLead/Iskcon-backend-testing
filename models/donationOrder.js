const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Define the Donation Order schema
const donationOrderSchema = new mongoose.Schema({
  donationOrderId: {
    type: mongoose.Schema.Types.UUID,
    default: () => require("uuid").v4(),
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.UUID,
    required: true,
    ref: "User",
  },
  donationItems: [
    {
      donationItemId: {
        type: String,
        required: true,
      },
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
      enum: ["PENDING", "PAID"],
      default: "PENDING",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
  },
  donationStatus: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"],
    default: "PENDING",
    required: true,
  },
  createdAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
});

// Middleware to update `updatedAt`
donationOrderSchema.pre("save", function (next) {
  this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  if (!this.createdAt) {
    this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }
  next();
});

module.exports = mongoose.model("DonationOrder", donationOrderSchema);
