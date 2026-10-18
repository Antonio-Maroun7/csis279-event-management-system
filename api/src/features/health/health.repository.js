/**
 * Repository for the database health check.
 */
const pool = require("../../config/db");

/**
 * Runs a very small query to confirm PostgreSQL answers.
 */
class HealthRepository {
  /**
   * Returns the current database time.
   * @returns {Promise<Date>}
   */
  static async getDatabaseTime() {
    const { rows } = await pool.query("SELECT NOW() AS now");
    return rows[0].now;
  }
}

module.exports = HealthRepository;
