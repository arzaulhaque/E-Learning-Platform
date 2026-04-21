const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
    },
    // URL pointing to the uploaded or hosted video for this lecture.
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    // Reference to the course this lecture belongs to.
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    // Zero-based order position of this lecture within its course.
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lecture", lectureSchema);
