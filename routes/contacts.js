const express = require("express");
const PDFDocument = require("pdfkit");
const Contact = require("../models/Contact");
const { contactValidators } = require("../middleware/validators");
const { authenticateToken } = require("../middleware/auth");
const { getContactPdfFields } = require("../utils/contactHelpers");

const router = express.Router();

router.post("/blisLifeData", contactValidators, async (req, res) => {
  try {
    const { name, dob, gender, address, zip, phone, email } = req.body;

    const contact = await Contact.create({
      name,
      dob,
      gender,
      address,
      zip,
      phone,
      email,
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: "Contact request submitted successfully",
      id: contact._id,
    });
  } catch (error) {
    console.error("Contact error:", error.message);
    res.status(500).json({ success: false, message: "Failed to save contact request" });
  }
});

router.get("/contacts", authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).select("-__v").lean();
    res.json({ success: true, data: contacts, total: contacts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contact requests" });
  }
});

router.get("/contacts/notifications/count", authenticateToken, async (req, res) => {
  try {
    const count = await Contact.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

router.patch("/contacts/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Contact.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All contact requests marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

router.get("/contacts/export/pdf", authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const filename = `bliss-contact-requests-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor("#F5E1B0").text("Bliss Lifestyle — Contact Us Requests", {
      align: "center",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .fillColor("#75B9E7")
      .text(`Generated: ${new Date().toLocaleString()} | Total: ${contacts.length}`, {
        align: "center",
      });
    doc.moveDown(1);

    const colX = [40, 60, 160, 220, 280, 400, 460, 540, 620];
    const headers = ["#", "Name", "DOB", "Gender", "Address", "ZIP", "Phone", "Email", "Submitted"];

    doc.fontSize(8).fillColor("#F5E1B0");
    const headerY = doc.y;
    headers.forEach((h, i) => doc.text(h, colX[i], headerY, { width: 80, continued: false }));
    doc.moveDown(0.5);

    contacts.forEach((c, index) => {
      if (doc.y > 520) doc.addPage();
      const y = doc.y;
      doc.fontSize(7).fillColor("#333333");
      const row = [
        String(index + 1),
        c.name,
        c.dob,
        c.gender,
        c.address.substring(0, 28),
        c.zip,
        c.phone,
        c.email.substring(0, 24),
        new Date(c.createdAt).toLocaleDateString(),
      ];
      row.forEach((cell, i) => doc.text(cell, colX[i], y, { width: 80, continued: false }));
      doc.moveDown(0.55);
    });

    doc.end();
  } catch (error) {
    console.error("Contact export PDF error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to export PDF" });
    }
  }
});

router.get("/contacts/:id", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select("-__v").lean();
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact request not found" });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contact request" });
  }
});

router.patch("/contacts/:id/read", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact request not found" });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update contact request" });
  }
});

router.get("/contacts/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact request not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `bliss-contact-${contact._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(22).fillColor("#F5E1B0").text("Bliss Lifestyle", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#75B9E7").text("CONTACT US REQUEST", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor("#333333").text("Contact Details", { underline: true });
    doc.moveDown(0.8);

    getContactPdfFields(contact).forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#666666").text(`${label}:`, { continued: false });
      doc.fontSize(11).fillColor("#000000").text(String(value || "—"));
      doc.moveDown(0.4);
    });

    doc.end();
  } catch (error) {
    console.error("Contact PDF error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
  }
});

module.exports = router;
