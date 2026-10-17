# Nova AI chat frontend

React 19 and Vite frontend for the existing Express, MongoDB, and Socket.IO backend.

## Run locally

1. Install the backend dependencies and configure the backend environment described in `../Backend/.env.example`.
2. Start the backend from `Backend/` with `npm run dev`. It listens on port `3000`.
3. Copy `.env.example` to `.env` in `Frontend/` if the backend URLs differ from their local defaults.
4. Run `npm install` and `npm run dev` from `Frontend/`.
5. Open `http://localhost:5173`; unauthenticated users are sent to `/login`. Register at `/register` or sign in at `/login`. The frontend verifies the HTTP-only cookie with `/api/auth/me` and sends credentials with HTTP and Socket.IO requests.

`VITE_API_URL` is the Express API base URL (including `/api`); `VITE_SOCKET_URL` is the Socket.IO server origin. Neither variable should contain secrets. If Vite selects a different port than `5173`, set backend `FRONTEND_URL` to that exact frontend origin.

## Backend integration

- `POST /api/auth/register` and `POST /api/auth/login` use the existing account flow.
- `GET /api/auth/me` restores and verifies the cookie-backed session; `POST /api/auth/logout` clears it and closes the user's active sockets.
- `POST /api/chat` creates a chat; `GET /api/chat` lists the signed-in user's chats; `GET /api/chat/:chatId/messages` loads messages for a chat the user owns.
- Socket.IO sends `ai-message` with `{ chat, content }` and receives `ai-response` with `{ content, chat }`. `ai-error` carries `{ chat, message }` for a failed request.

Message text is displayed with its original line breaks. The current dependencies do not include a Markdown renderer.
