/**
 * Category service: business rules for event categories.
 */
const AppError = require("../../shared/errors/AppError");
const CategoryRepository = require("./category.repository");
const CategoryDto = require("./category.dto");

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

/**
 * Handles category operations and DTO mapping.
 */
class CategoryService {
  /**
   * Returns all categories (public: used by the events filter and the event form).
   * @param {{ search?: string }} filters
   * @returns {Promise<{ categories: Object[], total: number }>}
   */
  static async listCategories(filters) {
    const entities = await CategoryRepository.findAll(filters);
    return {
      categories: CategoryDto.toListDto(entities),
      total: entities.length,
    };
  }

  /**
   * Returns one category.
   * @param {number} id
   * @returns {Promise<Object>}
   * @throws {AppError} 404 when the category does not exist.
   */
  static async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound("Category not found");
    }
    return CategoryDto.toResponseDto(category);
  }

  /**
   * Admin: creates a category.
   * @param {{ name: string }} data
   * @returns {Promise<Object>}
   * @throws {AppError} 409 when the name already exists.
   */
  static async createCategory({ name }) {
    if (await CategoryRepository.findByName(name)) {
      throw AppError.conflict(`A category named "${name}" already exists`);
    }

    try {
      const category = await CategoryRepository.create({ name });
      return CategoryDto.toResponseDto(category);
    } catch (err) {
      // two admins created the same name at the same moment
      if (err.code === UNIQUE_VIOLATION) {
        throw AppError.conflict(`A category named "${name}" already exists`);
      }
      throw err;
    }
  }

  /**
   * Admin: renames a category.
   * @param {number} id
   * @param {{ name: string }} data
   * @returns {Promise<Object>}
   * @throws {AppError} 404 not found, 409 name already used by another category.
   */
  static async updateCategory(id, { name }) {
    const existing = await CategoryRepository.findById(id);
    if (!existing) {
      throw AppError.notFound("Category not found");
    }

    if (await CategoryRepository.findByName(name, id)) {
      throw AppError.conflict(`A category named "${name}" already exists`);
    }

    try {
      await CategoryRepository.update(id, { name });
    } catch (err) {
      if (err.code === UNIQUE_VIOLATION) {
        throw AppError.conflict(`A category named "${name}" already exists`);
      }
      throw err;
    }

    // read it again so events_count is included
    return CategoryService.getCategoryById(id);
  }

  /**
   * Admin: deletes a category that no event uses.
   * @param {number} id
   * @returns {Promise<void>}
   * @throws {AppError} 404 not found, 409 still used by events.
   */
  static async deleteCategory(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound("Category not found");
    }

    if (category.events_count > 0) {
      throw AppError.conflict(
        `This category is used by ${category.events_count} event(s) and cannot be deleted`,
      );
    }

    try {
      await CategoryRepository.delete(id);
    } catch (err) {
      // an event was created with this category in the meantime
      if (err.code === FOREIGN_KEY_VIOLATION) {
        throw AppError.conflict(
          "This category is used by events and cannot be deleted",
        );
      }
      throw err;
    }
  }
}

module.exports = CategoryService;
