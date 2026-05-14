import json
import time
import anthropic
from models import (
    FeedbackItem, FeedbackAnalysis, OutlierInfo,
    SentimentResult, ActionableInsight, BatchAnalysisResult,
)

_SYSTEM = (
    "You are an expert educational data analyst. "
    "You analyze student feedback to help institutions improve. "
    "Always respond with valid JSON only — no markdown, no explanation, no extra text."
)

MODEL = "claude-haiku-4-5-20251001"


class FeedbackPipeline:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self._timings: dict = {}


    def _call(self, prompt: str) -> str:
        response = self.client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=[{
                "type": "text",
                "text": _SYSTEM,
                "cache_control": {"type": "ephemeral"},   # prompt caching
            }],
            messages=[{"role": "user", "content": prompt}],
            extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
        )
        return response.content[0].text.strip()

    def _parse(self, raw: str):
        text = raw.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            end = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
            text = "\n".join(lines[1:end])
        return json.loads(text)

    def _timed(self, name: str, fn):
        t0 = time.time()
        result = fn()
        self._timings[name] = round(time.time() - t0, 2)
        return result


    def _detect_outliers(self, feedbacks: list[FeedbackItem]) -> list[dict]:
        items = [{"index": i, "student": f.student, "text": f.feedback}
                 for i, f in enumerate(feedbacks)]
        prompt = f"""STAGE 1 — Outlier & Bias Detection

Identify which of the {len(feedbacks)} feedback responses are low-quality or biased.
Flag as outlier if the response is:
- Spam, gibberish, or random characters
- Extremely vague (single word like "ok" or "good" with zero context)
- Off-topic and unrelated to educational experience
- Suspiciously extreme without any supporting detail (possible bias injection)

Input:
{json.dumps(items)}

Return a JSON array with one object per feedback:
[{{"index": 0, "is_outlier": false, "reason": null}}, ...]

Reason must be a short string when is_outlier is true, otherwise null."""

        results = self._parse(self._call(prompt))
        return results


    def _discover_themes(self, feedbacks: list[FeedbackItem], outlier_map: dict) -> dict:
        valid = [f.feedback for i, f in enumerate(feedbacks)
                 if not outlier_map.get(i, False)]
        if not valid:
            return {}

        prompt = f"""STAGE 2 — Dynamic Theme Discovery

Analyse {len(valid)} student feedback responses and discover the key recurring themes.
Do NOT use hardcoded categories — discover what students actually talk about.

Feedbacks:
{json.dumps(valid)}

Return a JSON object where each key is a theme name (2–4 words, title case) and
the value is a list of representative keywords for that theme. Aim for 5–10 themes.

Example format:
{{
  "Teaching Quality": ["professor", "explains", "lecture", "boring", "engaging"],
  "Lab Facilities": ["lab", "equipment", "computers", "broken"]
}}"""

        return self._parse(self._call(prompt))


    def _analyze_sentiments(self, feedbacks: list[FeedbackItem], themes: dict) -> list[dict]:
        theme_names = list(themes.keys())
        items = [{"index": i, "text": f.feedback} for i, f in enumerate(feedbacks)]

        prompt = f"""STAGE 3 — Deep Sentiment Analysis

Analyse the sentiment and themes for each student feedback.

Known themes to detect: {json.dumps(theme_names)}

Feedbacks:
{json.dumps(items)}

For every feedback return:
- index: same as input
- sentiment: "positive", "negative", or "neutral"
- intensity: "mild", "moderate", or "strong"
- emotions: list of 1–3 specific emotions (e.g. "frustrated", "grateful", "anxious", "hopeful", "satisfied")
- detected_themes: list of matching theme names from the provided list

Return a JSON array."""

        return self._parse(self._call(prompt))


    def _synthesize_patterns(
        self,
        feedbacks: list[FeedbackItem],
        outlier_map: dict,
        theme_counts: dict,
        sentiment_counts: dict,
    ) -> list[str]:
        valid_texts = [f.feedback for i, f in enumerate(feedbacks)
                       if not outlier_map.get(i, False)][:20]  # cap for token budget

        prompt = f"""STAGE 4 — Cross-feedback Pattern Synthesis

Identify 5–7 meaningful patterns across all student feedback.

Theme distribution (theme → count): {json.dumps(theme_counts)}
Sentiment breakdown: {json.dumps(sentiment_counts)}
Total responses: {len(feedbacks)}, Outliers removed: {sum(outlier_map.values())}

Representative feedback samples:
{json.dumps(valid_texts)}

Each pattern should be a specific, evidence-backed insight, e.g.:
- "Negative sentiment around lab equipment appears in X% of responses, mostly from CS students"
- "Faculty teaching quality receives mixed feedback — praised for knowledge but criticised for pace"

Return a JSON array of 5–7 pattern strings."""

        return self._parse(self._call(prompt))


    def _generate_actions(
        self,
        patterns: list[str],
        theme_counts: dict,
        sentiment_counts: dict,
    ) -> list[dict]:
        prompt = f"""STAGE 5 — Actionable Insight Generation

Based on the analysis below, generate 4–6 specific, prioritised recommendations
for the institution to act on.

Key patterns:
{json.dumps(patterns)}

Theme distribution: {json.dumps(theme_counts)}
Sentiment: {json.dumps(sentiment_counts)}

Each recommendation must be concrete, not vague.
BAD: "Improve faculty performance"
GOOD: "Introduce peer observation sessions for faculty, focusing on pacing and clarity of explanation"

Return a JSON array:
[
  {{
    "priority": "high",
    "category": "Teaching Quality",
    "suggestion": "Specific action to take...",
    "expected_impact": "What measurable improvement this will create..."
  }}
]"""

        return self._parse(self._call(prompt))


    def run(self, feedbacks: list[FeedbackItem]) -> BatchAnalysisResult:
        self._timings = {}

        raw_outliers = self._timed(
            "1_outlier_detection",
            lambda: self._detect_outliers(feedbacks),
        )
        outlier_map = {r["index"]: r.get("is_outlier", False) for r in raw_outliers}
        outlier_reasons = {r["index"]: r.get("reason") for r in raw_outliers}

        themes = self._timed(
            "2_theme_discovery",
            lambda: self._discover_themes(feedbacks, outlier_map),
        )

        sentiment_rows = self._timed(
            "3_sentiment_analysis",
            lambda: self._analyze_sentiments(feedbacks, themes),
        )
        sentiment_by_idx = {r["index"]: r for r in sentiment_rows}

        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        theme_counts = {t: 0 for t in themes}
        analyses: list[FeedbackAnalysis] = []

        for i, f in enumerate(feedbacks):
            sr = sentiment_by_idx.get(i, {
                "sentiment": "neutral", "intensity": "mild",
                "emotions": [], "detected_themes": [],
            })
            label = sr.get("sentiment", "neutral")
            sentiment_counts[label] = sentiment_counts.get(label, 0) + 1

            detected = sr.get("detected_themes", [])
            for t in detected:
                if t in theme_counts:
                    theme_counts[t] += 1

            analyses.append(FeedbackAnalysis(
                id=f.id,
                student=f.student,
                feedback=f.feedback,
                sentiment=SentimentResult(
                    label=label,
                    intensity=sr.get("intensity", "mild"),
                    emotions=sr.get("emotions", []),
                ),
                themes=detected,
                outlier=OutlierInfo(
                    is_outlier=outlier_map.get(i, False),
                    reason=outlier_reasons.get(i),
                ),
            ))

        patterns = self._timed(
            "4_pattern_synthesis",
            lambda: self._synthesize_patterns(
                feedbacks, outlier_map, theme_counts, sentiment_counts
            ),
        )

        raw_actions = self._timed(
            "5_action_generation",
            lambda: self._generate_actions(patterns, theme_counts, sentiment_counts),
        )
        actions = [ActionableInsight(**a) for a in raw_actions]

        outlier_count = sum(outlier_map.values())

        return BatchAnalysisResult(
            total=len(feedbacks),
            outlier_count=outlier_count,
            analyses=analyses,
            global_themes=theme_counts,
            sentiment_summary=sentiment_counts,
            key_patterns=patterns,
            actionable_insights=actions,
            bias_report={
                "total_responses": len(feedbacks),
                "outliers_detected": outlier_count,
                "outlier_rate_pct": round(outlier_count / len(feedbacks) * 100, 1) if feedbacks else 0,
                "valid_responses_analysed": len(feedbacks) - outlier_count,
            },
            pipeline_timings=self._timings,
        )
