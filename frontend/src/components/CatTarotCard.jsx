import React from 'react';

/**
 * 12 Illustrated Cat Mafia & Detective Character Archetypes
 * (English titles & labels matching the vintage cat tarot aesthetic)
 */
export const CAT_TAROT_ARCHETYPES = [
  {
    id: "doctor",
    title: "DOCTOR",
    tagline: "DR. DEBUGGER",
    roleType: "DEVELOPER",
    desc: "Healer & Debugger",
    coat: "labcoat",
    hat: "bowler",
    prop: "stethoscope",
    furColor: "#d9b88c",
    innerEar: "#fca5a5",
    eyeColor: "#34d399",
    glasses: "spectacles"
  },
  {
    id: "killer",
    title: "HITMAN",
    tagline: "STEALTH SABOTEUR",
    roleType: "MAFIA",
    desc: "Stealth Assassin",
    coat: "suit",
    hat: "none",
    prop: "silencer",
    furColor: "#94a3b8",
    innerEar: "#f472b6",
    eyeColor: "#38bdf8",
    glasses: "sunglasses"
  },
  {
    id: "courtesan",
    title: "COURTESAN",
    tagline: "FEMME FATALE",
    roleType: "MAFIA",
    desc: "Femme Fatale",
    coat: "flapper_gown",
    hat: "feather_headband",
    prop: "cigarette_holder",
    furColor: "#5c3d2e",
    faceMask: "#2d1a10",
    innerEar: "#fda4af",
    eyeColor: "#38bdf8",
    necklace: "pearls"
  },
  {
    id: "maniac",
    title: "MANIAC",
    tagline: "CHAOS GLITCHER",
    roleType: "MAFIA",
    desc: "Chaos Glitcher",
    coat: "striped_suit",
    hat: "none",
    prop: "bloody_axe",
    furColor: "#1e293b",
    innerEar: "#f43f5e",
    eyeColor: "#22c55e",
    expression: "mad_grin"
  },
  {
    id: "mafia_don",
    title: "MAFIA DON",
    tagline: "THE GODMOTHER",
    roleType: "MAFIA",
    desc: "Syndicate Leader",
    coat: "red_gown",
    hat: "ruby_feather",
    prop: "golden_revolver",
    furColor: "#f8fafc",
    innerEar: "#fda4af",
    eyeColor: "#fbbf24",
    necklace: "ruby_pendant"
  },
  {
    id: "psychiatrist",
    title: "PSYCHIATRIST",
    tagline: "MIND ANALYST",
    roleType: "DEVELOPER",
    desc: "Mind Analyst",
    coat: "labcoat_blue",
    hat: "none",
    prop: "inkblot_card",
    furColor: "#c2884d",
    innerEar: "#fca5a5",
    eyeColor: "#60a5fa",
    glasses: "spectacles"
  },
  {
    id: "judge",
    title: "JUDGE",
    tagline: "CHIEF JUSTICE",
    roleType: "DEVELOPER",
    desc: "Chief Justice",
    coat: "judge_robe",
    hat: "baroque_wig",
    prop: "gavel",
    furColor: "#64748b",
    innerEar: "#cbd5e1",
    eyeColor: "#a78bfa",
    glasses: "spectacles"
  },
  {
    id: "investigator",
    title: "INVESTIGATOR",
    tagline: "LEAD SLEUTH",
    roleType: "DEVELOPER",
    desc: "Crime Sketcher",
    coat: "shirt_suspenders",
    hat: "fedora",
    prop: "sketchbook",
    furColor: "#e2e8f0",
    innerEar: "#fca5a5",
    eyeColor: "#34d399",
    glasses: "round_glasses"
  },
  {
    id: "tweed_gent",
    title: "ARCHITECT",
    tagline: "SENIOR DEV",
    roleType: "DEVELOPER",
    desc: "Senior Architect",
    coat: "tweed_vest",
    hat: "green_flatcap",
    prop: "pocket_watch",
    furColor: "#475569",
    innerEar: "#94a3b8",
    eyeColor: "#10b981"
  },
  {
    id: "pipe_sleuth",
    title: "DETECTIVE",
    tagline: "BUG HUNTER",
    roleType: "DEVELOPER",
    desc: "Code Detective",
    coat: "red_cardigan",
    hat: "newsboy_cap",
    prop: "briar_pipe",
    furColor: "#9ca3af",
    innerEar: "#cbd5e1",
    eyeColor: "#38bdf8"
  },
  {
    id: "ginger_rascal",
    title: "ROOKIE",
    tagline: "JUNIOR CODER",
    roleType: "DEVELOPER",
    desc: "Rookie Coder",
    coat: "denim_overalls",
    hat: "none",
    prop: "slingshot",
    furColor: "#f97316",
    innerEar: "#fca5a5",
    eyeColor: "#4ade80",
    expression: "playful_grin"
  },
  {
    id: "jazz_trumpeter",
    title: "VIRTUOSO",
    tagline: "SYNTH HACKER",
    roleType: "DEVELOPER",
    desc: "Synth Virtuoso",
    coat: "grey_suit",
    hat: "none",
    prop: "brass_trumpet",
    furColor: "#6b3e26",
    innerEar: "#a8715a",
    eyeColor: "#fbbf24"
  }
];

