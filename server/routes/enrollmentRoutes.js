const express = require("express");
const {
  enroll,
  unenroll,
  getMyEnrollments,
  getEnrolledStudents,
} = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /api/enrollments              — student enrols in a course
router.post("/", protect, authorise("student"), enroll);

// DELETE /api/enrollments/:courseId  — student unenrols from a course
router.delete("/:courseId", protect, authorise("student"), unenroll);

// GET /api/enrollments/my            — student views their own enrolments
router.get("/my", protect, authorise("student"), getMyEnrollments);

// GET /api/enrollments/course/:courseId — teacher/admin views enrolled students
router.get(
  "/course/:courseId",
  protect,
  authorise("teacher", "admin"),
  getEnrolledStudents
);

module.exports = router;
