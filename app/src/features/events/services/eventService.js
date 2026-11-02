import apiFetch from "../../../shared/api/apiFetch";
import { toQueryString } from "../../../shared/utils/format";

// ── Public ───────────────────────────────────────────────────

/** GET /api/events?search=&category_id=&city=&page=&limit= -> { events, total, page, limit, total_pages } */
export const getEvents = (filters) =>
  apiFetch(`/events${toQueryString(filters)}`);

/** GET /api/events/:id -> event (drafts only for the owner and admins) */
export const getEvent = async (id) => {
  const result = await apiFetch(`/events/${id}`);
  return result.event;
};

// ── Organizer / admin ────────────────────────────────────────

/** GET /api/events/manage?status=&search=&page=&limit= -> { events, total, page, limit, total_pages, counts, stats } */
export const getManagedEvents = (filters) =>
  apiFetch(`/events/manage${toQueryString(filters)}`);

/** POST /api/events -> created event (data.status: "draft" | "published") */
export const createEvent = async (data) => {
  const result = await apiFetch("/events", { method: "POST", body: data });
  return result.event;
};

/** PUT /api/events/:id -> updated event (all fields are sent) */
export const updateEvent = async (id, data) => {
  const result = await apiFetch(`/events/${id}`, { method: "PUT", body: data });
  return result.event;
};

/** PATCH /api/events/:id/publish -> published event */
export const publishEvent = async (id) => {
  const result = await apiFetch(`/events/${id}/publish`, { method: "PATCH" });
  return result.event;
};

/** PATCH /api/events/:id/cancel -> cancelled event */
export const cancelEvent = async (id) => {
  const result = await apiFetch(`/events/${id}/cancel`, { method: "PATCH" });
  return result.event;
};

/** DELETE /api/events/:id (drafts only) */
export const deleteEvent = (id) =>
  apiFetch(`/events/${id}`, { method: "DELETE" });
