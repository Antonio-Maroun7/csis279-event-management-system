/**
 * Custom application error that carries an HTTP status code.
 * Services throw AppError instances; the central errorHandler turns them
 * into JSON responses with the right status.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode - HTTP status code to send (400, 401, 403, 404, 409...).
   * @param {string} message - Human readable message returned to the client.
   * @param {Array<{ field: string, message: string }>} [errors] - Optional field-level details.
   */
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /**
   * 400 - the request data is not valid.
   * @param {string} [message]
   * @param {Array<{ field: string, message: string }>} [errors]
   * @returns {AppError}
   */
  static badRequest(message = "Bad Request", errors) {
    return new AppError(400, message, errors);
  }

  /**
   * 401 - the user is not logged in or the token is not valid.
   * @param {string} [message]
   * @returns {AppError}
   */
  static unauthorized(message = "Authentication required") {
    return new AppError(401, message);
  }

  /**
   * 403 - the user is logged in but not allowed to do this action.
   * @param {string} [message]
   * @returns {AppError}
   */
  static forbidden(message = "Access denied") {
    return new AppError(403, message);
  }

  /**
   * 404 - the requested item does not exist.
   * @param {string} [message]
   * @returns {AppError}
   */
  static notFound(message = "Resource not found ") {
    return new AppError(404, message);
  }

  /**
   * 409 - the request breaks a data rule (duplicate, full event, already cancelled...).
   * @param {string} [message]
   * @returns {AppError}
   */
  static conflict(message = "Conflict") {
    return new AppError(409, message);
  }
}

module.exports = AppError;
