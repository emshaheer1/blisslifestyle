const { body, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
}

const optionalString = (field, max = 500) =>
  body(field).optional({ values: "null" }).trim().isLength({ max }).withMessage(`${field} is too long`).escape();

const optionalNumber = (field) =>
  body(field)
    .optional({ values: "null" })
    .custom((val) => val === "" || val === null || !isNaN(parseFloat(val)))
    .withMessage(`${field} must be a number`)
    .toFloat();

const blsRegFormValidators = [
  body("first_name").trim().notEmpty().withMessage("First name is required").isLength({ max: 100 }).escape(),
  body("last_name").trim().notEmpty().withMessage("Last name is required").isLength({ max: 100 }).escape(),
  body("gender").trim().notEmpty().withMessage("Gender is required").isLength({ max: 50 }).escape(),
  body("phone_no")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be a valid 10-digit number"),
  body("dob").trim().notEmpty().withMessage("Date of birth is required"),
  body("zip_code").trim().notEmpty().withMessage("ZIP code is required").isLength({ max: 20 }),
  body("address").trim().notEmpty().withMessage("Address is required").isLength({ max: 500 }).escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .isLength({ max: 254 }),
  optionalString("medication_plan"),
  optionalString("medical_condition", 50),
  optionalString("other_disease"),
  optionalString("allergic_to_medications", 50),
  optionalString("allergies"),
  optionalString("diseases", 1000),
  optionalNumber("current_weight"),
  optionalNumber("ideal_weight"),
  optionalNumber("height"),
  optionalNumber("bmi"),
  handleValidationErrors,
];

const registrationValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 200 }).escape(),
  body("dob").trim().notEmpty().withMessage("Date of birth is required"),
  body("gender").trim().notEmpty().withMessage("Gender is required").isLength({ max: 50 }).escape(),
  body("address").trim().notEmpty().withMessage("Address is required").isLength({ max: 500 }).escape(),
  body("zip").trim().notEmpty().withMessage("ZIP code is required").isLength({ max: 20 }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be a valid 10-digit number"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .isLength({ max: 254 }),
  handleValidationErrors,
];

const contactValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 200 }).escape(),
  body("dob").trim().notEmpty().withMessage("Date of birth is required"),
  body("gender").trim().notEmpty().withMessage("Gender is required").isLength({ max: 50 }).escape(),
  body("address").trim().notEmpty().withMessage("Address is required").isLength({ max: 500 }).escape(),
  body("zip").trim().notEmpty().withMessage("ZIP code is required").isLength({ max: 20 }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be a valid 10-digit number"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .isLength({ max: 254 }),
  handleValidationErrors,
];

const loginValidators = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

module.exports = { blsRegFormValidators, registrationValidators, contactValidators, loginValidators };
