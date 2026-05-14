const extractThemes = (text) => {
  const themes = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes("faculty")) {
    themes.push("Faculty");
  }

  if (lowerText.includes("lab")) {
    themes.push("Labs");
  }

  if (lowerText.includes("placement")) {
    themes.push("Placement");
  }
  if (lowerText.includes("wifi")) {
    themes.push("wifi");
  }
  return themes;
};

module.exports = extractThemes;
