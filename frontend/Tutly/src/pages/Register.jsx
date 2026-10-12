import { useState } from 'react'
import { registerUser } from '../services/api'

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  city: '',
  description: '',
}

function Register({ onRegisterSuccess }) {
  const [formData, setFormData] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const data = await registerUser(formData)
      const teacherName = data?.name || data?.teacherName || formData.name

      if (data?.token) {
        localStorage.setItem('token', data.token)
      }

      if (teacherName) {
        localStorage.setItem('teacherName', teacherName)
        localStorage.setItem('name', teacherName)
      }

      localStorage.setItem(
        'teacherProfile',
        JSON.stringify({
          id: data?.id || data?.teacherId || null,
          name: teacherName,
          email: data?.email || formData.email,
          phone: data?.phone || formData.phone,
          city: data?.city || formData.city,
          description: data?.description || formData.description,
          imageUrl: data?.imageUrl || '',
        }),
      )

      setMessage('Registration completed successfully.')
      setFormData(initialForm)

      if (onRegisterSuccess) {
        onRegisterSuccess()
      }
    } catch (submitError) {
      setError(submitError.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-card page-card--form">
      <h1 className="section-title">Register</h1>
      <p className="section-text">Create your tutoring profile with a few basic details and get started quickly.</p>

      <form className="form-layout" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
        />

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>

      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}
    </section>
  )
}

export default Register
