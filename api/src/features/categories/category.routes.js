/**
 * Category routes, mounted on /api/categories.
 * Reading is public (the events list and filters need it);
 * creating, renaming and deleting are for admins only.
 */
const express = require("express");
const CategoryController = require("./category.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateListCategories,
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
} = require("./category.validator");

const router = express.Router();

// Public
router.get("/", ...validateListCategories, CategoryController.listCategories);
router.get("/:id", ...validateCategoryId, CategoryController.getCategoryById);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("admin"),
  ...validateCreateCategory,
  CategoryController.createCategory,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  ...validateUpdateCategory,
  CategoryController.updateCategory,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  ...validateCategoryId,
  CategoryController.deleteCategory,
);

module.exports = router;
