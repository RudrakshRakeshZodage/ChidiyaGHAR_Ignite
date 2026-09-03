/**
 * AI Riddle Service for Code Mafia Mystery Box
 * Generates witty, one-sentence rhyming and wordplay riddles tailored to the Mafia's username
 * Powered by AIHubMix (https://console.aihubmix.com) with resilient local algorithmic fallback
 */

const AIHUBMIX_API_KEY = process.env.AIHUBMIX_API_KEY || process.env.OPENAI_API_KEY || "";
const AIHUBMIX_BASE_URL = process.env.AIHUBMIX_BASE_URL || "https://aihubmix.com/v1";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

// Special curated wordplay riddles for common names / words
const SPECIAL_NAME_RIDDLES = {
  jammy: [
    "I sound like sweet strawberry jam spread on morning toast, but in this lobby I am the secret saboteur ghost!",
    "My name is as sweet and sticky as fruit on bread, but my injected bugs leave your test cases red!",
    "You might put me in a sandwich or a tasty snack, but behind the scenes I stage a silent code attack!"
  ],
  os: [
    "I am the 2-letter Operating System running on your PC, or an alias as short as a hacker can be!",
    "Like Windows or Linux, I sound like an OS on your screen, but I corrupt the test suites behind the machine!",
    "Just two little letters make up my complete name — find the shortest alias in the squad's game!"
  ],
  dev: [
    "My alias sounds like a hardworking developer writing clean lines, but I am secretly corrupting all your logic designs!",
    "I sound like 'Dev' who builds apps day and night, but I sneakily flip conditions out of sight!"
  ],
  bunny: [
    "I hop like a rabbit through your functions and loops, leaving stealthy syntax errors in the soup!",
    "With fluffy ears and a hop in my stride, I am the cute saboteur you haven't identified!"
  ],
  priti: [
    "My name sounds like 'pretty' and starts with a 'P', but my broken discount logic will offer no mercy!",
    "I sound pleasant and graceful like a melody line, but I injected off-by-one bugs into your design!"
  ],
  aarav: [
    "I start with the first letter of the alphabet twice with an 'A', but I take all your passing unit tests away!",
    "My name echoes 'A-A' like the alphabet's start, but breaking your assertions is my secret art!"
  ],
  chirag: [
    "My name means a glowing lamp or a guiding light, but in this codebase I plunge your tests into the dark night!",
    "I sound like a shining flame in the dark, but in this code challenge I leave a sinister mark!"
  ],
  pixel: [
    "I am the tiny colored dot that forms your display, but I paint your automated test suites in dismay!",
    "Like a rogue pixel on a broken screen, I corrupt every function in between!"
  ],
  ninja: [
    "I strike with stealth and vanish in the mist, corrupting array indices that do not exist!",
    "You won't hear my footsteps when I push bad code — I am the shadow saboteur on the motherboard road!"
  ],
  ghost: [
    "I am invisible in the logs and float through the air, corrupting your return types beyond repair!",
    "A phantom coder with spooky stealth — I haunt your repository and ruin its health!"
  ]
};

