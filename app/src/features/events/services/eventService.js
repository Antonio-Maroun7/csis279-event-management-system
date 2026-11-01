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
