/**
 * Category entity - represents one row of the categories table.
 * Uses the database column names (snake_case).
 * events_count is not a column: it is calculated by the repository queries.
 */
class CategoryEntity {
  /**
   * @param {{
   *   id?: number,
   *   name?: string,
   *   events_count?: number|string,
   *   created_at?: Date,
   *   updated_at?: Date
   * }} [row]
   */
  constructor({ id, name, events_count, created_at, updated_at } = {}) {
    this.id = id;
    this.name = name;
    this.events_count = Number(events_count || 0);
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Builds one entity from a database row.
   * @param {Object|undefined|null} row
   * @returns {CategoryEntity|null}
   */
  static fromRow(row) {
    if (!row) return null;
    return new CategoryEntity(row);
  }

  /**
   * Builds a list of entities from database rows.
   * @param {Array<Object>} rows
   * @returns {CategoryEntity[]}
   */
  static fromRows(rows) {
    return (rows || []).map((row) => CategoryEntity.fromRow(row));
  }
}

module.exports = CategoryEntity;
