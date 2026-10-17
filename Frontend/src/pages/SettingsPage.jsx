import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

const SettingsPage = () => {
  const { user } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('chat-theme') || 'dark')
  const fullName = [user?.fullName?.firstName, user?.fullName?.lastName].filter(Boolean).join(' ')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('chat-theme', theme)
  }, [theme])

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="eyebrow">Preferences</p>
        <h1>Settings</h1>
        {fullName && <p>Name: {fullName}</p>}
        <p>Email: {user?.email}</p>
        <p>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</p>
        <button
          className="settings-theme-button"
          type="button"
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        >
          Switch to {theme === 'dark' ? 'light' : 'dark'} theme
        </button>
        <nav className="page-links">
          <Link to="/">Chat</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </section>
    </main>
  )
}

export default SettingsPage
