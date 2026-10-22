/**
 * Auth routes, mounted on /api/auth.
 */
const express = require("express");
const AuthController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.validator");

const router = express.Router();

router.post("/register", ...validateRegister, AuthController.register);
router.post("/login", ...validateLogin, AuthController.login);

console.log(
  "Register Validators:",
  Array.isArray(validateRegister)
    ? validateRegister.map((v) => typeof v)
    : typeof validateRegister,
);

console.log(
  "Login Validators:",
  Array.isArray(validateLogin)
    ? validateLogin.map((v) => typeof v)
    : typeof validateLogin,
);

module.exports = router;
