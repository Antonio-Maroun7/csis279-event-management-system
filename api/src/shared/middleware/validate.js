/**
 * Shared validation middleware for express-validator chains.
 * Put it at the end of every validator array:
 *   const validateCreateVenue = [body("name").notEmpty(), ..., validate];
 */
const { validationResult } = require("express-validator");

/**
 * Sends 400 with a clear list of errors when a validation rule fails.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {import("express").Response | void}
 */
const validate = (req, res, next) => {
  const result = validationResult(req); //If there are no validation errors, continue to the next middleware/controller.

  if (result.isEmpty()) {
    return next();
  }

  // Keep only the first message per field so the client gets a short list
  const errors = [];
  const seen = new Set();
  for (const error of result.array()) {
    const field = error.path || error.param || "request";
    if (!seen.has(field)) {
      seen.add(field);
      errors.push({ field, message: error.msg });
    }
  }

  return res.status(400).json({ message: "Validation failed", errors });
};

module.exports = validate;
