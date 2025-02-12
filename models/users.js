const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  createdAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
});

// Middleware for hashing the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Update the `updatedAt` field to the current time in IST
  this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");

  // If it's a new document, set `createdAt` as well
  if (this.isNew) {
    this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
