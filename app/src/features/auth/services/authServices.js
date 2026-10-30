import apiFetch from "../../../shared/api/apiFetch";

/**
 * POST /api/auth/register -> { message, token, user }
 */
export const register = (data) =>
  apiFetch("/auth/register", { method: "POST", body: data });

/**
 * POST /api/auth/login -> { message, token, user }
 */
export const login = (email, password) =>
  apiFetch("/auth/login", { method: "POST", body: { email, password } });

/**
 * GET /api/users/me -> the logged-in user (used to restore the session after a refresh)
 */
export const getCurrentUser = async () => {
  const data = await apiFetch("/users/me");
  return data.user;
};

/**
 * POST /api/auth/2fa/verify -> { token, user, used_backup_code, backup_codes_left? }
 * Second step of the login when 2FA is on.
 */
export const verifyTwoFactor = (tempToken, code) =>
  apiFetch("/auth/2fa/verify", {
    method: "POST",
    body: { temp_token: tempToken, code },
  });
