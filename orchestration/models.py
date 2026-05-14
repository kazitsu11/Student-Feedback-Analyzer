from pydantic import BaseModel
from typing import Optional


class FeedbackItem(BaseModel):
    id: Optional[str] = None
    student: str
    feedback: str


class BatchAnalysisRequest(BaseModel):
    feedbacks: list[FeedbackItem]


class OutlierInfo(BaseModel):
    is_outlier: bool
    reason: Optional[str] = None


class SentimentResult(BaseModel):
    label: str       # positive | negative | neutral
    intensity: str   # mild | moderate | strong
    emotions: list[str]


class FeedbackAnalysis(BaseModel):
    id: Optional[str] = None
    student: str
    feedback: str
    sentiment: SentimentResult
    themes: list[str]
    outlier: OutlierInfo


class ActionableInsight(BaseModel):
    priority: str         # high | medium | low
    category: str
    suggestion: str
    expected_impact: str


class BatchAnalysisResult(BaseModel):
    total: int
    outlier_count: int
    analyses: list[FeedbackAnalysis]
    global_themes: dict
    sentiment_summary: dict
    key_patterns: list[str]
    actionable_insights: list[ActionableInsight]
    bias_report: dict
    pipeline_timings: dict
