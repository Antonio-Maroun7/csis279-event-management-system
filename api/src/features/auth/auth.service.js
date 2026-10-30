/**
 * Auth service: business rules for creating accounts and logging in.
 */
const bcrypt = require("bcrypt");
const AppError = require("../../shared/errors/AppError");
const {
  signAccessToken,
  signTwoFactorToken,
} = require("../../shared/utils/jwt");
const UserRepository = require("../users/user.repository");
const UserDto = require("../users/user.dto");

const SALT_ROUNDS = 10;

/**
 * Coordinates registration and login.
 */
class AuthService {
  /**
   * Builds the auth payload returned after a successful register or login.
   * @param {Object} user The user row (must include id and role).
   * @returns {{ token: string, user: Object }}
   */
  static buildAuthResponse(user) {
    const token = signAccessToken(user);
    return { token, user: UserDto.toResponseDto(user) };
  }

  /**
   * Creates a new attendee account and logs the user in.
   * Side effects: hashes the password and inserts a user row.
   * @param {{ first_name: string, last_name: string, email: string, password: string }} data
   * @returns {Promise<{ token: string, user: Object }>} A JWT and the new user (without password).
   * @throws {AppError} 409 when the email is already registered.
   */
  static async register({ first_name, last_name, email, password }) {
    if (await UserRepository.emailExists(email)) {
      throw AppError.conflict("Email is already registered");
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Public sign-up always creates an attendee; admins can change roles later
    const user = await UserRepository.create({
      first_name,
      last_name,
      email,
      password_hash,
      role: "attendee",
    });

    // Log the new user in right away
    return AuthService.buildAuthResponse(user);
  }

  /**
   * Checks the credentials and returns a JWT with the user.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: Object }>}
   * @throws {AppError} 401 when the email or password is wrong.
   */
  static async login({ email, password }) {
    const user = await UserRepository.findByEmailWithSecrets(email);

    // Same message for both cases so nobody can guess which emails exist
    const invalid = AppError.unauthorized("Invalid email or password");

    if (!user) {
      throw invalid;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw invalid;
    }

    if (user.two_factor_enabled) {
      return {
        requires_two_factor: true, // Indicates that the user needs to complete two-factor authentication
        temp_token: signTwoFactorToken(user), // Temporary token for the second step of two-factor authentication
      };
    }

    return AuthService.buildAuthResponse(user);
  }
}

module.exports = AuthService;
