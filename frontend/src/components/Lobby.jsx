import React, { useState } from 'react';
import { Users, Play, Plus, ArrowRight, Shield, Bug, Sparkles, CheckCircle2, Circle, Flame, Cpu } from 'lucide-react';
import { CHALLENGES } from '../data/challenges';

const AVATARS = [
  { id: "dev-1", icon: "👨‍💻", label: "Dev" },
  { id: "dev-2", icon: "👩‍💻", label: "Hacker" },
  { id: "ninja", icon: "🥷", label: "Ninja" },
  { id: "detective", icon: "🕵️", label: "Agent" },
  { id: "cyborg", icon: "🤖", label: "Bot" },
  { id: "wizard", icon: "🧙‍♂️", label: "Wizard" },
  { id: "alien", icon: "👾", label: "Alien" },
  { id: "ghost", icon: "👻", label: "Specter" }
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
  const [selectedChallengeId, setSelectedChallengeId] = useState(CHALLENGES[0].id);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [mafiaCount, setMafiaCount] = useState(1);

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

  // If already inside a room lobby
  if (room) {
    const playersList = Object.values(room.players || {});
    const isHost = player?.isHost;
    const canStart = playersList.length >= 2 && playersList.length <= 8;
    const needsMorePlayers = playersList.length < 2;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Lobby Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black font-display tracking-wide text-white">
                  MISSION LOBBY
                </h1>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sky-400 font-mono text-sm font-bold tracking-wider">
                  #{room.code}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center space-x-2">
                <span>Waiting for squad members (Min: 2, Max: 8).</span>
                {needsMorePlayers && (
                  <span className="text-amber-400 font-semibold font-mono text-xs bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                    Need 1 more player to start
                  </span>
                )}
              </p>
            </div>

            {/* Ready / Host Actions */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={onToggleReady}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg ${
                  player?.isReady
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {player?.isReady ? "✓ Ready for Mission" : "Mark as Ready"}
              </button>

              {isHost && (
                <button
                  onClick={onStartGame}
                  disabled={!canStart}
                  title={needsMorePlayers ? "Minimum 2 players required to start the mission" : "Start the game mission"}
                  className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>START MISSION</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player Squad List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Team Squad ({playersList.length}/8)</span>
                <span>Ready Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playersList.map((p) => {
                  const isMe = p.id === player?.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition ${
                        isMe
                          ? "bg-slate-800/80 border-sky-500/50 shadow-md shadow-sky-500/10"
                          : "bg-slate-900/60 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-11 w-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                          {p.avatar || "👨‍💻"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-200 flex items-center space-x-1.5">
                            <span>{p.name}</span>
                            {isMe && <span className="text-[11px] font-normal text-sky-400">(You)</span>}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center space-x-1">
                            {p.isHost && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-semibold">
                                HOST
                              </span>
                            )}
                            <span className="text-slate-500">Agent</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {p.isReady ? (
                          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800/80">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>READY</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-slate-500 text-xs font-medium bg-slate-800/60 px-2 py-1 rounded-md">
                            <Circle className="h-3.5 w-3.5" />
                            <span>WAITING</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Challenge Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Codebase
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-semibold">
                    {room.challenge?.category || "Algorithms"}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {room.challenge?.difficulty || "Medium"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">{room.challenge?.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-3">
                    {room.challenge?.description}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Deliberate Bugs:</span>
                    <span className="font-bold text-rose-400">{room.challenge?.bugsCount || 3} stealth bugs</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Automated Tests:</span>
                    <span className="font-bold text-emerald-400">{room.challenge?.testSuite?.length || 5} test cases</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Time Limit:</span>
                    <span className="font-bold text-slate-200">{room.settings?.durationMinutes || 10} minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Secret Mafia:</span>
                    <span className="font-bold text-rose-400">{room.settings?.mafiaCount || 1} player</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-room Welcome / Create / Join Form
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span>Multiplayer Coding Challenge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
            ENTER CODE MAFIA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Will you debug and stabilize the code, or stealthily sabotage the team from within?
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Nickname & Avatar */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Agent Identity
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your hacker alias..."
              maxLength={16}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-semibold transition"
            />

            {/* Avatar Picker */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Choose Avatar</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.icon)}
                    className={`h-11 rounded-xl flex items-center justify-center text-xl transition border ${
                      selectedAvatar === av.icon
                        ? "bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/20 scale-105"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setTab("create")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === "create"
                  ? "bg-gradient-to-r from-rose-600 to-sky-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CREATE MATCH
            </button>
            <button
              type="button"
              onClick={() => setTab("join")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === "join"
                  ? "bg-gradient-to-r from-sky-600 to-purple-600 text-white shadow"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Code Challenge
                </label>
                <select
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  {CHALLENGES.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} ({ch.difficulty} • {ch.bugsCount} Bugs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Match Timer
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value={5}>5 Minutes (Blitz)</option>
                    <option value={10}>10 Minutes (Standard)</option>
                    <option value={15}>15 Minutes (Tactical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mafia Saboteurs
                  </label>
                  <select
                    value={mafiaCount}
                    onChange={(e) => setMafiaCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value={1}>1 Secret Mafia</option>
                    <option value={2}>2 Secret Mafia</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!nickname.trim() || isConnecting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/25 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>CREATE MISSION LOBBY</span>
              </button>
            </form>
          )}

          {/* Join Match Panel */}
          {tab === "join" && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  6-Letter Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="E.g. JX89KZ"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sky-400 placeholder-slate-600 text-center font-mono font-extrabold text-lg tracking-widest focus:outline-none focus:border-sky-500 transition uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={!nickname.trim() || !joinCode.trim() || isConnecting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-600/25 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>CONNECT & JOIN SQUAD</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
