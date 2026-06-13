const express = require("express");
const PDFDocument = require("pdfkit");
const Registration = require("../models/Registration");
const { blsRegFormValidators } = require("../middleware/validators");
const { authenticateToken } = require("../middleware/auth");
const { getFullName, getPhone, getZip, getPdfFields } = require("../utils/registrationHelpers");

const router = express.Router();

router.post("/storeBLSRegFormData", blsRegFormValidators, async (req, res) => {
  try {
    const registration = await Registration.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      phone_no: req.body.phone_no,
      dob: req.body.dob,
      zip_code: req.body.zip_code,
      address: req.body.address,
      email: req.body.email,
      medication_plan: req.body.medication_plan || "",
      medical_condition: req.body.medical_condition || "",
      other_disease: req.body.other_disease || "",
      allergic_to_medications: req.body.allergic_to_medications || "",
      allergies: req.body.allergies || "",
      current_weight: req.body.current_weight ?? null,
      ideal_weight: req.body.ideal_weight ?? null,
      height: req.body.height ?? null,
      bmi: req.body.bmi ?? null,
      diseases: req.body.diseases || "",
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      id: registration._id,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ success: false, message: "Failed to save registration" });
  }
});

router.get("/registrations", authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    res.json({ success: true, data: registrations, total: registrations.length });
  } catch (error) {
    console.error("Fetch registrations error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch registrations" });
  }
});

router.get("/notifications/count", authenticateToken, async (req, res) => {
  try {
    const count = await Registration.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

router.patch("/registrations/:id/read", authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    res.json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update registration" });
  }
});

router.patch("/registrations/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Registration.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All registrations marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

router.get("/registrations/export/pdf", authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const filename = `bliss-all-registrations-${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).fillColor("#F5E1B0").text("Bliss Lifestyle — All Registrations", {
      align: "center",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .fillColor("#75B9E7")
      .text(`Generated: ${new Date().toLocaleString()} | Total: ${registrations.length}`, {
        align: "center",
      });
    doc.moveDown(1);

    const colX = [30, 50, 150, 210, 260, 340, 390, 460, 510, 560, 620, 680];
    const headers = [
      "#",
      "Name",
      "DOB",
      "Gender",
      "Phone",
      "Email",
      "ZIP",
      "Weight",
      "BMI",
      "Med. Plan",
      "Diseases",
      "Submitted",
    ];

    doc.fontSize(7).fillColor("#F5E1B0");
    const headerY = doc.y;
    headers.forEach((h, i) => doc.text(h, colX[i], headerY, { width: 70, continued: false }));
    doc.moveDown(0.5);

    registrations.forEach((reg, index) => {
      if (doc.y > 520) doc.addPage();
      const y = doc.y;
      doc.fontSize(6).fillColor("#333333");
      const row = [
        String(index + 1),
        getFullName(reg).substring(0, 22),
        reg.dob || "—",
        reg.gender || "—",
        getPhone(reg),
        (reg.email || "—").substring(0, 22),
        getZip(reg),
        reg.current_weight != null ? String(reg.current_weight) : "—",
        reg.bmi != null ? String(reg.bmi) : "—",
        (reg.medication_plan || "—").substring(0, 18),
        (reg.diseases || "—").substring(0, 18),
        new Date(reg.createdAt).toLocaleDateString(),
      ];
      row.forEach((cell, i) => doc.text(cell, colX[i], y, { width: 70, continued: false }));
      doc.moveDown(0.55);
    });

    doc.end();
  } catch (error) {
    console.error("Export PDF error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to export PDF" });
    }
  }
});

router.get("/registrations/:id", authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).select("-__v").lean();
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registration" });
  }
});

router.get("/registrations/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `bliss-registration-${registration._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(22).fillColor("#F5E1B0").text("Bliss Lifestyle", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#75B9E7").text("NO LIMIT TO LOSE WEIGHT", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor("#333333").text("Registration Details", { underline: true });
    doc.moveDown(0.8);

    getPdfFields(registration).forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#666666").text(`${label}:`, { continued: false });
      doc.fontSize(11).fillColor("#000000").text(String(value));
      doc.moveDown(0.4);
    });

    doc.end();
  } catch (error) {
    console.error("PDF error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
  }
});

module.exports = router;
