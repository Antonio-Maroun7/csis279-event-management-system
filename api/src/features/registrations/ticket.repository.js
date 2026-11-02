/**
 * Repository for the tickets table. Only this layer writes SQL for tickets.
 */
const pool = require("../../config/db");
const { generateTicketCode } = require("./ticketCode");

const MAX_CODE_ATTEMPTS = 3;

/**
 * Executes ticket SQL queries.
 */
class TicketRepository {
  /**
   * Creates the ticket of a registration with a new random code.
   * ON CONFLICT DO NOTHING is used instead of catching the 23505 error:
   * in PostgreSQL a failed statement aborts the whole transaction, so the
   * retry would be impossible inside the registration transaction.
   * If the code already exists, a new code is generated (max 3 tries).
   * Side effects: inserts one row into tickets.
   * @param {number} registrationId
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<string>} the ticket code
   * @throws {Error} when no free code was found after 3 tries
   */
  static async create(registrationId, db = pool) {
    for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt += 1) {
      const code = generateTicketCode();
      const { rowCount } = await db.query(
        `INSERT INTO tickets (registration_id, ticket_code)
         VALUES ($1, $2)
         ON CONFLICT (ticket_code) DO NOTHING`,
        [registrationId, code],
      );
      if (rowCount > 0) return code;
    }
    throw new Error("Could not generate a unique ticket code");
  }

  /**
   * Finds the registration that owns a ticket code, only inside one event.
   * @param {string} code - already trimmed and uppercased
   * @param {number} eventId
   * @returns {Promise<number|null>} the registration id, or null when the code is not for this event
   */
  static async findRegistrationIdByCode(code, eventId) {
    const { rows } = await pool.query(
      `SELECT r.id
       FROM tickets t
       JOIN registrations r ON r.id = t.registration_id
       WHERE t.ticket_code = $1 AND r.event_id = $2`,
      [code, eventId],
    );
    return rows[0] ? rows[0].id : null;
  }

  /**
   * Marks a ticket as checked in. Done in one UPDATE ... WHERE checked_in_at IS NULL
   * on a confirmed registration, so a double click (or two staff members)
   * can never check in the same ticket twice.
   * Side effects: updates one tickets row.
   * @param {number} registrationId
   * @returns {Promise<boolean>} true when this call did the check-in.
   */
  static async checkIn(registrationId) {
    const { rowCount } = await pool.query(
      `UPDATE tickets t
       SET checked_in_at = NOW()
       FROM registrations r
       WHERE t.registration_id = r.id
         AND r.id = $1
         AND r.status = 'confirmed'
         AND t.checked_in_at IS NULL`,
      [registrationId],
    );
    return rowCount > 0;
  }
}

module.exports = TicketRepository;
