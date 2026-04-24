const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

/**
 * @desc  Enroll the authenticated student in a course
 * @route POST /api/enrollments
 * @access Private — student only
 */
const enroll = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res
      .status(400)
      .json({ success: false, message: "courseId is required" });
  }

  try {
    const course = await Course.findById(String(courseId));

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.isApproved) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot enroll in an unapproved course" });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId: course._id,
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    // Duplicate-key error means the student is already enrolled.
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Already enrolled in this course" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Unenroll the authenticated student from a course
 * @route DELETE /api/enrollments/:courseId
 * @access Private — student only
 */
const unenroll = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      studentId: req.user._id,
      courseId: String(req.params.courseId),
    });

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all courses the authenticated student is enrolled in
 * @route GET /api/enrollments/my
 * @access Private — student
 */
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: "courseId",
        select: "title description teacherId isApproved",
        populate: { path: "teacherId", select: "name email" },
      })
      .sort({ enrolledAt: -1 });

    res
      .status(200)
      .json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all students enrolled in a specific course (teacher/admin)
 * @route GET /api/enrollments/course/:courseId
 * @access Private — teacher (own course), admin
 */
const getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(String(req.params.courseId));

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Teachers may only view their own course's enrolments.
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to view enrollments for this course",
      });
    }

    const enrollments = await Enrollment.find({
      courseId: req.params.courseId,
    })
      .populate("studentId", "name email")
      .sort({ enrolledAt: -1 });

    res
      .status(200)
      .json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { enroll, unenroll, getMyEnrollments, getEnrolledStudents };
