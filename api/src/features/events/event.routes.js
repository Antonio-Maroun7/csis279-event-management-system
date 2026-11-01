/**
 * Event routes, mounted on /api/events.
 * /manage must stay above /:id, otherwise Express reads "manage" as an id.
 */
const express = require("express");
const EventController = require("./event.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const optionalAuthenticate = require("../../shared/middleware/optionalAuthenticate");
const {
  validateListEvents,
  validateManagedEvents,
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
} = require("./event.validator");

const router = express.Router();

// Public
router.get("/", ...validateListEvents, EventController.listPublishedEvents);

// Organizer / admin dashboard
router.get(
  "/manage",
  authenticate,
  authorize("organizer", "admin"),
  ...validateManagedEvents,
  EventController.listManagedEvents,
);

// Public, but the owner and admins can also open drafts
router.get(
  "/:id",
  optionalAuthenticate,
  ...validateEventId,
  EventController.getEventById,
);

// Organizer / admin (the service checks that the event is theirs)
router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  ...validateCreateEvent,
  EventController.createEvent,
);
router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  ...validateUpdateEvent,
  EventController.updateEvent,
);
router.patch(
  "/:id/publish",
  authenticate,
  authorize("organizer", "admin"),
  ...validateEventId,
  EventController.publishEvent,
);
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("organizer", "admin"),
  ...validateEventId,
  EventController.cancelEvent,
);
router.delete(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  ...validateEventId,
  EventController.deleteEvent,
);

module.exports = router;
