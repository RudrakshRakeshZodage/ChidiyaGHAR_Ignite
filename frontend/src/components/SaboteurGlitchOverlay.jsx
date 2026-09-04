import React from 'react';
import { AlertTriangle, ShieldAlert, Terminal, Zap, Bug, EyeOff } from 'lucide-react';

export default function SaboteurGlitchOverlay({ phaseTimeRemaining = 15 }) {
  // Active for the full 15-second Mafia Freeze & Tamper phase
  const glitchTimeLeft = Math.max(0, phaseTimeRemaining);
  if (glitchTimeLeft <= 0) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-none select-none overflow-hidden rounded-2xl">
      {/* Red Glitch Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-950/60 via-black/80 to-red-950/60" />
      
      {/* Cyberpunk Scanline overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

      <div className="relative max-w-sm w-full p-6 rounded-2xl bg-black/90 border border-rose-500/80 shadow-2xl shadow-rose-950/80 text-center space-y-4">
        {/* Animated Warning Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center text-3xl shadow-xl shadow-rose-600/40 animate-pulse">
            <Bug className="h-8 w-8 text-rose-400 animate-bounce" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300 font-mono text-[10px] font-black uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>SABOTEUR TAMPERING IN PROGRESS (15s)</span>
          </div>

          <h3 className="text-base sm:text-lg font-black font-display text-white tracking-wide">
            MAFIA EDITING IN THE SHADOWS
          </h3>
          <p className="text-xs text-rose-300/80 leading-relaxed">
            A Code Mafia agent has seized temporary write access. Screen encrypted for security analysis!
          </p>
        </div>

        {/* 15s Glitch Countdown Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Interference Jamming</span>
            <span className="text-rose-400 font-bold">{glitchTimeLeft}s Remaining</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-rose-900/60">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-1000"
              style={{ width: `${(glitchTimeLeft / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
