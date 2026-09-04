import dotenv from "dotenv";
import { addCustomChallenge } from "../game/challenges.js";

dotenv.config();

const AIHUBMIX_API_KEY = process.env.AIHUBMIX_API_KEY || "sk-e9b46e8c75d44005b8a514d2e5bcbe66";
const AIHUBMIX_API_URL = "https://aihubmix.com/v1/chat/completions";

/**
 * Multi-Language, Multi-File Fallback Templates (2-3 files each)
 */
const MULTI_LANG_TEMPLATES = {
  python: [
    {
      id: "py-inventory-mutex",
      title: "Warehouse Inventory Mutex & Order Pipeline",
      category: "Concurrency & Data",
      difficulty: "Medium",
      language: "python",
      description: "An asynchronous Python order management system decrements warehouse stock and validates reservation timeouts. However, race condition bugs allow negative inventory allocations!",
      bugsCount: 2,
      devGoal: "Fix the stock validation in inventory.py and timeout check in order_service.py so all test cases pass.",
      mafiaGoal: "Bypass stock locks or invert reservation expiration logic to cause inventory drift.",
      activeFileName: "order_service.py",
      files: {
        "order_service.py": `# Order Processing Pipeline
from inventory import InventoryManager

def process_order(inventory_mgr, order_id, item_sku, requested_qty, is_vip=False):
    """
    Validates and reserves items from warehouse inventory.
    """
    if requested_qty <= 0:
        return {"status": "REJECTED", "reason": "INVALID_QUANTITY", "order_id": order_id}

    # Bug 1: VIP orders bypass stock check entirely
    if not is_vip:
        if not inventory_mgr.has_sufficient_stock(item_sku, requested_qty):
            return {"status": "REJECTED", "reason": "OUT_OF_STOCK", "order_id": order_id}

    # Deduct stock and create reservation
    success = inventory_mgr.deduct_stock(item_sku, requested_qty)
    if not success:
        return {"status": "REJECTED", "reason": "ALLOCATION_FAILED", "order_id": order_id}

    return {
        "status": "APPROVED",
        "order_id": order_id,
        "item_sku": item_sku,
        "allocated_qty": requested_qty,
        "remaining_stock": inventory_mgr.get_stock(item_sku)
    }
`,
        "inventory.py": `# Warehouse Inventory State Manager
class InventoryManager:
    def __init__(self, initial_stock=None):
        self.stock = dict(initial_stock or {})

    def has_sufficient_stock(self, sku, qty):
        # Bug 2: Returns True when stock is less than requested if stock is positive
        current = self.stock.get(sku, 0)
        return current >= qty

    def deduct_stock(self, sku, qty):
        current = self.stock.get(sku, 0)
        if current < qty:
            return False
        self.stock[sku] = current - qty
        return True

    def get_stock(self, sku):
        return self.stock.get(sku, 0)
`,
        "test_suite.py": `# Automated Verification Test Suite
# Tests order processing against multi-threaded edge cases
def run_all_tests():
    from inventory import InventoryManager
    from order_service import process_order

    # Test 1: Standard stock deduction
    mgr = InventoryManager({"SKU-100": 50})
    res1 = process_order(mgr, "ORD-1", "SKU-100", 10)
    assert res1["status"] == "APPROVED"
    assert mgr.get_stock("SKU-100") == 40

    # Test 2: Out of stock rejection
    res2 = process_order(mgr, "ORD-2", "SKU-100", 100)
    assert res2["status"] == "REJECTED"
    assert res2["reason"] == "OUT_OF_STOCK"

    # Test 3: VIP cannot exceed available stock
    res3 = process_order(mgr, "ORD-3", "SKU-100", 60, is_vip=True)
    assert res3["status"] == "REJECTED"
    print("All Python Inventory tests passed successfully!")

run_all_tests()
`
      },
      testSuite: [
        {
          id: "py-test-1",
          name: "Standard order deduction updates remaining stock",
          runCode: `
            const mgr = new InventoryManager({ "SKU-100": 50 });
            const res = process_order(mgr, "ORD-1", "SKU-100", 10);
            if (res.status !== "APPROVED") throw new Error("Expected status APPROVED");
            if (mgr.get_stock("SKU-100") !== 40) throw new Error("Expected stock 40, got " + mgr.get_stock("SKU-100"));
          `
        },
        {
          id: "py-test-2",
          name: "Order exceeding stock is rejected with OUT_OF_STOCK",
          runCode: `
            const mgr = new InventoryManager({ "SKU-100": 15 });
            const res = process_order(mgr, "ORD-2", "SKU-100", 25);
            if (res.status !== "REJECTED") throw new Error("Order exceeding stock must be REJECTED");
            if (res.reason !== "OUT_OF_STOCK") throw new Error("Expected reason OUT_OF_STOCK");
          `
        },
        {
          id: "py-test-3",
          name: "VIP orders cannot deplete inventory into negative balance",
          runCode: `
            const mgr = new InventoryManager({ "SKU-100": 10 });
            const res = process_order(mgr, "ORD-VIP", "SKU-100", 50, true);
            if (res.status !== "REJECTED") throw new Error("VIP order exceeding stock must not be approved!");
          `
        }
      ]
    }
  ],

  sql: [
    {
      id: "sql-analytics-reporting",
      title: "E-Commerce Revenue Analytics & Fraud Query Engine",
      category: "Databases & SQL",
      difficulty: "Medium",
      language: "sql",
      description: "A database reporting pipeline calculates monthly merchant revenue, active refunds, and detects suspicious velocity. However, faulty JOIN predicates and missing NULL coalescing are skewing executive reports!",
      bugsCount: 2,
      devGoal: "Fix the merchant revenue aggregate in queries.sql and fraud filtering in fraud_detection.sql.",
      mafiaGoal: "Corrupt aggregate sums or alter WHERE clause conditions to mask fraudulent merchant volumes.",
      activeFileName: "queries.sql",
      files: {
        "queries.sql": `-- Monthly Merchant Net Revenue Calculation
-- Bug 1: Uses INNER JOIN instead of LEFT JOIN on refunds, dropping merchants with 0 refunds!
-- Bug 2: Refunds not subtracted properly from gross revenue
SELECT 
  m.merchant_id,
  m.merchant_name,
  COALESCE(SUM(o.amount), 0) AS gross_revenue,
  COALESCE(SUM(r.refund_amount), 0) AS total_refunds,
  COALESCE(SUM(o.amount), 0) - COALESCE(SUM(r.refund_amount), 0) AS net_revenue
FROM merchants m
LEFT JOIN orders o ON m.merchant_id = o.merchant_id AND o.status = 'COMPLETED'
LEFT JOIN refunds r ON o.order_id = r.order_id
GROUP BY m.merchant_id, m.merchant_name
ORDER BY net_revenue DESC;
`,
        "schema.sql": `-- Database DDL Schema Definitions
CREATE TABLE merchants (
  merchant_id VARCHAR(32) PRIMARY KEY,
  merchant_name VARCHAR(128) NOT NULL,
  tier VARCHAR(16) DEFAULT 'STANDARD'
);

CREATE TABLE orders (
  order_id VARCHAR(32) PRIMARY KEY,
  merchant_id VARCHAR(32) REFERENCES merchants(merchant_id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(16) DEFAULT 'COMPLETED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refunds (
  refund_id VARCHAR(32) PRIMARY KEY,
  order_id VARCHAR(32) REFERENCES orders(order_id),
  refund_amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(64)
);
`,
        "fraud_detection.sql": `-- High Velocity Fraud Alert Query
SELECT 
  o.merchant_id,
  COUNT(o.order_id) AS total_transactions,
  SUM(o.amount) AS velocity_volume
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '1 HOUR'
GROUP BY o.merchant_id
HAVING COUNT(o.order_id) > 100 OR SUM(o.amount) > 10000;
`
      },
      testSuite: [
        {
          id: "sql-test-1",
          name: "Merchants with zero refunds are preserved in gross calculations",
          runCode: `
            const merchants = [{ id: "M1", name: "Shop A" }, { id: "M2", name: "Shop B" }];
            const orders = [{ merchant_id: "M1", amount: 200 }, { merchant_id: "M2", amount: 500 }];
            const refunds = [{ order_id: "M1_ord", refund_amount: 50 }];
            if (merchants.length !== 2) throw new Error("All merchants must be reported");
          `
        },
        {
          id: "sql-test-2",
          name: "Net revenue correctly subtracts refund deductions",
          runCode: `
            const gross = 500;
            const refund = 50;
            const net = gross - refund;
            if (net !== 450) throw new Error("Expected net revenue 450, got " + net);
          `
        }
      ]
    }
  ],

  javascript: [
    {
      id: "js-payment-gateway",
      title: "Payment Gateway Tokenizer & Idempotency Router",
      category: "Fintech & Web APIs",
      difficulty: "Medium",
      language: "javascript",
      description: "A payment router processes credit card tokens, enforces idempotency keys, and applies multi-currency conversions. However, flawed cache checks allow duplicate charges!",
      bugsCount: 2,
      devGoal: "Fix idempotency key hashing in gateway.js and currency exchange in currency.js.",
      mafiaGoal: "Bypass idempotency locks or introduce rounding errors in exchange rates.",
      activeFileName: "gateway.js",
      files: {
        "gateway.js": `// Payment Router and Idempotency Guard
const { convertCurrency } = require('./currency');

function processPayment(paymentRequest, idempotencyStore) {
  const { idempotencyKey, amount, currency, merchantId } = paymentRequest;

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "MISSING_IDEMPOTENCY_KEY" };
  }

  // Bug 1: Idempotency check checks truthiness incorrectly (cached false returns charge)
  if (idempotencyStore.has(idempotencyKey)) {
    return {
      success: true,
      cached: true,
      transactionId: idempotencyStore.get(idempotencyKey).transactionId,
      message: "Idempotent response replayed"
    };
  }

  // Currency normalization to USD
  const amountUsd = convertCurrency(amount, currency, "USD");
  const transactionId = "tx_" + Math.random().toString(36).substring(2, 9);

  const record = { transactionId, amountUsd, merchantId, status: "SETTLED" };
  idempotencyStore.set(idempotencyKey, record);

  return {
    success: true,
    cached: false,
    transactionId,
    amountUsd,
    status: "SETTLED"
  };
}

module.exports = { processPayment };
`,
        "currency.js": `// Multi-Currency Converter
const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0065
};

function convertCurrency(amount, fromCurrency, toCurrency = "USD") {
  if (fromCurrency === toCurrency) return amount;
  const rateFrom = EXCHANGE_RATES[fromCurrency] || 1.0;
  const rateTo = EXCHANGE_RATES[toCurrency] || 1.0;

  // Bug 2: Multiply instead of divide when converting to USD
  const converted = amount * rateFrom;
  return Math.round(converted * 100) / 100;
}

module.exports = { convertCurrency };
`,
        "test_suite.js": `// Automated Payment Gateway Test Suite
const { processPayment } = require('./gateway');

function runTestSuite() {
  const store = new Map();
  const req1 = { idempotencyKey: "key-123", amount: 100, currency: "USD", merchantId: "M1" };
  const res1 = processPayment(req1, store);
  console.log("Tx 1:", res1.transactionId);

  const res2 = processPayment(req1, store); // Replay
  console.log("Tx 2 (replay):", res2.cached);
}

runTestSuite();
`
      },
      testSuite: [
        {
          id: "js-test-1",
          name: "Standard payment settles and records transaction ID",
          runCode: `
            const store = new Map();
            const req = { idempotencyKey: "key-1", amount: 100, currency: "USD", merchantId: "m1" };
            const res = processPayment(req, store);
            if (!res.success || res.cached !== false) throw new Error("Expected new transaction settled");
            if (res.amountUsd !== 100) throw new Error("Expected USD 100, got " + res.amountUsd);
          `
        },
        {
          id: "js-test-2",
          name: "Duplicate idempotency key returns cached transaction without re-charging",
          runCode: `
            const store = new Map();
            const req = { idempotencyKey: "key-dup", amount: 50, currency: "USD", merchantId: "m1" };
            const res1 = processPayment(req, store);
            const res2 = processPayment(req, store);
            if (!res2.cached) throw new Error("Duplicate idempotency key must return cached: true");
            if (res1.transactionId !== res2.transactionId) throw new Error("Transaction IDs must match on idempotency replay");
          `
        }
      ]
    }
  ],

  typescript: [
    {
      id: "ts-rate-limiter",
      title: "Sliding Window API Rate Limiter & Token Bucket",
      category: "Distributed Systems",
      difficulty: "Hard",
      language: "typescript",
      description: "A TypeScript rate-limiting middleware tracks client IP requests in sliding 60-second windows. Flawed timestamp pruning allows burst attacks to exceed quotas!",
      bugsCount: 2,
      devGoal: "Fix timestamp eviction in limiter.ts and token refill in token_bucket.ts.",
      mafiaGoal: "Alter sliding window boundaries to permit continuous flooding.",
      activeFileName: "limiter.ts",
      files: {
        "limiter.ts": `// Sliding Window Rate Limiter
export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export class SlidingWindowLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public allowRequest(clientId: string, currentTimestampMs: number): boolean {
    const windowMs = this.config.windowSeconds * 1000;
    const cutoff = currentTimestampMs - windowMs;

    let timestamps = this.requests.get(clientId) || [];
    // Bug 1: Keeps expired timestamps instead of filtering them out
    timestamps = timestamps.filter(t => t > cutoff);

    if (timestamps.length >= this.config.maxRequests) {
      this.requests.set(clientId, timestamps);
      return false; // Rate limit exceeded
    }

    timestamps.push(currentTimestampMs);
    this.requests.set(clientId, timestamps);
    return true;
  }
}
`,
        "token_bucket.ts": `// Token Bucket Burst Controller
export class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillRatePerSec: number;
  private lastRefillMs: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.lastRefillMs = Date.now();
  }

  public consume(tokens: number = 1): boolean {
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}
`,
        "tests.ts": `// Unit Verification Suite
import { SlidingWindowLimiter } from './limiter';

const limiter = new SlidingWindowLimiter({ maxRequests: 3, windowSeconds: 60 });
console.log("Req 1:", limiter.allowRequest("ip-1", 1000));
console.log("Req 2:", limiter.allowRequest("ip-1", 2000));
console.log("Req 3:", limiter.allowRequest("ip-1", 3000));
console.log("Req 4 (should block):", limiter.allowRequest("ip-1", 4000));
`
      },
      testSuite: [
        {
          id: "ts-test-1",
          name: "Requests under limit are allowed",
          runCode: `
            const lim = new SlidingWindowLimiter({ maxRequests: 3, windowSeconds: 10 });
            if (!lim.allowRequest("user1", 1000)) throw new Error("First request should pass");
            if (!lim.allowRequest("user1", 2000)) throw new Error("Second request should pass");
            if (!lim.allowRequest("user1", 3000)) throw new Error("Third request should pass");
          `
        },
        {
          id: "ts-test-2",
          name: "Fourth request exceeding capacity is blocked",
          runCode: `
            const lim = new SlidingWindowLimiter({ maxRequests: 2, windowSeconds: 10 });
            lim.allowRequest("user2", 1000);
            lim.allowRequest("user2", 2000);
            if (lim.allowRequest("user2", 3000) !== false) throw new Error("3rd request must be blocked!");
          `
        }
      ]
    }
  ]
};

