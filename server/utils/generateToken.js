const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT containing the user's id and role.
 * The token expires after the duration configured in JWT_EXPIRES_IN
 * (defaults to 7 days when the variable is not set).
 *
 * @param {string} id   - MongoDB ObjectId of the user
 * @param {string} role - Role of the user (student | teacher | admin)
 * @returns {string} Signed JWT string
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
