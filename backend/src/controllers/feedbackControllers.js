const Feedback = require("../models/feedback");
const analyzeSentiment = require("../services/sentimentService");
const extractThemes=require("../services/themeServices")

const submitFeedback = async (req, res) => {
  try {

    const { student, feedback } = req.body;

    const sentiment = analyzeSentiment(feedback);
     const themes=extractThemes(feedback);
    const newFeedback = new Feedback({
      student,
      feedback,
      sentiment,
      themes,
    });

    await newFeedback.save();

    res.json({
      message: "Feedback submitted Successfully...",
      data: newFeedback,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = { submitFeedback };