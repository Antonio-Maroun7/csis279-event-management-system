/**
 * Repository for the categories table. Only this layer writes SQL for categories.
 */
const pool = require("../../config/db");
const CategoryEntity = require("./category.entity");

/**
 * SELECT used by the list and by findById:
 * every category + how many events use it (LEFT JOIN keeps categories with 0 events).
 */
const SELECT_WITH_COUNT = `
  SELECT c.id, c.name, c.created_at, c.updated_at,
         COUNT(e.id)::int AS events_count
  FROM categories c
  LEFT JOIN events e ON e.category_id = c.id
`;

/**
 * Executes category SQL queries.
 */
class CategoryRepository {
  /**
   * Returns all categories, sorted by name, with an optional name search.
   * @param {{ search?: string }} [filters]
   * @returns {Promise<CategoryEntity[]>}
   */
  static async findAll({ search } = {}) {
    const params = [];
    let where = "";

    if (search) {
      params.push(`%${search}%`);
      where = `WHERE c.name ILIKE $1`;
    }

    const { rows } = await pool.query(
      `${SELECT_WITH_COUNT}
       ${where}
       GROUP BY c.id
       ORDER BY c.name ASC`,
      params,
    );
    return CategoryEntity.fromRows(rows);
  }

  /**
   * Finds one category by id.
   * @param {number} id
   * @returns {Promise<CategoryEntity|null>}
   */
  static async findById(id) {
    const { rows } = await pool.query(
      `${SELECT_WITH_COUNT}
       WHERE c.id = $1
       GROUP BY c.id`,
      [id],
    );
    return CategoryEntity.fromRow(rows[0]);
  }

  /**
   * Finds a category with the same name, ignoring upper/lower case
   * ("Sports" and "sports" are the same category).
   * @param {string} name
   * @param {number} [excludeId] - ignore this id (used when renaming a category)
   * @returns {Promise<CategoryEntity|null>}
   */
  static async findByName(name, excludeId) {
    const params = [name];
    let extra = "";

    if (excludeId) {
      params.push(excludeId);
      extra = "AND id <> $2";
    }

    const { rows } = await pool.query(
      `SELECT id, name, created_at, updated_at
       FROM categories
       WHERE LOWER(name) = LOWER($1) ${extra}
       LIMIT 1`,
      params,
    );
    return CategoryEntity.fromRow(rows[0]);
  }

  /**
   * Inserts a new category.
   * Side effects: inserts one row into categories.
   * @param {{ name: string }} data
   * @returns {Promise<CategoryEntity|null>}
   */
  static async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING id, name, created_at, updated_at, 0 AS events_count`,
      [name],
    );
    return CategoryEntity.fromRow(rows[0]);
  }

  /**
   * Renames a category.
   * Side effects: updates one categories row.
   * @param {number} id
   * @param {{ name: string }} data
   * @returns {Promise<boolean>} true when a row was updated.
   */
  static async update(id, { name }) {
    const { rowCount } = await pool.query(
      `UPDATE categories
       SET name = $1, updated_at = NOW()
       WHERE id = $2`,
      [name, id],
    );
    return rowCount > 0;
  }

  /**
   * Deletes a category.
   * Side effects: deletes one categories row (fails with 23503 if an event uses it).
   * @param {number} id
   * @returns {Promise<boolean>} true when a row was deleted.
   */
  static async delete(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM categories WHERE id = $1",
      [id],
    );
    return rowCount > 0;
  }
}

module.exports = CategoryRepository;
