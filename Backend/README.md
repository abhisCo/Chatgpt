# ChatGPT clone backend

## Environment and startup

Copy `.env.example` to `.env` and set valid MongoDB, JWT, Gemini, and Pinecone credentials. Keep `.env` private and out of the frontend. `FRONTEND_URL` must match the frontend origin; it defaults to `http://localhost:5173`. Start from this directory with `npm run dev` (server port `3000`).

## Authentication

- `POST /api/auth/register` accepts `{ "fullName": { "firstName": "...", "lastName": "..." }, "email": "...", "password": "..." }`.
- `POST /api/auth/login` accepts `{ "email": "...", "password": "..." }`.
- Both successful responses set the HTTP-only `token` cookie and return a public `user` object.
- `GET /api/auth/me` validates that cookie and returns `{ "user": ... }`; use it to restore a session.
- `POST /api/auth/logout` clears the cookie and disconnects active Socket.IO connections belonging to the token's user.

HTTP requests and Socket.IO must use credentialed requests from the configured frontend origin. Logout clears the browser cookie; JWTs are otherwise stateless and are not persisted as revocable server-side sessions.

## Chat and Socket.IO contracts

All chat routes require the existing `token` cookie:

- `POST /api/chat` with `{ "title": "..." }` creates a chat.
- `GET /api/chat` returns `{ "chats": [...] }` for the authenticated user.
- `GET /api/chat/:chatId/messages` returns `{ "messages": [...] }` only when that user owns the chat.

The Socket.IO server authenticates the same cookie. Send `ai-message` with `{ "chat": "<chat id>", "content": "..." }`. Successful replies use `ai-response` with `{ "content": "...", "chat": "<chat id>" }`; failures use `ai-error` with `{ "chat": "<chat id>", "message": "..." }`.
