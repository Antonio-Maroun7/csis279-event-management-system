import {
  collectErrors,
  maxLength,
  required,
} from "../../shared/utils/validators";

export const MAX_EVENT_CAPACITY = 100000;
export const MAX_PRICE = 100000;

/**
 * Checks the event form (same rules as the backend).
 * @param {Object} values - form values (strings)
 * @param {{ venue?: { max_capacity: number }, startMustBeFuture: boolean }} options
 *   venue: the selected venue, startMustBeFuture: false when editing a running event
 * @returns {Object<string, string>} field -> message
 */
export const validateEvent = (values, { venue, startMustBeFuture }) => {
  const capacity = Number(values.capacity);
  const price = String(values.price).trim();
  const start = new Date(values.start_time);
  const end = new Date(values.end_time);

  let capacityError;
  if (!String(values.capacity).trim()) {
    capacityError = "Capacity is required";
  } else if (
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > MAX_EVENT_CAPACITY
  ) {
    capacityError = `Capacity must be a whole number between 1 and ${MAX_EVENT_CAPACITY}`;
  } else if (venue && capacity > venue.max_capacity) {
    capacityError = `Capacity cannot be more than the venue capacity (${venue.max_capacity} seats)`;
  }

  let startError;
  if (!values.start_time) {
    startError = "Start time is required";
  } else if (startMustBeFuture && start <= new Date()) {
    startError = "Start time must be in the future";
  }

  let endError;
  if (!values.end_time) {
    endError = "End time is required";
  } else if (values.start_time && end <= start) {
    endError = "End time must be after the start time";
  }

  let priceError;
  if (!price) {
    priceError = "Price is required (use 0 for a free event)";
  } else if (
    Number.isNaN(Number(price)) ||
    Number(price) < 0 ||
    Number(price) > MAX_PRICE
  ) {
    priceError = `Price must be a number between 0 and ${MAX_PRICE}`;
  }

  return collectErrors({
    title:
      required(values.title, "Event title") ||
      maxLength(values.title, 120, "Event title"),
    category_id: values.category_id ? undefined : "Category is required",
    venue_id: values.venue_id ? undefined : "Venue is required",
    description: maxLength(values.description, 5000, "Description"),
    capacity: capacityError,
    start_time: startError,
    end_time: endError,
    price: priceError,
  });
};
