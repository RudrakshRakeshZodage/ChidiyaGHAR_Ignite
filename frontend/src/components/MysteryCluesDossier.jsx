import React, { useState, useMemo } from 'react';
import { 
  Gift, Lock, Key, Sparkles, HelpCircle, CheckCircle2, 
  ShieldAlert, Cpu, Layers, AlertTriangle, Fingerprint, 
  Search, Users, ArrowRight, Check, Zap, Eye, Target, 
  Compass, Radio, Hash, FileText, ChevronRight, CornerDownRight,
  ShieldCheck, Flame
} from 'lucide-react';

export default function MysteryCluesDossier({
  unlockedClues = [],
  totalCluesCount = 5,
  player,
  room,
  mafiaCluesUnlockedCount = 0,
  onCallMeeting,
  onSelectSuspect
}) {
  const [viewMode, setViewMode] = useState("unified"); // 'unified' | 'boxes'
  const [selectedClueIndex, setSelectedClueIndex] = useState(null);
  const isMafia = player?.role === "MAFIA";
  const safeUnlocked = unlockedClues || [];

  const playersList = Array.isArray(room?.players)
    ? room.players
    : Object.values(room?.players || {});

  // 1. Extract and combine all revealed cipher masks / letter fragments
  const { assembledLetterTiles, synthesizedCipherString, knownDetails } = useMemo(() => {
    let longestSnippet = "";
    let firstChar = null;
    let lastChar = null;
    let expectedLength = null;
    let suspectedAvatar = null;

    safeUnlocked.forEach(clue => {
      const riddle = clue.riddle || "";
      const snippet = clue.revealedSnippet || "";
      if (snippet && snippet.length > longestSnippet.length) {
        longestSnippet = snippet;
      }

      // Check initial hint
      const firstMatch = riddle.match(/starts with\s+(?:an?\s+)?["']?([A-Za-z])["']?/i) ||
                         riddle.match(/character\s+["']([A-Za-z])["']/i);
      if (firstMatch && firstMatch[1]) firstChar = firstMatch[1].toUpperCase();

      // Check length hint
      const lenMatch = riddle.match(/(\d+)\s+characters?/i) ||
                       riddle.match(/(\d+)\s+letters?/i);
      if (lenMatch && lenMatch[1]) expectedLength = parseInt(lenMatch[1], 10);

      // Check avatar hint
      const avatarMatch = riddle.match(/avatar\s+([^\s,]+)|icon:\s*([^\s,]+)|equipped with the\s*([^\s,]+)\s*avatar/i);
      if (avatarMatch) suspectedAvatar = avatarMatch[1] || avatarMatch[2] || avatarMatch[3];

      // Check ending hint
      const lastMatch = riddle.match(/matches the character\s+["']([A-Za-z])["']/i) ||
                        riddle.match(/ends with\s+["']([A-Za-z])["']/i);
      if (lastMatch && lastMatch[1]) lastChar = lastMatch[1].toUpperCase();
    });

    // Build letter tiles array (e.g. ['R', 'U', '_', '_', 'H'])
    const tiles = [];
    if (longestSnippet) {
      const parts = longestSnippet.split(/\s+/).filter(Boolean);
      parts.forEach((p, i) => {
        tiles.push({
          letter: p !== '_' ? p : null,
          index: i + 1,
          isRevealed: p !== '_'
        });
      });
    } else if (expectedLength) {
      for (let i = 0; i < expectedLength; i++) {
        let l = null;
        if (i === 0 && firstChar) l = firstChar;
        if (i === expectedLength - 1 && lastChar) l = lastChar;
        tiles.push({
          letter: l,
          index: i + 1,
          isRevealed: !!l
        });
      }
    }

    return {
      assembledLetterTiles: tiles,
      synthesizedCipherString: longestSnippet || (firstChar ? `${firstChar} _ _ _` : ""),
      knownDetails: {
        firstChar,
        lastChar,
        expectedLength,
        suspectedAvatar
      }
    };
  }, [safeUnlocked]);

  // 2. Continuous Master Narrative Storyline
  const combinedStoryline = useMemo(() => {
    if (safeUnlocked.length === 0) return "";
    return safeUnlocked
      .map((c, i) => `[INTEL #${c.clueNumber || i + 1}] ${c.riddle}`)
      .join("\n\n");
  }, [safeUnlocked]);

  // 3. Suspect Match Probability Matrix
  const suspectEvaluations = useMemo(() => {
    return playersList.map(p => {
      if (!p.isAlive) return { player: p, score: 0, reason: "Eliminated", reasons: ["Eliminated from match"] };
      if (p.id === player?.id && !isMafia) return { player: p, score: 0, reason: "You (Verified Dev)", reasons: ["Self: Verified Developer"] };

      let score = 0;
      const hints = [];
      const pName = p.name || "";
      const pNameLower = pName.toLowerCase();
      const pFirst = (pName[0] || "").toUpperCase();
      const pLast = (pName[pName.length - 1] || "").toUpperCase();
      const pLen = pName.length;

      // Rule 1: First letter match
      if (knownDetails.firstChar) {
        if (pFirst === knownDetails.firstChar) {
          score += 35;
          hints.push(`✓ Initial '${pFirst}' matches`);
        } else {
          score -= 30;
          hints.push(`✗ Initial '${pFirst}' mismatches '${knownDetails.firstChar}'`);
        }
      }

      // Rule 2: Length match
      if (knownDetails.expectedLength) {
        if (pLen === knownDetails.expectedLength) {
          score += 30;
          hints.push(`✓ Exactly ${pLen} characters`);
        } else {
          score -= 20;
          hints.push(`✗ Length (${pLen}) ≠ expected (${knownDetails.expectedLength})`);
        }
      }

      // Rule 3: Avatar match
      if (knownDetails.suspectedAvatar) {
        if (p.avatar === knownDetails.suspectedAvatar) {
          score += 30;
          hints.push(`✓ Avatar matches (${p.avatar})`);
        }
      }

      // Rule 4: Ending letter match
      if (knownDetails.lastChar) {
        if (pLast === knownDetails.lastChar) {
          score += 25;
          hints.push(`✓ Ends with '${pLast}'`);
        } else {
          score -= 15;
        }
      }

      // Rule 5: Letter fragments overlap
      safeUnlocked.forEach(clue => {
        const snippet = (clue.revealedSnippet || "").replace(/[^A-Za-z]/g, "").toLowerCase();
        if (snippet.length > 1 && pNameLower.includes(snippet)) {
          score += 20;
          hints.push(`✓ Matches cipher fragment "${snippet.toUpperCase()}"`);
        }
      });

      // Clamp probability
      const baseChance = safeUnlocked.length > 0 ? 10 : 0;
      const probability = Math.min(Math.max(score, baseChance), 99);

      return {
        player: p,
        score: probability,
        reasons: hints
      };
    }).sort((a, b) => b.score - a.score);
  }, [playersList, safeUnlocked, knownDetails, player, isMafia]);

  const topSuspect = suspectEvaluations[0]?.score >= 50 ? suspectEvaluations[0] : null;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#090d16] border border-purple-900/50 shadow-2xl overflow-hidden font-sans select-none">
      
      {/* Top Header & View Mode Switcher */}
      <div className="p-3.5 bg-gradient-to-r from-purple-950/90 via-slate-900 to-[#0c101d] border-b border-purple-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-400/80 flex items-center justify-center text-purple-200 shadow-md shadow-purple-950/60">
            <Fingerprint className="h-4 w-4 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-xs sm:text-sm text-white font-display tracking-wider uppercase flex items-center space-x-1.5">
              <span>MYSTERY FORENSIC EVIDENCE BOARD</span>
            </h3>
            <p className="text-[10px] text-purple-300 font-mono flex items-center space-x-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              <span>
                {isMafia 
                  ? `🚨 ${mafiaCluesUnlockedCount} of ${totalCluesCount} Clues Leaked to Squad`
                  : `🧩 ${safeUnlocked.length} of ${totalCluesCount} Clues Assembled`}
              </span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-lg border border-purple-900/60">
          <button
            type="button"
            onClick={() => setViewMode("unified")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-black transition flex items-center space-x-1.5 ${
              viewMode === 'unified'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/80'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>ALL TOGETHER</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("boxes")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-black transition flex items-center space-x-1.5 ${
              viewMode === 'boxes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/80'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Gift className="h-3 w-3" />
            <span>CASE FILES</span>
          </button>
        </div>
      </div>

      {/* MYSTERY BOX FORFEITED ALERT BANNER (AI HINT USED) */}
      {(room?.hasUsedAiHint || room?.mysteryBoxForfeited || player?.usedAiHint) && (
        <div className="px-3.5 py-2 bg-gradient-to-r from-[#200206] via-[#100305] to-[#200206] border-b border-[#e31b23]/70 flex items-center space-x-2 text-xs font-mono text-rose-300">
          <AlertTriangle className="h-4 w-4 text-[#e31b23] shrink-0 animate-pulse" />
          <span>
            <strong className="text-[#e31b23]">MYSTERY BOX FORFEITED:</strong> 1x AI Tactical Hint was used in this mission. Unboxings are disabled.
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-[#070a12] custom-scrollbar">
        
        {/* ========================================================================= */}
        {/* VIEW 1: UNIFIED MASTER INVESTIGATION BOARD (ALL TOGETHER) */}
        {/* ========================================================================= */}
        {viewMode === "unified" && (
          <div className="space-y-4">
            
            {/* 1. ASSEMBLED NAME DECRYPTION LETTER TILES */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-black border-2 border-purple-600/70 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-purple-300 font-bold uppercase">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span>SABOTEUR NAME CIPHER DECRYPTION</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
                  {safeUnlocked.length} / {totalCluesCount} CRACKED
                </span>
              </div>

              {/* Letter Tiles Array */}
              {assembledLetterTiles.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                  {assembledLetterTiles.map((tile, i) => (
                    <div
                      key={i}
                      className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl flex flex-col items-center justify-center font-mono font-black text-base sm:text-xl border-2 transition-all duration-300 ${
                        tile.isRevealed
                          ? "bg-gradient-to-b from-emerald-900/90 to-emerald-950 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-900/60 scale-105 animate-pulse"
                          : "bg-slate-950/80 border-slate-800 text-slate-600"
                      }`}
                    >
                      <span>{tile.isRevealed ? tile.letter : "?"}</span>
                      <span className="text-[8px] text-slate-500 font-normal">#{tile.index}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-black/60 border border-purple-900/50 text-center space-y-1">
                  <div className="font-mono text-sm sm:text-base font-black tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                    {synthesizedCipherString || "AWAITING UNIT TEST INTEL..."}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Pass automated test cases in the editor to unlock letter tiles and unmask the saboteur!
                  </p>
                </div>
              )}

              {/* Verified Saboteur Intel Badges (Combined together) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-900/40">
                <div className="p-2 rounded-lg bg-black/50 border border-purple-900/40 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Initials:</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {knownDetails.firstChar ? `"${knownDetails.firstChar}"` : "Unknown"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-purple-900/40 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Length:</span>
                  <span className="text-xs font-mono font-bold text-sky-300">
                    {knownDetails.expectedLength ? `${knownDetails.expectedLength} Chars` : "Unknown"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-purple-900/40 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Avatar:</span>
                  <span className="text-xs font-mono font-bold text-pink-300">
                    {knownDetails.suspectedAvatar || "Unknown"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-purple-900/40 flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Ending:</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {knownDetails.lastChar ? `"${knownDetails.lastChar}"` : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. FORENSIC CRIME PINBOARD (CONNECTED CLUE NODES) */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase flex items-center space-x-1.5 font-mono">
                  <Compass className="h-3.5 w-3.5 text-indigo-400" />
                  <span>CONNECTED INVESTIGATION NODES</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {safeUnlocked.length} Nodes Linked
                </span>
              </div>

              {/* Visual Node Graph */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                {Array.from({ length: totalCluesCount }).map((_, idx) => {
                  const clue = safeUnlocked.find(c => c.testIndex === idx || c.clueNumber === idx + 1);
                  const isCracked = !!clue;

                  return (
                    <div
                      key={idx}
                      onClick={() => clue && setSelectedClueIndex(idx)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isCracked
                          ? "bg-purple-950/40 border-purple-500/80 hover:border-purple-400 shadow-md shadow-purple-950/40"
                          : "bg-slate-950/40 border-slate-800/80 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                          NODE #{idx + 1}
                        </span>
                        {isCracked ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        ) : (
                          <Lock className="h-2.5 w-2.5 text-slate-600" />
                        )}
                      </div>

                      <div className="text-xs font-bold text-white truncate">
                        {isCracked ? (clue.title || `Clue #${idx + 1}`) : `Locked #${idx + 1}`}
                      </div>

                      <div className="mt-2 text-[9px] font-mono font-bold">
                        {isCracked ? (
                          <span className="text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60 block truncate">
                            {clue.revealedSnippet || "✓ CRACKED"}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">Run test #{idx + 1}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. SYNTHESIZED CONTINUOUS MASTER STORYLINE */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase flex items-center space-x-1.5 font-mono">
                  <FileText className="h-3.5 w-3.5 text-sky-400" />
                  <span>MASTER EVIDENCE LOG (CONTINUOUS BRIEFING)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live Synthesis</span>
              </div>

              {safeUnlocked.length > 0 ? (
                <div className="p-3 rounded-lg bg-black/60 border border-purple-900/40 text-xs font-serif text-purple-200 leading-relaxed italic whitespace-pre-line space-y-2">
                  {combinedStoryline}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-black/40 border border-slate-800/80 text-center text-xs text-slate-500 italic">
                  🔒 No clues collected yet. Pass unit test cases to unlock evidence that will automatically synthesize into one master case file here!
                </div>
              )}
            </div>

            {/* 4. SUSPECT MATCH PROBABILITY RADAR (ALL OPERATIVES CROSS-CHECKED) */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase flex items-center space-x-1.5 font-mono">
                  <Target className="h-3.5 w-3.5 text-rose-400" />
                  <span>SUSPECT CROSS-MATCH PROBABILITY RADAR</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">AI Forensics</span>
              </div>

              <div className="space-y-2">
                {suspectEvaluations.map(({ player: p, score, reasons }) => {
                  const isHigh = score >= 60;
                  const isMed = score >= 35 && score < 60;
                  const isPrime = isHigh && p.id === topSuspect?.player?.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectSuspect?.(p)}
                      className={`p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                        isPrime
                          ? "bg-rose-950/40 border-rose-600 hover:border-rose-400 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500/40"
                          : isHigh
                          ? "bg-rose-950/20 border-rose-800/70 hover:border-rose-600"
                          : isMed
                          ? "bg-amber-950/20 border-amber-800/60 hover:border-amber-600"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 shadow">
                          {p.avatar || "👨‍💻"}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center space-x-2">
                            <span>{p.name}</span>
                            {isPrime && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black animate-pulse flex items-center space-x-1">
                                <Flame className="h-2.5 w-2.5" />
                                <span>PRIME SUSPECT</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex flex-wrap gap-1.5">
                            {reasons.length > 0 ? (
                              reasons.map((r, rIdx) => (
                                <span key={rIdx} className={r.startsWith("✓") ? "text-emerald-400" : "text-slate-400"}>
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span>Insufficient evidence</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Probability Meter */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                        <span className={`text-sm font-mono font-black ${
                          isHigh ? "text-rose-400" : isMed ? "text-amber-400" : "text-slate-500"
                        }`}>
                          {score}% MATCH
                        </span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-slate-600"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. EMERGENCY MEETING ACTION BUTTON */}
            {onCallMeeting && (
              <button
                type="button"
                onClick={onCallMeeting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 via-purple-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl transition active:scale-95 flex items-center justify-center space-x-2 border border-rose-500/80 shadow-rose-950/60"
              >
                <AlertTriangle className="h-4 w-4 text-amber-300 animate-bounce" />
                <span>CALL EMERGENCY MEETING & PRESENT EVIDENCE</span>
              </button>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INDIVIDUAL MYSTERY BOXES / CASE FILES */}
        {/* ========================================================================= */}
        {viewMode === "boxes" && (
          <div className="space-y-3">
            {Array.from({ length: totalCluesCount }).map((_, idx) => {
              const clue = safeUnlocked.find(c => c.testIndex === idx || c.clueNumber === idx + 1);
              const isUnlocked = !!clue;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    isUnlocked
                      ? "bg-purple-950/20 border-purple-700/60 shadow-md shadow-purple-950/20"
                      : "bg-slate-900/40 border-slate-800/80 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow">
                        {isUnlocked ? "🎁" : <Lock className="h-3.5 w-3.5 text-slate-500" />}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {isUnlocked ? (clue.title || `Clue #${idx + 1}`) : `Mystery Box #${idx + 1}`}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {isUnlocked ? `Test Case #${idx + 1} Cleared` : `Locked (Requires Test #${idx + 1})`}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isUnlocked
                        ? "bg-purple-900 text-purple-200 border border-purple-600"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {isUnlocked ? "CRACKED" : "LOCKED"}
                    </span>
                  </div>

                  {isUnlocked ? (
                    <div className="space-y-2 pt-2 border-t border-purple-900/50">
                      <p className="text-xs text-purple-200 font-serif italic leading-relaxed">
                        "{clue.riddle}"
                      </p>
                      {clue.revealedSnippet && (
                        <div className="flex items-center justify-between text-[11px] font-mono bg-black/60 px-2.5 py-1.5 rounded-lg border border-purple-900/40">
                          <span className="text-slate-400">Cipher Hint:</span>
                          <span className="font-bold text-emerald-400 tracking-wider">
                            {clue.revealedSnippet}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Pass automated test case #{idx + 1} to reveal this AI riddle.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
