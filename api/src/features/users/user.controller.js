/**
 * User controller: reads the request, calls UserService, sends JSON.
 */
const { matchedData } = require("express-validator");
const UserService = require("./user.service");

/**
 * Handles user HTTP requests.
 */
class UserController {
  /**
   * GET /api/users/me
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getMe(req, res, next) {
    try {
      const user = await UserService.getMe(req.user.id);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/me
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async updateMe(req, res, next) {
    try {
      const user = await UserService.updateMe(req.user.id, req.body);
      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/users/me/password
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async changePassword(req, res, next) {
    try {
      await UserService.changePassword(req.user.id, req.body);
      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users?search=&role=&page=&limit= (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listUsers(req, res, next) {
    try {
      // matchedData returns the validated + sanitized query values
      const filters = matchedData(req, { locations: ["query"] });
      const result = await UserService.listUsers(filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(Number(req.params.id));
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/users/:id/role (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async changeRole(req, res, next) {
    try {
      const user = await UserService.changeRole(
        req.user.id,
        Number(req.params.id),
        req.body.role,
      );
      res.status(200).json({ message: "Role updated successfully", user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.user.id, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
