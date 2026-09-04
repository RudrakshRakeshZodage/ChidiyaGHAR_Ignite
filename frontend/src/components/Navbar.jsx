import React from 'react';
import { Terminal, ShieldAlert, Copy, Check, Users, Clock, AlertTriangle, Trophy, LogOut, Flame } from 'lucide-react';
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
  onOpenProfile,
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
    <header className="sticky top-0 z-40 w-full border-b border-[#221013] bg-[#050505]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 shadow-2xl select-none">
      {/* Brand & Logo (Rockstar Red Dead Outlaw Theme) */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center tracking-tighter">
          <span className="text-xl sm:text-2xl font-black font-['Bebas_Neue'] tracking-wider text-white">
            CODE MAFIA
          </span>
          <span className="ml-1 text-2xl font-black text-[#e31b23] font-serif">
            II
          </span>
        </div>
        <span className="hidden sm:inline text-[9px] uppercase font-mono font-black tracking-widest px-2 py-0.5 rounded bg-rose-950/70 border border-[#b91c1c] text-rose-300">
          OUTLAWS
        </span>
      </div>

      {/* Center: In-Game Clock & Room Controls & Voice */}
      {room && (
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Room Code Badge */}
          <button
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e0a0a] border border-[#d97706]/60 hover:border-[#d97706] hover:bg-[#1a0f0f] transition text-xs font-mono text-[#fcd34d] shadow-sm"
          >
            <span className="text-slate-400 hidden sm:inline">ROOM:</span>
            <span className="font-black text-[#fcd34d] tracking-widest">{room.code}</span>
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
          </button>

          {/* Phase Cycle Indicator (30s Coding / 15s Freeze) */}
          {room.status === "PLAYING" && (
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-black transition shadow-lg ${
              room.phase === "FREEZE"
                ? "bg-rose-950/90 border-[#e31b23] text-white shadow-rose-950/60 animate-pulse"
                : "bg-emerald-950/80 border-emerald-600 text-emerald-300"
            }`}>
              <span>{room.phase === "FREEZE" ? "❄️ SABOTAGE WINDOW:" : "⚡ SPRINT:"}</span>
              <span className="tabular-nums font-black">{room.phaseTimeRemaining ?? 30}s</span>
            </div>
          )}

          {/* Game Overall Timer */}
          {timeRemainingSeconds !== undefined && room.status === "PLAYING" && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border font-mono text-xs font-black ${
              isLowTime
                ? "bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse shadow-rose-950/80"
                : "bg-[#0f0e0e] border-[#332224] text-slate-200"
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#e31b23] via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-rose-900/40 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/40 uppercase tracking-wider"
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
              className="p-1.5 px-2.5 rounded-lg bg-[#0e0a0a] hover:bg-rose-950/80 border border-[#2d1b1e] hover:border-rose-700 text-slate-400 hover:text-rose-300 transition text-xs flex items-center space-x-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline font-mono font-black">LEAVE</span>
            </button>
          )}
        </div>
      )}

      {/* Right: Voice Mic + Leaderboard + Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Real-time Voice Chat Mic Toggle */}
        <VoiceControls
          isMuted={isMuted}
          isSpeaking={isSpeaking}
          onToggleMute={onToggleMute}
          activeSpeakers={activeSpeakers}
        />

        {/* Profile Dossier Trigger */}
        <button
          type="button"
          onClick={onOpenProfile}
          title="Open Your Operative Profile & Stats"
          className="p-2 rounded-xl bg-[#0e0a0a] hover:bg-[#1a0f0f] border border-[#2d1b1e] hover:border-[#e31b23]/80 text-rose-400 transition text-xs flex items-center space-x-1.5 shadow-md"
        >
          <span className="text-sm select-none">{player?.avatar || authUser?.avatar || "👨‍💻"}</span>
          <span className="hidden sm:inline text-xs font-mono font-black text-slate-200 truncate max-w-[80px]">
            {player?.name || authUser?.username || "PROFILE"}
          </span>
        </button>

        {/* Leaderboard Trigger Button */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          title="Open Global Agent Leaderboard"
          className="p-2 rounded-xl bg-[#0e0a0a] hover:bg-[#1a0f0f] border border-[#d97706]/40 hover:border-[#d97706] text-amber-400 transition text-xs flex items-center space-x-1 shadow-md"
        >
          <Trophy className="h-4 w-4 text-[#fcd34d]" />
          <span className="hidden xl:inline text-xs font-mono font-black text-[#fcd34d]">RANKS</span>
        </button>

        {/* Auth Sign In / Exit */}
        {authUser ? (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 px-3 rounded-xl bg-[#0e0a0a] hover:bg-rose-950/80 border border-[#2d1b1e] hover:border-[#e31b23] text-slate-400 hover:text-rose-300 transition text-xs font-mono font-black"
          >
            LOGOUT
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#e31b23] to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-rose-950/60 transition active:scale-95 flex items-center space-x-1 border border-red-500/40 uppercase tracking-wider"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
