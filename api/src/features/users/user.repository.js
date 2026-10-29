/**
 * Repository for the users table. Only this layer writes SQL for users.
 */
const pool = require("../../config/db");
const UserEntity = require("./user.entity");

/** Columns that are safe to return in normal reads (no secrets). */
const PUBLIC_COLUMNS = `
  id, first_name, last_name, email, role,
  two_factor_enabled, created_at, updated_at
`;

/**
 * Builds the WHERE part used by the admin users list.
 * @param {{ search?: string, role?: string }} filters
 * @returns {{ where: string, params: Array<string> }}
 */
const buildUserFilters = ({ search, role } = {}) => {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(first_name ILIKE $${params.length}
        OR last_name ILIKE $${params.length}
        OR email ILIKE $${params.length}
        OR (first_name || ' ' || last_name) ILIKE $${params.length})`,
    );
  }

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
};

/**
 * Executes user SQL queries.
 */
class UserRepository {
  /**
   * Finds a user by email, including the password hash and 2FA fields.
   * Used only by the auth service for login.
   * @param {string} email
   * @returns {Promise<UserEntity|null>}
   */
  static async findByEmailWithSecrets(email) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}, password_hash, two_factor_secret
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Finds a user by id, including the password hash and 2FA fields.
   * @param {number} id
   * @returns {Promise<UserEntity|null>}
   */
  static async findByIdWithSecrets(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}, password_hash, two_factor_secret
       FROM users
       WHERE id = $1`,
      [id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Checks if an email is already used.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async emailExists(email) {
    const { rows } = await pool.query(
      "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
      [email],
    );
    return rows.length > 0;
  }

  /**
   * Finds one user by id (no secrets).
   * @param {number} id
   * @returns {Promise<UserEntity|null>}
   */
  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}
       FROM users
       WHERE id = $1`,
      [id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Returns one page of users, newest first, with optional search and role filter.
   * @param {{ search?: string, role?: string, limit: number, offset: number }} options
   * @returns {Promise<UserEntity[]>}
   */
  static async findAll({ search, role, limit, offset }) {
    const { where, params } = buildUserFilters({ search, role });
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}
       FROM users
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return UserEntity.fromRows(rows);
  }

  /**
   * Counts the users that match the same filters as findAll.
   * @param {{ search?: string, role?: string }} filters
   * @returns {Promise<number>}
   */
  static async countAll({ search, role }) {
    const { where, params } = buildUserFilters({ search, role });
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users ${where}`,
      params,
    );
    return rows[0].total;
  }

  /**
   * Counts users per role (used by the admin dashboard).
   * @returns {Promise<{ attendee: number, organizer: number, admin: number, total: number }>}
   */
  static async countByRole() {
    const { rows } = await pool.query(
      "SELECT role, COUNT(*)::int AS count FROM users GROUP BY role",
    );
    const counts = { attendee: 0, organizer: 0, admin: 0, total: 0 };
    for (const row of rows) {
      counts[row.role] = row.count;
      counts.total += row.count;
    }
    return counts;
  }

  /**
   * Inserts a new user. The password must already be hashed.
   * Side effects: inserts one row into users.
   * @param {{ first_name: string, last_name: string, email: string, password_hash: string, role?: string }} data
   * @returns {Promise<UserEntity|null>}
   */
  static async create({
    first_name,
    last_name,
    email,
    password_hash,
    role = "attendee",
  }) {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PUBLIC_COLUMNS}`,
      [first_name, last_name, email, password_hash, role],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Updates the first and last name of a user.
   * Side effects: updates one users row.
   * @param {number} id
   * @param {{ first_name: string, last_name: string }} data
   * @returns {Promise<UserEntity|null>}
   */
  static async updateProfile(id, { first_name, last_name }) {
    const { rows } = await pool.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING ${PUBLIC_COLUMNS}`,
      [first_name, last_name, id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Saves a new password hash.
   * Side effects: updates one users row.
   * @param {number} id
   * @param {string} password_hash
   * @returns {Promise<boolean>}
   */
  static async updatePassword(id, password_hash) {
    const { rowCount } = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [password_hash, id],
    );
    return rowCount > 0;
  }

  /**
   * Changes the role of a user.
   * Side effects: updates one users row.
   * @param {number} id
   * @param {string} role
   * @returns {Promise<UserEntity|null>}
   */
  static async updateRole(id, role) {
    const { rows } = await pool.query(
      `UPDATE users
       SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${PUBLIC_COLUMNS}`,
      [role, id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Saves a new (encrypted) 2FA secret. 2FA stays off until the user confirms a code.
   * Side effects: updates one users row.
   * @param {number} id
   * @param {string} encryptedSecret
   * @returns {Promise<boolean>}
   */
  static async saveTwoFactorSecret(id, encryptedSecret) {
    const { rowCount } = await pool.query(
      `UPDATE users
       SET two_factor_secret = $1, two_factor_enabled = false, updated_at = NOW()
       WHERE id = $2`,
      [encryptedSecret, id],
    );
    return rowCount > 0;
  }

  /**
   * Turns 2FA on (only if a secret was saved before).
   * Side effects: updates one users row.
   * @param {number} id
   * @returns {Promise<UserEntity|null>}
   */
  static async enableTwoFactor(id) {
    const { rows } = await pool.query(
      `UPDATE users
       SET two_factor_enabled = true, updated_at = NOW()
       WHERE id = $1 AND two_factor_secret IS NOT NULL
       RETURNING ${PUBLIC_COLUMNS}`,
      [id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Turns 2FA off and forgets the secret.
   * Side effects: updates one users row.
   * @param {number} id
   * @returns {Promise<UserEntity|null>}
   */
  static async clearTwoFactor(id) {
    const { rows } = await pool.query(
      `UPDATE users
       SET two_factor_secret = NULL, two_factor_enabled = false, updated_at = NOW()
       WHERE id = $1
       RETURNING ${PUBLIC_COLUMNS}`,
      [id],
    );
    return UserEntity.fromRow(rows[0]);
  }

  /**
   * Counts the confirmed (active) registrations of a user.
   * @param {number} id
   * @returns {Promise<number>}
   */
  static async countActiveRegistrations(id) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM registrations
       WHERE user_id = $1 AND status = 'confirmed'`,
      [id],
    );
    return rows[0].total;
  }

  /**
   * Counts the events organized by a user.
   * @param {number} id
   * @returns {Promise<number>}
   */
  static async countOrganizedEvents(id) {
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS total FROM events WHERE organizer_id = $1",
      [id],
    );
    return rows[0].total;
  }

  /**
   * Deletes a user.
   * Side effects: deletes one users row (fails with 23503 if other rows reference it).
   * @param {number} id
   * @returns {Promise<boolean>} true when a row was deleted.
   */
  static async delete(id) {
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
      id,
    ]);
    return rowCount > 0;
  }
}

module.exports = UserRepository;
