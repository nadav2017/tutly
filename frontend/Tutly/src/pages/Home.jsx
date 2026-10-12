import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjects, getTeacherReviews, getTeachers, searchSubjects } from '../services/api'
import anonymousTeacherImage from '../assets/anonimus.png'
import { getTeacherImageSrc, getTeacherImageValue } from '../utils/teacherImage'

const INITIAL_SEARCH_FORM = {
  name: '',
  city: '',
  maxPrice: '',
}

function getTeacherId(teacher) {
  return teacher?.id ?? teacher?.teacherId ?? teacher?._id ?? null
}

function getTeacherName(teacher) {
  return teacher?.name || teacher?.teacherName || 'Unknown teacher'
}

function getSubjectTeacherId(subject) {
  return subject?.teacherId ?? subject?.teacher?.id ?? subject?.teacher?.teacherId ?? null
}

function getAverageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0
  }

  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0)

  return total / reviews.length
}

function Home() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [topTeachers, setTopTeachers] = useState([])
  const [searchForm, setSearchForm] = useState(INITIAL_SEARCH_FORM)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [teachersError, setTeachersError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const teacherImageById = topTeachers.reduce((lookup, teacher) => {
    const teacherId = getTeacherId(teacher)

    if (teacherId) {
      lookup[teacherId] = getTeacherImageValue(teacher)
    }

    return lookup
  }, {})

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true)
        setError('')
        const data = await getSubjects()
        setSubjects(Array.isArray(data) ? data : [])
      } catch (loadError) {
        setSubjects([])
        setError(loadError.message || 'Failed to load subjects.')
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

  useEffect(() => {
    async function loadTopTeachers() {
      try {
        setTeachersLoading(true)
        setTeachersError('')

        const teachers = await getTeachers()
        const normalizedTeachers = Array.isArray(teachers) ? teachers : []

        const teacherRatings = await Promise.all(
          normalizedTeachers.map(async (teacher) => {
            const teacherId = getTeacherId(teacher)

            if (!teacherId) {
              return {
                ...teacher,
                averageRating: 0,
                reviewCount: 0,
              }
            }

            try {
              const reviews = await getTeacherReviews(teacherId)
              const normalizedReviews = Array.isArray(reviews) ? reviews : []

              return {
                ...teacher,
                averageRating: getAverageRating(normalizedReviews),
                reviewCount: normalizedReviews.length,
              }
            } catch {
              return {
                ...teacher,
                averageRating: 0,
                reviewCount: 0,
              }
            }
          }),
        )

        teacherRatings.sort((left, right) => {
          if (right.averageRating !== left.averageRating) {
            return right.averageRating - left.averageRating
          }

          if (right.reviewCount !== left.reviewCount) {
            return right.reviewCount - left.reviewCount
          }

          return getTeacherName(left).localeCompare(getTeacherName(right))
        })

        setTopTeachers(teacherRatings)
      } catch (loadError) {
        setTopTeachers([])
        setTeachersError(loadError.message || 'Failed to load teachers.')
      } finally {
        setTeachersLoading(false)
      }
    }

    loadTopTeachers()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setSearchForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSearch(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      const data = await searchSubjects({
        name: searchForm.name,
        city: searchForm.city,
        maxPrice: searchForm.maxPrice,
      })
      setSubjects(Array.isArray(data) ? data : [])
      setHasSearched(true)
    } catch (loadError) {
      setSubjects([])
      setError(loadError.message || 'Failed to search subjects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page-stack">
      <section className="page-card teacher-page">
        <h1 className="section-title">Subjects</h1>
        <p className="section-text">Browse all available subjects, then open a teacher profile from the subject details page.</p>

        <form className="search-panel" onSubmit={handleSearch}>
          <div className="search-panel__grid">
            <div className="field-group">
              <label className="field-label" htmlFor="search-name">
                Subject name
              </label>
              <input
                id="search-name"
                type="text"
                name="name"
                placeholder="Math, English, Physics..."
                value={searchForm.name}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="search-city">
                City
              </label>
              <input
                id="search-city"
                type="text"
                name="city"
                placeholder="Jerusalem, Tel Aviv..."
                value={searchForm.city}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="search-max-price">
                Max price
              </label>
              <input
                id="search-max-price"
                type="number"
                name="maxPrice"
                min="0"
                placeholder="150"
                value={searchForm.maxPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="search-panel__actions">
            <button className="primary-button search-panel__button" type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {loading && <p className="teacher-loading">Loading subjects...</p>}
        {!loading && error && <p className="message error">{error}</p>}

        {!loading && !error && (
          <>
            {subjects.length === 0 ? (
              <p className="teacher-empty">{hasSearched ? 'No results found' : 'No subjects found right now.'}</p>
            ) : (
              <ul className="teacher-grid">
                {subjects.map((subject, index) => (
                  <li key={subject.id || `${subject.name}-${index}`}>
                    <button
                      type="button"
                      className="teacher-card teacher-card--interactive home-subject-card"
                      onClick={() => navigate(`/subjects/${subject.id}`)}
                    >
                      <div className="home-subject-card__content">
                        <div className="home-subject-card__details">
                          <div className="teacher-card__section teacher-card__section--name">
                            <span className="teacher-label">Subject</span>
                            <strong>{subject.name || 'Unnamed subject'}</strong>
                          </div>

                          <div className="teacher-card__section">
                            <span className="teacher-label">Teacher</span>
                            <span>{subject.teacherName || 'Unknown teacher'}</span>
                          </div>

                          <div className="teacher-card__section">
                            <span className="teacher-label">Available days</span>
                            <span>{subject.availableDays || '-'}</span>
                          </div>

                          <div className="teacher-card__section">
                            <span className="teacher-label">Available hours</span>
                            <span>{subject.availableHours || '-'}</span>
                          </div>

                          <div className="teacher-card__section teacher-card__section--description">
                            <span className="teacher-label">Price</span>
                            <span>
                              {Number(subject.price) || 0}
                              {' '}
                              {'\u20AA'}
                            </span>
                          </div>
                        </div>

                        <img
                          className="teacher-card__image home-subject-card__image"
                          src={
                            getTeacherImageSrc(
                              getTeacherImageValue(subject)
                              || teacherImageById[getSubjectTeacherId(subject)],
                            ) || anonymousTeacherImage
                          }
                          alt={`${subject.teacherName || 'Teacher'} profile`}
                        />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="page-card teacher-page teacher-ranking-section">
        <div className="profile-panel__header">
          <h2 className="profile-panel__title">Top Rated Teachers</h2>
        </div>
        <p className="section-text teacher-ranking-section__text">
          Teachers sorted by the highest average star rating.
        </p>

        {teachersLoading && <p className="teacher-loading">Loading teachers...</p>}
        {!teachersLoading && teachersError && <p className="message error">{teachersError}</p>}

        {!teachersLoading && !teachersError && (
          <>
            {topTeachers.length === 0 ? (
              <p className="teacher-empty">No teachers found right now.</p>
            ) : (
              <ul className="teacher-grid">
                {topTeachers.map((teacher, index) => {
                  const teacherId = getTeacherId(teacher)

                  return (
                    <li key={teacherId || `${getTeacherName(teacher)}-${index}`}>
                      <button
                        type="button"
                        className="teacher-card teacher-card--interactive"
                        onClick={() => teacherId && navigate(`/teachers/${teacherId}`)}
                        disabled={!teacherId}
                      >
                        <div className="teacher-card__identity">
                          <img
                            className="teacher-card__image"
                            src={getTeacherImageSrc(getTeacherImageValue(teacher)) || anonymousTeacherImage}
                            alt={`${getTeacherName(teacher)} profile`}
                          />

                          <div className="teacher-card__section teacher-card__section--name">
                            <span className="teacher-label">Teacher</span>
                            <strong>{getTeacherName(teacher)}</strong>
                          </div>
                        </div>

                        <div className="teacher-card__section">
                          <span className="teacher-label">City</span>
                          <span>{teacher.city || '-'}</span>
                        </div>

                        <div className="teacher-card__section">
                          <span className="teacher-label">Rating</span>
                          <span>{teacher.averageRating.toFixed(1)} / 5</span>
                        </div>

                        <div className="teacher-card__section teacher-card__section--description">
                          <span className="teacher-label">Reviews</span>
                          <span>{teacher.reviewCount}</span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Home
