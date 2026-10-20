import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-visual">
          <div className="brand-mark">N</div>
          <h2>Welcome back</h2>
          <p>Sign in to continue managing your workspace and activities.</p>
        </div>

        <div className="auth-card">
          <p className="eyebrow">Login</p>
          <h1>Access your account</h1>

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
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="switch-text">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </main>
  )

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || (requestError.response
            ? 'Unable to sign in. Please try again.'
            : requestError.message.includes('valid user session')
              ? requestError.message
              : 'Cannot reach the server. Check that the backend is running at https://chatgpt-clone-jce0.onrender.com.'),
      );
    } finally {
      setSubmitting(false);
    }
  }
}

export default LoginPage