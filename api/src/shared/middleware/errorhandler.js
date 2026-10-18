/**
 * Central error handler. Every error passed to next(err) ends here and is
 * turned into one JSON format: { message, errors? }.
 */
const AppError = require("../errors/AppError");

/**
 * PostgreSQL error codes mapped to HTTP responses.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERRORS = {
  23505: { status: 409, message: "This record already exists" }, // unique_violation
  23503: {
    status: 409,
    message: "This record is linked to other data and cannot be changed",
  }, // foreign_key_violation
  23514: { status: 400, message: "A value breaks a data rule" }, // check_violation
  23502: { status: 400, message: "A required value is missing" }, // not_null_violation
  "22P02": { status: 400, message: "Invalid input value" }, // invalid_text_representation
  22003: { status: 400, message: "A number is out of range" }, // numeric_value_out_of_range
  22007: { status: 400, message: "Invalid date or time value" }, // invalid_datetime_format
  22008: { status: 400, message: "Date or time value is out of range" }, // datetime_field_overflow
};

/**
 * Express error-handling middleware (4 arguments).
 * @param {Error & { statusCode?: number, code?: string, type?: string, errors?: Array }} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {import("express").Response | void}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Errors we created on purpose in the services
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // Body sent by the client is not valid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }

  // Database rule violations
  if (err.code && PG_ERRORS[err.code]) {
    const { status, message } = PG_ERRORS[err.code];
    return res.status(status).json({ message });
  }

  // Anything else is unexpected: log it, but never show internal details
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
