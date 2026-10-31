/**
 * Event entity - one row of the events table, plus the columns joined by the
 * repository (category, venue, organizer) and the calculated seat count.
 * Uses the database column names (snake_case).
 */
class EventEntity {
  /**
   * @param {Object} [row]
   */
  constructor({
    id,
    organizer_id,
    venue_id,
    category_id,
    title,
    description,
    start_time,
    end_time,
    capacity,
    price,
    status,
    created_at,
    updated_at,
    category_name,
    venue_name,
    venue_address,
    venue_city,
    venue_max_capacity,
    organizer_first_name,
    organizer_last_name,
    seats_taken,
    is_past,
  } = {}) {
    this.id = id;
    this.organizer_id = organizer_id;
    this.venue_id = venue_id;
    this.category_id = category_id;
    this.title = title;
    this.description = description;
    this.start_time = start_time;
    this.end_time = end_time;
    this.capacity = capacity;
    this.price = Number(price || 0); // NUMERIC(10,2) comes back from pg as a string
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;

    // joined columns (not in the events table)
    this.category_name = category_name;
    this.venue_name = venue_name;
    this.venue_address = venue_address;
    this.venue_city = venue_city;
    this.venue_max_capacity = venue_max_capacity;
    this.organizer_first_name = organizer_first_name;
    this.organizer_last_name = organizer_last_name;

    // calculated columns
    this.seats_taken = Number(seats_taken || 0);
    this.is_past = Boolean(is_past);
  }

  /**
   * Builds one entity from a database row.
   * @param {Object|undefined|null} row
   * @returns {EventEntity|null}
   */
  static fromRow(row) {
    if (!row) return null;
    return new EventEntity(row);
  }

  /**
   * Builds a list of entities from database rows.
   * @param {Array<Object>} rows
   * @returns {EventEntity[]}
   */
  static fromRows(rows) {
    return (rows || []).map((row) => EventEntity.fromRow(row));
  }
}

module.exports = EventEntity;
