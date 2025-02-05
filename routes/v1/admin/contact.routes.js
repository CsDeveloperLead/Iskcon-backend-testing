const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/",async (req, res) => {
    const { name, email, mobile, subject, message } = req.body;
  
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS  // Use an App Password (not your actual password)
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER, // Admin email where inquiries should go
        subject: `New Contact Form Submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Contact Email sent:", info.messageId);
      res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("❌ Error sending contact email:", error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

module.exports = router;
