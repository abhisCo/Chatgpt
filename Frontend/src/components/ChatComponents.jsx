import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'plus') {
    return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
  }
  if (name === 'menu') {
    return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
  }
  if (name === 'sun') {
    return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
  }
  if (name === 'moon') {
    return <svg {...common}><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></svg>
  }
  if (name === 'send') {
    return <svg {...common}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
  }
  if (name === 'settings') {
    return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" /></svg>
  }
  if (name === 'user') {
    return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
  }
  if (name === 'spark') {
    return <svg {...common}><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></svg>
  }
  return <svg {...common}><path d="M4 5h16v11H8l-4 4V5Z" /></svg>
}

function Sidebar({
  chats,
  currentChatId,
  isOpen,
  loading,
  creatingChat,
  user,
  theme,
  onClose,
  onNewChat,
  onSelectChat,
  onToggleTheme,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)
  const fullName = [user?.fullName?.firstName, user?.fullName?.lastName].filter(Boolean).join(' ')
  const initials = [user?.fullName?.firstName, user?.fullName?.lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U'

  useEffect(() => {
    if (!menuOpen) return undefined

    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <aside className={`chat-sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar-top">
        <Link className="brand" to="/" aria-label="Nova home">
          <span className="brand-symbol"><Icon name="spark" size={20} /></span>
          <span>nova<span className="brand-period">.</span></span>
        </Link>
        <button className="icon-button sidebar-close" type="button" onClick={onClose} aria-label="Close menu">×</button>
      </div>
      <button className="new-chat-button" type="button" onClick={onNewChat} disabled={creatingChat}>
        <Icon name="plus" />
        <span>{creatingChat ? 'Creating chat…' : 'New chat'}</span>
      </button>
      <div className="history-heading">YOUR CHATS</div>
      <nav className="chat-history" aria-label="Previous chats">
        {loading ? (
          <p className="history-message">Loading chats…</p>
        ) : chats.length === 0 ? (
          <p className="history-message">Your conversations will appear here.</p>
        ) : chats.map((chat) => (
          <button
            className={`history-item${String(chat._id) === currentChatId ? ' is-active' : ''}`}
            key={chat._id}
            type="button"
            title={chat.title}
            onClick={() => onSelectChat(chat)}
          >
            <Icon name="chat" size={16} />
            <span>{chat.title}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="footer-avatar">{initials}</div>
        <div className="sidebar-account">
          <strong>{fullName || user?.email || 'Account'}</strong>
          <span>{user?.email}</span>
        </div>
        <div className="profile-actions" ref={menuRef}>
          <button
            className="icon-button profile-menu-trigger"
            type="button"
            aria-label="Open account settings"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="settings" />
          </button>
          {menuOpen && (
            <div className="profile-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setSettingsOpen(true)
                }}
              >
                <Icon name="settings" size={16} />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                className="logout-menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  onLogout()
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      {settingsOpen && (
        <SettingsPanel
          user={user}
          theme={theme}
          onClose={() => setSettingsOpen(false)}
          onToggleTheme={onToggleTheme}
        />
      )}
    </aside>
  )
}

function SettingsPanel({ user, theme, onClose, onToggleTheme }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const fullName = [user?.fullName?.firstName, user?.fullName?.lastName].filter(Boolean).join(' ')

  return (
    <div className="settings-overlay" role="presentation" onPointerDown={onClose}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="settings-dialog-header">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close settings">×</button>
        </div>
        <div className="settings-account">
          <span>Account</span>
          {fullName && <strong>{fullName}</strong>}
          <span>{user?.email}</span>
        </div>
        <div className="settings-theme-row">
          <div>
            <strong>Appearance</strong>
            <span>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>
          </div>
          <button type="button" className="settings-theme-button" onClick={onToggleTheme}>
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </section>
    </div>
  )
}

function ChatHeader({ chat, onMenu, onToggleTheme, socketStatus, theme }) {
  const statusText = socketStatus === 'connected'
    ? 'Connected'
    : socketStatus === 'connecting' ? 'Connecting' : 'Offline'

  return (
    <header className="chat-header">
      <button className="icon-button menu-button" type="button" onClick={onMenu} aria-label="Open chat menu">
        <Icon name="menu" />
      </button>
      <div className="header-title">
        <h1>{chat?.title || 'New conversation'}</h1>
        <span className={`connection-status status-${socketStatus}`}>
          <span className="status-dot" />
          {statusText}
        </span>
      </div>
      <button
        className="icon-button theme-button"
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </header>
  )
}

function EmptyChatState() {
  return (
    <div className="empty-state">
      <div className="empty-symbol"><Icon name="spark" size={25} /></div>
      <p className="empty-eyebrow">A LITTLE SPACE TO THINK</p>
      <h2>What&apos;s on your mind?</h2>
      <p className="empty-description">Ask a question, work through an idea, or just see where the conversation takes you.</p>
      <div className="suggestion-list" aria-hidden="true">
        <span>Explain something simply</span>
        <span>Help me write</span>
        <span>Brainstorm an idea</span>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <article className={`message-row${isUser ? ' message-user' : ' message-assistant'}`}>
      <div className={`message-avatar${isUser ? ' user-avatar' : ''}`}>
        {isUser ? <Icon name="user" size={17} /> : <Icon name="spark" size={17} />}
      </div>
      <div className="message-content">
        <div className="message-author">{isUser ? 'You' : 'Nova'}</div>
        <p>{message.content}</p>
      </div>
    </article>
  )
}

function TypingIndicator() {
  return (
    <div className="message-row message-assistant typing-row" role="status" aria-label="Nova is responding">
      <div className="message-avatar"><Icon name="spark" size={17} /></div>
      <div className="typing-dots"><i /><i /><i /></div>
    </div>
  )
}

function ChatWindow({ isLoading, isWaiting, messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isWaiting])

  return (
    <section className="chat-scroll-area" aria-label="Conversation">
      {isLoading ? (
        <div className="conversation-loading"><span className="loading-spinner" />Loading conversation…</div>
      ) : messages.length === 0 ? (
        <EmptyChatState />
      ) : (
        <div className="message-list">
          {messages.map((message, index) => (
            <MessageBubble key={message._id || `${message.role}-${index}`} message={message} />
          ))}
          {isWaiting && <TypingIndicator />}
        </div>
      )}
      <div ref={bottomRef} />
    </section>
  )
}

function ChatInput({ isBusy, isConnected, socketStatus, onChange, onSubmit, value }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`
  }, [value])

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit(event)
    }
  }

  function handleChange(event) {
    onChange(event.target.value)
  }

  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <textarea
        ref={inputRef}
        aria-label="Message Nova"
        placeholder={
          isConnected
            ? 'Message Nova…'
            : socketStatus === 'connecting'
              ? 'Connecting to Nova…'
              : 'Assistant offline. Check the connection.'
        }
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={!isConnected || isBusy}
      />
      <div className="composer-actions">
        <span className="composer-hint">Shift + Enter for a new line</span>
        <button
          className="send-button"
          type="submit"
          disabled={!value.trim() || isBusy || !isConnected}
          aria-label="Send message"
        >
          <Icon name="send" size={17} />
        </button>
      </div>
    </form>
  )
}

export {
  ChatHeader,
  ChatInput,
  ChatWindow,
  SettingsPanel,
  Sidebar,
}
