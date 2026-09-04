import { v4 as uuidv4 } from "uuid";
import { assignRoles } from "./RoleAssigner.js";
import { CHALLENGES, getChallengeById } from "./challenges.js";
import { runChallengeTests } from "./TestEngine.js";
import { generateFallbackRiddles } from "../services/aiRiddleService.js";

export const GAME_STATES = {
  LOBBY: "LOBBY",
  ROLE_REVEAL: "ROLE_REVEAL",
  PLAYING: "PLAYING",
  VOTING: "VOTING",
  GAME_OVER: "GAME_OVER"
};

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
  }

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(hostPlayer, settings = {}) {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const defaultChallenge = getChallengeById(settings.challengeId) || CHALLENGES[0];
    const initialFiles = defaultChallenge.files
      ? { ...defaultChallenge.files }
      : { [defaultChallenge.activeFileName || "main.js"]: defaultChallenge.starterCode };

    const room = {
      code: roomCode,
      createdAt: Date.now(),
      status: GAME_STATES.LOBBY,
      hostId: hostPlayer.id,
      settings: {
        durationMinutes: settings.durationMinutes || 10,
        mafiaCount: settings.mafiaCount || 1,
        challengeId: defaultChallenge.id,
        votingDurationSeconds: settings.votingDurationSeconds || 45
      },
      challenge: defaultChallenge,
      currentCode: defaultChallenge.starterCode,
      files: initialFiles,
      players: new Map(), // playerId -> player
      activityLog: [
        {
          id: uuidv4(),
          type: "ROOM_CREATED",
          text: `Room ${roomCode} created by ${hostPlayer.name}`,
          timestamp: Date.now()
        }
      ],
      chatMessages: [],
      _lastEditTimes: new Map(),
      testResults: null,
      meeting: null, // active emergency meeting info
      winner: null,
      winReason: null,
      timer: null,
      timeRemainingSeconds: 600,
      phase: "CODING", // "CODING" (30s) | "FREEZE" (15s)
      phaseTimeRemaining: 30,
      snapshotBeforeCode: defaultChallenge.starterCode,
      mysteryRiddles: [],
      unlockedClueIndices: []
    };

    // Add host player
    const host = {
      id: hostPlayer.id,
      socketId: hostPlayer.socketId,
      name: hostPlayer.name,
      avatar: hostPlayer.avatar || "👨‍💻",
      isHost: true,
      isReady: true,
      isAlive: true,
      role: null,
      roleDetails: null
    };

    room.players.set(host.id, host);
    this.rooms.set(roomCode, room);

    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode?.toUpperCase());
  }

  joinRoom(roomCode, player) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: "Room not found" };
    if (room.status !== GAME_STATES.LOBBY) return { error: "Game already in progress" };
    if (room.players.size >= 8) return { error: "Room is full (maximum 8 players allowed)" };

    const newPlayer = {
      id: player.id || uuidv4(),
      socketId: player.socketId,
      name: player.name,
      avatar: player.avatar || "👩‍💻",
      isHost: false,
      isReady: false,
      isAlive: true,
      role: null,
      roleDetails: null
    };

    room.players.set(newPlayer.id, newPlayer);
    room.activityLog.push({
      id: uuidv4(),
      type: "PLAYER_JOINED",
      text: `${newPlayer.name} joined the lobby`,
      timestamp: Date.now()
    });

    return { room, player: newPlayer };
  }

  leaveRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const player = room.players.get(playerId);
    if (!player) return null;

    room.players.delete(playerId);
    room.activityLog.push({
      id: uuidv4(),
      type: "PLAYER_LEFT",
      text: `${player.name} left the room`,
      timestamp: Date.now()
    });

    // If host leaves, reassign host or delete room if empty
    if (room.players.size === 0) {
      if (room.timer) clearInterval(room.timer);
      this.rooms.delete(roomCode);
      return null;
    }

    if (player.isHost) {
      const nextHost = room.players.values().next().value;
      nextHost.isHost = true;
      room.hostId = nextHost.id;
    }

    return room;
  }

  startGame(roomCode, hostId) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only the host can start the game" };
    if (room.players.size < 2) {
      return { error: "At least 2 players are required to start the mission (Min: 2, Max: 8)" };
    }

    // Select challenge
    const challenge = getChallengeById(room.settings.challengeId);
    room.challenge = challenge;
    room.currentCode = challenge.starterCode;

    // Assign secret roles
    const playerList = Array.from(room.players.values());
    const assigned = assignRoles(playerList, room.settings.mafiaCount);
    
    assigned.forEach(p => {
      room.players.set(p.id, p);
    });

    // Initialize individual workspaces per player
    room.playerWorkspaces = new Map();
    assigned.forEach(p => {
      room.playerWorkspaces.set(p.id, {
        playerId: p.id,
        playerName: p.name,
        playerAvatar: p.avatar,
        role: p.role,
        isAlive: p.isAlive,
        code: challenge.starterCode,
        testResults: null,
        lastUpdated: Date.now()
      });
    });

    room.status = GAME_STATES.ROLE_REVEAL;
    room.timeRemainingSeconds = room.settings.durationMinutes * 60;
    room.phase = "CODING";
    room.phaseTimeRemaining = 30;
    room.snapshotBeforeCode = challenge.starterCode;
    room.unlockedClueIndices = [];

    // Pre-generate baseline riddles for the secret Mafia player
    const mafiaPlayer = assigned.find(p => p.role === "MAFIA");
    if (mafiaPlayer) {
      room.mysteryRiddles = generateFallbackRiddles(
        mafiaPlayer.name,
        mafiaPlayer.avatar,
        challenge.testSuite.length
      );
    } else {
      room.mysteryRiddles = [];
    }
    
    room.activityLog.push({
      id: uuidv4(),
      type: "GAME_STARTED",
      text: `Game commenced with ${playerList.length} players. Challenge: "${challenge.title}"`,
      timestamp: Date.now()
    });

    return { room };
  }

  updateCode(roomCode, playerId, newCode, activeFileName, filesMap) {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    const player = room.players.get(playerId);

    // Rule: During 30s CODING phase, Mafia is locked out from editing (Surveillance only)
    if (player?.role === "MAFIA" && room.phase === "CODING") {
      return { error: "Mafia cannot edit code during the 30-second Developer Coding phase. Surveillance mode active." };
    }

    // Update individual workspace
    if (!room.playerWorkspaces) room.playerWorkspaces = new Map();
    const ws = room.playerWorkspaces.get(playerId) || {
      playerId,
      playerName: player?.name || "Player",
      playerAvatar: player?.avatar || "👨‍💻",
      role: player?.role || "DEVELOPER",
      isAlive: player?.isAlive ?? true,
      code: newCode,
      activeFileName: activeFileName || room.challenge?.activeFileName || "main.js",
      files: filesMap || (room.challenge?.files ? { ...room.challenge.files } : { "main.js": newCode }),
      testResults: null
    };

    ws.code = newCode;
    if (activeFileName) ws.activeFileName = activeFileName;
    if (filesMap && typeof filesMap === "object" && Object.keys(filesMap).length > 0) {
      ws.files = { ...filesMap };
    } else if (ws.files) {
      ws.files[ws.activeFileName || "main.js"] = newCode;
    }
    ws.lastUpdated = Date.now();
    room.playerWorkspaces.set(playerId, ws);
    room.currentCode = newCode;
    if (ws.files) {
      room.files = { ...ws.files };
    }

    // Throttle activity log entry for code editing (at most once every 3.5s per player)
    const now = Date.now();
    const lastEdit = room._lastEditTimes?.get(playerId) || 0;
    if (now - lastEdit > 3500) {
      if (!room._lastEditTimes) room._lastEditTimes = new Map();
      room._lastEditTimes.set(playerId, now);
      room.activityLog.push({
        id: uuidv4(),
        type: "CODE_EDIT",
        playerId: player ? player.id : null,
        playerName: player ? player.name : "Anonymous",
        text: `${player ? player.name : "A player"} modified [${ws.activeFileName || "workspace"}]`,
        timestamp: now
      });
    }

    return room;
  }

  tamperPlayerCode(roomCode, mafiaId, targetPlayerId, tamperedCode, targetFileName) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: "Room not found" };
    const mafia = room.players.get(mafiaId);
    if (mafia?.role !== "MAFIA") return { error: "Only Mafia can tamper with code" };

    if (!room.playerWorkspaces) room.playerWorkspaces = new Map();
    const targetWs = room.playerWorkspaces.get(targetPlayerId);
    if (!targetWs) return { error: "Target workspace not found" };

    targetWs.code = tamperedCode;
    const fn = targetFileName || targetWs.activeFileName || "main.js";
    if (targetWs.files) {
      targetWs.files[fn] = tamperedCode;
    }
    targetWs.lastUpdated = Date.now();
    room.playerWorkspaces.set(targetPlayerId, targetWs);

    room.activityLog.push({
      id: uuidv4(),
      type: "CODE_SABOTAGE",
      text: `⚠️ Silent codebase anomaly detected in ${targetWs.playerName}'s workspace!`,
      timestamp: Date.now()
    });

    return { success: true, targetPlayerId, code: tamperedCode, fileName: fn };
  }

  runTests(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    const player = room.players.get(playerId);

    const ws = room.playerWorkspaces?.get(playerId);
    const playerFilesOrCode = ws?.files || room.files || room.challenge?.files || ws?.code || room.currentCode;
    const testResults = runChallengeTests(playerFilesOrCode, room.challenge?.testSuite || []);
    room.testResults = testResults;
    if (room.playerWorkspaces?.has(playerId)) {
      room.playerWorkspaces.get(playerId).testResults = testResults;
    }

    // Track newly unlocked Mystery Box clues for passed test cases
    const newlyUnlockedClues = [];
    if (testResults && testResults.tests) {
      if (!room.unlockedClueIndices) room.unlockedClueIndices = [];
      testResults.tests.forEach((t, idx) => {
        if (t.passed && !room.unlockedClueIndices.includes(idx)) {
          room.unlockedClueIndices.push(idx);
          const clue = room.mysteryRiddles?.[idx];
          if (clue) {
            newlyUnlockedClues.push(clue);
            room.activityLog.push({
              id: uuidv4(),
              type: "MYSTERY_UNLOCKED",
              text: `🎁 MYSTERY BOX UNLOCKED! Test #${idx + 1} passed: A clue about the Mafia's identity was discovered!`,
              timestamp: Date.now()
            });
          }
        }
      });
    }

    room.activityLog.push({
      id: uuidv4(),
      type: "TESTS_RUN",
      playerName: player ? player.name : "Player",
      passed: testResults.allPassed,
      text: `${player ? player.name : "Player"} executed test suite (${testResults.passedCount}/${testResults.totalCount} passing)`,
      timestamp: Date.now()
    });

    // Check Developer Victory (all tests pass)
    if (testResults.allPassed) {
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "DEVELOPERS";
      room.winReason = "Developers successfully stabilized the application and passed 100% of the unit tests!";
      if (room.timer) clearInterval(room.timer);
    }

    return { room, testResults, newlyUnlockedClues };
  }

  callEmergencyMeeting(roomCode, callerId) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: "Room not found" };
    if (room.status !== GAME_STATES.PLAYING) return { error: "Cannot call meeting right now" };

    const caller = room.players.get(callerId);
    if (!caller || !caller.isAlive) return { error: "Only alive players can call meetings" };

    // Reset votes
    for (const p of room.players.values()) {
      p.hasVoted = false;
      p.voteTarget = null;
    }

    room.status = GAME_STATES.VOTING;
    room.meeting = {
      callerId,
      callerName: caller.name,
      startedAt: Date.now(),
      timeLeftSeconds: room.settings.votingDurationSeconds || 45
    };

    room.activityLog.push({
      id: uuidv4(),
      type: "MEETING_CALLED",
      playerName: caller.name,
      text: `🚨 EMERGENCY DEBUG MEETING called by ${caller.name}!`,
      timestamp: Date.now()
    });

    return { room, meeting: room.meeting };
  }

  castVote(roomCode, voterId, targetPlayerId) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== GAME_STATES.VOTING) return { error: "No active voting session" };

    const voter = room.players.get(voterId);
    if (!voter || !voter.isAlive) return { error: "Dead players cannot vote" };
    if (voter.hasVoted) return { error: "Already cast your vote" };

    voter.hasVoted = true;
    voter.voteTarget = targetPlayerId; // null = skip vote

    const target = targetPlayerId ? room.players.get(targetPlayerId) : null;
    const targetName = target ? target.name : "SKIP";

    room.activityLog.push({
      id: uuidv4(),
      type: "VOTE_CAST",
      playerName: voter.name,
      text: `${voter.name} submitted their vote [Target: ${targetName}]`,
      timestamp: Date.now()
    });

    // Check if all alive players have voted
    const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
    const allVoted = alivePlayers.every(p => p.hasVoted);

    return { room, allVoted };
  }

  resolveVoting(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    // Tally votes
    const votes = new Map(); // targetId (or "SKIP") -> count
    for (const p of room.players.values()) {
      if (p.isAlive && p.voteTarget !== undefined) {
        const target = p.voteTarget || "SKIP";
        votes.set(target, (votes.get(target) || 0) + 1);
      }
    }

    let maxVotes = 0;
    let ejectedTargetId = null;
    let isTie = false;

    for (const [target, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        ejectedTargetId = target;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    }

    let ejectedPlayer = null;
    if (!isTie && ejectedTargetId && ejectedTargetId !== "SKIP") {
      ejectedPlayer = room.players.get(ejectedTargetId);
      if (ejectedPlayer) {
        ejectedPlayer.isAlive = false;
      }
    }

    room.activityLog.push({
      id: uuidv4(),
      type: "MEETING_RESOLVED",
      text: ejectedPlayer
        ? `⚖️ Voting concluded: ${ejectedPlayer.name} was ejected! (Role: ${ejectedPlayer.role})`
        : "⚖️ Voting concluded: No player was ejected (Tie or Skip majority)",
      timestamp: Date.now()
    });

    // Reset hasVoted and voteTarget flags for all players
    for (const p of room.players.values()) {
      p.hasVoted = false;
      p.voteTarget = null;
    }

    // Always clear active meeting object
    room.meeting = null;

    // Check Win/Loss conditions after ejection
    const remainingAlive = Array.from(room.players.values()).filter(p => p.isAlive);
    const aliveMafia = remainingAlive.filter(p => p.role === "MAFIA");
    const aliveDevs = remainingAlive.filter(p => p.role === "DEVELOPER");

    if (aliveMafia.length === 0) {
      // Developers win: All Mafia eliminated
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "DEVELOPERS";
      room.winReason = "All Code Mafia saboteurs were identified and ejected from the team!";
    } else if (aliveMafia.length >= aliveDevs.length) {
      // Mafia wins: Mafia parity or majority
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "MAFIA";
      room.winReason = "Code Mafia gained parity over the development team!";
    } else {
      // Resume playing
      room.status = GAME_STATES.PLAYING;
    }

    return {
      room,
      ejectedPlayer: ejectedPlayer ? {
        id: ejectedPlayer.id,
        name: ejectedPlayer.name,
        role: ejectedPlayer.role
      } : null,
      votesSummary: Object.fromEntries(votes)
    };
  }

  // Sanitize room data for a specific player (hides other players' secret roles unless game over)
  sanitizeRoomForPlayer(room, playerId) {
    if (!room) return null;
    const isGameOver = room.status === GAME_STATES.GAME_OVER;
    const selfPlayer = room.players.get(playerId);

    const playersObj = {};
    for (const [id, player] of room.players.entries()) {
      const isSelf = id === playerId;
      playersObj[id] = {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        isHost: player.isHost,
        isReady: player.isReady,
        isAlive: player.isAlive,
        hasVoted: player.hasVoted,
        // Only reveal secret role if it's the player themselves or if the game is over
        role: (isSelf || isGameOver) ? player.role : null,
        roleDetails: (isSelf || isGameOver) ? player.roleDetails : null
      };
    }

    // Prepare Mafia surveillance feed
    const surveillanceFeed = (selfPlayer?.role === "MAFIA" || isGameOver)
      ? Array.from(room.playerWorkspaces?.values() || [])
          .filter(ws => ws.playerId !== playerId)
          .map(ws => ({
            playerId: ws.playerId,
            playerName: ws.playerName,
            playerAvatar: ws.playerAvatar,
      type: "TESTS_RUN",
      playerName: player ? player.name : "Player",
      passed: testResults.allPassed,
      text: `${player ? player.name : "Player"} executed test suite (${testResults.passedCount}/${testResults.totalCount} passing)`,
      timestamp: Date.now()
    });

    // Check Developer Victory (all tests pass)
    if (testResults.allPassed) {
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "DEVELOPERS";
      room.winReason = "Developers successfully stabilized the application and passed 100% of the unit tests!";
      if (room.timer) clearInterval(room.timer);
    }

    return { room, testResults, newlyUnlockedClues };
  }

  callEmergencyMeeting(roomCode, callerId) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: "Room not found" };
    if (room.status !== GAME_STATES.PLAYING) return { error: "Cannot call meeting right now" };

    const caller = room.players.get(callerId);
    if (!caller || !caller.isAlive) return { error: "Only alive players can call meetings" };

    // Reset votes
    for (const p of room.players.values()) {
      p.hasVoted = false;
      p.voteTarget = null;
    }

    room.status = GAME_STATES.VOTING;
    room.meeting = {
      callerId,
      callerName: caller.name,
      startedAt: Date.now(),
      timeLeftSeconds: room.settings.votingDurationSeconds || 45
    };

    room.activityLog.push({
      id: uuidv4(),
      type: "MEETING_CALLED",
      playerName: caller.name,
      text: `🚨 EMERGENCY DEBUG MEETING called by ${caller.name}!`,
      timestamp: Date.now()
    });

    return { room, meeting: room.meeting };
  }

  castVote(roomCode, voterId, targetPlayerId) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== GAME_STATES.VOTING) return { error: "No active voting session" };

    const voter = room.players.get(voterId);
    if (!voter || !voter.isAlive) return { error: "Dead players cannot vote" };
    if (voter.hasVoted) return { error: "Already cast your vote" };

    voter.hasVoted = true;
    voter.voteTarget = targetPlayerId; // null = skip vote

    const target = targetPlayerId ? room.players.get(targetPlayerId) : null;
    const targetName = target ? target.name : "SKIP";

    room.activityLog.push({
      id: uuidv4(),
      type: "VOTE_CAST",
      playerName: voter.name,
      text: `${voter.name} submitted their vote [Target: ${targetName}]`,
      timestamp: Date.now()
    });

    // Check if all alive players have voted
    const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
    const allVoted = alivePlayers.every(p => p.hasVoted);

    return { room, allVoted };
  }

  resolveVoting(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    // Tally votes
    const votes = new Map(); // targetId (or "SKIP") -> count
    for (const p of room.players.values()) {
      if (p.isAlive && p.voteTarget !== undefined) {
        const target = p.voteTarget || "SKIP";
        votes.set(target, (votes.get(target) || 0) + 1);
      }
    }

    let maxVotes = 0;
    let ejectedTargetId = null;
    let isTie = false;

    for (const [target, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        ejectedTargetId = target;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    }

    let ejectedPlayer = null;
    if (!isTie && ejectedTargetId && ejectedTargetId !== "SKIP") {
      ejectedPlayer = room.players.get(ejectedTargetId);
      if (ejectedPlayer) {
        ejectedPlayer.isAlive = false;
      }
    }

    room.activityLog.push({
      id: uuidv4(),
      type: "MEETING_RESOLVED",
      text: ejectedPlayer
        ? `⚖️ Voting concluded: ${ejectedPlayer.name} was ejected! (Role: ${ejectedPlayer.role})`
        : "⚖️ Voting concluded: No player was ejected (Tie or Skip majority)",
      timestamp: Date.now()
    });

    // Reset hasVoted and voteTarget flags for all players
    for (const p of room.players.values()) {
      p.hasVoted = false;
      p.voteTarget = null;
    }

    // Always clear active meeting object
    room.meeting = null;

    // Check Win/Loss conditions after ejection
    const remainingAlive = Array.from(room.players.values()).filter(p => p.isAlive);
    const aliveMafia = remainingAlive.filter(p => p.role === "MAFIA");
    const aliveDevs = remainingAlive.filter(p => p.role === "DEVELOPER");

    if (aliveMafia.length === 0) {
      // Developers win: All Mafia eliminated
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "DEVELOPERS";
      room.winReason = "All Code Mafia saboteurs were identified and ejected from the team!";
    } else if (aliveMafia.length >= aliveDevs.length) {
      // Mafia wins: Mafia parity or majority
      room.status = GAME_STATES.GAME_OVER;
      room.winner = "MAFIA";
      room.winReason = "Code Mafia gained parity over the development team!";
    } else {
      // Resume playing
      room.status = GAME_STATES.PLAYING;
    }

    return {
      room,
      ejectedPlayer: ejectedPlayer ? {
        id: ejectedPlayer.id,
        name: ejectedPlayer.name,
        role: ejectedPlayer.role
      } : null,
      votesSummary: Object.fromEntries(votes)
    };
  }

  // Sanitize room data for a specific player (hides other players' secret roles unless game over)
  sanitizeRoomForPlayer(room, playerId) {
    if (!room) return null;
    const isGameOver = room.status === GAME_STATES.GAME_OVER;
    const selfPlayer = room.players.get(playerId);

    const playersObj = {};
    for (const [id, player] of room.players.entries()) {
      const isSelf = id === playerId;
      playersObj[id] = {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        isHost: player.isHost,
        isReady: player.isReady,
        isAlive: player.isAlive,
        hasVoted: player.hasVoted,
        // Only reveal secret role if it's the player themselves or if the game is over
        role: (isSelf || isGameOver) ? player.role : null,
        roleDetails: (isSelf || isGameOver) ? player.roleDetails : null
      };
    }

    // Prepare Mafia surveillance feed
    const surveillanceFeed = (selfPlayer?.role === "MAFIA" || isGameOver)
      ? Array.from(room.playerWorkspaces?.values() || [])
          .filter(ws => ws.playerId !== playerId)
          .map(ws => ({
            playerId: ws.playerId,
            playerName: ws.playerName,
            playerAvatar: ws.playerAvatar,
            role: isGameOver ? ws.role : "DEVELOPER",
            code: ws.code,
            testResults: ws.testResults,
            isAlive: ws.isAlive,
            lastUpdated: ws.lastUpdated
          }))
      : [];

    const ws = room.playerWorkspaces?.get(playerId);
    const resolvedFiles = ws?.files || room.files || room.challenge?.files || {
      [room.challenge?.activeFileName || "main.js"]: ws?.code || room.currentCode || room.challenge?.starterCode || ""
    };

    return {
      code: room.code,
      status: room.status,
      hostId: room.hostId,
      settings: room.settings,
      challenge: {
        id: room.challenge?.id,
        title: room.challenge?.title,
        category: room.challenge?.category,
        difficulty: room.challenge?.difficulty,
        language: room.challenge?.language || "javascript",
        description: room.challenge?.description,
        bugsCount: room.challenge?.bugsCount,
        devGoal: room.challenge?.devGoal,
        mafiaGoal: room.challenge?.mafiaGoal,
        activeFileName: ws?.activeFileName || room.challenge?.activeFileName || Object.keys(resolvedFiles)[0] || "main.js",
        files: resolvedFiles,
        starterCode: room.challenge?.starterCode,
        testSuite: (room.challenge?.testSuite || []).map(t => ({ id: t.id, name: t.name }))
      },
      currentCode: ws?.code || room.currentCode,
      activeFileName: ws?.activeFileName || room.challenge?.activeFileName || Object.keys(resolvedFiles)[0] || "main.js",
      files: resolvedFiles,
      players: playersObj,
      activityLog: room.activityLog.slice(-50),
      chatMessages: (room.chatMessages || []).slice(-100),
      testResults: ws?.testResults || room.testResults,
      meeting: room.meeting,
      winner: room.winner,
      winReason: room.winReason,
      timeRemainingSeconds: room.timeRemainingSeconds,
      phase: room.phase || "CODING",
      phaseTimeRemaining: room.phaseTimeRemaining || 30,
      snapshotBeforeCode: (selfPlayer?.role === "MAFIA" || isGameOver) ? (room.snapshotBeforeCode || room.challenge?.starterCode) : null,
      surveillanceFeed,
      unlockedMysteryClues: (selfPlayer?.role === "DEVELOPER" || isGameOver)
        ? (room.mysteryRiddles || []).filter((_, idx) => (room.unlockedClueIndices || []).includes(idx))
        : [],
      totalMysteryCluesCount: room.mysteryRiddles?.length || (room.challenge?.testSuite?.length || 5),
      mafiaCluesUnlockedCount: (room.unlockedClueIndices || []).length
    };
  }
}
