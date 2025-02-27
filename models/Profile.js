const mongoose = require("mongoose");
const moment = require("moment-timezone");

const relationshipSchema = new mongoose.Schema({
  relation: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  dob: { type: Date, required: true },
});

const occasionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
});

const idProofSchema = new mongoose.Schema({
  aadhaarNumber: { type: String, default: "" },
  drivingLicense: { type: String, default: "" },
  voterId: { type: String, default: "" },
  otherId: { type: String, default: "" },
});

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  whatsappNumber: { type: String, default: "" },
  dob: { type: Date, required: true },
  panNumber: { type: String, default: "" },
  maritalStatus: { type: String, default: "" },
  citizenType: { type: String, default: "Indian" },
  gender: { type: String, default: "female" },
  address: { type: addressSchema, required: true },
  relationships: { type: [relationshipSchema], default: [] },
  occasions: { type: [occasionSchema], default: [] },
  idProof: { type: idProofSchema, default: {} },
  createdAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  },
});

profileSchema.pre("save", function (next) {
  this.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  if (!this.createdAt) {
    this.createdAt = this.updatedAt;
  }
  next();
});

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
