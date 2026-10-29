/**
 * Auth controller: reads the request, calls AuthService, sends JSON.
 */
const AuthService = require("./auth.service");

/**
 * Handles authentication HTTP requests.
 */
class AuthController {
  /**
   * POST /api/auth/register
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res
        .status(201)
        .json({ message: "Account created successfully", ...result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
    static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      const message = result.requires_two_factor
        ? "Enter your two-factor code to continue"
        : "Login successful";
      res.status(200).json({ message, ...result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
