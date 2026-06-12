function getFullName(reg) {
  if (reg.first_name || reg.last_name) {
    return `${reg.first_name || ""} ${reg.last_name || ""}`.trim();
  }
  return reg.name || "—";
}

function getPhone(reg) {
  return reg.phone_no || reg.phone || "—";
}

function getZip(reg) {
  return reg.zip_code || reg.zip || "—";
}

function formatValue(val) {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}

function getPdfFields(reg) {
  const name = getFullName(reg);
  const fields = [
    ["Full Name", name],
    ["First Name", reg.first_name],
    ["Last Name", reg.last_name],
    ["Date of Birth", reg.dob],
    ["Gender", reg.gender],
    ["Phone", getPhone(reg)],
    ["Email", reg.email],
    ["Address", reg.address],
    ["ZIP Code", getZip(reg)],
    ["Medication Plan", reg.medication_plan],
    ["Medical Condition", reg.medical_condition],
    ["Selected Diseases", reg.diseases],
    ["Other Disease", reg.other_disease],
    ["Allergic to Medications", reg.allergic_to_medications],
    ["Allergies", reg.allergies],
    ["Current Weight (lbs)", reg.current_weight],
    ["Ideal Weight (lbs)", reg.ideal_weight],
    ["Height (ft.in)", reg.height],
    ["BMI", reg.bmi],
    ["Submitted On", new Date(reg.createdAt).toLocaleString()],
  ];

  return fields.filter(([, value]) => value !== null && value !== undefined && value !== "");
}

module.exports = { getFullName, getPhone, getZip, formatValue, getPdfFields };
