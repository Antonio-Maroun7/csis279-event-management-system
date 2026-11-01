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
