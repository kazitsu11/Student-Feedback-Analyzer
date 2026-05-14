import styles from './Header.module.css'

export default function Header({ stats }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.tagline}>Education & Learning</span>
          <h1 className={styles.title}>Student Feedback <em>Analyzer</em></h1>
          <p className={styles.subtitle}>
            Summarize themes, sentiment, and actionable insights across surveys.
          </p>
        </div>

        <div className={styles.statsRow}>
          <StatPill label="Total" value={stats.total} color="amber" />
          <StatPill label="Positive" value={stats.positive} color="positive" />
          <StatPill label="Neutral" value={stats.neutral} color="neutral" />
          <StatPill label="Negative" value={stats.negative} color="negative" />
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
