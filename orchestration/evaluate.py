"""
evaluate.py — Evaluation Module for Student Feedback Analyzer
=============================================================
Runs the 5-stage AI pipeline against a golden-labeled dataset and
produces a structured EvaluationReport covering:

  1. Sentiment Accuracy        — label match vs. ground truth
  2. Outlier Detection         — precision, recall, F1
  3. Theme Coverage            — at-least-one-theme-match rate
  4. Insight Quality           — completeness score (high/med/low spread)
  5. Pipeline Performance      — per-stage latency + total time

Intended to be called via the FastAPI /evaluate endpoint or directly
from the command line:
    python evaluate.py
"""

import json
import time
from pathlib import Path
from typing import Optional

from pydantic import BaseModel

from models import FeedbackItem, ActionableInsight
from pipeline import FeedbackPipeline



class SentimentMetrics(BaseModel):
    total: int
    correct: int
    accuracy_pct: float
    per_label: dict          # {"positive": {"correct": x, "total": y}, ...}


class OutlierMetrics(BaseModel):
    true_positives: int      # correctly flagged outliers
    false_positives: int     # non-outliers wrongly flagged
    false_negatives: int     # real outliers missed
    precision_pct: float
    recall_pct: float
    f1_pct: float


class ThemeMetrics(BaseModel):
    evaluated: int           # items with ≥1 expected theme
    at_least_one_match: int  # items where pipeline found ≥1 correct theme
    coverage_pct: float


class InsightQualityMetrics(BaseModel):
    total_insights: int
    high_priority: int
    medium_priority: int
    low_priority: int
    categories_covered: list[str]
    completeness_score: float   # 0-100, rewards spread across priorities


class PerformanceMetrics(BaseModel):
    stage_timings: dict          # stage_key → seconds
    total_time_s: float
    avg_time_per_item_s: float


class EvaluationReport(BaseModel):
    evaluated_at: str
    dataset_size: int
    sentiment: SentimentMetrics
    outlier_detection: OutlierMetrics
    theme_coverage: ThemeMetrics
    insight_quality: InsightQualityMetrics
    performance: PerformanceMetrics
    overall_score: float         # 0-100 composite
    grade: str                   # A / B / C / D / F
    summary: str



GOLDEN_PATH = Path(__file__).parent / "golden_dataset.json"


def _grade(score: float) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def run_evaluation() -> EvaluationReport:
    with open(GOLDEN_PATH, "r", encoding="utf-8") as fh:
        golden = json.load(fh)

    feedback_items = [
        FeedbackItem(id=g["id"], student=g["student"], feedback=g["feedback"])
        for g in golden
    ]

    pipeline = FeedbackPipeline()
    t_start = time.time()
    result = pipeline.run(feedback_items)
    total_time = round(time.time() - t_start, 2)

    result_by_id = {a.id: a for a in result.analyses if a.id}

    per_label: dict = {}
    sent_correct = 0
    for g in golden:
        expected = g["expected_sentiment"]
        per_label.setdefault(expected, {"correct": 0, "total": 0})
        per_label[expected]["total"] += 1

        item = result_by_id.get(g["id"])
        if item and item.sentiment.label == expected:
            sent_correct += 1
            per_label[expected]["correct"] += 1

    sent_total = len(golden)
    sent_accuracy = round(sent_correct / sent_total * 100, 1) if sent_total else 0.0

    sentiment_metrics = SentimentMetrics(
        total=sent_total,
        correct=sent_correct,
        accuracy_pct=sent_accuracy,
        per_label=per_label,
    )

    tp = fp = fn = 0
    for g in golden:
        expected_outlier = g["is_outlier"]
        item = result_by_id.get(g["id"])
        predicted_outlier = item.outlier.is_outlier if item else False

        if expected_outlier and predicted_outlier:
            tp += 1
        elif not expected_outlier and predicted_outlier:
            fp += 1
        elif expected_outlier and not predicted_outlier:
            fn += 1

    precision = round(tp / (tp + fp) * 100, 1) if (tp + fp) > 0 else 0.0
    recall    = round(tp / (tp + fn) * 100, 1) if (tp + fn) > 0 else 0.0
    f1        = round(2 * precision * recall / (precision + recall), 1) \
                if (precision + recall) > 0 else 0.0

    outlier_metrics = OutlierMetrics(
        true_positives=tp,
        false_positives=fp,
        false_negatives=fn,
        precision_pct=precision,
        recall_pct=recall,
        f1_pct=f1,
    )

    theme_evaluated = 0
    theme_hit = 0
    for g in golden:
        expected_themes = [t.lower() for t in g.get("expected_themes", [])]
        if not expected_themes:
            continue
        theme_evaluated += 1
        item = result_by_id.get(g["id"])
        detected = [t.lower() for t in (item.themes if item else [])]
        if any(
            any(exp_word in det for det in detected)
            for exp_word in expected_themes
        ):
            theme_hit += 1

    coverage_pct = round(theme_hit / theme_evaluated * 100, 1) if theme_evaluated else 0.0

    theme_metrics = ThemeMetrics(
        evaluated=theme_evaluated,
        at_least_one_match=theme_hit,
        coverage_pct=coverage_pct,
    )

    insights: list[ActionableInsight] = result.actionable_insights
    high   = sum(1 for i in insights if i.priority == "high")
    medium = sum(1 for i in insights if i.priority == "medium")
    low    = sum(1 for i in insights if i.priority == "low")
    cats   = list({i.category for i in insights})

    priority_spread = min(high, 1) + min(medium, 1) + min(low, 1)   # 0-3
    cat_diversity   = min(len(cats) / 4, 1.0)                        # cap at 4 cats
    completeness    = round((priority_spread / 3 * 60) + (cat_diversity * 40), 1)

    insight_metrics = InsightQualityMetrics(
        total_insights=len(insights),
        high_priority=high,
        medium_priority=medium,
        low_priority=low,
        categories_covered=cats,
        completeness_score=completeness,
    )

    avg_per_item = round(total_time / len(golden), 2) if golden else 0.0

    performance_metrics = PerformanceMetrics(
        stage_timings=result.pipeline_timings,
        total_time_s=total_time,
        avg_time_per_item_s=avg_per_item,
    )

    overall = round(
        sent_accuracy    * 0.35 +
        f1               * 0.25 +
        coverage_pct     * 0.20 +
        completeness     * 0.20,
        1,
    )
    grade = _grade(overall)

    summary = (
        f"Evaluated {sent_total} feedback items against the golden dataset. "
        f"Sentiment accuracy: {sent_accuracy}%. "
        f"Outlier detection F1: {f1}% (precision {precision}%, recall {recall}%). "
        f"Theme coverage: {coverage_pct}% of items with expected themes matched. "
        f"Generated {len(insights)} actionable insights across {len(cats)} categories. "
        f"Pipeline completed in {total_time}s (~{avg_per_item}s per item). "
        f"Overall score: {overall}/100 (Grade: {grade})."
    )

    from datetime import datetime, timezone
    evaluated_at = datetime.now(timezone.utc).isoformat()

    return EvaluationReport(
        evaluated_at=evaluated_at,
        dataset_size=sent_total,
        sentiment=sentiment_metrics,
        outlier_detection=outlier_metrics,
        theme_coverage=theme_metrics,
        insight_quality=insight_metrics,
        performance=performance_metrics,
        overall_score=overall,
        grade=grade,
        summary=summary,
    )



if __name__ == "__main__":
    print("Running evaluation pipeline against golden dataset...")
    report = run_evaluation()
    print(json.dumps(report.model_dump(), indent=2))
