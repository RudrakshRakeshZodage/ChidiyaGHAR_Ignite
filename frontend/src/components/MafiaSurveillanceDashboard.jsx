import React, { useState } from 'react';
import { Shield, Bug, Eye, EyeOff, Radio, Terminal, AlertTriangle, Play, Zap, CheckCircle, XCircle, X, Maximize2, Minimize2, Edit3, Send, Sparkles } from 'lucide-react';

const SABOTAGE_TEMPLATES = [
  {
    name: "Invert Boundary Check",
    description: "Flips comparison operators (> to <= or === to !==)",
    snippet: `// Sabotaged boundary\nif (subtotal <= 0 || promoCode !== "SAVE20") return 0;\n`
  },
  {
    name: "Off-by-One Array Regression",
    description: "Causes out-of-bounds array access on cart items",
    snippet: `// Sabotaged loop\nfor (let i = 0; i <= items.length; i++) { ... }\n`
  },
  {
    name: "Tax Calculation Inversion",
    description: "Multiplies rate incorrectly by subtotal minus discount",
    snippet: `// Flawed tax logic\nconst tax = (subtotal + 15) * 0.05;\n`
  }
];

export default function MafiaSurveillanceDashboard({
  isOpen,
  onClose,
  surveillanceFeed = [],
  room,
  player,
  onTamperCode
}) {
  const [selectedTargetId, setSelectedTargetId] = useState(surveillanceFeed[0]?.playerId || null);
  const [tamperBuffer, setTamperBuffer] = useState("");
  const [isTampering, setIsTampering] = useState(false);
  const [tamperSuccessToast, setTamperSuccessToast] = useState(null);

  if (!isOpen || player?.role !== "MAFIA") return null;

  const isCodingPhase = room?.phase === "CODING";
  const phaseTimeRemaining = room?.phaseTimeRemaining || 30;
  const targetWorkspace = surveillanceFeed.find(ws => ws.playerId === selectedTargetId) || surveillanceFeed[0];

  const handleOpenTamperModal = (target) => {
    setSelectedTargetId(target.playerId);
    setTamperBuffer(target.code || "");
    setIsTampering(true);
  };

  const handleExecuteTamper = () => {
    if (!selectedTargetId || !tamperBuffer) return;
    onTamperCode(selectedTargetId, tamperBuffer);
    setTamperSuccessToast(`😈 Stealth sabotage deployed into ${targetWorkspace?.playerName}'s workspace!`);
    setIsTampering(false);
    setTimeout(() => setTamperSuccessToast(null), 3000);
  };

  const handleApplyTemplate = (snippet) => {
    setTamperBuffer(prev => `${prev}\n\n${snippet}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fade-in overflow-y-auto">
      <div className="relative max-w-6xl w-full glass-card rounded-2xl p-5 sm:p-7 border border-rose-900/80 shadow-2xl space-y-6 my-auto">
        {/* Hacker scanline / ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Phase Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-900/60 pb-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-rose-950/80 border border-rose-600 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-900/30">
              <Eye className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black font-display text-white tracking-wide flex items-center space-x-2">
                  <span>MAFIA CCTV SURVEILLANCE</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-mono">
                    MULTI-FEED
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Monitoring live code workspaces of all active team members
              </p>
            </div>
          </div>

          {/* Phase Status Banner */}
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-xl border font-mono text-xs flex items-center space-x-2.5 ${
              isCodingPhase
                ? "bg-amber-950/50 border-amber-700/80 text-amber-300"
                : "bg-rose-950/60 border-rose-600 text-rose-300 shadow-lg shadow-rose-900/30 animate-pulse"
            }`}>
              <Radio className="h-4 w-4" />
              <div>
                <span className="font-extrabold uppercase block">
                  {isCodingPhase ? "🔒 Surveillance Lockout" : "😈 Sabotage Window Open"}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  {isCodingPhase ? `Developers Coding (${phaseTimeRemaining}s)` : `Inject Bugs Now (${phaseTimeRemaining}s)`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {tamperSuccessToast && (
          <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-xl animate-bounce">
            <Sparkles className="h-4 w-4 text-rose-400" />
            <span>{tamperSuccessToast}</span>
          </div>
        )}

        {/* Multi-Screen CCTV Grid */}
        {surveillanceFeed.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-sm space-y-2">
            <Terminal className="h-8 w-8 mx-auto text-slate-600 animate-pulse" />
            <p>No active developer feeds available in this mission.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveillanceFeed.map((target) => {
              const testPassed = target.testResults?.passedCount || 0;
              const testTotal = target.testResults?.totalCount || room.challenge?.testSuite?.length || 3;
              const isPassingAll = target.testResults?.allPassed;

              return (
                <div
                  key={target.playerId}
                  className="rounded-xl bg-[#090d16] border border-slate-800 hover:border-rose-700/60 p-4 flex flex-col justify-between space-y-3 transition-all relative overflow-hidden group shadow-md"
                >
                  {/* Monitor Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-lg select-none">{target.playerAvatar || "👨‍💻"}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate flex items-center space-x-1">
                          <span>{target.playerName}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-sky-950 text-sky-400 border border-sky-800">
                            DEV
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>LIVE FEED</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isPassingAll
                          ? "bg-emerald-950 border border-emerald-700 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        Tests: {testPassed}/{testTotal}
                      </span>
                    </div>
                  </div>

                  {/* Live Code Preview Window */}
                  <div className="h-40 bg-[#06080d] rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-y-auto border border-slate-900 leading-tight select-none">
                    <pre className="whitespace-pre-wrap break-all opacity-85">
                      {target.code || "// Workspace empty"}
                    </pre>
                  </div>

                  {/* Action Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleOpenTamperModal(target)}
                      disabled={isCodingPhase}
                      title={isCodingPhase ? "Tamper is locked during the 30s Developer coding phase" : "Inject stealth bugs into this developer's editor"}
                      className={`w-full py-2 rounded-lg font-mono text-xs font-extrabold transition flex items-center justify-center space-x-1.5 ${
                        isCodingPhase
                          ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                          : "bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-900/30 active:scale-95"
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isCodingPhase ? "Surveillance Mode" : "Tamper Codebase"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tamper / Sabotage Code Editor Modal */}
        {isTampering && targetWorkspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative max-w-2xl w-full glass-card rounded-2xl p-6 border border-rose-600 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400">
                    <Bug className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">
                      INJECT CODE SABOTAGE
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Targeting workspace of <strong className="text-rose-400">{targetWorkspace.playerName}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTampering(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sabotage Templates */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Stealth Sabotage Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SABOTAGE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.snippet)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-600 text-left transition"
                    >
                      <span className="text-xs font-bold text-rose-300 block">{tmpl.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tmpl.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-300 font-mono">
                  Code Payload Buffer:
                </label>
                <textarea
                  value={tamperBuffer}
                  onChange={(e) => setTamperBuffer(e.target.value)}
                  rows={9}
                  className="w-full p-3 rounded-xl bg-[#06080d] border border-slate-700 text-rose-200 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTampering(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTamper}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-extrabold font-mono shadow-lg shadow-rose-900/40 flex items-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>DEPLOY SABOTAGE NOW</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
