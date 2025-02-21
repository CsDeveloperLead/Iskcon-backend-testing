const { razorpayInstance } = require("../controllers/razorpayConfig");

const razorpayInstanceValue = razorpayInstance();


exports.processPayment = async (amount,res) => {
    const option = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    try {
        razorpayInstanceValue.orders.create(option, (err, order) => {
            if (err) {
                // console.log("Failed to create Payment")
                return res.status(401).json({ message: "Failed to create Payment" });
            }
            return res
                .status(200)
                .json({ message: "Order Created Successfully", data: order })
        })
    } catch (error) {
        // console.log("Failed to create Payment")
        return res
            .status(500)
            .json({ message: "Failed to create Payment, Try again", error: error })
    }
}