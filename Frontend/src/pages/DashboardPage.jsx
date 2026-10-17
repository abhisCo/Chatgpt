import { Link } from 'react-router-dom'

const DashboardPage = () => {
  return (
    <main className="page-shell">
      <div className="card">
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
        <p>This is a placeholder dashboard page for your app.</p>

        <div className="stats-grid">
          <div className="stat-box">
            <strong>24</strong>
            <span>Projects</span>
          </div>
          <div className="stat-box">
            <strong>12</strong>
            <span>Tasks</span>
          </div>
          <div className="stat-box">
            <strong>8</strong>
            <span>Alerts</span>
          </div>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </div>
    </main>
  )
}

export default DashboardPage
