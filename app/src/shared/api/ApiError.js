/**
 * Error thrown by apiFetch when the API answers with an error status.
 * - status: HTTP status code (400, 401, 403, 404, 409, 500...)
 * - fieldErrors: { first_name: "First name is required", ... } from validation errors
 */
class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export default ApiError;
