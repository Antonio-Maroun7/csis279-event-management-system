/**
 * Client-side validation rules. They mirror the backend rules so the user
 * sees the problem before the request is sent (the backend still checks again).
 * Each rule returns an error message, or undefined when the value is valid.
 */

export const required = (value, label) =>
  !String(value ?? "").trim() ? `${label} is required` : undefined;

export const maxLength = (value, max, label) =>
  String(value ?? "").trim().length > max
    ? `${label} must be at most ${max} characters`
    : undefined;

export const email = (value) => {
  if (!String(value ?? "").trim()) return "Email is required";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? undefined
    : "Email is not valid";
};

export const password = (value) => {
  if (!value) return "Password is required";
  if (value.length < 8 || value.length > 72)
    return "Password must be between 8 and 72 characters";
  if (!/[A-Za-z]/.test(value))
    return "Password must contain at least one letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  return undefined;
};

/**
 * Keeps only the fields that have an error.
 * @param {Object<string, string|undefined>} errors
 * @returns {Object<string, string>}
 */
export const collectErrors = (errors) =>
  Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  );
