const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables.
    const connection = await mongoose.connect(process.env.MONGO_URI);

    // Log database host on successful connection.
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    // Fail fast if database connection is not available.
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
