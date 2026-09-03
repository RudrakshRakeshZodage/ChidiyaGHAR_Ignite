import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Key, Search, ChevronRight, X, Cpu, ShieldAlert, Award } from 'lucide-react';

export default function MysteryBoxModal({ clue, onClose, onOpenDossier }) {
  const [isOpening, setIsOpening] = useState(true);

  useEffect(() => {
    // Confetti burst on mystery box reveal
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#ec4899', '#38bdf8', '#fbbf24']
    });

    const timer = setTimeout(() => {
      setIsOpening(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [clue]);

  if (!clue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/60 shadow-2xl shadow-purple-950/60 text-center space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mystery Box Header Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/80 text-xs font-mono font-bold tracking-widest uppercase text-purple-300">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
          <span>🎁 MYSTERY CIPHER CRACKED!</span>
        </div>

        {/* 3D Mystery Box Opening Graphic */}
        <div className="flex justify-center">
          <div className={`h-24 w-24 rounded-3xl bg-gradient-to-tr from-purple-900 via-fuchsia-900 to-indigo-900 border-2 border-purple-400/80 flex items-center justify-center text-5xl shadow-2xl shadow-purple-600/40 transition-all duration-700 ${
            isOpening ? 'scale-110 rotate-12 animate-bounce' : 'scale-100 rotate-0'
          }`}>
            🎁
          </div>
        </div>

        {/* Riddle Content Card */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-slate-400">
              CLUE #{clue.clueNumber || (clue.testIndex + 1)} • {clue.title || "Identity Trace"}
            </span>
            <h2 className="text-lg sm:text-xl font-black font-display text-white">
              AI Identity Riddle
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-800/60 text-left space-y-3">
            <p className="text-xs sm:text-sm text-purple-200 font-serif italic leading-relaxed">
              "{clue.riddle}"
            </p>

            {/* Revealed Letter Mask Snippet */}
            {clue.revealedSnippet && (
              <div className="pt-2 border-t border-purple-900/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Cipher Mask:</span>
                <span className="font-mono font-black text-sm tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700">
                  {clue.revealedSnippet}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>COLLECT TO DOSSIER</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
