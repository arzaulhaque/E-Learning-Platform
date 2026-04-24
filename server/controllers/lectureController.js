const Course = require("../models/Course");
const Lecture = require("../models/Lecture");

/**
 * @desc  Add a new lecture to a course
 * @route POST /api/lectures
 * @access Private — teacher (own course), admin
 */
const addLecture = async (req, res) => {
  const { title, videoUrl, courseId, order } = req.body;

  if (!title || !videoUrl || !courseId) {
    return res.status(400).json({
      success: false,
      message: "Title, videoUrl and courseId are required",
    });
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Teachers may only add lectures to their own courses.
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to add lectures to this course",
      });
    }

    const lecture = await Lecture.create({ title, videoUrl, courseId, order });

    // Keep the lectures array on the course document in sync.
    course.lectures.push(lecture._id);
    await course.save();

    res.status(201).json({ success: true, data: lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all lectures for a specific course
 * @route GET /api/lectures/course/:courseId
 * @access Private — enrolled students, teacher (own), admin
 */
const getLecturesByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lectures = await Lecture.find({ courseId: req.params.courseId }).sort(
      { order: 1, createdAt: 1 }
    );

    res
      .status(200)
      .json({ success: true, count: lectures.length, data: lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Update a lecture
 * @route PUT /api/lectures/:id
 * @access Private — teacher (own course), admin
 */
const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    // Verify ownership when the requester is a teacher.
    if (req.user.role === "teacher") {
      const course = await Course.findById(lecture.courseId);
      if (!course || course.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to update this lecture",
        });
      }
    }

    const { title, videoUrl, order } = req.body;
    if (title !== undefined) lecture.title = title;
    if (videoUrl !== undefined) lecture.videoUrl = videoUrl;
    if (order !== undefined) lecture.order = order;

    const updated = await lecture.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Delete a lecture
 * @route DELETE /api/lectures/:id
 * @access Private — teacher (own course), admin
 */
const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    // Verify ownership when the requester is a teacher.
    if (req.user.role === "teacher") {
      const course = await Course.findById(lecture.courseId);
      if (!course || course.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to delete this lecture",
        });
      }
    }

    // Remove the lecture reference from the parent course.
    await Course.findByIdAndUpdate(lecture.courseId, {
      $pull: { lectures: lecture._id },
    });

    await lecture.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addLecture, getLecturesByCourse, updateLecture, deleteLecture };
