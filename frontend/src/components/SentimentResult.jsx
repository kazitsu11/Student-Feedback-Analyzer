import styles from './SentimentResult.module.css'

const SENTIMENT_CONFIG = {
  positive: {
    label: 'Positive',
    icon: '↑',
    colorClass: 'positive',
    description: 'This feedback carries a constructive, optimistic tone.',
  },
  negative: {
    label: 'Negative',
    icon: '↓',
    colorClass: 'negative',
    description: 'This feedback reflects concerns or dissatisfaction.',
  },
  neutral: {
    label: 'Neutral',
    icon: '→',
    colorClass: 'neutral',
    description: 'This feedback is balanced or factual in tone.',
  },
}

export default function SentimentResult({ result }) {
  if (!result) return null

  const config = SENTIMENT_CONFIG[result.sentiment] || SENTIMENT_CONFIG.neutral
  const date = new Date(result.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <section className={`${styles.card} ${styles[config.colorClass]}`}>
      <div className={styles.topRow}>
        <span className={styles.tag}>Latest Result</span>
        <span className={styles.date}>{date}</span>
      </div>

      <div className={styles.sentimentRow}>
        <span className={styles.icon}>{config.icon}</span>
        <div>
          <p className={styles.sentimentLabel}>{config.label} Sentiment</p>
          <p className={styles.sentimentDesc}>{config.description}</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Student</span>
          <span className={styles.metaValue}>{result.student}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Feedback</span>
          <span className={styles.metaValue}>{result.feedback}</span>
        </div>
      </div>
    </section>
  )
}
