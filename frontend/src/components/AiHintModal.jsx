import React, { useState } from 'react';
import { Sparkles, Lightbulb, AlertTriangle, X, Check, Copy, ChevronRight, Lock, Code2, ShieldAlert } from 'lucide-react';

export default function AiHintModal({
  isOpen,
  onClose,
  onRequestHint,
  hintData,
  isLoading,
  hasUsedHint,
  mysteryBoxForfeited
}) {
  const [hasCopied, setHasCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (hintData?.codeClue) {
      navigator.clipboard.writeText(hintData.codeClue);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleConfirmRequest = () => {
    setShowConfirm(false);
    onRequestHint?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative max-w-lg w-full rounded-2xl p-5 sm:p-7 bg-[#0a0506] border-2 border-[#2d1215] shadow-2xl shadow-rose-950/80 space-y-5 overflow-hidden">
        
        {/* Ambient Outlaw Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e31b23]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2d1215] pb-3.5 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-600 via-red-900 to-black p-[2px] shadow-lg shadow-amber-950/80 flex items-center justify-center">
              <div className="h-full w-full bg-[#0a0506] rounded-[14px] flex items-center justify-center text-amber-400 border border-amber-800/40">
                <Lightbulb className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Bebas_Neue'] text-white tracking-wider">
                  AI TACTICAL HINT
                </h2>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 font-black tracking-widest">
                  1x PER MISSION
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                OpenRouter AI Coding Advisor & Logic Diagnostics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 relative z-10">
          
          {/* STATE 1: Already has Hint Data */}
          {hintData ? (
            <div className="space-y-4">
              {/* Penalty Notice Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/80 to-black border border-rose-800/80 flex items-center space-x-2.5 text-xs text-rose-300 font-mono">
                <AlertTriangle className="h-4 w-4 text-[#e31b23] shrink-0 animate-pulse" />
                <span>
                  <strong>TRADE-OFF ACTIVATED:</strong> Mystery Box rewards and identity riddles are forfeited for this mission.
                </span>
              </div>

              {/* Tactical Hint Card */}
              <div className="p-4 rounded-xl bg-black border border-[#2d1215] space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#2d1215] pb-2">
                  <span className="font-['Bebas_Neue'] text-lg text-[#fcd34d] tracking-wide flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{hintData.title || "Tactical Logic Clue"}</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                    Active Intel
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-line">
                  {hintData.hint}
                </p>

                {/* Optional Code Clue Snippet */}
                {hintData.codeClue && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Code2 className="h-3 w-3 text-amber-400" />
                        <span>CODE PATTERN REFERENCE:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="text-amber-400 hover:text-white flex items-center space-x-1 transition"
                      >
                        {hasCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{hasCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#070506] border border-[#2d1215] font-mono text-xs text-amber-300 overflow-x-auto leading-5">
                      {hintData.codeClue}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : showConfirm ? (
            /* STATE 2: Confirmation Warning Dialog */
            <div className="p-4 rounded-xl bg-black border-2 border-[#e31b23] space-y-4 shadow-xl shadow-rose-950/40 animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-rose-950 border border-[#e31b23] text-[#e31b23] shrink-0 mt-0.5">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-['Bebas_Neue'] text-lg text-white tracking-wide">
                    CONFIRM 1-TIME AI HINT ACTIVATION
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    Using this AI hint will diagnose your current bugs and offer tactical logic clues, but <strong className="text-[#e31b23]">you will NOT receive any Mystery Boxes or identity clues</strong> for the remainder of this mission.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#140b0d] border border-[#2d1215] text-slate-300 hover:text-white font-mono text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRequest}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#e31b23] to-red-800 hover:from-red-600 hover:to-red-900 text-white font-['Bebas_Neue'] tracking-wider text-base shadow-lg shadow-rose-950/80 transition flex items-center justify-center space-x-1.5"
                >
                  {isLoading ? (
                    <span>CONSULTING AI...</span>
                  ) : (
                    <span>CONFIRM & FORFEIT BOX</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STATE 3: Prompt to Request Hint */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black border border-[#2d1215] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Stuck on failing test suites or subtle logic bugs?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  The AI Tactical Advisor can scan your active workspace code, test errors, and challenge parameters to deliver pinpoint debugging advice for this round.
                </p>

                {/* Heavy Warning Box */}
                <div className="p-3 rounded-lg bg-[#140507] border border-[#e31b23]/60 text-[11px] font-mono text-rose-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-[#e31b23]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>MYSTERY BOX FORFEIT PENALTY</span>
                  </div>
                  <p>
                    Activating your 1x AI Hint removes Mystery Box unboxings and disables Mafia identity riddle drops for this mission.
                  </p>
                </div>
              </div>

              {hasUsedHint ? (
                <div className="p-3 rounded-xl bg-[#140b0d] border border-[#2d1215] text-center text-xs font-mono text-slate-500 flex items-center justify-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>1x AI Hint charge has already been consumed for this mission</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#e31b23] to-red-800 hover:from-amber-500 hover:to-red-700 text-white font-['Bebas_Neue'] tracking-wider text-lg shadow-xl shadow-rose-950/80 transition active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <Lightbulb className="h-5 w-5 fill-amber-300 text-amber-300" />
                  <span>USE 1-TIME AI TACTICAL HINT</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-300 hover:text-white font-mono text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
