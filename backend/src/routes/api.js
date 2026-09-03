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

  // Real-time Global Leaderboard & Agent Dashboard Stats (Live from Supabase & Active Sessions)
  router.get("/api/leaderboard", async (req, res) => {
    const data = await fetchRealtimeLeaderboard();
    res.json(data);
  });

  router.get("/leaderboard", async (req, res) => {
    const data = await fetchRealtimeLeaderboard();
    res.json(data);
  });

  return router;
}
