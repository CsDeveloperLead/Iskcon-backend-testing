const GuestDonation = require('../models/guestDonations');
const { processPayment } = require('../utils/razorpayUtil');
const crypto = require('crypto');

// Create a new donation order
exports.createGuestDonationOrder = async (req, res) => {
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

    const { orderId, paymentId, signature,
        amount,
    } = req.body

    const secretKey = process.env.RAZORPAY_KEY_SECRET

    const hmac = crypto.createHmac("sha256", secretKey)

    hmac.update(orderId + "|" + paymentId)

    const generatedSignature = hmac.digest("hex")

    if (generatedSignature === signature) {
        const data = {
            amount,
            paymentStatus: "PAID",
        }
        const order = new GuestDonation(data)
        await order.save()
        return res.status(200).json({ message: "Payment Verified successfully", response: order })
    } else {
        throw new ApiError(401, "Payment not verified")
    }
};


exports.getGuestDonations = async (req, res) => {
    try {
        const orders = await GuestDonation.find().lean();
        return res.status(200).json({ message: "All orders", response: orders })
    } catch (error) {
        return res.status(500).json({ message: "Failed to get orders", error: error })
    }
}

exports.deleteGuestDonation = async (req, res) => {
    try {
        const { guestDonationId } = req.params;

        if (!guestDonationId) {
            return res.status(400).json({ message: "guestDonationId is required" })
        }

        await GuestDonation.deleteOne({ guestDonationId });

        return res.status(200).json({ message: "Order deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete order", error: error })
    }
}