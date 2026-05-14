import styles from './FeedbackHistory.module.css'

const BADGE = {
  positive: styles.badgePositive,
  negative: styles.badgeNegative,
  neutral: styles.badgeNeutral,
}

export default function FeedbackHistory({ history }) {
  if (history.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Feedback Log</h2>
        <span className={styles.count}>{history.length} entr{history.length === 1 ? 'y' : 'ies'}</span>
      </div>

      <div className={styles.list}>
        {[...history].reverse().map((item, idx) => (
          <HistoryItem key={item._id || idx} item={item} />
        ))}
      </div>
    </section>
  )
}

function HistoryItem({ item }) {
  const date = new Date(item.createdAt).toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  const initials = item.student
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')

  return (
    <div className={styles.item}>
      <div className={styles.avatar}>{initials}</div>

      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.name}>{item.student}</span>
          <span className={`${styles.badge} ${BADGE[item.sentiment] || BADGE.neutral}`}>
            {item.sentiment}
          </span>
        </div>
        <p className={styles.feedbackText}>{item.feedback}</p>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  )
}
