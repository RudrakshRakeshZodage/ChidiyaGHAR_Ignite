import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { RoomManager, GAME_STATES } from "./game/RoomManager.js";
import { createApiRouter } from "./routes/api.js";
import { createAuthRouter } from "./routes/auth.js";
import { recordGameResult } from "./db/supabase.js";
import { generateAiRiddlesForMafia } from "./services/aiRiddleService.js";

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

      // 30s Active Coding / 15s Code Freeze Cycle
      if (!room.phase) room.phase = "CODING";
      if (room.phaseTimeRemaining === undefined) room.phaseTimeRemaining = 30;

      room.phaseTimeRemaining -= 1;

      if (room.phase === "CODING" && room.phaseTimeRemaining <= 0) {
        // Transition to 15s Code Freeze
        room.phase = "FREEZE";
        room.phaseTimeRemaining = 15;
        room.activityLog.push({
          id: uuidv4(),
          type: "PHASE_CHANGE",
          text: "❄️ CODE FREEZE ACTIVATED (15s): Code editing locked for team inspection & testing!",
          timestamp: Date.now()
        });
        io.to(roomCode).emit("game:phase_change", {
          phase: "FREEZE",
          phaseTimeRemaining: 15,
          currentCode: room.currentCode,
          snapshotBeforeCode: room.snapshotBeforeCode
        });
        broadcastRoomState(room);
      } else if (room.phase === "FREEZE" && room.phaseTimeRemaining <= 0) {
        // Transition to 30s Active Coding Sprint
        room.phase = "CODING";
        room.phaseTimeRemaining = 30;
        room.snapshotBeforeCode = room.currentCode; // Set new baseline snapshot for the upcoming cycle
        room.activityLog.push({
          id: uuidv4(),
          type: "PHASE_CHANGE",
          text: "⚡ ACTIVE CODING SPRINT (30s): Code editing unlocked for all developers & mafia!",
          timestamp: Date.now()
        });
        io.to(roomCode).emit("game:phase_change", {
          phase: "CODING",
          phaseTimeRemaining: 30,
          currentCode: room.currentCode,
          snapshotBeforeCode: room.snapshotBeforeCode
        });
        broadcastRoomState(room);
      } else {
        // Periodic sync of phase ticker
        io.to(roomCode).emit("game:phase_tick", {
          phase: room.phase,
          phaseTimeRemaining: room.phaseTimeRemaining
        });
      }

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

    // Asynchronously generate AI-enhanced riddles with AIHubMix
    const mafiaPlayer = Array.from(res.room.players.values()).find(p => p.role === "MAFIA");
    if (mafiaPlayer) {
      generateAiRiddlesForMafia(mafiaPlayer.name, mafiaPlayer.avatar, res.room.challenge.testSuite.length)
        .then(aiRiddles => {
          const r = roomManager.getRoom(currentRoomCode);
          if (r && aiRiddles && aiRiddles.length > 0) {
            r.mysteryRiddles = aiRiddles;
            broadcastRoomState(r);
          }
        })
        .catch(err => console.warn("[AI] Riddle generation background error:", err.message));
    }
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

  // 6. Individual Code Update (Streams to Mafia CCTV Surveillance)
  socket.on("code:change", ({ code, fileName, files }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.updateCode(currentRoomCode, currentPlayerId, code, fileName, files);
    if (!room || room.error) return;

    const sender = room.players.get(currentPlayerId);
    
    // Stream live screen updates to all Mafia operatives in the room
    for (const p of room.players.values()) {
      if (p.role === "MAFIA" && p.socketId && p.id !== currentPlayerId) {
        io.to(p.socketId).emit("mafia:screen_update", {
          targetPlayerId: currentPlayerId,
          targetPlayerName: sender?.name || "Developer",
          code,
          fileName,
          files,
          timestamp: Date.now()
        });
      }
    }
  });

  // 6b. Mafia Sabotage Code Injection (During Freeze Window)
  socket.on("mafia:tamper_code", ({ targetPlayerId, tamperedCode, targetFileName }, callback) => {
    if (!currentRoomCode || !currentPlayerId || !targetPlayerId) return;
    const result = roomManager.tamperPlayerCode(currentRoomCode, currentPlayerId, targetPlayerId, tamperedCode, targetFileName);
    if (result.error) {
      callback?.({ success: false, error: result.error });
      return;
    }

    const room = roomManager.getRoom(currentRoomCode);
    const targetPlayer = room?.players.get(targetPlayerId);

    // Sync tampered code directly to the target developer's editor
    if (targetPlayer?.socketId) {
      io.to(targetPlayer.socketId).emit("code:sync", {
        code: tamperedCode,
        fileName: targetFileName || result.fileName,
        updatedBy: "SYSTEM_SYNC",
        updatedByName: "Sync Engine"
      });
    }

    // Broadcast updated state
    broadcastRoomState(room);
    callback?.({ success: true });
  });

  // 6c. Live Typing Presence
  socket.on("code:typing", () => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.getRoom(currentRoomCode);
    if (!room) return;
    const sender = room.players.get(currentPlayerId);
    if (sender) {
      socket.to(currentRoomCode).emit("code:player_typing", {
        playerId: sender.id,
        playerName: sender.name
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

    // Broadcast newly unlocked Mystery Box clues if any test was solved
    if (res.newlyUnlockedClues && res.newlyUnlockedClues.length > 0) {
      io.to(currentRoomCode).emit("mystery:clue_unlocked", {
        newlyUnlocked: res.newlyUnlockedClues,
        unlockedCount: res.room.unlockedClueIndices.length
      });
    }

    broadcastRoomState(res.room);
  });

  // 8. Emergency Meeting
  socket.on("meeting:call", (callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const roomCode = currentRoomCode;
    const res = roomManager.callEmergencyMeeting(roomCode, currentPlayerId);
    if (res.error) {
      return callback?.({ success: false, error: res.error });
    }

    broadcastRoomState(res.room);
    callback?.({ success: true });

    // Clear previous meeting timer
    if (res.room._meetingTimer) clearTimeout(res.room._meetingTimer);

    const durationSec = Number(res.room.settings?.votingDurationSeconds) || 45;

    // Auto-resolve voting when timer expires
    res.room._meetingTimer = setTimeout(() => {
      const r = roomManager.getRoom(roomCode);
      if (r && r.status === GAME_STATES.VOTING) {
        const resolveRes = roomManager.resolveVoting(roomCode);
        if (resolveRes) {
          io.to(roomCode).emit("meeting:ejection", {
            ejectedPlayer: resolveRes.ejectedPlayer,
            votesSummary: resolveRes.votesSummary,
            winner: resolveRes.room.winner,
            winReason: resolveRes.room.winReason
          });
          broadcastRoomState(resolveRes.room);
        }
      }
    }, durationSec * 1000);
  });

  // 9. Cast Vote
  socket.on("vote:cast", ({ targetId }, callback) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const roomCode = currentRoomCode;
    const res = roomManager.castVote(roomCode, currentPlayerId, targetId);
    if (!res) return callback?.({ success: false });

    callback?.({ success: true });
    broadcastRoomState(res.room);

    // If all alive players have voted, resolve immediately and cancel timeout
    if (res.allVoted) {
      if (res.room._meetingTimer) {
        clearTimeout(res.room._meetingTimer);
        res.room._meetingTimer = null;
      }
      const resolveRes = roomManager.resolveVoting(roomCode);
      if (resolveRes) {
        io.to(roomCode).emit("meeting:ejection", {
          ejectedPlayer: resolveRes.ejectedPlayer,
          votesSummary: resolveRes.votesSummary,
          winner: resolveRes.room.winner,
          winReason: resolveRes.room.winReason
        });
        broadcastRoomState(resolveRes.room);
      }
    }
  });

  // 10. In-Game & Meeting Chat Message
  socket.on("chat:send", (payload) => {
    const rawMsg = typeof payload === "string" ? payload : payload?.message;
    const rCode = payload?.roomCode || currentRoomCode;
    const pId = payload?.senderId || currentPlayerId;
    if (!rCode || !pId || !rawMsg?.trim()) return;

    if (!socket.rooms.has(rCode)) socket.join(rCode);
    currentRoomCode = rCode;
    currentPlayerId = pId;

    const room = roomManager.getRoom(rCode);
    if (!room) return;

    const sender = room.players.get(pId);
    const chatMsg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      senderId: pId,
      senderName: sender?.name || payload?.senderName || "Player",
      senderAvatar: sender?.avatar || payload?.senderAvatar || "👨‍💻",
      isAlive: sender?.isAlive ?? true,
      message: rawMsg.trim(),
      timestamp: Date.now()
    };

    if (!room.chatMessages) room.chatMessages = [];
    room.chatMessages.push(chatMsg);
    if (room.chatMessages.length > 100) room.chatMessages.shift();

    io.to(rCode).emit("chat:message", chatMsg);
  });

  // 11. Real-time Low-Latency Voice Chat Signaling & Audio Relay
  socket.on("voice:join_room", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const pId = payload?.playerId || currentPlayerId;
    if (!rCode) return;
    if (!socket.rooms.has(rCode)) socket.join(rCode);
    currentRoomCode = rCode;
    if (pId) currentPlayerId = pId;

    socket.to(rCode).emit("voice:user_joined", { playerId: pId });
  });

  socket.on("voice:state_change", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const pId = payload?.playerId || currentPlayerId;
    if (!rCode) return;
    socket.to(rCode).emit("voice:peer_state", {
      playerId: pId,
      isMuted: payload?.isMuted,
      isSpeaking: payload?.isSpeaking
    });
  });

  // WebRTC P2P Mesh Signaling
  socket.on("voice:webrtc_offer", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const sId = payload?.senderId || currentPlayerId;
    const targetId = payload?.targetId;
    const offer = payload?.offer;
    if (!rCode) return;

    const room = roomManager.getRoom(rCode);
    const target = room?.players.get(targetId);
    if (target?.socketId) {
      io.to(target.socketId).emit("voice:webrtc_offer", {
        senderId: sId,
        offer
      });
    }
  });

  socket.on("voice:webrtc_answer", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const sId = payload?.senderId || currentPlayerId;
    const targetId = payload?.targetId;
    const answer = payload?.answer;
    if (!rCode) return;

    const room = roomManager.getRoom(rCode);
    const target = room?.players.get(targetId);
    if (target?.socketId) {
      io.to(target.socketId).emit("voice:webrtc_answer", {
        senderId: sId,
        answer
      });
    }
  });

  socket.on("voice:webrtc_ice", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const sId = payload?.senderId || currentPlayerId;
    const targetId = payload?.targetId;
    const candidate = payload?.candidate;
    if (!rCode) return;

    const room = roomManager.getRoom(rCode);
    const target = room?.players.get(targetId);
    if (target?.socketId) {
      io.to(target.socketId).emit("voice:webrtc_ice", {
        senderId: sId,
        candidate
      });
    }
  });

  // Low-latency binary PCM audio buffer broadcast fallback
  socket.on("voice:audio_chunk", (payload) => {
    const rCode = payload?.roomCode || currentRoomCode;
    const sId = payload?.senderId || currentPlayerId;
    const audioData = payload?.audioData || payload;
    if (!rCode) return;

    socket.to(rCode).emit("voice:audio_chunk", {
      senderId: sId,
      audioData
    });
  });

  // Auto-close check: if only 1 player remains after others leave, auto-close in 5s
  function handleRoomAutoCloseCheck(room) {
    if (!room) return;
    if (room.players.size === 1) {
      if (room._autoCloseTimeout) clearTimeout(room._autoCloseTimeout);

      io.to(room.code).emit("room:auto_closing", {
        countdownSeconds: 5,
        reason: "All other players have left. Room will auto-close in 5 seconds."
      });

      room._autoCloseTimeout = setTimeout(() => {
        const r = roomManager.getRoom(room.code);
        if (r && r.players.size <= 1) {
          io.to(r.code).emit("room:force_exit", {
            reason: "Room closed: All other players left the mission."
          });
          if (r.timer) clearInterval(r.timer);
          roomManager.rooms.delete(r.code);
        }
      }, 5000);
    } else if (room.players.size > 1 && room._autoCloseTimeout) {
      clearTimeout(room._autoCloseTimeout);
      room._autoCloseTimeout = null;
      io.to(room.code).emit("room:auto_close_cancelled");
    }
  }

  // 12. Explicit Leave Room
  socket.on("room:leave", () => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = roomManager.leaveRoom(currentRoomCode, currentPlayerId);
    socket.leave(currentRoomCode);
    if (room) {
      broadcastRoomState(room);
      handleRoomAutoCloseCheck(room);
    }
    currentRoomCode = null;
    currentPlayerId = null;
  });

  // 13. Disconnect
  socket.on("disconnect", () => {
    if (currentRoomCode && currentPlayerId) {
      const room = roomManager.leaveRoom(currentRoomCode, currentPlayerId);
      if (room) {
        broadcastRoomState(room);
        handleRoomAutoCloseCheck(room);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Code Mafia Backend running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/health`);
  console.log(`📡 Anti-Sleep Ping URL: http://localhost:${PORT}/ping`);

  // Optional Self-Ping ticker (prevents Render free tier from sleeping)
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL;
  if (externalUrl) {
    console.log(`🤖 Anti-Sleep Self-Pinger activated for: ${externalUrl}`);
    setInterval(async () => {
      try {
        await fetch(`${externalUrl}/ping`);
        console.log(`[Anti-Sleep] Self-ping successful at ${new Date().toLocaleTimeString()}`);
      } catch (err) {
        console.warn(`[Anti-Sleep] Self-ping error:`, err.message);
      }
    }, 10 * 60 * 1000); // every 10 minutes
  }
});
