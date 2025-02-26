const Donation = require("../models/donationModel");
const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/users");
const { processPayment } = require("../utils/razorpayUtil");
require("dotenv").config();
let merchantId = process.env.MERCHANT_ID1;
let salt_key = process.env.SALT_KEY1;

exports.createDonationOrder = async (req, res) => {
  try {
      const {
        amount,
      } = req.body;
  
      await processPayment(amount, res)
    } catch (error) {
      return res.status(500).json({ message: "Failed to create donation order", error: error })
    }
};

exports.status = async (req, res) => {

  const { orderId, paymentId, signature, userId,
    donationItems,
    amount,
    shippingAddress,
    contact,
  } = req.body


  const secretKey = process.env.RAZORPAY_KEY_SECRET

  const hmac = crypto.createHmac("sha256", secretKey)

  hmac.update(orderId + "|" + paymentId)

  const generatedSignature = hmac.digest("hex")

  if (generatedSignature === signature) {
    const data = {
      userId,
      donationItems,
      amount,
      shippingAddress,
      contact,
      paymentStatus: "PAID", // Default to empty if missing
      donationOrderStatus: "CONFIRMED",
    }
    const donationOrder = new Donation(data)
    await donationOrder.save()
    
    return res.status(200).json({ message: "Payment Verified successfully", response: donationOrder })
  } else {
    return res.status(500).json({ message: "Failed to verify donation order", error: error })
  }
};

// this controller is for getting all orders
exports.getOrders2 = async (req, res) => {
  try {
    const donations = await Donation.find();
    const userIds = donations.map((donation) => donation.userId); // Extract userIds

    // Fetch users whose userId matches any of the extracted IDs
    const users = await User.find({ userId: { $in: userIds } });

    // Convert users array into a Map for efficient lookup
    const userMap = new Map(users.map((user) => [user.userId, user]));

    // Attach user details to each donation
    const donationsWithUser = donations.map((donation) => ({
      ...donation.toObject(),
      user: userMap.get(donation.userId) || null, // Attach user object or null
    }));

    // Check if donations exist
    if (!donationsWithUser.length) {
      return res.status(500).json({ message: "Donations not found" });
    }

    // Return response
    res.status(200).json(donationsWithUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// this controller is for getting single order
exports.getSingleOrder2 = async (req, res) => {
  try {
    const { transactionId } = req.params; // Corrected this line

    // Checking if transactionId is provided
    if (!transactionId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Fetching the order
    const order = await Donation.findOne({ transactionId });

    // Checking if order is found
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Returning the order data
    return res.status(200).json({ data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// this controller is for deleting order
exports.deleteOrder2 = async (req, res) => {
  try {
    const { orderId } = req.params;

    // checking if orderId is provided
    if (!orderId) {
      return res.status(400).json({ message: "Order Id is required" });
    }

    // deleting order
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    // checking if order is deleted
    if (!deletedOrder) {
      return res.status(500).json({ message: "Order not found" });
    }

    // return response
    return res.status(200).json({ data: deletedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// this controller is for getting orders by specific user
exports.orderBySpecificUser2 = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID:", userId);

    // Checking if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User Id is required" });
    }

    // Getting orders
    const orders = await Donation.find({ userId });

    console.log("Orders:", orders);

    // Checking if orders exist
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Return response
    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// this controller is for updating status of order only admin can hit this route
exports.updateOrderStatus2 = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // checking if orderId and status is provided
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order Id and Status is required" });
    }

    // updating order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // checking if order is updated
    if (!updatedOrder) {
      return res.status(500).json({ message: "Order not found" });
    }

    // return response
    return res.status(200).json({ data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
