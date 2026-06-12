const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { loginValidators } = require("../middleware/validators");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 8 * 60 * 60 * 1000,
};

router.post("/login", loginValidators, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.cookie("bliss_token", token, COOKIE_OPTIONS);
    res.json({
      success: true,
      message: "Login successful",
      admin: { username: admin.username },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("bliss_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    admin: { username: req.admin.username },
  });
});

module.exports = router;
