const CategoryController = require("./category.controller");
const express = require("express");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateListCategories,
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
} = require("./category.validator");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize,
  ...validateListCategories,
  CategoryController.listCategories,
);

router.get(
  "/id",
  authenticate,
  ...validateCategoryId,

  CategoryController.getCategoryById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  ...validateCreateCategory,
  CategoryController.createCategory,
);

router.put(
  "/id",
  authenticate,
  authorize("admin"),
  ...validateUpdateCategory,
  CategoryController.updateCategory,
);

router.delete(
  "/id",
  authenticate,
  authorize("admin"),
  ...validateCategoryId,
  CategoryController.deleteCategory,
);
