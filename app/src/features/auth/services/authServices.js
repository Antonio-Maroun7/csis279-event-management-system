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
