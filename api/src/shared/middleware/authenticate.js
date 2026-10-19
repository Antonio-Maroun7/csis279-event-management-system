/**
 * Authentication middleware: checks the JWT sent in the Authorization header
 * and attaches the user data to req.user.
 */
const AppError = require("../errors/AppError");
const { verifyToken } = require("../utils/jwt");

/**
 * Expects a header like: Authorization: Bearer <token>
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || ""; // Get the Authorization header, default to empty string if not present

  if (!authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Authentication required")); // If the header doesn't start with "Bearer ", return an unauthorized error
  }

  const token = authHeader.slice("Bearer ".length).trim(); // Extract the token part from the header

  try {
    const payload = verifyToken(token);

    // Only full access tokens can call protected routes
    if (payload.type !== "access") {
      return next(AppError.unauthorized("Invalid token")); // If the token is not an access token, return an unauthorized error
    }

    req.user = {
      id: Number(payload.id),
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(AppError.unauthorized("Token expired, please log in again")); // If the token has expired, return an unauthorized error
    }
    return next(AppError.unauthorized("Invalid token")); // If the token is invalid for any other reason, return an unauthorized error
  }
};
module.exports = authenticate;
