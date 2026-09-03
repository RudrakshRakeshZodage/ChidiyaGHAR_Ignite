import React from 'react';
import { Gift, Lock, Key, Sparkles, HelpCircle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function MysteryCluesDossier({
  unlockedClues = [],
  totalCluesCount = 5,
  player,
  mafiaCluesUnlockedCount = 0
}) {
  const isMafia = player?.role === "MAFIA";
  const safeUnlocked = unlockedClues || [];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#0d121d] border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4 text-purple-400" />
          <h3 className="font-bold text-sm text-white font-display tracking-wide uppercase">
            MYSTERY CIPHERS DOSSIER
          </h3>
        </div>
        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
          {isMafia ? `${mafiaCluesUnlockedCount}/${totalCluesCount} CRACKED` : `${safeUnlocked.length}/${totalCluesCount} UNLOCKED`}
        </span>
      </div>

      {/* Guide / Warning Banner */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-[11px] flex items-center space-x-2">
        {isMafia ? (
          <div className="flex items-center space-x-2 text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>Developers unlock a riddle about your alias every time they pass a unit test!</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-purple-300">
            <HelpCircle className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span>Pass automated unit tests to crack AI riddles leading to the Mafia's alias.</span>
          </div>
        )}
      </div>

      {/* Clues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isMafia ? (
          /* Mafia Perspective */
          <div className="space-y-4 py-4 text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-950/80 border border-rose-700 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/50">
              🕵️‍♂️
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Classified Identity Defense</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Developers have cracked <strong className="text-rose-400 font-mono">{mafiaCluesUnlockedCount} of {totalCluesCount}</strong> mystery riddles pointing to your username!
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 text-left space-y-1">
              <span className="font-bold text-slate-200">Saboteur Protocol:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevent developers from passing all remaining tests to stop full identity unmasking.
              </p>
            </div>
          </div>
        ) : (
          /* Developer Perspective */
          Array.from({ length: totalCluesCount }).map((_, idx) => {
            const clue = safeUnlocked.find(c => c.testIndex === idx || c.clueNumber === idx + 1);
            const isUnlocked = !!clue;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition ${
                  isUnlocked
                    ? "bg-purple-950/20 border-purple-700/60 shadow-md shadow-purple-950/20"
                    : "bg-slate-900/40 border-slate-800/80 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-6 w-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                      {isUnlocked ? "🎁" : <Lock className="h-3 w-3 text-slate-500" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {isUnlocked ? (clue.title || `Clue #${idx + 1}`) : `Mystery Box #${idx + 1}`}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {isUnlocked ? `Test Case #${idx + 1} Cleared` : `Locked (Requires Test #${idx + 1})`}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    isUnlocked
                      ? "bg-purple-900 text-purple-200 border border-purple-600"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    {isUnlocked ? "CRACKED" : "LOCKED"}
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="space-y-2 pt-1 border-t border-purple-900/50">
                    <p className="text-xs text-purple-200 font-serif italic">
                      "{clue.riddle}"
                    </p>
                    {clue.revealedSnippet && (
                      <div className="flex items-center justify-between text-[11px] font-mono bg-black/40 px-2 py-1 rounded">
                        <span className="text-slate-400">Cipher:</span>
                        <span className="font-bold text-emerald-400 tracking-wider">
                          {clue.revealedSnippet}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    Pass automated test case #{idx + 1} to reveal this AI riddle.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
