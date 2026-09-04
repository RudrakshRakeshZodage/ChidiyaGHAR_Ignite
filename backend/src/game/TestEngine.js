import vm from "node:vm";

/**
 * Formats data rows into clean ASCII/Unicode terminal tables for SQL challenges
 */
export function formatSqlTable(columns, rows) {
  if (!columns || columns.length === 0) return "(empty query result)";
  
  const colWidths = columns.map(col => {
    let max = col.length;
    for (const row of rows || []) {
      const val = row[col] !== undefined ? String(row[col]) : "NULL";
      if (val.length > max) max = val.length;
    }
    return Math.max(max, 4) + 2;
  });

  const header = columns.map((col, i) => col.padEnd(colWidths[i])).join(" | ");
  const divider = colWidths.map(w => "-".repeat(w)).join("-+-");
  
  const body = (rows || []).map(row => {
    return columns.map((col, i) => {
      const val = row[col] !== undefined ? String(row[col]) : "NULL";
      return val.padEnd(colWidths[i]);
    }).join(" | ");
  }).join("\n");

  return `${header}\n${divider}\n${body}\n(${rows?.length || 0} rows in set)`;
}

/**
 * Bundles multi-file project code into a single executable context
 */
function bundleMultiFiles(codeOrFiles) {
  if (typeof codeOrFiles === "string") {
    return codeOrFiles;
  }
  if (codeOrFiles && typeof codeOrFiles === "object") {
    // Combine all files with module isolation emulation
    const fileEntries = Object.entries(codeOrFiles);
    return fileEntries.map(([filename, content]) => {
      return `// === FILE: ${filename} ===\n${content}\n`;
    }).join("\n\n");
  }
  return String(codeOrFiles || "");
}

/**
 * Safe multi-language & multi-file execution engine
 */
export function runChallengeTests(userCode, testSuite = [], timeoutMs = 2500) {
  const startTime = Date.now();
  const results = [];
  let allPassed = true;
  const globalTerminalLogs = [];

  const bundledCode = bundleMultiFiles(userCode);

  for (const test of testSuite) {
    const testStart = Date.now();
    let consoleLogs = [];

    const sandbox = {
      console: {
        log: (...args) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          consoleLogs.push(msg);
          globalTerminalLogs.push(`[LOG] ${msg}`);
        },
        error: (...args) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          consoleLogs.push("[ERROR] " + msg);
          globalTerminalLogs.push(`[ERROR] ${msg}`);
        },
        warn: (...args) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          consoleLogs.push("[WARN] " + msg);
          globalTerminalLogs.push(`[WARN] ${msg}`);
        }
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      require: () => ({}),
      exports: {},
      module: { exports: {} }
    };

    const context = vm.createContext(sandbox);

    try {
      // 1. Run user code in VM
      const userScript = new vm.Script(bundledCode, { filename: "workspace.bundle.js" });
      userScript.runInContext(context, { timeout: timeoutMs });

      // 2. Run test assertion script
      if (test.runCode) {
        const testScript = new vm.Script(`
          (function() {
            ${test.runCode}
          })();
        `, { filename: `test_${test.id}.js` });

        testScript.runInContext(context, { timeout: timeoutMs });
      }

      const duration = Date.now() - testStart;
      results.push({
        id: test.id,
        name: test.name,
        passed: true,
        durationMs: duration,
        logs: consoleLogs
      });
      globalTerminalLogs.push(`✓ Test "${test.name}" passed (${duration}ms)`);
    } catch (err) {
      allPassed = false;
      const duration = Date.now() - testStart;
      results.push({
        id: test.id,
        name: test.name,
        passed: false,
        durationMs: duration,
        error: err.message || String(err),
        stack: err.stack ? err.stack.split("\n").slice(0, 3).join("\n") : null,
        logs: consoleLogs
      });
      globalTerminalLogs.push(`✕ Test "${test.name}" FAILED: ${err.message || String(err)} (${duration}ms)`);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length || 1;
  const totalDurationMs = Date.now() - startTime;

  return {
    allPassed,
    passedCount,
    totalCount,
    passPercentage: Math.round((passedCount / totalCount) * 100),
    totalDurationMs,
    tests: results,
    terminalLogs: globalTerminalLogs
  };
}
