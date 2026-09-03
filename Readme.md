# 🕵️‍♂️ Code Mafia Backend: Multiplayer Debugging Challenge Engine

Real-time Node.js + Socket.IO backend with sandboxed VM code execution engine for **Code Mafia**.

---

## 🎯 Problem Statement Features Implemented
- **Game Creation & Lobby Management**: In-memory room orchestration with dynamic player capacity and customizable match timers.
- **Hidden Role Assignment**: Secret role allocation engine (**Developers** vs **Code Mafia**) with secret sabotaging objectives.
- **Real-Time Collaborative State**: Synchronized codebase updates, test runner outputs, and player presence.
- **Controlled Test Runner Sandbox**: Isolated Node `vm` execution testing user code against unit test assertions with timeout safety.
- **Player Activity Audit Log**: Git-like commit and test log capturing developer edits and suspected sabotage actions.
- **Emergency Meetings & Democratic Voting**: Countdown timer voting mechanism with tie-breakers and ejection resolution.
- **Configurable Victory Conditions**: Automatic win/loss resolution (100% tests passed vs Mafia parity/timer expiration).

---

## 🚀 Getting Started with PNPM

### Prerequisites
- Node.js >= 18
- pnpm (`npx pnpm` or `npm install -g pnpm`)

### Installation & Execution
```bash
# Install dependencies using pnpm
pnpm install

# Run in development mode (with hot reloading)
pnpm run dev

# Run in production mode
pnpm start
```

---

## 🌐 Endpoints & WebSockets

### REST Endpoints
| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Cloud deployment health check & uptime monitor |
| `GET` | `/api/status` | Active room stats & server status |
| `GET` | `/api/challenges` | Catalog of debugging challenges (public metadata) |

### WebSocket Real-time Events
- `room:create` / `room:join` / `room:leave`
- `room:ready_toggle` / `game:start` / `game:role_ack`
- `code:change` / `code:sync`
- `code:run_tests` / `tests:completed`
- `meeting:call` / `vote:cast` / `meeting:ejection`
- `chat:send` / `chat:message`

---

## ☁️ Deployment Guide

### Deploy to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect this repository and set the branch to **`Backend`**.
3. **Build Command**: `npx pnpm install`
4. **Start Command**: `npx pnpm start`
5. **Environment Variables**:
   - `PORT`: `5000` (or leave default, Render supplies `PORT`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `*` (or your frontend URL)

### Deploy to Railway / Heroku
- The included `Procfile` is preconfigured for single-click deployment:
  ```
  web: node src/server.js
  ```