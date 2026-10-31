/**
 * Like authenticate, but never blocks the request.
 * - valid access token  -> req.user is set
 * - no token / bad token -> the request continues as a visitor (req.user stays undefined)
 *
 * Used by public routes that show more to the owner, e.g. GET /api/events/:id
 * (a draft is visible to its organizer and to admins only).
 */
const { verifyToken } = require("../utils/jwt");

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const payload = verifyToken(authHeader.slice("Bearer ".length).trim());
    if (payload.type === "access") {
      req.user = {
        id: Number(payload.id),
        email: payload.email,
        role: payload.role,
      };
    }
  } catch {
    // expired or invalid token: continue as a visitor
  }
  return next();
};

module.exports = optionalAuthenticate;
