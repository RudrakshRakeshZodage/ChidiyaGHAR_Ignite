import React, { useRef, useState, useEffect } from 'react';
import { Code, Copy, RotateCcw, Check, Sparkles, Terminal, Lock, Bug, Shield, Users, Eye, Columns, Snowflake, Flame } from 'lucide-react';
import SaboteurGlitchOverlay from './SaboteurGlitchOverlay';

export default function CodeEditor({
  code,
  snapshotBeforeCode,
  onChange,
  onReset,
  onTyping,
  player,
  phase = "CODING",
  phaseTimeRemaining = 30,
  readOnly = false,
  activeTypers = []
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);

  const isMafia = player?.role === "MAFIA";
  const isFrozen = phase === "FREEZE";
  const effectiveReadOnly = readOnly || isFrozen;

  const currentLines = (code || "").split('\n');
  const beforeLines = (snapshotBeforeCode || code || "").split('\n');

  // Auto-switch to Diff Inspector for Mafia during Code Freeze
  useEffect(() => {
    if (isMafia && isFrozen) {
      setShowDiffView(true);
    }
  }, [isMafia, isFrozen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    if (effectiveReadOnly) return;
    onChange(e.target.value);
    onTyping?.();
  };

  const handleKeyDown = (e) => {
    if (effectiveReadOnly) return;
    onTyping?.();
    // Handle Tab key inside textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);

      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={`relative flex flex-col h-full rounded-2xl bg-[#0b0f17] border shadow-2xl overflow-hidden transition ${
      isFrozen
        ? 'border-cyan-700/80 shadow-cyan-950/40'
        : isMafia
        ? 'border-rose-900/60 shadow-rose-950/20'
        : 'border-slate-800'
    }`}>
      {/* 10s Screen Blur & Glitch Overlay for Developers during Freeze */}
      {isFrozen && !isMafia && (
        <SaboteurGlitchOverlay phaseTimeRemaining={phaseTimeRemaining} />
      )}

      {/* Freeze Phase Alert Banner */}
      {isFrozen && (
        <div className="px-4 py-2 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-800/80 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center space-x-2">
            <Snowflake className="h-4 w-4 text-cyan-400 animate-spin" />
            <span className="font-extrabold uppercase tracking-wide">
              ❄️ 15s CODE FREEZE & AUDIT PHASE
            </span>
            <span className="text-cyan-400 font-mono font-bold">({phaseTimeRemaining}s left)</span>
          </div>
          <span className="text-[10px] text-cyan-300 hidden sm:inline font-mono">
            {isMafia ? "🕵️ Review Before & After Sabotage" : "🔒 Code editing paused. Run unit tests!"}
          </span>
        </div>
      )}

      {/* Editor Top Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
            <Code className="h-3.5 w-3.5 text-sky-400" />
            <span>main.js</span>
          </span>

          {/* Role-Specific Workspace Banner */}
          {player?.role && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
              isMafia
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
            }`}>
              {isMafia ? <Bug className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              <span>{isMafia ? "MAFIA WORKSPACE" : "DEV WORKSPACE"}</span>
            </span>
          )}
        </div>

        {/* Toolbar buttons & Live Typers */}
        <div className="flex items-center space-x-2">
          {/* Mafia Toggle: Before/After Diff Inspector */}
          {isMafia && (
            <button
              type="button"
              onClick={() => setShowDiffView(!showDiffView)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition border ${
                showDiffView
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
              }`}
              title="Compare original baseline code vs current code"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>{showDiffView ? "Live Editor" : "Before vs After"}</span>
            </button>
          )}

          {activeTypers.length > 0 && !isFrozen && (
            <div className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-700/80 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{activeTypers.join(", ")} is editing...</span>
            </div>
          )}

          {readOnly && (
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>GHOST (READ ONLY)</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center space-x-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {!effectiveReadOnly && (
            <button
              onClick={onReset}
              title="Reset to starter challenge code"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition text-xs flex items-center space-x-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      {showDiffView && isMafia ? (
        /* Mafia Secret Before vs After Diff Inspector */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden bg-[#070b10]">
          {/* Panel 1: Before Code Snapshot */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>ORIGINAL CODE (BEFORE SPRINT)</span>
              </span>
              <span className="text-[10px] text-slate-500">Baseline</span>
            </div>
            <div className="flex-1 flex overflow-auto p-2 font-mono text-xs text-slate-400 leading-6 bg-[#080c12]">
              <div className="select-none pr-3 text-slate-600 text-right min-w-[2.5rem] border-r border-slate-800/80 mr-2">
                {beforeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 whitespace-pre overflow-x-auto text-slate-300">{snapshotBeforeCode || code}</pre>
            </div>
          </div>

          {/* Panel 2: Current Code with Sabotage */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-3 py-1.5 bg-rose-950/80 border-b border-rose-900 text-[11px] font-mono font-bold text-rose-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span>CURRENT CODE (MUTATED / SABOTAGED)</span>
              </span>
              <span className="text-[10px] text-rose-400 font-extrabold">Live Active Code</span>
            </div>
            <div className="flex-1 flex overflow-auto p-2 font-mono text-xs text-slate-200 leading-6 bg-[#0c0910]">
              <div className="select-none pr-3 text-rose-500/50 text-right min-w-[2.5rem] border-r border-rose-900/40 mr-2">
                {currentLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 whitespace-pre overflow-x-auto text-rose-100">{code}</pre>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Collaborative Code Editor */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Line Numbers Gutter */}
          <div className="select-none py-3 px-3 bg-[#080c13] text-slate-600 font-mono text-xs text-right border-r border-slate-800/80 min-w-[3rem]">
            {currentLines.map((_, idx) => (
              <div key={idx} className="leading-6">
                {idx + 1}
              </div>
            ))}
          </div>

          {/* Live Code Input */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={effectiveReadOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder={isFrozen ? "// Codebase is frozen for 15s inspection..." : "// Collaborative codebase..."}
            className={`flex-1 p-3 bg-transparent font-mono text-xs sm:text-sm resize-none focus:outline-none leading-6 selection:bg-rose-500/30 overflow-auto whitespace-pre tab-4 ${
              isFrozen ? 'text-slate-400 cursor-not-allowed' : 'text-slate-100'
            }`}
            style={{ tabSize: 2 }}
          />
        </div>
      )}

      {/* Footer bar */}
      <div className="px-4 py-1.5 bg-[#080c13] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>
          <span>Lines: {currentLines.length}</span> • <span>Characters: {code.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-block h-2 w-2 rounded-full ${isFrozen ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-slate-400">
            {isFrozen ? "Freeze Phase Active" : "Live Collab Workspace"}
          </span>
        </div>
      </div>
    </div>
  );
}
