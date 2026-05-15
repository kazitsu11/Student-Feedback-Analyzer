const Feedback = require("../models/feedback");
const { analyzeWithOrchestration } = require("../services/orchestrationService");

const ORCHESTRATION_URL = process.env.ORCHESTRATION_URL || "http://localhost:8000";

const analyzeAll = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (feedbacks.length === 0) {
      return res.status(400).json({ message: "No feedback in database to analyse" });
    }

    const payload = feedbacks.map((f) => ({
      id: f._id.toString(),
      student: f.student,
      feedback: f.feedback,
    }));

    const result = await analyzeWithOrchestration(payload);
    res.json(result);
  } catch (error) {
    console.error("[orchestration] analyze failed:", error);
    res.status(500).json({ message: error.message });
  }
};

const runEvaluation = async (req, res) => {
  try {
    const response = await fetch(`${ORCHESTRATION_URL}/evaluate`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Evaluation service error ${response.status}: ${text}`);
    }
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeAll, runEvaluation };
