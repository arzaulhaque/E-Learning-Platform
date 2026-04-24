const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

/**
 * @desc  Create an assignment for a course
 * @route POST /api/assignments
 * @access Private — teacher (own course), admin
 */
const createAssignment = async (req, res) => {
  const { courseId, title, question, dueDate } = req.body;

  if (!courseId || !title || !question) {
    return res.status(400).json({
      success: false,
      message: "courseId, title and question are required",
    });
  }

  try {
    const course = await Course.findById(String(courseId));

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to create assignments for this course",
      });
    }

    const assignment = await Assignment.create({
      courseId: course._id,
      title,
      question,
      dueDate: dueDate || null,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all assignments for a course
 * @route GET /api/assignments/course/:courseId
 * @access Private — enrolled students, teacher (own course), admin
 */
const getAssignmentsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(String(req.params.courseId));

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Students must be enrolled to see assignments.
    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to view its assignments",
        });
      }
    }

    const assignments = await Assignment.find({
      courseId: req.params.courseId,
    }).sort({ createdAt: -1 });

    // Strip other students' submissions from the response when caller is a student.
    const data =
      req.user.role === "student"
        ? assignments.map((a) => {
            const obj = a.toObject();
            obj.submissions = obj.submissions.filter(
              (s) => s.studentId.toString() === req.user._id.toString()
            );
            return obj;
          })
        : assignments;

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Submit a file for an assignment
 * @route POST /api/assignments/:id/submit
 * @access Private — student (enrolled in the course)
 */
const submitAssignment = async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res
      .status(400)
      .json({ success: false, message: "fileUrl is required" });
  }

  try {
    const assignment = await Assignment.findById(String(req.params.id));

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Verify the student is enrolled in the course.
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: assignment.courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to submit an assignment",
      });
    }

    // Prevent duplicate submissions from the same student.
    const alreadySubmitted = assignment.submissions.some(
      (s) => s.studentId.toString() === req.user._id.toString()
    );

    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this assignment",
      });
    }

    assignment.submissions.push({ studentId: req.user._id, fileUrl });
    await assignment.save();

    const submission =
      assignment.submissions[assignment.submissions.length - 1];

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Grade (and optionally give feedback on) a student's submission
 * @route PATCH /api/assignments/:id/submissions/:submissionId/grade
 * @access Private — teacher (own course), admin
 */
const gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;

  if (grade === undefined || grade === null) {
    return res
      .status(400)
      .json({ success: false, message: "grade is required" });
  }

  if (typeof grade !== "number" || grade < 0 || grade > 100) {
    return res
      .status(400)
      .json({ success: false, message: "grade must be a number between 0 and 100" });
  }

  try {
    const assignment = await Assignment.findById(String(req.params.id));

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Ownership check for teachers.
    if (req.user.role === "teacher") {
      const course = await Course.findById(assignment.courseId);
      if (!course || course.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to grade submissions for this assignment",
        });
      }
    }

    const submission = assignment.submissions.id(req.params.submissionId);

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    submission.grade = grade;
    if (feedback !== undefined) submission.feedback = feedback;

    await assignment.save();

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Delete an assignment (and all its submissions)
 * @route DELETE /api/assignments/:id
 * @access Private — teacher (own course), admin
 */
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(String(req.params.id));

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (req.user.role === "teacher") {
      const course = await Course.findById(assignment.courseId);
      if (!course || course.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to delete this assignment",
        });
      }
    }

    await assignment.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  gradeSubmission,
  deleteAssignment,
};
