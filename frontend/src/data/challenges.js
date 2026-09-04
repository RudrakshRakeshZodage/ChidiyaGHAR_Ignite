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
      { id: "sql-test-1", name: "Merchants with zero refunds are preserved in gross calculations" },
      { id: "sql-test-2", name: "Net revenue correctly subtracts refund deductions" },
      { id: "sql-test-3", name: "Fraud detection flags high volume merchants" }
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
    return Math.min(15, subtotal);
  }

  return 0;
}

module.exports = { applyDiscount };
`
    },
    starterCode: `const { calculateTax } = require('./tax_engine');
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
      { id: "test-1", name: "Standard cart with CA tax and no discount" },
      { id: "test-2", name: "Promo code SAVE20 applied on orders over $100" },
      { id: "test-3", name: "Cart under $50 includes $5.99 shipping fee" },
      { id: "test-4", name: "Empty cart handles gracefully without NaN" },
      { id: "test-5", name: "FLAT15 promo code does not make subtotal negative" }
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
      { id: "py-test-1", name: "Standard order deduction updates remaining stock" },
      { id: "py-test-2", name: "Order exceeding stock is rejected with OUT_OF_STOCK" },
      { id: "py-test-3", name: "VIP orders cannot deplete inventory into negative balance" }
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
      { id: "pay-test-1", name: "First transaction generates settled payment ID" },
      { id: "pay-test-2", name: "Duplicate idempotency key returns cached transaction" },
      { id: "pay-test-3", name: "EUR currency correctly converted to USD" }
    ]
  }
];