export function getCatArchetype(player, fallbackIndex = 0) {
  if (!player) return CAT_TAROT_ARCHETYPES[fallbackIndex % CAT_TAROT_ARCHETYPES.length];
  if (player.role === "MAFIA") {
    const mafiaList = [CAT_TAROT_ARCHETYPES[4], CAT_TAROT_ARCHETYPES[1], CAT_TAROT_ARCHETYPES[2], CAT_TAROT_ARCHETYPES[3]];
    return mafiaList[fallbackIndex % mafiaList.length];
  }
  let hash = 0;
  const str = player.id || player.name || String(fallbackIndex);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CAT_TAROT_ARCHETYPES.length;
  return CAT_TAROT_ARCHETYPES[index];
}

/**
 * Detailed SVG Cat Character Illustration
 */
export function CatIllustration({ archetype, isMafiaCard = false }) {
  const id = archetype.id;
  const fur = archetype.furColor || "#94a3b8";
  const earInner = archetype.innerEar || "#fca5a5";
  const eye = archetype.eyeColor || "#38bdf8";

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#18233a] via-[#0f1728] to-[#070c16] flex items-center justify-center select-none">
      {/* Subtle radial spotlight */}
      <div className={`absolute inset-0 opacity-40 ${
        isMafiaCard
          ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-700/40 via-transparent to-black"
          : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-transparent to-black"
      }`} />

      {/* SVG Canvas (120x150) */}
      <svg viewBox="0 0 120 150" className="w-full h-full max-w-[130px] max-h-[160px] drop-shadow-xl">
        <defs>
          {/* Gold Gradient for Accents */}
          <linearGradient id={`goldGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          {/* Blood/Red Gradient for Maniac & Mafia */}
          <linearGradient id={`bloodGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>
        </defs>

        {/* 1. CLOTHING & BODY */}
        {archetype.coat === "labcoat" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#e2e8f0" />
            <path d="M 44 88 L 50 150 L 70 150 L 76 88 Z" fill="#713f12" />
            <polygon points="56,92 64,92 60,120" fill="#991b1b" />
            <path d="M 32 88 L 48 150" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 88 88 L 72 150" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>
        )}

        {archetype.coat === "suit" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#0f172a" />
            <path d="M 46 88 L 60 150 L 74 88 Z" fill="#f8fafc" />
            <polygon points="57,94 63,94 60,132" fill="#be123c" />
            <path d="M 32 88 L 48 135 L 60 150 L 72 135 L 88 88" fill="none" stroke="#1e293b" strokeWidth="2" />
          </g>
        )}

        {archetype.coat === "flapper_gown" && (
          <g>
            <path d="M 26 150 L 36 92 L 84 92 L 94 150 Z" fill="#9333ea" />
            <path d="M 36 92 Q 60 115 84 92" fill="#c026d3" />
            <path d="M 20 100 Q 60 140 100 100" fill="none" stroke="#7e22ce" strokeWidth="5" opacity="0.7" />
          </g>
        )}

        {archetype.coat === "striped_suit" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#09090b" />
            <line x1="28" y1="90" x2="24" y2="150" stroke="#ffffff" strokeWidth="3" />
            <line x1="38" y1="90" x2="36" y2="150" stroke="#ffffff" strokeWidth="3" />
            <line x1="82" y1="90" x2="84" y2="150" stroke="#ffffff" strokeWidth="3" />
            <line x1="92" y1="90" x2="96" y2="150" stroke="#ffffff" strokeWidth="3" />
            <polygon points="46,88 60,135 74,88" fill="#16a34a" />
            <polygon points="57,92 63,92 60,128" fill="#f43f5e" />
          </g>
        )}

        {archetype.coat === "red_gown" && (
          <g>
            <path d="M 24 150 L 36 92 L 84 92 L 96 150 Z" fill="url(#bloodGrad-mafia_don)" />
            <path d="M 40 92 Q 60 120 80 92 Z" fill="#4c0519" />
          </g>
        )}

        {archetype.coat === "labcoat_blue" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#f1f5f9" />
            <path d="M 45 88 L 52 150 L 68 150 L 75 88 Z" fill="#0284c7" />
            <polygon points="57,92 63,92 60,125" fill="#1e3a8a" />
          </g>
        )}

        {archetype.coat === "judge_robe" && (
          <g>
            <path d="M 20 150 L 32 85 L 88 85 L 100 150 Z" fill="#09090b" />
            <rect x="52" y="85" width="6" height="32" fill="#f8fafc" />
            <rect x="62" y="85" width="6" height="32" fill="#f8fafc" />
          </g>
        )}

        {archetype.coat === "shirt_suspenders" && (
          <g>
            <path d="M 24 150 L 34 88 L 86 88 L 96 150 Z" fill="#f8fafc" />
            <line x1="42" y1="88" x2="42" y2="150" stroke="#0f172a" strokeWidth="4" />
            <line x1="78" y1="88" x2="78" y2="150" stroke="#0f172a" strokeWidth="4" />
            <polygon points="57,92 63,92 60,120" fill="#dc2626" />
          </g>
        )}

        {archetype.coat === "tweed_vest" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#15803d" />
            <path d="M 46 88 L 52 150 L 68 150 L 74 88 Z" fill="#ca8a04" />
            <polygon points="57,92 63,92 60,120" fill="#991b1b" />
          </g>
        )}

        {archetype.coat === "red_cardigan" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#991b1b" />
            <path d="M 48 88 L 60 145 L 72 88 Z" fill="#0284c7" />
          </g>
        )}

        {archetype.coat === "denim_overalls" && (
          <g>
            <path d="M 24 150 L 34 94 L 86 94 L 96 150 Z" fill="#f8fafc" />
            <path d="M 38 112 L 38 150 L 82 150 L 82 112 Z" fill="#0369a1" />
            <line x1="44" y1="94" x2="44" y2="120" stroke="#0369a1" strokeWidth="5" />
            <line x1="76" y1="94" x2="76" y2="120" stroke="#0369a1" strokeWidth="5" />
            <circle cx="44" cy="118" r="2" fill="#ca8a04" />
            <circle cx="76" cy="118" r="2" fill="#ca8a04" />
          </g>
        )}

        {archetype.coat === "grey_suit" && (
          <g>
            <path d="M 22 150 L 32 88 L 88 88 L 98 150 Z" fill="#64748b" />
            <path d="M 48 88 L 60 150 L 72 88 Z" fill="#f8fafc" />
            <polygon points="57,94 63,94 60,130" fill="#0f172a" />
          </g>
        )}

        {/* 2. CAT EARS */}
        <polygon points="28,52 44,16 58,42" fill={fur} stroke="#09090b" strokeWidth="1.2" />
        <polygon points="33,48 44,22 54,40" fill={earInner} opacity="0.75" />

        <polygon points="92,52 76,16 62,42" fill={fur} stroke="#09090b" strokeWidth="1.2" />
        <polygon points="87,48 76,22 66,40" fill={earInner} opacity="0.75" />

        {/* 3. CAT HEAD */}
        <ellipse cx="60" cy="56" rx="26" ry="23" fill={fur} stroke="#09090b" strokeWidth="1.2" />

        {/* Siamese Face Mask */}
        {archetype.faceMask && (
          <ellipse cx="60" cy="58" rx="18" ry="16" fill={archetype.faceMask} opacity="0.9" />
        )}

        {/* 4. WHISKERS */}
        <line x1="32" y1="60" x2="8" y2="56" stroke="#ffffff" strokeWidth="0.9" opacity="0.85" />
        <line x1="32" y1="64" x2="10" y2="66" stroke="#ffffff" strokeWidth="0.9" opacity="0.85" />
        <line x1="88" y1="60" x2="112" y2="56" stroke="#ffffff" strokeWidth="0.9" opacity="0.85" />
        <line x1="88" y1="64" x2="110" y2="66" stroke="#ffffff" strokeWidth="0.9" opacity="0.85" />

        {/* 5. EYES & EXPRESSION */}
        <ellipse cx="47" cy="53" rx="6.5" ry="7.5" fill={eye} />
        <ellipse cx="73" cy="53" rx="6.5" ry="7.5" fill={eye} />
        <ellipse cx="47" cy="53" rx="1.8" ry="6" fill="#000000" />
        <ellipse cx="73" cy="53" rx="1.8" ry="6" fill="#000000" />
        <circle cx="49" cy="50" r="1.5" fill="#ffffff" />
        <circle cx="75" cy="50" r="1.5" fill="#ffffff" />

        {/* Nose */}
        <polygon points="60,63 56,59 64,59" fill="#f43f5e" />

        {/* Mouth */}
        {archetype.expression === "mad_grin" ? (
          <g>
            <path d="M 50 64 Q 60 76 70 64 Z" fill="#881337" stroke="#000" strokeWidth="1" />
            <polygon points="53,64 55,68 57,64" fill="#fff" />
            <polygon points="63,64 65,68 67,64" fill="#fff" />
          </g>
        ) : archetype.expression === "playful_grin" ? (
          <path d="M 54 64 Q 60 70 66 64" fill="none" stroke="#000000" strokeWidth="1.6" />
        ) : (
          <path d="M 55 64 Q 60 67 65 64" fill="none" stroke="#000000" strokeWidth="1.2" />
        )}

        {/* 6. HATS & ACCESSORIES */}
        {archetype.hat === "bowler" && (
          <g>
            <ellipse cx="60" cy="35" rx="23" ry="5" fill="#18181b" />
            <path d="M 44 34 Q 60 10 76 34 Z" fill="#18181b" />
            <rect x="46" y="31" width="28" height="3" fill="#3f3f46" />
          </g>
        )}

        {archetype.hat === "baroque_wig" && (
          <g>
            <path d="M 28 42 Q 60 6 92 42 Q 98 82 88 82 Q 82 56 76 46 Q 44 46 38 56 Q 32 82 22 82 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
            <circle cx="34" cy="58" r="4" fill="#e2e8f0" />
            <circle cx="86" cy="58" r="4" fill="#e2e8f0" />
          </g>
        )}

        {archetype.hat === "feather_headband" && (
          <g>
            <rect x="36" y="38" width="48" height="5" rx="2" fill="#c026d3" />
            <circle cx="76" cy="40" r="4" fill="#fbbf24" />
            <path d="M 76 40 Q 86 16 78 2 Q 72 20 76 40 Z" fill="#e879f9" />
          </g>
        )}

        {archetype.hat === "ruby_feather" && (
          <g>
            <path d="M 42 36 Q 30 14 26 2 Q 40 16 50 36 Z" fill="#e11d48" />
            <circle cx="50" cy="36" r="4.5" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />
            <circle cx="50" cy="36" r="2.5" fill="#e11d48" />
          </g>
        )}

        {archetype.hat === "fedora" && (
          <g>
            <ellipse cx="60" cy="37" rx="27" ry="6" fill="#1e293b" />
            <path d="M 39 36 Q 60 14 81 36 Z" fill="#1e293b" />
            <rect x="41" y="32" width="38" height="4" fill="#be123c" />
          </g>
        )}

        {archetype.hat === "green_flatcap" && (
          <g>
            <ellipse cx="60" cy="35" rx="24" ry="7" fill="#166534" />
            <path d="M 40 34 Q 60 16 80 34 Z" fill="#15803d" />
          </g>
        )}

        {archetype.hat === "newsboy_cap" && (
          <g>
            <ellipse cx="60" cy="35" rx="25" ry="8" fill="#78350f" />
            <path d="M 40 33 Q 60 15 80 33 Z" fill="#9a3412" />
          </g>
        )}

        {/* 7. GLASSES / SUNGLASSES */}
        {archetype.glasses === "sunglasses" && (
          <g>
            <rect x="39" y="47" width="17" height="11" rx="3" fill="#09090b" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="64" y="47" width="17" height="11" rx="3" fill="#09090b" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="56" y1="52" x2="64" y2="52" stroke="#38bdf8" strokeWidth="1.2" />
          </g>
        )}

        {archetype.glasses === "spectacles" && (
          <g>
            <circle cx="47" cy="53" r="8.5" fill="none" stroke="#eab308" strokeWidth="1.4" />
            <circle cx="73" cy="53" r="8.5" fill="none" stroke="#eab308" strokeWidth="1.4" />
            <line x1="55.5" y1="53" x2="64.5" y2="53" stroke="#eab308" strokeWidth="1.4" />
          </g>
        )}

        {archetype.glasses === "round_glasses" && (
          <g>
            <circle cx="47" cy="53" r="8" fill="none" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="73" cy="53" r="8" fill="none" stroke="#64748b" strokeWidth="1.2" />
            <line x1="55" y1="53" x2="65" y2="53" stroke="#64748b" strokeWidth="1.2" />
          </g>
        )}

        {/* 8. PROPS & ACCESSORIES */}
        {archetype.prop === "stethoscope" && (
          <g>
            <path d="M 42 90 Q 60 135 78 90" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <line x1="60" y1="122" x2="60" y2="138" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="60" cy="140" r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
          </g>
        )}

        {archetype.prop === "silencer" && (
          <g transform="translate(68, 102) rotate(-15)">
            <rect x="0" y="4" width="28" height="7" fill="#0f172a" rx="1" />
            <rect x="28" y="5.5" width="18" height="4" fill="#334155" rx="1" />
            <rect x="4" y="11" width="8" height="14" fill="#1e293b" rx="1" />
          </g>
        )}

        {archetype.prop === "cigarette_holder" && (
          <g transform="translate(62, 70) rotate(-25)">
            <rect x="0" y="0" width="38" height="2.5" fill="#0f172a" />
            <rect x="34" y="-0.5" width="6" height="3.5" fill="#f8fafc" />
            <circle cx="40" cy="1.2" r="1.5" fill="#ef4444" />
            <path d="M 42 1 Q 50 -10 46 -20 Q 55 -30 50 -40" fill="none" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6" />
          </g>
        )}

        {archetype.prop === "bloody_axe" && (
          <g transform="translate(72, 90) rotate(20)">
            <rect x="0" y="-10" width="8" height="55" fill="#78350f" rx="2" />
            <path d="M -14 -12 L 20 -12 L 24 10 L -18 10 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" />
            <path d="M -14 -12 L -18 10" stroke="#dc2626" strokeWidth="4" />
          </g>
        )}

        {archetype.prop === "golden_revolver" && (
          <g transform="translate(70, 108)">
            <rect x="0" y="0" width="22" height="7" fill="url(#goldGrad-mafia_don)" rx="1" />
            <circle cx="6" cy="4" r="3.5" fill="#854d0e" />
            <rect x="2" y="7" width="7" height="12" fill="#78350f" rx="1" />
          </g>
        )}

        {archetype.prop === "inkblot_card" && (
          <g transform="translate(38, 108)">
            <rect x="0" y="0" width="44" height="32" fill="#ffffff" stroke="#0f172a" strokeWidth="1" rx="2" />
            <path d="M 22 8 Q 12 12 10 20 Q 18 24 22 28 Q 26 24 34 20 Q 32 12 22 8 Z" fill="#09090b" />
            <circle cx="22" cy="18" r="2" fill="#ffffff" />
          </g>
        )}

        {archetype.prop === "gavel" && (
          <g transform="translate(70, 100) rotate(-30)">
            <rect x="0" y="0" width="7" height="28" fill="#78350f" rx="2" />
            <rect x="-8" y="-6" width="23" height="12" fill="#9a3412" stroke="url(#goldGrad-judge)" strokeWidth="1" rx="2" />
          </g>
        )}

        {archetype.prop === "sketchbook" && (
          <g transform="translate(62, 102) rotate(10)">
            <rect x="0" y="0" width="28" height="34" fill="#fef08a" stroke="#78350f" strokeWidth="1" rx="2" />
            <line x1="4" y1="8" x2="24" y2="8" stroke="#78350f" strokeWidth="1" />
            <line x1="4" y1="14" x2="20" y2="14" stroke="#78350f" strokeWidth="1" />
            <line x1="4" y1="20" x2="24" y2="20" stroke="#78350f" strokeWidth="1" />
            <line x1="-12" y1="10" x2="6" y2="2" stroke="#dc2626" strokeWidth="2.5" />
          </g>
        )}

        {archetype.prop === "briar_pipe" && (
          <g transform="translate(56, 68)">
            <path d="M 0 0 Q 15 12 22 0" fill="none" stroke="#78350f" strokeWidth="3" />
            <rect x="20" y="-8" width="9" height="12" fill="#9a3412" rx="1.5" />
            <path d="M 24 -10 Q 28 -20 22 -30 Q 30 -40 26 -50" fill="none" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6" />
          </g>
        )}

        {archetype.prop === "slingshot" && (
          <g transform="translate(24, 115) rotate(-15)">
            <path d="M 0 20 L 0 8 L -8 0 M 0 8 L 8 0" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#a855f7" strokeWidth="1.8" />
          </g>
        )}

        {archetype.prop === "brass_trumpet" && (
          <g transform="translate(52, 98) rotate(-20)">
            <path d="M 0 6 L 38 6 L 48 0 L 48 12 L 38 6 Z" fill="url(#goldGrad-jazz_trumpeter)" stroke="#78350f" strokeWidth="0.8" />
            <rect x="14" y="2" width="10" height="8" fill="url(#goldGrad-jazz_trumpeter)" stroke="#78350f" strokeWidth="0.5" />
          </g>
        )}
      </svg>

      {/* Dark vintage paper vignette overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />
    </div>
  );
}

/**
 * Vintage Cat Tarot Card Component
 */
export default function CatTarotCard({
  player,
  archetype: customArchetype,
  index = 0,
  isSelected = false,
  isSelectable = true,
  onClick,
  isRevealed = false,
  showRole = false,
  compact = false,
  badgeText
}) {
  const isSelf = player?.isSelf;
  const isMafia = player?.role === "MAFIA";
  const isAlive = player?.isAlive ?? true;
  
  const archetype = customArchetype || getCatArchetype(player, index);
  const isTargetMafia = showRole ? isMafia : (player?.role === "MAFIA" && isRevealed);

  // Top header text: prioritize the actual user name
  const topHeaderTitle = player?.name
    ? player.name.toUpperCase()
    : archetype.title;

  // Bottom subtitle text: clear English role / archetype designation
  const bottomRoleTitle = isTargetMafia
    ? "MAFIA"
    : archetype.title;

  return (
    <div
      onClick={isSelectable ? onClick : undefined}
      className={`group relative rounded-xl transition-all duration-300 transform select-none ${
        isSelectable ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl" : ""
      } ${
        isSelected
          ? isTargetMafia
            ? "ring-2 ring-rose-500 shadow-2xl shadow-rose-950/80 scale-[1.03]"
            : "ring-2 ring-amber-400 shadow-2xl shadow-amber-950/80 scale-[1.03]"
          : "hover:shadow-xl"
      }`}
    >
      {/* Card Outer Shell with Navy Canvas & Double Gold Filigree Borders */}
      <div className={`p-2.5 sm:p-3 pt-3.5 pb-2.5 rounded-xl border-2 flex flex-col justify-between relative overflow-hidden transition-all ${
        isTargetMafia
          ? "bg-[#14080c] border-[#9f1239] shadow-lg shadow-rose-950/50"
          : "bg-[#0b1322] border-[#b4883d] shadow-lg shadow-slate-950/70"
      }`}>
        {/* Vintage Background Texture */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* 4 Ornamental Gold Filigree Corners */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d4af37] rounded-tl-sm pointer-events-none">
          <div className="w-1 h-1 bg-[#d4af37] rounded-full absolute -top-0.5 -left-0.5" />
        </div>
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d4af37] rounded-tr-sm pointer-events-none">
          <div className="w-1 h-1 bg-[#d4af37] rounded-full absolute -top-0.5 -right-0.5" />
        </div>
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d4af37] rounded-bl-sm pointer-events-none">
          <div className="w-1 h-1 bg-[#d4af37] rounded-full absolute -bottom-0.5 -left-0.5" />
        </div>
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d4af37] rounded-br-sm pointer-events-none">
          <div className="w-1 h-1 bg-[#d4af37] rounded-full absolute -bottom-0.5 -right-0.5" />
        </div>

        {/* TOP TITLE: Gold Serif User Name Header (Safely padded from corner brackets) */}
        <div className="text-center pb-1 border-b border-[#2a3c5a] relative z-10 px-2">
          <div
            title={player?.name || topHeaderTitle}
            className="text-[10px] sm:text-[11px] font-black tracking-wide text-[#fcd34d] uppercase font-serif drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate flex items-center justify-center space-x-1"
          >
            <span className="truncate">{topHeaderTitle}</span>
            {isSelf && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-normal lowercase shrink-0">
                you
              </span>
            )}
          </div>
        </div>

        {/* CENTER CAT PORTRAIT FRAME */}
        <div className={`w-full aspect-[4/5] rounded-lg overflow-hidden border border-[#524128] bg-black relative my-1.5 shadow-inner ${
          compact ? "max-h-[140px]" : ""
        }`}>
          <CatIllustration archetype={archetype} isMafiaCard={isTargetMafia} />

          {/* Dead / Ejected Stamp */}
          {!isAlive && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-1 z-20">
              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 transform -rotate-12 uppercase tracking-widest shadow-2xl">
                EJECTED
              </span>
            </div>
          )}

          {/* Custom Badge (e.g. Ready, Host, Voted) */}
          {badgeText && (
            <div className="absolute top-1 right-1 bg-black/85 border border-amber-500/80 rounded px-1.5 py-0.5 text-[8px] font-mono text-amber-300 shadow">
              {badgeText}
            </div>
          )}
        </div>

        {/* BOTTOM TITLE: English Role / Archetype Designation */}
        <div className="text-center pt-0.5 border-t border-[#2a3c5a] relative z-10 px-1">
          <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#e6b85c] uppercase font-serif truncate">
            {bottomRoleTitle}
          </div>
          <div className="text-[8px] font-mono text-slate-400 tracking-tight truncate">
            {isTargetMafia ? "SYNDICATE" : archetype.tagline}
          </div>
        </div>

        {/* PLAYER FOOTER: Vital Pulse Line */}
        <div className="w-full mt-1 pt-0.5 border-t border-slate-800/80 text-center relative z-10">
          {/* Animated EKG Heartbeat */}
          <div className="w-full h-3 flex items-center justify-center relative overflow-hidden">
            {isAlive ? (
              <svg
                viewBox="0 0 100 20"
                className={`w-full h-full ${
                  isTargetMafia
                    ? "text-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.8)]"
                    : "text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.8)]"
                }`}
              >
                <path
                  d="M 0 10 L 25 10 L 32 3 L 40 18 L 48 2 L 56 16 L 62 10 L 100 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <div className="w-full h-[2px] bg-slate-700 relative" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
