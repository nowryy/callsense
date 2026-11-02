const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Call = require("../models/Call");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Make sure the uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// multer settings: where to save and what to name the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // max 25 MB
  fileFilter: (req, file, cb) => {
    // Only accept audio files
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Only audio files are allowed"));
  },
});

// POST /api/calls  (managers and admins upload a call)
router.post(
  "/",
  requireAuth,
  requireRole("manager", "admin"),
  upload.single("audio"), // the form field must be named "audio"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please attach an audio file" });
      }
      if (!req.body.agentName) {
        return res.status(400).json({ message: "agentName is required" });
      }

      const call = await Call.create({
        agentName: req.body.agentName,
        originalName: req.file.originalname,
        audioUrl: "/uploads/" + req.file.filename,
        uploadedBy: req.user.id,
      });

      res.status(201).json(call);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET /api/calls  (list of calls, newest first, without the long transcript)
router.get("/", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  try {
    const calls = await Call.find().select("-transcript").sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/calls/:id  (one full call)
router.get("/:id", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid call id" });
    }
    const call = await Call.findById(req.params.id);
    if (!call) return res.status(404).json({ message: "Call not found" });
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Catches errors thrown by multer (wrong file type, file too big)
router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

module.exports = router;