# 🕵️‍♂️ Code Mafia Frontend: Multiplayer Collaborative Debugging

Sleek Cyberpunk/Noir Mafia multiplayer web application built with **React 18**, **Vite 6**, **Tailwind CSS**, **Lucide Icons**, **Supabase**, and **Socket.IO**.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Setup on a Brand New System (Step-by-Step Terminal Commands)](#-setup-on-a-brand-new-system-step-by-step-terminal-commands)
3. [Running Locally](#-running-locally)
4. [Environment Variables](#-environment-variables)
5. [Step-by-Step Deployment to Vercel](#-step-by-step-deployment-to-vercel)
6. [Project Structure](#-project-structure)

---

## ⚡ Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) → [Download Node.js](https://nodejs.org/)
- **Git** → [Download Git](https://git-scm.com/)
- **PNPM** package manager

---

## 💻 Setup on a Brand New System (Step-by-Step Terminal Commands)

Run the following commands in your terminal (PowerShell, Command Prompt, or Bash):

### Step 1: Clone the Repository & Checkout Frontend Branch
```bash
# Clone the repository
git clone https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite.git

# Navigate into the project directory
cd ChidiyaGHAR_Ignite

# Checkout the Frontend branch
git checkout Frontend
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
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://msgjuazmayoimjjaatmh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh
```

---

## 🚀 Running Locally

### Development Server
```bash
# Start local development server with hot reload
pnpm run dev
```
Open your browser and navigate to **`http://localhost:3000`** (or the URL shown in terminal).

### Production Build & Preview
```bash
# Build the production bundle
pnpm run build

# Preview the production build locally
pnpm run preview
```

---

## ☁️ Step-by-Step Deployment to Vercel

Follow these exact steps to deploy the frontend on [Vercel](https://vercel.com):

### Method A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your latest changes to GitHub**:
   ```bash
   git add .
   git commit -m "feat: ready for vercel deployment"
   git push origin Frontend
   ```
2. **Log into Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. **Import Project**:
   - Click **"Add New..."** → **"Project"**.
   - Select the repository `RudrakshRakeshZodage/ChidiyaGHAR_Ignite`.
4. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Git Branch**: Select `Frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
5. **Add Environment Variables**:
   Under **Environment Variables**, add:
   | Variable Name | Value |
   |---|---|
   | `VITE_BACKEND_URL` | `https://your-backend-app.onrender.com` *(use your deployed Render backend URL)* |
   | `VITE_SUPABASE_URL` | `https://msgjuazmayoimjjaatmh.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh` |
6. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will build and assign you a live URL (e.g. `https://chidiya-ghar-ignite-frontend.vercel.app`).

---

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy to Vercel (Production)
vercel --prod
```

---

## 📁 Project Structure

```
ChidiyaGHAR_Ignite (Frontend Branch)
├── public/                 # Static assets & icons
├── src/
│   ├── components/
│   │   ├── ActivityFeed.jsx   # Live git-like audit log
│   │   ├── CodeEditor.jsx     # Real-time collaborative code editor
│   │   ├── GameOverModal.jsx  # Win/Loss & identity unmasking screen
│   │   ├── Lobby.jsx          # Room creation, joining & match settings
│   │   ├── Navbar.jsx         # Header, room code copy, game timer & meeting button
│   │   ├── RoleModal.jsx      # Secret role reveal animation (Dev vs Mafia)
│   │   ├── TestRunner.jsx     # Automated test suite execution & assertions
│   │   └── VotingModal.jsx    # Emergency meeting & player ejection voting
│   ├── data/
│   │   └── challenges.js      # Debugging challenges & test suites
│   ├── services/
│   │   ├── socket.js          # Socket.IO real-time manager
│   │   └── supabase.js        # Supabase client integration
│   ├── App.jsx                # Master game state router & controller
│   ├── index.css              # Cyber Mafia noir design tokens & glow animations
│   └── main.jsx               # React DOM root mounting
├── .env.example               # Environment variables template
├── package.json               # Dependencies & build scripts
├── tailwind.config.js         # Tailwind theme customizations
├── vercel.json                # Single-page app routing rules for Vercel
└── vite.config.js             # Vite configuration
```