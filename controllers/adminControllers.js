const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const admin = new Admin({ name, email, password, role });
    await admin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create the JWT token payload
    const tokenPayload = { id: admin._id, email: admin.email, role: admin.role };

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
    const options = {
      httpOnly: true, // Prevent JavaScript access
      secure: false, // Use secure cookies in production
      sameSite: "none",
    };
    
    // Send the cookies and response
    return res
      .status(200)  
      .cookie("token", token, options)
      .cookie("payload", payload, options)
      .cookie("signature", signature, options)
      .json({
        message: "Login successful",
        token,
        hmac: { payload, signature },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};