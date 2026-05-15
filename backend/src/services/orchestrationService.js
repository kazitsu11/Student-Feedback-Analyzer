const ORCHESTRATION_URL = process.env.ORCHESTRATION_URL || "http://127.0.0.1:8000";
console.log("[orchestration] using URL:", ORCHESTRATION_URL);

const analyzeWithOrchestration = async (feedbacks) => {
  const response = await fetch(`${ORCHESTRATION_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedbacks }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Orchestration service error ${response.status}: ${text}`);
  }

  return response.json();
};

module.exports = { analyzeWithOrchestration };
