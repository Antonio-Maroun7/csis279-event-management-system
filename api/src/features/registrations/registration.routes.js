/**
 * Registration routes, mounted on /api/registrations (attendee only).
 */
const express = require("express");
const RegistrationController = require("./registration.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateRegistrationId,
  validateMyRegistrations,
} = require("./registration.validator");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize("attendee"),
  ...validateMyRegistrations,
  RegistrationController.listMyRegistrations,
);
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("attendee"),
  ...validateRegistrationId,
  RegistrationController.cancelRegistration,
);

module.exports = router;
