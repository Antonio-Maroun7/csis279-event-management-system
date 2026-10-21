/**
 * User routes, mounted on /api/users.
 * The /me routes must stay before the /:id routes.
 */
const express = require("express");
const UserController = require("./user.controller");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const {
  validateUserId,
  validateUpdateMe,
  validateChangePassword,
  validateListUsers,
  validateChangeRole,
} = require("./user.validator");

const router = express.Router();

// Every user route needs a logged-in user
router.use(authenticate);

// Logged-in user's own account
router.get("/me", UserController.getMe);
router.put("/me", ...validateUpdateMe, UserController.updateMe);
router.patch(
  "/me/password",
  ...validateChangePassword,
  UserController.changePassword,
);

// Admin user management
router.get(
  "/",
  authorize("admin"),
  ...validateListUsers,
  UserController.listUsers,
);
router.get(
  "/:id",
  authorize("admin"),
  ...validateUserId,
  UserController.getUserById,
);
router.patch(
  "/:id/role",
  authorize("admin"),
  ...validateChangeRole,
  UserController.changeRole,
);
router.delete(
  "/:id",
  authorize("admin"),
  ...validateUserId,
  UserController.deleteUser,
);

module.exports = router;
