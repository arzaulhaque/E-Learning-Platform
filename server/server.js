const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

// Load environment variables from .env file.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware setup.
app.use(cors());
app.use(express.json());

// Basic health route to verify API availability.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Learning API is running",
  });
});

// Auth routes — register and login.
app.use("/api/auth", authRoutes);

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
