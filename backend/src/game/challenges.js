/**
 * Built-in multi-file, connected code challenges for Code Mafia
 * Every challenge contains at least 2 connected files.
 */

export const CHALLENGES = [
  {
    id: "sql-ecommerce-analytics",
    title: "E-Commerce Revenue Analytics & Fraud SQL Engine",
    category: "Databases & SQL",
    difficulty: "Medium",
    language: "sql",
    description: "An SQL reporting pipeline calculates merchant net revenue, joins transaction refunds, and detects high-velocity fraud spikes. However, flawed JOIN predicates and missing NULL coalescing are skewing executive totals!",
    bugsCount: 2,
    devGoal: "Fix the merchant revenue aggregate in queries.sql and fraud velocity threshold in fraud_detection.sql.",
    mafiaGoal: "Corrupt aggregate sums or alter WHERE clause conditions to mask fraudulent merchant volume.",
    activeFileName: "queries.sql",
    files: {
      "queries.sql": `-- Monthly Merchant Net Revenue Calculation
-- Connected to: schema.sql (merchants, orders, refunds)
-- Bug 1: Uses INNER JOIN on refunds, dropping merchants who have 0 refunds!
-- Bug 2: Total refunds must be subtracted from gross revenue to calculate net_revenue

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
-- Connected to: queries.sql & fraud_detection.sql

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
-- Connected to: schema.sql (orders)

SELECT 
  o.merchant_id,
  COUNT(o.order_id) AS total_transactions,
  SUM(o.amount) AS velocity_volume
FROM orders o
WHERE o.status = 'COMPLETED'
GROUP BY o.merchant_id
HAVING COUNT(o.order_id) >= 2 OR SUM(o.amount) > 1000;
`
    },
    starterCode: `-- Monthly Merchant Net Revenue Calculation
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
    testSuite: [
      {
        id: "sql-test-1",
        name: "Merchants with zero refunds are preserved in gross calculations",
        runCode: `
          const merchants = [
            { merchant_id: "M1", merchant_name: "Apex Store", gross_revenue: 500, total_refunds: 0, net_revenue: 500 },
            { merchant_id: "M2", merchant_name: "Cyber Goods", gross_revenue: 300, total_refunds: 50, net_revenue: 250 }
          ];
          const hasApex = merchants.some(m => m.merchant_id === "M1" && m.net_revenue === 500);
          if (!hasApex) throw new Error("Apex Store (0 refunds) was dropped from report!");
        `
      },
      {
        id: "sql-test-2",
        name: "Net revenue correctly subtracts refund deductions",
        runCode: `
          const gross = 1000;
          const refunds = 150;
          const net = gross - refunds;
          if (net !== 850) throw new Error("Expected net revenue 850, got " + net);
        `
      },
      {
        id: "sql-test-3",
        name: "Fraud detection flags high volume merchants",
        runCode: `
          const suspicious = [{ merchant_id: "M9", total_transactions: 10, velocity_volume: 15000 }];
          if (suspicious.length === 0) throw new Error("High volume merchant must be flagged by fraud_detection.sql");
        `
      }
    ]
  },
  {
    id: "cart-calculator",
    title: "E-Commerce Checkout & Tax Calculation Engine",
    category: "Algorithms & Architecture",
    difficulty: "Medium",
    language: "javascript",
    description: "A multi-file checkout system calculates item totals, applies discounts from discounts.js, and computes state tax via tax_engine.js. Off-by-one errors and discount overflows are breaking purchases!",
    bugsCount: 3,
    devGoal: "Fix array iteration in calculator.js, tax brackets in tax_engine.js, and promo limits in discounts.js.",
    mafiaGoal: "Bypass promo limits or corrupt tax rate calculations in tax_engine.js.",
    activeFileName: "calculator.js",
    files: {
      "calculator.js": `// Main Checkout Pipeline
// Connected to: tax_engine.js and discounts.js
const { calculateTax } = require('./tax_engine');
const { applyDiscount } = require('./discounts');

function calculateOrderSummary(items, promoCode, userLocation) {
  // Bug 1: Off-by-one loop boundary
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.price) {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  // Connected Module 1: Discount calculation
  const discountAmount = applyDiscount(subtotal, promoCode);
  let discountedSubtotal = subtotal - discountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  // Connected Module 2: State Tax calculation
  const tax = calculateTax(discountedSubtotal, userLocation);

  // Free shipping over $50 after discount, otherwise $5.99
  let shipping = 0;
  if (discountedSubtotal > 0 && discountedSubtotal < 50) {
    shipping = 5.99;
  }

  const total = discountedSubtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

module.exports = { calculateOrderSummary };
`,
      "tax_engine.js": `// State Tax Engine Module
// Connected to: calculator.js

const STATE_TAX_RATES = {
  CA: 0.095,
  NY: 0.08875,
  TX: 0.0625,
  DEFAULT: 0.05
};

function calculateTax(amount, userLocation) {
  if (amount <= 0) return 0;
  const rate = STATE_TAX_RATES[userLocation] || STATE_TAX_RATES.DEFAULT;
  return Math.round(amount * rate * 100) / 100;
}

module.exports = { calculateTax, STATE_TAX_RATES };
`,
      "discounts.js": `// Promo Code & Discount Module
// Connected to: calculator.js

function applyDiscount(subtotal, promoCode) {
  if (!promoCode || subtotal <= 0) return 0;

  if (promoCode === "SAVE20" && subtotal >= 100) {
    return Math.round(subtotal * 0.20 * 100) / 100;
  }

  if (promoCode === "FLAT15") {
    // Discount must not exceed subtotal
    return Math.min(15, subtotal);
  }

  return 0;
}

module.exports = { applyDiscount };
`
    },
    starterCode: `// Main Checkout Pipeline
const { calculateTax } = require('./tax_engine');
const { applyDiscount } = require('./discounts');

function calculateOrderSummary(items, promoCode, userLocation) {
  let subtotal = 0;
  for (let i = 0; i <= items.length; i++) {
    const item = items[i];
    if (item && item.price) {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  const discountAmount = applyDiscount(subtotal, promoCode);
  let discountedSubtotal = subtotal - discountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  const tax = calculateTax(discountedSubtotal, userLocation);

  let shipping = 0;
  if (discountedSubtotal > 0 && discountedSubtotal < 50) {
    shipping = 5.99;
  }

  const total = discountedSubtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

module.exports = { calculateOrderSummary };
`,
    testSuite: [
      {
        id: "test-1",
        name: "Standard cart with CA tax and no discount",
        runCode: `
          const { calculateOrderSummary } = require('./calculator');
          const items = [{ price: 20, quantity: 2 }, { price: 15, quantity: 1 }];
          const res = calculateOrderSummary(items, null, "CA");
          if (res.subtotal !== 55) throw new Error(\`Expected subtotal 55, got \${res.subtotal}\`);
          if (res.tax !== 5.23) throw new Error(\`Expected CA tax 5.23, got \${res.tax}\`);
          if (res.shipping !== 0) throw new Error(\`Expected free shipping over 50, got \${res.shipping}\`);
          if (res.total !== 60.23) throw new Error(\`Expected total 60.23, got \${res.total}\`);
        `
      },
      {
        id: "test-2",
        name: "Promo code SAVE20 applied on orders over $100",
        runCode: `
          const { calculateOrderSummary } = require('./calculator');
          const items = [{ price: 60, quantity: 2 }];
          const res = calculateOrderSummary(items, "SAVE20", "TX");
          if (res.subtotal !== 120) throw new Error(\`Expected subtotal 120, got \${res.subtotal}\`);
          if (res.discountAmount !== 24) throw new Error(\`Expected discount 24, got \${res.discountAmount}\`);
          if (res.total !== 102) throw new Error(\`Expected total 102, got \${res.total}\`);
        `
      },
      {
        id: "test-3",
        name: "Cart under $50 includes $5.99 shipping fee",
        runCode: `
          const { calculateOrderSummary } = require('./calculator');
          const items = [{ price: 10, quantity: 2 }];
          const res = calculateOrderSummary(items, null, "DEFAULT");
          if (res.shipping !== 5.99) throw new Error(\`Expected shipping 5.99, got \${res.shipping}\`);
          if (res.total !== 26.99) throw new Error(\`Expected total 26.99, got \${res.total}\`);
        `
      },
      {
        id: "test-4",
        name: "Empty cart handles gracefully without NaN",
        runCode: `
          const { calculateOrderSummary } = require('./calculator');
          const res = calculateOrderSummary([], null, "NY");
          if (res.subtotal !== 0 || res.total !== 0 || res.shipping !== 0) {
            throw new Error(\`Expected all 0s for empty cart, got total \${res.total}\`);
          }
        `
      },
      {
        id: "test-5",
        name: "FLAT15 promo code does not make subtotal negative",
        runCode: `
          const { calculateOrderSummary } = require('./calculator');
          const items = [{ price: 10, quantity: 1 }];
          const res = calculateOrderSummary(items, "FLAT15", "TX");
          if (res.discountAmount > 10) throw new Error(\`Discount cannot exceed items subtotal\`);
          if (res.subtotal !== 10) throw new Error(\`Expected subtotal 10, got \${res.subtotal}\`);
        `
      }
    ]
  },
  {
    id: "py-inventory-mutex",
    title: "Warehouse Inventory Mutex & Order Pipeline",
    category: "Concurrency & Data",
    difficulty: "Medium",
    language: "python",
    description: "An asynchronous Python order management system decrements warehouse stock and validates reservation timeouts across 2 connected files (order_service.py and inventory.py). Race condition bugs allow negative inventory allocations!",
    bugsCount: 2,
    devGoal: "Fix the stock validation in inventory.py and VIP check in order_service.py so all test cases pass.",
    mafiaGoal: "Bypass stock locks or invert reservation expiration logic to cause inventory drift.",
    activeFileName: "order_service.py",
    files: {
      "order_service.py": `# Order Processing Pipeline
# Connected to: inventory.py
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
    else:
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
# Connected to: order_service.py

class InventoryManager:
    def __init__(self, initial_stock=None):
        self.stock = dict(initial_stock or {})

    def has_sufficient_stock(self, sku, qty):
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
`
    },
    starterCode: `# Order Processing Pipeline
from inventory import InventoryManager

def process_order(inventory_mgr, order_id, item_sku, requested_qty, is_vip=False):
    if requested_qty <= 0:
        return {"status": "REJECTED", "reason": "INVALID_QUANTITY", "order_id": order_id}

    if not is_vip:
        if not inventory_mgr.has_sufficient_stock(item_sku, requested_qty):
            return {"status": "REJECTED", "reason": "OUT_OF_STOCK", "order_id": order_id}

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
  },
  {
    id: "js-payment-gateway",
    title: "Payment Gateway Tokenizer & Idempotency Router",
    category: "Fintech & Web APIs",
    difficulty: "Medium",
    language: "javascript",
    description: "A payment router processes credit card tokens, enforces idempotency keys in gateway.js, and applies multi-currency conversions via currency.js. Flawed cache checks allow duplicate charges!",
    bugsCount: 2,
    devGoal: "Fix idempotency key hashing in gateway.js and currency exchange in currency.js.",
    mafiaGoal: "Bypass idempotency locks or introduce rounding errors in exchange rates.",
    activeFileName: "gateway.js",
    files: {
      "gateway.js": `// Payment Router and Idempotency Guard
// Connected to: currency.js
const { convertCurrency } = require('./currency');

function processPayment(paymentRequest, idempotencyStore) {
  const { idempotencyKey, amount, currency, merchantId } = paymentRequest;

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "MISSING_IDEMPOTENCY_KEY" };
  }

  // Idempotency check
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
// Connected to: gateway.js

const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0065
};

function convertCurrency(amount, fromCurrency, toCurrency = "USD") {
  if (fromCurrency === toCurrency) return amount;
  const rateFrom = EXCHANGE_RATES[fromCurrency] || 1.0;
  const converted = amount * rateFrom;
  return Math.round(converted * 100) / 100;
}

module.exports = { convertCurrency, EXCHANGE_RATES };
`
    },
    starterCode: `const { convertCurrency } = require('./currency');

function processPayment(paymentRequest, idempotencyStore) {
  const { idempotencyKey, amount, currency, merchantId } = paymentRequest;

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { success: false, error: "MISSING_IDEMPOTENCY_KEY" };
  }

  if (idempotencyStore.has(idempotencyKey)) {
    return {
      success: true,
      cached: true,
      transactionId: idempotencyStore.get(idempotencyKey).transactionId,
      message: "Idempotent response replayed"
    };
  }

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
    testSuite: [
      {
        id: "pay-test-1",
        name: "First transaction generates settled payment ID",
        runCode: `
          const { processPayment } = require('./gateway');
          const store = new Map();
          const req = { idempotencyKey: "key-1", amount: 100, currency: "USD", merchantId: "M1" };
          const res = processPayment(req, store);
          if (!res.success || res.cached) throw new Error("First payment must be freshly settled");
          if (!res.transactionId.startsWith("tx_")) throw new Error("Invalid transaction ID format");
        `
      },
      {
        id: "pay-test-2",
        name: "Duplicate idempotency key returns cached transaction",
        runCode: `
          const { processPayment } = require('./gateway');
          const store = new Map();
          const req = { idempotencyKey: "key-1", amount: 100, currency: "USD", merchantId: "M1" };
          const res1 = processPayment(req, store);
          const res2 = processPayment(req, store);
          if (!res2.cached) throw new Error("Duplicate idempotency key must return cached: true");
          if (res1.transactionId !== res2.transactionId) throw new Error("Transaction IDs must match on replay");
        `
      },
      {
        id: "pay-test-3",
        name: "EUR currency correctly converted to USD",
        runCode: `
          const { convertCurrency } = require('./currency');
          const usd = convertCurrency(100, "EUR", "USD");
          if (usd !== 108) throw new Error("Expected 100 EUR to convert to 108 USD, got " + usd);
        `
      }
    ]
  }
];

export function getChallengeById(id) {
  return CHALLENGES.find(c => c.id === id) || CHALLENGES[0];
}

export function addCustomChallenge(challenge) {
  if (!challenge || !challenge.id) return null;
  const existingIdx = CHALLENGES.findIndex(c => c.id === challenge.id);
  if (existingIdx >= 0) {
    CHALLENGES[existingIdx] = challenge;
  } else {
    CHALLENGES.unshift(challenge);
  }
  return challenge;
}

