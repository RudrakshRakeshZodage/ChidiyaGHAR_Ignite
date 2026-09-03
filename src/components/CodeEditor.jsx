import React, { useRef, useEffect } from 'react';
import { Code, Copy, RotateCcw, Check, Sparkles, Terminal } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  onReset,
  readOnly = false,
  activeTypers = []
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  const lines = (code || "").split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
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
    <div className="flex flex-col h-full rounded-2xl bg-[#0b0f17] border border-slate-800 shadow-2xl overflow-hidden">
      {/* Editor Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
            <Code className="h-3.5 w-3.5 text-sky-400" />
            <span>main.js</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">JavaScript (ES6)</span>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-2">
          {activeTypers.length > 0 && (
            <div className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{activeTypers.join(", ")} editing...</span>
            </div>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center space-x-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onReset}
            title="Reset to starter challenge code"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition text-xs flex items-center space-x-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-3 bg-[#080c13] text-slate-600 font-mono text-xs text-right border-r border-slate-800/80 min-w-[3rem]">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Live Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          placeholder="// Write or fix code collaboratively..."
          className="flex-1 p-3 bg-transparent font-mono text-xs sm:text-sm text-slate-100 resize-none focus:outline-none leading-6 selection:bg-rose-500/30 overflow-auto whitespace-pre tab-4"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Footer bar */}
      <div className="px-4 py-1.5 bg-[#080c13] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>
          <span>Lines: {lines.length}</span> • <span>Characters: {code.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">Live Collab Workspace</span>
        </div>
      </div>
    </div>
  );
}
