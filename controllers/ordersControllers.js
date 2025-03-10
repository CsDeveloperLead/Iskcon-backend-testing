const Order = require("../models/order");
const crypto = require("crypto");
const { processPayment } = require("../utils/razorpayUtil");
const User = require("../models/users");
require("dotenv").config();


exports.createOrder = async (req, res) => {

  try {
    const {
      amount,
    } = req.body;

    await processPayment(amount, res)
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order", error: error })
  }
};

exports.status = async (req, res) => {

  const { orderId, paymentId, signature, userId,
    amount,
    shippingAddress,
    orderItems,
    contact,
  } = req.body


  const secretKey = process.env.RAZORPAY_KEY_SECRET

  const hmac = crypto.createHmac("sha256", secretKey)

  hmac.update(orderId + "|" + paymentId)

  const generatedSignature = hmac.digest("hex")

  if (generatedSignature === signature) {
    const data = {
      userId,
      amount,
      shippingAddress,
      paymentStatus: "PAID", // Default to empty if missing
      orderStatus: "CONFIRMED",
      orderItems,
      contact,
    }
    const order = new Order(data)
    await order.save()
    return res.status(200).json({ message: "Payment Verified successfully", response: order })
  } else {
    return res.status(500).json({ message: "Failed to verify order", error: error })
  }
};


// this controller is for getting all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    
    if (!orders.length) {
      return res.status(404).json({ message: "Orders not found" });
    }

    // Extract userIds from orders
    const userIds = orders.map((order) => order.userId);

    // Fetch users whose userId matches any in the extracted userIds
    const users = await User.find({ userId: { $in: userIds } });

    // Convert users array into a Map for efficient lookup
    const userMap = new Map(users.map((user) => [user.userId, user]));

    // Attach user details to each order
    const ordersWithUser = orders.map((order) => ({
      ...order.toObject(),
      user: userMap.get(order.userId) || null, // Attach user object or null
    }));

    // Return response
    return res.status(200).json(ordersWithUser);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// this controller is for getting single order
exports.getSingleOrder = async (req, res) => {

  try {
    const { transactionId } = req.params; // Corrected this line


    // Checking if transactionId is provided
    if (!transactionId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Fetching the order
    const order = await Order.findOne({ transactionId }).populate("orderItems.productId");

    console.log(order)

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
exports.deleteOrder = async (req, res) => {
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
exports.orderBySpecificUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // checking if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User Id is required" });
    }

    // getting orders
    const orders = await Order.find({ userId });

    // checking if orders are found
    if (!orders) {
      return res.status(500).json({ message: "Orders not found" });
    }

    // return response
    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// this controller is for updating status of order only admin can hit this route
exports.updateOrderStatus = async (req, res) => {
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
