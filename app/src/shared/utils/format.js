/**
 * Small display helpers shared by all features.
 */

export const getInitials = (firstName = "", lastName = "") =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

export const getFullName = (user) =>
  user ? `${user.first_name} ${user.last_name}` : "";

export const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

/**
 * 12500 -> "12,500"
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

/**
 * Builds "?a=1&b=2" from an object, skipping empty values.
 * @param {Object} params
 * @returns {string}
 */

export const toQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const text = query.toString();
  return text ? `?${text}` : "";
};
