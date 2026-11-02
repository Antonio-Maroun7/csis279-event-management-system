/**
 * Ticket code generator: "EVT-" + 7 characters, e.g. EVT-X8K2P9T.
 * The alphabet has no 0, O, 1 or I so a code can be read aloud or typed
 * without mistakes. crypto.randomInt is a secure random source (Math.random is not).
 */
const crypto = require("crypto");

const PREFIX = "EVT-";
const CODE_LENGTH = 7;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates one random ticket code.
 * @returns {string} e.g. "EVT-X8K2P9T"
 */
const generateTicketCode = () => {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return `${PREFIX}${code}`;
};

module.exports = { generateTicketCode };
