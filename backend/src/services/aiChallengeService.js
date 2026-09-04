import dotenv from "dotenv";
import { addCustomChallenge } from "../game/challenges.js";

dotenv.config();

/**
 * Extracts and cleans JSON object from LLM response content
 */
function extractJsonFromLlm(text) {
  if (!text || typeof text !== "string") return null;
  let clean = text.trim();
  
  // Strip markdown fences
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }

  // Find first { and last }
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("[AI Parser] Failed to parse JSON:", e.message);
    return null;
  }
}

/**
 * Calls OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
 */
async function callOpenRouterApi(apiKey, model, systemPrompt, userPrompt) {
  const modelToUse = model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://codemafia.app",
      "X-Title": "Code Mafia II"
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return extractJsonFromLlm(content);
}

/**
 * Dynamic Procedural Generator (generates customized 2-3 connected files for any prompt)
 */
function generateProceduralChallenge(prompt, language, challengeId) {
  const normLang = (language || "javascript").toLowerCase();
  const cleanPrompt = prompt?.trim() || "Multi-file business logic pipeline";
  const slug = cleanPrompt.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/).slice(0, 4).join(" ");
  const title = `AI: ${slug || "Modular System Engine"}`;

  if (normLang === "sql") {
    const tableName = "records";
    return {
      id: challengeId,
      title: `${title} (SQL Engine)`,
      category: "Databases & SQL",
      difficulty: "Medium",
      language: "sql",
      description: `An SQL database pipeline generated for: "${cleanPrompt}". It manages schema tables, aggregates metrics in queries.sql, and flags audit anomalies in audit_rules.sql.`,
      bugsCount: 2,
      devGoal: "Fix the aggregate calculation in queries.sql and validation filter in audit_rules.sql.",
      mafiaGoal: "Corrupt aggregate sums or alter WHERE clause condition filters.",
      activeFileName: "queries.sql",
      files: {
        "queries.sql": `-- AI Generated SQL Query Pipeline
-- Connected to: schema.sql (${tableName})
-- Prompt: ${cleanPrompt}

SELECT 
  entity_id,
  entity_name,
  COALESCE(SUM(amount), 0) AS total_gross,
  COALESCE(SUM(deduction), 0) AS total_deductions,
  COALESCE(SUM(amount), 0) - COALESCE(SUM(deduction), 0) AS net_balance
FROM ${tableName}
WHERE status = 'ACTIVE'
GROUP BY entity_id, entity_name
ORDER BY net_balance DESC;
`,
        "schema.sql": `-- AI Generated Database Schema
-- Connected to: queries.sql & audit_rules.sql

CREATE TABLE ${tableName} (
  record_id VARCHAR(32) PRIMARY KEY,
  entity_id VARCHAR(32) NOT NULL,
  entity_name VARCHAR(128) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  deduction DECIMAL(12, 2) DEFAULT 0.00,
  status VARCHAR(16) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  log_id VARCHAR(32) PRIMARY KEY,
  record_id VARCHAR(32) REFERENCES ${tableName}(record_id),
  severity VARCHAR(16) DEFAULT 'INFO',
  note TEXT
);
`,
        "audit_rules.sql": `-- AI Generated Audit & Anomaly Detection
-- Connected to: schema.sql (${tableName})

SELECT 
  entity_id,
  COUNT(record_id) AS transaction_count,
  SUM(amount) AS total_volume
FROM ${tableName}
WHERE status = 'ACTIVE'
GROUP BY entity_id
HAVING COUNT(record_id) >= 2 OR SUM(amount) > 5000;
`
      },
      starterCode: `-- AI Generated SQL Query Pipeline
SELECT 
  entity_id,
  entity_name,
  COALESCE(SUM(amount), 0) AS total_gross,
  COALESCE(SUM(deduction), 0) AS total_deductions,
  COALESCE(SUM(amount), 0) - COALESCE(SUM(deduction), 0) AS net_balance
FROM ${tableName}
WHERE status = 'ACTIVE'
GROUP BY entity_id, entity_name
ORDER BY net_balance DESC;
`,
      testSuite: [
        {
          id: "test-sql-1",
          name: "Net balance correctly computes gross minus deductions",
          runCode: `
            const gross = 1000;
            const deductions = 200;
            const net = gross - deductions;
            if (net !== 800) throw new Error("Expected net balance 800, got " + net);
          `
        },
        {
          id: "test-sql-2",
          name: "Active entities are grouped and ranked by net balance",
          runCode: `
            const dataset = [
              { entity_id: "E1", entity_name: "Alpha Corp", total_gross: 500, total_deductions: 50, net_balance: 450 },
              { entity_id: "E2", entity_name: "Beta LLC", total_gross: 300, total_deductions: 0, net_balance: 300 }
            ];
            if (dataset.length < 2) throw new Error("All active entities must be included");
            if (dataset[0].net_balance < dataset[1].net_balance) throw new Error("Must be sorted by net_balance DESC");
          `
        },
        {
          id: "test-sql-3",
          name: "Audit rules flag high volume entities",
          runCode: `
            const flagged = [{ entity_id: "E9", transaction_count: 5, total_volume: 12000 }];
            if (flagged.length === 0) throw new Error("High volume anomalies must be flagged");
          `
        }
      ]
    };
  }

  if (normLang === "python") {
    return {
      id: challengeId,
      title: `${title} (Python Pipeline)`,
      category: "Algorithms & Python",
      difficulty: "Medium",
      language: "python",
      description: `A 2-file modular Python service generated for: "${cleanPrompt}". It links main_service.py with helper_module.py to process requests and state transitions.`,
      bugsCount: 2,
      devGoal: "Fix state validation in helper_module.py and rate check in main_service.py.",
      mafiaGoal: "Invert boolean check boundaries or bypass state mutex locks.",
      activeFileName: "main_service.py",
      files: {
        "main_service.py": `# AI Generated Python Service
# Connected to: helper_module.py
from helper_module import StateManager

def process_request(state_mgr, req_id, payload_val, multiplier=1.0):
    """
    Executes transaction with validation against state manager.
    """
    if payload_val <= 0:
        return {"success": False, "error": "INVALID_VALUE"}

    # Bug 1: Checks value before scaling
    if not state_mgr.can_allocate(payload_val):
        return {"success": False, "error": "CAPACITY_EXCEEDED"}

    adjusted = payload_val * multiplier
    success = state_mgr.commit(req_id, adjusted)
    if not success:
        return {"success": False, "error": "COMMIT_FAILED"}

    return {
        "success": True,
        "req_id": req_id,
        "allocated": adjusted,
        "current_balance": state_mgr.get_balance()
    }
`,
        "helper_module.py": `# AI Generated Helper State Manager
# Connected to: main_service.py

class StateManager:
    def __init__(self, max_capacity=1000, initial_balance=0):
        self.max_capacity = max_capacity
        self.balance = initial_balance
        self.history = []

    def can_allocate(self, val):
        # Bug 2: Allows allocation beyond max_capacity
        return (self.balance + val) <= self.max_capacity

    def commit(self, req_id, val):
        if not self.can_allocate(val):
            return False
        self.balance += val
        self.history.append((req_id, val))
        return True

    def get_balance(self):
        return self.balance
`
      },
      starterCode: `from helper_module import StateManager

def process_request(state_mgr, req_id, payload_val, multiplier=1.0):
    if payload_val <= 0:
        return {"success": False, "error": "INVALID_VALUE"}

    if not state_mgr.can_allocate(payload_val):
        return {"success": False, "error": "CAPACITY_EXCEEDED"}

    adjusted = payload_val * multiplier
    success = state_mgr.commit(req_id, adjusted)
    if not success:
        return {"success": False, "error": "COMMIT_FAILED"}

    return {
        "success": True,
        "req_id": req_id,
        "allocated": adjusted,
        "current_balance": state_mgr.get_balance()
    }
`,
      testSuite: [
        {
          id: "test-py-1",
          name: "Standard request updates state manager balance",
          runCode: `
            const mgr = new StateManager(1000, 100);
            const res = process_request(mgr, "REQ-1", 50);
            if (!res.success) throw new Error("Expected successful allocation");
            if (mgr.get_balance() !== 150) throw new Error("Expected balance 150, got " + mgr.get_balance());
          `
        },
        {
          id: "test-py-2",
          name: "Request exceeding maximum capacity is rejected",
          runCode: `
            const mgr = new StateManager(500, 450);
            const res = process_request(mgr, "REQ-2", 100);
            if (res.success) throw new Error("Request exceeding capacity must be rejected");
          `
        },
        {
          id: "test-py-3",
          name: "Negative or zero payload value returns error",
          runCode: `
            const mgr = new StateManager(1000, 0);
            const res = process_request(mgr, "REQ-3", -10);
            if (res.success || res.error !== "INVALID_VALUE") throw new Error("Expected INVALID_VALUE error");
          `
        }
      ]
    };
  }

  // Default: JavaScript / TypeScript
  return {
    id: challengeId,
    title: `${title} (Modular JS Engine)`,
    category: "Architecture & Logic",
    difficulty: "Medium",
    language: "javascript",
    description: `A 2-file connected JavaScript architecture generated for: "${cleanPrompt}". Module main_engine.js imports validators and rate processors from utility_guard.js.`,
    bugsCount: 2,
    devGoal: "Fix boundary validations in utility_guard.js and pipeline dispatch in main_engine.js.",
    mafiaGoal: "Break condition checks in utility_guard.js to cause calculation leakage.",
    activeFileName: "main_engine.js",
    files: {
      "main_engine.js": `// AI Generated Main Engine
// Connected to: utility_guard.js
const { validateTransaction, calculateRate } = require('./utility_guard');

function executePipeline(transaction) {
  const { id, amount, tier = "STANDARD" } = transaction;

  // Validation step via connected module
  const validation = validateTransaction(transaction);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  // Rate calculation step via connected module
  const rate = calculateRate(amount, tier);
  const totalWithRate = amount + rate;

  return {
    success: true,
    transactionId: id,
    baseAmount: amount,
    fee: rate,
    total: Math.round(totalWithRate * 100) / 100,
    status: "PROCESSED"
  };
}

module.exports = { executePipeline };
`,
      "utility_guard.js": `// AI Generated Utility Guard Module
// Connected to: main_engine.js

function validateTransaction(tx) {
  if (!tx || !tx.id) return { valid: false, reason: "MISSING_ID" };
  if (typeof tx.amount !== "number" || tx.amount <= 0) {
    return { valid: false, reason: "INVALID_AMOUNT" };
  }
  return { valid: true };
}

function calculateRate(amount, tier = "STANDARD") {
  const rates = {
    VIP: 0.02,
    ENTERPRISE: 0.015,
    STANDARD: 0.05
  };
  const ratePercent = rates[tier] || rates.STANDARD;
  return Math.round(amount * ratePercent * 100) / 100;
}

module.exports = { validateTransaction, calculateRate };
`
    },
    starterCode: `const { validateTransaction, calculateRate } = require('./utility_guard');

function executePipeline(transaction) {
  const { id, amount, tier = "STANDARD" } = transaction;

  const validation = validateTransaction(transaction);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  const rate = calculateRate(amount, tier);
  const totalWithRate = amount + rate;

  return {
    success: true,
    transactionId: id,
    baseAmount: amount,
    fee: rate,
    total: Math.round(totalWithRate * 100) / 100,
    status: "PROCESSED"
  };
}

module.exports = { executePipeline };
`,
    testSuite: [
      {
        id: "test-js-1",
        name: "Standard transaction applies 5% tier fee",
        runCode: `
          const { executePipeline } = require('./main_engine');
          const res = executePipeline({ id: "TX-1", amount: 100, tier: "STANDARD" });
          if (!res.success) throw new Error("Expected successful transaction");
          if (res.fee !== 5 || res.total !== 105) throw new Error("Expected fee 5 and total 105, got total: " + res.total);
        `
      },
      {
        id: "test-js-2",
        name: "VIP transaction applies reduced 2% fee",
        runCode: `
          const { executePipeline } = require('./main_engine');
          const res = executePipeline({ id: "TX-2", amount: 200, tier: "VIP" });
          if (!res.success) throw new Error("Expected successful VIP transaction");
          if (res.fee !== 4 || res.total !== 204) throw new Error("Expected fee 4 and total 204, got fee: " + res.fee);
        `
      },
      {
        id: "test-js-3",
        name: "Missing transaction ID is rejected with MISSING_ID error",
        runCode: `
          const { executePipeline } = require('./main_engine');
          const res = executePipeline({ amount: 100 });
          if (res.success || res.error !== "MISSING_ID") throw new Error("Expected MISSING_ID error");
        `
      }
    ]
  };
}

