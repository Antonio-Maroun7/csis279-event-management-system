/**
 * Registration controller: reads the request, calls RegistrationService, sends JSON.
 */
const { matchedData } = require("express-validator");
const RegistrationService = require("./registration.service");

/**
 * Handles registration, ticket and check-in HTTP requests.
 */
class RegistrationController {
  /**
   * POST /api/events/:eventId/register (attendee)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async register(req, res, next) {
    try {
      const registration = await RegistrationService.register(
        Number(req.params.eventId),
        req.user,
      );
      res.status(201).json({ message: "You are registered", registration });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/registrations/:id/cancel (attendee, own registration)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async cancelRegistration(req, res, next) {
    try {
      const registration = await RegistrationService.cancelRegistration(
        Number(req.params.id),
        req.user,
      );
      res.status(200).json({ message: "Registration cancelled", registration });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/registrations/me?status=&page=&limit= (attendee)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listMyRegistrations(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await RegistrationService.listMyRegistrations(
        req.user,
        filters,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/events/:eventId/my-registration (any logged-in user)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getMyRegistration(req, res, next) {
    try {
      const registration = await RegistrationService.getMyRegistration(
        Number(req.params.eventId),
        req.user,
      );
      res.status(200).json({ registration });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/events/:eventId/attendees?search=&checked_in=&page=&limit= (owner, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listAttendees(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await RegistrationService.listAttendees(
        Number(req.params.eventId),
        req.user,
        filters,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/events/:eventId/check-in (owner, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async checkIn(req, res, next) {
    try {
      const { ticket_code } = matchedData(req, { locations: ["body"] });
      const result = await RegistrationService.checkIn(
        Number(req.params.eventId),
        req.user,
        ticket_code,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RegistrationController;
