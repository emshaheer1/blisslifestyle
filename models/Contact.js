const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    dob: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true, maxlength: 50 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    zip: { type: String, required: true, trim: true, maxlength: 20 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 });
contactSchema.index({ isRead: 1 });

module.exports = mongoose.model("Contact", contactSchema);
