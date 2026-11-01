/**
 * Validation chains for the events endpoints (express-validator).
 * Lengths and limits match the events table (title VARCHAR(120), price NUMERIC(10,2)).
 */
const { body, query } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  MAX_INT,
  idParam,
  requiredText,
  paginationRules,
} = require("../../shared/validators/common.validator");

const MAX_EVENT_CAPACITY = 100000;
const MAX_PRICE = 100000;
const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"];

/**
 * Fields sent when creating or updating an event.
 * @returns {Array<import("express-validator").ValidationChain>}
 */
const eventBodyRules = () => [
  requiredText("title", "Event title", 120),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must be at most 5000 characters long"),
  body("category_id")
    .isInt({ min: 1, max: MAX_INT })
    .withMessage("Category is required")
    .toInt(),
  body("venue_id")
    .isInt({ min: 1, max: MAX_INT })
    .withMessage("Venue is required")
    .toInt(),
  body("start_time")
    .isISO8601()
    .withMessage("Start time must be a valid date and time"),
  body("end_time")
    .isISO8601()
    .withMessage("End time must be a valid date and time")
    .bail()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_time)) {
        throw new Error("End time must be after the start time");
      }
      return true;
    }),
  body("capacity")
    .isInt({ min: 1, max: MAX_EVENT_CAPACITY })
    .withMessage(
      `Capacity must be a whole number between 1 and ${MAX_EVENT_CAPACITY}`,
    )
    .toInt(),
  body("price")
    .isFloat({ min: 0, max: MAX_PRICE })
    .withMessage(`Price must be a number between 0 and ${MAX_PRICE}`)
    .toFloat(),
];

/**
 * GET /api/events?search=&category_id=&city=&page=&limit=
 * @type {Array<import("express").RequestHandler>}
 */
const validateListEvents = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  query("category_id")
    .optional()
    .isInt({ min: 1, max: MAX_INT })
    .withMessage("category_id must be a positive integer")
    .toInt(),
  query("city")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("city must be at most 100 characters"),
  ...paginationRules(),
  validate,
];

/**
 * GET /api/events/manage?status=&search=&page=&limit=
 * @type {Array<import("express").RequestHandler>}
 */
const validateManagedEvents = [
  query("status")
    .optional()
    .isIn(EVENT_STATUSES)
    .withMessage(`status must be one of: ${EVENT_STATUSES.join(", ")}`),
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  ...paginationRules(),
  validate,
];

/**
 * Routes with /:id
 * @type {Array<import("express").RequestHandler>}
 */
const validateEventId = [idParam("id"), validate];

/**
 * POST /api/events (status: save as draft or publish directly)
 * @type {Array<import("express").RequestHandler>}
 */
const validateCreateEvent = [
  ...eventBodyRules(),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("status must be draft or published"),
  validate,
];

/**
 * PUT /api/events/:id (the status changes with /publish and /cancel)
 * @type {Array<import("express").RequestHandler>}
 */
const validateUpdateEvent = [idParam("id"), ...eventBodyRules(), validate];

module.exports = {
  validateListEvents,
  validateManagedEvents,
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
};
