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
  // Bug 1: Items total off-by-one error on array iteration
  let subtotal = 0;
  for (let i = 0; i <= items.length; i++) {
    const item = items[i];
    if (item) {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  // Bug 2: Discount application logic flawed
  let discountAmount = 0;
  if (promoCode === "SAVE20" && subtotal > 100) {
    discountAmount = subtotal * 0.20;
  } else if (promoCode === "FLAT15") {
    discountAmount = 15; // Should not exceed subtotal
  }

  let discountedSubtotal = subtotal - discountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  // Bug 3: Tax tier calculation bug
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
      { id: "test-1", name: "Standard cart with CA tax and no discount" },
      { id: "test-2", name: "Promo code SAVE20 applied on orders over $100" },
      { id: "test-3", name: "Cart under $50 should include $5.99 shipping fee" },
      { id: "test-4", name: "Empty cart handles gracefully without errors" },
      { id: "test-5", name: "FLAT15 promo code does not make subtotal negative" }
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
      { id: "test-auth-1", name: "Admin can access editor-level resource" },
      { id: "test-auth-2", name: "Expired token should be rejected" },
      { id: "test-auth-3", name: "Viewer cannot access admin resource" },
      { id: "test-auth-4", name: "Case-insensitive Bearer prefix support" }
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
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
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
      { id: "test-lru-1", name: "Basic put and get functionality" },
      { id: "test-lru-2", name: "Least recently used item is evicted when capacity exceeded" },
      { id: "test-lru-3", name: "Overwriting an existing key updates value and recency" }
    ]
  }
];
