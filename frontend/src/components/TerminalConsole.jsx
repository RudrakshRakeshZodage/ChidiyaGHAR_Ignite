import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Trash2, Check, AlertTriangle, ShieldCheck, XCircle, Clock, Table, ChevronRight, CornerDownLeft } from 'lucide-react';

export default function TerminalConsole({
  logs = [],
  testResults,
  isRunning = false,
  onRunCode,
  onRunTests,
  activeFileName = "main.py",
  language = "python",
  customSqlRows
}) {
  const [activeTab, setActiveTab] = useState("console"); // 'console' | 'tests' | 'sql'
  const [commandInput, setCommandInput] = useState("");
  const [localLogs, setLocalLogs] = useState([
    `[SYSTEM] Multi-Language Runtime initialized (${language.toUpperCase()})`,
    `[SYSTEM] Active buffer: ${activeFileName}. Press Run Code or type 'run' to execute.`
  ]);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (logs && logs.length > 0) {
      setLocalLogs(prev => [...prev, ...logs]);
    }
  }, [logs]);

  useEffect(() => {
    if (testResults?.terminalLogs && testResults.terminalLogs.length > 0) {
      setLocalLogs(prev => [
        ...prev,
        `=== Automated Test Run (${testResults.passedCount}/${testResults.totalCount} Passed) ===`,
        ...testResults.terminalLogs
      ]);
    }
  }, [testResults]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localLogs, testResults]);

  const handleClear = () => {
    setLocalLogs([`[SYSTEM] Console buffer cleared.`]);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(localLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    setLocalLogs(prev => [...prev, `❯ ${commandInput}`]);
    setCommandInput("");

    if (cmd === "clear" || cmd === "cls") {
      setLocalLogs([`[SYSTEM] Console buffer cleared.`]);
    } else if (cmd === "run" || cmd.startsWith("run ")) {
      setLocalLogs(prev => [...prev, `[RUNNER] Executing ${activeFileName}...`]);
      onRunCode?.();
    } else if (cmd === "test" || cmd === "tests" || cmd.startsWith("npm test") || cmd.startsWith("pytest")) {
      setLocalLogs(prev => [...prev, `[RUNNER] Running automated test suite...`]);
      onRunTests?.();
    } else if (cmd === "help") {
      setLocalLogs(prev => [
        ...prev,
        `Available Commands:`,
        `  • run           Execute current active file (${activeFileName})`,
        `  • test          Execute test suite assertions`,
        `  • clear         Clear terminal log buffer`,
        `  • ls            List all workspace files`,
        `  • help          Show this command manual`
      ]);
    } else if (cmd === "ls") {
      setLocalLogs(prev => [
        ...prev,
        `Workspace files: ${activeFileName}, utils, test_suite`
      ]);
    } else {
      setLocalLogs(prev => [...prev, `Command not recognized: "${cmd}". Type 'help' or 'run'.`]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#080c14] border border-[#1e293b] shadow-2xl overflow-hidden font-mono text-xs select-none">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1522] border-b border-[#1e293b] text-slate-300">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-slate-100">INTERACTIVE TERMINAL</span>
          <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
            {language}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-[#090d16] p-0.5 rounded-lg border border-[#1e293b]">
          <button
            type="button"
            onClick={() => setActiveTab("console")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${activeTab === 'console' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center space-x-1 ${activeTab === 'tests' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>Tests</span>
            {testResults && (
              <span className={`text-[9px] px-1 rounded ${testResults.allPassed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                {testResults.passedCount}/{testResults.totalCount}
              </span>
            )}
          </button>
          {language === "sql" && (
            <button
              type="button"
              onClick={() => setActiveTab("sql")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center space-x-1 ${activeTab === 'sql' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Table className="h-3 w-3 text-sky-400" />
              <span>SQL Tables</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyLogs}
            title="Copy all terminal output"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleClear}
            title="Clear terminal buffer"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Screen Area */}
      <div className="flex-1 p-3 overflow-y-auto bg-[#05080e] text-slate-300 space-y-1.5 select-text min-h-[220px] max-h-[360px]">
        
        {/* Tab 1: Live Console Output */}
        {activeTab === "console" && (
          <div className="space-y-1">
            {localLogs.map((log, index) => {
              const isError = log.includes("[ERROR]") || log.includes("FAILED") || log.includes("Error");
              const isSuccess = log.includes("[SUCCESS]") || log.includes("passed") || log.includes("✓");
              const isWarn = log.includes("[WARN]") || log.includes("⚠️");
              const isCmd = log.startsWith("❯");

              return (
                <div
                  key={index}
                  className={`leading-relaxed break-words ${
                    isError
                      ? "text-rose-400 font-semibold"
                      : isSuccess
                      ? "text-emerald-400 font-semibold"
                      : isWarn
                      ? "text-amber-300"
                      : isCmd
                      ? "text-sky-300 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* Tab 2: Test Suite Details */}
        {activeTab === "tests" && (
          <div className="space-y-2">
            {!testResults ? (
              <div className="text-slate-500 py-6 text-center">
                No tests executed yet. Click "Run Tests" or type 'test' in the prompt.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold">
                    {testResults.allPassed ? "✓ ALL ASSERTIONS PASSED" : "✕ TEST SUITE FAILURES DETECTED"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Duration: {testResults.totalDurationMs}ms
                  </span>
                </div>

                {testResults.tests?.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-lg border flex flex-col space-y-1 ${
                      t.passed
                        ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                        : "bg-rose-950/30 border-rose-800/60 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center space-x-1.5">
                        {t.passed ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                        <span>{t.name}</span>
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">{t.durationMs}ms</span>
                    </div>
                    {t.error && (
                      <div className="text-[11px] font-mono text-rose-300 pl-5">
                        Error: {t.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SQL Relational Table Visualizer */}
        {activeTab === "sql" && (
          <div className="space-y-3">
            <div className="text-[11px] text-sky-400 font-bold uppercase tracking-wide">
              Query Result Set:
            </div>
            <div className="p-3 bg-black rounded-lg border border-slate-800 overflow-x-auto font-mono text-xs">
              <pre className="text-emerald-300">
{`merchant_id | merchant_name | gross_revenue | total_refunds | net_revenue
------------+---------------+---------------+---------------+------------
M101        | Apex Apparel  | $12,450.00    | $250.00       | $12,200.00
M102        | Cyber Gadgets | $8,900.00     | $0.00         | $8,900.00
M103        | Neon Roasters | $3,120.00     | $45.00        | $3,075.00
(3 rows in set - query took 12ms)`}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Command Prompt Line */}
      <form onSubmit={handleCommandSubmit} className="flex items-center px-3 py-2 bg-[#090e18] border-t border-[#1e293b] gap-2">
        <span className="text-emerald-400 font-bold flex items-center space-x-1 shrink-0">
          <span className="text-sky-400">user@mafia</span>
          <span className="text-slate-500">:</span>
          <span className="text-amber-400">~</span>
          <span>$</span>
        </span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="type 'run', 'test', or 'clear'..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
        />
        <button
          type="submit"
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
        >
          <CornerDownLeft className="h-3 w-3" />
        </button>
      </form>

    </div>
  );
}
