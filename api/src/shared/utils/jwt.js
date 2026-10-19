/**
 * JWT helper: signs and verifies tokens with the jsonwebtoken library.
 */
const jwt = require("jsonwebtoken");

/**
 * Reads the signing secret from the environment.
 * @returns {string}
 * @throws {Error} When JWT_SECRET is missing.
 */

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in the .env file.");
  }
  return secret;
};

/**
 * Creates an access token for a logged-in user.
 * @param {{ id: number, email: string, role: string }} user
 * @returns {string}
 */
const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

/**
 * Verifies a token and returns its payload.
 * @param {string} token
 * @returns {Object} Decoded payload.
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */

const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = {
  getSecret,
  signAccessToken,
  verifyToken,
};
