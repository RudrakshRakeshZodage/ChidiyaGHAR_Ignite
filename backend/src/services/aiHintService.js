import dotenv from "dotenv";

dotenv.config();

/**
 * AI Hint Service for Code Mafia II
 * Provides players with a single-use tactical AI Hint during coding rounds.
 * Powered by OpenRouter API (https://openrouter.ai) with algorithmic fallback.
 */

function extractJsonFromLlm(text) {
  if (!text || typeof text !== "string") return null;
  let clean = text.trim();
  
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

/**
 * Algorithmic Fallback Hint Generator when OpenRouter API is unreachable
 */
function generateFallbackHint(challenge, currentCode, failedTests = []) {
  const title = challenge?.title || "Coding Mission";
  const desc = challenge?.description || "";
  const lang = challenge?.language || "javascript";
  const failing = failedTests.length > 0 ? failedTests[0] : null;

  let hintText = "Inspect conditional edge cases and variable state transitions.";
  let codeClue = "";

  if (failing) {
    hintText = `Test '${failing.name || failing}' is failing. Check the expected return value against boundary inputs (null, empty list, or zero).`;
  } else if (desc.toLowerCase().includes("discount") || desc.toLowerCase().includes("price")) {
    hintText = "Verify percentage calculation and rounding logic. Ensure thresholds apply strictly (> vs >=) and negative numbers are sanitized.";
    codeClue = "const discount = total >= threshold ? total * rate : 0;";
  } else if (desc.toLowerCase().includes("array") || desc.toLowerCase().includes("list") || desc.toLowerCase().includes("sort")) {
    hintText = "Check your loop termination index and array mutations. Ensure you are not modifying the array while iterating over it.";
    codeClue = "for (let i = 0; i < arr.length; i++) { ... }";
  } else if (desc.toLowerCase().includes("sql") || lang === "sql") {
    hintText = "Ensure JOIN conditions and WHERE clauses correctly filter active rows without excluding NULL values on LEFT JOINs.";
    codeClue = "SELECT * FROM items WHERE status = 'active' AND price > 0;";
  } else {
    hintText = "Verify function arguments and return types. Trace the data flow on the smallest input case step-by-step.";
    codeClue = "// Double check edge cases: empty input, 0, or single elements";
  }

  return {
    title: `Tactical Hint: ${title}`,
    hint: hintText,
    codeClue,
    provider: "algorithmic-fallback"
  };
}

/**
 * Generate Tactical AI Hint using OpenRouter API
 */
export async function generateAiHint({
  challenge,
  currentCode,
  files,
  failedTests = [],
  role = "DEVELOPER",
  activeFileName = "main.js"
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey) {
    console.log("[AI Hint] No OPENROUTER_API_KEY found, using local tactical fallback.");
    return generateFallbackHint(challenge, currentCode, failedTests);
  }

  const systemPrompt = `You are the Outlaw AI Tactical Coding Advisor in Code Mafia II (a competitive multiplayer programming game).
A player has burned their 1-time emergency AI Hint for this mission.
Your goal is to give a punchy, high-value, tactical hint that points out logic bugs, edge cases, off-by-one errors, or incorrect return types WITHOUT giving away the complete solution verbatim.

You must respond ONLY with a valid JSON object in this exact schema:
{
  "title": "Short punchy hint headline (max 6 words, e.g. 'Off-by-One in Loop Bound')",
  "hint": "2 to 3 concise bullet points or short paragraph with sharp tactical advice on where the regression is and how to fix it.",
  "codeClue": "Optional 1-3 line code snippet or conceptual pattern to help them solve it"
}`;

  const failedTestsSummary = failedTests.length > 0 
    ? failedTests.map(t => typeof t === 'object' ? `${t.name}: ${t.error || 'Failed'}` : String(t)).join("\n")
    : "No test run yet or general mission help requested.";

  const userPrompt = `MISSION: ${challenge?.title || 'Unknown Challenge'}
LANGUAGE: ${challenge?.language || 'javascript'}
DESCRIPTION:
${challenge?.description || ''}

TEST SUITE:
${(challenge?.testSuite || []).map(t => `- ${t.name}`).join("\n")}

FAILING TESTS / STATUS:
${failedTestsSummary}

CURRENT ACTIVE FILE: ${activeFileName}
CURRENT CODE:
\`\`\`
${currentCode || '// No code written yet'}
\`\`\`

Provide the tactical hint JSON now.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://codemafia.app",
        "X-Title": "Code Mafia II"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 600,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[AI Hint] OpenRouter error (${res.status}): ${errText}`);
      return generateFallbackHint(challenge, currentCode, failedTests);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = extractJsonFromLlm(content);

    if (parsed && parsed.hint) {
      return {
        title: parsed.title || "AI Tactical Hint",
        hint: parsed.hint,
        codeClue: parsed.codeClue || "",
        provider: "openrouter"
      };
    }

    return generateFallbackHint(challenge, currentCode, failedTests);
  } catch (err) {
    console.warn("[AI Hint] Exception calling OpenRouter API:", err.message);
    return generateFallbackHint(challenge, currentCode, failedTests);
  }
}
