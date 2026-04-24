const express = require("express");
const {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  gradeSubmission,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /api/assignments              — teacher/admin creates an assignment
router.post("/", protect, authorise("teacher", "admin"), createAssignment);

// GET /api/assignments/course/:courseId — list assignments for a course
//   students (enrolled only) see only their own submissions
//   teachers (own course) and admins see all submissions
router.get("/course/:courseId", protect, getAssignmentsByCourse);

// POST /api/assignments/:id/submit   — enrolled student submits a file
router.post(
  "/:id/submit",
  protect,
  authorise("student"),
  submitAssignment
);

// PATCH /api/assignments/:id/submissions/:submissionId/grade
//   teacher (own course) or admin grades a submission
router.patch(
  "/:id/submissions/:submissionId/grade",
  protect,
  authorise("teacher", "admin"),
  gradeSubmission
);

// DELETE /api/assignments/:id        — teacher (own course) or admin deletes assignment
router.delete("/:id", protect, authorise("teacher", "admin"), deleteAssignment);

module.exports = router;
