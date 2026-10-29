/**
 * Two-factor routes, mounted on /api/auth/2fa.
 */
const express = require("express");
const TwoFactorController = require("./twoFactor.controller");
const authenticate = require("../../shared/middleware/authenticate");
const {
  validateTotpCode,
  validateTotpOrBackupCode,
  validateVerify,
} = require("./twoFactor.validator");

const router = express.Router();

// Public: second step of the login (uses the temp_token, not a JWT header)
router.post("/verify", ...validateVerify, TwoFactorController.verify);

// Everything below needs a logged-in user
router.use(authenticate);

router.get("/status", TwoFactorController.status);
router.post("/setup", TwoFactorController.setup);
router.post("/enable", ...validateTotpCode, TwoFactorController.enable);
router.post(
  "/disable",
  ...validateTotpOrBackupCode,
  TwoFactorController.disable,
);
router.post(
  "/backup-codes",
  ...validateTotpCode,
  TwoFactorController.regenerateBackupCodes,
);

module.exports = router;
