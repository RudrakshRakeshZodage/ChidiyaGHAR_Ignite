import assert from "node:assert";
import { runChallengeTests } from "../src/game/TestEngine.js";
import { CHALLENGES } from "../src/game/challenges.js";
import { RoomManager, GAME_STATES } from "../src/game/RoomManager.js";

console.log("🧪 Running Backend Unit Tests...");

// 1. Test sandboxed test runner with buggy starter code (should fail some tests)
const cartChallenge = CHALLENGES[0];
const buggyRun = runChallengeTests(cartChallenge.starterCode, cartChallenge.testSuite);
console.log(`- Buggy code test run: ${buggyRun.passedCount}/${buggyRun.totalCount} passing (Expected failures)`);
assert.strictEqual(buggyRun.allPassed, false, "Buggy code should not pass all tests");

// 2. Test fixed code
const fixedCartCode = `
function calculateOrderSummary(items, promoCode, userLocation) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.price) {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  let discountAmount = 0;
  if (promoCode === "SAVE20" && subtotal > 100) {
    discountAmount = subtotal * 0.20;
  } else if (promoCode === "FLAT15") {
    discountAmount = Math.min(15, subtotal);
  }

  let discountedSubtotal = subtotal - discountAmount;
  if (discountedSubtotal < 0) discountedSubtotal = 0;

  let taxRate = 0.05;
  if (userLocation === "CA") {
    taxRate = 0.095;
  } else if (userLocation === "NY") {
    taxRate = 0.08875;
  } else if (userLocation === "TX") {
    taxRate = 0.0625;
  }

  const tax = discountedSubtotal * taxRate;

  let shipping = 0;
  if (discountedSubtotal < 50 && discountedSubtotal > 0) {
    shipping = 5.99;
  }

  const total = subtotal === 0 ? 0 : (discountedSubtotal + tax + shipping);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}
`;

const fixedRun = runChallengeTests(fixedCartCode, cartChallenge.testSuite);
console.log(`- Fixed code test run: ${fixedRun.passedCount}/${fixedRun.totalCount} passing`);
if (!fixedRun.allPassed) {
  console.log("Failed tests in fixed code:", fixedRun.tests.filter(t => !t.passed));
}
assert.strictEqual(fixedRun.allPassed, true, "Fixed code should pass 100% of tests");

// 3. Test RoomManager flow
const mgr = new RoomManager();
const host = { id: "p1", name: "Alice", avatar: "👩‍💻" };
const room = mgr.createRoom(host);
assert.strictEqual(room.players.size, 1);
assert.strictEqual(room.status, GAME_STATES.LOBBY);

const joinRes = mgr.joinRoom(room.code, { id: "p2", name: "Bob", avatar: "👨‍💻" });
assert.strictEqual(joinRes.room.players.size, 2);

const startRes = mgr.startGame(room.code, "p1");
assert.strictEqual(startRes.room.status, GAME_STATES.ROLE_REVEAL);

console.log("✅ All Backend Unit Tests Passed Successfully!");
