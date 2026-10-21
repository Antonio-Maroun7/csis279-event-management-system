/**
 * Validation chains for the users endpoints (express-validator).
 */
const { body, query } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  idParam,
  requiredText,
  passwordRule,
  paginationRules,
} = require("../../shared/validators/common.validator");

const ROLES = ["attendee", "organizer", "admin"];

/**
 * Routes with /:id
 * @type {Array<import("express").RequestHandler>}
 */
const validateUserId = [idParam("id"), validate];

/**
 * PUT /api/users/me
 * @type {Array<import("express").RequestHandler>}
 */
const validateUpdateMe = [
  requiredText("first_name", "First name", 60),
  requiredText("last_name", "Last name", 60),
  validate,
];

/**
 * PATCH /api/users/me/password
 * @type {Array<import("express").RequestHandler>}
 */
const validateChangePassword = [
  body("current_password")
    .isString()
    .withMessage("Current password is required")
    .bail()
    .notEmpty()
    .withMessage("Current password is required"),
  passwordRule("new_password"),
  validate,
];

/**
 * GET /api/users?search=&role=&page=&limit=
 * @type {Array<import("express").RequestHandler>}
 */
const validateListUsers = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  query("role")
    .optional()
    .isIn(ROLES)
    .withMessage(`role must be one of: ${ROLES.join(", ")}`),
  ...paginationRules(),
  validate,
];

/**
 * PATCH /api/users/:id/role
 * @type {Array<import("express").RequestHandler>}
 */
const validateChangeRole = [
  idParam("id"),
  body("role")
    .isIn(ROLES)
    .withMessage(`role must be one of: ${ROLES.join(", ")}`),
  validate,
];

module.exports = {
  validateUserId,
  validateUpdateMe,
  validateChangePassword,
  validateListUsers,
  validateChangeRole,
};
