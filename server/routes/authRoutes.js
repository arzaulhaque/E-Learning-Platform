const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register — create a new account
router.post("/register", register);

// POST /api/auth/login — authenticate and receive a token
router.post("/login", login);

module.exports = router;
