const Order = require('../models/order');

// this controller is for creating order
exports.createOrder = async (req, res) => {
    try {
        const {
            orderId,
            userId,
            totalAmount,
            shippingAddress,
            paymentDetails,
            status,
            orderItems
        } = req.body

        // Parse JSON fields for arrays or objects (if sent as JSON strings)
        const parsedPaymentDetails = JSON.parse(paymentDetails);
        const parsedShippingAddress = JSON.parse(shippingAddress);
        const parsedOrderItems = JSON.parse(orderItems);

        // Validation for required fields
        if (!orderId || !userId || !totalAmount || !parsedPaymentDetails || !parsedShippingAddress || !parsedOrderItems) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // here will come payment Logic

        // Create a new order
        const order = await Order.create({
            orderId,
            userId,
            totalAmount,
            shippingAddress: parsedShippingAddress,
            paymentDetails: parsedPaymentDetails,
            status,
            orderItems: parsedOrderItems
        });

        if (!order) {
            return res.status(500).json({ message: "Order not created" });
        }

        return res.status(200).json({ data: order });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        // checking if orders are found
        if (!orders) {
            return res.status(500).json({ message: "Orders not found" });
        }

        // return response
        return res.status(200).json({ data: orders });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting single order
exports.getSingleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // checking if orderId is provided
        if (!orderId) {
            return res.status(400).json({ message: "Order Id is required" });
        }

        // getting single order
        const singleOrder = await Order.findById(orderId);

        // checking if order is found
        if (!singleOrder) {
            return res.status(500).json({ message: "Order not found" });
        }

        // return response
        return res.status(200).json({ data: singleOrder });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

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
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

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
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for updating status of order only admin can hit this route
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // checking if orderId and status is provided
        if (!orderId || !status) {
            return res.status(400).json({ message: "Order Id and Status is required" });
        }

        // updating order status
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        // checking if order is updated
        if (!updatedOrder) {
            return res.status(500).json({ message: "Order not found" });
        }

        // return response
        return res.status(200).json({ data: updatedOrder });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}
