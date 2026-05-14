import styles from './AnalysisPanel.module.css'

const PRIORITY_CLASS = {
  high: styles.priorityHigh,
  medium: styles.priorityMed,
  low: styles.priorityLow,
}

const STAGE_LABELS = {
  '1_outlier_detection': 'Outlier Detection',
  '2_theme_discovery': 'Theme Discovery',
  '3_sentiment_analysis': 'Sentiment Analysis',
  '4_pattern_synthesis': 'Pattern Synthesis',
  '5_action_generation': 'Action Generation',
}

export default function AnalysisPanel({ result, onClose }) {
  if (!result) return null

  const {
    bias_report,
    pipeline_timings,
    global_themes,
    key_patterns,
    actionable_insights,
    sentiment_summary,
  } = result

  const totalTime = Object.values(pipeline_timings).reduce((a, b) => a + b, 0).toFixed(1)
  const maxThemeCount = Math.max(...Object.values(global_themes), 1)

  return (
    <section className={styles.panel}>
      {/* ── header ── */}
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>AI Pipeline Analysis</h2>
          <p className={styles.panelSub}>5-stage agentic orchestration · {totalTime}s total</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.biasChips}>
            <Chip label="Responses" value={bias_report.total_responses} />
            <Chip label="Outliers" value={bias_report.outliers_detected} accent="warn" />
            <Chip label="Valid" value={bias_report.valid_responses_analysed} accent="pos" />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      {/* ── pipeline stages ── */}
      <div className={styles.stages}>
        {Object.entries(STAGE_LABELS).map(([key, label], idx) => (
          <div key={key} className={styles.stage}>
            <span className={styles.stageNum}>{idx + 1}</span>
            <span className={styles.stageName}>{label}</span>
            <span className={styles.stageTime}>{pipeline_timings[key] ?? '—'}s</span>
          </div>
        ))}
      </div>

      {/* ── body grid ── */}
      <div className={styles.body}>

        {/* themes */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Discovered Themes</h3>
          <div className={styles.themeList}>
            {Object.entries(global_themes)
              .sort((a, b) => b[1] - a[1])
              .map(([theme, count]) => (
                <div key={theme} className={styles.themeRow}>
                  <span className={styles.themeName}>{theme}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(count / maxThemeCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.themeCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* patterns */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Key Patterns</h3>
          <ol className={styles.patternList}>
            {key_patterns.map((p, i) => (
              <li key={i} className={styles.patternItem}>{p}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── actionable insights ── */}
      <div className={styles.insightsSection}>
        <h3 className={styles.cardTitle}>Actionable Insights</h3>
        <div className={styles.insightsGrid}>
          {actionable_insights.map((ins, i) => (
            <div key={i} className={styles.insightCard}>
              <div className={styles.insightTop}>
                <span className={`${styles.priority} ${PRIORITY_CLASS[ins.priority] || styles.priorityLow}`}>
                  {ins.priority.toUpperCase()}
                </span>
                <span className={styles.insightCategory}>{ins.category}</span>
              </div>
              <p className={styles.insightSuggestion}>{ins.suggestion}</p>
              <p className={styles.insightImpact}>{ins.expected_impact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Chip({ label, value, accent }) {
  return (
    <div className={`${styles.chip} ${accent === 'warn' ? styles.chipWarn : accent === 'pos' ? styles.chipPos : ''}`}>
      <span className={styles.chipValue}>{value}</span>
      <span className={styles.chipLabel}>{label}</span>
    </div>
  )
}
