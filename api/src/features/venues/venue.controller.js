/**
 * Venue controller: reads the request, calls VenueService, sends JSON.
 */
const { matchedData } = require("express-validator");
const VenueService = require("./venue.service");

/**
 * Handles venue HTTP requests.
 */
class VenueController {
  /**
   * GET /api/venues?search=&city= (public)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listVenues(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await VenueService.listVenues(filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/venues/:id (public)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getVenueById(req, res, next) {
    try {
      const venue = await VenueService.getVenueById(Number(req.params.id));
      res.status(200).json({ venue });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/venues (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async createVenue(req, res, next) {
    try {
      const data = matchedData(req, { locations: ["body"] });
      const venue = await VenueService.createVenue(data);
      res.status(201).json({ message: "Venue created successfully", venue });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/venues/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async updateVenue(req, res, next) {
    try {
      const data = matchedData(req, { locations: ["body"] });
      const venue = await VenueService.updateVenue(Number(req.params.id), data);
      res.status(200).json({ message: "Venue updated successfully", venue });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/venues/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async deleteVenue(req, res, next) {
    try {
      await VenueService.deleteVenue(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VenueController;
