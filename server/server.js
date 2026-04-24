const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

// Load environment variables from .env file.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware setup.
app.use(cors());
app.use(express.json());

// General API rate limiter — 100 requests per 15 minutes per IP.
// Auth routes override this with a stricter limiter (20 req / 15 min).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use("/api/", apiLimiter);

// Basic health route to verify API availability.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Learning API is running",
  });
});

// Auth routes — register and login.
app.use("/api/auth", authRoutes);

// Course and lecture routes.
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);

// Enrollment and assignment routes.
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting incoming requests.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
