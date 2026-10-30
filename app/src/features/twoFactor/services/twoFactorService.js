import apiFetch from "../../../shared/api/apiFetch";

/** GET /api/auth/2fa/status -> { enabled, backup_codes_left } */
export const getTwoFactorStatus = () => apiFetch("/auth/2fa/status");

/** POST /api/auth/2fa/setup -> { secret, otpauth_url, qr_code } */
export const startTwoFactorSetup = () =>
  apiFetch("/auth/2fa/setup", { method: "POST" });

/** POST /api/auth/2fa/enable -> { user, backup_codes } */
export const enableTwoFactor = (code) =>
  apiFetch("/auth/2fa/enable", { method: "POST", body: { code } });

/** POST /api/auth/2fa/disable -> { user } */
export const disableTwoFactor = (code) =>
  apiFetch("/auth/2fa/disable", { method: "POST", body: { code } });

/** POST /api/auth/2fa/backup-codes -> { backup_codes } */
export const regenerateBackupCodes = (code) =>
  apiFetch("/auth/2fa/backup-codes", { method: "POST", body: { code } });
