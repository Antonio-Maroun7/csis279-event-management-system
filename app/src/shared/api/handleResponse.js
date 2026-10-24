import ApiError from "./ApiError";

/**
 * Reads the API response.
 * - Success: returns the JSON body (or null for 204 No Content).
 * - Error: throws an ApiError with the message and the field errors sent by
 *   the backend ({ message, errors: [{ field, message }] }).
 */
const handleResponse = async (response) => {
  if (response.status === 204) {
    // No Content
    return null;
  }

  let data = null;
  try {
    data = await response.json(); // Parse JSON body
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Handle error responses
    const fieldErrors = {}; // Collect field-specific errors

    if (Array.isArray(data?.errors)) {
      // Process field-specific errors
      data.errors.forEach(({ field, message }) => {
        // Map each field error to the fieldErrors object
        if (field && !fieldErrors[field]) {
          // Only set the first error for each field
          fieldErrors[field] = message; // Set the error message for the field
        }
      });
    }

    // "Validation failed" alone is not helpful, so show the real reasons
    const details = Object.values(fieldErrors); // Extract error messages from fieldErrors
    const message = details.length // Construct the error message
      ? details.join(". ")
      : data?.message || "Request failed"; // Fallback error message if no field errors are present

    throw new ApiError(message, response.status, fieldErrors); // Throw an ApiError with the constructed message and field errors
  }

  return data;
};

export default handleResponse;
