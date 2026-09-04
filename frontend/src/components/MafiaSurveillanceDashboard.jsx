import React, { useState } from 'react';
import { Shield, Bug, Eye, Radio, Terminal, AlertTriangle, Play, Zap, CheckCircle, XCircle, X, Edit3, Send, Sparkles, Code, Check } from 'lucide-react';
import SuspectsRosterBoard from './SuspectsRosterBoard';

const SABOTAGE_TEMPLATES = [
  {
    name: "Invert Boundary Check",
    description: "Flips comparison operators (> to <= or === to !==)",
    snippet: `// Sabotaged boundary\nif (subtotal <= 0 || promoCode !== "SAVE20") return 0;\n`
  },
  {
    name: "Off-by-One Array Error",
    description: "Causes out-of-bounds access on cart arrays",
    snippet: `// Sabotaged loop\nfor (let i = 0; i <= items.length; i++) { ... }\n`
  },
  {
    name: "Tax Formula Inversion",
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
  const [isEditingCustomCode, setIsEditingCustomCode] = useState(false);
  const [tamperSuccessToast, setTamperSuccessToast] = useState(null);

  if (!isOpen || player?.role !== "MAFIA") return null;

  const isCodingPhase = room?.phase === "CODING";
  const phaseTimeRemaining = room?.phaseTimeRemaining || 30;

  // Active targeted workspace
  const activeWorkspace = surveillanceFeed.find(ws => ws.playerId === selectedTargetId) || surveillanceFeed[0];

  const handleSelectSuspectCard = (targetPlayer) => {
    if (!targetPlayer || targetPlayer.id === player?.id) return;
    setSelectedTargetId(targetPlayer.id);
    const ws = surveillanceFeed.find(w => w.playerId === targetPlayer.id);
    if (ws) {
      setTamperBuffer(ws.code || "");
    }
  };

  const handleExecuteTamper = (codeToSend) => {
    const code = codeToSend || tamperBuffer || activeWorkspace?.code;
    const targetId = selectedTargetId || activeWorkspace?.playerId;
    if (!targetId || !code) return;

    onTamperCode(targetId, code);
    setTamperSuccessToast(`😈 Stealth sabotage injected into ${activeWorkspace?.playerName || 'target'}'s workspace!`);
    setIsEditingCustomCode(false);
    setTimeout(() => setTamperSuccessToast(null), 3000);
  };

  const handleApplyTemplate = (snippet) => {
    const current = tamperBuffer || activeWorkspace?.code || "";
    const updated = `${current}\n\n${snippet}`;
    setTamperBuffer(updated);
    setIsEditingCustomCode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative max-w-6xl w-full glass-card rounded-2xl p-5 sm:p-7 border-2 border-rose-900/80 shadow-2xl space-y-5 my-auto">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-900/60 pb-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-900/40">
              <Eye className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white tracking-wide flex items-center space-x-2">
                <span>MAFIA SURVEILLANCE & SABOTAGE DESK</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Click any operative below to inspect their code and deploy sabotage
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Phase Status Banner */}
            <div className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs flex items-center space-x-2 ${
              isCodingPhase
                ? "bg-amber-950/60 border-amber-700 text-amber-300"
                : "bg-rose-950/70 border-rose-600 text-rose-300 animate-pulse shadow-lg shadow-rose-950/60"
            }`}>
              <Radio className="h-4 w-4" />
              <div>
                <span className="font-extrabold uppercase block text-[11px]">
                  {isCodingPhase ? "🔒 Surveillance Lockout" : "😈 Sabotage Window Open"}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  {isCodingPhase ? `Devs Coding (${phaseTimeRemaining}s)` : `Inject Bugs Now (${phaseTimeRemaining}s)`}
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

        {/* Crime Board Suspect Photo Strip */}
        <SuspectsRosterBoard
          room={room}
          player={player}
          surveillanceFeed={surveillanceFeed}
          onSelectSuspect={handleSelectSuspectCard}
          selectedSuspectId={selectedTargetId || activeWorkspace?.playerId}
        />

        {/* Selected Developer Workspace Surveillance Screen */}
        {activeWorkspace ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-xl bg-[#070a10] border border-rose-900/60 p-4 shadow-inner">
            {/* Left: Code Viewer / Live Editor (8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
                  <Code className="h-4 w-4 text-sky-400" />
                  <span>
                    Live Terminal: <strong className="text-white">{activeWorkspace.playerName}</strong>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    🟢 LIVE STREAM
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-400">
                  <span>Tests Passing: </span>
                  <strong className="text-emerald-400">
                    {activeWorkspace.testResults?.passedCount || 0} / {room.challenge?.testSuite?.length || 3}
                  </strong>
                </div>
              </div>

              {/* Code Textarea / Preview */}
              <div className="relative">
                <textarea
                  value={isEditingCustomCode ? tamperBuffer : (activeWorkspace.code || "")}
                  onChange={(e) => {
                    setTamperBuffer(e.target.value);
                    setIsEditingCustomCode(true);
                  }}
                  disabled={isCodingPhase}
                  rows={12}
                  className={`w-full p-3.5 rounded-xl bg-[#04060a] border font-mono text-xs leading-relaxed focus:outline-none transition ${
                    isCodingPhase
                      ? "text-slate-400 border-slate-800 cursor-not-allowed select-none"
                      : "text-rose-200 border-rose-700/80 focus:border-rose-500 shadow-inner"
                  }`}
                  placeholder="// Operative codebase stream..."
                />
                {isCodingPhase && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
                    🔒 READ ONLY (SURVEILLANCE)
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stealth Sabotage Presets & Actions (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-rose-400 block">
                  ⚡ 1-Click Sabotage Presets:
                </span>
                <div className="space-y-2">
                  {SABOTAGE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isCodingPhase}
                      onClick={() => handleApplyTemplate(tmpl.snippet)}
                      className={`w-full p-2.5 rounded-xl border text-left transition ${
                        isCodingPhase
                          ? "bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-rose-950/30 border-rose-900 hover:border-rose-600 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-rose-300">{tmpl.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tmpl.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deploy Button */}
              <button
                type="button"
                onClick={() => handleExecuteTamper()}
                disabled={isCodingPhase}
                className={`w-full py-3 rounded-xl font-mono text-xs font-extrabold transition flex items-center justify-center space-x-2 ${
                  isCodingPhase
                    ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-xl shadow-rose-950/60 active:scale-95 animate-pulse"
                }`}
              >
                <Send className="h-4 w-4" />
                <span>
                  {isCodingPhase
                    ? `TAMPER LOCKED (${phaseTimeRemaining}s)`
                    : `INJECT CODE SABOTAGE`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No active developers detected in surveillance stream.
          </div>
        )}
      </div>
    </div>
  );
}
