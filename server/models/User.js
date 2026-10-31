const mongoose = require("mongoose");

// Blueprint of one user in the database
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true }, // never the real password
    role: { type: String, enum: ["admin", "manager", "agent"], default: "manager" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
