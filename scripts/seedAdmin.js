require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const existing = await Admin.findOne({ username: username.toLowerCase() });
    if (existing) {
      console.log(`Admin user "${username}" already exists. Skipping.`);
    } else {
      const passwordHash = await Admin.hashPassword(password);
      await Admin.create({ username: username.toLowerCase(), passwordHash });
      console.log(`Admin user "${username}" created successfully.`);
    }
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
