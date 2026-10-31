const mongoose = require("mongoose");

// Connects to MongoDB using the link stored in .env
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the server if the database is not reachable
  }
}

module.exports = connectDB;
