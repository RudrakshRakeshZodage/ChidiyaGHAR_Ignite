import React from 'react';
import { Search, GitCommit, AlertTriangle, CheckCircle2, XCircle, ArrowDown, HelpCircle, ShieldAlert, Zap } from 'lucide-react';

export default function EvidenceBoard({ activityLog = [], testResults, challenge }) {
  // Extract correlated evidence chains from the activity log
  const generateEvidenceChains = () => {
    const clues = [];
    let lastCodeEdit = null;

    activityLog.forEach((log) => {
      if (log.type === "CODE_EDIT") {
        lastCodeEdit = log;
      } else if (log.type === "TESTS_RUN" && lastCodeEdit) {
        const timeDiffSecs = Math.max(1, Math.round((log.timestamp - lastCodeEdit.timestamp) / 1000));
        
        // If tests were run within 5 minutes of a code edit, correlate them
        if (timeDiffSecs < 300) {
          const isFailure = log.passed === false;
          clues.push({
            id: `clue_${lastCodeEdit.id}_${log.id}`,
            editorName: lastCodeEdit.playerName || "Unknown Player",
            editTime: lastCodeEdit.timestamp,
            testerName: log.playerName || "Team",
            testTime: log.timestamp,
            timeDeltaSeconds: timeDiffSecs,
            isFailure,
            testSummary: log.text,
            suspicionScore: isFailure ? (timeDiffSecs < 30 ? "CRITICAL" : "HIGH") : "LOW"
          });
        }
      }
    });

    return clues.reverse().slice(0, 10);
  };

  const clues = generateEvidenceChains();

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#0d121d] border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-rose-400" />
          <h3 className="font-bold text-sm text-white font-display tracking-wide uppercase">
            EVIDENCE & INVESTIGATION BOARD
          </h3>
        </div>
        <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
          CLUES: {clues.length}
        </span>
      </div>

      {/* Guide Banner */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2">
        <HelpCircle className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span>Correlates file modifications with subsequent unit test results to track regressions.</span>
      </div>

      {/* Clues Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {clues.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-400">No correlated clues yet.</p>
            <p className="text-[10px] text-slate-600 mt-1">
              When players modify code and execute tests, evidence links will automatically appear here.
            </p>
          </div>
        ) : (
          clues.map((clue, index) => (
            <div
              key={clue.id}
              className={`p-3.5 rounded-xl border transition ${
                clue.isFailure
                  ? "bg-rose-950/20 border-rose-800/60 shadow-md shadow-rose-950/20"
                  : "bg-emerald-950/20 border-emerald-800/50 shadow-md shadow-emerald-950/20"
              }`}
            >
              {/* Clue Header Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  CASE ARTIFACT #{clues.length - index}
                </span>
                <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                  clue.suspicionScore === "CRITICAL"
                    ? "bg-rose-900 text-rose-200 border border-rose-600 animate-pulse"
                    : clue.suspicionScore === "HIGH"
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                }`}>
                  {clue.isFailure ? `⚠️ SUSPICION: ${clue.suspicionScore}` : "✓ STABLE COMMIT"}
                </span>
              </div>

              {/* Connected Clue Boxes */}
              <div className="space-y-1.5 font-mono text-xs">
                {/* Node 1: Code Edit */}
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitCommit className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-slate-200 font-bold">{clue.editorName}</span>
                    <span className="text-slate-400 text-[10px]">modified codebase</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{formatTime(clue.editTime)}</span>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center py-0.5 text-slate-500">
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                    <ArrowDown className="h-3 w-3" />
                    <span>+{clue.timeDeltaSeconds}s later</span>
                  </div>
                </div>

                {/* Node 2: Test Result */}
                <div className={`p-2 rounded-lg border flex items-center justify-between ${
                  clue.isFailure
                    ? "bg-rose-900/30 border-rose-700/80 text-rose-200"
                    : "bg-emerald-900/30 border-emerald-700/80 text-emerald-200"
                }`}>
                  <div className="flex items-center space-x-2">
                    {clue.isFailure ? (
                      <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold">{clue.testSummary}</span>
                  </div>
                  <span className="text-[10px] opacity-70 shrink-0">{formatTime(clue.testTime)}</span>
                </div>
              </div>

              {/* Deduction Analysis footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
                {clue.isFailure ? (
                  <p>
                    🔍 <strong className="text-slate-200">Deduction Note:</strong> Automated test regressions appeared right after <span className="text-rose-400 font-semibold">{clue.editorName}</span>'s commit. Cross-examine in discussion!
                  </p>
                ) : (
                  <p>
                    🛡️ <strong className="text-slate-200">Deduction Note:</strong> Code stabilization verified. <span className="text-emerald-400 font-semibold">{clue.editorName}</span>'s changes passed unit assertions.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
