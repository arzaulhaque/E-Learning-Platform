const express = require("express");
const {
  addLecture,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
} = require("../controllers/lectureController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /api/lectures              — add a lecture to a course (teacher, admin)
router.post("/", protect, authorise("teacher", "admin"), addLecture);

// GET  /api/lectures/course/:courseId — list lectures for a course (authenticated)
router.get("/course/:courseId", protect, getLecturesByCourse);

// PUT    /api/lectures/:id        — update a lecture (teacher owns course, admin)
// DELETE /api/lectures/:id        — delete a lecture (teacher owns course, admin)
router
  .route("/:id")
  .put(protect, authorise("teacher", "admin"), updateLecture)
  .delete(protect, authorise("teacher", "admin"), deleteLecture);

module.exports = router;
