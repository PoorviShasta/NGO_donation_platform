const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  role: {
    type: String,
    enum: ["donor", "ngo"],
    default: "donor"
  },

  // For Donor
  name: String,

  // Common
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // NGO Fields
  organizationName: String,
  website: String,
  contactNumber: String,
  about: String,
  workHistory: String,
  workImages: [String],

  isApproved: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);