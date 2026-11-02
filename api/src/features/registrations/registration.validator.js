/**
 * Validation chains for the registration endpoints (express-validator).
 */
const { body, query } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  idParam,
  paginationRules,
} = require("../../shared/validators/common.validator");

const MY_STATUSES = ["upcoming", "past", "cancelled"];

/**
 * Routes with /:eventId (register, my-registration)
 * @type {Array<import("express").RequestHandler>}
 */
const validateEventIdParam = [idParam("eventId"), validate];

/**
 * Routes with /:id (cancel a registration)
 * @type {Array<import("express").RequestHandler>}
 */
const validateRegistrationId = [idParam("id"), validate];

/**
 * GET /api/registrations/me?status=&page=&limit=
 * @type {Array<import("express").RequestHandler>}
 */
const validateMyRegistrations = [
  query("status")
    .optional()
    .isIn(MY_STATUSES)
    .withMessage(`status must be one of: ${MY_STATUSES.join(", ")}`),
  ...paginationRules(),
  validate,
];

/**
 * GET /api/events/:eventId/attendees?search=&checked_in=&page=&limit=
 * @type {Array<import("express").RequestHandler>}
 */
const validateAttendees = [
  idParam("eventId"),
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  query("checked_in")
    .optional()
    .isIn(["true", "false"])
    .withMessage("checked_in must be true or false")
    .customSanitizer((value) => value === "true"),
  ...paginationRules(),
  validate,
];

/**
 * POST /api/events/:eventId/check-in
 * The code is trimmed and uppercased, so "evt-x8k2p9t " works.
 * @type {Array<import("express").RequestHandler>}
 */
const validateCheckIn = [
  idParam("eventId"),
  body("ticket_code")
    .isString()
    .withMessage("Ticket code is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Ticket code is required")
    .isLength({ max: 100 })
    .withMessage("Ticket code must be at most 100 characters long")
    .customSanitizer((value) => value.toUpperCase()),
  validate,
];

module.exports = {
  validateEventIdParam,
  validateRegistrationId,
  validateMyRegistrations,
  validateAttendees,
  validateCheckIn,
};
