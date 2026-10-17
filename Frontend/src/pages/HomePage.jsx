import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <main className="page-shell">
      <div className="card">
        <p className="eyebrow">Welcome</p>
        <h1>Home Page</h1>
        <p>This is a placeholder home screen for your frontend app.</p>

        <nav className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </div>
    </main>
  )
}

export default HomePage
