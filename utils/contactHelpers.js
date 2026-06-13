function getContactPdfFields(contact) {
  return [
    ["Name", contact.name],
    ["Date of Birth", contact.dob],
    ["Gender", contact.gender],
    ["Phone", contact.phone],
    ["Email", contact.email],
    ["Address", contact.address],
    ["ZIP Code", contact.zip],
    ["Submitted On", new Date(contact.createdAt).toLocaleString()],
  ];
}

module.exports = { getContactPdfFields };
