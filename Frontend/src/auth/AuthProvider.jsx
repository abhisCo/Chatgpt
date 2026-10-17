import { useEffect, useState } from 'react'
import api from '../services/api'
import { disconnectChatSocket } from '../services/chatSocket'
import { AuthContext } from './authContext'

function requireUser(data) {
  if (!data?.user?._id) {
    throw new Error('The authentication service did not return a valid user session.')
  }
  return data.user
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || ''
        const isAuthMutation = ['/auth/login', '/auth/register', '/auth/logout']
          .some((path) => url.endsWith(path))
        if (error.response?.status === 401 && !isAuthMutation) {
          disconnectChatSocket()
          setUser(null)
          setStatus('anonymous')
        }
        return Promise.reject(error)
      },
    )

    api.get('/auth/me')
      .then(({ data }) => {
        const sessionUser = requireUser(data)
        if (active) {
          setUser(sessionUser)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
          setStatus('anonymous')
        }
      })

    return () => {
      active = false
      api.interceptors.response.eject(interceptorId)
    }
  }, [])

  async function verifySession() {
    const { data } = await api.get('/auth/me')
    const sessionUser = requireUser(data)
    setUser(sessionUser)
    setStatus('authenticated')
    return sessionUser
  }

  async function login(credentials) {
    await api.post('/auth/login', credentials)
    return verifySession()
  }

  async function register(details) {
    await api.post('/auth/register', details)
    return verifySession()
  }

  async function logout() {
    await api.post('/auth/logout')
    disconnectChatSocket()
    setUser(null)
    setStatus('anonymous')
  }

  const value = {
    user,
    status,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
