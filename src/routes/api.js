import express from "express";
import { CHALLENGES } from "../game/challenges.js";

export function createApiRouter(roomManager) {
  const router = express.Router();

  // Deployment Health Check
  router.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: "Code Mafia Game Engine Backend",
      version: "1.0.0"
    });
  });

  // Public stats & active rooms count
  router.get("/status", (req, res) => {
    res.json({
      activeRooms: roomManager.rooms.size,
      challengesAvailable: CHALLENGES.length,
      serverTime: Date.now()
    });
  });

  // List public challenge descriptions
  router.get("/challenges", (req, res) => {
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

  return router;
}
