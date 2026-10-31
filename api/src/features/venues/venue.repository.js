/**
 * Repository for the venues table. Only this layer writes SQL for venues.
 */
const pool = require("../../config/db");
const VenueEntity = require("./venue.entity");

/**
 * SELECT used by the list and by findById:
 * every venue + how many events use it (LEFT JOIN keeps venues with 0 events).
 */
const SELECT_WITH_COUNT = `
  SELECT v.id, v.name, v.address, v.city, v.max_capacity,
         v.created_at, v.updated_at,
         COUNT(e.id)::int AS events_count
  FROM venues v
  LEFT JOIN events e ON e.venue_id = v.id
`;

/**
 * Executes venue SQL queries.
 */
class VenueRepository {
  /**
   * Returns all venues sorted by city then name.
   * search looks in the name, the address and the city; city is an exact filter.
   * @param {{ search?: string, city?: string }} [filters]
   * @returns {Promise<VenueEntity[]>}
   */
  static async findAll({ search, city } = {}) {
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      conditions.push(
        `(v.name ILIKE $${n} OR v.address ILIKE $${n} OR v.city ILIKE $${n})`,
      );
    }

    if (city) {
      params.push(city);
      conditions.push(`LOWER(v.city) = LOWER($${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `${SELECT_WITH_COUNT}
       ${where}
       GROUP BY v.id
       ORDER BY v.city ASC, v.name ASC`,
      params,
    );
    return VenueEntity.fromRows(rows);
  }

  /**
   * Finds one venue by id.
   * @param {number} id
   * @returns {Promise<VenueEntity|null>}
   */
  static async findById(id) {
    const { rows } = await pool.query(
      `${SELECT_WITH_COUNT}
       WHERE v.id = $1
       GROUP BY v.id`,
      [id],
    );
    return VenueEntity.fromRow(rows[0]);
  }

  /**
   * Finds a venue with the same name in the same city, ignoring upper/lower case.
   * @param {string} name
   * @param {string} city
   * @param {number} [excludeId] - ignore this id (used when editing a venue)
   * @returns {Promise<VenueEntity|null>}
   */
  static async findByNameAndCity(name, city, excludeId) {
    const params = [name, city];
    let extra = "";

    if (excludeId) {
      params.push(excludeId);
      extra = "AND id <> $3";
    }

    const { rows } = await pool.query(
      `SELECT id, name, address, city, max_capacity, created_at, updated_at
       FROM venues
       WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2) ${extra}
       LIMIT 1`,
      params,
    );
    return VenueEntity.fromRow(rows[0]);
  }

  /**
   * Largest capacity of the draft / published events held at this venue.
   * The venue's max_capacity cannot go below this number.
   * @param {number} id
   * @returns {Promise<number>} 0 when the venue has no active events.
   */
  static async findLargestActiveEventCapacity(id) {
    const { rows } = await pool.query(
      `SELECT COALESCE(MAX(capacity), 0)::int AS largest
       FROM events
       WHERE venue_id = $1 AND status IN ('draft', 'published')`,
      [id],
    );
    return rows[0].largest;
  }

  /**
   * Inserts a new venue.
   * Side effects: inserts one row into venues.
   * @param {{ name: string, address: string, city: string, max_capacity: number }} data
   * @returns {Promise<VenueEntity|null>}
   */
  static async create({ name, address, city, max_capacity }) {
    const { rows } = await pool.query(
      `INSERT INTO venues (name, address, city, max_capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, address, city, max_capacity,
                 created_at, updated_at, 0 AS events_count`,
      [name, address, city, max_capacity],
    );
    return VenueEntity.fromRow(rows[0]);
  }

  /**
   * Updates every editable field of a venue.
   * Side effects: updates one venues row.
   * @param {number} id
   * @param {{ name: string, address: string, city: string, max_capacity: number }} data
   * @returns {Promise<boolean>} true when a row was updated.
   */
  static async update(id, { name, address, city, max_capacity }) {
    const { rowCount } = await pool.query(
      `UPDATE venues
       SET name = $1, address = $2, city = $3, max_capacity = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [name, address, city, max_capacity, id],
    );
    return rowCount > 0;
  }

  /**
   * Deletes a venue.
   * Side effects: deletes one venues row (fails with 23503 if an event uses it).
   * @param {number} id
   * @returns {Promise<boolean>} true when a row was deleted.
   */
  static async delete(id) {
    const { rowCount } = await pool.query("DELETE FROM venues WHERE id = $1", [
      id,
    ]);
    return rowCount > 0;
  }
}

module.exports = VenueRepository;
