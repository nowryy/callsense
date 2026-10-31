const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Makes a signed token (the "wristband") that lasts 7 days
function makeToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check that all fields were sent
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Stop duplicate emails
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3. Scramble the password (10 = how strong the scrambling is)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Public sign-up can only create manager or agent, never admin
    const safeRole = ["manager", "agent"].includes(role) ? role : "manager";

    // 5. Save the user
    const user = await User.create({ name, email, passwordHash, role: safeRole });

    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: (email || "").toLowerCase() });
    // Same message for both cases, so attackers can't tell which part was wrong
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password || "", user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
