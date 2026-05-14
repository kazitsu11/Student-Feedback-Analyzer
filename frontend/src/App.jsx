import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import FeedbackForm from './components/FeedbackForm'
import SentimentResult from './components/SentimentResult'
import FeedbackHistory from './components/FeedbackHistory'
import AnalysisPanel from './components/AnalysisPanel'
import EvaluationPanel from './components/EvaluationPanel'
import styles from './App.module.css'

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',     icon: '⊞' },
  { id: 'feedback',  label: 'All Feedback',  icon: '☰' },
  { id: 'analytics', label: 'Analytics',     icon: '⊟' },
]

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

  const [activeNav, setActiveNav] = useState('feedback')

  useEffect(() => {
    axios.get('/api/analytics')
      .then((res) => setDbStats(res.data))
      .catch(() => {})
  }, [])

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

  const pageTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Dashboard'

  return (
    <div className={styles.app}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>IA</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>InsightAI</span>
            <span className={styles.brandSub}>Academic Intelligence</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.submitFeedbackBtn}
            onClick={() => setActiveNav('feedback')}
          >
            Submit Feedback
          </button>
          <button className={styles.navItem} style={{ color: 'var(--text-muted)' }}>
            <span className={styles.navIcon}>?</span>
            Help Center
          </button>
          <button className={styles.navItem} style={{ color: 'var(--text-muted)' }}>
            <span className={styles.navIcon}>◯</span>
            Account
          </button>
        </div>
      </aside>

      {/* ── Main Shell ── */}
      <div className={styles.shell}>
        {/* Top bar */}
        <div className={styles.topbar}>
          <span className={styles.topbarTitle}>{pageTitle}</span>
          <div className={styles.topbarRight}>
            <span className={styles.topbarMeta}>Draft saved 2m ago</span>
            <div className={styles.topbarIcon}>🔔</div>
            <div className={styles.topbarIcon}>⚙</div>
          </div>
        </div>

        {/* Header with stats + actions */}
        <Header
          stats={stats}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          onEvaluate={handleEvaluate}
          evaluating={evalLoading}
        />

        {/* Main 2-col grid */}
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
          <div className={styles.panelWrap}>
            <AnalysisPanel
              result={analysisResult}
              onClose={() => setAnalysisResult(null)}
            />
          </div>
        )}

        {showEval && (
          <div className={styles.panelWrap}>
            <EvaluationPanel
              result={evalResult}
              loading={evalLoading}
              error={evalError}
              onClose={() => setShowEval(false)}
            />
          </div>
        )}

        <footer className={styles.footer}>
          <span>Student Feedback Analyzer</span>
          <span>·</span>
          <span>Hackathon #15 — Education &amp; Learning</span>
        </footer>
      </div>
    </div>
  )
}
