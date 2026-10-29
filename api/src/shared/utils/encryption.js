/**
 * Encrypts small secrets before they are saved in the database
 * (used for users.two_factor_secret, which must be "encrypted at rest").
 * Algorithm: AES-256-GCM. Stored format: "iv:authTag:cipherText" (base64 parts).
 */
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

/**
 * Builds a 32-byte key from TWO_FACTOR_ENCRYPTION_KEY (or JWT_SECRET as a fallback).
 * Do not change the key after users enabled 2FA, or their secrets can't be read.
 * @returns {Buffer}
 */
const getKey = () => {
  const source =
    process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY is not set in the .env file.");
  }
  return crypto.createHash("sha256").update(source).digest();
};

/**
 * @param {string} plainText
 * @returns {string} "iv:authTag:cipherText"
 */
const encrypt = (plainText) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted]
    .map((part) => part.toString("base64"))
    .join(":");
};

/**
 * @param {string} payload "iv:authTag:cipherText"
 * @returns {string} The original text.
 */
const decrypt = (payload) => {
  const [iv, authTag, encrypted] = payload
    .split(":")
    .map((part) => Buffer.from(part, "base64"));

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
};

module.exports = {
  encrypt,
  decrypt,
};
