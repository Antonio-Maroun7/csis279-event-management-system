/**
 * Validation chains for the two-factor endpoints (express-validator).
 */
const { body } = require("express-validator");
const validate = require("../../shared/middleware/validate");

const TOTP_CODE = /^\d{6}$/;
// a 6-digit code, or a backup code like K7QF-M2XA (dash optional)
const TOTP_OR_BACKUP_CODE = /^(\d{6}|[A-Za-z0-9]{4}-?[A-Za-z0-9]{4})$/;

const totpCodeRule = () =>
  body("code")
    .isString()
    .withMessage("Code is required")
    .bail()
    .trim()
    .matches(TOTP_CODE)
    .withMessage("Code must be exactly 6 digits");

const totpOrBackupCodeRule = () =>
  body("code")
    .isString()
    .withMessage("Code is required")
    .bail()
    .trim()
    .matches(TOTP_OR_BACKUP_CODE)
    .withMessage("Enter the 6-digit code or a backup code");

/**
 * POST /api/auth/2fa/enable and POST /api/auth/2fa/backup-codes
 * @type {Array<import("express").RequestHandler>}
 */
const validateTotpCode = [totpCodeRule(), validate];

/**
 * POST /api/auth/2fa/disable
 * @type {Array<import("express").RequestHandler>}
 */
const validateTotpOrBackupCode = [totpOrBackupCodeRule(), validate];

/**
 * POST /api/auth/2fa/verify
 * @type {Array<import("express").RequestHandler>}
 */
const validateVerify = [
  body("temp_token")
    .isString()
    .withMessage("temp_token is required")
    .bail()
    .notEmpty()
    .withMessage("temp_token is required"),
  totpOrBackupCodeRule(),
  validate,
];

module.exports = {
  validateTotpCode,
  validateTotpOrBackupCode,
  validateVerify,
};
