const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

module.exports = mongoose.model("Admin", adminSchema);
