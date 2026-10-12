import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createTeacherReview,
  getSubjectsByTeacherId,
  getTeacherById,
  getTeacherReviews,
} from '../services/api'
import anonymousTeacherImage from '../assets/anonimus.png'
import { getTeacherImageSrc } from '../utils/teacherImage'
const INITIAL_REVIEW_FORM = {
  name: '',
  phone: '',
  rating: '0',
  comment: '',
}

function renderStars(rating) {
  const safeRating = Number(rating) || 0

  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`star-${safeRating}-${index}`}
      className={`review-star ${index < safeRating ? 'is-filled' : ''}`}
      aria-hidden="true"
    >
      {'\u2605'}
    </span>
  ))
}

function renderInteractiveStars(rating, onSelect) {
  const safeRating = Number(rating) || 0

  return Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1

    return (
      <button
        key={`interactive-star-${starValue}`}
        type="button"
        className={`review-star-button ${starValue <= safeRating ? 'is-filled' : ''}`}
        aria-label={`Set rating to ${starValue} out of 5`}
        aria-pressed={starValue === safeRating}
        onClick={() => onSelect(String(starValue))}
      >
        {'\u2605'}
      </button>
    )
  })
}

function getAverageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0
  }

  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0)

  return total / reviews.length
}

function TeacherPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [teacher, setTeacher] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState(INITIAL_REVIEW_FORM)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewSubmitError, setReviewSubmitError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadTeacherPage() {
      try {
        setLoading(true)
        setError('')
        setReviewsLoading(true)
        setReviewsError('')

        const [teacherResult, subjectResult, reviewResult] = await Promise.allSettled([
          getTeacherById(id),
          getSubjectsByTeacherId(id),
          getTeacherReviews(id),
        ])

        if (teacherResult.status === 'rejected') {
          throw teacherResult.reason
        }

        setTeacher(teacherResult.value)
        setSubjects(subjectResult.status === 'fulfilled' && Array.isArray(subjectResult.value) ? subjectResult.value : [])

        if (reviewResult.status === 'fulfilled') {
          setReviews(Array.isArray(reviewResult.value) ? reviewResult.value : [])
        } else {
          setReviews([])
          setReviewsError(reviewResult.reason?.message || 'Failed to load reviews.')
        }
      } catch (loadError) {
        setTeacher(null)
        setSubjects([])
        setReviews([])
        setError(loadError.message || 'Failed to load teacher details.')
      } finally {
        setLoading(false)
        setReviewsLoading(false)
      }
    }

    loadTeacherPage()
  }, [id])

  function handleReviewChange(event) {
    const { name, value } = event.target

    setReviewForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleRatingSelect(value) {
    setReviewForm((current) => ({
      ...current,
      rating: value,
    }))
  }

  async function handleReviewSubmit(event) {
    event.preventDefault()

    try {
      setSubmittingReview(true)
      setReviewSubmitError('')
      setReviewSuccess('')

      if (Number(reviewForm.rating) < 1) {
        setReviewSubmitError('Please choose a star rating before submitting.')
        return
      }

      const createdReview = await createTeacherReview(id, {
        name: reviewForm.name.trim(),
        phone: reviewForm.phone.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      })

      setReviews((current) => [createdReview, ...current])
      setReviewForm(INITIAL_REVIEW_FORM)
      setReviewSuccess('Review added successfully.')
    } catch (submitError) {
      setReviewSubmitError(submitError.message || 'Failed to add review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <section className="page-card teacher-profile-page">
        <p className="teacher-loading">Loading teacher details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-card teacher-profile-page">
        <p className="message error">{error}</p>
      </section>
    )
  }

  if (!teacher) {
    return (
      <section className="page-card teacher-profile-page">
        <p className="teacher-empty">Teacher not found.</p>
      </section>
    )
  }

  const imageSrc = getTeacherImageSrc(teacher.imageUrl)
  const teacherName = teacher.name || teacher.teacherName || 'Teacher'
  const averageRating = getAverageRating(reviews)

  return (
    <section className="page-card teacher-profile-page">
      <h1 className="section-title">{teacher.name || teacher.teacherName || 'Teacher profile'}</h1>
      <p className="section-text">This public page shows teacher details and every subject currently listed by this teacher.</p>

      <section className="profile-panel">
        <div className="profile-panel__header">
          <h2 className="profile-panel__title">Teacher Details</h2>
        </div>

        <div className="profile-image-section">
          <img
            className="profile-image"
            src={imageSrc || anonymousTeacherImage}
            alt={`${teacherName} profile`}
          />
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <span className="teacher-label">Name</span>
            <strong>{teacher.name || teacher.teacherName || '-'}</strong>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">City</span>
            <span>{teacher.city || '-'}</span>
          </div>

          <div className="profile-detail">
            <span className="teacher-label">Phone</span>
            <span>{teacher.phone || '-'}</span>
          </div>

          <div className="profile-detail profile-detail--full">
            <span className="teacher-label">Description</span>
            <span>{teacher.description || '-'}</span>
          </div>
        </div>
      </section>

      <section className="profile-panel">
        <div className="profile-panel__header">
          <h2 className="profile-panel__title">Subjects</h2>
        </div>

        {subjects.length === 0 ? (
          <p className="teacher-empty">No subjects found for this teacher yet.</p>
        ) : (
          <div className="subject-stack">
            {subjects.map((subject, index) => (
              <button
                key={subject.id || `${subject.name}-${index}`}
                type="button"
                className="subject-card subject-card--interactive"
                onClick={() => navigate(`/subjects/${subject.id}`)}
              >
                <div className="subject-card__content">
                  <div className="profile-detail">
                    <span className="teacher-label">Subject</span>
                    <strong>{subject.name || '-'}</strong>
                  </div>

                  <div className="profile-detail">
                    <span className="teacher-label">Days</span>
                    <span>{subject.availableDays || '-'}</span>
                  </div>

                  <div className="profile-detail">
                    <span className="teacher-label">Hours</span>
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
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="profile-panel">
        <div className="profile-panel__header">
          <h2 className="profile-panel__title">Reviews</h2>
        </div>

        {!reviewsLoading && !reviewsError && (
          <div className="reviews-summary">
            <span className="review-rating-badge">{averageRating.toFixed(1)} / 5 average</span>
            <span className="reviews-summary__count">
              {reviews.length}
              {' '}
              {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        )}

        {reviewsLoading ? (
          <p className="teacher-loading">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="teacher-empty">No reviews yet</p>
        ) : (
          <div className="review-stack">
            {reviews.map((review, index) => (
              <article key={review.id || `${review.name}-${index}`} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__identity">
                    <strong>{review.name || 'Anonymous'}</strong>
                    <div className="review-rating-row">
                      <div className="review-stars" aria-label={`Rating ${review.rating || 0} out of 5`}>
                        {renderStars(review.rating)}
                      </div>
                      <span className="review-rating-badge">
                        {review.rating || '-'}
                        /5
                      </span>
                    </div>
                  </div>
                </div>
                <p className="review-card__comment">{review.comment || '-'}</p>
              </article>
            ))}
          </div>
        )}

        {reviewsError && <p className="message error">{reviewsError}</p>}
      </section>

      <section className="profile-panel">
        <div className="profile-panel__header">
          <h2 className="profile-panel__title">Add a Review</h2>
        </div>

        <form className="form-layout" onSubmit={handleReviewSubmit}>
          <div className="review-form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="review-name">
                Name
              </label>
              <input
                id="review-name"
                type="text"
                name="name"
                value={reviewForm.name}
                onChange={handleReviewChange}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="review-phone">
                Phone
              </label>
              <input
                id="review-phone"
                type="text"
                name="phone"
                value={reviewForm.phone}
                onChange={handleReviewChange}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <span className="field-label" id="review-rating-label">
              Rating
            </span>
            <div
              className="review-star-picker"
              role="group"
              aria-labelledby="review-rating-label"
            >
              {renderInteractiveStars(reviewForm.rating, handleRatingSelect)}
              <span className="review-star-picker__value">{reviewForm.rating} / 5</span>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="review-comment">
              Comment
            </label>
            <textarea
              id="review-comment"
              name="comment"
              rows="4"
              value={reviewForm.comment}
              onChange={handleReviewChange}
              required
            />
          </div>

          <div className="search-panel__actions">
            <button className="primary-button search-panel__button" type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

        {reviewSuccess && <p className="message success">{reviewSuccess}</p>}
        {reviewSubmitError && <p className="message error">{reviewSubmitError}</p>}
      </section>
    </section>
  )
}

export default TeacherPage
