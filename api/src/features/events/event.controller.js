/**
 * Event controller: reads the request, calls EventService, sends JSON.
 */
const { matchedData } = require("express-validator");
const EventService = require("./event.service");

/**
 * Handles event HTTP requests.
 */
class EventController {
  /**
   * GET /api/events?search=&category_id=&city=&page=&limit= (public)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listPublishedEvents(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await EventService.listPublishedEvents(filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/events/manage?status=&search=&page=&limit= (organizer, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listManagedEvents(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await EventService.listManagedEvents(req.user, filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/events/:id (public; drafts only for the owner and admins)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getEventById(req, res, next) {
    try {
      const event = await EventService.getEventById(
        Number(req.params.id),
        req.user,
      );
      res.status(200).json({ event });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/events (organizer, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async createEvent(req, res, next) {
    try {
      const data = matchedData(req, { locations: ["body"] });
      const event = await EventService.createEvent(req.user, data);
      res.status(201).json({ message: "Event created successfully", event });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/events/:id (owner, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async updateEvent(req, res, next) {
    try {
      const data = matchedData(req, { locations: ["body"] });
      const event = await EventService.updateEvent(
        Number(req.params.id),
        req.user,
        data,
      );
      res.status(200).json({ message: "Event updated successfully", event });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/events/:id/publish (owner, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async publishEvent(req, res, next) {
    try {
      const event = await EventService.publishEvent(
        Number(req.params.id),
        req.user,
      );
      res.status(200).json({ message: "Event published successfully", event });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/events/:id/cancel (owner, admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async cancelEvent(req, res, next) {
    try {
      const event = await EventService.cancelEvent(
        Number(req.params.id),
        req.user,
      );
      res.status(200).json({ message: "Event cancelled", event });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/events/:id (owner, admin; drafts only)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async deleteEvent(req, res, next) {
    try {
      await EventService.deleteEvent(Number(req.params.id), req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EventController;
