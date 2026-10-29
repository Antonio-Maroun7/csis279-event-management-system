/**
 * JWT helper: signs and verifies tokens with the jsonwebtoken library.
 * - access token: full login, sent with every protected request
 * - two-factor token: short "temp_token" between the password step and the 2FA code step
 */
const jwt = require("jsonwebtoken");

const TWO_FACTOR_TOKEN_LIFETIME = "5m";

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
 * Creates the short-lived token returned by login when 2FA is on.
 * It only proves that the password was correct; it cannot call protected routes.
 * @param {{ id: number }} user
 * @returns {string}
 */
const signTwoFactorToken = (user) => {
  return jwt.sign({ id: user.id, type: "2fa" }, getSecret(), {
    expiresIn: TWO_FACTOR_TOKEN_LIFETIME,
  });
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

/**
 * Verifies a two-factor temp token.
 * @param {string} token
 * @returns {{ id: number, type: "2fa" }}
 * @throws {Error} When the token is invalid, expired or not a 2FA token.
 */
const verifyTwoFactorToken = (token) => {
  const payload = verifyToken(token); // Verify the token and get its payload
  if (payload.type !== "2fa") {
    throw new Error("Not a two-factor token");
  }
  return payload;
};

module.exports = {
  getSecret,
  signAccessToken,
  signTwoFactorToken,
  verifyToken,
  verifyTwoFactorToken,
};