/**
 * Generates an AI challenge with 2-3 modular files across multiple languages
 */
export async function generateAiChallenge(prompt, language = "javascript") {
  const cleanedPrompt = prompt?.trim() || "Multi-file e-commerce order validator";
  const normalizedLang = (language || "javascript").toLowerCase();
  const challengeId = "ai-" + Math.random().toString(36).substring(2, 9);

  // 1. Try AIHubMix LLM Generation
  try {
    const systemPrompt = `You are a Principal Software Engineer crafting competitive coding challenges for a multiplayer game called Code Mafia.
Given the user's prompt and target language "${normalizedLang}", generate a multi-file coding project consisting of EXACTLY 2 to 3 files (e.g. main logic file with 1-2 intentional subtle bugs, helper/utility file, and test runner).

Supported languages: python, sql, javascript, typescript, cpp, java.

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
  "activeFileName": "main file name (e.g. main.py or queries.sql or index.js)",
  "files": {
    "filename_1.ext": "Full code for file 1 containing intentional bugs",
    "filename_2.ext": "Full code for helper/module file 2",
    "filename_3.ext": "Optional test/utility file 3"
  },
  "starterCode": "Code of the active primary file",
  "testSuite": [
    {
      "id": "test-1",
      "name": "Description of test case",
      "runCode": "Executable JS assertion code that tests the challenge functions and throws Error on failure"
    }
  ]
}`;

    const res = await fetch(AIHUBMIX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIHUBMIX_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a 2-3 file project in ${normalizedLang} for: "${cleanedPrompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 2200,
        response_format: { type: "json_object" }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.title && parsed.files && Object.keys(parsed.files).length >= 2) {
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
          return { success: true, challenge: customChallenge };
        }
      }
    }
  } catch (err) {
    console.warn("AIHubMix multi-file generation note:", err.message);
  }

  // 2. Multi-Language Fallback Templates
  const langKey = MULTI_LANG_TEMPLATES[normalizedLang] ? normalizedLang : "javascript";
  const templates = MULTI_LANG_TEMPLATES[langKey] || MULTI_LANG_TEMPLATES.javascript;
  const promptLower = cleanedPrompt.toLowerCase();
  const selected = templates.find(t => promptLower.includes(t.category?.toLowerCase() || "")) || templates[0];

  const customChallenge = {
    ...selected,
    id: challengeId,
    title: `AI: ${selected.title}`,
    description: `${selected.description} (Generated for: "${cleanedPrompt}")`
  };

  addCustomChallenge(customChallenge);
  return { success: true, challenge: customChallenge };
}
