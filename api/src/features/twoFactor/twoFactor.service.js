/**
 * Two-factor service: TOTP setup, login verification, backup codes.
 * TOTP = time-based one-time password (the 6-digit code that changes every 30 seconds
 * in Google Authenticator, Microsoft Authenticator, Authy...).
 */
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const AppError = require("../../shared/errors/AppError");
const { encrypt, decrypt } = require("../../shared/utils/encryption");
const {
  signAccessToken,
  verifyTwoFactorToken,
} = require("../../shared/utils/jwt");
const UserRepository = require("../users/user.repository");
const UserDto = require("../users/user.dto");
const BackupCodeRepository = require("./backupCode.repository");

const ISSUER = "EventFlow";
const BACKUP_CODE_COUNT = 10;
// no 0/O or 1/I so codes are easy to read
const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Builds one random backup code like "K7QF-M2XA".
 * @returns {string}
 */
const generateBackupCode = () => {
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (const byte of bytes) {
    code += BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
};

/**
 * "k7qf m2xa" and "K7QF-M2XA" must give the same hash.
 * @param {string} code
 * @returns {string}
 */
const hashBackupCode = (code) => {
  const normalized = code.replace(/[\s-]/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

const isTotpCode = (code) => /^\d{6}$/.test(code);

/**
 * Handles two-factor authentication rules.
 */
class TwoFactorService {
  /**
   * Checks a 6-digit code against the user's secret.
   * window: 1 also accepts the previous and next 30-second code (small clock differences).
   * @param {string} encryptedSecret
   * @param {string} code
   * @returns {boolean}
   */
  static verifyTotp(encryptedSecret, code) {
    return speakeasy.totp.verify({
      secret: decrypt(encryptedSecret),
      encoding: "base32",
      token: code,
      window: 1,
    });
  }

  /**
   * Accepts a 6-digit authenticator code OR an unused backup code.
   * A backup code is marked as used immediately.
   * @param {import("../users/user.entity")} user
   * @param {string} code
   * @returns {Promise<"totp"|"backup"|null>} How the user was verified, or null.
   */
  static async checkCode(user, code) {
    if (isTotpCode(code)) {
      return TwoFactorService.verifyTotp(user.two_factor_secret, code)
        ? "totp"
        : null;
    }
    const used = await BackupCodeRepository.useCode(
      user.id,
      hashBackupCode(code),
    );
    return used ? "backup" : null;
  }

  /**
   * Creates 10 new backup codes (old ones stop working).
   * @param {number} userId
   * @returns {Promise<string[]>} The plain codes, shown to the user only once.
   */
  static async createBackupCodes(userId) {
    const codes = Array.from({ length: BACKUP_CODE_COUNT }, generateBackupCode);
    await BackupCodeRepository.replaceForUser(
      userId,
      codes.map(hashBackupCode),
    );
    return codes;
  }

  /**
   * @param {number} userId
   * @returns {Promise<import("../users/user.entity")>}
   * @throws {AppError} 404 when the account no longer exists.
   */
  static async getUserWithSecrets(userId) {
    const user = await UserRepository.findByIdWithSecrets(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  }

  /**
   * GET /api/auth/2fa/status
   * @param {number} userId
   * @returns {Promise<{ enabled: boolean, backup_codes_left: number }>}
   */
  static async getStatus(userId) {
    const user = await TwoFactorService.getUserWithSecrets(userId);
    const backupCodesLeft = user.two_factor_enabled
      ? await BackupCodeRepository.countUnused(userId)
      : 0;

    return {
      enabled: user.two_factor_enabled,
      backup_codes_left: backupCodesLeft,
    };
  }

  /**
   * Step 1 of turning 2FA on: creates a secret and a QR code to scan.
   * 2FA is NOT active until the user confirms a code with enable().
   * Side effects: saves the encrypted secret.
   * @param {number} userId
   * @returns {Promise<{ secret: string, otpauth_url: string, qr_code: string }>}
   * @throws {AppError} 409 when 2FA is already on.
   */
  static async setup(userId) {
    const user = await TwoFactorService.getUserWithSecrets(userId);
    if (user.two_factor_enabled) {
      throw AppError.conflict("Two-factor authentication is already enabled");
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      encoding: "base32",
      label: user.email,
      issuer: ISSUER,
    });

    await UserRepository.saveTwoFactorSecret(userId, encrypt(secret.base32));

    return {
      secret: secret.base32,
      otpauth_url: otpauthUrl,
      qr_code: await QRCode.toDataURL(otpauthUrl), // "data:image/png;base64,..."
    };
  }

  /**
   * Step 2: the user types a code from the app. If it is correct, 2FA is turned on
   * and 10 backup codes are created.
   * @param {number} userId
   * @param {string} code
   * @returns {Promise<{ user: Object, backup_codes: string[] }>}
   * @throws {AppError} 409 already on, 400 setup not started or wrong code.
   */
  static async enable(userId, code) {
    const user = await TwoFactorService.getUserWithSecrets(userId);

    if (user.two_factor_enabled) {
      throw AppError.conflict("Two-factor authentication is already enabled");
    }
    if (!user.two_factor_secret) {
      throw AppError.badRequest("Start the setup first to get a QR code");
    }
    if (!TwoFactorService.verifyTotp(user.two_factor_secret, code)) {
      throw AppError.badRequest(
        "The code is not correct. Try the newest code in your app",
      );
    }

    const backupCodes = await TwoFactorService.createBackupCodes(userId);
    const updated = await UserRepository.enableTwoFactor(userId);

    return { user: UserDto.toResponseDto(updated), backup_codes: backupCodes };
  }

  /**
   * Second step of the login: checks the temp_token + the code and returns the real JWT.
   * @param {string} tempToken
   * @param {string} code 6-digit code or backup code
   * @returns {Promise<{ token: string, user: Object, used_backup_code: boolean, backup_codes_left?: number }>}
   * @throws {AppError} 401 when the temp token expired or the code is wrong.
   */
  static async verifyLogin(tempToken, code) {
    const expired = AppError.unauthorized(
      "Your sign-in session expired. Please sign in again",
    );

    let payload;
    try {
      payload = verifyTwoFactorToken(tempToken);
    } catch {
      throw expired;
    }

    const user = await UserRepository.findByIdWithSecrets(payload.id);
    if (!user || !user.two_factor_enabled) {
      throw expired;
    }

    const method = await TwoFactorService.checkCode(user, code);
    if (!method) {
      throw AppError.unauthorized("Invalid verification code");
    }

    const result = {
      token: signAccessToken(user),
      user: UserDto.toResponseDto(user),
      used_backup_code: method === "backup",
    };

    if (method === "backup") {
      result.backup_codes_left = await BackupCodeRepository.countUnused(
        user.id,
      );
    }

    return result;
  }

  /**
   * Turns 2FA off after checking a code (authenticator or backup code).
   * Side effects: clears the secret and deletes the backup codes.
   * @param {number} userId
   * @param {string} code
   * @returns {Promise<Object>} The updated user.
   * @throws {AppError} 409 when 2FA is not on, 400 wrong code.
   */
  static async disable(userId, code) {
    const user = await TwoFactorService.getUserWithSecrets(userId);
    if (!user.two_factor_enabled) {
      throw AppError.conflict("Two-factor authentication is not enabled");
    }

    // 400 (not 401): the user is logged in, only the code is wrong
    if (!(await TwoFactorService.checkCode(user, code))) {
      throw AppError.badRequest("The code is not correct");
    }

    await BackupCodeRepository.deleteForUser(userId);
    const updated = await UserRepository.clearTwoFactor(userId);
    return UserDto.toResponseDto(updated);
  }

  /**
   * Replaces all backup codes after checking a 6-digit authenticator code.
   * @param {number} userId
   * @param {string} code
   * @returns {Promise<string[]>}
   * @throws {AppError} 409 when 2FA is not on, 400 wrong code.
   */
  static async regenerateBackupCodes(userId, code) {
    const user = await TwoFactorService.getUserWithSecrets(userId);
    if (!user.two_factor_enabled) {
      throw AppError.conflict("Two-factor authentication is not enabled");
    }
    if (!TwoFactorService.verifyTotp(user.two_factor_secret, code)) {
      throw AppError.badRequest("The code is not correct");
    }

    return TwoFactorService.createBackupCodes(userId);
  }

  /**
   * Admin: turns 2FA off for a user who lost their phone and their backup codes.
   * @param {number} adminId
   * @param {number} userId
   * @returns {Promise<Object>} The updated user.
   * @throws {AppError} 400 own account, 404 not found, 409 2FA not on.
   */
  static async adminReset(adminId, userId) {
    if (adminId === userId) {
      throw AppError.badRequest(
        "Use your own security settings to change your 2FA",
      );
    }

    const user = await TwoFactorService.getUserWithSecrets(userId);
    if (!user.two_factor_enabled) {
      throw AppError.conflict(
        "Two-factor authentication is not enabled for this user",
      );
    }

    await BackupCodeRepository.deleteForUser(userId);
    const updated = await UserRepository.clearTwoFactor(userId);
    return UserDto.toResponseDto(updated);
  }
}

module.exports = TwoFactorService;
