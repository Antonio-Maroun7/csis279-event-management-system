/**
 * Repository for the events table. Only this layer writes SQL for events.
 */
const pool = require("../../config/db");
const EventEntity = require("./event.entity");

/**
 * SELECT used by every read: the event + its category, venue and organizer,
 * the number of confirmed registrations (seats_taken) and whether it already ended.
 */
const SELECT_EVENT = `
  SELECT e.id, e.organizer_id, e.venue_id, e.category_id, e.title, e.description,
         e.start_time, e.end_time, e.capacity, e.price, e.status,
         e.created_at, e.updated_at,
         c.name AS category_name,
         v.name AS venue_name, v.address AS venue_address,
         v.city AS venue_city, v.max_capacity AS venue_max_capacity,
         u.first_name AS organizer_first_name, u.last_name AS organizer_last_name,
         COALESCE(r.seats_taken, 0)::int AS seats_taken,
         (e.end_time < NOW()) AS is_past
  FROM events e
  JOIN categories c ON c.id = e.category_id
  JOIN venues v ON v.id = e.venue_id
  JOIN users u ON u.id = e.organizer_id
  LEFT JOIN (
    SELECT event_id, COUNT(*) AS seats_taken
    FROM registrations
    WHERE status = 'confirmed'
    GROUP BY event_id
  ) r ON r.event_id = e.id
`;

/**
 * WHERE for the public list: published events that have not ended yet.
 * @param {{ search?: string, category_id?: number, city?: string }} filters
 * @returns {{ where: string, params: Array }}
 */
const buildPublicFilters = ({ search, category_id, city } = {}) => {
  const conditions = ["e.status = 'published'", "e.end_time > NOW()"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    const n = params.length;
    conditions.push(
      `(e.title ILIKE $${n} OR e.description ILIKE $${n} OR v.name ILIKE $${n})`,
    );
  }
  if (category_id) {
    params.push(category_id);
    conditions.push(`e.category_id = $${params.length}`);
  }
  if (city) {
    params.push(city);
    conditions.push(`LOWER(v.city) = LOWER($${params.length})`);
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params };
};

/**
 * WHERE for the organizer / admin list.
 * organizer_id = null means "all organizers" (admin).
 * @param {{ organizer_id?: number|null, status?: string, search?: string }} filters
 * @returns {{ where: string, params: Array }}
 */
