import { useState } from 'react'
import axios from 'axios'
import styles from './FeedbackForm.module.css'

export default function FeedbackForm({ onResult }) {
  const [student, setStudent] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charLimit = 1000
  const remaining = charLimit - feedback.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!student.trim() || !feedback.trim()) {
      setError('Both fields are required.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/feedback', {
        student: student.trim(),
        feedback: feedback.trim(),
      })
      onResult(res.data.data)
      setStudent('')
      setFeedback('')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Capture Observations</h2>
        <p className={styles.sectionDesc}>Detail the feedback for systematic academic analysis.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="student">Student Identification</label>
          <input
            id="student"
            type="text"
            className={styles.input}
            placeholder="Enter student full name..."
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="feedback">Feedback Narrative</label>
            <span className={`${styles.charCount} ${remaining < 50 ? styles.charWarn : ''}`}>
              {remaining} left
            </span>
          </div>
          <textarea
            id="feedback"
            className={styles.textarea}
            placeholder="Start typing the feedback details here..."
            value={feedback}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) setFeedback(e.target.value)
            }}
            disabled={loading}
            rows={7}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.submitRow}>
          <button type="button" className={styles.attachBtn} disabled={loading}>
            ⊕ Attach Transcript
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Analyzing…
              </>
            ) : (
              '✦ Analyze & Submit'
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
