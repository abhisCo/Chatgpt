import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-visual">
          <div className="brand-mark">N</div>
          <h2>Create an account</h2>
          <p>Join today and start building your next big idea with ease.</p>
        </div>

        <div className="auth-card">
          <p className="eyebrow">Register</p>
          <h1>Get started</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              First name
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Last name
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && (
              <p className="auth-success" role="status">
                {success} <Link to="/">Continue to chat</Link>
              </p>
            )}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </main>
  )

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    if (!firstName || !lastName || !form.email.trim() || !form.password) {
      setError('Please complete all fields before registering.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await register({
        fullName: { firstName, lastName },
        email: form.email.trim(),
        password: form.password,
      })
      setSuccess('Your account was created successfully. Opening your chat…')
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || (requestError.response
            ? 'Unable to create your account. Please try again.'
            : requestError.message.includes('valid user session')
              ? requestError.message
              : 'Cannot reach the server. Check that the backend is running at http://localhost:3000.'),
      )
    } finally {
      setSubmitting(false)
    }
  }
}

export default RegisterPage
