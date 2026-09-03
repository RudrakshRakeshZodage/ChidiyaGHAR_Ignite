import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, Shield, Award, Users } from 'lucide-react';

export default function GameOverModal({ room, player, onPlayAgain }) {
  if (room?.status !== "GAME_OVER") return null;

  const isDevWin = room.winner === "DEVELOPERS";
  const myRole = player?.role;
  const isMyTeamWinner = (isDevWin && myRole === "DEVELOPER") || (!isDevWin && myRole === "MAFIA");

  useEffect(() => {
    if (isMyTeamWinner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isMyTeamWinner]);

  const playersList = Object.values(room.players || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-xl w-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 text-center">
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isDevWin ? "bg-emerald-500/20" : "bg-rose-500/20"
        }`} />

        {/* Winner Banner */}
        <div>
          <div className="flex justify-center mb-3">
            <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner border ${
              isDevWin
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                : "bg-rose-950/80 border-rose-500 text-rose-300"
            }`}>
              {isDevWin ? <Trophy className="h-10 w-10 text-amber-400" /> : <Skull className="h-10 w-10 text-rose-400" />}
            </div>
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            MATCH RESOLUTION
          </span>
          <h1 className={`text-3xl sm:text-4xl font-black font-display tracking-wider mt-1 ${
            isDevWin ? "text-emerald-400" : "text-rose-400"
          }`}>
            {isDevWin ? "DEVELOPERS VICTORY" : "CODE MAFIA VICTORY"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            {room.winReason || (isDevWin ? "Application was successfully stabilized!" : "Sabotage successful!")}
          </p>
        </div>

        {/* Unmasked Identities */}
        <div className="text-left space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Identity Unmasking</span>
            <span>Role Alignment</span>
          </div>

          <div className="space-y-2">
            {playersList.map((p) => {
              const isMafia = p.role === "MAFIA";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">{p.avatar || "👨‍💻"}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-200">
                        {p.name} {p.id === player?.id && <span className="text-sky-400 font-normal">(You)</span>}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {p.isAlive ? "Survived" : "Ejected"}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isMafia
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}>
                    {isMafia ? "🕵️ Code Mafia" : "👨‍💻 Developer"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-purple-600 to-rose-600 hover:from-sky-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition active:scale-95 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>RETURN TO LOBBY</span>
        </button>
      </div>
    </div>
  );
}
