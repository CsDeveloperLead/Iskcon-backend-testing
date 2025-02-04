const User = require("../models/users");
const errorConfig = require("../middlewares/errorHandler");
const { getEncodedCookie, getDecodedValue } = require("../utils/cookieutil");
const bcrypt = require("bcrypt");

const { sendVerificationEmail } = require("../services/emailVerify");
const { SchemaTypes } = require("mongoose");

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.signup = async (req, res) => {
  try {
    const { name, email, phone_no, password, user_role } = req.body;

    // Validate required fields
    if (!name || !password || (!email && !phone_no)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user based on email or phone number
    const existingUser = await User.findOne(email ? { email } : { phone_no });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const otp = generateOTP();
    // Create user
    const userData = { name, password, user_role, otp };
    if (email) userData.email = email;
    if (phone_no) userData.phone_no = phone_no;

    const user = await User.create(userData);
    if (!user) {
      return res.status(500).json({ message: "User not created" });
    }
    if (email && user_role === "iskcon-user") {
      const mailContent = `
Dear User,

Thank you for registering on our platform.. 

Your One-Time Password (OTP) for email verification is: ${otp}.

Please enter this OTP on the verification page to complete your registration process. 

For your security, this OTP is valid for only 5 minutes. If you did not request this code, please ignore this email.

Thank you,
Iskcon Ghaziabad`;

      const message = "Email Verification - OTP";

      try {
        // Attempt to send the verification email
        const emailStatus = await sendVerificationEmail(
          email,
          mailContent,
          message
        );

        // Check if the email was submitted successfully
        if (
          emailStatus &&
          emailStatus.accepted &&
          emailStatus.accepted.length > 0
        ) {
          // Email submitted successfully, return a success response
          return res.status(200).json({
            success: true,
            message: "Verification email sent successfully",
          });
        } else {
          // Email not sent successfully, delete the mentor and return an error response
          console.error("Email not accepted by recipient server:", emailStatus);
          await User.findByIdAndDelete(user._id);
          return res.status(500).json({
            success: false,
            message: "Failed to send verification email. Please try again.",
          });
        }
      } catch (error) {
        // Handle any errors that occurred while attempting to send the email
        console.error("Error sending email:", error);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }
    }

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return errorConfig(error, req, res);
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (String(user.otp) !== String(otp)) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
};

exports.removeUser = async (req, res) => {
  try {
    const { email, phone_no } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOneAndDelete({
      $or: [{ email }, { phone_no }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    return errorConfig(error, req, res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, phone_no } = req.body;

    if (!email && !phone_no) {
      return res
        .status(400)
        .json({ message: "Email or Phone number is required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phone_no });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If user is an admin, no need to check OTP or additional fields
    if (user.user_role === "iskcon-admin") {
      const token = getEncodedCookie({
        id: user.userId,
        role: user.user_role,
        name: user.name,
        email: user.email,
      });

      const options = {
        httpOnly: false,
        secure: true, // Change to true in production
        sameSite: "none",
        path: "/", // Ensure cookies are available across all paths
        maxAge: 24 * 60 * 60 * 1000, // Set expiration (optional)
      };

      return res.status(200).cookie("AuthToken", token, options).json({
        message: "Admin Login Successfully",
        role: user.user_role,
      });
    }

    // For normal users (iskcon-user), continue with OTP or other verification
    const token = getEncodedCookie({
      id: user.userId,
      role: user.user_role,
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
    });

    const options = {
      httpOnly: false,
      secure: true, // Change to true in production
      sameSite: "none",
      path: "/", // Ensure cookies are available across all paths
      maxAge: 30* 24 * 60 * 60 * 1000, // Set expiration (optional)
    };

    return res.status(200).cookie("AuthToken", token, options).json({
      message: "User Login Successfully",
      role: user.user_role,
    });
  } catch (error) {
    return errorConfig(error, req, res);
  }
};
