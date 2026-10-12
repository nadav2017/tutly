import { useEffect, useState } from 'react'

function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <article style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.subjectName}>{subject.name || 'Unnamed subject'}</h3>
        <span style={styles.teacherName}>{subject.teacherName || 'Unknown teacher'}</span>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <span style={styles.label}>Available days</span>
          <span style={styles.value}>{subject.availableDays || '-'}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>Available hours</span>
          <span style={styles.value}>{subject.availableHours || '-'}</span>
        </div>

        <div style={styles.detailItem}>
          <span style={styles.label}>Price</span>
          <span style={styles.value}>
            {typeof subject.price === 'number' ? subject.price : 0} ₪
          </span>
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.secondaryButton} onClick={() => onEdit(subject)}>
          Edit
        </button>
        <button type="button" style={styles.dangerButton} onClick={() => onDelete(subject)}>
          Delete
        </button>
      </div>
    </article>
  )
}

function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSubjects() {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Unauthorized: missing token')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch('http://localhost:8080/api/subjects/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const text = await response.text()
        const data = text ? JSON.parse(text) : []

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to fetch subjects')
        }

        setSubjects(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        setError(fetchError.message || 'Something went wrong while loading subjects')
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

  function handleEdit(subject) {
    console.log('Edit subject placeholder:', subject)
  }

  function handleDelete(subject) {
    console.log('Delete subject placeholder:', subject)
  }

  if (loading) {
    return <section style={styles.wrapper}>Loading dashboard...</section>
  }

  if (error) {
    return <section style={styles.wrapper}>Error: {error}</section>
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Teacher Dashboard</h1>
        <p style={styles.subtitle}>Manage the subjects that belong to the authenticated teacher.</p>
      </div>

      {subjects.length === 0 ? (
        <p style={styles.emptyState}>No subjects yet</p>
      ) : (
        <div style={styles.grid}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

const styles = {
  wrapper: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '2rem',
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    lineHeight: 1.6,
  },
  emptyState: {
    margin: 0,
    padding: '18px 20px',
    borderRadius: '16px',
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e5e7eb',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    padding: '20px',
    borderRadius: '20px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  subjectName: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#111827',
  },
  teacherName: {
    color: '#4f46e5',
    fontWeight: 600,
  },
  detailsGrid: {
    display: 'grid',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#64748b',
  },
  value: {
    color: '#1f2937',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
  },
  secondaryButton: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    cursor: 'pointer',
  },
  dangerButton: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    background: '#ef4444',
    color: '#ffffff',
    cursor: 'pointer',
  },
}

export default Dashboard
