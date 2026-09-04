import React, { useRef, useState, useEffect } from 'react';
import { 
  Code, Copy, RotateCcw, Check, Sparkles, Terminal, Lock, 
  Bug, Shield, Users, Eye, Columns, Snowflake, Flame, 
  Plus, Trash2, FileText, Play, LayoutGrid, Terminal as TerminalIcon,
  Lightbulb
} from 'lucide-react';
import SaboteurGlitchOverlay from './SaboteurGlitchOverlay';
import TerminalConsole from './TerminalConsole';

export default function CodeEditor({
  code,
  files: initialFiles,
  language = "python",
  snapshotBeforeCode,
  onChange,
  onReset,
  onTyping,
  player,
  phase = "CODING",
  phaseTimeRemaining = 30,
  readOnly = false,
  activeTypers = [],
  onOpenSurveillance,
  onRunTests,
  testResults,
  onOpenAiHint,
  hasUsedAiHint = false,
  activeAiHint = null
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [editorMode, setEditorMode] = useState("editor"); // 'editor' | 'terminal' | 'split'

  // Multi-File Project State
  const [filesMap, setFilesMap] = useState(() => {
    if (initialFiles && typeof initialFiles === "object" && Object.keys(initialFiles).length > 0) {
      return initialFiles;
    }
    const ext = language === "python" ? "py" : language === "sql" ? "sql" : language === "typescript" ? "ts" : "js";
    return {
      [`main.${ext}`]: code || ""
    };
  });

  const [activeFile, setActiveFile] = useState(() => {
    if (initialFiles && typeof initialFiles === "object") {
      return Object.keys(initialFiles)[0] || "main.py";
    }
    const ext = language === "python" ? "py" : language === "sql" ? "sql" : language === "typescript" ? "ts" : "js";
    return `main.${ext}`;
  });

  // Sync external code update to active file
  useEffect(() => {
    if (code !== undefined) {
      setFilesMap(prev => ({
        ...prev,
        [activeFile]: code
      }));
    }
  }, [code, activeFile]);

  // Sync initialFiles if challenge updates
  useEffect(() => {
    if (initialFiles && typeof initialFiles === "object" && Object.keys(initialFiles).length > 0) {
      setFilesMap(initialFiles);
      if (!initialFiles[activeFile]) {
        setActiveFile(Object.keys(initialFiles)[0]);
      }
    }
  }, [initialFiles]);

  const isMafia = player?.role === "MAFIA";
  const isFrozen = phase === "FREEZE";
  const isMafiaLocked = isMafia && !isFrozen;
  const effectiveReadOnly = readOnly || (isFrozen && !isMafia) || isMafiaLocked;

  const currentCode = filesMap[activeFile] ?? (code || "");
  const currentLines = currentCode.split('\n');
  const beforeLines = (snapshotBeforeCode || currentCode).split('\n');

  const handleSelectFile = (fileName) => {
    setActiveFile(fileName);
    const content = filesMap[fileName] || "";
    onChange?.(content, fileName, filesMap);
  };

  const handleAddNewFile = () => {
    const ext = language === "python" ? "py" : language === "sql" ? "sql" : language === "typescript" ? "ts" : "js";
    const name = prompt(`Enter new file name (e.g. helper_${Object.keys(filesMap).length + 1}.${ext}):`, `module_${Object.keys(filesMap).length + 1}.${ext}`);
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    if (filesMap[trimmed]) {
      alert("File already exists!");
      return;
    }

    const updated = {
      ...filesMap,
      [trimmed]: language === "sql" ? `-- SQL Module: ${trimmed}\n` : `// Module: ${trimmed}\n`
    };
    setFilesMap(updated);
    setActiveFile(trimmed);
    onChange?.(updated[trimmed], trimmed, updated);
  };

  const handleDeleteFile = (fileName, e) => {
    e.stopPropagation();
    if (Object.keys(filesMap).length <= 1) {
      alert("Project must retain at least one file.");
      return;
    }
    if (!confirm(`Delete ${fileName}?`)) return;

    const updated = { ...filesMap };
    delete updated[fileName];
    setFilesMap(updated);
    const nextActive = Object.keys(updated)[0];
    setActiveFile(nextActive);
    onChange?.(updated[nextActive], nextActive, updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    if (effectiveReadOnly) return;
    const newContent = e.target.value;
    const updated = {
      ...filesMap,
      [activeFile]: newContent
    };
    setFilesMap(updated);
    onChange?.(newContent, activeFile, updated);
    onTyping?.();
  };

  const handleKeyDown = (e) => {
    if (effectiveReadOnly) return;
    onTyping?.();
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = currentCode.substring(0, start) + "  " + currentCode.substring(end);
      const updated = { ...filesMap, [activeFile]: newCode };
      setFilesMap(updated);
      onChange?.(newCode, activeFile, updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const getLanguageBadge = () => {
    switch (language?.toLowerCase()) {
      case "python": return { label: "Python", icon: "🐍", color: "text-amber-400 bg-amber-950/60 border-amber-800" };
      case "sql": return { label: "SQL", icon: "🗄️", color: "text-sky-400 bg-sky-950/60 border-sky-800" };
      case "typescript": return { label: "TypeScript", icon: "🔷", color: "text-blue-400 bg-blue-950/60 border-blue-800" };
      case "cpp": return { label: "C++", icon: "⚙️", color: "text-indigo-400 bg-indigo-950/60 border-indigo-800" };
      case "java": return { label: "Java", icon: "☕", color: "text-orange-400 bg-orange-950/60 border-orange-800" };
      default: return { label: "JavaScript", icon: "⚡", color: "text-yellow-400 bg-yellow-950/60 border-yellow-800" };
    }
  };

  const langBadge = getLanguageBadge();

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

      {/* Mafia Surveillance Lockout Banner */}
      {isMafia && !isFrozen && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-800/80 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-wide">
              🔒 SURVEILLANCE ONLY (Developers Coding - {phaseTimeRemaining}s left)
            </span>
          </div>
          {onOpenSurveillance && (
            <button
              type="button"
              onClick={onOpenSurveillance}
              className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold transition flex items-center space-x-1 shadow-md"
            >
              <span>OPEN CCTV FEEDS</span>
            </button>
          )}
        </div>
      )}

      {/* Freeze Phase Alert Banner */}
      {isFrozen && (
        <div className="px-4 py-2 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-800/80 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center space-x-2">
            <Snowflake className="h-4 w-4 text-cyan-400 animate-spin" />
            <span className="font-extrabold uppercase tracking-wide">
              {isMafia ? "😈 15s SABOTAGE WINDOW ACTIVE" : "❄️ 15s CODE FREEZE & AUDIT PHASE"}
            </span>
            <span className="text-cyan-400 font-mono font-bold">({phaseTimeRemaining}s left)</span>
          </div>
          {isMafia && onOpenSurveillance && (
            <button
              type="button"
              onClick={onOpenSurveillance}
              className="px-2.5 py-0.5 rounded bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 text-white font-mono text-[11px] font-extrabold transition flex items-center space-x-1 shadow-md shadow-rose-950/40 animate-bounce"
            >
              <Bug className="h-3 w-3" />
              <span>INJECT SABOTAGE NOW</span>
            </button>
          )}
        </div>
      )}

      {/* MULTI-FILE TAB BAR */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1 bg-[#070a12] border-b border-slate-800 overflow-x-auto">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {Object.keys(filesMap).map((fileName) => {
            const isActive = fileName === activeFile;
            return (
              <button
                key={fileName}
                type="button"
                onClick={() => handleSelectFile(fileName)}
                className={`group px-3 py-1.5 rounded-t-lg border-t border-x text-xs font-mono font-bold flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-[#0d131f] border-slate-700 text-sky-400 shadow'
                    : 'bg-[#060910] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a0e18]'
                }`}
              >
                <FileText className={`h-3.5 w-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{fileName}</span>
                {Object.keys(filesMap).length > 1 && (
                  <span
                    onClick={(e) => handleDeleteFile(fileName, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 text-[10px] ml-1 transition"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddNewFile}
            title="Create new modular file in workspace"
            className="px-2 py-1 rounded text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span className="text-[10px]">File</span>
          </button>
        </div>

        {/* Language Badge, AI Hint & View Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* 1x AI Tactical Hint Trigger */}
          {onOpenAiHint && (
            <button
              type="button"
              onClick={onOpenAiHint}
              title={activeAiHint ? "View Active AI Tactical Hint" : hasUsedAiHint ? "AI Hint already used for this mission" : "Activate 1-time AI Tactical Hint (Forfeits Mystery Box)"}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 transition border ${
                activeAiHint
                  ? "bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 animate-pulse"
                  : hasUsedAiHint
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-pointer hover:border-slate-700"
                  : "bg-gradient-to-r from-amber-600 to-[#e31b23] border-amber-400 text-white shadow-md shadow-rose-950/60 hover:brightness-110 active:scale-95"
              }`}
            >
              <Lightbulb className={`h-3.5 w-3.5 ${activeAiHint ? "text-amber-400 fill-amber-400" : hasUsedAiHint ? "text-slate-500" : "text-amber-200 fill-amber-200"}`} />
              <span className="hidden sm:inline">
                {activeAiHint ? "AI Hint: Active" : hasUsedAiHint ? "AI Hint (Used)" : "AI Hint (1x)"}
              </span>
            </button>
          )}

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center space-x-1 ${langBadge.color}`}>
            <span>{langBadge.icon}</span>
            <span>{langBadge.label}</span>
          </span>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#090e18] p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setEditorMode("editor")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${editorMode === 'editor' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("terminal")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center space-x-1 ${editorMode === 'terminal' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
            >
              <TerminalIcon className="h-3 w-3 text-emerald-400" />
              <span>Terminal</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("split")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${editorMode === 'split' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
            >
              Split
            </button>
          </div>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* VIEW 1: Code Editor & Diff Inspector */}
        {(editorMode === "editor" || editorMode === "split") && (
          <div className="flex-1 flex overflow-hidden relative">
            {showDiffView && isMafia ? (
              /* Diff Inspector */
              <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-hidden bg-[#070b10]">
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-3 py-1 bg-slate-900 text-[10px] font-mono text-slate-400 font-bold">
                    BASELINE ({activeFile})
                  </div>
                  <div className="flex-1 flex overflow-auto p-2 font-mono text-xs text-slate-400 leading-6 bg-[#080c12]">
                    <div className="select-none pr-3 text-slate-600 text-right min-w-[2.5rem] border-r border-slate-800/80 mr-2">
                      {beforeLines.map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <pre className="flex-1 whitespace-pre overflow-x-auto text-slate-300">{snapshotBeforeCode || currentCode}</pre>
                  </div>
                </div>

                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-3 py-1 bg-rose-950/80 text-[10px] font-mono text-rose-300 font-bold">
                    MUTATED ({activeFile})
                  </div>
                  <div className="flex-1 flex overflow-auto p-2 font-mono text-xs text-rose-300 leading-6 bg-[#0c0507]">
                    <div className="select-none pr-3 text-rose-700/80 text-right min-w-[2.5rem] border-r border-rose-900/60 mr-2">
                      {currentLines.map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <pre className="flex-1 whitespace-pre overflow-x-auto text-rose-200">{currentCode}</pre>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Code Editor */
              <div className="flex-1 flex overflow-hidden bg-[#070b12]">
                {/* Line Numbers */}
                <div className="select-none py-3 px-3 text-slate-600 font-mono text-xs text-right min-w-[3rem] border-r border-slate-800/80 bg-[#060910] leading-6">
                  {currentLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={currentCode}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={effectiveReadOnly}
                  spellCheck="false"
                  className={`flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto whitespace-pre tab-2 ${
                    effectiveReadOnly ? 'cursor-not-allowed text-slate-400' : ''
                  }`}
                  placeholder={`// Enter ${language} code for ${activeFile}...`}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Interactive Terminal Console */}
        {(editorMode === "terminal" || editorMode === "split") && (
          <div className={`${editorMode === 'split' ? 'h-64 border-t border-slate-800' : 'flex-1'} overflow-hidden`}>
            <TerminalConsole
              testResults={testResults}
              onRunCode={onRunTests}
              onRunTests={onRunTests}
              activeFileName={activeFile}
              language={language}
            />
          </div>
        )}

      </div>

      {/* Editor Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#070a12] border-t border-slate-800 text-[10px] font-mono text-slate-400 select-none">
        <div className="flex items-center space-x-3">
          <span>File: <strong className="text-slate-200">{activeFile}</strong></span>
          <span>Lines: {currentLines.length}</span>
          <span>Chars: {currentCode.length}</span>
        </div>

        <div className="flex items-center space-x-2">
          {onRunTests && (
            <button
              type="button"
              onClick={onRunTests}
              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-1 shadow"
            >
              <Play className="h-3 w-3 fill-white" />
              <span>RUN TESTS</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1 rounded hover:bg-slate-800 text-slate-300 transition"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>

    </div>
  );
}
