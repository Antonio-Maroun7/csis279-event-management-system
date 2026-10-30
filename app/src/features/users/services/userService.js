import apiFetch from "../../../shared/api/apiFetch";
import { toQueryString } from "../../../shared/utils/format";

// ── Logged-in user ───────────────────────────────────────────

/** PUT /api/users/me -> updated user */
export const updateMyProfile = async (data) => {
  const result = await apiFetch("/users/me", { method: "PUT", body: data });
  return result.user;
};

/** PATCH /api/users/me/password */
export const changeMyPassword = (data) =>
  apiFetch("/users/me/password", { method: "PATCH", body: data });

// ── Admin ────────────────────────────────────────────────────

/** GET /api/users?search=&role=&page=&limit= -> { users, total, page, total_pages, counts } */
export const getUsers = (filters) =>
  apiFetch(`/users${toQueryString(filters)}`);

/** PATCH /api/users/:id/role -> updated user */
export const changeUserRole = async (id, role) => {
  const result = await apiFetch(`/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
  return result.user;
};

/** DELETE /api/users/:id */
export const deleteUser = (id) =>
  apiFetch(`/users/${id}`, { method: "DELETE" });

/** DELETE /api/users/:id/two-factor -> { user } (admin resets a user's 2FA) */
export const resetUserTwoFactor = async (id) => {
  const result = await apiFetch(`/users/${id}/two-factor`, {
    method: "DELETE",
  });
  return result.user;
};