const buildManagedFilters = ({ organizer_id, status, search } = {}) => {
  const conditions = [];
  const params = [];

  if (organizer_id) {
    params.push(organizer_id);
    conditions.push(`e.organizer_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`e.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`e.title ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
};

/**
 * Executes event SQL queries.
 */
class EventRepository {
  /**
   * One page of published, not finished events, soonest first.
   * @param {{ search?: string, category_id?: number, city?: string, limit: number, offset: number }} filters
   * @returns {Promise<EventEntity[]>}
   */
  static async findPublished({ limit, offset, ...filters }) {
    const { where, params } = buildPublicFilters(filters);
    params.push(limit, offset);

    const { rows } = await pool.query(
      `${SELECT_EVENT}
       ${where}
       ORDER BY e.start_time ASC, e.id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return EventEntity.fromRows(rows);
  }

  /**
   * Counts the events that match the same filters as findPublished.
   * @param {{ search?: string, category_id?: number, city?: string }} filters
   * @returns {Promise<number>}
   */
  static async countPublished(filters) {
    const { where, params } = buildPublicFilters(filters);
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM events e
       JOIN venues v ON v.id = e.venue_id
       ${where}`,
      params,
    );
    return rows[0].total;
  }

  /**
   * One page of the events an organizer (or the admin) manages, newest start first.
   * @param {{ organizer_id?: number|null, status?: string, search?: string, limit: number, offset: number }} filters
   * @returns {Promise<EventEntity[]>}
   */
  static async findManaged({ limit, offset, ...filters }) {
    const { where, params } = buildManagedFilters(filters);
    params.push(limit, offset);

    const { rows } = await pool.query(
      `${SELECT_EVENT}
       ${where}
       ORDER BY e.start_time DESC, e.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return EventEntity.fromRows(rows);
  }

  /**
   * Counts the events that match the same filters as findManaged.
   * @param {{ organizer_id?: number|null, status?: string, search?: string }} filters
   * @returns {Promise<number>}
   */
  static async countManaged(filters) {
    const { where, params } = buildManagedFilters(filters);
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM events e ${where}`,
      params,
    );
    return rows[0].total;
  }

  /**
   * Dashboard numbers for one organizer (or everybody when organizerId is null):
   * events per status, the upcoming published events and the checked-in tickets.
   * @param {number|null} organizerId
   * @returns {Promise<{ counts: Object, upcoming: number, next_start_time: Date|null, checked_in: number }>}
   */
  static async getManagedStats(organizerId) {
    const params = organizerId ? [organizerId] : [];
    const where = organizerId ? "WHERE organizer_id = $1" : "";
    const checkedInOwner = organizerId ? "AND e2.organizer_id = $1" : "";

    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
         COUNT(*) FILTER (WHERE status = 'published')::int AS published,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE status = 'published' AND start_time > NOW())::int AS upcoming,
         MIN(start_time) FILTER (WHERE status = 'published' AND start_time > NOW()) AS next_start_time,
         (SELECT COUNT(*)
          FROM tickets t
          JOIN registrations r ON r.id = t.registration_id
          JOIN events e2 ON e2.id = r.event_id
          WHERE t.checked_in_at IS NOT NULL
            AND r.status = 'confirmed'
            AND e2.status <> 'cancelled' ${checkedInOwner})::int AS checked_in
       FROM events
       ${where}`,
      params,
    );

    const row = rows[0];
    return {
      counts: {
        total: row.total,
        draft: row.draft,
        published: row.published,
        cancelled: row.cancelled,
        completed: row.completed,
      },
      upcoming: row.upcoming,
      next_start_time: row.next_start_time,
      checked_in: row.checked_in,
    };
  }

  /**
   * Confirmed registrations on the (not cancelled) events of one organizer,
   * or of everybody when organizerId is null.
   * @param {number|null} organizerId
   * @returns {Promise<number>}
   */
  static async countConfirmedRegistrations(organizerId) {
    const params = organizerId ? [organizerId] : [];
    const extra = organizerId ? "AND e.organizer_id = $1" : "";

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.status = 'confirmed' AND e.status <> 'cancelled' ${extra}`,
      params,
    );
    return rows[0].total;
  }

  /**
   * Finds one event by id.
   * @param {number} id
   * @returns {Promise<EventEntity|null>}
   */
  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_EVENT} WHERE e.id = $1`, [id]);
    return EventEntity.fromRow(rows[0]);
  }

  /**
   * Finds another draft / published event at the same venue whose time overlaps
   * [start_time, end_time). Two events touching (one ends at 12:00, the next
   * starts at 12:00) do not overlap.
   * @param {{ venue_id: number, start_time: string, end_time: string, excludeId?: number }} slot
   * @returns {Promise<{ id: number, organizer_id: number, title: string, start_time: Date, end_time: Date }|null>}
   */
  static async findOverlapping({ venue_id, start_time, end_time, excludeId }) {
    const params = [venue_id, start_time, end_time];
    let extra = "";

    if (excludeId) {
      params.push(excludeId);
      extra = "AND id <> $4";
    }

    const { rows } = await pool.query(
      `SELECT id, organizer_id, title, start_time, end_time
       FROM events
       WHERE venue_id = $1
         AND status IN ('draft', 'published')
         AND start_time < $3
         AND end_time > $2
         ${extra}
       ORDER BY start_time
       LIMIT 1`,
      params,
    );
    return rows[0] || null;
  }

  /**
   * Inserts a new event.
   * Side effects: inserts one row into events.
   * @param {number} organizerId
   * @param {Object} fields - see EventDto.fromRequest
   * @param {"draft"|"published"} status
   * @returns {Promise<number>} the new event id
   */
  static async create(organizerId, fields, status) {
    const { rows } = await pool.query(
      `INSERT INTO events
         (organizer_id, venue_id, category_id, title, description,
          start_time, end_time, capacity, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        organizerId,
        fields.venue_id,
        fields.category_id,
        fields.title,
        fields.description,
        fields.start_time,
        fields.end_time,
        fields.capacity,
        fields.price,
        status,
      ],
    );
    return rows[0].id;
  }

  /**
   * Updates every editable field of an event (not the status, not the organizer).
   * Side effects: updates one events row.
   * @param {number} id
   * @param {Object} fields - see EventDto.fromRequest
   * @returns {Promise<boolean>} true when a row was updated.
   */
  static async update(id, fields) {
    const { rowCount } = await pool.query(
      `UPDATE events
       SET venue_id = $1, category_id = $2, title = $3, description = $4,
           start_time = $5, end_time = $6, capacity = $7, price = $8,
           updated_at = NOW()
       WHERE id = $9`,
      [
        fields.venue_id,
        fields.category_id,
        fields.title,
        fields.description,
        fields.start_time,
        fields.end_time,
        fields.capacity,
        fields.price,
        id,
      ],
    );
    return rowCount > 0;
  }

  /**
   * Changes the status of an event (publish / cancel).
   * Side effects: updates one events row.
   * @param {number} id
   * @param {"published"|"cancelled"} status
   * @returns {Promise<boolean>}
   */
  static async updateStatus(id, status) {
    const { rowCount } = await pool.query(
      `UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id],
    );
    return rowCount > 0;
  }

  /**
   * Deletes an event.
   * Side effects: deletes one events row (fails with 23503 if registrations use it).
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const { rowCount } = await pool.query("DELETE FROM events WHERE id = $1", [
      id,
    ]);
    return rowCount > 0;
  }
}

module.exports = EventRepository;
