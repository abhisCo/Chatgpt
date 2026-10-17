import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { disconnectChatSocket, getChatSocket } from '../services/chatSocket'
import { useAuth } from '../auth/authContext'
import {
  ChatHeader,
  ChatInput,
  ChatWindow,
  Sidebar,
} from '../components/ChatComponents'

const responseTimeout = 90000

function getErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return 'Your session has expired. Sign in to continue.'
  }
  if (!error.response) {
    return 'Cannot reach the server. Check that the backend is running at http://localhost:3000.'
  }
  return error.response.data?.message || fallback
}

function ChatPage() {
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  const [pendingChatId, setPendingChatId] = useState(null)
  const [socketStatus, setSocketStatus] = useState('connecting')
  const [socketError, setSocketError] = useState('')
  const [pageError, setPageError] = useState('')
  const [sendError, setSendError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('chat-theme') || 'dark')
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const socketRef = useRef(null)
  const currentChatRef = useRef(null)
  const pendingRef = useRef(null)
  const submissionRef = useRef(false)
  const creatingChatRef = useRef(false)
  const selectionRequestRef = useRef(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('chat-theme', theme)
  }, [theme])

  useEffect(() => {
    let mounted = true
    api.get('/chat')
      .then(({ data }) => {
        if (mounted) setChats(data.chats || [])
      })
      .catch((error) => {
        if (mounted) setPageError(getErrorMessage(error, 'Unable to load your chats.'))
      })
      .finally(() => {
        if (mounted) setLoadingChats(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const socket = getChatSocket()
    socketRef.current = socket

    const handleConnect = () => {
      setSocketStatus('connected')
      setSocketError('')
    }
    const handleConnectError = (error) => {
      setSocketStatus('disconnected')
      const message = error.message?.toLowerCase() || ''
      if (message.includes('authentication')) {
        setSocketError('Your session is missing or expired. Sign in to connect to the assistant.')
        api.get('/auth/me').catch((sessionError) => {
          if (sessionError.response?.status !== 401) {
            setSocketError('Unable to verify your session. Check the backend connection and try again.')
          }
        })
      } else if (message.includes('xhr') || message.includes('websocket') || message.includes('timeout')) {
        setSocketError(
          'Cannot reach the backend at http://localhost:3000. Make sure it is running and allows this frontend origin.',
        )
      } else {
        setSocketError(error.message || 'Unable to connect to the assistant.')
      }
    }
    const handleDisconnect = () => {
      setSocketStatus('disconnected')
      const pending = pendingRef.current
      if (pending) {
        window.clearTimeout(pending.timeoutId)
        pendingRef.current = null
        submissionRef.current = false
        setIsSubmitting(false)
        setPendingChatId(null)
        setSendError('Connection lost before the assistant could respond. Please try again.')
      }
    }
    const handleResponse = (response) => {
      if (!response || typeof response.content !== 'string' || !response.chat) return
      const chatId = String(response.chat)
      if (pendingRef.current?.chatId !== chatId) return
      window.clearTimeout(pendingRef.current.timeoutId)
      pendingRef.current = null
      submissionRef.current = false
      setIsSubmitting(false)
      setPendingChatId(null)
      if (currentChatRef.current === chatId) {
        setMessages((current) => [
          ...current,
          { _id: `assistant-${Date.now()}`, role: 'model', content: response.content },
        ])
      }
      setChats((current) => current.map((chat) => (
        String(chat._id) === chatId ? { ...chat, lastActivity: new Date().toISOString() } : chat
      )).sort((left, right) => new Date(right.lastActivity) - new Date(left.lastActivity)))
      setSendError('')
    }
    const handleAiError = (response) => {
      if (!response || !response.chat) return
      const chatId = String(response.chat)
      if (pendingRef.current?.chatId !== chatId) return
      window.clearTimeout(pendingRef.current.timeoutId)
      pendingRef.current = null
      submissionRef.current = false
      setIsSubmitting(false)
      setPendingChatId(null)
      if (currentChatRef.current === chatId) {
        setSendError(response.message || 'The assistant could not respond. Please try again.')
      }
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('disconnect', handleDisconnect)
    socket.on('ai-response', handleResponse)
    socket.on('ai-error', handleAiError)
    socket.connect()

    return () => {
      const pending = pendingRef.current
      if (pending) window.clearTimeout(pending.timeoutId)
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('disconnect', handleDisconnect)
      socket.off('ai-response', handleResponse)
      socket.off('ai-error', handleAiError)
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  async function openChat(chat) {
    const requestId = ++selectionRequestRef.current
    const chatId = String(chat._id)
    currentChatRef.current = chatId
    setCurrentChatId(chatId)
    setMessages([])
    setSendError('')
    setPageError('')
    setSidebarOpen(false)
    setLoadingMessages(true)

    try {
      const { data } = await api.get(`/chat/${chatId}/messages`)
      if (selectionRequestRef.current === requestId) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      if (selectionRequestRef.current === requestId) {
        setPageError(getErrorMessage(error, 'Unable to load messages for this chat.'))
      }
    } finally {
      if (selectionRequestRef.current === requestId) setLoadingMessages(false)
    }
  }

  async function startNewChat() {
    if (creatingChatRef.current) return
    creatingChatRef.current = true
    setCreatingChat(true)
    setPageError('')
    setSendError('')

    try {
      const { data } = await api.post('/chat', { title: 'New chat' })
      const newChat = data?.chat
      if (!newChat?._id) {
        throw new Error('The chat service did not return a chat ID.')
      }

      const chatId = String(newChat._id)
      selectionRequestRef.current += 1
      currentChatRef.current = chatId
      setCurrentChatId(chatId)
      setMessages([])
      setInput('')
      setChats((current) => [
        newChat,
        ...current.filter((chat) => String(chat._id) !== chatId),
      ])
      setSidebarOpen(false)
      setLoadingMessages(false)
    } catch (error) {
      setPageError(getErrorMessage(error, error.message || 'Unable to create a new chat.'))
    } finally {
      creatingChatRef.current = false
      setCreatingChat(false)
    }
  }

  async function sendMessage(event) {
    event?.preventDefault()
    const content = input.trim()
    const socket = socketRef.current
    if (!content || submissionRef.current || !socket?.connected) return

    submissionRef.current = true
    setIsSubmitting(true)
    setSendError('')

    try {
      let chatId = currentChatRef.current
      if (!chatId) {
        const { data } = await api.post('/chat', {
          title: content.length > 60 ? `${content.slice(0, 57)}…` : content,
        })
        const newChat = data?.chat
        if (!newChat?._id) {
          throw new Error('The chat service did not return a chat ID.')
        }
        chatId = String(newChat._id)
        currentChatRef.current = chatId
        setCurrentChatId(chatId)
        setChats((current) => [newChat, ...current.filter((chat) => String(chat._id) !== chatId)])
      }

      setMessages((current) => [
        ...current,
        { _id: `user-${Date.now()}`, role: 'user', content },
      ])
      setInput('')
      setPendingChatId(chatId)
      const timeoutId = window.setTimeout(() => {
        if (pendingRef.current?.chatId !== chatId) return
        pendingRef.current = null
        submissionRef.current = false
        setIsSubmitting(false)
        setPendingChatId(null)
        setSendError('The assistant is taking too long to respond. Please try again.')
      }, responseTimeout)
      pendingRef.current = { chatId, timeoutId }
      socket.emit('ai-message', { chat: chatId, content })
    } catch (error) {
      submissionRef.current = false
      setIsSubmitting(false)
      setSendError(getErrorMessage(error, 'Unable to send your message. Please try again.'))
    }
  }

  async function handleLogout() {
    if (!window.confirm('Log out of Nova AI?')) return
    try {
      await logout()
      disconnectChatSocket()
      currentChatRef.current = null
      setChats([])
      setMessages([])
      setInput('')
      navigate('/login', { replace: true })
    } catch (error) {
      setPageError(
        error.response?.data?.message
          || 'Logout could not be confirmed. Your session may still be active; please try again.',
      )
    }
  }

  function toggleTheme() {
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }

  const currentChat = chats.find((chat) => String(chat._id) === currentChatId) || null
  const isWaitingForReply = pendingChatId === currentChatId

  return (
    <main className="chat-app">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        isOpen={sidebarOpen}
        loading={loadingChats}
        creatingChat={creatingChat}
        user={user}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelectChat={openChat}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <div className="chat-main">
        <ChatHeader
          chat={currentChat}
          onMenu={() => setSidebarOpen(true)}
          onToggleTheme={toggleTheme}
          socketStatus={socketStatus}
          theme={theme}
        />
        {socketError && (
          <div className="connection-notice" role="status">
            <span>{socketError}</span>
            {socketError.includes('session is missing or expired') && <Link to="/login">Sign in</Link>}
          </div>
        )}
        {pageError && (
          <div className="page-error" role="alert">
            <span>{pageError}</span>
            {pageError.includes('Sign in') && <Link to="/login">Go to sign in</Link>}
            <button type="button" aria-label="Dismiss error" onClick={() => setPageError('')}>×</button>
          </div>
        )}
        <ChatWindow
          isLoading={loadingMessages}
          isWaiting={isWaitingForReply}
          messages={messages}
        />
        <div className="composer-wrap">
          {sendError && <p className="send-error" role="alert">{sendError}</p>}
          <ChatInput
            isBusy={isSubmitting || Boolean(pendingChatId)}
            isConnected={socketStatus === 'connected'}
            socketStatus={socketStatus}
            onChange={setInput}
            onSubmit={sendMessage}
            value={input}
          />
          <p className="composer-note">Nova can make mistakes. Check important information.</p>
        </div>
      </div>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close chat menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  )
}

export default ChatPage
