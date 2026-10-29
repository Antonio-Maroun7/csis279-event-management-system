/**
 * Repository for the two_factor_backup_codes table.
 * Only SHA-256 hashes are stored, never the codes themselves.
 */
const pool = require("../../config/db");

/**
 * Executes backup code SQL queries.
 */
class BackupCodeRepository {
  /**
   * Deletes the old codes of a user and saves the new ones in one transaction.
   * Side effects: deletes and inserts rows in two_factor_backup_codes.
   * @param {number} userId
   * @param {string[]} codeHashes
   * @returns {Promise<void>}
   */
  static async replaceForUser(userId, codeHashes) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM two_factor_backup_codes WHERE user_id = $1",
        [userId],
      );
      // unnest turns the array into one row per hash
      await client.query(
        `INSERT INTO two_factor_backup_codes (user_id, code_hash)
         SELECT $1, unnest($2::text[])`,
        [userId, codeHashes],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Marks an unused code as used. Done in one UPDATE so the same code
   * can never be used twice, even by two requests at the same time.
   * @param {number} userId
   * @param {string} codeHash
   * @returns {Promise<boolean>} true when a valid unused code was found.
   */
  static async useCode(userId, codeHash) {
    const { rowCount } = await pool.query(
      `UPDATE two_factor_backup_codes
       SET used_at = NOW()
       WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL`,
      [userId, codeHash],
    );
    return rowCount > 0;
  }

  /**
   * Counts the codes a user can still use.
   * @param {number} userId
   * @returns {Promise<number>}
   */
  static async countUnused(userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM two_factor_backup_codes
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );
    return rows[0].total;
  }

  /**
   * Removes all codes of a user (when 2FA is turned off or reset).
   * @param {number} userId
   * @returns {Promise<void>}
   */
  static async deleteForUser(userId) {
    await pool.query("DELETE FROM two_factor_backup_codes WHERE user_id = $1", [
      userId,
    ]);
  }
}

module.exports = BackupCodeRepository;
