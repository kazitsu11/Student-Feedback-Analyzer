const Sentiment = require("sentiment");

const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);

  if (result.score > 0) {
    return "positive";
  }
  if (result.score < 0) {
    return "negative";
  }

  return "neutral";
};

module.exports = analyzeSentiment;
