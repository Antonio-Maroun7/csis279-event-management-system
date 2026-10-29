/**
 * Two-factor controller: reads the request, calls TwoFactorService, sends JSON.
 */
const TwoFactorService = require("./twoFactor.service");

/**
 * Handles two-factor HTTP requests.
 */
class TwoFactorController {
  /**
   * GET /api/auth/2fa/status
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async status(req, res, next) {
    try {
      const status = await TwoFactorService.getStatus(req.user.id);
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/2fa/setup
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async setup(req, res, next) {
    try {
      const result = await TwoFactorService.setup(req.user.id);
      res
        .status(200)
        .json({ message: "Scan the QR code with your app", ...result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/2fa/enable
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async enable(req, res, next) {
    try {
      const result = await TwoFactorService.enable(req.user.id, req.body.code);
      res
        .status(200)
        .json({ message: "Two-factor authentication enabled", ...result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/2fa/verify (public, second step of the login)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async verify(req, res, next) {
    try {
      const result = await TwoFactorService.verifyLogin(
        req.body.temp_token,
        req.body.code,
      );
      res.status(200).json({ message: "Login successful", ...result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/2fa/disable
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async disable(req, res, next) {
    try {
      const user = await TwoFactorService.disable(req.user.id, req.body.code);
      res
        .status(200)
        .json({ message: "Two-factor authentication disabled", user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/2fa/backup-codes
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async regenerateBackupCodes(req, res, next) {
    try {
      const backupCodes = await TwoFactorService.regenerateBackupCodes(
        req.user.id,
        req.body.code,
      );
      res
        .status(200)
        .json({
          message: "New backup codes created",
          backup_codes: backupCodes,
        });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/:id/two-factor (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async adminReset(req, res, next) {
    try {
      const user = await TwoFactorService.adminReset(
        req.user.id,
        Number(req.params.id),
      );
      res
        .status(200)
        .json({ message: "Two-factor authentication was reset", user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TwoFactorController;