// Letter-based rhyming sentence riddles for initials (A-Z)
const LETTER_RIDDLES = {
  A: "I start like 'Algorithm' and 'Array' with an 'A', but I take all your passing unit tests away!",
  B: "I buzz like a 'Bug' and start with a 'B', breaking your assertions so you can't be bug-free!",
  C: "I start with 'C' like 'Compiler' and 'Class', but I make sure your unit tests will not pass!",
  D: "I start with 'D' like 'Debug' and 'Dev', but I invert your logic on the fast web!",
  E: "I start with 'E' like 'Exception' and 'Error', bringing to your test runner pure terror!",
  F: "I start with 'F' like 'Function' and 'File', deleting your edge cases with a villainous smile!",
  G: "I start with 'G' like 'Git' and 'Global', making my sabotage commits totally ignoble!",
  H: "I start with 'H' like 'Hacker' and 'Header', making your codebase worse instead of better!",
  I: "I start with 'I' like 'Index' and 'Iteration', sabotaging loops across the entire nation!",
  J: "I start with 'J' like 'Java' and 'JSON' (or 'Jammy'), cooking up sweet bugs for the whole team family!",
  K: "I start with 'K' like 'Keyword' and 'Key', locking up your tests and throwing away the key!",
  L: "I start with 'L' like 'Loop' and 'Lambda', hiding stealth regressions in the propaganda!",
  M: "I start with 'M' like 'Mafia' and 'Memory', leaking your RAM into an endless cemetery!",
  N: "I start with 'N' like 'Null' and 'NaN', breaking your return types whenever I can!",
  O: "I start with 'O' like 'Operating System' and 'OS', making your whole project an unstable mess!",
  P: "I start with 'P' like 'Python', 'Pointer', and 'Priti', crashing your servers in the digital city!",
  Q: "I start with 'Q' like 'Queue' and 'Query', making your test results look bleak and blurry!",
  R: "I start with 'R' like 'Runtime' and 'Recursion', staging a malicious logic excursion!",
  S: "I start with 'S' like 'Syntax' and 'Script', leaving your console assertion completely tripped!",
  T: "I start with 'T' like 'Terminal' and 'Thread', leaving your unit test assertions red!",
  U: "I start with 'U' like 'Undefined' and 'User', making the developer team the ultimate loser!",
  V: "I start with 'V' like 'Variable' and 'Virtual', causing test failures that are habitual!",
  W: "I start with 'W' like 'Warning' and 'While', breaking infinite loops with villainous style!",
  X: "I start with 'X' like 'XML' and 'X-Factor', breaking the build like a rogue bad actor!",
  Y: "I start with 'Y' like 'Yield' and 'YAML', loading your stack with heavy payload camel!",
  Z: "I start with 'Z' like 'Zero' and 'Zip', crashing your build before the final ship!"
};

/**
 * Generates dynamic riddles tailored to a username and avatar
 */
export function generateFallbackRiddles(mafiaName, mafiaAvatar = "👨‍💻", count = 5) {
  const name = mafiaName || "Player";
  const lower = name.toLowerCase();
  const len = name.length;
  const firstLetter = name[0]?.toUpperCase() || "A";
  const lastLetter = name[len - 1]?.toUpperCase() || "Z";
  const upperName = name.toUpperCase();

  const riddles = [];

  // Helper to create letter mask (e.g. "P _ _ _ _")
  const createMask = (unlockedCount) => {
    let mask = "";
    for (let i = 0; i < len; i++) {
      if (i < unlockedCount) {
        mask += upperName[i] + " ";
      } else {
        mask += "_ ";
      }
    }
    return mask.trim();
  };

  // Clue 1: Word meaning / Initial Letter Rhyme
  let clue1Riddle = SPECIAL_NAME_RIDDLES[lower]?.[0] || LETTER_RIDDLES[firstLetter] || `I start with the character "${firstLetter}", bringing broken unit tests into your code sector!`;
  riddles.push({
    testIndex: 0,
    clueNumber: 1,
    title: `The Letter "${firstLetter}" Riddle`,
    riddle: clue1Riddle,
    revealedSnippet: createMask(1),
    hintText: `Starts with "${firstLetter}"`
  });

  // Clue 2: Length & Structure sentence
  let clue2Riddle = SPECIAL_NAME_RIDDLES[lower]?.[1] || `Count every letter in my digital alias — exactly ${len} characters are sabotaging your campus!`;
  riddles.push({
    testIndex: 1,
    clueNumber: 2,
    title: "Alias Fingerprint",
    riddle: clue2Riddle,
    revealedSnippet: createMask(Math.min(2, len)),
    hintText: `Name is ${len} characters long`
  });

  // Clue 3: Avatar visual trace sentence
  riddles.push({
    testIndex: 2,
    clueNumber: 3,
    title: "Visual Identity Clue",
    riddle: `Check the lobby icons on your squad display — the suspect is equipped with the ${mafiaAvatar} avatar today!`,
    revealedSnippet: createMask(Math.min(3, len)),
    hintText: `Avatar icon: ${mafiaAvatar}`
  });

  // Clue 4: Ending Letter / Rhyme sentence
  riddles.push({
    testIndex: 3,
    clueNumber: 4,
    title: "Terminal Signature",
    riddle: `The final letter of the saboteur's name matches the character "${lastLetter}" — examine who fits this pattern!`,
    revealedSnippet: createMask(Math.max(2, len - 1)),
    hintText: `Ends with "${lastLetter}"`
  });

  // Clue 5: Full unmasking sentence
  riddles.push({
    testIndex: 4,
    clueNumber: 5,
    title: "Final Unmasking",
    riddle: `All ciphers cracked! The letters spell out "${upperName}" — vote them out in the next emergency meeting!`,
    revealedSnippet: createMask(len),
    hintText: `Identity: ${upperName}`
  });

  return riddles.slice(0, count);
}

