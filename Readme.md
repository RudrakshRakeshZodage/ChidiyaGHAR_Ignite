# Code Mafia (ChidiyaGHAR Ignite) 🕵️‍♂️💻

> A real-time collaborative coding and social deduction multiplayer web game where developers solve algorithmic bugs while identifying the undercover Saboteur among them.

---

## 📂 Repository Structure

This repository is organized as a monorepo containing both the Frontend client application and Backend real-time execution server:

```
ChidiyaGHAR_Ignite/
├── frontend/                 # Vite + React client application
│   ├── src/
│   │   ├── components/       # UI modals, CodeEditor, TestRunner, Lobby, etc.
│   │   ├── services/         # Socket.io, Supabase auth client
│   │   ├── data/             # Challenge bank
│   │   ├── App.jsx           # Main orchestrator component
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── Readme.md             # Frontend-specific documentation
│
├── backend/                  # Node.js + Express + Socket.io game server
│   ├── src/
│   │   ├── db/               # Supabase database client
│   │   ├── game/             # RoomManager, RoleAssigner, TestEngine, challenges
│   │   ├── routes/           # REST APIs (auth, health, keep-alive)
│   │   └── server.js         # Entrypoint with real-time socket handlers
│   ├── test/                 # Automated unit and integration test suite
│   ├── package.json
│   ├── Procfile              # Render / Heroku process configuration
│   └── Readme.md             # Backend-specific documentation
│
├── supabase_schema.sql       # Database schema & RLS policies for Supabase
├── pnpm-workspace.yaml       # Workspace definition for pnpm
├── package.json              # Root workspace scripts
└── Readme.md                 # Project documentation (this file)
```

---

## ⚡ Quickstart (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **pnpm**: `npm install -g pnpm`
- **Supabase Account**: (or local Supabase instance)

### 2. Install Dependencies
Run from the root directory to install all packages across workspaces:
```bash
pnpm install
```

### 3. Database Setup (Supabase)
1. Open your Supabase project dashboard -> **SQL Editor**.
2. Run the script provided in [`supabase_schema.sql`](file:///d:/Rudraksh/College/app/ChidiyaGHAR_Ignite/supabase_schema.sql).
3. The script creates the `users` and `games` tables, triggers for auto-updating timestamps, and Row-Level Security (RLS) policies.

### 4. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Frontend (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

### 5. Running the Application

You can run both or either service using root workspace commands:

```bash
# Run both Frontend & Backend concurrently
pnpm dev

# Or run services individually:
pnpm dev:backend   # Starts Node.js backend on port 5000
pnpm dev:frontend  # Starts Vite React frontend on port 5173
```

---

## 🧪 Testing

Run the backend test suite:
```bash
pnpm test:backend
```
Or directly inside `backend/`:
```bash
cd backend && node --test
```

---

## 🚀 Deployment

- **Frontend**: Deploy `frontend/` directory to **Vercel** with build command `pnpm build` and output directory `dist`. See [`frontend/Readme.md`](file:///d:/Rudraksh/College/app/ChidiyaGHAR_Ignite/frontend/Readme.md) for step-by-step instructions.
- **Backend**: Deploy `backend/` directory to **Render** / **Railway** as a Web Service using `pnpm start`. See [`backend/Readme.md`](file:///d:/Rudraksh/College/app/ChidiyaGHAR_Ignite/backend/Readme.md) for anti-sleep and environment configurations.

---

## 👥 Authors & Acknowledgements
Built by the **ChidiyaGHAR Ignite** team.