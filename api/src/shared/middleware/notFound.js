/**
 * Catches every request that did not match a route.
 * Must be registered after all routes and before the errorHandler.
 */

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {import("express").Response}
 */

const notFound = (req, res) => {
  return res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

module.exports = notFound;
