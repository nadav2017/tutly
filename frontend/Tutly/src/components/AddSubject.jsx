import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addSubject } from '../services/api'

const SUBJECT_OPTIONS = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Computer Science',
  'Hebrew',
]

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const HOUR_OPTIONS = Array.from({ length: 16 }, (_, index) => {
  const hour = index + 7
  return `${String(hour).padStart(2, '0')}:00`
})

const INITIAL_FORM_DATA = {
  name: '',
  price: 0,
  availableDays: [],
  availableHours: [],
}

function AddSubject() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    if (name === 'price') {
      const numericValue = Number(value)
      const safeValue = Number.isNaN(numericValue) ? 0 : Math.min(1000, Math.max(0, Math.round(numericValue)))

      setFormData((current) => ({
        ...current,
        price: safeValue,
      }))

      return
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function toggleSelection(fieldName, value) {
    setFormData((current) => {
      const currentValues = current[fieldName]
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]

      return {
        ...current,
        [fieldName]: nextValues,
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccess('')
    setError('')

    if (!formData.name.trim()) {
      setError('Please choose or type a subject')
      return
    }

    if (formData.availableDays.length === 0) {
      setError('Please select at least one day')
      return
    }

    if (formData.availableHours.length === 0) {
      setError('Please select at least one hour')
      return
    }

    const payload = {
      name: formData.name.trim(),
      availableDays: formData.availableDays.join(', '),
      availableHours: formData.availableHours.join(', '),
      price: formData.price,
    }

    try {
      await addSubject(payload)
      const successMessage = 'Subject added successfully.'
      setSuccess(successMessage)
      setFormData(INITIAL_FORM_DATA)
      navigate('/profile', {
        state: {
          statusMessage: successMessage,
          scrollToSubjects: true,
        },
      })
    } catch {
      setError('Failed to add subject')
    }
  }

  return (
    <section className="page-card page-card--form">
      <h2 className="section-title">Add Subject</h2>
      <p className="section-text">Add a new subject with the days, hours, and price you are available to teach.</p>

      <form className="form-layout" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="subject-name">
            Subject
          </label>
          <input
            id="subject-name"
            type="text"
            name="name"
            list="subject-options"
            placeholder="Type or choose a subject"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <datalist id="subject-options">
            {SUBJECT_OPTIONS.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
        </div>

        <fieldset className="selection-group">
          <legend className="field-label">Days</legend>
          <div className="selection-grid selection-grid--days">
            {WEEK_DAYS.map((day) => {
              const isSelected = formData.availableDays.includes(day)

              return (
                <button
                  key={day}
                  type="button"
                  className={`selection-chip ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggleSelection('availableDays', day)}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="selection-group">
          <legend className="field-label">Hours</legend>
          <div className="selection-grid selection-grid--hours">
            {HOUR_OPTIONS.map((hour) => {
              const isSelected = formData.availableHours.includes(hour)

              return (
                <button
                  key={hour}
                  type="button"
                  className={`selection-chip ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggleSelection('availableHours', hour)}
                  aria-pressed={isSelected}
                >
                  {hour}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="field-group">
          <label className="field-label" htmlFor="subject-price">
            Price
          </label>
          <div className="price-range">
            <div className="price-range__value" aria-live="polite">
              <input
                id="subject-price"
                className="price-range__number"
                type="number"
                name="price"
                min="0"
                max="1000"
                step="1"
                value={formData.price}
                onChange={handleChange}
              />
              <span className="price-range__currency">{'\u20AA'}</span>
            </div>
            <input
              className="price-range__input"
              type="range"
              name="price"
              min="0"
              max="1000"
              step="1"
              value={formData.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            Add Subject
          </button>
        </div>
      </form>

      {success && <p className="message success">{success}</p>}
      {error && <p className="message error">{error}</p>}
    </section>
  )
}

export default AddSubject
