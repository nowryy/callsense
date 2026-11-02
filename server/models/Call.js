const mongoose = require("mongoose");

// Blueprint of one call recording
const callSchema = new mongoose.Schema(
  {
    agentName: { type: String, required: true },
    originalName: String,   // the file name the manager uploaded
    audioUrl: { type: String, required: true }, // where the file is stored
    status: {
      type: String,
      enum: ["queued", "transcribing", "analyzing", "checking_policy", "done", "failed"],
      default: "queued",
    },
    durationSec: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // These stay empty for now. We fill them in during Weeks 2 to 4.
    transcript: [{ speaker: String, start: Number, end: Number, text: String }],
    analysis: {
      summary: String,
      sentiment: String,
      issueCategory: String,
      actionItems: [String],
      resolved: Boolean,
    },
    policyChecks: [
      { agentStatement: String, verdict: String, policySource: String, explanation: String },
    ],
    scores: { accuracy: Number, politeness: Number, resolution: Number },
  },
  { timestamps: true } // adds createdAt automatically
);

module.exports = mongoose.model("Call", callSchema);