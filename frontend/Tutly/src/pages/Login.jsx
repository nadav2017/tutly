import { useState } from 'react'

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError('Invalid email or password')
        return
      }

      const data = await response.json()
      const token = data?.token
      const teacherName = data?.name || data?.teacherName
      const teacherProfile = {
        id: data?.id || data?.teacherId || null,
        name: data?.name || data?.teacherName || '',
        email: data?.email || formData.email,
        phone: data?.phone || '',
        city: data?.city || '',
        description: data?.description || '',
        imageUrl: data?.imageUrl || '',
      }

      if (token) {
        localStorage.setItem('token', token)
      }

      if (teacherName) {
        localStorage.setItem('teacherName', teacherName)
        localStorage.setItem('name', teacherName)
      }

      localStorage.setItem('teacherProfile', JSON.stringify(teacherProfile))

      setSuccess('Login successful')
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-card page-card--form">
      <h1 className="section-title">Login</h1>
      <p className="section-text">Access your account to manage tutoring subjects and explore teachers.</p>

      <form className="form-layout" onSubmit={handleSubmit}>
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

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      {success && <p className="message success">{success}</p>}
      {error && <p className="message error">{error}</p>}
    </section>
  )
}

export default Login
