/**
 * Built-in buggy code challenges for Code Mafia
 */

export const CHALLENGES = [
  {
    id: "cart-calculator",
    title: "E-Commerce Checkout & Tax Calculator",
    category: "Algorithms & Math",
    difficulty: "Medium",
    description: "The shopping cart checkout system calculates subtotal, applies discount promo codes, calculates progressive state tax, and shipping fees. However, customers are complaining of incorrect bill totals and free checkout exploits!",
    bugsCount: 3,
    devGoal: "Fix the discount calculation, tax tier logic, and precision rounding so all 5 automated tests pass.",
    mafiaGoal: "Silently alter condition boundaries, break tax bracket calculations, or introduce off-by-one errors to prevent tests from passing before the timer expires.",
    starterCode: `function calculateOrderSummary(items, promoCode, userLocation) {
  // Bug 1: Items total does not validate item quantity or handles negative values properly
  let subtotal = 0;
  for (let i = 0; i <= items.length; i++) { // Intentional off-by-one error
    const item = items[i];
    if (item) {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  // Bug 2: Discount application has flawed condition & logic
  let discountAmount = 0;
  if (promoCode === "SAVE20" && subtotal > 100) {
    discountAmount = subtotal * 0.20;
  } else if (promoCode === "FLAT15") {
    discountAmount = 15; // Should not exceed subtotal
  }

  let discountedSubtotal = subtotal - discountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  // Bug 3: Tax tier calculation bug (state tax applied incorrectly)
  let taxRate = 0.05; // default 5%
  if (userLocation === "CA") {
    taxRate = 0.095;
  } else if (userLocation === "NY") {
    taxRate = 0.08875;
  } else if (userLocation === "TX") {
    taxRate = 0.0625;
  }

  const tax = discountedSubtotal * taxRate;

  // Free shipping over $50 after discount, otherwise $5.99
  let shipping = 0;
  if (discountedSubtotal < 50 && discountedSubtotal > 0) {
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
`,
    testSuite: [
      {
        id: "test-1",
        name: "Standard cart with CA tax and no discount",
        runCode: `
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
          const items = [{ price: 60, quantity: 2 }]; // subtotal = 120
          const res = calculateOrderSummary(items, "SAVE20", "TX");
          if (res.subtotal !== 120) throw new Error(\`Expected subtotal 120, got \${res.subtotal}\`);
          if (res.discountAmount !== 24) throw new Error(\`Expected discount 24, got \${res.discountAmount}\`);
          if (res.total !== 102) throw new Error(\`Expected total 102 (96 sub + 6 tax), got \${res.total}\`);
        `
      },
      {
        id: "test-3",
        name: "Cart under $50 should include $5.99 shipping fee",
        runCode: `
          const items = [{ price: 10, quantity: 2 }]; // subtotal = 20
          const res = calculateOrderSummary(items, null, "DEFAULT");
          if (res.shipping !== 5.99) throw new Error(\`Expected shipping 5.99, got \${res.shipping}\`);
          if (res.total !== 26.99) throw new Error(\`Expected total 26.99, got \${res.total}\`);
        `
      },
      {
        id: "test-4",
        name: "Empty cart handles gracefully without errors",
        runCode: `
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
          const items = [{ price: 10, quantity: 1 }];
          const res = calculateOrderSummary(items, "FLAT15", "TX");
          if (res.discountAmount > 10) throw new Error(\`Discount cannot exceed items subtotal\`);
          if (res.subtotal !== 10) throw new Error(\`Expected subtotal 10, got \${res.subtotal}\`);
        `
      }
    ]
  },
  {
    id: "auth-jwt-guard",
    title: "Auth Guard & JWT Role Validator",
    category: "Security & Middleware",
    difficulty: "Hard",
    description: "The authentication middleware validates incoming bearer tokens, checks role hierarchy ('admin' > 'editor' > 'viewer'), and verifies token expiration timestamp. Malicious tokens are slipping through!",
    bugsCount: 3,
    devGoal: "Fix token extraction, epoch timestamp checks, and role hierarchy permissions.",
    mafiaGoal: "Corrupt role permission matrices or flip boolean expiration condition checks.",
    starterCode: `function authorizeRequest(authHeader, requiredRole, currentTimeSeconds) {
  if (!authHeader) return { authorized: false, error: "Missing token" };

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return { authorized: false, error: "Invalid header format" };
  }

  let payload;
  try {
    payload = JSON.parse(parts[1]);
  } catch(e) {
    return { authorized: false, error: "Malformed token payload" };
  }

  // Bug: Inverted expiration check
  if (payload.exp && payload.exp < currentTimeSeconds) {
    // expired token
  }

  // Bug: Role hierarchy logic flawed
  const rolePower = { "viewer": 1, "editor": 2, "admin": 3 };
  const userPower = rolePower[payload.role] || 0;
  const targetPower = rolePower[requiredRole] || 0;

  if (userPower <= targetPower) {
    return { authorized: false, error: "Insufficient privileges" };
  }

  return {
    authorized: true,
    user: payload.sub,
    role: payload.role
  };
}
`,
    testSuite: [
      {
        id: "test-auth-1",
        name: "Admin can access editor-level resource",
        runCode: `
          const token = JSON.stringify({ sub: "user123", role: "admin", exp: 2000 });
          const res = authorizeRequest("Bearer " + token, "editor", 1000);
          if (!res.authorized) throw new Error(\`Admin should be authorized for editor resource: \${res.error}\`);
        `
      },
      {
        id: "test-auth-2",
        name: "Expired token should be rejected",
        runCode: `
          const token = JSON.stringify({ sub: "user123", role: "admin", exp: 900 });
          const res = authorizeRequest("Bearer " + token, "viewer", 1000);
          if (res.authorized) throw new Error("Expired token was incorrectly authorized!");
        `
      },
      {
        id: "test-auth-3",
        name: "Viewer cannot access admin resource",
        runCode: `
          const token = JSON.stringify({ sub: "user456", role: "viewer", exp: 2000 });
          const res = authorizeRequest("Bearer " + token, "admin", 1000);
          if (res.authorized) throw new Error("Viewer should NOT be authorized for admin resource");
        `
      },
      {
        id: "test-auth-4",
        name: "Case-insensitive Bearer prefix support",
        runCode: `
          const token = JSON.stringify({ sub: "user789", role: "editor", exp: 2000 });
          const res = authorizeRequest("bearer " + token, "editor", 1000);
          if (!res.authorized) throw new Error("bearer lowercase prefix should be accepted");
        `
      }
    ]
  },
  {
    id: "lru-cache",
    title: "LRU Cache with TTL Eviction",
    category: "Data Structures",
    difficulty: "Medium",
    description: "High-performance Least Recently Used (LRU) Cache used for caching database queries. It supports capacity limits, get/put, and time-to-live expirations. Cache evicts newest keys instead of oldest!",
    bugsCount: 2,
    devGoal: "Ensure items are properly refreshed on get/put and the true least-recently-used item is evicted.",
    mafiaGoal: "Mess with key deletion order or Map iteration order to fail capacity eviction tests.",
    starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    // Bug: Get does not refresh recency in Map
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Bug: Evicts the newest key instead of the oldest key
      const keys = Array.from(this.cache.keys());
      const newestKey = keys[keys.length - 1];
      this.cache.delete(newestKey);
    }
    this.cache.set(key, value);
  }

  size() {
    return this.cache.size;
  }
}
`,
    testSuite: [
      {
        id: "test-lru-1",
        name: "Basic put and get functionality",
        runCode: `
          const lru = new LRUCache(2);
          lru.put(1, "one");
          lru.put(2, "two");
          if (lru.get(1) !== "one") throw new Error("Failed to get existing key 1");
          if (lru.get(2) !== "two") throw new Error("Failed to get existing key 2");
          if (lru.get(3) !== -1) throw new Error("Non-existent key should return -1");
        `
      },
      {
        id: "test-lru-2",
        name: "Least recently used item is evicted when capacity exceeded",
        runCode: `
          const lru = new LRUCache(2);
          lru.put(1, "one");
          lru.put(2, "two");
          lru.get(1); // key 1 is now most recently used; key 2 is oldest
          lru.put(3, "three"); // should evict key 2
          if (lru.get(2) !== -1) throw new Error("Key 2 should have been evicted!");
          if (lru.get(1) !== "one") throw new Error("Key 1 should still exist in cache");
          if (lru.get(3) !== "three") throw new Error("Key 3 should exist in cache");
        `
      },
      {
        id: "test-lru-3",
        name: "Overwriting an existing key updates value and recency",
        runCode: `
          const lru = new LRUCache(2);
          lru.put(1, "original");
          lru.put(2, "two");
          lru.put(1, "updated");
          lru.put(3, "three"); // should evict key 2, keeping updated key 1
          if (lru.get(1) !== "updated") throw new Error("Key 1 should have updated value");
          if (lru.get(2) !== -1) throw new Error("Key 2 should have been evicted");
        `
      }
    ]
  }
];

export function getChallengeById(id) {
  return CHALLENGES.find(c => c.id === id) || CHALLENGES[0];
}
