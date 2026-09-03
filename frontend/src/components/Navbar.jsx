import React from 'react';
import { Terminal, ShieldAlert, Copy, Check, Users, Clock, AlertTriangle, Trophy, LogOut } from 'lucide-react';
import VoiceControls from './VoiceControls';

export default function Navbar({
  room,
  player,
  timeRemainingSeconds,
  onCallMeeting,
  canCallMeeting,
  authUser,
  onOpenAuth,
  onLogout,
  onOpenLeaderboard,
  onLeaveRoom,
  isMuted = true,
  isSpeaking = false,
  onToggleMute,
  activeSpeakers = []
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 60;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#080b11]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-sky-500 p-[1px] flex items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
          <div className="h-full w-full bg-[#0d121d] rounded-[11px] flex items-center justify-center">
            <Terminal className="h-4 w-4 text-sky-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold tracking-wider font-display text-base sm:text-lg bg-gradient-to-r from-rose-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              CODE MAFIA
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
              FSD 4
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">Multiplayer Collaborative Debugging</p>
        </div>
      </div>

      {/* Center: In-Game Clock & Room Controls & Voice */}
      {room && (
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Room Code Badge */}
          <button
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-800 transition text-xs font-mono text-slate-300"
          >
            <span className="text-slate-500 hidden sm:inline">ROOM:</span>
            <span className="font-bold text-sky-400 tracking-wider">{room.code}</span>
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
          </button>

          {/* Phase Cycle Indicator (30s Coding / 15s Freeze) */}
          {room.status === "PLAYING" && (
            <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition shadow ${
              room.phase === "FREEZE"
                ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-cyan-900/30 animate-pulse"
                : "bg-emerald-950/80 border-emerald-600 text-emerald-300"
            }`}>
              <span>{room.phase === "FREEZE" ? "❄️ FREEZE:" : "⚡ SPRINT:"}</span>
              <span className="tabular-nums font-extrabold">{room.phaseTimeRemaining ?? 30}s</span>
            </div>
          )}

          {/* Game Overall Timer */}
          {timeRemainingSeconds !== undefined && room.status === "PLAYING" && (
            <div className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold ${
              isLowTime
                ? "bg-rose-950/70 border-rose-600 text-rose-300 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-200"
            }`}>
              <Clock className={`h-3 w-3 ${isLowTime ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          )}

          {/* Emergency Meeting Trigger */}
          {room.status === "PLAYING" && player?.isAlive && (
            <button
              onClick={onCallMeeting}
              disabled={!canCallMeeting}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">EMERGENCY MEETING</span>
              <span className="md:hidden">MEETING</span>
            </button>
          )}

          {/* Leave Room Button */}
          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              title="Leave Room & Return to Lobby"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition text-xs flex items-center space-x-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline font-mono font-bold">LEAVE</span>
            </button>
          )}
        </div>
      )}

      {/* Right: Voice Mic + Leaderboard + Profile */}
      <div className="flex items-center space-x-2">
        {/* Real-time Voice Chat Mic Toggle */}
        <VoiceControls
          isMuted={isMuted}
          isSpeaking={isSpeaking}
          onToggleMute={onToggleMute}
          activeSpeakers={activeSpeakers}
        />

        {/* Leaderboard Trigger Button */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          title="Open Global Agent Leaderboard"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-amber-400 transition text-xs flex items-center space-x-1 shadow-md"
        >
          <Trophy className="h-4 w-4" />
          <span className="hidden xl:inline text-xs font-mono font-bold">RANKS</span>
        </button>

        {/* Profile / Auth Status */}
        {authUser ? (
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-base select-none">{authUser.avatar || "👨‍💻"}</span>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[90px]">
                  {authUser.username || authUser.email?.split("@")[0]}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition text-xs"
            >
              Exit
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition active:scale-95 flex items-center space-x-1"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
