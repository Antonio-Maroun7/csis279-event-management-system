/**
 * Registration routes nested under an event, mounted on /api/events/:eventId.
 * mergeParams makes req.params.eventId available here.
 * Only these four paths are handled; every other /api/events/... request
 * falls through to the normal event routes.
 */
const express = require("express");
const RegistrationController = require("./registration.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateEventIdParam,
  validateAttendees,
  validateCheckIn,
} = require("./registration.validator");

const router = express.Router({ mergeParams: true });

// Attendee
router.post(
  "/register",
  authenticate,
  authorize("attendee"),
  ...validateEventIdParam,
  RegistrationController.register,
);

// Any logged-in user
router.get(
  "/my-registration",
  authenticate,
  ...validateEventIdParam,
  RegistrationController.getMyRegistration,
);

// Organizer / admin (the service checks that the event is theirs)
router.get(
  "/attendees",
  authenticate,
  authorize("organizer", "admin"),
  ...validateAttendees,
  RegistrationController.listAttendees,
);
router.post(
  "/check-in",
  authenticate,
  authorize("organizer", "admin"),
  ...validateCheckIn,
  RegistrationController.checkIn,
);

module.exports = router;
