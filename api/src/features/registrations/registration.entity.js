/**
 * Registration entity - one row of the registrations table plus its ticket,
 * the event (with category and venue) and the user, all joined by the repository.
 * Uses the database column names (snake_case).
 */
class RegistrationEntity {
  /**
   * @param {Object} [row]
   */
  constructor({
    id,
    event_id,
    user_id,
    status,
    registered_at,
    cancelled_at,
    ticket_id,
    ticket_code,
    checked_in_at,
    event_title,
    event_start_time,
    event_end_time,
    event_status,
    event_is_past,
    event_has_started,
    category_id,
    category_name,
    venue_id,
    venue_name,
    venue_city,
    user_first_name,
    user_last_name,
    user_email,
  } = {}) {
    this.id = id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.status = status;
    this.registered_at = registered_at;
    this.cancelled_at = cancelled_at || null;

    // ticket (tickets table)
    this.ticket_id = ticket_id;
    this.ticket_code = ticket_code;
    this.checked_in_at = checked_in_at || null;

    // event (events, categories and venues tables)
    this.event_title = event_title;
    this.event_start_time = event_start_time;
    this.event_end_time = event_end_time;
    this.event_status = event_status;
    this.event_is_past = Boolean(event_is_past);
    this.event_has_started = Boolean(event_has_started);
    this.category_id = category_id;
    this.category_name = category_name;
    this.venue_id = venue_id;
    this.venue_name = venue_name;
    this.venue_city = venue_city;

    // user (users table): only the public columns, never the password or 2FA fields
    this.user_first_name = user_first_name;
    this.user_last_name = user_last_name;
    this.user_email = user_email;
  }

  /**
   * Builds one entity from a database row.
   * @param {Object|undefined|null} row
   * @returns {RegistrationEntity|null}
   */
  static fromRow(row) {
    if (!row) return null;
    return new RegistrationEntity(row);
  }

  /**
   * Builds a list of entities from database rows.
   * @param {Array<Object>} rows
   * @returns {RegistrationEntity[]}
   */
  static fromRows(rows) {
    return (rows || []).map((row) => RegistrationEntity.fromRow(row));
  }
}

module.exports = RegistrationEntity;
