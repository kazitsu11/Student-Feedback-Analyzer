import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import FeedbackForm from './components/FeedbackForm'
import SentimentResult from './components/SentimentResult'
import FeedbackHistory from './components/FeedbackHistory'
import AnalysisPanel from './components/AnalysisPanel'
import EvaluationPanel from './components/EvaluationPanel'
import styles from './App.module.css'

export default function App() {
  const [history, setHistory] = useState([])
  const [latestResult, setLatestResult] = useState(null)
  const [dbStats, setDbStats] = useState({ positive: 0, negative: 0, neutral: 0 })
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const [evalResult, setEvalResult] = useState(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [evalError, setEvalError] = useState('')
  const [showEval, setShowEval] = useState(false)

  // Fetch real counts from DB on mount
  useEffect(() => {
    axios.get('/api/analytics')
      .then((res) => setDbStats(res.data))
      .catch(() => {})
  }, [])

  const sessionCounts = {
    positive: history.filter((f) => f.sentiment === 'positive').length,
    negative: history.filter((f) => f.sentiment === 'negative').length,
    neutral:  history.filter((f) => f.sentiment === 'neutral').length,
  }

  const stats = {
    total: dbStats.positive + dbStats.negative + dbStats.neutral,
    positive: dbStats.positive,
    negative: dbStats.negative,
    neutral:  dbStats.neutral,
  }

  const handleResult = (data) => {
    setLatestResult(data)
    setHistory((prev) => [...prev, data])
    setDbStats((prev) => ({
      ...prev,
      [data.sentiment]: (prev[data.sentiment] || 0) + 1,
    }))
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError('')
    setAnalysisResult(null)
    try {
      const res = await axios.get('/api/analyze')
      setAnalysisResult(res.data)
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analysis failed. Make sure the orchestration service is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleEvaluate = async () => {
    setShowEval(true)
    setEvalLoading(true)
    setEvalError('')
    setEvalResult(null)
    try {
      const res = await axios.get('/api/evaluate')
      setEvalResult(res.data)
    } catch (err) {
      setEvalError(err.response?.data?.message || 'Evaluation failed. Make sure the orchestration service is running.')
    } finally {
      setEvalLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <Header
        stats={stats}
        onAnalyze={handleAnalyze}
        analyzing={analyzing}
        onEvaluate={handleEvaluate}
        evaluating={evalLoading}
      />

      <main className={styles.main}>
        <div className={styles.left}>
          <FeedbackForm onResult={handleResult} />
          {latestResult && <SentimentResult result={latestResult} />}
        </div>

        <div className={styles.right}>
          <FeedbackHistory history={history} />
          {history.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Submitted feedback will appear here.</p>
            </div>
          )}
        </div>
      </main>

      {analyzeError && (
        <div className={styles.analyzeError}>{analyzeError}</div>
      )}

      {analysisResult && (
        <AnalysisPanel
          result={analysisResult}
          onClose={() => setAnalysisResult(null)}
        />
      )}

      {showEval && (
        <EvaluationPanel
          result={evalResult}
          loading={evalLoading}
          error={evalError}
          onClose={() => setShowEval(false)}
        />
      )}

      <footer className={styles.footer}>
        <span>Student Feedback Analyzer</span>
        <span>·</span>
        <span>Hackathon #15 — Education & Learning</span>
      </footer>
    </div>
  )
}
