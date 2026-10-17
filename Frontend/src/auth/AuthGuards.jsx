import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'

function AuthLoadingScreen() {
  return (
    <main className="auth-loading" role="status">
      <span className="loading-spinner" />
      <span>Checking your session…</span>
    </main>
  )
}

function RequireAuth({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <AuthLoadingScreen />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function PublicOnly({ children }) {
  const { status } = useAuth()

  if (status === 'checking') return <AuthLoadingScreen />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return children
}

export {
  AuthLoadingScreen,
  PublicOnly,
  RequireAuth,
}
