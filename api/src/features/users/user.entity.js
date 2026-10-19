/**
 * User entity - represents one row of the users table.
 * Uses the database column names (snake_case).
 */
class UserEntity {
  /**
   * @param {{
   *   id?: number,
   *   first_name?: string,
   *   last_name?: string,
   *   email?: string,
   *   password_hash?: string,
   *   role?: string,
   *   two_factor_secret?: string|null,
   *   two_factor_enabled?: boolean,
   *   created_at?: Date,
   *   updated_at?: Date
   * }} [row]
   */
  constructor({
    id,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    two_factor_secret,
    two_factor_enabled,
    created_at,
    updated_at,
  } = {}) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
    this.two_factor_secret = two_factor_secret;
    this.two_factor_enabled = two_factor_enabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Builds one entity from a database row.
   * @param {Object|undefined|null} row
   * @returns {UserEntity|null}
   */
  static fromRow(row) {
    if (!row) return null;
    return new UserEntity(row);
  }

  /**
   * Builds a list of entities from database rows.
   * @param {Array<Object>} rows
   * @returns {UserEntity[]}
   */
  static fromRows(rows) {
    return (rows || []).map((row) => UserEntity.fromRow(row));
  }
}

module.exports = UserEntity;
