import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Vote, Check, ShieldAlert, X } from 'lucide-react';

export default function VotingModal({
  room,
  player,
  onCastVote,
  onSkipVote
}) {
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(room?.meeting?.durationSeconds || 45);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (room?.status !== "VOTING") return null;

  const playersList = Object.values(room.players || {});
  const alivePlayers = playersList.filter(p => p.isAlive);
  const isAlive = player?.isAlive;
  const hasVoted = player?.hasVoted;

  const handleVote = () => {
    if (!selectedTargetId) return;
    onCastVote(selectedTargetId);
  };

  const handleSkip = () => {
    onCastVote("SKIP");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl shadow-rose-950/50 space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display tracking-wider text-white">
                EMERGENCY MEETING
              </h2>
              <p className="text-xs text-slate-400">
                Called by <span className="text-rose-400 font-bold">{room.meeting?.callerName || "Team"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-300 font-mono text-sm font-bold self-start sm:self-auto">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s REMAINING</span>
          </div>
        </div>

        {/* Voting Instructions */}
        <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <span>Who is the Code Mafia saboteur altering our logic?</span>
          {hasVoted && (
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Check className="h-3.5 w-3.5" />
              <span>Vote Submitted</span>
            </span>
          )}
        </div>

        {/* Suspect Candidate Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alivePlayers.map((p) => {
            const isMe = p.id === player?.id;
            const isSelected = selectedTargetId === p.id;

            return (
              <button
                key={p.id}
                type="button"
                disabled={!isAlive || hasVoted}
                onClick={() => setSelectedTargetId(p.id)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                  isSelected
                    ? "bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/50 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                } ${(!isAlive || hasVoted) ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow">
                    {p.avatar || "👨‍💻"}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200 flex items-center space-x-1">
                      <span>{p.name}</span>
                      {isMe && <span className="text-[10px] text-sky-400 font-normal">(You)</span>}
                    </div>
                    <span className="text-[10px] text-slate-500">Active Suspect</span>
                  </div>
                </div>

                {p.hasVoted && (
                  <div className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                    Voted
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Vote Actions */}
        {isAlive && !hasVoted && (
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition"
            >
              SKIP VOTE (INSUFFICIENT PROOF)
            </button>

            <button
              onClick={handleVote}
              disabled={!selectedTargetId}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-xl shadow-rose-600/30 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Vote className="h-4 w-4" />
              <span>CONFIRM EJECTION VOTE</span>
            </button>
          </div>
        )}

        {!isAlive && (
          <div className="text-center py-2 text-rose-400 text-xs font-semibold">
            You were eliminated. Ghosts cannot vote!
          </div>
        )}
      </div>
    </div>
  );
}
