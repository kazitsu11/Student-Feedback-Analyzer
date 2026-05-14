import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY is not set in environment")

from models import BatchAnalysisRequest, BatchAnalysisResult
from pipeline import FeedbackPipeline
from evaluate import EvaluationReport, run_evaluation

app = FastAPI(title="Feedback Orchestration Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_pipeline = FeedbackPipeline()


@app.get("/health")
def health():
    return {"status": "ok", "service": "orchestration"}


@app.post("/analyze", response_model=BatchAnalysisResult)
def analyze(request: BatchAnalysisRequest):
    if not request.feedbacks:
        raise HTTPException(status_code=400, detail="No feedback items provided")
    if len(request.feedbacks) > 200:
        raise HTTPException(status_code=400, detail="Max 200 feedback items per request")
    return _pipeline.run(request.feedbacks)


@app.get("/evaluate", response_model=EvaluationReport)
def evaluate():
    """Run the evaluation suite against the golden dataset and return metrics."""
    return run_evaluation()
