import vm from "node:vm";

/**
 * Executes user code safely inside an isolated Node.js VM context
 * against defined challenge test suites.
 */
export function runChallengeTests(userCode, testSuite, timeoutMs = 2000) {
  const startTime = Date.now();
  const results = [];
  let allPassed = true;

  for (const test of testSuite) {
    const testStart = Date.now();
    let consoleLogs = [];

    const sandbox = {
      console: {
        log: (...args) => consoleLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => consoleLogs.push("[ERROR] " + args.join(' ')),
        warn: (...args) => consoleLogs.push("[WARN] " + args.join(' '))
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
      isFinite
    };

    const context = vm.createContext(sandbox);

    try {
      // 1. Run user submitted code in context
      const userScript = new vm.Script(userCode, { filename: "userCode.js" });
      userScript.runInContext(context, { timeout: timeoutMs });

      // 2. Run test assertion script in context
      const testScript = new vm.Script(`
        (function() {
          ${test.runCode}
        })();
      `, { filename: `test_${test.id}.js` });

      testScript.runInContext(context, { timeout: timeoutMs });

      results.push({
        id: test.id,
        name: test.name,
        passed: true,
        durationMs: Date.now() - testStart,
        logs: consoleLogs
      });
    } catch (err) {
      allPassed = false;
      results.push({
        id: test.id,
        name: test.name,
        passed: false,
        durationMs: Date.now() - testStart,
        error: err.message || String(err),
        stack: err.stack ? err.stack.split("\n").slice(0, 3).join("\n") : null,
        logs: consoleLogs
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const totalDurationMs = Date.now() - startTime;

  return {
    allPassed,
    passedCount,
    totalCount,
    passPercentage: Math.round((passedCount / totalCount) * 100),
    totalDurationMs,
    tests: results
  };
}
