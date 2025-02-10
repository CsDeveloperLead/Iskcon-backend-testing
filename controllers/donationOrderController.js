const DonationOrder = require("../models/donationOrder");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

let merchantId = process.env.MERCHANT_ID2;
let salt_key = process.env.SALT_KEY2;

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
    redirectUrl: `${process.env.FRONTEND_URL2}/${transactionId}`,
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

    const keyIndex = 1;
    const payload = JSON.stringify(donationData);
    const payloadMain = Buffer.from(payload).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const prod_URL = process.env.PHONEPAY_API2;

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: { request: payloadMain },
    };

    await axios(options)
      .then((response) => res.json(response.data))
      .catch(() => res.status(500).send("Payment request failed"));
  } catch (error) {
    res.status(500).send("Failed to create donation order");
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
