/**
 * Assigns secret roles (Developer vs Mafia) to players in a room
 */

export const ROLES = {
  DEVELOPER: "DEVELOPER",
  MAFIA: "MAFIA"
};

export const ROLE_DETAILS = {
  [ROLES.DEVELOPER]: {
    name: "Developer",
    alignment: "Good",
    badgeColor: "#10b981", // Emerald green
    objective: "Debug the codebase, stabilize the application, pass 100% of unit tests, and vote out the Mafia saboteurs.",
    tips: [
      "Check test failure stack traces carefully.",
      "Review player audit logs to see who changed suspicious lines.",
      "Call an emergency meeting if you catch someone committing regressions."
    ]
  },
  [ROLES.MAFIA]: {
    name: "Code Mafia",
    alignment: "Evil",
    badgeColor: "#ef4444", // Crimson red
    objective: "Prevent tests from passing before the timer runs out by injecting stealth bugs, corrupting edge cases, or bluffing in discussion.",
    tips: [
      "Introduce subtle off-by-one errors or condition flips.",
      "Act like you are helping by fixing minor formatting while tweaking crucial logic.",
      "Blame innocent developers during emergency voting meetings."
    ]
  }
};

/**
 * Assigns roles randomly to an array of players
 * @param {Array} players - List of player objects
 * @param {number} mafiaCount - Number of mafia to assign (default: 1)
 */
export function assignRoles(players, mafiaCount = 1) {
  if (!players || players.length === 0) return [];

  // Clone player array to shuffle
  const indices = players.map((_, i) => i);
  
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const effectiveMafiaCount = Math.min(mafiaCount, Math.max(1, Math.floor(players.length / 2)));
  const mafiaIndices = new Set(indices.slice(0, effectiveMafiaCount));

  return players.map((player, idx) => {
    const isMafia = mafiaIndices.has(idx);
    const role = isMafia ? ROLES.MAFIA : ROLES.DEVELOPER;

    return {
      ...player,
      role,
      roleDetails: ROLE_DETAILS[role],
      isAlive: true,
      hasVoted: false,
      voteTarget: null
    };
  });
}
