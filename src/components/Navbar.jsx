import React from 'react';
import { Terminal, ShieldAlert, Copy, Check, Users, Clock, AlertTriangle } from 'lucide-react';

export default function Navbar({
  room,
  player,
  timeRemainingSeconds,
  onCallMeeting,
  canCallMeeting,
  authUser,
  onOpenAuth,
  onLogout
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#080b11]/90 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-sky-500 p-[1px] flex items-center justify-center shadow-lg shadow-rose-500/10">
          <div className="h-full w-full bg-[#0d121d] rounded-[11px] flex items-center justify-center">
            <Terminal className="h-5 w-5 text-sky-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-wider font-display text-lg bg-gradient-to-r from-rose-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              CODE MAFIA
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
              FSD 4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Multiplayer Collaborative Debugging</p>
        </div>
      </div>

      {/* Center: In-Game Clock & Room Status */}
      {room && (
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Room Code Badge */}
          <button
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-800 transition text-xs font-mono text-slate-300"
          >
            <span className="text-slate-500">ROOM:</span>
            <span className="font-bold text-sky-400 tracking-wider">{room.code}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          </button>

          {/* Game Timer */}
          {timeRemainingSeconds !== undefined && room.status === "PLAYING" && (
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
              isLowTime
                ? "bg-rose-950/70 border-rose-600 text-rose-300 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-200"
            }`}>
              <Clock className={`h-3.5 w-3.5 ${isLowTime ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          )}

          {/* Emergency Meeting Trigger */}
          {room.status === "PLAYING" && player?.isAlive && (
            <button
              onClick={onCallMeeting}
              disabled={!canCallMeeting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">EMERGENCY MEETING</span>
              <span className="sm:hidden">MEETING</span>
            </button>
          )}
        </div>
      )}

      {/* Right: Player Profile / Auth Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {authUser ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-lg select-none">{authUser.avatar || "👨‍💻"}</span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">
                  {authUser.username || authUser.email?.split("@")[0]}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  {authUser.email}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition text-xs"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition active:scale-95 flex items-center space-x-1.5"
          >
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
}
