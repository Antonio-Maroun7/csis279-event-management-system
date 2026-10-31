/**
 * Venue entity - represents one row of the venues table.
 * Uses the database column names (snake_case).
 * events_count is not a column: it is calculated by the repository queries.
 */
class VenueEntity {
  /**
   * @param {{
   *   id?: number,
   *   name?: string,
   *   address?: string,
   *   city?: string,
   *   max_capacity?: number,
   *   events_count?: number|string,
   *   created_at?: Date,
   *   updated_at?: Date
   * }} [row]
   */
  constructor({
    id,
    name,
    address,
    city,
    max_capacity,
    events_count,
    created_at,
    updated_at,
  } = {}) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.city = city;
    this.max_capacity = max_capacity;
    this.events_count = Number(events_count || 0);
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Builds one entity from a database row.
   * @param {Object|undefined|null} row
   * @returns {VenueEntity|null}
   */
  static fromRow(row) {
    if (!row) return null;
    return new VenueEntity(row);
  }

  /**
   * Builds a list of entities from database rows.
   * @param {Array<Object>} rows
   * @returns {VenueEntity[]}
   */
  static fromRows(rows) {
    return (rows || []).map((row) => VenueEntity.fromRow(row));
  }
}

module.exports = VenueEntity;
