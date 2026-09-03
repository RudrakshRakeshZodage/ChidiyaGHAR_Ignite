# 🕵️‍♂️ Code Mafia Frontend: Multiplayer Collaborative Debugging

Sleek Cyberpunk/Noir Mafia multiplayer web application built with React 18, Vite, Tailwind CSS, Lucide Icons, and Socket.IO for **Code Mafia**.

---

## 🎯 Features Implemented
- **Mission Lobby & Squad Assembly**: Nickname customization, 8 cyberpunk/hacker avatars, room code sharing, and match settings.
- **Dramatic Secret Role Reveal**: High-suspense modal revealing secret role (**Developer** vs **Code Mafia**) with secret sabotage/debugging protocols.
- **Real-time Collaborative Code Workspace**: Split-pane live code editor with line gutter, active collaborator indicators, and syntax handling.
- **Automated Test Runner**: Real-time pass/fail progress bar, test duration metrics, and detailed error assertion inspection.
- **Player Activity & Audit Feed**: Git-like commit and test log capturing developer edits to spot the saboteur.
- **Emergency Meetings & Voting**: Democratic voting round with countdown timer, suspect cards, and dramatic ejection sequence.
- **Victory / Defeat Screen**: Winner celebration with confetti, identity unmasking, and return to lobby.
- **Built-in Offline Mode**: Playable with standalone interactive simulation or connected to live Socket.IO backend.

---

## 🚀 Getting Started with PNPM

### Prerequisites
- Node.js >= 18
- pnpm (`npx pnpm` or `npm install -g pnpm`)

### Installation & Execution
```bash
# 1. Install dependencies with pnpm
pnpm install

# 2. Start Vite development server
pnpm run dev

# 3. Build for production
pnpm run build

# 4. Preview production build locally
pnpm run preview
```

---

## ⚙️ Environment Variables
Create a `.env` file in the root:
```env
# URL to your deployed or local Code Mafia backend
VITE_BACKEND_URL=http://localhost:5000
```

---

## ☁️ Deployment Guide

### Deploy to Vercel
1. Import this repository into [Vercel](https://vercel.com).
2. Set the Git Branch to **`Frontend`**.
3. **Framework Preset**: Vite
4. **Install Command**: `pnpm install`
5. **Build Command**: `pnpm run build`
6. **Output Directory**: `dist`
7. **Environment Variable**: `VITE_BACKEND_URL` = `<your-backend-render-url>`

### Deploy to Netlify
1. Import this repository into [Netlify](https://netlify.com).
2. Set branch to **`Frontend`**.
3. **Build Command**: `pnpm run build`
4. **Publish directory**: `dist`