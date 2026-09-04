import React, { useState } from 'react';
import { 
  Play, Shield, Bug, Eye, Terminal, Users, Flame, Star, 
  ChevronRight, ArrowRight, Video, Radio, Sparkles, Award, 
  Search, Lock, CheckCircle2, Cpu, Globe, Crosshair, HelpCircle,
  Volume2, VolumeX, Layers, Trophy, Gift, ArrowUpRight
} from 'lucide-react';
import CatTarotCard, { CAT_TAROT_ARCHETYPES } from './CatTarotCard';

export default function LandingPage({
  onEnterLobby,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenAuth,
  authUser
}) {
  const [selectedIntelVideo, setSelectedIntelVideo] = useState(null);
  const [activeLoreTab, setActiveLoreTab] = useState("all");
  const [interactiveSabotageDemo, setInteractiveSabotageDemo] = useState({
    code: `function calculateDiscount(cartTotal, isVip) {\n  // Standard discount logic\n  if (cartTotal > 100 && isVip) {\n    return cartTotal * 0.20;\n  }\n  return 0;\n}`,
    isSabotaged: false
  });

  const handleSimulateSabotage = () => {
    if (interactiveSabotageDemo.isSabotaged) {
      setInteractiveSabotageDemo({
        code: `function calculateDiscount(cartTotal, isVip) {\n  // Standard discount logic\n  if (cartTotal > 100 && isVip) {\n    return cartTotal * 0.20;\n  }\n  return 0;\n}`,
        isSabotaged: false
      });
    } else {
      setInteractiveSabotageDemo({
        code: `function calculateDiscount(cartTotal, isVip) {\n  // 😈 SABOTAGED: Inverted boundary\n  if (cartTotal <= 100 || !isVip) {\n    return cartTotal * 0.99;\n  }\n  return 0;\n}`,
        isSabotaged: true
      });
    }
  };

  const INTEL_MEDIA = [
    {
      id: "sabotage_window",
      tag: "GAMEPLAY RECON",
      title: "The 30-Second Stealth Sabotage Window",
      desc: "Watch how the Mafia Don infiltrates developer workspaces during silent lockout phases.",
      duration: "01:45",
      badge: "CORE MECHANIC",
      bgGradient: "from-rose-950 via-slate-900 to-black"
    },
    {
      id: "cat_roster",
      tag: "SYNDICATE ARCHETYPES",
      title: "12 Illustrated Cat Mafia Playing Cards",
      desc: "Meet the Doctor, the Hitman, the Maniac, the Judge, and the undercover operatives.",
      duration: "02:10",
      badge: "CHARACTER DECK",
      bgGradient: "from-amber-950 via-slate-900 to-black"
    },
    {
      id: "surveillance_desk",
      tag: "TACTICAL SURVEILLANCE",
      title: "Multi-Feed CCTV Keystroke Monitoring",
      desc: "Inspect live AST syntax changes and unit test failures across the team in real time.",
      duration: "01:20",
      badge: "CCTV DESK",
      bgGradient: "from-purple-950 via-slate-900 to-black"
    },
    {
      id: "emergency_meeting",
      tag: "SOCIAL DEDUCTION",
      title: "High-Stakes Emergency Debug Meetings",
      desc: "Call the emergency buzzer, present evidence of corrupted functions, and vote out the traitor.",
      duration: "02:30",
      badge: "LIVE DEBATE",
      bgGradient: "from-blue-950 via-slate-900 to-black"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans selection:bg-rose-600 selection:text-white relative overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP ROCKSTAR-STYLE UTILITY STRIP */}
      {/* ========================================================================= */}
      <div className="bg-[#0a0a0f] border-b border-rose-950/40 text-[11px] font-mono tracking-widest px-4 sm:px-8 py-1.5 flex items-center justify-between z-40 relative">
        <div className="flex items-center space-x-3">
          <span className="text-rose-500 font-bold tracking-widest">OUTLAWS OF THE CODEBASE.</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">CHIDIYAGHAR STUDIOS ORIGINAL</span>
        </div>
        <div className="flex items-center space-x-5 text-slate-400">
          <button onClick={onOpenLeaderboard} className="hover:text-amber-400 transition flex items-center space-x-1">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>GLOBAL RANKS</span>
          </button>
          <a href="https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center space-x-1">
            <span>GITHUB</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
          <button onClick={authUser ? onOpenProfile : onOpenAuth} className="hover:text-rose-400 transition flex items-center space-x-1">
            <span>{authUser ? authUser.name : "OPERATIVE LOGIN"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CINEMATIC NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-[#07090e]/95 backdrop-blur-md border-b border-rose-900/40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Logo: Gritty Red Dead Stencil Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterLobby}>
          <div className="relative">
            <span className="text-xl sm:text-2xl font-black font-display tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(225,29,72,0.6)]">
              CODE MAFIA
            </span>
            <span className="ml-1 text-2xl font-black text-rose-600 font-serif">II</span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950 border border-rose-700 text-rose-300">
            AAA TACTICAL MULTIPLAYER
          </span>
        </div>

        {/* Quick Nav Links */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-slate-300">
          <a href="#story" className="hover:text-rose-400 transition">Syndicate Lore</a>
          <a href="#features" className="hover:text-rose-400 transition">Tactical Gameplay</a>
          <a href="#roster" className="hover:text-rose-400 transition">12 Cat Archetypes</a>
          <a href="#recon" className="hover:text-rose-400 transition">Media & Intel</a>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenLeaderboard}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onEnterLobby}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/50 transition active:scale-95 flex items-center space-x-2 border border-rose-500"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>DEPLOY MISSION</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (RED DEAD REDEMPTION STYLE NOIR SPECTACLE) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-8 py-16 overflow-hidden bg-gradient-to-b from-[#140608] via-[#0b0406] to-[#050608]">
        {/* Blood Red Atmospheric Glow & Vignette */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-rose-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Center Content Box */}
        <div className="max-w-5xl mx-auto w-full text-center relative z-10 space-y-8">
          
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-700 text-rose-300 font-mono text-[11px] uppercase tracking-widest shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>CHIDIYAGHAR STUDIOS PRESENTS</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display uppercase tracking-tight text-white drop-shadow-[0_4px_20px_rgba(225,29,72,0.8)]">
              CODE MAFIA <span className="text-rose-600 font-serif">II</span>
            </h1>

            <div className="flex items-center justify-center space-x-3 text-rose-500 font-bold text-sm tracking-widest uppercase">
              <span>★</span>
              <span>SILICON SYNDICATE, 2026</span>
              <span>★</span>
            </div>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed drop-shadow">
              The era of clean commits has fallen. The saboteurs have infiltrated the engineering sprints.
              Fix bugs, inspect AST syntax trees, and find the traitor before production crashes.
            </p>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnterLobby}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-900/80 transition active:scale-95 flex items-center justify-center space-x-3 border border-rose-400"
            >
              <span>ENTER THE UNDERWORLD</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <a
              href="#recon"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm uppercase tracking-widest transition flex items-center justify-center space-x-2"
            >
              <Video className="h-4 w-4 text-rose-400" />
              <span>WATCH BRIEFING</span>
            </a>
          </div>

          {/* Live System Specs Bar */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-black/60 border border-rose-950 flex items-center space-x-3">
              <Terminal className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">ENGINE</div>
                <div className="text-xs font-bold text-white">Private Workspaces</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-rose-950 flex items-center space-x-3">
              <Eye className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">SURVEILLANCE</div>
                <div className="text-xs font-bold text-white">30s Lockout Window</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-rose-950 flex items-center space-x-3">
              <Radio className="h-5 w-5 text-sky-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">DEBATE</div>
                <div className="text-xs font-bold text-white">WebRTC Voice Chat</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-rose-950 flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">HEATMAP</div>
                <div className="text-xs font-bold text-white">52-Week Dossier</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR PILLARS FEATURE CARDS (MATCHING RED DEAD REDEMPTION 2 CARDS) */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 px-4 sm:px-8 border-y border-rose-950/60 bg-[#07090f] relative">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
              THE PILLARS OF WARFARE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              ENGINEERED FOR SUPREME DECEPTION
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Living Workspace */}
            <div className="group rounded-2xl p-6 bg-gradient-to-b from-[#101726] to-[#0a0d16] border border-[#1e293b] hover:border-rose-500/80 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1.5">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black font-display uppercase tracking-wider text-white">
                  LIVING WORKSPACE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every developer operates inside an isolated sandbox with instant AST validation and automated test runners. No code bleeding across teammates.
                </p>
              </div>
              <button onClick={onEnterLobby} className="mt-6 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1 uppercase tracking-wider">
                <span>Explore the Arena</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Card 2: Deep Syndicate Lore */}
            <div className="group rounded-2xl p-6 bg-gradient-to-b from-[#101726] to-[#0a0d16] border border-[#1e293b] hover:border-amber-500/80 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1.5">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black font-display uppercase tracking-wider text-white">
                  RICH CAT LORE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  12 distinct Cat Mafia tarot archetypes with vintage gold-inlaid portraits, unique tactical specializations, and deep narrative backstories.
                </p>
              </div>
              <a href="#roster" className="mt-6 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 uppercase tracking-wider">
                <span>Inspect Roster</span>
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            {/* Card 3: Dynamic Sabotage */}
            <div className="group rounded-2xl p-6 bg-gradient-to-b from-[#101726] to-[#0a0d16] border border-[#1e293b] hover:border-rose-500/80 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1.5">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black font-display uppercase tracking-wider text-white">
                  DYNAMIC SABOTAGE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enforces strict 30-second developer lockouts followed by stealth sabotage windows. Inject boundary bugs and off-by-one errors in complete secrecy.
                </p>
              </div>
              <a href="#demo" className="mt-6 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1 uppercase tracking-wider">
                <span>Try Sabotage Demo</span>
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            {/* Card 4: Code Mafia Online */}
            <div className="group rounded-2xl p-6 bg-gradient-to-b from-[#101726] to-[#0a0d16] border border-[#1e293b] hover:border-sky-500/80 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1.5">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-sky-950/60 border border-sky-700/60 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black font-display uppercase tracking-wider text-white">
                  CODE MAFIA ONLINE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ranked matchmaking backed by Supabase with GitHub-style 52-week mission heatmaps, streak milestones, and live emergency debate channels.
                </p>
              </div>
              <button onClick={onOpenLeaderboard} className="mt-6 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1 uppercase tracking-wider">
                <span>View Global Ranks</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE STORY / UNDERWORLD SPOTLIGHT (ARTHUR MORGAN STYLE SPOTLIGHT) */}
      {/* ========================================================================= */}
      <section id="story" className="py-20 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-r from-black via-[#0d070b] to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Dramatic Story Copy */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
              THE UNDERWORLD STORY
            </span>

            <h2 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white leading-none">
              LOYALTY.<br />
              DECEPTION.<br />
              <span className="text-rose-600">REFACTORING.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              You and your squad of developers are on the run against an aggressive production deadline.
              With automated CI/CD checks closing in and unit tests failing across the cluster, someone inside
              your team is secretly corrupting pull requests.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Will you crack the bug in time, or will the Syndicate crash the deployment before the truth comes to light?
            </p>

            <div className="pt-2">
              <button
                onClick={onEnterLobby}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/60 transition active:scale-95 flex items-center space-x-2 border border-rose-400"
              >
                <span>JOIN THE MISSION SQUAD</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: Stylized Character Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm">
              <CatTarotCard
                player={{ name: "GODMOTHER", role: "MAFIA", isAlive: true }}
                index={4}
                isSelectable={false}
                badgeText="SYNDICATE DON"
              />
            </div>
          </div>

        </div>

        {/* Feature Icons Strip */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1">
            <Globe className="h-5 w-5 text-rose-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase">ISOLATED WORKSPACES</div>
            <div className="text-[10px] text-slate-400">Zero workspace collisions</div>
          </div>
          <div className="space-y-1">
            <Eye className="h-5 w-5 text-amber-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase">CCTV SURVEILLANCE</div>
            <div className="text-[10px] text-slate-400">Live multi-feed tracking</div>
          </div>
          <div className="space-y-1">
            <Layers className="h-5 w-5 text-purple-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase">12 TAROT ARCHETYPES</div>
            <div className="text-[10px] text-slate-400">Handcrafted cat portraits</div>
          </div>
          <div className="space-y-1">
            <Radio className="h-5 w-5 text-sky-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase">EMERGENCY DEBATE</div>
            <div className="text-[10px] text-slate-400">Real-time team voice & chat</div>
          </div>
          <div className="space-y-1">
            <Trophy className="h-5 w-5 text-emerald-400 mx-auto" />
            <div className="text-xs font-bold text-white uppercase">52-WEEK HEATMAP</div>
            <div className="text-[10px] text-slate-400">Persistent battle records</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. 12 CAT MAFIA TAROT CARDS ROSTER SHOWCASE */}
      {/* ========================================================================= */}
      <section id="roster" className="py-20 px-4 sm:px-8 border-t border-rose-950/60 bg-[#06080e]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                THE PLAYING CARD DECK
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white mt-1">
                12 ILLUSTRATED CAT ARCHETYPES
              </h2>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={() => setActiveLoreTab("all")}
                className={`px-3 py-1.5 rounded-lg border font-bold transition ${activeLoreTab === 'all' ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
              >
                All Cards (12)
              </button>
              <button
                onClick={() => setActiveLoreTab("mafia")}
                className={`px-3 py-1.5 rounded-lg border font-bold transition ${activeLoreTab === 'mafia' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
              >
                Syndicate (4)
              </button>
              <button
                onClick={() => setActiveLoreTab("dev")}
                className={`px-3 py-1.5 rounded-lg border font-bold transition ${activeLoreTab === 'dev' ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
              >
                Developers (8)
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CAT_TAROT_ARCHETYPES
              .filter(a => {
                if (activeLoreTab === "mafia") return a.roleType === "MAFIA";
                if (activeLoreTab === "dev") return a.roleType === "DEVELOPER";
                return true;
              })
              .map((archetype, idx) => (
                <CatTarotCard
                  key={archetype.id}
                  archetype={archetype}
                  index={idx}
                  isSelectable={false}
                  showRole={true}
                  badgeText={archetype.roleType === "MAFIA" ? "MAFIA" : "DEV"}
                />
              ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE SABOTAGE SIMULATOR DEMO */}
      {/* ========================================================================= */}
      <section id="demo" className="py-16 px-4 sm:px-8 border-t border-rose-950/60 bg-gradient-to-b from-[#06080e] via-[#090b14] to-[#06080e]">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
              INTERACTIVE TACTICAL BRIEFING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              EXPERIENCE THE 1-CLICK BUG SABOTAGE
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Click the button below to simulate how the Mafia injects stealth boundary inversions into developer workspaces.
            </p>
          </div>

          <div className="glass-card rounded-2xl border-2 border-rose-900/60 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  victim_workspace_cart.js
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  interactiveSabotageDemo.isSabotaged
                    ? "bg-rose-950 border border-rose-700 text-rose-300 animate-pulse"
                    : "bg-emerald-950 border border-emerald-700 text-emerald-300"
                }`}>
                  {interactiveSabotageDemo.isSabotaged ? "😈 SABOTAGED CODE INJECTED" : "✓ CLEAN DEVELOPER CODE"}
                </span>
              </div>
            </div>

            {/* Code Output */}
            <pre className="p-4 rounded-xl bg-black/80 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto leading-relaxed">
              <code>{interactiveSabotageDemo.code}</code>
            </pre>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {interactiveSabotageDemo.isSabotaged
                  ? "Test Failure: Expected $20.00 discount for VIP, received $99.00 flaw!"
                  : "Status: All unit tests passing."}
              </span>

              <button
                onClick={handleSimulateSabotage}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center space-x-2"
              >
                <Flame className="h-4 w-4" />
                <span>{interactiveSabotageDemo.isSabotaged ? "Reset to Clean Code" : "Inject Stealth Sabotage"}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. LATEST TRAILERS & INTEL MEDIA SHOWCASE */}
      {/* ========================================================================= */}
      <section id="recon" className="py-20 px-4 sm:px-8 border-t border-rose-950/60 bg-[#05070c]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
                TACTICAL FOOTAGE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white mt-1">
                LATEST INTEL & RECON
              </h2>
            </div>
            <button onClick={onEnterLobby} className="text-xs font-mono font-bold text-rose-400 hover:text-white uppercase tracking-wider">
              VIEW ALL MISSIONS &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INTEL_MEDIA.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIntelVideo(item)}
                className="group rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-slate-800 hover:border-rose-500/80 p-4 transition-all duration-300 cursor-pointer shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Thumbnail Mock Frame */}
                  <div className={`aspect-video rounded-xl bg-gradient-to-br ${item.bgGradient} border border-slate-700 relative overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition shadow-inner`}>
                    <div className="h-10 w-10 rounded-full bg-rose-600/80 group-hover:bg-rose-500 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-slate-300">
                      {item.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-700 text-[8px] font-mono font-bold text-rose-300">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block mb-1">
                      {item.tag}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>CHIDIYAGHAR INTEL</span>
                  <span className="text-rose-400 group-hover:translate-x-1 transition">INSPECT &gt;</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CINEMATIC AAA FOOTER (ROCKSTAR / ESRB THEMED) */}
      {/* ========================================================================= */}
      <footer className="bg-black border-t-2 border-rose-950/80 pt-16 pb-12 px-4 sm:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Column 1: ESRB Parody Box + Brand (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black font-display tracking-tight text-white">
                  CODE MAFIA
                </span>
                <span className="text-2xl font-black text-rose-600 font-serif">II</span>
              </div>

              {/* ESRB Parody Box */}
              <div className="p-3 rounded-xl border-2 border-slate-700 bg-slate-950 max-w-[280px] flex items-center space-x-3">
                <div className="h-14 w-12 border-2 border-slate-400 bg-black flex items-center justify-center text-white font-black text-2xl font-serif shrink-0">
                  M
                </div>
                <div className="text-[9px] font-mono text-slate-300 leading-tight">
                  <strong className="text-white block text-[10px]">RATED M FOR:</strong>
                  • Merge Conflicts<br />
                  • Extreme Trust Issues<br />
                  • Sabotaged Production Code
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                A tactical multiplayer social deduction battleground designed for software engineers, hackers, and problem solvers.
              </p>
            </div>

            {/* Column 2: Game Links (2 cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[11px] font-mono">
                GAME INTEL
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#story" className="hover:text-white transition">The Story</a></li>
                <li><a href="#features" className="hover:text-white transition">Tactical Gameplay</a></li>
                <li><a href="#roster" className="hover:text-white transition">12 Cat Archetypes</a></li>
                <li><button onClick={onOpenLeaderboard} className="hover:text-white transition">Global Ranks</button></li>
              </ul>
            </div>

            {/* Column 3: Community & Support (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[11px] font-mono">
                CHIDIYAGHAR NETWORK
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub Repository</a></li>
                <li><button onClick={onOpenProfile} className="hover:text-white transition">52-Week Dossier</button></li>
                <li><button onClick={onEnterLobby} className="hover:text-white transition">Custom AI Challenge Gen</button></li>
                <li><a href="#recon" className="hover:text-white transition">Patch Notes 2.4</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter Box (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[11px] font-mono">
                DISPATCH WIRE
              </h4>
              <p className="text-[11px] text-slate-400">
                Receive confidential patch updates, new cat cards, and challenge drops.
              </p>
              <div className="flex items-center space-x-1.5">
                <input
                  type="email"
                  placeholder="agent@syndicate.io"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => alert("Subscribed to Code Mafia Dispatch wire!")}
                  className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shrink-0"
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Legal Notice */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div>
              © 2026 ChidiyaGHAR Studios. Code Mafia II is an original tactical multiplayer game. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onEnterLobby} className="hover:text-slate-300 transition">Mission Dispatch</button>
              <span>•</span>
              <button onClick={onOpenLeaderboard} className="hover:text-slate-300 transition">Global Hall of Fame</button>
            </div>
          </div>

        </div>
      </footer>

      {/* Video Modal Popup */}
      {selectedIntelVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="max-w-2xl w-full glass-card rounded-2xl p-6 border border-rose-600 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-rose-400" />
                <h3 className="font-bold text-white text-sm">{selectedIntelVideo.title}</h3>
              </div>
              <button onClick={() => setSelectedIntelVideo(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="aspect-video rounded-xl bg-black border border-slate-800 flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-rose-600/80 flex items-center justify-center text-white animate-pulse">
                <Play className="h-6 w-6 fill-white ml-0.5" />
              </div>
              <div className="text-xs text-slate-300 font-mono">{selectedIntelVideo.desc}</div>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono">
                TACTICAL INTEL RECORDING • DURATION {selectedIntelVideo.duration}
              </span>
            </div>

            <button
              onClick={() => { setSelectedIntelVideo(null); onEnterLobby(); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 text-white font-bold text-xs uppercase"
            >
              DEPLOY INTO LIVE GAMEPLAY NOW
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
