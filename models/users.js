const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true ,lowercase:true},
    phone_no: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    user_role: { type: String, required: true, default: "iskcon-user" },
    otp: { type: Number },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    userId: {
        type: String,
        required: true,
        unique: true,
        default: () => require('uuid').v4(),
    },
    isIskconMembership: { type: Boolean, default: false },
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
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");

        if (this.isNew) {
            this.createdAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
        }

        next();
    } catch (error) {
        console.error("Error in pre-save middleware:", error);
        next(error);
    }
});


module.exports = mongoose.model("User", userSchema);