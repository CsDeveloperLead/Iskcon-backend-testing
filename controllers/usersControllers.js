const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create the JWT token payload
    const tokenPayload = { id: user._id, email: user.email, role: user.role };

    // Generate a JWT token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create the HMAC payload and signature
    const payload = Buffer.from(JSON.stringify(tokenPayload)).toString(
      "base64"
    );
    const signature = crypto
      .createHmac("sha256", process.env.HMAC_SECRET)
      .update(payload)
      .digest("hex");

    // Set cookies with secure options
    const cookieOptions = {
      httpOnly: true, // Prevent JavaScript access
      secure: true, // Use secure cookies in production
    };

    // Send the cookies and response
    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .cookie("payload", payload, cookieOptions)
      .cookie("signature", signature, cookieOptions)
      .json({
        message: "Login successful",
        token,
        hmac: { payload, signature },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