/**
 * Calls AIHubMix API to generate creative AI riddles for the Mafia player
 */
export async function generateAiRiddlesForMafia(mafiaName, mafiaAvatar = "👨‍💻", count = 5) {
  // If no API key configured, use instant fallback
  if (!AIHUBMIX_API_KEY) {
    console.log("ℹ️ AIHubMix API key not found in env, using resilient algorithmic riddle generator.");
    return generateFallbackRiddles(mafiaName, mafiaAvatar, count);
  }

  try {
    const prompt = `You are the Game Master AI for the multiplayer social deduction game "Code Mafia".
The secret Mafia saboteur's username is "${mafiaName}" (Avatar: "${mafiaAvatar}").

TASK:
Generate ${count} witty, single-sentence rhyming riddles or wordplay clues that progressively hint at the Mafia's username: "${mafiaName}".

CRITICAL GUIDELINES FOR RIDDLES:
1. If the name sounds like a common word/food/thing (e.g. "Jammy" -> jam on toast, "Os" -> operating system, "Dev" -> developer, "Bunny" -> rabbit), make the riddle a funny sentence based on that word meaning!
2. If the name starts with letter X (e.g. starts with 'P', 'J', 'O', etc.), write a 1-sentence rhyming clue featuring programming words starting with that letter (e.g. "I start like 'Python' and 'Pointer' with a P, but in this lobby I break your stability!").
3. Keep each riddle to exactly 1-2 punchy, rhyming sentences that can be read quickly during a fast match.

Return ONLY a valid JSON array of objects matching this exact schema:
[
  {
    "testIndex": 0,
    "clueNumber": 1,
    "title": "Short catchy title (e.g. The 'P' Rhyme Riddle)",
    "riddle": "1-2 sentence rhyming wordplay riddle",
    "revealedSnippet": "Letter mask showing progress, e.g. P _ _ _",
    "hintText": "Short 3-word summary hint"
  }
]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    const response = await fetch(`${AIHUBMIX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIHUBMIX_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "You are a specialized game master AI that outputs pure JSON arrays containing creative one-sentence rhyming riddles." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 650
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AIHubMix] API returned status ${response.status}. Using fallback.`);
      return generateFallbackRiddles(mafiaName, mafiaAvatar, count);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return generateFallbackRiddles(mafiaName, mafiaAvatar, count);
    }

    // Extract JSON from response
    const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return generateFallbackRiddles(mafiaName, mafiaAvatar, count);
  } catch (err) {
    console.warn("[AIHubMix] Riddle generation error, using fallback:", err.message);
    return generateFallbackRiddles(mafiaName, mafiaAvatar, count);
  }
}
