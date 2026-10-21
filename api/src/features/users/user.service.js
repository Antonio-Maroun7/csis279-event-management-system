/**
 * User service: business rules for profiles and admin user management.
 */
const bcrypt = require("bcrypt");
const AppError = require("../../shared/errors/AppError");
const UserRepository = require("./user.repository");
const UserDto = require("./user.dto");

const SALT_ROUNDS = 10;
const FOREIGN_KEY_VIOLATION = "23503";

/**
 * Handles user operations and DTO mapping.
 */
class UserService {
  /**
   * Returns the profile of the logged-in user.
   * @param {number} userId
   * @returns {Promise<Object>}
   * @throws {AppError} 404 when the account no longer exists.
   */
  static async getMe(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return UserDto.toResponseDto(user);
  }

  /**
   * Updates the first and last name of the logged-in user.
   * @param {number} userId
   * @param {{ first_name: string, last_name: string }} data
   * @returns {Promise<Object>}
   * @throws {AppError} 404 when the account no longer exists.
   */
  static async updateMe(userId, { first_name, last_name }) {
    const user = await UserRepository.updateProfile(userId, {
      first_name,
      last_name,
    });
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return UserDto.toResponseDto(user);
  }

  /**
   * Changes the password of the logged-in user after checking the current one.
   * Side effects: stores a new bcrypt hash.
   * @param {number} userId
   * @param {{ current_password: string, new_password: string }} data
   * @returns {Promise<void>}
   * @throws {AppError} 400 when the current password is wrong or the new one is the same.
   */
  static async changePassword(userId, { current_password, new_password }) {
    const user = await UserRepository.findByIdWithSecrets(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const matches = await bcrypt.compare(current_password, user.password_hash);
    if (!matches) {
      throw AppError.badRequest("Current password is incorrect");
    }

    if (current_password === new_password) {
      throw AppError.badRequest(
        "New password must be different from the current password",
      );
    }

    const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    await UserRepository.updatePassword(userId, password_hash);
  }

  /**
   * Admin: returns one page of users plus counts per role.
   * @param {{ search?: string, role?: string, page?: number, limit?: number }} filters
   * @returns {Promise<{ users: Object[], total: number, page: number, limit: number, total_pages: number, counts: Object }>}
   */
  static async listUsers({ search, role, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const [entities, total, counts] = await Promise.all([
      UserRepository.findAll({ search, role, limit, offset }),
      UserRepository.countAll({ search, role }),
      UserRepository.countByRole(),
    ]);

    return {
      users: UserDto.toListDto(entities),
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      counts,
    };
  }

  /**
   * Admin: returns one user.
   * @param {number} id
   * @returns {Promise<Object>}
   * @throws {AppError} 404 when the user does not exist.
   */
  static async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return UserDto.toResponseDto(user);
  }

  /**
   * Admin: changes the role of another user (e.g. attendee -> organizer).
   * @param {number} adminId - The admin doing the change.
   * @param {number} id - The user to change.
   * @param {string} role - attendee | organizer | admin
   * @returns {Promise<Object>}
   * @throws {AppError} 400 when admins try to change their own role, 404 when not found.
   */
  static async changeRole(adminId, id, role) {
    if (adminId === id) {
      throw AppError.badRequest("You cannot change your own role");
    }

    const user = await UserRepository.updateRole(id, role);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return UserDto.toResponseDto(user);
  }

  /**
   * Admin: deletes a user that has no active registrations and no events.
   * Side effects: deletes one users row.
   * @param {number} adminId - The admin doing the delete.
   * @param {number} id - The user to delete.
   * @returns {Promise<void>}
   * @throws {AppError} 400 (own account), 404 (not found), 409 (user still has data).
   */
  static async deleteUser(adminId, id) {
    if (adminId === id) {
      throw AppError.badRequest("You cannot delete your own account");
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if ((await UserRepository.countActiveRegistrations(id)) > 0) {
      throw AppError.conflict(
        "This user has active registrations and cannot be deleted",
      );
    }

    if ((await UserRepository.countOrganizedEvents(id)) > 0) {
      throw AppError.conflict(
        "This user organizes events and cannot be deleted",
      );
    }

    try {
      await UserRepository.delete(id);
    } catch (err) {
      // Old cancelled registrations or notifications still point to this user
      if (err.code === FOREIGN_KEY_VIOLATION) {
        throw AppError.conflict(
          "This user has registration history and cannot be deleted",
        );
      }
      throw err;
    }
  }
}

module.exports = UserService;