const User = require("../models/users");
const errorConfig = require("../middlewares/errorHandler");
const { getEncodedCookie, getdecodeToken } = require("../utils/cookieutil");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../middlewares/errorHandler");

const { sendVerificationEmail } = require("../services/emailVerify");
const { SchemaTypes } = require("mongoose");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ApiError = require('../utils/apiError'); 
const ApiResponse = require('../utils/ApiResponse');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.signup = async (req, res) => {
  try {
    const { name, email, phone_no, password, user_role } = req.body;

    // Validate required fields
    if (!name || !password || (!email && !phone_no)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user based on email or phone number
    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUserByPhone = await User.findOne({ phone_no: phone_no });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    const otp = generateOTP();
    // Create user
    const userData = { name, password, user_role };
    if (email) {
      userData.email = email;
      userData.otp = otp;
    }
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
    return errorHandler(error, req, res);
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

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email already verified",
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

    const user = await User.findOneAndDelete({
      $or: [{ email }, { phone_no }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
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

    // Generate token
    const token = getEncodedCookie({
      id: user.userId,
      role: user.user_role,
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
    });

  
    return res.status(200).json({
      message:
        user.user_role === "iskcon-admin"
          ? "Admin Login Successfully"
          : "User Login Successfully",
      role: user.user_role,
      token: token,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};


exports.getUserDataDecoded = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decodedData = getdecodeToken(token);

    if (!decodedData) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ userId: decodedData.id }).select(
      "-password"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "User data retrieved", userData: user });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendOTPbyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required field
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOTP();

    // Find or create the user
    let user = await User.findOne({ email });

    if (!user) {
      // If the user does not exist, create a new user
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      // If the user exists, update the OTP and set isEmailVerified to false
      user.otp = otp;
      user.isEmailVerified = false;
      await user.save();
    }

    const mailContent = `
Dear User,

Your One-Time Password (OTP) for email verification is: ${otp}.

Please enter this OTP on the verification page to proceed. 

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
          message: "OTP sent successfully",
        });
      } else {
        // Email not sent successfully, return an error response
        console.error("Email not accepted by recipient server:", emailStatus);
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      // Handle any errors that occurred while attempting to send the email
      console.error("Error sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in sendOTPbyEmail:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(406).json({ message: "This password is already used. Please choose a different password." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "An error occurred while resetting the password" });
  }
};

exports.GoogleLogin = async (req, res) => {
  const { idToken } = req.body;


  // Validate idToken
  if (!idToken) {
      throw new ApiError(400, "No token provided");
  }

  try {
      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
      });


      const payload = ticket.getPayload();


      // Extract user details from the payload
      const {
          sub: googleId,
          email,
          given_name: firstName,
          email_verified: emailVerified,
      } = payload;

      // Check if the user already exists in the database
      let user = await User.findOne({
          $or: [{ googleId }, { email }],
      });

      if (user) {
          // If the user exists, return an error
          const token = getEncodedCookie({
            id: user.userId,
            role: "iskcon-user",
            name: user.name,
            email: user.email,
        });
  

        return res
        .status(200)
        .json(new ApiResponse(200, { id: user.userId, token }, "Google login successful"));
      }

      // If the user does not exist, create a new user
      if (!user) {
          user = new User({
              googleId,
              email,
              name : firstName,
              user_role: "iskcon-user",
              isEmailVerified: emailVerified,
          });

          await user.save();
      }

      // Generate a token for the user
      const token = getEncodedCookie({
          id: user.userId,
          role: "iskcon-user",
          name: user.name,
          email: user.email,
      });

      // Return success response
      return res
          .status(200)
          .json(new ApiResponse(200, { id: user.userId, token }, "Google login successful"));

  } catch (error) {
      console.error("Error during Google login:", error);
      throw new ApiError(500, "Error during Google login");
  }
};

exports.getAllUSers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error in getAllUSers:", error);
    return res.status(500).json({ message: "An error occurred while fetching users" });
  }
};



// exports.otpsender = async (req, res) => {

//   const { mobileNumber } = req.body;

//   let number = mobileNumber.slice(2)

//   // Twilio configuration
//   const accountSid = process.env.TWILIO_ACCOUNT_SID;
//   const authToken = process.env.TWILIO_AUTH_TOKEN;
//   const serviceSid = process.env.TWILIO_AUTH_SERVICES;

//   const client = twilio(accountSid, authToken);

//   try {
//     const verification = await client.verify.v2.services(serviceSid).verifications.create({
//       to: `+91${number}`, // Recipient's phone number in E.164 format
//       channel: "sms", // Use "sms" for SMS or "whatsapp" for WhatsApp
//     });

//     return res.status(200).json({
//       message: "OTP sent successfully via SMS",
//       success: true,
//       sid: verification.sid,
//     });
//   } catch (error) {
//     logger.error("Error sending OTP via SMS:", error.message);
//     return res.status(500).json({ message: "Error in Sending OTP", error: error.message });
//   }
// };

// exports.verifyOTP = async (req, res) => {
//   const { mobileNumber, code } = req.body;

//   let number = mobileNumber.slice(2)

//   const gotUser = await User.findOne({ phone_no: mobileNumber }).select("-password")

//   if (!gotUser) {
//     return res.status(404).json({
//       success: false,
//       error: "User not found.",
//     });
//   }

//   const accountSid = process.env.TWILIO_ACCOUNT_SID;
//   const authToken = process.env.TWILIO_AUTH_TOKEN;
//   const serviceSid = process.env.TWILIO_AUTH_SERVICES;

//   const client = twilio(accountSid, authToken);

//   try {
//     const verificationCheck = await client.verify.v2.services(serviceSid).verificationChecks.create({
//       to: `+91${number}`,
//       code: code,
//     });

//     if (verificationCheck.status === "approved") {
//       return res.status(200).json({
//         success: true,
//         gotUser,
//         message: "OTP verified successfully",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error.message);
//     return res.status(500).json({ message: "Error verifying OTP", error: error.message });
//   }
// };
