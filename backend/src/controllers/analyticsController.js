const Feedback = require("../models/feedback");
const getAnalytics = async (req, res) => {
  const positive = await Feedback.countDocuments({
    sentiment: "positive",
  });

  const negative = await Feedback.countDocuments({
    sentiment: "negative",
  });

  const neutral = await Feedback.countDocuments({
    sentiment: "neutral",
  });

  res.json({
    positive,
    negative,
    neutral,
  });
};

module.exports = { getAnalytics };
