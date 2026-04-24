const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  approveCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET  /api/courses        — list courses (auth optional: role governs visibility)
// POST /api/courses        — create a course (teacher, admin)
router
  .route("/")
  .get(protect, getCourses)
  .post(protect, authorise("teacher", "admin"), createCourse);

// GET    /api/courses/:id  — get one course with lectures
// PUT    /api/courses/:id  — update course (teacher owns it, admin)
// DELETE /api/courses/:id  — delete course + cascade (teacher owns it, admin)
router
  .route("/:id")
  .get(protect, getCourseById)
  .put(protect, authorise("teacher", "admin"), updateCourse)
  .delete(protect, authorise("teacher", "admin"), deleteCourse);

// PATCH /api/courses/:id/approve — admin approves or rejects a course
router.patch(
  "/:id/approve",
  protect,
  authorise("admin"),
  approveCourse
);

module.exports = router;
