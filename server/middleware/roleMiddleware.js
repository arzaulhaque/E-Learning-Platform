/**
 * Role middleware factory — restricts a route to users whose role matches
 * one of the provided allowed roles.
 *
 * Must be used **after** the `protect` middleware so that `req.user` is set.
 *
 * @param {...string} allowedRoles - One or more role strings to permit
 * @returns Express middleware function
 *
 * @example
 * router.post("/course", protect, authorise("teacher", "admin"), createCourse);
 */
const authorise = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }
    next();
  };
};

module.exports = { authorise };
