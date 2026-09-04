import React, { useState } from 'react';
import { Users, Play, Plus, ArrowRight, Shield, Bug, Sparkles, CheckCircle2, Circle, Flame, Cpu, Wand2, RefreshCw, Layers, Check, X, Skull, Award, Lock, FileCode, Star, HelpCircle } from 'lucide-react';
import { CHALLENGES } from '../data/challenges';
import CatTarotCard from './CatTarotCard';

const AVATARS = [
  { id: "dev-1", icon: "👨‍💻", label: "Dev" },
  { id: "dev-2", icon: "👩‍💻", label: "Hacker" },
  { id: "ninja", icon: "🥷", label: "Outlaw" },
  { id: "detective", icon: "🕵️", label: "Agent" },
  { id: "cyborg", icon: "🤖", label: "Cyborg" },
  { id: "wizard", icon: "🧙‍♂️", label: "Mage" },
  { id: "alien", icon: "👾", label: "Alien" },
  { id: "ghost", icon: "👻", label: "Specter" }
];

const PROMPT_SUGGESTIONS = [
  "🗄️ SQL Merchant Net Revenue & Fraud Aggregates",
  "🗄️ SQL Player High-Score Leaderboard & Win Rates",
  "💳 Payment Gateway Idempotency & Currency Router",
  "📦 Warehouse Stock Mutex & Order Pipeline",
  "🔐 JWT Role Validator & Token Guard"
];

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onToggleReady,
  room,
  player,
  authUser,
  isConnecting
}) {
  const [tab, setTab] = useState("create"); // 'create' | 'join'
  const [nickname, setNickname] = useState(authUser?.username || authUser?.email?.split("@")[0] || player?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(authUser?.avatar || player?.avatar || "👨‍💻");
  const [joinCode, setJoinCode] = useState("");
  
  // Game Settings (Host only)
  const [challengesList, setChallengesList] = useState(CHALLENGES);
  const [selectedChallengeId, setSelectedChallengeId] = useState(CHALLENGES[0].id);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [mafiaCount, setMafiaCount] = useState(1);

  // AI Prompt Challenge Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedAiLanguage, setSelectedAiLanguage] = useState("sql");
  const [customAiKey, setCustomAiKey] = useState(() => localStorage.getItem("codemafia_ai_key") || "");
  const [customAiProvider, setCustomAiProvider] = useState(() => localStorage.getItem("codemafia_ai_provider") || "gemini");
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);
  };

  const handleGenerateAiChallenge = async (customPrompt, customLang) => {
    const promptToUse = customPrompt || aiPrompt;
    const langToUse = customLang || selectedAiLanguage;
    if (!promptToUse.trim()) return;

    if (customAiKey.trim()) {
      localStorage.setItem("codemafia_ai_key", customAiKey.trim());
      localStorage.setItem("codemafia_ai_provider", customAiProvider);
    }

    setIsGeneratingAi(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/challenges/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptToUse.trim(), 
          language: langToUse,
          apiKey: customAiKey.trim() || undefined,
          provider: customAiProvider
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.challenge) {
          setChallengesList(prev => [data.challenge, ...prev]);
          setSelectedChallengeId(data.challenge.id);
          const fileNames = data.challenge.files ? Object.keys(data.challenge.files).join(", ") : "2 files";
          const testCount = data.challenge.testSuite ? data.challenge.testSuite.length : 3;
          setAiSuccessMessage(`✨ Generated: "${data.challenge.title}"\n📂 Connected Files: [${fileNames}]\n🧪 Automated Tests: ${testCount} assertions created!`);
          setTimeout(() => {
            setShowAiModal(false);
            setAiSuccessMessage(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.warn("AI Challenge Generation note:", err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onCreateRoom({
      name: nickname.trim(),
      avatar: selectedAvatar,
      settings: {
        challengeId: selectedChallengeId,
        durationMinutes: Number(durationMinutes),
        mafiaCount: Number(mafiaCount)
      }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !joinCode.trim()) return;
    onJoinRoom({
      roomCode: joinCode.trim().toUpperCase(),
      name: nickname.trim(),
      avatar: selectedAvatar
    });
  };

  // When room is active in LOBBY state
  if (room && room.status === "LOBBY") {
    const isHost = player?.id === room.hostId || player?.isHost;
    const playersList = Array.isArray(room.players)
      ? room.players
      : Object.values(room.players || {});
    const readyCount = playersList.filter(p => p.isReady).length;
    const canStart = isHost && playersList.length >= 1; // Allows 1 player dev test or multi
    const needsMorePlayers = playersList.length < 2;

    return (
      <div 
        className="max-w-6xl mx-auto space-y-6 animate-fade-in select-none rounded-3xl p-6 sm:p-8 border-2 border-[#e31b23]/40 shadow-2xl shadow-rose-950/80 bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(15,0,3,0.92) 100%), url('/images/rdr2_blood_moon.jpg')` }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e31b23]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#3a1015]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono font-black tracking-widest text-[#e31b23] uppercase drop-shadow">
                OUTLAWS FOR LIFE • HQ CAMP
              </span>
              <span className="px-3 py-0.5 rounded-full bg-black/80 border-2 border-[#d97706] text-[#fcd34d] text-xs font-mono font-black shadow-lg">
                ROOM #{room.code}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-['Bebas_Neue'] tracking-wider text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              CAMP HEADQUARTERS
            </h1>
            <p className="text-xs text-slate-300 font-sans">
              {readyCount} of {playersList.length} operatives ready to deploy into the code arena.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={onToggleReady}
              className={`flex-1 md:flex-initial px-7 py-3.5 rounded-xl font-['Bebas_Neue'] tracking-wider text-lg transition shadow-lg ${
                player?.isReady
                  ? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/80 border border-emerald-400"
                  : "bg-black/80 hover:bg-[#1a0003] text-rose-200 border-2 border-[#e31b23]"
              }`}
            >
              {player?.isReady ? "✓ READY FOR BLOOD" : "MARK AS READY"}
            </button>

            {isHost && (
              <button
                onClick={onStartGame}
                disabled={!canStart}
                title={needsMorePlayers ? "Minimum 2 players required to start the mission" : "Start the game mission"}
                className="flex-1 md:flex-initial px-8 py-3.5 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-white font-['Bebas_Neue'] tracking-wider text-xl shadow-2xl shadow-rose-950/80 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-red-400"
              >
                <Play className="h-5 w-5 fill-white" />
                <span>START MISSION</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid Layout: Squad & Mission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 relative z-10">
          {/* Left: Connected Squad Roster */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-['Bebas_Neue'] tracking-widest text-[#fcd34d] flex items-center space-x-2 text-base">
                <Users className="h-4 w-4 text-[#e31b23]" />
                <span>OPERATIVES GATHERED ({playersList.length} / 8)</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {playersList.map((p, idx) => {
                const isMe = p.id === player?.id;
                const badgeText = p.isHost
                  ? (p.isReady ? "👑 READY" : "👑 HOST")
                  : (p.isReady ? "READY" : "WAITING");

                return (
                  <CatTarotCard
                    key={p.id}
                    player={{ ...p, isSelf: isMe }}
                    index={idx}
                    isSelectable={false}
                    compact={true}
                    badgeText={badgeText}
                  />
                );
              })}
            </div>
          </div>

          {/* Right: Mission Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-['Bebas_Neue'] tracking-widest text-[#fcd34d] flex items-center space-x-2 text-base">
              <Shield className="h-4 w-4 text-[#e31b23]" />
              <span>MISSION INTEL</span>
            </h3>

            <div className="p-5 rounded-2xl bg-black/85 backdrop-blur-md border-2 border-[#2d1215] space-y-4 shadow-2xl">
              {/* Arthur Morgan Wanted Mini Banner */}
              <div className="relative rounded-xl overflow-hidden border border-[#3a1015] shadow-inner group">
                <img 
                  src="/images/rdr2_arthur_story.png" 
                  alt="Arthur Morgan" 
                  className="w-full h-32 object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-white font-['Bebas_Neue'] text-lg tracking-wider">
                    MISSION COMMAND
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#fcd34d] px-2 py-0.5 rounded bg-black/80 border border-[#d97706]">
                    ★ WANTED $10,000
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e31b23] block mb-1 font-bold">
                  {room.challenge?.category || "Target Challenge"}
                </span>
                <h4 className="font-['Bebas_Neue'] tracking-wider text-white text-2xl leading-tight">
                  {room.challenge?.title || "Code Base Mission"}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                  {room.challenge?.description}
                </p>
              </div>

              <div className="border-t border-[#2d1215] pt-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Deliberate Bugs:</span>
                  <span className="font-black text-[#e31b23]">{room.challenge?.bugsCount || 2} stealth bugs</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Automated Tests:</span>
                  <span className="font-black text-emerald-400">{room.challenge?.testSuite?.length || 3} test cases</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Time Limit:</span>
                  <span className="font-black text-white">{room.settings?.durationMinutes || 10} minutes</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Secret Mafia:</span>
                  <span className="font-black text-[#e31b23]">{room.settings?.mafiaCount || 1} outlaw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-room Welcome / Create / Join Form (Rich 2-Column Outlaw Layout with Arthur Morgan Backdrop)
  return (
    <div 
      className="max-w-6xl mx-auto px-4 py-8 rounded-3xl border-2 border-[#e31b23]/60 shadow-[0_0_50px_rgba(227,27,35,0.25)] bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(20,0,4,0.88) 50%, rgba(0,0,0,0.94) 100%), url('/images/rdr2_blood_moon.jpg')` }}
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e31b23]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#e31b23]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Column: Arthur Morgan Wanted Artwork & Outlaw Lore */}
        <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="rounded-2xl overflow-hidden border-2 border-[#e31b23]/70 bg-gradient-to-b from-black via-[#140003] to-black shadow-2xl p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#3a0008] pb-3 mb-4">
                <span className="text-xs font-mono font-black text-[#e31b23] tracking-widest uppercase flex items-center space-x-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  <span>OUTLAWS OF SILICON VALLEY</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#fcd34d] px-2.5 py-0.5 rounded bg-black border border-[#d97706] shadow">
                  $10,000 BOUNTY
                </span>
              </div>

              {/* High-Res Arthur Morgan Image */}
              <div className="relative rounded-xl overflow-hidden border-2 border-[#3a1015] shadow-2xl group">
                <img 
                  src="/images/rdr2_arthur_story.png" 
                  alt="Arthur Morgan" 
                  className="w-full h-64 md:h-72 object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-105 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-white font-['Bebas_Neue'] text-3xl tracking-wider drop-shadow-lg text-rose-100">
                    ARTHUR MORGAN
                  </div>
                  <div className="text-[10px] text-[#fcd34d] font-mono font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>VAN DER LINDE GANG</span>
                    <span className="text-rose-400">DEAD OR ALIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans leading-relaxed pt-3 border-t border-[#2a050a]">
              <p className="italic text-slate-200">
                "We're thieves in a world that don't want us no more. But when it comes to shipping code, we stand together."
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#e31b23] pt-1">
                <span>⚔️ 30s SURVEILLANCE & SABOTAGE</span>
                <span className="text-[#fcd34d]">★ NOIR ARENA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enter Arena Create / Join Form */}
        <div className="md:col-span-7">
          <div className="rounded-2xl p-6 sm:p-8 shadow-2xl bg-black/90 backdrop-blur-2xl border-2 border-[#e31b23]/70 space-y-6">
            
            {/* Title */}
            <div className="text-left space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-[#1a0003] border border-[#e31b23] text-rose-300 text-xs font-mono font-black uppercase tracking-widest mb-1 shadow-md">
                <Flame className="h-3.5 w-3.5 text-[#e31b23]" />
                <span>OUTLAWS CODE ARENA</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black font-['Bebas_Neue'] tracking-wider text-white drop-shadow">
                ENTER CODE MAFIA II
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans">
                Will you debug and stabilize the code, or stealthily sabotage the team from within?
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Nickname & Avatar */}
              <div className="space-y-2.5">
                <label className="block text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d] text-sm">
                  OUTLAW IDENTITY (ALIAS)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your outlaw alias..."
                  maxLength={16}
                  className="w-full px-4 py-3 rounded-xl bg-black/90 border-2 border-[#2d1215] text-white placeholder-slate-500 focus:outline-none focus:border-[#e31b23] focus:ring-1 focus:ring-[#e31b23] text-sm font-bold transition shadow-inner"
                />

                {/* Avatar Picker */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 uppercase font-mono font-bold">CHOOSE ARCHETYPE AVATAR</span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-1.5">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.icon)}
                        className={`h-11 rounded-xl flex items-center justify-center text-xl transition border-2 ${
                          selectedAvatar === av.icon
                            ? "bg-[#250207] border-[#e31b23] shadow-lg shadow-rose-950/80 scale-105"
                            : "bg-black/80 border-[#2d1215] hover:border-[#e31b23]/50"
                        }`}
                      >
                        {av.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Tabs: Create Match vs Join */}
              <div className="flex rounded-xl bg-black p-1 border-2 border-[#2d1215]">
                <button
                  type="button"
                  onClick={() => setTab("create")}
                  className={`flex-1 py-2.5 text-sm font-['Bebas_Neue'] tracking-wider rounded-lg transition ${
                    tab === "create"
                      ? "bg-[#e31b23] text-white shadow-lg shadow-rose-950/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  CREATE MATCH
                </button>
                <button
                  type="button"
                  onClick={() => setTab("join")}
                  className={`flex-1 py-2.5 text-sm font-['Bebas_Neue'] tracking-wider rounded-lg transition ${
                    tab === "join"
                      ? "bg-[#e31b23] text-white shadow-lg shadow-rose-950/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  JOIN WITH CODE
                </button>
              </div>

              {/* Create Match Panel */}
              {tab === "create" && (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d] text-sm">
                        SELECT CHALLENGE BASE
                      </label>
                      
                      {/* AI Generator Button */}
                      <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        className="text-[11px] font-mono font-bold text-[#fcd34d] hover:text-white flex items-center space-x-1 bg-[#1a0f0f] hover:bg-[#250207] border border-[#d97706] px-2.5 py-1 rounded-lg transition shadow-sm"
                      >
                        <Wand2 className="h-3 w-3 text-[#e31b23]" />
                        <span>✨ AI PROMPT GENERATOR</span>
                      </button>
                    </div>

                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border-2 border-[#2d1215] text-white focus:outline-none focus:border-[#e31b23] text-sm font-bold"
                    >
                      {challengesList.map((c) => (
                        <option key={c.id} value={c.id} className="bg-black text-white">
                          {c.title} ({c.difficulty} • {c.language?.toUpperCase() || "JS"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d] block mb-1">
                        TIME LIMIT (MIN)
                      </label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black border-2 border-[#2d1215] text-white focus:outline-none focus:border-[#e31b23] text-sm font-bold"
                      >
                        <option value={5}>5 Minutes (Blitz)</option>
                        <option value={10}>10 Minutes (Standard)</option>
                        <option value={15}>15 Minutes (Tactical)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d] block mb-1">
                        MAFIA RATIO
                      </label>
                      <select
                        value={mafiaCount}
                        onChange={(e) => setMafiaCount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black border-2 border-[#2d1215] text-white focus:outline-none focus:border-[#e31b23] text-sm font-bold"
                      >
                        <option value={1}>1 Secret Mafia</option>
                        <option value={2}>2 Secret Mafia</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting || !nickname.trim()}
                    className="w-full py-4 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-white font-['Bebas_Neue'] tracking-wider text-xl shadow-2xl shadow-rose-950/80 transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 border border-red-400"
                  >
                    <span>{isConnecting ? "CREATING CAMP..." : "ESTABLISH CAMP (HOST)"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              )}

              {/* Join Match Panel */}
              {tab === "join" && (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d] text-sm block mb-1">
                      6-DIGIT ROOM PASSCODE
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. X7K92P"
                      maxLength={10}
                      className="w-full px-4 py-3.5 rounded-xl bg-black border-2 border-[#2d1215] text-[#fcd34d] placeholder-slate-600 focus:outline-none focus:border-[#e31b23] text-lg font-mono font-black tracking-widest uppercase transition shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting || !nickname.trim() || !joinCode.trim()}
                    className="w-full py-4 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-white font-['Bebas_Neue'] tracking-wider text-xl shadow-2xl shadow-rose-950/80 transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 border border-red-400"
                  >
                    <span>{isConnecting ? "CONNECTING..." : "ENTER MATCH ARENA"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* AI Prompt Challenge Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-2xl p-6 sm:p-8 bg-[#0a0607] border-2 border-[#e31b23] shadow-2xl shadow-rose-950/80 space-y-5">
            <div className="flex items-center justify-between border-b border-[#2d1215] pb-3">
              <div className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-[#e31b23]" />
                <h3 className="font-['Bebas_Neue'] tracking-wider text-2xl text-white">AI MULTI-LANGUAGE GENERATOR</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d]">SELECT PROGRAMMING LANGUAGE</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "python", label: "Python", ext: ".py" },
                  { id: "sql", label: "SQL", ext: ".sql" },
                  { id: "javascript", label: "JS", ext: ".js" },
                  { id: "typescript", label: "TS", ext: ".ts" },
                  { id: "cpp", label: "C++", ext: ".cpp" },
                  { id: "java", label: "Java", ext: ".java" }
                ].map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedAiLanguage(lang.id)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-mono font-bold transition border-2 text-center ${
                      selectedAiLanguage === lang.id
                        ? "bg-[#e31b23] border-red-400 text-white shadow-lg shadow-rose-950/60"
                        : "bg-black border-[#2d1215] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div>{lang.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-['Bebas_Neue'] tracking-widest text-[#fcd34d]">DESCRIBE CHALLENGE</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Build a SQL transaction ledger with account balance audit verification..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black border-2 border-[#2d1215] text-white placeholder-slate-600 focus:outline-none focus:border-[#e31b23] text-xs font-mono leading-relaxed"
              />
            </div>

            {/* Preset Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">QUICK PRESETS</span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAiPrompt(sug.substring(2))}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-300 hover:text-white transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional AI Key Accordion */}
            <div className="border border-[#2d1215] rounded-xl overflow-hidden bg-black/60">
              <button
                type="button"
                onClick={() => setShowKeySettings(!showKeySettings)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-white"
              >
                <span>🔑 Custom AI Key (Optional: Gemini / OpenAI / Groq)</span>
                <span>{showKeySettings ? "▲" : "▼"}</span>
              </button>

              {showKeySettings && (
                <div className="p-3 pt-1 space-y-2 border-t border-[#2d1215]">
                  <div className="flex space-x-2">
                    {["gemini", "openai", "groq", "openrouter"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomAiProvider(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition ${
                          customAiProvider === p ? "bg-[#e31b23] text-white" : "bg-black text-slate-400 border border-[#2d1215]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="password"
                    value={customAiKey}
                    onChange={(e) => setCustomAiKey(e.target.value)}
                    placeholder="Paste your API key (e.g. AIza... or sk-...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-black border border-[#2d1215] text-white placeholder-slate-600 focus:outline-none focus:border-[#e31b23] text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Key is saved only in your local browser and used directly for real-time generation.
                  </p>
                </div>
              )}
            </div>

            {/* Success Message */}
            {aiSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold font-mono whitespace-pre-line">
                {aiSuccessMessage}
              </div>
            )}

            {/* Generate Action */}
            <button
              type="button"
              onClick={() => handleGenerateAiChallenge()}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className="w-full py-3.5 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-white font-['Bebas_Neue'] tracking-wider text-xl shadow-xl shadow-rose-950/80 transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 border border-red-400"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>SYNTHESIZING 2-3 MODULAR FILES...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>GENERATE {selectedAiLanguage.toUpperCase()} MULTI-FILE PROJECT</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
