const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    first_name: { type: String, trim: true, maxlength: 100 },
    last_name: { type: String, trim: true, maxlength: 100 },
    gender: { type: String, trim: true, maxlength: 50 },
    phone_no: { type: String, trim: true, maxlength: 20 },
    dob: { type: String, trim: true },
    zip_code: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 500 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    medication_plan: { type: String, trim: true, maxlength: 500 },
    medical_condition: { type: String, trim: true, maxlength: 50 },
    other_disease: { type: String, trim: true, maxlength: 500 },
    allergic_to_medications: { type: String, trim: true, maxlength: 50 },
    allergies: { type: String, trim: true, maxlength: 500 },
    current_weight: { type: Number },
    ideal_weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    diseases: { type: String, trim: true, maxlength: 1000 },
    // Legacy fields from old form.js
    name: { type: String, trim: true, maxlength: 200 },
    zip: { type: String, trim: true, maxlength: 20 },
    phone: { type: String, trim: true, maxlength: 20 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

registrationSchema.index({ createdAt: -1 });
registrationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Registration", registrationSchema);
