import styles from './Header.module.css'

export default function Header({ stats, onAnalyze, analyzing, onEvaluate, evaluating }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Academic Sentiment <em>Dashboard</em></h1>
          <p className={styles.subtitle}>
            Real-time AI analysis of student feedback across all faculties and courses for the current semester.
          </p>
        </div>

        <div className={styles.right}>
          <div className={styles.statsRow}>
            <StatPill label="Total Feedback" value={stats.total} color="amber" />
            <StatPill label="Positive Sentiment" value={stats.positive} color="positive" />
            <StatPill label="Neutral Sentiment" value={stats.neutral} color="neutral" />
            <StatPill label="Negative Sentiment" value={stats.negative} color="negative" />
          </div>

          <div className={styles.btnRow}>
            <button
              className={`${styles.analyzeBtn} ${analyzing ? styles.analyzeBtnBusy : ''}`}
              onClick={onAnalyze}
              disabled={analyzing || stats.total === 0}
              title={stats.total === 0 ? 'Submit at least one feedback first' : 'Run the 5-stage AI pipeline'}
            >
              {analyzing ? (
                <>
                  <span className={styles.spinner} />
                  Analyzing…
                </>
              ) : (
                '✦ AI Re-analyze'
              )}
            </button>

            <button
              className={`${styles.evaluateBtn} ${evaluating ? styles.analyzeBtnBusy : ''}`}
              onClick={onEvaluate}
              disabled={evaluating}
              title="Run evaluation against the golden dataset"
            >
              {evaluating ? (
                <>
                  <span className={styles.spinner} />
                  Evaluating…
                </>
              ) : (
                'Export Report'
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className={`${styles.pill} ${styles[`pill_${color}`]}`}>
      <span className={styles.pillValue}>{value}</span>
      <span className={styles.pillLabel}>{label}</span>
    </div>
  )
}
