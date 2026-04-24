const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Limit repeated auth attempts to 20 per 15-minute window per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// POST /api/auth/register — create a new account
router.post("/register", authLimiter, register);

// POST /api/auth/login — authenticate and receive a token
router.post("/login", authLimiter, login);

module.exports = router;
