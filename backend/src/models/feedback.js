const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: String,
    },

    feedback: {
      type: String,
    },

    sentiment: {
      type: String,
    },

    themes: [String],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
