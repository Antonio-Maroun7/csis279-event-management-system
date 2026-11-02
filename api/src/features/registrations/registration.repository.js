/**
 * Repository for the registrations table. Only this layer writes SQL for registrations.
 * Methods used inside a transaction take the pool client as the last argument
 * (db defaults to the pool, so they also work on their own).
 */
const pool = require("../../config/db");
const RegistrationEntity = require("./registration.entity");

/**
 * SELECT used by every read: the registration + its ticket, event (category, venue)
 * and user. Only public user columns are selected.
 */
const SELECT_REGISTRATION = `
  SELECT r.id, r.event_id, r.user_id, r.status, r.registered_at, r.cancelled_at,
         t.id AS ticket_id, t.ticket_code, t.checked_in_at,
         e.title AS event_title, e.start_time AS event_start_time,
         e.end_time AS event_end_time, e.status AS event_status,
         (e.end_time < NOW()) AS event_is_past,
         (e.start_time <= NOW()) AS event_has_started,
         e.category_id, c.name AS category_name,
         e.venue_id, v.name AS venue_name, v.city AS venue_city,
         u.first_name AS user_first_name, u.last_name AS user_last_name,
         u.email AS user_email
  FROM registrations r
  JOIN tickets t ON t.registration_id = r.id
  JOIN events e ON e.id = r.event_id
  JOIN categories c ON c.id = e.category_id
  JOIN venues v ON v.id = e.venue_id
  JOIN users u ON u.id = r.user_id
`;

/**
 * The three tabs of "My tickets". They never overlap and cover every registration.
 */
const STATUS_CONDITIONS = {
  upcoming:
    "r.status = 'confirmed' AND e.status <> 'cancelled' AND e.end_time >= NOW()",
  past: "r.status = 'confirmed' AND e.status <> 'cancelled' AND e.end_time < NOW()",
  cancelled: "(r.status = 'cancelled' OR e.status = 'cancelled')",
};

/** Sort order of each tab: upcoming = soonest first, the others = most recent first. */
const STATUS_ORDER = {
  upcoming: "e.start_time ASC, r.id ASC",
  past: "e.start_time DESC, r.id DESC",
  cancelled: "COALESCE(r.cancelled_at, r.registered_at) DESC, r.id DESC",
};

/**
 * WHERE for the attendee list of one event (confirmed registrations only).
 * @param {{ eventId: number, search?: string, checked_in?: boolean }} filters
 * @returns {{ where: string, params: Array }}
 */
const buildAttendeeFilters = ({ eventId, search, checked_in }) => {
  const params = [eventId];
  const conditions = ["r.event_id = $1", "r.status = 'confirmed'"];

  if (search) {
    params.push(`%${search}%`);
    const n = params.length;
    conditions.push(
      `(u.first_name ILIKE $${n} OR u.last_name ILIKE $${n}
        OR (u.first_name || ' ' || u.last_name) ILIKE $${n}
        OR u.email ILIKE $${n} OR t.ticket_code ILIKE $${n})`,
    );
  }
  if (checked_in === true) {
    conditions.push("t.checked_in_at IS NOT NULL");
  } else if (checked_in === false) {
    conditions.push("t.checked_in_at IS NULL");
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params };
};

/**
 * Executes registration SQL queries.
 */
