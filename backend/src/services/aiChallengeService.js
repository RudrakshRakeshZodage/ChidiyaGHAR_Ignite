import dotenv from "dotenv";
import { addCustomChallenge } from "../game/challenges.js";

dotenv.config();

const AIHUBMIX_API_KEY = process.env.AIHUBMIX_API_KEY || "sk-e9b46e8c75d44005b8a514d2e5bcbe66";
const AIHUBMIX_API_URL = "https://aihubmix.com/v1/chat/completions";

/**
 * Fallback algorithmic templates for instant offline AI generation
 */
const TEMPLATES = [
  {
    topic: "bank",
    id: "ai-banking-ledger",
    title: "High-Frequency Banking Ledger & Double-Spending Guard",
    category: "Fintech & Security",
    difficulty: "Medium",
    description: "An automated bank ledger processes parallel debit/credit transactions, holds overdraft protection, and checks for double-spending nonces. However, concurrent transfer edge cases are allowing illegal balance drains!",
    bugsCount: 2,
    devGoal: "Fix nonce validation and negative balance bounds so all 4 transaction tests pass.",
    mafiaGoal: "Silently alter nonce checks or invert balance subtraction to permit unauthorized overdrafts.",
    starterCode: `function processTransactions(account, transactions) {
  let balance = account.balance;
  const processedNonces = new Set(account.processedNonces || []);
  const successfulTx = [];
  const rejectedTx = [];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];

    // Bug 1: Nonce check is flawed (allows double spending if nonce is 0 or truthy error)
    if (processedNonces.has(tx.nonce)) {
      rejectedTx.push({ id: tx.id, reason: "DOUBLE_SPEND_NONCE" });
      continue;
    }

    if (tx.type === "DEBIT") {
      // Bug 2: Overdraft limit not respecting account max overdraft limit
      if (balance - tx.amount < -(account.overdraftLimit || 0)) {
        rejectedTx.push({ id: tx.id, reason: "INSUFFICIENT_FUNDS" });
        continue;
      }
      balance -= tx.amount;
    } else if (tx.type === "CREDIT") {
      balance += tx.amount;
    }

    processedNonces.add(tx.nonce);
    successfulTx.push(tx.id);
  }

  return {
    finalBalance: Math.round(balance * 100) / 100,
    successfulCount: successfulTx.length,
    rejectedCount: rejectedTx.length,
    successfulTx,
    rejectedTx
  };
}`,
    testSuite: [
      {
        id: "test-bank-1",
        name: "Standard debit and credit balance calculation",
        runCode: `
          const acc = { balance: 100, overdraftLimit: 50 };
          const txs = [
            { id: "tx1", type: "DEBIT", amount: 30, nonce: 101 },
            { id: "tx2", type: "CREDIT", amount: 50, nonce: 102 }
          ];
          const res = processTransactions(acc, txs);
          if (res.finalBalance !== 120) throw new Error("Expected final balance 120, got " + res.finalBalance);
          if (res.successfulCount !== 2) throw new Error("Expected 2 successful transactions");
        `
      },
      {
        id: "test-bank-2",
        name: "Double-spending duplicate nonce is rejected",
        runCode: `
          const acc = { balance: 500, overdraftLimit: 0, processedNonces: [999] };
          const txs = [
            { id: "txA", type: "DEBIT", amount: 50, nonce: 999 },
            { id: "txB", type: "DEBIT", amount: 20, nonce: 1001 }
          ];
          const res = processTransactions(acc, txs);
          if (res.rejectedCount !== 1) throw new Error("Duplicate nonce 999 must be rejected");
          if (res.finalBalance !== 480) throw new Error("Expected balance 480, got " + res.finalBalance);
        `
      },
      {
        id: "test-bank-3",
        name: "Overdraft limit enforcement",
        runCode: `
          const acc = { balance: 20, overdraftLimit: 30 };
          const txs = [
            { id: "tx1", type: "DEBIT", amount: 60, nonce: 501 }
          ];
          const res = processTransactions(acc, txs);
          if (res.rejectedCount !== 1) throw new Error("Transaction exceeding balance + overdraft must be rejected");
          if (res.finalBalance !== 20) throw new Error("Balance should remain 20");
        `
      }
    ]
  },
  {
    topic: "jwt",
    id: "ai-jwt-validator",
    title: "JWT Token Header & Claim Expiration Guard",
    category: "Auth & Security",
    difficulty: "Medium",
    description: "A stateless authentication middleware parses JWT tokens, verifies expiration timestamps, and validates user roles. However, tokens without expiration claims or malformed signatures are bypassing the guard!",
    bugsCount: 2,
    devGoal: "Fix token expiration comparisons and signature structure validation.",
    mafiaGoal: "Bypass expiration checks or invert role authorization checks.",
    starterCode: `function validateJwtClaims(tokenString, requiredRole, currentEpochSec) {
  if (!tokenString || typeof tokenString !== "string") {
    return { valid: false, error: "MALFORMED_TOKEN" };
  }

  const parts = tokenString.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "INVALID_STRUCTURE" };
  }

  try {
    const payload = JSON.parse(atob(parts[1]));

    // Bug 1: Token expiration logic is inverted or allows expired tokens
    if (payload.exp && payload.exp < currentEpochSec) {
      return { valid: false, error: "TOKEN_EXPIRED" };
    }

    // Bug 2: Missing role check when requiredRole is specified
    if (requiredRole && payload.role !== requiredRole && payload.role !== "SUPERADMIN") {
      return { valid: false, error: "UNAUTHORIZED_ROLE" };
    }

    return {
      valid: true,
      userId: payload.sub,
      role: payload.role
    };
  } catch (err) {
    return { valid: false, error: "PARSE_ERROR" };
  }
}`,
    testSuite: [
      {
        id: "test-jwt-1",
        name: "Valid active token returns valid user claims",
        runCode: `
          const header = btoa(JSON.stringify({ alg: "HS256" }));
          const payload = btoa(JSON.stringify({ sub: "user_42", role: "ADMIN", exp: 2000000000 }));
          const token = header + "." + payload + ".signature123";
          const res = validateJwtClaims(token, "ADMIN", 1700000000);
          if (!res.valid) throw new Error("Valid token should pass: " + res.error);
          if (res.userId !== "user_42") throw new Error("Expected userId user_42");
        `
      },
      {
        id: "test-jwt-2",
        name: "Expired token is rejected with TOKEN_EXPIRED",
        runCode: `
          const header = btoa(JSON.stringify({ alg: "HS256" }));
          const payload = btoa(JSON.stringify({ sub: "user_42", role: "ADMIN", exp: 1600000000 }));
          const token = header + "." + payload + ".signature123";
          const res = validateJwtClaims(token, "ADMIN", 1700000000);
          if (res.valid) throw new Error("Expired token must not be valid!");
          if (res.error !== "TOKEN_EXPIRED") throw new Error("Expected error TOKEN_EXPIRED");
        `
      },
      {
        id: "test-jwt-3",
        name: "Unauthorized role is rejected",
        runCode: `
          const header = btoa(JSON.stringify({ alg: "HS256" }));
          const payload = btoa(JSON.stringify({ sub: "user_99", role: "GUEST", exp: 2000000000 }));
          const token = header + "." + payload + ".signature123";
          const res = validateJwtClaims(token, "ADMIN", 1700000000);
          if (res.valid) throw new Error("Guest role should not access admin resource");
          if (res.error !== "UNAUTHORIZED_ROLE") throw new Error("Expected UNAUTHORIZED_ROLE error");
        `
      }
    ]
  }
];

