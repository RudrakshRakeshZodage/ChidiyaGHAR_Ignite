import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from './services/socket';
import { voiceService } from './services/voiceService';
import { CHALLENGES } from './data/challenges';
import { getStoredUser, logoutUser } from './services/auth';

// Components
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Lobby from './components/Lobby';
import RoleModal from './components/RoleModal';
import CodeEditor from './components/CodeEditor';
import TestRunner from './components/TestRunner';
import ActivityFeed from './components/ActivityFeed';
import EvidenceBoard from './components/EvidenceBoard';
import MysteryCluesDossier from './components/MysteryCluesDossier';
import MysteryBoxModal from './components/MysteryBoxModal';
import LeaderboardModal from './components/LeaderboardModal';
import UserProfileModal from './components/UserProfileModal';
import MafiaSurveillanceDashboard from './components/MafiaSurveillanceDashboard';
import SuspectsRosterBoard from './components/SuspectsRosterBoard';
import ChatBox from './components/ChatBox';
import VotingModal from './components/VotingModal';
import GameOverModal from './components/GameOverModal';
import AuthModal from './components/AuthModal';
import { Bug, Sparkles, AlertCircle, FileCode, ShieldCheck, Activity, Search, MessageSquare, Gift, Trophy } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'lobby'
  const [authUser, setAuthUser] = useState(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSurveillanceModal, setShowSurveillanceModal] = useState(false);
  const [surveillanceFeed, setSurveillanceFeed] = useState([]);
  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600);
  const [phase, setPhase] = useState("CODING");
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(30);
  const [snapshotBeforeCode, setSnapshotBeforeCode] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(null);
  const [ejectionToast, setEjectionToast] = useState(null);

  // Real-time Voice Chat State
  const [isVoiceMuted, setIsVoiceMuted] = useState(true);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState([]);
  const speakerTimersRef = useRef(new Map());

  // Mystery Box & Riddle State
  const [unlockedMysteryClues, setUnlockedMysteryClues] = useState([]);
  const [totalMysteryCluesCount, setTotalMysteryCluesCount] = useState(5);
  const [mafiaCluesUnlockedCount, setMafiaCluesUnlockedCount] = useState(0);
  const [activeMysteryModalClue, setActiveMysteryModalClue] = useState(null);

  // Arena Right Panel Tab: 'tests' | 'mystery' | 'activity' | 'evidence' | 'chat'
  const [activeTab, setActiveTab] = useState('tests');
  const [messages, setMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeTypers, setActiveTypers] = useState([]);
  const typerTimeoutRef = useRef(null);
  const lastTypingEmitRef = useRef(0);

  // Keep refs for current player and room to avoid re-subscribing socket listeners
  const playerRef = useRef(player);
  playerRef.current = player;
  const roomRef = useRef(room);
  roomRef.current = room;

  // Voice Service Event Listeners (Registered once on mount)
  useEffect(() => {
    const handleMuteChange = (muted) => {
      setIsVoiceMuted(muted);
    };

    const handleSpeakingChange = (speaking) => {
      setIsVoiceSpeaking(speaking);
    };

    voiceService.on("mute:change", handleMuteChange);
    voiceService.on("speaking:change", handleSpeakingChange);

    return () => {
      voiceService.off("mute:change", handleMuteChange);
      voiceService.off("speaking:change", handleSpeakingChange);
    };
  }, []);

  // Initialize socket on mount
  useEffect(() => {
    const socket = socketService.connect();

    if (socket) {
      socket.on("room:updated", (updatedRoom) => {
        setRoom(updatedRoom);
        if (updatedRoom.currentCode !== undefined) {
          setCode(updatedRoom.currentCode);
        }
        if (updatedRoom.snapshotBeforeCode !== undefined) {
          setSnapshotBeforeCode(updatedRoom.snapshotBeforeCode);
        }
        if (updatedRoom.phase !== undefined) {
          setPhase(updatedRoom.phase);
        }
        if (updatedRoom.phaseTimeRemaining !== undefined) {
          setPhaseTimeRemaining(updatedRoom.phaseTimeRemaining);
        }
        if (updatedRoom.testResults) {
          setTestResults(updatedRoom.testResults);
        }
        if (updatedRoom.timeRemainingSeconds !== undefined) {
          setTimeRemainingSeconds(updatedRoom.timeRemainingSeconds);
        }
        if (updatedRoom.chatMessages) {
          setMessages(updatedRoom.chatMessages);
        }
        if (updatedRoom.unlockedMysteryClues) {
          setUnlockedMysteryClues(updatedRoom.unlockedMysteryClues);
        }
        if (updatedRoom.totalMysteryCluesCount) {
          setTotalMysteryCluesCount(updatedRoom.totalMysteryCluesCount);
        }
        if (updatedRoom.mafiaCluesUnlockedCount !== undefined) {
          setMafiaCluesUnlockedCount(updatedRoom.mafiaCluesUnlockedCount);
        }
        if (updatedRoom.surveillanceFeed) {
          setSurveillanceFeed(updatedRoom.surveillanceFeed);
        }
        if (updatedRoom.status === "ROLE_REVEAL") {
          setShowRoleModal(true);
        }
      });

      socket.on("mafia:screen_update", ({ targetPlayerId, targetPlayerName, code: targetCode }) => {
        setSurveillanceFeed((prev) => {
          const exists = prev.some(ws => ws.playerId === targetPlayerId);
          if (exists) {
            return prev.map(ws => ws.playerId === targetPlayerId ? { ...ws, code: targetCode, lastUpdated: Date.now() } : ws);
          }
          return [...prev, { playerId: targetPlayerId, playerName: targetPlayerName, code: targetCode, lastUpdated: Date.now() }];
        });
      });

      socket.on("code:sync", ({ code: newCode, updatedByName }) => {
        setCode(newCode);
      });

      socket.on("game:phase_change", ({ phase: newPhase, phaseTimeRemaining: ptr, snapshotBeforeCode: sbc, currentCode: cc }) => {
        setPhase(newPhase);
        setPhaseTimeRemaining(ptr);
        if (sbc !== undefined) setSnapshotBeforeCode(sbc);
        if (cc !== undefined) setCode(cc);
      });

      socket.on("game:phase_tick", ({ phase: p, phaseTimeRemaining: ptr }) => {
        setPhase(p);
        setPhaseTimeRemaining(ptr);
      });

      socket.on("code:player_typing", ({ playerName }) => {
        if (!playerName) return;
        setActiveTypers((prev) => {
          if (!prev.includes(playerName)) return [...prev, playerName];
          return prev;
        });

        if (typerTimeoutRef.current) clearTimeout(typerTimeoutRef.current);
        typerTimeoutRef.current = setTimeout(() => {
          setActiveTypers([]);
        }, 2500);
      });

      // Peer Voice Speaking Indicator
      socket.on("voice:peer_state", ({ playerId, isMuted: peerMuted, isSpeaking: peerSpeaking }) => {
        const peerName = roomRef.current?.players?.[playerId]?.name;
        if (!peerName) return;

        if (peerSpeaking && !peerMuted) {
          setActiveSpeakers(prev => prev.includes(peerName) ? prev : [...prev, peerName]);

          // Clear speaker after 2.5s if no update
          if (speakerTimersRef.current.has(peerName)) {
            clearTimeout(speakerTimersRef.current.get(peerName));
          }
          const t = setTimeout(() => {
            setActiveSpeakers(prev => prev.filter(n => n !== peerName));
          }, 2500);
          speakerTimersRef.current.set(peerName, t);
        } else {
          setActiveSpeakers(prev => prev.filter(n => n !== peerName));
        }
      });

      socket.on("mystery:clue_unlocked", ({ newlyUnlocked, unlockedCount }) => {
        if (newlyUnlocked && newlyUnlocked.length > 0) {
          setUnlockedMysteryClues(prev => {
            const ids = new Set(prev.map(c => c.testIndex));
            const fresh = newlyUnlocked.filter(c => !ids.has(c.testIndex));
            return [...prev, ...fresh];
          });
          setMafiaCluesUnlockedCount(unlockedCount || 1);

          // Pop up mystery modal for developers
          if (playerRef.current?.role !== "MAFIA") {
            setActiveMysteryModalClue(newlyUnlocked[0]);
          }
        }
      });

      socket.on("chat:message", (msg) => {
        setMessages((prev) => [...prev, msg]);
        setActiveTab((currentTab) => {
          if (currentTab !== 'chat') {
            setUnreadChatCount((c) => c + 1);
          }
          return currentTab;
        });
      });

      socket.on("game:timer_sync", ({ timeRemainingSeconds: trs }) => {
        setTimeRemainingSeconds(trs);
      });

      socket.on("tests:completed", ({ testResults: tr }) => {
        setTestResults(tr);
        setIsRunningTests(false);
      });

      // Emergency meeting ejection resolution
      socket.on("meeting:ejection", ({ ejectedPlayer, votesSummary, winner, winReason }) => {
        const text = ejectedPlayer
          ? `🚨 ${ejectedPlayer.name} was voted out! (Role: ${ejectedPlayer.role})`
          : "⚖️ Vote resulted in a Tie or Skip — No one was ejected!";
        setEjectionToast(text);
        setTimeout(() => setEjectionToast(null), 5000);

        if (winner) {
          setRoom(prev => prev ? {
            ...prev,
            status: "GAME_OVER",
            winner,
            winReason: winReason || (winner === "DEVELOPERS" ? "All Mafia eliminated!" : "Mafia gained majority!")
          } : null);
        }
      });

      // 5-second Auto-Close Countdown when all other players leave
      socket.on("room:auto_closing", ({ countdownSeconds }) => {
        setAutoCloseCountdown(countdownSeconds || 5);
      });

      socket.on("room:auto_close_cancelled", () => {
        setAutoCloseCountdown(null);
      });

      socket.on("room:force_exit", () => {
        setAutoCloseCountdown(null);
        setRoom(null);
        setPlayer(null);
        setMessages([]);
        setUnlockedMysteryClues([]);
      });
    }

    return () => {
      if (socket) {
        socket.off("room:updated");
        socket.off("mafia:screen_update");
        socket.off("code:sync");
        socket.off("game:phase_change");
        socket.off("game:phase_tick");
        socket.off("code:player_typing");
        socket.off("voice:peer_state");
        socket.off("mystery:clue_unlocked");
        socket.off("chat:message");
        socket.off("game:timer_sync");
        socket.off("tests:completed");
        socket.off("meeting:ejection");
        socket.off("room:auto_closing");
        socket.off("room:auto_close_cancelled");
        socket.off("room:force_exit");
      }
      if (typerTimeoutRef.current) clearTimeout(typerTimeoutRef.current);
    };
  }, []);

  // Sync current player state from room & voice session
  useEffect(() => {
    if (room && player) {
      voiceService.setSession(room.code, player.id);
      const updatedMe = room.players?.[player.id];
      if (updatedMe) {
        setPlayer(prev => {
          if (!prev) return updatedMe;
          if (
            prev.role === updatedMe.role &&
            prev.isAlive === updatedMe.isAlive &&
            prev.isReady === updatedMe.isReady &&
            prev.isHost === updatedMe.isHost &&
            prev.avatar === updatedMe.avatar &&
            prev.name === updatedMe.name
          ) {
            return prev;
          }
          return { ...prev, ...updatedMe };
        });
      }
    }
  }, [room?.players, player?.id]);

  // Handle Voice Toggle
  const handleToggleVoiceMute = async () => {
    if (room && player) {
      voiceService.setSession(room.code, player.id);
    }
    await voiceService.toggleMute();
  };

  // Handle Tab Switch (clears unread badge on chat tab)
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      setUnreadChatCount(0);
    }
  };

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
          if (res.room.chatMessages) setMessages(res.room.chatMessages);
        } else {
          alert(res?.error || "Failed to create room");
        }
      });
    } else {
      // Offline fallback simulator mode
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
        chatMessages: [],
        phase: "CODING",
        phaseTimeRemaining: 30,
        snapshotBeforeCode: challenge.starterCode,
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
    if (socket) {
      socket.emit("room:join", { roomCode, player: newPlayer }, (res) => {
        setIsConnecting(false);
        if (res?.success) {
          setRoom(res.room);
          setCode(res.room.currentCode);
          if (res.room.chatMessages) setMessages(res.room.chatMessages);
        } else {
          alert(res?.error || "Failed to join room");
        }
      });

      // Fallback timeout in case socket is offline
      setTimeout(() => {
        setIsConnecting(false);
      }, 4000);
    } else {
      setIsConnecting(false);
      alert("Backend server is not connected. Connect both backend & frontend to test multiplayer!");
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
      setSnapshotBeforeCode(room.challenge.starterCode);
      setPhase("CODING");
      setPhaseTimeRemaining(30);
      setRoom(prev => ({
        ...prev,
        status: "ROLE_REVEAL",
        phase: "CODING",
        phaseTimeRemaining: 30,
        snapshotBeforeCode: room.challenge.starterCode,
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

  // Code Change & Typing Presence
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("code:change", { code: newCode });
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 1200) {
      lastTypingEmitRef.current = now;
      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socket.emit("code:typing");
      }
    }
  };

  // Send Chat Message
  const handleSendMessage = (text) => {
    if (!text?.trim()) return;
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("chat:send", {
        message: text.trim(),
        roomCode: room?.code,
        senderId: player?.id,
        senderName: player?.name,
        senderAvatar: player?.avatar
      });
    } else {
      // Local fallback simulator
      const localMsg = {
        id: "msg_" + Date.now(),
        senderId: player?.id || "local",
        senderName: player?.name || "You",
        senderAvatar: player?.avatar || "👨‍💻",
        isAlive: player?.isAlive ?? true,
        message: text.trim(),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, localMsg]);
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

        // Simulate mystery riddle unbox in offline simulator
        const mockClue = {
          testIndex: 0,
          clueNumber: 1,
          title: "Initial Ignition",
          riddle: "The saboteur walks among us under an alias with 5 characters starting with 'P'.",
          revealedSnippet: "P _ _ _ _"
        };
        setUnlockedMysteryClues([mockClue]);
        if (player?.role !== "MAFIA") {
          setActiveMysteryModalClue(mockClue);
        }
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
        meeting: { callerName: player?.name || "Team", durationSeconds: 45 }
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

  // Mafia Sabotage Injection
  const handleTamperCode = (targetPlayerId, tamperedCode) => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("mafia:tamper_code", { targetPlayerId, tamperedCode });
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
    setMessages([]);
    setUnlockedMysteryClues([]);
    setActiveMysteryModalClue(null);
    setAutoCloseCountdown(null);
  };

  // Explicit Leave Room
  const handleLeaveRoom = () => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("room:leave");
    }
    setRoom(null);
    setPlayer(null);
    setTestResults(null);
    setMessages([]);
    setUnlockedMysteryClues([]);
    setActiveMysteryModalClue(null);
    setAutoCloseCountdown(null);
  };

  const isInGame = room && (room.status === "PLAYING" || room.status === "VOTING" || room.status === "GAME_OVER");

  // View 0: Cinematic AAA Landing Page
  if (!room && currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterLobby={() => setCurrentView('lobby')}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          onOpenProfile={() => {
            if (authUser) setShowProfileModal(true);
            else setShowAuthModal(true);
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          authUser={authUser}
        />

        {/* Global Modals accessible from Landing Page */}
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          currentUserId={authUser?.id}
        />

        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={authUser}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setAuthUser(user);
            setShowAuthModal(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] bg-grid-pattern text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* 5-second Auto-Close Countdown Toast / Banner */}
      {autoCloseCountdown !== null && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 text-white py-2.5 px-4 text-center font-mono text-xs font-bold border-b border-rose-500 shadow-2xl flex items-center justify-center space-x-2 animate-pulse">
          <AlertCircle className="h-4 w-4 text-amber-400 animate-spin" />
          <span>⚠️ All other players have left! Room will auto-close and return to Lobby in {autoCloseCountdown}s...</span>
        </div>
      )}

      {/* Emergency Meeting Ejection Toast */}
      {ejectionToast && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 text-white py-2.5 px-4 text-center font-mono text-xs font-extrabold border-b border-indigo-500 shadow-2xl flex items-center justify-center space-x-2 animate-fade-in">
          <span>{ejectionToast}</span>
        </div>
      )}

      {/* Top Navbar with Voice Controls & Leaderboard */}
      <Navbar
        room={room}
        player={player}
        timeRemainingSeconds={timeRemainingSeconds}
        onCallMeeting={handleCallMeeting}
        canCallMeeting={room?.status === "PLAYING"}
        authUser={authUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => { logoutUser(); setAuthUser(null); }}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onLeaveRoom={room ? handleLeaveRoom : () => setCurrentView('landing')}
        isMuted={isVoiceMuted}
        isSpeaking={isVoiceSpeaking}
        onToggleMute={handleToggleVoiceMute}
        activeSpeakers={activeSpeakers}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* View 1: Lobby */}
        {(!room || room.status === "LOBBY") && (
          <div className="space-y-4">
            {!room && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentView('landing')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center space-x-1.5"
                >
                  <span>← BACK TO MAIN HQ</span>
                </button>
              </div>
            )}

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
          </div>
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

            {/* Crime Board Suspects Polaroid Roster with EKG Heartbeat */}
            <SuspectsRosterBoard
              room={room}
              player={player}
              surveillanceFeed={surveillanceFeed}
              selectedSuspectId={selectedSuspectId}
              onSelectSuspect={(suspect) => {
                setSelectedSuspectId(suspect.id);
                if (player?.role === "MAFIA" && suspect.id !== player.id) {
                  setShowSurveillanceModal(true);
                }
              }}
            />

            {/* Split Arena Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
              {/* Left: Code Editor (7 cols) */}
              <div className="lg:col-span-7 h-full min-h-[420px]">
                <CodeEditor
                  code={code}
                  files={room.challenge?.files}
                  language={room.challenge?.language || "javascript"}
                  snapshotBeforeCode={snapshotBeforeCode}
                  onChange={handleCodeChange}
                  onReset={handleResetCode}
                  onTyping={handleTyping}
                  player={player}
                  phase={phase}
                  phaseTimeRemaining={phaseTimeRemaining}
                  readOnly={!player?.isAlive}
                  activeTypers={activeTypers}
                  onOpenSurveillance={() => setShowSurveillanceModal(true)}
                  onRunTests={handleRunTests}
                  testResults={testResults}
                />
              </div>

              {/* Right: Dynamic Multi-Tab Control Center (5 cols) */}
              <div className="lg:col-span-5 flex flex-col h-full space-y-3">
                {/* Tab Switcher */}
                <div className="grid grid-cols-5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold gap-1 shadow">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('tests')}
                    title="Automated Unit Tests"
                    className={`py-2 px-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                      activeTab === 'tests'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tests</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('mystery')}
                    title="Mystery Box Clues Dossier"
                    className={`relative py-2 px-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                      activeTab === 'mystery'
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gift className="h-3.5 w-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Clues</span>
                    {unlockedMysteryClues.length > 0 && (
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-purple-500 text-white font-mono text-[8px] font-bold">
                        {unlockedMysteryClues.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('activity')}
                    title="CCTV Activity Audit Log"
                    className={`py-2 px-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                      activeTab === 'activity'
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Audit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('evidence')}
                    title="Evidence & Investigation Board"
                    className={`py-2 px-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                      activeTab === 'evidence'
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Evidence</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('chat')}
                    title="Live Team Discussion"
                    className={`relative py-2 px-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                      activeTab === 'chat'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Chat</span>
                    {unreadChatCount > 0 && activeTab !== 'chat' && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold animate-bounce">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Panels */}
                <div className="flex-1 min-h-[450px]">
                  {activeTab === 'tests' && (
                    <TestRunner
                      testResults={testResults}
                      onRunTests={handleRunTests}
                      isRunningTests={isRunningTests}
                      challenge={room.challenge}
                    />
                  )}

                  {activeTab === 'mystery' && (
                    <MysteryCluesDossier
                      unlockedClues={unlockedMysteryClues}
                      totalCluesCount={totalMysteryCluesCount}
                      player={player}
                      room={room}
                      mafiaCluesUnlockedCount={mafiaCluesUnlockedCount}
                      onCallMeeting={handleCallMeeting}
                      onSelectSuspect={(suspect) => {
                        setSelectedSuspectId(suspect.id);
                        if (player?.role === "MAFIA" && suspect.id !== player.id) {
                          setShowSurveillanceModal(true);
                        }
                      }}
                    />
                  )}

                  {activeTab === 'activity' && (
                    <ActivityFeed activityLog={room.activityLog || []} />
                  )}

                  {activeTab === 'evidence' && (
                    <EvidenceBoard
                      activityLog={room.activityLog || []}
                      testResults={testResults}
                      challenge={room.challenge}
                    />
                  )}

                  {activeTab === 'chat' && (
                    <ChatBox
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      player={player}
                      title="MISSION TEAM CHAT"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Leaderboard & Stats Modal */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        player={player}
        authUser={authUser}
        room={room}
      />

      {/* User Operative Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        player={player}
        authUser={authUser}
      />

      {/* Secret Mafia CCTV Surveillance Multi-Screen Dashboard */}
      <MafiaSurveillanceDashboard
        isOpen={showSurveillanceModal}
        onClose={() => setShowSurveillanceModal(false)}
        surveillanceFeed={surveillanceFeed}
        room={room}
        player={player}
        onTamperCode={handleTamperCode}
      />

      {/* Secret Role Reveal Modal */}
      {showRoleModal && (
        <RoleModal
          player={player}
          onAcknowledge={handleAcknowledgeRole}
        />
      )}

      {/* Mystery Box Clue Unbox Popup Modal */}
      {activeMysteryModalClue && (
        <MysteryBoxModal
          clue={activeMysteryModalClue}
          onClose={() => setActiveMysteryModalClue(null)}
          onOpenDossier={() => {
            setActiveMysteryModalClue(null);
            setActiveTab('mystery');
          }}
        />
      )}

      {/* Emergency Meeting / Voting Modal (Dual Pane with Live Debate Chat) */}
      {room?.status === "VOTING" && (
        <VotingModal
          room={room}
          player={player}
          messages={messages}
          onSendMessage={handleSendMessage}
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
