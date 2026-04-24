const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const Enrollment = require("../models/Enrollment");

/**
 * @desc  Create a new course
 * @route POST /api/courses
 * @access Private — teacher, admin
 */
const createCourse = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Title and description are required" });
  }

  try {
    const course = await Course.create({
      title,
      description,
      teacherId: req.user._id,
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all approved courses (students/public) or all courses (admin/teacher)
 * @route GET /api/courses
 * @access Public
 */
const getCourses = async (req, res) => {
  try {
    // Admins and teachers can see unapproved courses; everyone else sees approved only.
    const filter =
      req.user && (req.user.role === "admin" || req.user.role === "teacher")
        ? {}
        : { isApproved: true };

    const courses = await Course.find(filter)
      .populate("teacherId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get a single course by ID (with its lectures)
 * @route GET /api/courses/:id
 * @access Public
 */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacherId", "name email")
      .populate("lectures");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Unapproved courses are only visible to admin and teacher roles.
    if (
      !course.isApproved &&
      req.user.role !== "admin" &&
      req.user.role !== "teacher"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "This course is not yet approved" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Update a course (teacher can update own course; admin can update any)
 * @route PUT /api/courses/:id
 * @access Private — teacher (own), admin
 */
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Teachers may only edit their own courses.
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to update this course",
      });
    }

    const { title, description } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;

    const updated = await course.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Delete a course and all its associated lectures and enrollments
 * @route DELETE /api/courses/:id
 * @access Private — teacher (own), admin
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Teachers may only delete their own courses.
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete this course",
      });
    }

    // Cascade: remove all lectures and enrollments belonging to this course.
    await Lecture.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ courseId: course._id });
    await course.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Approve or reject a course
 * @route PATCH /api/courses/:id/approve
 * @access Private — admin only
 */
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Allow explicit true/false from request body; default to toggling on.
    course.isApproved =
      typeof req.body.isApproved === "boolean" ? req.body.isApproved : true;

    const updated = await course.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  approveCourse,
};