/**
 * Generates an AI challenge using AIHubMix or smart fallback template
 */
export async function generateAiChallenge(prompt) {
  const cleanedPrompt = prompt?.trim() || "Rate limiting sliding window algorithm";
  const challengeId = "ai-" + Math.random().toString(36).substring(2, 9);

  // 1. Try AIHubMix LLM Generation
  try {
    const systemPrompt = `You are a Principal Software Engineer crafting competitive coding challenges for a multiplayer game called Code Mafia.
Given the user's prompt, generate a self-contained JavaScript coding challenge with 1-2 realistic, subtle bugs, and 3-4 unit test assertions.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Short catchy title",
  "category": "Algorithm / Fintech / Security / Web",
  "difficulty": "Easy" | "Medium" | "Hard",
  "description": "2-3 sentence problem scenario",
  "bugsCount": 2,
  "devGoal": "What developers need to fix",
  "mafiaGoal": "How the mafia can sabotage it",
  "starterCode": "Complete JS function containing 1-2 intentional subtle bugs",
  "solutionCode": "Fixed working JS function",
  "testSuite": [
    {
      "id": "test-1",
      "name": "Description of test case",
      "runCode": "JS code that calls the function and throws Error on failure (e.g. const res = fn(...); if (res !== expected) throw new Error('Expected ...');"
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
          { role: "user", content: `Create a coding challenge based on this prompt: "${cleanedPrompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.title && parsed.starterCode && Array.isArray(parsed.testSuite)) {
          const customChallenge = {
            id: challengeId,
            title: parsed.title,
            category: parsed.category || "AI Generated",
            difficulty: parsed.difficulty || "Medium",
            description: parsed.description || `AI generated challenge for: ${cleanedPrompt}`,
            bugsCount: parsed.bugsCount || 2,
            devGoal: parsed.devGoal || "Fix all bugs to pass the automated test suite.",
            mafiaGoal: parsed.mafiaGoal || "Introduce subtle regressions to prevent tests from passing.",
            starterCode: parsed.starterCode,
            solutionCode: parsed.solutionCode || parsed.starterCode,
            testSuite: parsed.testSuite.map((t, idx) => ({
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
    console.warn("AIHubMix challenge generation note:", err.message);
  }

  // 2. Instant Fallback Template matching prompt keywords
  const promptLower = cleanedPrompt.toLowerCase();
  let selected = TEMPLATES.find(t => promptLower.includes(t.topic)) || TEMPLATES[0];

  const customChallenge = {
    ...selected,
    id: challengeId,
    title: `AI: ${selected.title}`,
    description: `${selected.description} (Generated for: "${cleanedPrompt}")`
  };

  addCustomChallenge(customChallenge);
  return { success: true, challenge: customChallenge };
}
