import { useState } from 'react'
import Header from './components/Header'
import FeedbackForm from './components/FeedbackForm'
import SentimentResult from './components/SentimentResult'
import FeedbackHistory from './components/FeedbackHistory'
import styles from './App.module.css'

export default function App() {
  const [history, setHistory] = useState([])
  const [latestResult, setLatestResult] = useState(null)

  const stats = {
    total: history.length,
    positive: history.filter((f) => f.sentiment === 'positive').length,
    negative: history.filter((f) => f.sentiment === 'negative').length,
    neutral:  history.filter((f) => f.sentiment === 'neutral').length,
  }

  const handleResult = (data) => {
    setLatestResult(data)
    setHistory((prev) => [...prev, data])
  }

  return (
    <div className={styles.app}>
      <Header stats={stats} />

      <main className={styles.main}>
        <div className={styles.left}>
          <FeedbackForm onResult={handleResult} />
          {latestResult && <SentimentResult result={latestResult} />}
        </div>

        <div className={styles.right}>
          <FeedbackHistory history={history} />
          {history.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>
                Submitted feedback will appear here.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Student Feedback Analyzer</span>
        <span>·</span>
        <span>Hackathon #15 — Education & Learning</span>
      </footer>
    </div>
  )
}
