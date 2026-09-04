import React from 'react';
import { Users, Shield, Bug, Eye, Activity, Heart, AlertOctagon, Sparkles } from 'lucide-react';

export default function SuspectsRosterBoard({
  room,
  player,
  surveillanceFeed = [],
  onSelectSuspect,
  selectedSuspectId
}) {
  if (!room || !room.players) return null;

  const isMafia = player?.role === "MAFIA";
  const playersList = Array.isArray(room.players)
    ? room.players
    : Object.values(room.players || {});

  const totalPlayers = playersList.length;
  const alivePlayers = playersList.filter(p => p.isAlive).length;

  // Avatar portrait silhouettes mapping
  const getSuspectPhoto = (p, isTargetMafia) => {
    if (isTargetMafia) {
      return (
        <div className="w-full h-full bg-gradient-to-b from-rose-950/70 via-black to-black flex items-center justify-center relative overflow-hidden">
          {/* Noir Mafia Silhouette with Fedora Hat */}
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-rose-500/80 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            {/* Fedora Hat */}
            <path d="M 20 40 Q 50 20 80 40 L 72 32 Q 50 18 28 32 Z" fill="currentColor" opacity="0.9" />
            <path d="M 10 42 Q 50 36 90 42 Q 50 38 10 42 Z" fill="currentColor" />
            {/* Head Silhouette */}
            <circle cx="50" cy="52" r="16" fill="currentColor" opacity="0.8" />
            {/* Coat Collars */}
            <path d="M 25 90 L 35 68 L 50 78 L 65 68 L 75 90 Z" fill="currentColor" />
          </svg>
          <div className="absolute inset-0 bg-rose-900/10 mix-blend-color-dodge pointer-events-none" />
        </div>
      );
    }

    // Noir Developer Portrait Silhouette
    return (
      <div className="w-full h-full bg-gradient-to-b from-slate-900 via-[#0a0f18] to-black flex items-center justify-center relative overflow-hidden">
        <div className="text-4xl filter grayscale contrast-125 opacity-85 select-none drop-shadow-md">
          {p.avatar || "👨‍💻"}
        </div>
        {/* Gritty vignette overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="relative rounded-2xl bg-[#080b11] border-2 border-[#1c2433] shadow-2xl p-4 sm:p-5 overflow-hidden select-none">
      {/* Dark Corkboard / Steel Texture Grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#384b66_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Top Bar: Room Code Tape & Squad Count */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        {/* Masking Tape Room Code */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
            ROOM CODE
          </span>
          <div className="relative transform -rotate-1 shadow-md">
            <div className="px-3.5 py-1 bg-[#d9cfb8] text-[#1c1813] font-mono font-black text-sm tracking-widest rounded-[2px] border border-[#a89b7f] shadow-inner relative overflow-hidden flex items-center space-x-1.5">
              {/* Paper Grunge texture & tape edges */}
              <div className="absolute -left-1 -top-1 w-2 h-full bg-[#bfb49b] opacity-60 transform rotate-12" />
              <div className="absolute -right-1 -top-1 w-2 h-full bg-[#bfb49b] opacity-60 transform -rotate-12" />
              <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                {room.code || "X7K-92P"}
              </span>
            </div>
          </div>
        </div>

        {/* Players Roster Count */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
            <Users className="h-3.5 w-3.5 text-sky-400" />
            <span>
              <strong className="text-white">{alivePlayers}</strong> / {totalPlayers} PLAYERS
            </span>
          </div>

          {isMafia && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 animate-pulse">
              🕵️ CLICK CARD TO SURVEIL & SABOTAGE
            </span>
          )}
        </div>
      </div>

      {/* Suspect Polaroid Cards Horizontal Strip */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {playersList.map((p, idx) => {
          const isSelf = p.id === player?.id;
          const isTargetMafia = isMafia ? p.role === "MAFIA" : isSelf && p.role === "MAFIA";
          const isSelected = selectedSuspectId === p.id;
          const isAlive = p.isAlive ?? true;

          // Pushpin color
          const pinColor = isTargetMafia
            ? "bg-rose-600 border-rose-400 shadow-rose-600/50"
            : idx % 3 === 0
            ? "bg-emerald-600 border-emerald-400 shadow-emerald-600/50"
            : idx % 2 === 0
            ? "bg-amber-600 border-amber-400 shadow-amber-600/50"
            : "bg-sky-600 border-sky-400 shadow-sky-600/50";

          return (
            <div
              key={p.id || idx}
              onClick={() => onSelectSuspect?.(p)}
              className={`group relative rounded-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${
                isSelected
                  ? isTargetMafia
                    ? "ring-2 ring-rose-500 shadow-xl shadow-rose-950/80 scale-[1.02]"
                    : "ring-2 ring-sky-400 shadow-xl shadow-sky-950/80 scale-[1.02]"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Pushpin at top */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20">
                <div className={`h-3 w-3 rounded-full border-2 ${pinColor} shadow-md`} />
              </div>

              {/* Polaroid Frame */}
              <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition ${
                isTargetMafia
                  ? "bg-[#140608] border-rose-900/80 hover:border-rose-600 shadow-rose-950/40"
                  : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
              }`}>
                {/* Photo Mugshot Box */}
                <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-black/80 bg-black relative mb-2">
                  {getSuspectPhoto(p, isTargetMafia)}

                  {!isAlive && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-1">
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 transform -rotate-12 uppercase tracking-widest shadow-lg">
                        EJECTED
                      </span>
                    </div>
                  )}

                  {/* Surveillance quick badge */}
                  {isMafia && !isSelf && isAlive && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded px-1 text-[9px] font-mono text-rose-300 border border-rose-800">
                      Surveil
                    </div>
                  )}
                </div>

                {/* Identity Name */}
                <div className="w-full">
                  <div className="font-bold text-xs text-slate-100 truncate flex items-center justify-center space-x-1">
                    <span>{p.name}</span>
                    {isSelf && <span className="text-[10px] text-sky-400 font-normal">(You)</span>}
                  </div>

                  {/* Role Title */}
                  <div className="text-[10px] font-mono font-black tracking-wider uppercase mt-0.5">
                    {isTargetMafia ? (
                      <span className="text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]">
                        MAFIA
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        DEVELOPER
                      </span>
                    )}
                  </div>

                  {/* Animated Glowing EKG Heartbeat Pulse */}
                  <div className="w-full h-4 mt-1.5 flex items-center justify-center relative overflow-hidden">
                    {isAlive ? (
                      <svg
                        viewBox="0 0 100 20"
                        className={`w-full h-full ${
                          isTargetMafia
                            ? "text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                            : "text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]"
                        }`}
                      >
                        <path
                          d="M 0 10 L 25 10 L 32 3 L 40 18 L 48 2 L 56 16 L 62 10 L 100 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <div className="w-full h-[2px] bg-slate-700/80 relative" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
