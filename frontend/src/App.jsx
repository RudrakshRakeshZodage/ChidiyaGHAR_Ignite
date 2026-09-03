import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './services/socket';
import { CHALLENGES } from './data/challenges';
import { getStoredUser, logoutUser } from './services/auth';

// Components
import Navbar from './components/Navbar';
import Lobby from './components/Lobby';
import RoleModal from './components/RoleModal';
import CodeEditor from './components/CodeEditor';
import TestRunner from './components/TestRunner';
import ActivityFeed from './components/ActivityFeed';
import VotingModal from './components/VotingModal';
import GameOverModal from './components/GameOverModal';
import AuthModal from './components/AuthModal';
import { Bug, Sparkles, AlertCircle, FileCode } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize socket on mount
  useEffect(() => {
    const socket = socketService.connect();

    if (socket) {
      socket.on("room:updated", (updatedRoom) => {
        setRoom(updatedRoom);
        if (updatedRoom.currentCode !== undefined) {
          setCode(updatedRoom.currentCode);
        }
        if (updatedRoom.testResults) {
          setTestResults(updatedRoom.testResults);
        }
        if (updatedRoom.timeRemainingSeconds !== undefined) {
          setTimeRemainingSeconds(updatedRoom.timeRemainingSeconds);
        }
        if (updatedRoom.status === "ROLE_REVEAL") {
          setShowRoleModal(true);
        }
      });

      socket.on("code:sync", ({ code: newCode }) => {
        setCode(newCode);
      });

      socket.on("game:timer_sync", ({ timeRemainingSeconds: trs }) => {
        setTimeRemainingSeconds(trs);
      });

      socket.on("tests:completed", ({ testResults: tr }) => {
        setTestResults(tr);
        setIsRunningTests(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("room:updated");
        socket.off("code:sync");
        socket.off("game:timer_sync");
        socket.off("tests:completed");
      }
    };
  }, []);

  // Sync current player state from room
  useEffect(() => {
    if (room && player) {
      const updatedMe = room.players[player.id];
      if (updatedMe) {
        setPlayer(prev => ({ ...prev, ...updatedMe }));
      }
    }
  }, [room]);

  // Create Room
  const handleCreateRoom = ({ name, avatar, settings }) => {
    const newPlayer = {
      id: "p_" + Math.random().toString(36).substring(2, 9),
      name,
      avatar,
      isHost: true,
      isReady: true
    };
    setPlayer(newPlayer);
    setIsConnecting(true);

    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("room:create", { player: newPlayer, settings }, (res) => {
        setIsConnecting(false);
        if (res?.success) {
          setRoom(res.room);
          setCode(res.room.currentCode);
        } else {
          alert(res?.error || "Failed to create room");
        }
      });
    } else {
      // Offline fallback demo mode
      setIsConnecting(false);
      const challenge = CHALLENGES.find(c => c.id === settings.challengeId) || CHALLENGES[0];
      const mockRoom = {
        code: "DEV" + Math.floor(100 + Math.random() * 900),
        status: "LOBBY",
        hostId: newPlayer.id,
        settings,
        challenge,
        currentCode: challenge.starterCode,
        players: { [newPlayer.id]: newPlayer },
        activityLog: [{ id: "1", type: "ROOM_CREATED", text: `Room created by ${name}`, timestamp: Date.now() }],
        timeRemainingSeconds: settings.durationMinutes * 60
      };
      setRoom(mockRoom);
      setCode(challenge.starterCode);
    }
  };

  // Join Room
  const handleJoinRoom = ({ roomCode, name, avatar }) => {
    const newPlayer = {
      id: "p_" + Math.random().toString(36).substring(2, 9),
      name,
      avatar,
      isHost: false,
      isReady: false
    };
    setPlayer(newPlayer);
    setIsConnecting(true);

    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("room:join", { roomCode, player: newPlayer }, (res) => {
        setIsConnecting(false);
        if (res?.success) {
          setRoom(res.room);
          setCode(res.room.currentCode);
        } else {
          alert(res?.error || "Failed to join room");
        }
      });
    } else {
      setIsConnecting(false);
      alert("Backend server is not connected. You can create a new mission lobby to test the interactive simulation!");
    }
  };

  // Toggle Ready
  const handleToggleReady = () => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("room:ready_toggle");
    } else if (room && player) {
      // Offline simulation
      const isReady = !player.isReady;
      setPlayer(prev => ({ ...prev, isReady }));
      setRoom(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [player.id]: { ...prev.players[player.id], isReady }
        }
      }));
    }
  };

  // Start Game
  const handleStartGame = () => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("game:start", (res) => {
        if (!res?.success) alert(res?.error || "Failed to start game");
      });
    } else if (room && player) {
      // Offline simulation
      const assignedRole = Math.random() > 0.5 ? "DEVELOPER" : "MAFIA";
      const updatedPlayer = {
        ...player,
        role: assignedRole,
        roleDetails: {
          name: assignedRole === "MAFIA" ? "Code Mafia" : "Developer",
          objective: assignedRole === "MAFIA"
            ? "Prevent tests from passing by injecting stealth bugs or bluffing during emergency meetings."
            : "Debug the codebase and pass 100% of the unit tests."
        }
      };
      setPlayer(updatedPlayer);
      setRoom(prev => ({
        ...prev,
        status: "ROLE_REVEAL",
        players: { [player.id]: updatedPlayer }
      }));
      setShowRoleModal(true);
    }
  };

  // Acknowledge Role
  const handleAcknowledgeRole = () => {
    setShowRoleModal(false);
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("game:role_ack");
    } else if (room) {
      setRoom(prev => ({ ...prev, status: "PLAYING" }));
    }
  };

  // Code Change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("code:change", { code: newCode });
    }
  };

  // Run Tests
  const handleRunTests = () => {
    setIsRunningTests(true);
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("code:run_tests", (res) => {
        setIsRunningTests(false);
      });
    } else {
      // Client-side quick eval simulation for offline preview
      setTimeout(() => {
        setIsRunningTests(false);
        const results = {
          allPassed: false,
          passedCount: 3,
          totalCount: 5,
          passPercentage: 60,
          totalDurationMs: 12,
          tests: [
            { id: "1", name: "Standard cart with CA tax", passed: true, durationMs: 2 },
            { id: "2", name: "Promo code SAVE20 applied", passed: false, durationMs: 3, error: "Expected total 102, got 120" },
            { id: "3", name: "Shipping fee applied under $50", passed: true, durationMs: 1 },
            { id: "4", name: "Empty cart handles gracefully", passed: true, durationMs: 1 },
            { id: "5", name: "FLAT15 promo limits discount", passed: false, durationMs: 2, error: "Discount cannot exceed subtotal" }
          ]
        };
        setTestResults(results);
      }, 600);
    }
  };

  // Call Emergency Meeting
  const handleCallMeeting = () => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("meeting:call", (res) => {
        if (!res?.success) alert(res?.error || "Cannot call meeting");
      });
    } else if (room) {
      setRoom(prev => ({
        ...prev,
        status: "VOTING",
        meeting: { callerName: player.name, durationSeconds: 45 }
      }));
    }
  };

  // Cast Vote
  const handleCastVote = (targetId) => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("vote:cast", { targetId });
    } else if (room && player) {
      setPlayer(prev => ({ ...prev, hasVoted: true }));
      setTimeout(() => {
        setRoom(prev => ({
          ...prev,
          status: "GAME_OVER",
          winner: "DEVELOPERS",
          winReason: "The Code Mafia saboteur was successfully identified and ejected!"
        }));
      }, 1500);
    }
  };

  // Reset to Starter
  const handleResetCode = () => {
    if (room?.challenge?.starterCode) {
      handleCodeChange(room.challenge.starterCode);
    }
  };

  // Play Again
  const handlePlayAgain = () => {
    setRoom(null);
    setTestResults(null);
  };

  const isInGame = room && (room.status === "PLAYING" || room.status === "VOTING" || room.status === "GAME_OVER");

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] bg-grid-pattern text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        room={room}
        player={player}
        timeRemainingSeconds={timeRemainingSeconds}
        onCallMeeting={handleCallMeeting}
        canCallMeeting={room?.status === "PLAYING"}
        authUser={authUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => { logoutUser(); setAuthUser(null); }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* View 1: Lobby */}
        {(!room || room.status === "LOBBY") && (
          <Lobby
            room={room}
            player={player}
            authUser={authUser}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
            onToggleReady={handleToggleReady}
            isConnecting={isConnecting}
          />
        )}

        {/* View 2: In-Game Coding Arena */}
        {isInGame && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Challenge Info Banner */}
            <div className="glass-card rounded-xl p-3 sm:p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400 mt-0.5">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-white text-sm sm:text-base">
                      {room.challenge?.title}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-semibold font-mono">
                      {room.challenge?.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {room.challenge?.description}
                  </p>
                </div>
              </div>

              {/* Secret Objective Reminder */}
              {player?.role && (
                <div className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-2 shrink-0 ${
                  player.role === "MAFIA"
                    ? "bg-rose-950/60 border-rose-700 text-rose-300"
                    : "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                }`}>
                  <Bug className="h-3.5 w-3.5" />
                  <span>
                    {player.role === "MAFIA" ? "Sabotage code quietly" : "Fix bugs & pass all tests"}
                  </span>
                </div>
              )}
            </div>

            {/* Split Arena Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[550px]">
              {/* Left: Code Editor (7 cols) */}
              <div className="lg:col-span-7 h-full min-h-[400px]">
                <CodeEditor
                  code={code}
                  onChange={handleCodeChange}
                  onReset={handleResetCode}
                  readOnly={!player?.isAlive}
                />
              </div>

              {/* Right: Test Runner & Audit Feed (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
                <div className="flex-1 min-h-[250px]">
                  <TestRunner
                    testResults={testResults}
                    onRunTests={handleRunTests}
                    isRunningTests={isRunningTests}
                    challenge={room.challenge}
                  />
                </div>
                <div className="h-56">
                  <ActivityFeed activityLog={room.activityLog || []} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Secret Role Reveal Modal */}
      {showRoleModal && (
        <RoleModal
          player={player}
          onAcknowledge={handleAcknowledgeRole}
        />
      )}

      {/* Emergency Meeting / Voting Modal */}
      {room?.status === "VOTING" && (
        <VotingModal
          room={room}
          player={player}
          onCastVote={handleCastVote}
        />
      )}

      {/* Game Over Resolution Modal */}
      {room?.status === "GAME_OVER" && (
        <GameOverModal
          room={room}
          player={player}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(u) => setAuthUser(u)}
      />
    </div>
  );
}
