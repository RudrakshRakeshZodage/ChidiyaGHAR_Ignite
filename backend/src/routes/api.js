import express from "express";
import { CHALLENGES } from "../game/challenges.js";

let pingCount = 0;

export function createApiRouter(roomManager) {
  const router = express.Router();

  // Root endpoint (Keeps server awake & displays API info)
  router.get("/", (req, res) => {
    pingCount++;
    res.json({
      service: "Code Mafia Game Engine Backend",
      status: "alive",
      uptimeSeconds: Math.floor(process.uptime()),
      totalPingsReceived: pingCount,
      timestamp: new Date().toISOString()
    });
  });

  // Fast lightweight ping endpoint for UptimeRobot / cron-job.org
  router.all("/ping", (req, res) => {
    pingCount++;
    res.status(200).send("pong");
  });

  // Health check endpoint
  router.all("/health", (req, res) => {
    pingCount++;
    res.status(200).json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: "Code Mafia Game Engine Backend",
      version: "1.0.0",
      pingsReceived: pingCount,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
  });

  // Keep-alive route for external robots
  router.all("/keep-alive", (req, res) => {
    pingCount++;
    res.status(200).json({
      status: "alive",
      message: "Server is awake and ready for multiplayer sessions!",
      uptimeHours: (process.uptime() / 3600).toFixed(2),
      activeRooms: roomManager.rooms.size,
      pingsReceived: pingCount,
      timestamp: new Date().toISOString()
    });
  });

  // Public stats & active rooms count
  router.get("/api/status", (req, res) => {
    res.json({
      activeRooms: roomManager.rooms.size,
      challengesAvailable: CHALLENGES.length,
      serverTime: Date.now()
    });
  });

  // List public challenge descriptions
  router.get("/api/challenges", (req, res) => {
    const list = CHALLENGES.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      difficulty: c.difficulty,
      description: c.description,
      bugsCount: c.bugsCount,
      testCount: c.testSuite.length
    }));
    res.json(list);
  });

  // Global Leaderboard & Agent Dashboard Stats
  router.get("/api/leaderboard", (req, res) => {
    const leaderboard = [
      { id: "1", rank: 1, name: "ShadowHacker", avatar: "🥷", elo: 2480, winRate: "88%", matches: 54, favoriteRole: "MAFIA", devWins: 18, mafiaWins: 30, badges: ["Master Saboteur", "Ghost Committer"] },
      { id: "2", rank: 2, name: "PixelDoctor", avatar: "👩‍💻", elo: 2390, winRate: "82%", matches: 61, favoriteRole: "DEVELOPER", devWins: 42, mafiaWins: 8, badges: ["Grandmaster Debugger", "Test Speedrunner"] },
      { id: "3", rank: 3, name: "CyberSpecter", avatar: "👻", elo: 2280, winRate: "79%", matches: 48, favoriteRole: "MAFIA", devWins: 12, mafiaWins: 26, badges: ["Stealth Infiltrator", "Uncaught Saboteur"] },
      { id: "4", rank: 4, name: "DevWizard", avatar: "🧙‍♂️", elo: 2190, winRate: "75%", matches: 52, favoriteRole: "DEVELOPER", devWins: 35, mafiaWins: 4, badges: ["Architecture Stabilizer", "Clean Coder"] },
      { id: "5", rank: 5, name: "NullPointer", avatar: "🤖", elo: 2110, winRate: "71%", matches: 45, favoriteRole: "MAFIA", devWins: 14, mafiaWins: 18, badges: ["Exception Crafter"] },
      { id: "6", rank: 6, name: "AaravCoder", avatar: "👨‍💻", elo: 2040, winRate: "68%", matches: 38, favoriteRole: "DEVELOPER", devWins: 22, mafiaWins: 4, badges: ["Bug Hunter"] },
      { id: "7", rank: 7, name: "BunnyHacks", avatar: "👾", elo: 1980, winRate: "65%", matches: 34, favoriteRole: "MAFIA", devWins: 9, mafiaWins: 13, badges: ["Logic Inverter"] },
      { id: "8", rank: 8, name: "PritiDev", avatar: "👩‍💻", elo: 1920, winRate: "64%", matches: 31, favoriteRole: "DEVELOPER", devWins: 18, mafiaWins: 2, badges: ["Test Guardian"] }
    ];

    res.json({
      success: true,
      totalMatchesPlayed: 840,
      activeDevelopers: 320,
      activeMafia: 110,
      leaderboard
    });
  });

  return router;
}
