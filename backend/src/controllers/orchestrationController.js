const Feedback = require("../models/feedback");
const { analyzeWithOrchestration } = require("../services/orchestrationService");

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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeAll };
