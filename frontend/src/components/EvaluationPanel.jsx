import { useState } from 'react'
import styles from './EvaluationPanel.module.css'

const GRADE_COLOR = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#ef4444' }

function ScoreRing({ score, grade }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ

  return (
    <div className={styles.ringWrap}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="68" cy="68" r={radius} fill="none"
          stroke={GRADE_COLOR[grade] || '#6366f1'}
          strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringScore} style={{ color: GRADE_COLOR[grade] }}>{score}</span>
        <span className={styles.ringGrade} style={{ color: GRADE_COLOR[grade] }}>Grade {grade}</span>
      </div>
    </div>
  )
}

function MetricBar({ label, value, max = 100, color = '#6366f1' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricTrack}>
        <div className={styles.metricFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.metricVal}>{value}%</span>
    </div>
  )
}

function StatChip({ label, value, accent }) {
  return (
    <div className={`${styles.statChip} ${accent ? styles[`chip_${accent}`] : ''}`}>
      <span className={styles.chipVal}>{value}</span>
      <span className={styles.chipLbl}>{label}</span>
    </div>
  )
}

export default function EvaluationPanel({ result, onClose, loading, error }) {
  const [tab, setTab] = useState('overview')

  if (loading) return (
    <section className={styles.panel}>
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Running evaluation pipeline against golden dataset…</p>
        <p className={styles.loadingSubtext}>This may take 30–60 seconds</p>
      </div>
    </section>
  )

  if (error) return (
    <section className={styles.panel}>
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}>⚠</span>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </section>
  )

  if (!result) return null

  const { sentiment, outlier_detection, theme_coverage, insight_quality, performance, overall_score, grade, summary, dataset_size, evaluated_at } = result

  const evalDate = new Date(evaluated_at).toLocaleString()

  return (
    <section className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>📊 Evaluation Report</h2>
          <p className={styles.subtitle}>Golden dataset · {dataset_size} samples · {evalDate}</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* ── Overview strip ── */}
      <div className={styles.overview}>
        <ScoreRing score={overall_score} grade={grade} />
        <div className={styles.overviewStats}>
          <p className={styles.summaryText}>{summary}</p>
          <div className={styles.chips}>
            <StatChip label="Sentiment Acc." value={`${sentiment.accuracy_pct}%`} accent="blue" />
            <StatChip label="Outlier F1" value={`${outlier_detection.f1_pct}%`} accent="purple" />
            <StatChip label="Theme Coverage" value={`${theme_coverage.coverage_pct}%`} accent="teal" />
            <StatChip label="Insight Score" value={`${insight_quality.completeness_score}%`} accent="amber" />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {['overview', 'sentiment', 'outliers', 'themes', 'insights', 'performance'].map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className={styles.tabContent}>

        {tab === 'overview' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Score Breakdown</h3>
            <MetricBar label="Sentiment Accuracy"    value={sentiment.accuracy_pct}             color="#6366f1" />
            <MetricBar label="Outlier Detection F1"  value={outlier_detection.f1_pct}           color="#8b5cf6" />
            <MetricBar label="Theme Coverage"        value={theme_coverage.coverage_pct}        color="#14b8a6" />
            <MetricBar label="Insight Completeness"  value={insight_quality.completeness_score} color="#f59e0b" />
          </div>
        )}

        {tab === 'sentiment' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Sentiment Analysis Accuracy</h3>
            <div className={styles.bigStat}>
              <span className={styles.bigNum}>{sentiment.accuracy_pct}%</span>
              <span className={styles.bigLabel}>{sentiment.correct} / {sentiment.total} correct</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Label</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr>
                </thead>
                <tbody>
                  {Object.entries(sentiment.per_label).map(([label, d]) => (
                    <tr key={label}>
                      <td><span className={`${styles.badge} ${styles[`badge_${label}`]}`}>{label}</span></td>
                      <td>{d.correct}</td>
                      <td>{d.total}</td>
                      <td>{d.total ? `${Math.round(d.correct / d.total * 100)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'outliers' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Outlier & Bias Detection</h3>
            <div className={styles.triStat}>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#22c55e' }}>{outlier_detection.precision_pct}%</span>
                <span className={styles.triLbl}>Precision</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#6366f1' }}>{outlier_detection.recall_pct}%</span>
                <span className={styles.triLbl}>Recall</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#f59e0b' }}>{outlier_detection.f1_pct}%</span>
                <span className={styles.triLbl}>F1 Score</span>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Metric</th><th>Count</th></tr></thead>
                <tbody>
                  <tr><td>True Positives (correctly flagged)</td><td style={{ color: '#22c55e' }}>{outlier_detection.true_positives}</td></tr>
                  <tr><td>False Positives (wrongly flagged)</td><td style={{ color: '#ef4444' }}>{outlier_detection.false_positives}</td></tr>
                  <tr><td>False Negatives (missed outliers)</td><td style={{ color: '#f97316' }}>{outlier_detection.false_negatives}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'themes' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Theme Coverage</h3>
            <div className={styles.bigStat}>
              <span className={styles.bigNum}>{theme_coverage.coverage_pct}%</span>
              <span className={styles.bigLabel}>{theme_coverage.at_least_one_match} / {theme_coverage.evaluated} items matched ≥1 expected theme</span>
            </div>
            <p className={styles.hint}>Coverage checks if the AI-discovered themes overlap with the expected category for each labelled feedback item.</p>
          </div>
        )}

        {tab === 'insights' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Insight Quality</h3>
            <div className={styles.triStat}>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#ef4444' }}>{insight_quality.high_priority}</span>
                <span className={styles.triLbl}>High Priority</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#f59e0b' }}>{insight_quality.medium_priority}</span>
                <span className={styles.triLbl}>Medium Priority</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#22c55e' }}>{insight_quality.low_priority}</span>
                <span className={styles.triLbl}>Low Priority</span>
              </div>
            </div>
            <p className={styles.hint}>Completeness score: <strong style={{ color: '#f59e0b' }}>{insight_quality.completeness_score}%</strong> — rewards spread across priority levels and category diversity.</p>
            <div className={styles.catList}>
              {insight_quality.categories_covered.map(c => (
                <span key={c} className={styles.catChip}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {tab === 'performance' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Pipeline Performance</h3>
            <div className={styles.triStat}>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#6366f1' }}>{performance.total_time_s}s</span>
                <span className={styles.triLbl}>Total Time</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#14b8a6' }}>{performance.avg_time_per_item_s}s</span>
                <span className={styles.triLbl}>Per Item Avg.</span>
              </div>
              <div className={styles.triBox}>
                <span className={styles.triNum} style={{ color: '#8b5cf6' }}>{Object.keys(performance.stage_timings).length}</span>
                <span className={styles.triLbl}>Stages</span>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Stage</th><th>Time (s)</th></tr></thead>
                <tbody>
                  {Object.entries(performance.stage_timings).map(([key, val]) => (
                    <tr key={key}>
                      <td>{key.replace(/_/g, ' ')}</td>
                      <td>{val}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
