/**
 * Venue routes, mounted on /api/venues.
 * Reading is public (the event form and event pages need it);
 * creating, editing and deleting are for admins only.
 */
const express = require("express");
const VenueController = require("./venue.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateListVenues,
  validateVenueId,
  validateCreateVenue,
  validateUpdateVenue,
} = require("./venue.validator");

const router = express.Router();

// Public
router.get("/", ...validateListVenues, VenueController.listVenues);
router.get("/:id", ...validateVenueId, VenueController.getVenueById);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("admin"),
  ...validateCreateVenue,
  VenueController.createVenue,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  ...validateUpdateVenue,
  VenueController.updateVenue,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  ...validateVenueId,
  VenueController.deleteVenue,
);

module.exports = router;
