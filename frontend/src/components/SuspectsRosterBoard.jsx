import React from 'react';
import { Users, Shield, Bug, Eye, Sparkles } from 'lucide-react';

/**
 * 12 Illustrated Cat Mafia & Detective Character Archetypes
 */
const CAT_ROSTER_ARCHETYPES = [
  {
    id: "doctor",
    topTitle: "ЛІКАР",
    bottomTitle: "ДОКТОР",
    roleType: "DEVELOPER",
    tag: "DR. DEBUGGER",
    hat: "bowler",
    coat: "labcoat",
    prop: "stethoscope",
    furColor: "#d4b387",
    eyeColor: "#34d399",
    accessory: "glasses"
  },
  {
    id: "killer",
    topTitle: "КІЛЕР",
    bottomTitle: "КИЛЛЕР",
    roleType: "MAFIA",
    tag: "HITMAN SABOTEUR",
    hat: "none",
    coat: "suit",
    prop: "silencer",
    furColor: "#94a3b8",
    eyeColor: "#38bdf8",
    accessory: "sunglasses"
  },
  {
    id: "courtesan",
    topTitle: "КУРТИЗАНКА",
    bottomTitle: "КУРТИЗАНКА",
    roleType: "MAFIA",
    tag: "FEMME FATALE",
    hat: "feather",
    coat: "dress",
    prop: "cigarette",
    furColor: "#5c4033",
    eyeColor: "#f43f5e",
    accessory: "pearls"
  },
  {
    id: "maniac",
    topTitle: "МАНІЯК",
    bottomTitle: "МАНЬЯК",
    roleType: "MAFIA",
    tag: "CHAOS GLITCHER",
    hat: "none",
    coat: "stripes",
    prop: "axe",
    furColor: "#1e293b",
    eyeColor: "#22c55e",
    accessory: "tie"
  },
  {
    id: "mafia_don",
    topTitle: "МАФІЯ",
    bottomTitle: "МАФИЯ",
    roleType: "MAFIA",
    tag: "THE GODMOTHER",
    hat: "ruby_feather",
    coat: "red_gown",
    prop: "revolver",
    furColor: "#f8fafc",
    eyeColor: "#fbbf24",
    accessory: "necklace"
  },
  {
    id: "psychiatrist",
    topTitle: "ПСИХІАТР",
    bottomTitle: "ПСИХИАТР",
    roleType: "DEVELOPER",
    tag: "PSYCH ANALYST",
    hat: "none",
    coat: "labcoat",
    prop: "inkblot",
    furColor: "#c2884d",
    eyeColor: "#60a5fa",
    accessory: "spectacles"
  },
  {
    id: "judge",
    topTitle: "СУДДЯ",
    bottomTitle: "СУДЬЯ",
    roleType: "DEVELOPER",
    tag: "CHIEF JUSTICE",
    hat: "wig",
    coat: "robe",
    prop: "gavel",
    furColor: "#64748b",
    eyeColor: "#a78bfa",
    accessory: "bib"
  },
  {
    id: "reporter",
    topTitle: "ЖУРНАЛІСТ",
    bottomTitle: "СЛЕДОВАТЕЛЬ",
    roleType: "DEVELOPER",
    tag: "INVESTIGATOR",
    hat: "fedora",
    coat: "shirt",
    prop: "notepad",
    furColor: "#e2e8f0",
    eyeColor: "#34d399",
    accessory: "glasses"
  },
  {
    id: "tweed_dev",
    topTitle: "МИРНИЙ ДЕВ",
    bottomTitle: "МИРНЫЙ ЖИТЕЛЬ",
    roleType: "DEVELOPER",
    tag: "SENIOR ARCHITECT",
    hat: "flatcap",
    coat: "tweed",
    prop: "watch",
    furColor: "#475569",
    eyeColor: "#10b981",
    accessory: "tie"
  },
  {
    id: "pipe_sleuth",
    topTitle: "МИРНИЙ ДЕВ",
    bottomTitle: "МИРНЫЙ ЖИТЕЛЬ",
    roleType: "DEVELOPER",
    tag: "CODE DETECTIVE",
    hat: "newsboy",
    coat: "cardigan",
    prop: "pipe",
    furColor: "#9ca3af",
    eyeColor: "#38bdf8",
    accessory: "newspaper"
  },
  {
    id: "rookie_cat",
    topTitle: "МИРНИЙ ДЕВ",
    bottomTitle: "МИРНЫЙ ЖИТЕЛЬ",
    roleType: "DEVELOPER",
    tag: "ROOKIE CODER",
    hat: "none",
    coat: "overalls",
    prop: "slingshot",
    furColor: "#ea580c",
    eyeColor: "#4ade80",
    accessory: "suspenders"
  },
  {
    id: "musician_cat",
    topTitle: "МИРНИЙ ДЕВ",
    bottomTitle: "МИРНЫЙ ЖИТЕЛЬ",
    roleType: "DEVELOPER",
    tag: "SYNTH HACKER",
    hat: "none",
    coat: "blazer",
    prop: "trumpet",
    furColor: "#78350f",
    eyeColor: "#fbbf24",
    accessory: "collar"
  }
];

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

  /**
   * Render stylized illustrated Cat Mafia character portrait
   */
  const renderCatIllustration = (archetype, isTargetMafia) => {
    return (
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#182338] via-[#0e1626] to-[#080d17] flex items-center justify-center">
        {/* Vintage Background Glow */}
        <div className={`absolute inset-0 opacity-25 ${
          isTargetMafia ? "bg-radial-gradient from-rose-600 via-transparent to-black" : "bg-radial-gradient from-sky-500 via-transparent to-black"
        }`} />

        {/* SVG Cat Character Illustration */}
        <svg viewBox="0 0 120 150" className="w-full h-full max-w-[125px] max-h-[155px] drop-shadow-lg select-none">
          <defs>
            <radialGradient id={`glow-${archetype.id}`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Clothing / Torso */}
          {archetype.coat === "labcoat" && (
            <g>
              <path d="M 25 150 L 35 90 L 85 90 L 95 150 Z" fill="#e2e8f0" />
              <path d="M 45 90 L 52 150 L 68 150 L 75 90 Z" fill="#881337" />
              <path d="M 52 90 L 60 110 L 68 90 Z" fill="#ffffff" />
            </g>
          )}

          {archetype.coat === "suit" && (
            <g>
              <path d="M 25 150 L 35 90 L 85 90 L 95 150 Z" fill="#1e293b" />
              <path d="M 45 90 L 60 150 L 75 90 Z" fill="#ffffff" />
              <polygon points="57,100 63,100 60,135" fill="#991b1b" />
            </g>
          )}

          {archetype.coat === "red_gown" && (
            <g>
              <path d="M 25 150 L 38 90 L 82 90 L 95 150 Z" fill="#9f1239" />
              <circle cx="60" cy="98" r="4" fill="#fbbf24" />
            </g>
          )}

          {archetype.coat === "robe" && (
            <g>
              <path d="M 20 150 L 35 85 L 85 85 L 100 150 Z" fill="#0f172a" />
              <path d="M 52 85 L 56 120 L 64 120 L 68 85 Z" fill="#ffffff" />
            </g>
          )}

          {archetype.coat === "tweed" && (
            <g>
              <path d="M 25 150 L 35 90 L 85 90 L 95 150 Z" fill="#3f3f46" />
              <path d="M 42 90 L 50 150 L 70 150 L 78 90 Z" fill="#ca8a04" />
            </g>
          )}

          {archetype.coat === "overalls" && (
            <g>
              <path d="M 25 150 L 35 95 L 85 95 L 95 150 Z" fill="#ffffff" />
              <path d="M 40 110 L 40 150 L 80 150 L 80 110 Z" fill="#0284c7" />
              <line x1="45" y1="95" x2="45" y2="120" stroke="#0284c7" strokeWidth="4" />
              <line x1="75" y1="95" x2="75" y2="120" stroke="#0284c7" strokeWidth="4" />
            </g>
          )}

          {/* Default Jacket for other archetypes */}
          {!["labcoat", "suit", "red_gown", "robe", "tweed", "overalls"].includes(archetype.coat) && (
            <g>
              <path d="M 25 150 L 35 90 L 85 90 L 95 150 Z" fill="#1e1b4b" />
              <path d="M 50 90 L 60 130 L 70 90 Z" fill="#cbd5e1" />
            </g>
          )}

          {/* Cat Ears */}
          <polygon points="30,55 45,20 58,45" fill={archetype.furColor} stroke="#0f172a" strokeWidth="1.5" />
          <polygon points="34,50 45,26 54,43" fill="#fda4af" opacity="0.6" />

          <polygon points="90,55 75,20 62,45" fill={archetype.furColor} stroke="#0f172a" strokeWidth="1.5" />
          <polygon points="86,50 75,26 66,43" fill="#fda4af" opacity="0.6" />

          {/* Cat Head */}
          <ellipse cx="60" cy="58" rx="26" ry="24" fill={archetype.furColor} stroke="#0f172a" strokeWidth="1.5" />

          {/* Whiskers */}
          <line x1="32" y1="62" x2="10" y2="58" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          <line x1="32" y1="66" x2="12" y2="68" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          <line x1="88" y1="62" x2="110" y2="58" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          <line x1="88" y1="66" x2="108" y2="68" stroke="#ffffff" strokeWidth="1" opacity="0.8" />

          {/* Cat Eyes */}
          <ellipse cx="48" cy="54" rx="6" ry="7" fill={archetype.eyeColor} />
          <ellipse cx="72" cy="54" rx="6" ry="7" fill={archetype.eyeColor} />
          {/* Slit Pupils */}
          <ellipse cx="48" cy="54" rx="1.5" ry="5.5" fill="#050505" />
          <ellipse cx="72" cy="54" rx="1.5" ry="5.5" fill="#050505" />
          {/* Eye Sparkle */}
          <circle cx="50" cy="51" r="1.5" fill="#ffffff" />
          <circle cx="74" cy="51" r="1.5" fill="#ffffff" />

          {/* Cat Nose & Mouth */}
          <polygon points="60,65 56,61 64,61" fill="#f43f5e" />
          <path d="M 56 66 Q 60 70 64 66" fill="none" stroke="#000000" strokeWidth="1.2" />

          {/* Specific Hats & Accessories */}
          {archetype.hat === "bowler" && (
            <g>
              <ellipse cx="60" cy="36" rx="22" ry="5" fill="#18181b" />
              <path d="M 44 35 Q 60 12 76 35 Z" fill="#18181b" />
            </g>
          )}

          {archetype.hat === "fedora" && (
            <g>
              <ellipse cx="60" cy="38" rx="26" ry="6" fill="#1e293b" />
              <path d="M 40 37 Q 60 16 80 37 Z" fill="#1e293b" />
              <rect x="42" y="33" width="36" height="4" fill="#be123c" />
            </g>
          )}

          {archetype.hat === "wig" && (
            <g>
              <path d="M 32 45 Q 60 10 88 45 Q 94 85 84 85 Q 80 60 75 50 Q 45 50 40 60 Q 36 85 26 85 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            </g>
          )}

          {archetype.hat === "ruby_feather" && (
            <g>
              <path d="M 40 30 Q 30 10 25 2 Q 40 15 48 30 Z" fill="#e11d48" />
              <circle cx="48" cy="30" r="4" fill="#fbbf24" />
            </g>
          )}

          {archetype.accessory === "sunglasses" && (
            <g>
              <rect x="40" y="49" width="16" height="10" rx="3" fill="#09090b" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="64" y="49" width="16" height="10" rx="3" fill="#09090b" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="56" y1="53" x2="64" y2="53" stroke="#38bdf8" strokeWidth="1.2" />
            </g>
          )}

          {archetype.accessory === "spectacles" && (
            <g>
              <circle cx="48" cy="54" r="9" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
              <circle cx="72" cy="54" r="9" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
              <line x1="57" y1="54" x2="63" y2="54" stroke="#ca8a04" strokeWidth="1.5" />
            </g>
          )}

          {archetype.prop === "stethoscope" && (
            <path d="M 45 92 Q 60 130 75 92 M 60 120 L 60 135" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          )}

          {archetype.prop === "gavel" && (
            <g transform="translate(68, 105) rotate(-25)">
              <rect x="0" y="0" width="8" height="24" fill="#78350f" rx="2" />
              <rect x="-6" y="-4" width="20" height="10" fill="#9a3412" rx="2" stroke="#d97706" strokeWidth="0.8" />
            </g>
          )}

          {archetype.prop === "revolver" && (
            <g transform="translate(70, 110)">
              <rect x="0" y="0" width="18" height="6" fill="#fbbf24" rx="1" />
              <rect x="2" y="6" width="6" height="12" fill="#78350f" rx="1" />
            </g>
          )}
        </svg>

        {/* Vintage paper vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/85 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="relative rounded-2xl bg-[#090e18] border-2 border-[#1c2a42] shadow-2xl p-4 sm:p-6 overflow-hidden select-none">
      {/* Dark Vintage Texture */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Top Bar: Vintage Room Code & Players Tracker */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#22334f] pb-3 mb-5">
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono tracking-widest text-amber-400 font-bold uppercase drop-shadow">
            ROOM CODE
          </span>
          <div className="relative transform -rotate-1 shadow-lg">
            <div className="px-3.5 py-1 bg-[#231b11] text-[#fcd34d] font-mono font-black text-sm tracking-widest rounded border-2 border-[#d97706] shadow-inner flex items-center space-x-1.5">
              <span className="drop-shadow-[0_1px_4px_rgba(245,158,11,0.6)]">
                {room.code || "X7K-92P"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-[#0f172a] px-3 py-1 rounded-lg border border-[#334155] text-slate-200">
            <Users className="h-3.5 w-3.5 text-amber-400" />
            <span>
              <strong className="text-amber-400">{alivePlayers}</strong> / {totalPlayers} ALIVE
            </span>
          </div>

          {isMafia && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/90 border border-rose-700 text-rose-300 animate-pulse">
              🕵️ CLICK CARD TO SURVEIL & SABOTAGE
            </span>
          )}
        </div>
      </div>

      {/* Vintage Illustrated Cat Mafia Playing Cards Deck */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {playersList.map((p, idx) => {
          const isSelf = p.id === player?.id;
          const isTargetMafia = isMafia ? p.role === "MAFIA" : isSelf && p.role === "MAFIA";
          const isSelected = selectedSuspectId === p.id;
          const isAlive = p.isAlive ?? true;

          // Pick archetype based on player ID or index
          const archetype = isTargetMafia
            ? (CAT_ROSTER_ARCHETYPES.find(a => a.id === "mafia_don") || CAT_ROSTER_ARCHETYPES[4])
            : CAT_ROSTER_ARCHETYPES[idx % CAT_ROSTER_ARCHETYPES.length];

          return (
            <div
              key={p.id || idx}
              onClick={() => onSelectSuspect?.(p)}
              className={`group relative rounded-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 ${
                isSelected
                  ? isTargetMafia
                    ? "ring-2 ring-rose-500 shadow-2xl shadow-rose-950/80 scale-[1.03]"
                    : "ring-2 ring-amber-400 shadow-2xl shadow-amber-950/80 scale-[1.03]"
                  : "hover:shadow-xl"
              }`}
            >
              {/* Card Container with Gold Inlay Borders */}
              <div className={`p-2.5 sm:p-3 rounded-xl border-2 flex flex-col justify-between transition-all relative overflow-hidden ${
                isTargetMafia
                  ? "bg-[#18080b] border-[#9f1239] shadow-lg shadow-rose-950/50"
                  : "bg-[#0b1322] border-[#b4883d] shadow-lg shadow-slate-950/60"
              }`}>
                {/* Gold Filigree Corner Accents */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d4af37] pointer-events-none" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d4af37] pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d4af37] pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d4af37] pointer-events-none" />

                {/* Top Gold Serif Title (Ukrainian / Classical Mafia Header) */}
                <div className="text-center pb-1.5 border-b border-[#2d3f5e]">
                  <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#f5c563] uppercase font-serif drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {isTargetMafia ? "МАФІЯ" : archetype.topTitle}
                  </div>
                </div>

                {/* Center Cat Portrait Frame */}
                <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-[#524128] bg-black relative my-2 shadow-inner">
                  {renderCatIllustration(archetype, isTargetMafia)}

                  {/* Ejected / Dead Overlay Stamp */}
                  {!isAlive && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-1.5 z-20">
                      <span className="text-[10px] font-black font-mono px-2.5 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 transform -rotate-12 uppercase tracking-widest shadow-2xl">
                        EJECTED
                      </span>
                    </div>
                  )}

                  {/* Quick Mafia Surveillance badge */}
                  {isMafia && !isSelf && isAlive && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 rounded px-1.5 py-0.5 text-[9px] font-mono text-rose-300 border border-rose-700 shadow-md">
                      Surveil
                    </div>
                  )}
                </div>

                {/* Bottom Gold Serif Title (Russian / Role Classification) */}
                <div className="text-center pt-1 border-t border-[#2d3f5e]">
                  <div className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#e6b85c] uppercase font-serif">
                    {isTargetMafia ? "МАФИЯ" : archetype.bottomTitle}
                  </div>
                </div>

                {/* Player Name Pill & EKG Heartbeat */}
                <div className="w-full mt-2 pt-1 border-t border-slate-800/80 text-center">
                  <div className="font-bold text-xs text-slate-100 truncate flex items-center justify-center space-x-1">
                    <span>{p.name}</span>
                    {isSelf && <span className="text-[9px] text-amber-400 font-normal">(You)</span>}
                  </div>

                  {/* Animated EKG Heartbeat */}
                  <div className="w-full h-3.5 mt-1 flex items-center justify-center relative overflow-hidden">
                    {isAlive ? (
                      <svg
                        viewBox="0 0 100 20"
                        className={`w-full h-full ${
                          isTargetMafia
                            ? "text-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.8)]"
                            : "text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.8)]"
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
                      <div className="w-full h-[2px] bg-slate-700 relative" />
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
