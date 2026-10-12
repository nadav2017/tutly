import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSubjectById, getTeacherById } from '../services/api'
import anonymousTeacherImage from '../assets/anonimus.png'
import { getTeacherImageSrc, getTeacherImageValue } from '../utils/teacherImage'

function SubjectPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [subject, setSubject] = useState(null)
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSubject() {
      try {
        setLoading(true)
        setError('')
        const data = await getSubjectById(id)
        setSubject(data)

        const teacherId = data?.teacherId ?? data?.teacher?.id ?? data?.teacher?.teacherId ?? null
        const subjectTeacherImage = getTeacherImageValue(data)

        if (teacherId && !subjectTeacherImage) {
          try {
            const teacherData = await getTeacherById(teacherId)
            setTeacher(teacherData)
          } catch {
            setTeacher(null)
          }
        } else {
          setTeacher(data?.teacher || null)
        }
      } catch (loadError) {
        setSubject(null)
        setTeacher(null)
        setError(loadError.message || 'Failed to load subject details.')
      } finally {
        setLoading(false)
      }
    }

    loadSubject()
  }, [id])

  const teacherId = subject?.teacherId ?? teacher?.id ?? teacher?.teacherId ?? subject?.teacher?.id ?? null
  const teacherName = subject?.teacherName || teacher?.name || teacher?.teacherName || 'Unknown teacher'
  const teacherCity = subject?.city || subject?.teacher?.city || teacher?.city || '-'
  const teacherImageSrc =
    getTeacherImageSrc(getTeacherImageValue(subject) || getTeacherImageValue(teacher)) || anonymousTeacherImage

  if (loading) {
    return (
      <section className="page-card teacher-profile-page subject-page-card">
        <p className="teacher-loading">Loading subject details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-card teacher-profile-page subject-page-card">
        <p className="message error">{error}</p>
      </section>
    )
  }

  if (!subject) {
    return (
      <section className="page-card teacher-profile-page subject-page-card">
        <p className="teacher-empty">Subject not found.</p>
      </section>
    )
  }

  return (
    <section className="page-card teacher-profile-page subject-page-card">
      <div className="profile-panel__header">
        <h2 className="profile-panel__title">Subject Details</h2>
      </div>

      <div className="subject-details-layout">
        <div className="profile-details">
          <div className="profile-detail profile-detail--subject-name">
            <span className="teacher-label">Subject</span>
            <strong>{subject.name || '-'}</strong>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">Available days</span>
            <span>{subject.availableDays || '-'}</span>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">City</span>
            <span>{teacherCity}</span>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">Available hours</span>
            <span>{subject.availableHours || '-'}</span>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">Price</span>
            <span>
              {Number(subject.price) || 0}
              {' '}
              {'\u20AA'}
            </span>
          </div>
        </div>

        <div className="subject-teacher-image-slot">
          {teacherId ? (
            <>
              <button
                type="button"
                className="subject-teacher-image-slot__button"
                onClick={() => navigate(`/teachers/${teacherId}`)}
                aria-label={`Open ${teacherName} profile`}
              >
                <img
                  className="subject-teacher-image-slot__image"
                  src={teacherImageSrc}
                  alt={`${teacherName} profile`}
                />
              </button>

              <button
                type="button"
                className="inline-link-button subject-teacher-image-slot__name"
                onClick={() => navigate(`/teachers/${teacherId}`)}
              >
                {teacherName}
              </button>
            </>
          ) : (
            <>
              <img
                className="subject-teacher-image-slot__image"
                src={teacherImageSrc}
                alt={`${teacherName} profile`}
              />
              <span className="subject-teacher-image-slot__name subject-teacher-image-slot__name--static">
                {teacherName}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default SubjectPage
