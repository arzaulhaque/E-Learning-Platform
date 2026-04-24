const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — verifies the Bearer JWT in the Authorization header.
 * On success it attaches the authenticated user document (without password)
 * to `req.user` and passes control to the next handler.
 * On failure it returns 401.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorised, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data (excludes password via schema `select: false`).
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorised, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorised, invalid token" });
  }
};

module.exports = { protect };
