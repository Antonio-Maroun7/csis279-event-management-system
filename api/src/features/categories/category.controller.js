/**
 * Category controller: reads the request, calls CategoryService, sends JSON.
 */
const { matchedData } = require("express-validator");
const CategoryService = require("./category.service");

/**
 * Handles category HTTP requests.
 */
class CategoryController {
  /**
   * GET /api/categories?search= (public)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async listCategories(req, res, next) {
    try {
      const filters = matchedData(req, { locations: ["query"] });
      const result = await CategoryService.listCategories(filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/categories/:id (public)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async getCategoryById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(
        Number(req.params.id),
      );
      res.status(200).json({ category });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/categories (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      res
        .status(201)
        .json({ message: "Category created successfully", category });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/categories/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(
        Number(req.params.id),
        req.body,
      );
      res
        .status(200)
        .json({ message: "Category updated successfully", category });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/categories/:id (admin)
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns {Promise<void>}
   */
  static async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
