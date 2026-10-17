import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

const ProfilePage = () => {
  const { user } = useAuth()
  const fullName = [user?.fullName?.firstName, user?.fullName?.lastName].filter(Boolean).join(' ')

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="eyebrow">Account</p>
        <h1>Profile</h1>
        {fullName && <p>Name: {fullName}</p>}
        <p>Email: {user?.email}</p>
        <nav className="page-links">
          <Link to="/">Chat</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </section>
    </main>
  )
}

export default ProfilePage
