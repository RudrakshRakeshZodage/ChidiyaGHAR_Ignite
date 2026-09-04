import React from 'react';
import { Users, Shield, Bug, Eye, Sparkles } from 'lucide-react';
import CatTarotCard, { getCatArchetype, CAT_TAROT_ARCHETYPES } from './CatTarotCard';

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
          const isSelected = selectedSuspectId === p.id;
          const isTargetMafia = isMafia ? p.role === "MAFIA" : isSelf && p.role === "MAFIA";

          return (
            <CatTarotCard
              key={p.id || idx}
              player={{ ...p, isSelf }}
              index={idx}
              isSelected={isSelected}
              isSelectable={true}
              showRole={isMafia || isSelf}
              onClick={() => onSelectSuspect?.(p)}
              badgeText={isSelf ? "YOU" : isTargetMafia ? "MAFIA" : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

