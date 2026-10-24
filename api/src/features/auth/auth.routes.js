/**
 * Auth routes, mounted on /api/auth.
 */
const express = require("express");
const AuthController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.validator");

const router = express.Router();

router.post("/register", ...validateRegister, AuthController.register);
router.post("/login", ...validateLogin, AuthController.login);

module.exports = router;
