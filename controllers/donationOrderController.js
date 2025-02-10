const DonationOrder = require("../models/donationOrder");
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
    paymentDetails,
    donationStatus,
    donationItems,
    contact,
    transactionId,
  } = req.body;

  const donationData = {
    merchantId: merchantId,
    userId,
    amount: amount * 100,
    shippingAddress,
    paymentDetails,
    donationStatus,
    donationItems,
    contact,
    transactionId,
    redirectUrl: `${process.env.FRONTEND_URL1}/${transactionId}`,
    callbackUrl: `http://localhost:5173`,
    redirectMode: "REDIRECT",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
    merchantTransactionId: transactionId,
  };

  try {
    const newDonationOrder = new DonationOrder(donationData);
    await newDonationOrder.save();
    res.status(201).json(newDonationOrder);
  } catch (error) {
    res.status(500).send("Failed to create donation order");
  }
};

exports.getDonationOrders = async (req, res) => {
  try {
    const donationOrders = await DonationOrder.find();
    res.status(200).json(donationOrders);
  } catch (error) {
    res.status(500).send("Failed to fetch donation orders");
  }
};

exports.getSingleDonationOrder = async (req, res) => {
  try {
    const { donationOrderId } = req.params;
    const donationOrder = await DonationOrder.findById(donationOrderId);
    if (!donationOrder) return res.status(404).send("Donation order not found");
    res.status(200).json(donationOrder);
  } catch (error) {
    res.status(500).send("Failed to fetch donation order");
  }
};

exports.deleteDonationOrder = async (req, res) => {
  try {
    const { donationOrderId } = req.params;
    const deletedOrder = await DonationOrder.findByIdAndDelete(donationOrderId);
    if (!deletedOrder) return res.status(404).send("Donation order not found");
    res.status(200).json({ message: "Donation order deleted" });
  } catch (error) {
    res.status(500).send("Failed to delete donation order");
  }
};

exports.donationOrderBySpecificUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const donationOrders = await DonationOrder.find({ userId });
    res.status(200).json(donationOrders);
  } catch (error) {
    res.status(500).send("Failed to fetch user's donation orders");
  }
};

exports.updateDonationOrderStatus = async (req, res) => {
  try {
    const { donationOrderId } = req.params;
    const { donationStatus } = req.body;
    const updatedOrder = await DonationOrder.findByIdAndUpdate(
      donationOrderId,
      { donationStatus },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).send("Donation order not found");
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).send("Failed to update donation order status");
  }
};

exports.donationStatus = async (req, res) => {
  const { id: merchantTransactionId } = req.query;
  const keyIndex = 1;

  try {
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url:
        process.env.STATUS_API2 +
        `/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios(options);

    if (response.data.success) {
      await DonationOrder.findOneAndUpdate(
        { transactionId: merchantTransactionId },
        {
          $set: {
            "paymentDetails.paymentStatus": "PAID",
            donationStatus: "CONFIRMED",
          },
        },
        { new: true }
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Payment successful",
          amount: response.data.data.amount,
        });
    } else {
      res
        .status(200)
        .json({
          success: false,
          message: "Payment failed",
          reason: response.data.data.message,
        });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
