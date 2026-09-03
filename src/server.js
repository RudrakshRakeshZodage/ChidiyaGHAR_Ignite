import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { RoomManager, GAME_STATES } from "./game/RoomManager.js";
import { createApiRouter } from "./routes/api.js";
import { createAuthRouter } from "./routes/auth.js";
import { recordGameResult } from "./db/supabase.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const roomManager = new RoomManager();

// Mount REST routes (health & challenges)
app.use("/", createApiRouter(roomManager));
app.use("/api", createApiRouter(roomManager));

// Mount Auth routes (Email login & signup)
app.use("/api/auth", createAuthRouter());
app.use("/auth", createAuthRouter());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Broadcast sanitized room state to all sockets in the room
function broadcastRoomState(room) {
  if (!room) return;
  if (room.status === GAME_STATES.GAME_OVER && !room._loggedToDb) {
    room._loggedToDb = true;
    recordGameResult(room);
  }
  for (const player of room.players.values()) {
    if (player.socketId) {
      const sanitized = roomManager.sanitizeRoomForPlayer(room, player.id);
      io.to(player.socketId).emit("room:updated", sanitized);
    }
  }
}

// Start game clock ticker
function startGameTicker(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room || room.timer) return;

  room.timer = setInterval(() => {
    if (!roomManager.getRoom(roomCode)) {
      clearInterval(room.timer);
      return;
    }

    if (room.status === GAME_STATES.PLAYING) {
      room.timeRemainingSeconds -= 1;

      // Time expired -> Mafia victory
      if (room.timeRemainingSeconds <= 0) {
        room.status = GAME_STATES.GAME_OVER;
        room.winner = "MAFIA";
        room.winReason = "Time expired! The project could not be stabilized in time.";
        clearInterval(room.timer);
        room.timer = null;
      }

      // Sync time to all players every 5s or when urgent
      if (room.timeRemainingSeconds % 5 === 0 || room.timeRemainingSeconds <= 30) {
        io.to(roomCode).emit("game:timer_sync", {
          timeRemainingSeconds: room.timeRemainingSeconds
        });
      }

      if (room.status === GAME_STATES.GAME_OVER) {
        broadcastRoomState(room);
      }
    }
  }, 1000);
}

// Socket.IO event handlers
io.on("connection", (socket) => {
  let currentRoomCode = null;
  let currentPlayerId = null;

  // 1. Create Room
  socket.on("room:create", ({ player, settings }, callback) => {
    try {
      const p = { ...player, socketId: socket.id };
      const room = roomManager.createRoom(p, settings);
      currentRoomCode = room.code;
      currentPlayerId = p.id;
      
      socket.join(room.code);
      callback?.({ success: true, room: roomManager.sanitizeRoomForPlayer(room, p.id) });
      broadcastRoomState(room);
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 2. Join Room
  socket.on("room:join", ({ roomCode, player }, callback) => {
    try {
      const p = { ...player, socketId: socket.id };
      const res = roomManager.joinRoom(roomCode, p);
      if (res.error) {
        return callback?.({ success: false, error: res.error });
      }

      currentRoomCode = res.room.code;
      currentPlayerId = res.player.id;
      socket.join(res.room.code);

      callback?.({ success: true, room: roomManager.sanitizeRoomForPlayer(res.room, res.player.id) });
      broadcastRoomState(res.room);
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 3. Player Ready Toggle
  socket.on("room:ready_toggle", () => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.getRoom(currentRoomCode);
    if (!room) return;

    const player = room.players.get(currentPlayerId);
    if (player) {
      player.isReady = !player.isReady;
      broadcastRoomState(room);
    }
  });

  // 4. Start Game
  socket.on("game:start", (callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const res = roomManager.startGame(currentRoomCode, currentPlayerId);
    if (res.error) {
      return callback?.({ success: false, error: res.error });
    }

    broadcastRoomState(res.room);
    startGameTicker(currentRoomCode);
    callback?.({ success: true });
  });

  // 5. Role Revealed (Transition to Playing)
  socket.on("game:role_ack", () => {
    if (!currentRoomCode) return;
    const room = roomManager.getRoom(currentRoomCode);
    if (!room) return;

    if (room.status === GAME_STATES.ROLE_REVEAL) {
      room.status = GAME_STATES.PLAYING;
      broadcastRoomState(room);
    }
  });

  // 6. Collaborative Code Update
  socket.on("code:change", ({ code }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.updateCode(currentRoomCode, currentPlayerId, code);
    if (room) {
      socket.to(currentRoomCode).emit("code:sync", {
        code: room.currentCode,
        updatedBy: currentPlayerId
      });
    }
  });

  // 7. Run Tests
  socket.on("code:run_tests", (callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const res = roomManager.runTests(currentRoomCode, currentPlayerId);
    if (!res) return;

    callback?.({ success: true, testResults: res.testResults });
    io.to(currentRoomCode).emit("tests:completed", {
      testResults: res.testResults,
      runBy: currentPlayerId
    });
    broadcastRoomState(res.room);
  });

  // 8. Emergency Meeting
  socket.on("meeting:call", (callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const res = roomManager.callEmergencyMeeting(currentRoomCode, currentPlayerId);
    if (res.error) {
      return callback?.({ success: false, error: res.error });
    }

    broadcastRoomState(res.room);
    callback?.({ success: true });

    // Auto-resolve voting when timer expires
    setTimeout(() => {
      const r = roomManager.getRoom(currentRoomCode);
      if (r && r.status === GAME_STATES.VOTING) {
        const resolveRes = roomManager.resolveVoting(currentRoomCode);
        if (resolveRes) {
          io.to(currentRoomCode).emit("meeting:ejection", {
            ejectedPlayer: resolveRes.ejectedPlayer,
            votesSummary: resolveRes.votesSummary
          });
          broadcastRoomState(resolveRes.room);
        }
      }
    }, res.room.settings.votingDurationSeconds * 1000);
  });

  // 9. Cast Vote
  socket.on("vote:cast", ({ targetId }, callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const res = roomManager.castVote(currentRoomCode, currentPlayerId, targetId);
    if (!res) return callback?.({ success: false });

    callback?.({ success: true });
    broadcastRoomState(res.room);

    // If all alive players have voted, resolve immediately
    if (res.allVoted) {
      const resolveRes = roomManager.resolveVoting(currentRoomCode);
      if (resolveRes) {
        io.to(currentRoomCode).emit("meeting:ejection", {
          ejectedPlayer: resolveRes.ejectedPlayer,
          votesSummary: resolveRes.votesSummary
        });
        broadcastRoomState(resolveRes.room);
      }
    }
  });

  // 10. In-Game Chat Message
  socket.on("chat:send", ({ message }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.getRoom(currentRoomCode);
    if (!room) return;

    const sender = room.players.get(currentPlayerId);
    if (!sender) return;

    io.to(currentRoomCode).emit("chat:message", {
      id: Date.now().toString(),
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      message,
      timestamp: Date.now()
    });
  });

  // 11. Disconnect
  socket.on("disconnect", () => {
    if (currentRoomCode && currentPlayerId) {
      const room = roomManager.leaveRoom(currentRoomCode, currentPlayerId);
      if (room) {
        broadcastRoomState(room);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Code Mafia Backend running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/health`);
});
