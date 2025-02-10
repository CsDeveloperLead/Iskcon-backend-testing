const Donation = require("../models/donationModel");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
let merchantId = process.env.MERCHANT_ID1;
let salt_key = process.env.SALT_KEY1;


exports.createDonationOrder = async (req, res) => {

  const {
    userId,
    amount,
    shippingAddress,
    paymentDetails, // Default to empty if missing
    donationOrderStatus,
    donationItems,
    contact,
    transactionId,
  } = req.body;

  // Prepare order data
  const orderData = {
    merchantId: merchantId,
    userId,
    amount : amount * 100,
    shippingAddress,
    paymentDetails,
    donationOrderStatus,
    donationItems,
    contact,
    transactionId,
    redirectUrl: `${process.env.FRONTEND_URL2}/${transactionId}`,
    callbackUrl: `http://localhost:5173`,
    redirectMode: "REDIRECT",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
    merchantTransactionId: transactionId,

  };


  try {
    // Save order to the database
    const newDonation = new Donation(orderData);
    await newDonation.save();

    // Prepare payload for the payment request
    const keyIndex = 1;
    const payload = JSON.stringify(orderData);
    const payloadMain = Buffer.from(payload).toString("base64");

    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = process.env.PHONEPAY_API1;

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    
    // Send payment request
    await axios(options)
      .then((response) => {
        res.json(response.data); // Send payment response to the frontend
      })
      .catch((error) => {
        res.status(500).send("Payment request failed");
      });
  } catch (error) {
    res.status(500).send("Failed to create order");
  }
};

exports.status2 = async (req, res) => {
    const { id: merchantTransactionId } = req.query; // Extract transaction ID from query
    const keyIndex = 1;
  
    try {
      // Construct the string for generating checksum
      const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;
  
      // Call the PhonePe status API
      const options = {
        method: 'GET',
        url: process.env.STATUS_API1 + `/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId,
        },
      };
  
      const response = await axios(options);
  
      if (response.data.success) {
        // Payment is successful, update the order status in the database
        await Donation.findOneAndUpdate(
            { transactionId: merchantTransactionId }, // Use transactionId, not merchantTransactionId
            {
                $set: {
                    "paymentDetails.paymentStatus": "PAID",
                    donationOrderStatus: "CONFIRMED",
                },
            },
            { new: true } 
        );
        
  
        res.status(200).json({
          success: true,
          message: 'Payment successful',
          amount: response.data.data.amount, // Adjust based on actual response structure
        });
      } else {
        res.status(200).json({
          success: false,
          message: 'Payment failed',
          reason: response.data.data.message, // Adjust based on actual response structure
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

// this controller is for getting all orders
exports.getOrders2 = async (req, res) => {
  try {
    const orders = await Order.find();

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

// this controller is for getting single order
exports.getSingleOrder2 = async (req, res) => {

  try {
    const { transactionId } = req.params; // Corrected this line


    // Checking if transactionId is provided
    if (!transactionId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Fetching the order
    const order = await Donation.findOne({ transactionId })


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
