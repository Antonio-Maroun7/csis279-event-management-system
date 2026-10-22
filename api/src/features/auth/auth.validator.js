/**
 * Validation chains for the auth endpoints (express-validator).
 */
const { body } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  requiredText,
  emailRule,
  passwordRule,
} = require("../../shared/validators/common.validator");

/**
 * POST /api/auth/register
 * @type {Array<import("express").RequestHandler>}
 */
const validateRegister = [
  requiredText("first_name", "First name", 60),
  requiredText("last_name", "Last name", 60),
  emailRule(),
  passwordRule(),
  validate,
];

/**
 * POST /api/auth/login
 * @type {Array<import("express").RequestHandler>}
 */
const validateLogin = [
  emailRule(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
};
