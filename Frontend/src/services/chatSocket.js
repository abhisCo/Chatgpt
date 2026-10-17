import { io } from 'socket.io-client'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, '')
let chatSocket

export function getChatSocket() {
  if (!chatSocket) {
    chatSocket = io(socketUrl, { autoConnect: false, withCredentials: true })
  }
  return chatSocket
}

export function disconnectChatSocket() {
  if (!chatSocket) return
  chatSocket.removeAllListeners()
  chatSocket.disconnect()
  chatSocket = null
}
