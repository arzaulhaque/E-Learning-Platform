const mongoose = require("mongoose");

// Sub-schema for individual student submissions on an assignment.
const submissionSchema = new mongoose.Schema(
  {
    // Student who submitted the assignment.
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // URL or file path of the submitted file.
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    // Numeric grade assigned by the teacher after review; null until graded.
    grade: {
      type: Number,
      default: null,
    },
    // Optional teacher feedback comment.
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const assignmentSchema = new mongoose.Schema(
  {
    // Course to which this assignment belongs.
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    // Full question or instructions for the assignment.
    question: {
      type: String,
      required: [true, "Assignment question is required"],
      trim: true,
    },
    // Due date for submission (optional).
    dueDate: {
      type: Date,
      default: null,
    },
    // All student submissions for this assignment.
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