class RegistrationRepository {
  /**
   * Runs a function inside one transaction on one pool client:
   * BEGIN -> fn(client) -> COMMIT, or ROLLBACK when fn throws. The client is always released.
   * @template T
   * @param {(client: import("pg").PoolClient) => Promise<T>} fn
   * @returns {Promise<T>}
   */
  static async transaction(fn) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Locks one event row (SELECT ... FOR UPDATE) until the transaction ends.
   * A second registration for the same event waits here, so two people
   * can never take the last seat at the same time.
   * clock_timestamp() is the real current time (NOW() would be the time the transaction
   * started, which is too old when the request had to wait for the lock).
   * @param {number} eventId
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<{ id: number, status: string, capacity: number, has_started: boolean }|null>}
   */
  static async lockEvent(eventId, db = pool) {
    const { rows } = await db.query(
      `SELECT id, status, capacity,
              (start_time <= clock_timestamp()) AS has_started
       FROM events
       WHERE id = $1
       FOR UPDATE`,
      [eventId],
    );
    return rows[0] || null;
  }

  /**
   * Counts the confirmed registrations of an event (the seats taken).
   * @param {number} eventId
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<number>}
   */
  static async countConfirmed(eventId, db = pool) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM registrations
       WHERE event_id = $1 AND status = 'confirmed'`,
      [eventId],
    );
    return rows[0].total;
  }

  /**
   * Checks if the user already has a confirmed registration for the event.
   * @param {number} eventId
   * @param {number} userId
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<boolean>}
   */
  static async hasConfirmed(eventId, userId, db = pool) {
    const { rowCount } = await db.query(
      `SELECT 1 FROM registrations
       WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'`,
      [eventId, userId],
    );
    return rowCount > 0;
  }

  /**
   * Inserts a confirmed registration.
   * Side effects: inserts one row into registrations.
   * @param {number} eventId
   * @param {number} userId
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<number>} the new registration id
   */
  static async create(eventId, userId, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO registrations (event_id, user_id)
       VALUES ($1, $2)
       RETURNING id`,
      [eventId, userId],
    );
    return rows[0].id;
  }

  /**
   * Finds one registration (with ticket, event and user) by id.
   * @param {number} id
   * @param {import("pg").Pool|import("pg").PoolClient} [db=pool]
   * @returns {Promise<RegistrationEntity|null>}
   */
  static async findById(id, db = pool) {
    const { rows } = await db.query(`${SELECT_REGISTRATION} WHERE r.id = $1`, [
      id,
    ]);
    return RegistrationEntity.fromRow(rows[0]);
  }

  /**
   * Finds the CONFIRMED registration of a user for an event (at most one exists).
   * @param {number} eventId
   * @param {number} userId
   * @returns {Promise<RegistrationEntity|null>}
   */
  static async findConfirmedByUserAndEvent(eventId, userId) {
    const { rows } = await pool.query(
      `${SELECT_REGISTRATION}
       WHERE r.event_id = $1 AND r.user_id = $2 AND r.status = 'confirmed'`,
      [eventId, userId],
    );
    return RegistrationEntity.fromRow(rows[0]);
  }

  /**
   * One page of a user's registrations for one tab (upcoming, past or cancelled).
   * @param {{ userId: number, status: "upcoming"|"past"|"cancelled", limit: number, offset: number }} filters
   * @returns {Promise<RegistrationEntity[]>}
   */
  static async findByUser({ userId, status, limit, offset }) {
    const { rows } = await pool.query(
      `${SELECT_REGISTRATION}
       WHERE r.user_id = $1 AND ${STATUS_CONDITIONS[status]}
       ORDER BY ${STATUS_ORDER[status]}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return RegistrationEntity.fromRows(rows);
  }

  /**
   * How many registrations a user has in each tab.
   * @param {number} userId
   * @returns {Promise<{ upcoming: number, past: number, cancelled: number }>}
   */
  static async countByUser(userId) {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE ${STATUS_CONDITIONS.upcoming})::int AS upcoming,
         COUNT(*) FILTER (WHERE ${STATUS_CONDITIONS.past})::int AS past,
         COUNT(*) FILTER (WHERE ${STATUS_CONDITIONS.cancelled})::int AS cancelled
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = $1`,
      [userId],
    );
    return rows[0];
  }

  /**
   * Cancels a confirmed registration. The WHERE keeps it safe when the user
   * double-clicks, and refuses a ticket that was checked in at the same moment.
   * Side effects: updates one registrations row (the seat becomes free again).
   * @param {number} id
   * @returns {Promise<boolean>} true when the registration was cancelled by this call.
   */
  static async cancel(id) {
    const { rowCount } = await pool.query(
      `UPDATE registrations r
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE r.id = $1
         AND r.status = 'confirmed'
         AND NOT EXISTS (
           SELECT 1 FROM tickets t
           WHERE t.registration_id = r.id AND t.checked_in_at IS NOT NULL
         )`,
      [id],
    );
    return rowCount > 0;
  }

  /**
   * One page of the confirmed attendees of an event, sorted by name.
   * @param {{ eventId: number, search?: string, checked_in?: boolean, limit: number, offset: number }} filters
   * @returns {Promise<RegistrationEntity[]>}
   */
  static async findAttendees({ limit, offset, ...filters }) {
    const { where, params } = buildAttendeeFilters(filters);
    params.push(limit, offset);

    const { rows } = await pool.query(
      `${SELECT_REGISTRATION}
       ${where}
       ORDER BY u.first_name ASC, u.last_name ASC, r.id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return RegistrationEntity.fromRows(rows);
  }

  /**
   * Counts the attendees that match the same filters as findAttendees.
   * @param {{ eventId: number, search?: string, checked_in?: boolean }} filters
   * @returns {Promise<number>}
   */
  static async countAttendees(filters) {
    const { where, params } = buildAttendeeFilters(filters);
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM registrations r
       JOIN tickets t ON t.registration_id = r.id
       JOIN users u ON u.id = r.user_id
       ${where}`,
      params,
    );
    return rows[0].total;
  }

  /**
   * Numbers of the whole event (not affected by the search or the filter).
   * @param {number} eventId
   * @returns {Promise<{ registered: number, checked_in: number }>}
   */
  static async getAttendeeStats(eventId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS registered,
              COUNT(t.checked_in_at)::int AS checked_in
       FROM registrations r
       JOIN tickets t ON t.registration_id = r.id
       WHERE r.event_id = $1 AND r.status = 'confirmed'`,
      [eventId],
    );
    return rows[0];
  }
}

module.exports = RegistrationRepository;
