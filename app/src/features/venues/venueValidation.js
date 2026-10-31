import {
  collectErrors,
  maxLength,
  required,
} from "../../shared/utils/validators";

export const MAX_VENUE_CAPACITY = 100000;

/**
 * Capacity must be a whole number between 1 and 100000 (same rule as the backend).
 * @param {string|number} value
 * @returns {string|undefined}
 */
const capacity = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "Max capacity is required";

  const number = Number(text);
  if (!Number.isInteger(number) || number < 1 || number > MAX_VENUE_CAPACITY) {
    return `Max capacity must be a whole number between 1 and ${MAX_VENUE_CAPACITY}`;
  }
  return undefined;
};

// same rules as the backend (venues table: name 120, address 255, city 100)
export const validateVenue = (values) =>
  collectErrors({
    name:
      required(values.name, "Venue name") ||
      maxLength(values.name, 120, "Venue name"),
    address:
      required(values.address, "Address") ||
      maxLength(values.address, 255, "Address"),
    city: required(values.city, "City") || maxLength(values.city, 100, "City"),
    max_capacity: capacity(values.max_capacity),
  });
