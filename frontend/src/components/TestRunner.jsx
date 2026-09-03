import React from 'react';
import { Play, CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function TestRunner({
  testResults,
  onRunTests,
  isRunningTests,
  challenge
}) {
  const tests = testResults?.tests || (challenge?.testSuite || []).map(t => ({
    id: t.id,
    name: t.name,
    passed: false,
    untested: true
  }));

  const passedCount = testResults?.passedCount || 0;
  const totalCount = tests.length || 1;
  const passPercentage = testResults ? Math.round((passedCount / totalCount) * 100) : 0;
  const allPassed = testResults?.allPassed;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#0d121d] border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-white font-display tracking-wide">
            AUTOMATED TEST SUITE
          </h3>
        </div>

        <button
          onClick={onRunTests}
          disabled={isRunningTests}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg ${
            isRunningTests
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 active:scale-95"
          }`}
        >
          {isRunningTests ? (
            <>
              <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>TESTING...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>EXECUTE TESTS</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-[#0a0e17] border-b border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-semibold">Stabilization Progress</span>
          <span className={`font-mono font-bold ${allPassed ? "text-emerald-400" : "text-amber-400"}`}>
            {passedCount} / {totalCount} Passing ({passPercentage}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allPassed
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 glow-green"
                : passPercentage > 0
                ? "bg-gradient-to-r from-amber-500 to-emerald-500"
                : "bg-rose-500/50"
            }`}
            style={{ width: `${passPercentage}%` }}
          />
        </div>
      </div>

      {/* Test Cases List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {tests.map((test, index) => {
          const isPassed = test.passed;
          const isFailed = testResults && !test.passed;
          const isUntested = !testResults;

          return (
            <div
              key={test.id || index}
              className={`p-3 rounded-xl border transition ${
                isPassed
                  ? "bg-emerald-950/20 border-emerald-800/50"
                  : isFailed
                  ? "bg-rose-950/20 border-rose-800/50"
                  : "bg-slate-900/40 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5">
                    {isPassed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {isFailed && <XCircle className="h-4 w-4 text-rose-400" />}
                    {isUntested && <AlertCircle className="h-4 w-4 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{test.name}</h4>
                    {test.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{test.durationMs}ms</span>
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isPassed
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : isFailed
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isPassed ? "PASS" : isFailed ? "FAIL" : "PENDING"}
                </span>
              </div>

              {/* Error assertion snippet */}
              {test.error && (
                <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-rose-900/60 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <span className="text-rose-500 font-bold">Assertion Error: </span>
                  <span>{test.error}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
