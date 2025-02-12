const Order = require("../models/csrOrderModel");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
let merchantId = process.env.MERCHANT_ID1;
let salt_key = process.env.SALT_KEY1;

exports.createOrder = async(req,res) => {
    try{
        const {name,email,phone,amount,merchantId,csrStatus,transactionId,paymentId} = req.body;
        // console.log("Create Order Called");
        if(!name || !email || !phone || !amount)
            res.status(400).json({message:"All Fields are Required"});

        const csrOrderNew = await Order.create({
            name,
            email,
            phone,
            amount,
            merchantId,
            csrStatus,
            paymentId,
            transactionId

        });
        // console.log("csrOrderNew");
        res.status(201).json({message:"Order Created !",csrOrderNew});
    }
    catch(error){
        res.status(500).json({message:"Internal Server Error",error});
    }
}

exports.updateOrder = async(req,res) => {

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

            await Order.findOneAndUpdate(
                { transactionId: merchantTransactionId }, // Use transactionId, not merchantTransactionId
                {
                    $set: {
                        "paymentDetails.paymentStatus": "PAID",
                        orderStatus: "CONFIRMED",
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
