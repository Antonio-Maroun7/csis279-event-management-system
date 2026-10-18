/**
 * Health controller: tells whether the API and the database are running.
 */
const HealthRepository = require("./health.repository");

/**
 * Handles health check requests.
 */
class HealthController {
  /**
   * GET /api/health
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async check(req, res, next) {
    try {
      const databaseTime = await HealthRepository.getDatabaseTime();
      res.status(200).json({
        status: "ok",
        database: "connected",
        databaseTime,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = HealthController;
