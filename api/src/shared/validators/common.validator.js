/**
 * Reusable express-validator rules shared by all features
 * (ids, names, email, password, pagination).
 */
const { body, param, query } = require("express-validator");

/** Largest value a PostgreSQL INTEGER / SERIAL column can hold. */
const MAX_INT = 2147483647;

/**
 * Route param that must be a positive integer id (e.g. /users/:id).
 * @param {string} [name="id"]
 */
const idParam = (name = "id") =>
  param(name)
    .isInt({ min: 1, max: MAX_INT })
    .withMessage(`${name} must be a positive integer `)
    .toInt();

/**
 * Required text field with a maximum length.
 * @param {string} field - Body field name.
 * @param {string} label - Name shown in the error message.
 * @param {number} max - Maximum length (same as the VARCHAR size).
 */
const requiredText = (field, label, max) => {
  return body(field)
    .isString()
    .withMessage(`${label} is required`)
    .bail() // Stop running validations if any of the previous ones have failed.
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .isLength({ max })
    .withMessage(`${label} must be at most ${max} characters long`);
};

/**
 * Email field (normalizeEmail is not used because it removes dots from Gmail addresses).
 * @param {string} [field="email"]
 */
const emailRule = (field = "email") => {
  return body(field)
    .isString()
    .withMessage(`${field} is required`)
    .bail()
    .isEmail()
    .withMessage(`${field} must be a valid email`)
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage(`${field} must be at most 255 characters long`)
    .toLowerCase();
};

/**
 * Strong password: 8-72 characters (bcrypt limit) with a letter and a number.
 * @param {string} [field="password"]
 */
const passwordRule = (field = "password") => {
  return body(field)
    .isString()
    .withMessage(`${field} is required`)
    .bail()
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage(`${field} must be between 8 and 72 characters long`)
    .matches(/[A-Za-z]/)
    .withMessage(`${field} must contain at least one letter`)
    .matches(/[0-9]/)
    .withMessage(`${field} must contain at least one number`);
};

/**
 * Optional ?page=&limit= query parameters.
 * Read them in the controller with matchedData(req) (Express 5 query is read-only).
 */
const paginationRules = () => [
  query("page")
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),
];

module.exports = {
  MAX_INT,
  idParam,
  requiredText,
  emailRule,
  passwordRule,
  paginationRules,
};
