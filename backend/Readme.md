# 🕵️‍♂️ Code Mafia Backend: Multiplayer Debugging Challenge Engine

Real-time **Node.js** + **Socket.IO** backend with sandboxed **Node VM** code execution engine and **Supabase** persistence for **Code Mafia**.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Setup on a Brand New System (Step-by-Step Terminal Commands)](#-setup-on-a-brand-new-system-step-by-step-terminal-commands)
3. [Running Locally](#-running-locally)
4. [Environment Variables](#-environment-variables)
5. [Step-by-Step Deployment to Render](#-step-by-step-deployment-to-render)
6. [API & WebSocket Documentation](#-api--websocket-documentation)
7. [Project Structure](#-project-structure)

---

## ⚡ Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) → [Download Node.js](https://nodejs.org/)
- **Git** → [Download Git](https://git-scm.com/)
- **PNPM** package manager

---

## 💻 Setup on a Brand New System (Step-by-Step Terminal Commands)

Run the following commands in your terminal (PowerShell, Command Prompt, or Bash):

### Step 1: Clone the Repository & Checkout Backend Branch
```bash
# Clone the repository
git clone https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite.git

# Navigate into the project directory
cd ChidiyaGHAR_Ignite

# Checkout the Backend branch
git checkout Backend
```

### Step 2: Install PNPM (if not already installed)
```bash
# Install PNPM globally via npm
npm install -g pnpm

# Verify PNPM installation
pnpm -v
```

### Step 3: Install Project Dependencies
```bash
# Install dependencies using pnpm
pnpm install
```

### Step 4: Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env
```
*(Or on Windows PowerShell: `Copy-Item .env.example .env`)*

Your `.env` will contain:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase Credentials
SUPABASE_URL=https://msgjuazmayoimjjaatmh.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh
SUPABASE_SECRET_KEY=sb_secret_PwTFIH64UCR-xJ1Z9c5ERw_J12jVn_B
SUPABASE_JWKS_URL=https://msgjuazmayoimjjaatmh.supabase.co/auth/v1/.well-known/jwks.json
```

---

## 🚀 Running Locally

### Development Server (with Auto-Reload)
```bash
# Start backend in development mode with nodemon
pnpm run dev
```

### Production Server
```bash
# Start backend in production mode
pnpm start
```

### Run Unit Tests
```bash
# Execute unit test suite for sandbox runner & challenges
pnpm test
# OR
node test/server.test.js
```

---

## ☁️ Step-by-Step Deployment to Render

Follow these exact steps to deploy the backend on [Render](https://render.com):

### Step 1: Push latest changes to GitHub
```bash
git add .
git commit -m "feat: ready for render deployment"
git push origin Backend
```

### Step 2: Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in.
2. Click **"New +"** → **"Web Service"**.
3. Connect your GitHub account and select repository **`RudrakshRakeshZodage/ChidiyaGHAR_Ignite`**.

### Step 3: Configure Render Settings
Fill in the deployment configuration:
- **Name**: `code-mafia-backend` (or your preferred name)
- **Region**: Closest to your players (e.g. `Singapore` or `Frankfurt`)
- **Branch**: **`Backend`** (⚠️ Important: Ensure `Backend` is selected, NOT `main`)
- **Root Directory**: `./` (leave blank / default)
- **Runtime**: `Node`
- **Build Command**: `npx pnpm install`
- **Start Command**: `node src/server.js` (or `npx pnpm start`)
- **Instance Type**: `Free`

### Step 4: Add Environment Variables on Render
Under **Environment Variables**, add the following key-value pairs:
| Key | Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` *(or your Vercel frontend URL)* |
| `SUPABASE_URL` | `https://msgjuazmayoimjjaatmh.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh` |
| `SUPABASE_SECRET_KEY` | `sb_secret_PwTFIH64UCR-xJ1Z9c5ERw_J12jVn_B` |
| `SUPABASE_JWKS_URL` | `https://msgjuazmayoimjjaatmh.supabase.co/auth/v1/.well-known/jwks.json` |

### Step 5: Deploy & Get URL
1. Click **"Deploy Web Service"**.
2. Render will build and deploy your service.
3. Once deployed, copy your Render Service URL (e.g., `https://code-mafia-backend.onrender.com`).
4. Verify by opening `https://code-mafia-backend.onrender.com/health` in your browser. You will see:
   ```json
   {
     "status": "ok",
     "uptime": 12.4,
     "timestamp": "2026-09-03T11:45:00.000Z",
     "service": "Code Mafia Game Engine Backend",
     "version": "1.0.0"
   }
   ```
5. Paste this URL into your Frontend's `VITE_BACKEND_URL` on Vercel!

---

## 🤖 Anti-Sleep / Keep-Alive Robot Setup (Prevent Render from Sleeping)

Render's free tier spins down services after 15 minutes of inactivity. To keep your multiplayer game backend running 24/7 with zero cold starts, use any of the free uptime pingers below:

### Option A: Free UptimeRobot Setup (Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com/) and create a free account.
2. Click **"+ Add New Monitor"**.
3. **Monitor Type**: `HTTP(s)`
4. **Friendly Name**: `Code Mafia Backend`
5. **URL (or IP)**: `https://your-backend.onrender.com/ping` (or `/health`)
6. **Monitoring Interval**: `Every 5 minutes`
7. Click **"Create Monitor"**.
8. UptimeRobot will ping your backend every 5 minutes, preventing Render from ever falling asleep!

### Option B: Free Cron-job.org Setup
1. Go to [cron-job.org](https://cron-job.org/) and sign up.
2. Click **"Create Cronjob"**.
3. **Title**: `Keep Code Mafia Awake`
4. **URL**: `https://your-backend.onrender.com/ping`
5. **Execution Schedule**: `Every 5 or 10 minutes`
6. Click **"Save"**.

### Option C: Built-in Self-Pinger (Zero Config)
- The backend automatically detects the `RENDER_EXTERNAL_URL` environment variable provided by Render. If present, it will automatically ping itself every 10 minutes in the background!

---

## 🌐 API & WebSocket Documentation

### REST Endpoints
| Method | Route | Description |
|---|---|---|
| `GET/HEAD` | `/ping` | Lightweight fast 200 "pong" for anti-sleep robots |
| `GET/HEAD` | `/health` | Health & uptime JSON check for monitors |
| `GET` | `/keep-alive` | Status, uptime hours, active rooms, & ping counter |
| `GET` | `/api/status` | Active room stats & server status |
| `GET` | `/api/challenges` | Catalog of debugging challenges (public metadata) |
| `POST` | `/api/auth/signup` | Register a new user with email & password |
| `POST` | `/api/auth/login` | Sign in with email & password (returns session token) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Invalidate session |

### WebSocket Events
- **Room Lifecycle**: `room:create`, `room:join`, `room:ready_toggle`, `game:start`, `game:role_ack`
- **Code Collaboration**: `code:change` (broadcasts `code:sync` to room)
- **Test Runner**: `code:run_tests` (executes inside VM, broadcasts `tests:completed`)
- **Emergency Meeting**: `meeting:call`, `vote:cast`, `meeting:ejection`

---

## 📁 Project Structure

```
ChidiyaGHAR_Ignite (Backend Branch)
├── src/
│   ├── db/
│   │   └── supabase.js        # Supabase client & match result logger
│   ├── game/
│   │   ├── challenges.js      # Challenge definitions, starter code & test suites
│   │   ├── RoleAssigner.js    # Developer vs Mafia secret role assignment
│   │   ├── RoomManager.js     # State machine for rooms, voting & win conditions
│   │   └── TestEngine.js      # Sandboxed Node VM code execution runner
│   ├── routes/
│   │   └── api.js             # REST API router (/health, /api/challenges)
│   └── server.js              # Express + Socket.IO server entrypoint
├── test/
│   └── server.test.js         # Automated backend test suite
├── .env.example               # Environment variables template
├── package.json               # Backend dependencies & scripts
└── Procfile                   # Cloud process file for Render / Railway / Heroku
```