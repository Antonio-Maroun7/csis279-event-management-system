import apiFetch from "../../../shared/api/apiFetch";
import { toQueryString } from "../../../shared/utils/format";

// ── Public ───────────────────────────────────────────────────

/** GET /api/venues?search=&city= -> { venues, total } */
export const getVenues = (filters) =>
  apiFetch(`/venues${toQueryString(filters)}`);

// ── Admin ────────────────────────────────────────────────────

/** POST /api/venues -> created venue */
export const createVenue = async (data) => {
  const result = await apiFetch("/venues", { method: "POST", body: data });
  return result.venue;
};

/** PUT /api/venues/:id -> updated venue (all fields are sent) */
export const updateVenue = async (id, data) => {
  const result = await apiFetch(`/venues/${id}`, { method: "PUT", body: data });
  return result.venue;
};

/** DELETE /api/venues/:id (fails with 409 when events use it) */
export const deleteVenue = (id) =>
  apiFetch(`/venues/${id}`, { method: "DELETE" });
