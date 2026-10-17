import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ChatPage from './pages/ChatPage'
import AuthProvider from './auth/AuthProvider'
import { PublicOnly, RequireAuth } from './auth/AuthGuards'

function Protected({ children }) {
  return <RequireAuth>{children}</RequireAuth>
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Protected><ChatPage /></Protected>} />
          <Route path='/login' element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path='/register' element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path='/dashboard' element={<Protected><ChatPage /></Protected>} />
          <Route path='/profile' element={<Protected><ProfilePage /></Protected>} />
          <Route path='/settings' element={<Protected><SettingsPage /></Protected>} />
          <Route path='*' element={<Protected><ChatPage /></Protected>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
