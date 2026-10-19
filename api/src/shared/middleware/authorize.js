/**
 * Role-based access control. Must be used after authenticate.
 *
 * Usage:
 *   router.post("/", authenticate, authorize("admin"), ...)
 *   router.post("/", authenticate, authorize("organizer", "admin"), ...)
 *   router.post("/", authenticate, authorize(["organizer", "admin"]), ...)
 */
const AppError = require("../errors/AppError");

/**
 * @param {...(string|string[])} allowedRoles - Roles that may access the route.
 * @returns {import("express").RequestHandler}
 */
const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required")); // If the user is not authenticated, return an unauthorized error
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Required role: ${roles.join(" or ")}`,
        ),
      ); // If the user's role is not allowed, return a forbidden error
    }

    next(); // If the user's role is allowed, proceed to the next middleware
  };
};

module.exports = authorize;
