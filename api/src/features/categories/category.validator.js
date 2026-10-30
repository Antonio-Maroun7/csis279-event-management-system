/**
 * Validation chains for the categories endpoints (express-validator).
 */
const { query } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  idParam,
  requiredText,
} = require("../../shared/validators/common.validator");

/**
 * GET /api/categories?search=
 * @type {Array<import("express").RequestHandler>}
 */
const validateListCategories = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  validate,
];

/**
 * Routes with /:id
 * @type {Array<import("express").RequestHandler>}
 */
const validateCategoryId = [idParam("id"), validate];

/**
 * POST /api/categories (name is VARCHAR(100) in the database)
 * @type {Array<import("express").RequestHandler>}
 */
const validateCreateCategory = [
  requiredText("name", "Category name", 100),
  validate,
];

/**
 * PUT /api/categories/:id
 * @type {Array<import("express").RequestHandler>}
 */
const validateUpdateCategory = [
  idParam("id"),
  requiredText("name", "Category name", 100),
  validate,
];

module.exports = {
  validateListCategories,
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
};
