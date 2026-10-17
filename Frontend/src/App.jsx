import { useEffect } from 'react'
import './App.css'
import AppRoutes from './AppRoutes'

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('chat-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return <AppRoutes />
}

export default App