/**
 * Generates an AI challenge with 2-3 modular connected files and unit tests across multiple languages
 */
export async function generateAiChallenge(prompt, language = "javascript", customApiKey = null, customProvider = null) {
  const cleanedPrompt = prompt?.trim() || "Multi-file e-commerce order validator";
  const normalizedLang = (language || "javascript").toLowerCase();
  const challengeId = "ai-" + Math.random().toString(36).substring(2, 9);

  const systemPrompt = `You are a Principal Software Engineer crafting competitive coding challenges for a multiplayer game called Code Mafia.
Given the user's prompt and target language "${normalizedLang}", generate a multi-file coding project consisting of EXACTLY 2 to 3 connected files (e.g. main logic file with 1-2 intentional subtle bugs, helper/utility file, schema, and tests).

Files MUST be connected (file 1 imports/requires file 2 or queries tables defined in schema.sql).

Return ONLY a valid JSON object matching this schema:
{
  "title": "Short catchy title",
  "category": "Algorithm / Fintech / Security / Web / Database",
  "difficulty": "Easy" | "Medium" | "Hard",
  "language": "${normalizedLang}",
  "description": "2-3 sentence problem scenario explaining the architecture",
  "bugsCount": 2,
  "devGoal": "What developers need to fix across the files",
  "mafiaGoal": "How the mafia can sabotage the files",
  "activeFileName": "main file name (e.g. queries.sql or main.py or calculator.js)",
  "files": {
    "filename_1.ext": "Full code for file 1 containing intentional bugs",
    "filename_2.ext": "Full code for helper/module file 2",
    "filename_3.ext": "Optional test/utility/schema file 3"
  },
  "starterCode": "Code of the active primary file",
  "testSuite": [
    {
      "id": "test-1",
      "name": "Description of test case",
      "runCode": "Executable assertion code that checks test conditions and throws Error(\\"message\\") on failure."
    }
  ]
}`;

  // 1. Read OpenRouter API key (Environment or custom key passed from UI)
  const openRouterKey = customApiKey || process.env.OPENROUTER_API_KEY;

  let parsed = null;

  // Call OpenRouter API
  if (openRouterKey) {
    try {
      console.log("[AI Challenge] Requesting multi-file generation via OpenRouter API...");
      const selectedModel = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
      parsed = await callOpenRouterApi(openRouterKey, selectedModel, systemPrompt, `Create a 2-3 file connected project in ${normalizedLang} for: "${cleanedPrompt}"`);
      if (parsed) {
        console.log("✅ [OpenRouter API] Successfully received generated multi-file challenge.");
      }
    } catch (e) {
      console.warn("[OpenRouter API Attempt]", e.message);
    }
  }

  // If live LLM succeeded and returned >= 2 connected files
  if (parsed && parsed.title && parsed.files && Object.keys(parsed.files).length >= 2) {
    const files = parsed.files;
    const activeFileName = parsed.activeFileName || Object.keys(files)[0];
    const starterCode = files[activeFileName] || Object.values(files)[0];

    const customChallenge = {
      id: challengeId,
      title: parsed.title,
      category: parsed.category || "AI Generated",
      difficulty: parsed.difficulty || "Medium",
      language: parsed.language || normalizedLang,
      description: parsed.description || `AI multi-file challenge for: ${cleanedPrompt}`,
      bugsCount: parsed.bugsCount || 2,
      devGoal: parsed.devGoal || "Fix all bugs across the project files to pass the test suite.",
      mafiaGoal: parsed.mafiaGoal || "Introduce subtle regressions to prevent tests from passing.",
      activeFileName,
      files,
      starterCode,
      solutionCode: parsed.solutionCode || starterCode,
      testSuite: (parsed.testSuite || []).map((t, idx) => ({
        id: t.id || `test-${idx + 1}`,
        name: t.name || `Assertion ${idx + 1}`,
        runCode: t.runCode
      }))
    };

    addCustomChallenge(customChallenge);
    return { success: true, challenge: customChallenge, source: "live_ai_api" };
  }

  // 2. High-Fidelity Dynamic Procedural Generator
  const proceduralChallenge = generateProceduralChallenge(cleanedPrompt, normalizedLang, challengeId);
  addCustomChallenge(proceduralChallenge);
  return { success: true, challenge: proceduralChallenge, source: "dynamic_synthesizer" };
}
