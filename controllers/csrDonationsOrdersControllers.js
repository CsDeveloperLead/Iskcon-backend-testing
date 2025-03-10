const Donate = require("../models/csrdonation");
const CSRDonateOrder = require("../models/csrdonationsOrder");
const { processPayment } = require("../utils/razorpayUtil");
const crypto = require("crypto");


exports.createOrder = async (req, res) => {
    try {
        const {
            amount,
        } = req.body;

        await processPayment(amount, res)

    } catch (error) {
        return res.status(500).json({ message: "Failed to create order", error: error })
    }
}


exports.status = async (req, res) => {

    const {
        orderId,
        paymentId,
        signature,
        csdDonationType,
        amount,
        name,
        email,
        contact,
    } = req.body


    const secretKey = process.env.RAZORPAY_KEY_SECRET

    const hmac = crypto.createHmac("sha256", secretKey)

    hmac.update(orderId + "|" + paymentId)

    const generatedSignature = hmac.digest("hex")

    if (generatedSignature === signature) {
        const data = {
            csdDonationType,
            amount,
            name,
            email,
            contact,
            paymentStatus: "PAID"
        }

        await Donate.findOneAndUpdate(
            { _id: csdDonationType },
            { $inc: { amountRaised: amount } },
            { new: true }
        )

        const order = new CSRDonateOrder(data)
        await order.save()
        return res.status(200).json({ message: "Payment Verified successfully", response: order })
    } else {
        return res.status(500).json({ message: "Failed to verify order", error: error })
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const allOrders = await CSRDonateOrder.find()
        return res.status(200).json({ message: "All orders", response: allOrders })
    } catch (error) {
        return res.status(500).json({ message: "Failed to get all orders", error: error })
    }
}

exports.getOrdersByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // Fetch all orders by email
        const orders = await CSRDonateOrder.find({ email });

        // Check if orders exist
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this email" });
        }

        // Return response
        return res.status(200).json({ message: "Orders fetched successfully", response: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Failed to get orders", error: error.message });
    }
};

