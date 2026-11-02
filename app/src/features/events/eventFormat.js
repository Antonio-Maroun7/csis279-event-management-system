/**
 * Display helpers used by the event components.
 */

/**
 * 0 -> "Free", 10 -> "$10", 12.5 -> "$12.50"
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  const value = Number(price) || 0;
  if (value === 0) return "Free";
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
};

/**
 * Day and short month for the date box on the event cover: { day: "24", month: "OCT" }
 * @param {string|Date} value
 * @returns {{ day: string, month: string }}
 */
export const getDateParts = (value) => {
  const date = new Date(value);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  };
};

/**
 * Percentage of seats taken, for the progress bar (0-100).
 * @param {{ seats_taken: number, capacity: number }} event
 * @returns {number}
 */
export const getSeatsPercent = ({ seats_taken, capacity }) =>
  capacity > 0 ? Math.min(100, Math.round((seats_taken / capacity) * 100)) : 0;

/** Badge color and label for each event status. */
export const EVENT_STATUS = {
  draft: { label: "Draft", color: "slate" },
  published: { label: "Published", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
  completed: { label: "Completed", color: "blue" },
};

/**
 * ISO date from the API -> value of an <input type="datetime-local">
 * ("2026-11-10T10:00", in the user's own time zone).
 * @param {string} iso
 * @returns {string}
 */
export const toDateTimeLocal = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * true when the organizer can still edit, publish or cancel the event.
 * @param {{ status: string, is_past: boolean }} event
 * @returns {boolean}
 */
export const isEditable = (event) =>
  ["draft", "published"].includes(event.status) && !event.is_past;

/**
 * Hint under the "Upcoming" stat: "Next event today", "Next in 6 days"...
 * @param {string|null} nextStartTime
 * @returns {string}
 */
export const formatNextEvent = (nextStartTime) => {
  if (!nextStartTime) return "Nothing scheduled";

  const startOfDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const days = Math.round(
    (startOfDay(nextStartTime) - startOfDay(new Date())) / 86400000,
  );

  if (days <= 0) return "Next event today";
  if (days === 1) return "Next event tomorrow";
  return `Next in ${days} days`;
};
