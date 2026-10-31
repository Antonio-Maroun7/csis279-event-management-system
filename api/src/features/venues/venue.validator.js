/**
 * Validation chains for the venues endpoints (express-validator).
 * Lengths match the venues table: name 120, address 255, city 100.
 */
const { body, query } = require("express-validator");
const validate = require("../../shared/middleware/validate");
const {
  idParam,
  requiredText,
} = require("../../shared/validators/common.validator");

/** Biggest venue we accept (keeps the number far below the INTEGER limit). */
const MAX_VENUE_CAPACITY = 100000;

/**
 * Fields sent when creating or updating a venue.
 * @returns {Array<import("express-validator").ValidationChain>}
 */
const venueBodyRules = () => [
  requiredText("name", "Venue name", 120),
  requiredText("address", "Address", 255),
  requiredText("city", "City", 100),
  body("max_capacity")
    .isInt({ min: 1, max: MAX_VENUE_CAPACITY })
    .withMessage(
      `Max capacity must be a whole number between 1 and ${MAX_VENUE_CAPACITY}`,
    )
    .toInt(),
];

/**
 * GET /api/venues?search=&city=
 * @type {Array<import("express").RequestHandler>}
 */
const validateListVenues = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be at most 100 characters"),
  query("city")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("city must be at most 100 characters"),
  validate,
];

/**
 * Routes with /:id
 * @type {Array<import("express").RequestHandler>}
 */
const validateVenueId = [idParam("id"), validate];

/**
 * POST /api/venues
 * @type {Array<import("express").RequestHandler>}
 */
const validateCreateVenue = [...venueBodyRules(), validate];

/**
 * PUT /api/venues/:id (all fields are sent, like the edit form)
 * @type {Array<import("express").RequestHandler>}
 */
const validateUpdateVenue = [idParam("id"), ...venueBodyRules(), validate];

module.exports = {
  validateListVenues,
  validateVenueId,
  validateCreateVenue,
  validateUpdateVenue,
};
