import React, { useState } from 'react';
import { 
  Play, Shield, Bug, Eye, Terminal, Users, Flame, Star, 
  ChevronRight, ArrowRight, Video, Radio, Sparkles, Award, 
  Search, Lock, CheckCircle2, Cpu, Globe, Crosshair, HelpCircle,
  Volume2, VolumeX, Layers, Trophy, Gift, ArrowUpRight,
  ExternalLink, Mail
} from 'lucide-react';
import CatTarotCard, { CAT_TAROT_ARCHETYPES } from './CatTarotCard';

export default function LandingPage({
  onEnterLobby,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenAuth,
  authUser
}) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const MEDIA_ITEMS = [
    {
      id: "official_gameplay",
      title: "Official Gameplay Trailer",
      tag: "TRAILER",
      desc: "Experience the intense 30-second active coding lockout and tactical bug injection.",
      length: "02:15",
      accent: "#e31b23"
    },
    {
      id: "blood_money",
      title: "Code Mafia Online: Blood Money",
      tag: "TRAILER",
      desc: "Join high-stakes ranked rooms, earn badges, and climb the global leaderboards.",
      length: "01:50",
      accent: "#b91c1c"
    },
    {
      id: "world_of_mafia",
      title: "The World of Code Mafia II",
      tag: "VIDEO",
      desc: "Explore isolated developer workspaces, AST execution engines, and CCTV feeds.",
      length: "03:40",
      accent: "#991b1b"
    },
    {
      id: "outlaws_for_life",
      title: "Outlaws For Life: 12 Cat Archetypes",
      tag: "TRAILER",
      desc: "Inspect the Doctor, the Hitman, the Courtesan, the Maniac, and the Judge.",
      length: "02:05",
      accent: "#dc2626"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#e31b23] selection:text-white relative overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY STRIP (ROCKSTAR STYLE) */}
      {/* ========================================================================= */}
      <div className="bg-black border-b border-[#1c1c1c] text-[10px] font-mono tracking-widest px-4 sm:px-12 py-2 flex items-center justify-between z-40 relative select-none">
        <div className="flex items-center space-x-2">
          <span className="text-[#e31b23] font-black uppercase tracking-widest">OUTLAWS FOR LIFE.</span>
        </div>
        <div className="flex items-center space-x-6 text-[#888888] font-bold">
          <a href="https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center space-x-1">
            <span>CHIDIYAGHAR GAMES</span>
            <span className="text-[9px]">↗</span>
          </a>
          <button onClick={onOpenLeaderboard} className="hover:text-white transition flex items-center space-x-1">
            <span>SOCIAL CLUB</span>
            <span className="text-[9px]">↗</span>
          </button>
          <button onClick={authUser ? onOpenProfile : onOpenAuth} className="hover:text-[#e31b23] transition flex items-center space-x-1">
            <span>{authUser ? authUser.name.toUpperCase() : "SUPPORT"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN HEADER (RDR2 LOGO + HORIZONTAL NAVIGATION) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-[#202020] px-4 sm:px-12 py-4 flex items-center justify-between select-none">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterLobby}>
          <div className="flex items-center tracking-tighter">
            <span className="text-2xl sm:text-3xl font-black font-['Bebas_Neue'] tracking-wider text-white">
              CODE MAFIA
            </span>
            <span className="ml-1.5 text-3xl font-black text-[#e31b23] font-serif">
              II
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-[#cccccc]">
          <a href="#hero" className="text-[#e31b23] border-b-2 border-[#e31b23] pb-1 transition">HOME</a>
          <a href="#story" className="hover:text-[#e31b23] transition">STORY</a>
          <a href="#features" className="hover:text-[#e31b23] transition">GAMEPLAY</a>
          <a href="#online" className="hover:text-[#e31b23] transition">ONLINE</a>
          <a href="#media" className="hover:text-[#e31b23] transition">MEDIA</a>
          <a href="#news" className="hover:text-[#e31b23] transition">NEWS</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-5 text-xs font-bold uppercase tracking-wider text-[#cccccc]">
          <button onClick={onOpenLeaderboard} className="hidden sm:flex items-center space-x-1 hover:text-white transition">
            <Search className="h-3.5 w-3.5" />
            <span>SEARCH</span>
          </button>
          <button onClick={authUser ? onOpenProfile : onOpenAuth} className="flex items-center space-x-1.5 hover:text-white transition">
            <Users className="h-3.5 w-3.5 text-[#e31b23]" />
            <span>{authUser ? "PROFILE" : "LOGIN"}</span>
          </button>
          <button
            onClick={onEnterLobby}
            className="px-4 py-2 rounded bg-[#e31b23] hover:bg-[#c9181f] text-white font-black text-xs uppercase tracking-widest transition shadow-lg flex items-center space-x-1"
          >
            <span>PLAY (0)</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (ATMOSPHERIC BLOOD MOON & NOIR OUTLAW) */}
      {/* ========================================================================= */}
      <section id="hero" className="relative min-h-[88vh] flex items-center px-4 sm:px-12 py-16 overflow-hidden bg-gradient-to-r from-black via-[#140003] to-[#250207]">
        
        {/* Gigantic Blood Red Moon & Silhouette Backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 pointer-events-none overflow-hidden flex items-center justify-end">
          {/* Glowing Blood Moon */}
          <div className="absolute right-8 top-12 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#ff2a34] via-[#b8000b] to-[#400004] opacity-90 blur-sm shadow-[0_0_120px_rgba(227,27,35,0.7)]" />
          
          {/* Mist / Cloud Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

          {/* SVG Outlaw Cat Silhouette on Horse / Trenchcoat Silhouette */}
          <svg viewBox="0 0 500 600" className="w-full h-full max-w-[550px] relative z-10 opacity-95 drop-shadow-2xl">
            {/* Dark Horizon & Smoke */}
            <path d="M 0 550 Q 250 510 500 550 L 500 600 L 0 600 Z" fill="#050505" />
            
            {/* Outlaw Cat Silhouette */}
            <g transform="translate(140, 110) scale(1.15)">
              {/* Wide Brim Fedora / Cowboy Hat */}
              <ellipse cx="120" cy="110" rx="90" ry="20" fill="#080808" />
              <path d="M 60 110 Q 120 40 180 110 Z" fill="#0a0a0a" />
              
              {/* Ears popping through */}
              <polygon points="65,95 80,45 95,85" fill="#080808" />
              <polygon points="175,95 160,45 145,85" fill="#080808" />
              
              {/* Cat Whiskers in Red Glow */}
              <line x1="60" y1="140" x2="10" y2="135" stroke="#ff4d55" strokeWidth="1.5" opacity="0.6" />
              <line x1="60" y1="150" x2="15" y2="155" stroke="#ff4d55" strokeWidth="1.5" opacity="0.6" />
              <line x1="180" y1="140" x2="230" y2="135" stroke="#ff4d55" strokeWidth="1.5" opacity="0.6" />
              <line x1="180" y1="150" x2="225" y2="155" stroke="#ff4d55" strokeWidth="1.5" opacity="0.6" />

              {/* Glowing Eyes */}
              <ellipse cx="95" cy="130" rx="8" ry="10" fill="#ffb833" opacity="0.9" />
              <ellipse cx="145" cy="130" rx="8" ry="10" fill="#ffb833" opacity="0.9" />
              <ellipse cx="95" cy="130" rx="2" ry="8" fill="#000" />
              <ellipse cx="145" cy="130" rx="2" ry="8" fill="#000" />

              {/* Trenchcoat / Shoulders */}
              <path d="M 30 350 L 50 180 L 190 180 L 210 350 Z" fill="#080808" />
              <path d="M 90 180 L 120 280 L 150 180 Z" fill="#140003" stroke="#e31b23" strokeWidth="1" />
              
              {/* Smoking Gun / Revolver Silhouette */}
              <rect x="180" y="220" width="45" height="14" fill="#151515" rx="2" />
              <rect x="225" y="224" width="25" height="6" fill="#202020" rx="1" />
              <circle cx="250" cy="227" r="3" fill="#e31b23" opacity="0.8" />
              
              {/* Smoke Wisp from gun */}
              <path d="M 255 227 Q 280 200 270 170 Q 290 140 280 110" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
            </g>
          </svg>
        </div>

        {/* Hero Left Typography (Matching RDR2) */}
        <div className="max-w-xl w-full relative z-20 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-serif font-black tracking-widest text-[#e31b23] uppercase block">
              CHIDIYAGHAR GAMES PRESENTS
            </span>

            {/* Massive Distressed Western Title */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-['Bebas_Neue'] tracking-tight text-white leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              RED DEAD <br />
              <span className="text-[#e31b23]">CODE MAFIA</span> <span className="text-white font-serif">II</span>
            </h1>

            {/* Red Star Divider */}
            <div className="flex items-center space-x-3 py-1">
              <div className="w-10 h-[2px] bg-[#e31b23]" />
              <span className="text-[#e31b23] text-sm">★</span>
              <div className="w-10 h-[2px] bg-[#e31b23]" />
            </div>
          </div>

          <div className="space-y-1 text-sm font-['Montserrat'] font-bold text-[#e0e0e0] tracking-wider uppercase">
            <div>SILICON SYNDICATE, 2026.</div>
            <div className="text-[#999999]">THE ERA OF CLEAN CODE HAS COME TO AN END.</div>
          </div>

          {/* Action Buttons (Solid Red Rectangular + Watch Trailer) */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onEnterLobby}
              className="px-7 py-3.5 bg-[#e31b23] hover:bg-[#b8141b] text-white font-black font-['Montserrat'] text-xs uppercase tracking-widest transition flex items-center space-x-2 shadow-2xl"
            >
              <span>PLAY NOW</span>
              <span className="text-sm font-bold">❯</span>
            </button>

            <button
              onClick={() => setSelectedVideo(MEDIA_ITEMS[0])}
              className="px-6 py-3.5 bg-transparent hover:text-white text-[#cccccc] font-black font-['Montserrat'] text-xs uppercase tracking-widest transition flex items-center space-x-2 border-b-2 border-transparent hover:border-white"
            >
              <span>WATCH TRAILER</span>
              <span className="text-xs text-[#e31b23]">▶</span>
            </button>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR FEATURE CARDS (EXACT MATCHING RDR2 GRID WITH RED ICONS) */}
      {/* ========================================================================= */}
      <section id="features" className="py-14 px-4 sm:px-12 bg-black border-y border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Living World */}
          <div className="group p-6 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e31b23] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Red Hat Icon */}
              <div className="h-9 w-9 text-[#e31b23]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M21.5 17c-.8 0-1.5-.4-2-1-.8-1-2.2-1.7-3.8-1.9-.3-1.4-.8-2.6-1.5-3.6C15.4 7.6 14.8 4 12 4s-3.4 3.6-2.2 6.5c-.7 1-1.2 2.2-1.5 3.6-1.6.2-3 .9-3.8 1.9-.5.6-1.2 1-2 1-1.4 0-2.5 1.1-2.5 2.5v.5h24v-.5c0-1.4-1.1-2.5-2.5-2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-black font-['Bebas_Neue'] tracking-wider text-white">
                LIVING WORLD
              </h3>
              <p className="text-xs text-[#8e8e8e] leading-relaxed">
                A vast and atmospheric terminal sandbox filled with isolated developer workspaces, live AST execution, and test suites.
              </p>
            </div>
            <button onClick={onEnterLobby} className="text-[11px] font-black font-['Montserrat'] text-[#e31b23] hover:text-white uppercase tracking-wider flex items-center space-x-1">
              <span>EXPLORE THE WORLD</span>
              <span>❯</span>
            </button>
          </div>

          {/* Card 2: Rich Story */}
          <div className="group p-6 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e31b23] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Red Revolver Icon */}
              <div className="h-9 w-9 text-[#e31b23]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M21 7h-7l-1-2H4c-1.1 0-2 .9-2 2v2h2v4H2v2c0 1.1.9 2 2 2h4l4-3h9c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 7H7v-4h7v4z" />
                </svg>
              </div>
              <h3 className="text-lg font-black font-['Bebas_Neue'] tracking-wider text-white">
                RICH STORY
              </h3>
              <p className="text-xs text-[#8e8e8e] leading-relaxed">
                An epic tale of honor, loyalty, secret developer roles, and the tactical choices that define your legacy.
              </p>
            </div>
            <a href="#story" className="text-[11px] font-black font-['Montserrat'] text-[#e31b23] hover:text-white uppercase tracking-wider flex items-center space-x-1">
              <span>DISCOVER THE STORY</span>
              <span>❯</span>
            </a>
          </div>

          {/* Card 3: Dynamic Gameplay */}
          <div className="group p-6 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e31b23] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Red Flame Icon */}
              <div className="h-9 w-9 text-[#e31b23]">
                <Flame className="w-full h-full" />
              </div>
              <h3 className="text-lg font-black font-['Bebas_Neue'] tracking-wider text-white">
                DYNAMIC GAMEPLAY
              </h3>
              <p className="text-xs text-[#8e8e8e] leading-relaxed">
                Surveil, freeze, inject bugs, refactor, and survive in a world where every single keystroke has consequences.
              </p>
            </div>
            <a href="#demo" className="text-[11px] font-black font-['Montserrat'] text-[#e31b23] hover:text-white uppercase tracking-wider flex items-center space-x-1">
              <span>LEARN MORE</span>
              <span>❯</span>
            </a>
          </div>

          {/* Card 4: Code Mafia Online */}
          <div className="group p-6 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e31b23] transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Red Star Badge Icon */}
              <div className="h-9 w-9 text-[#e31b23]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-black font-['Bebas_Neue'] tracking-wider text-white">
                RED DEAD ONLINE
              </h3>
              <p className="text-xs text-[#8e8e8e] leading-relaxed">
                Join your friends and forge your own path in the ever-evolving multiplayer world with GitHub-style 52-week mission heatmaps.
              </p>
            </div>
            <button onClick={onEnterLobby} className="text-[11px] font-black font-['Montserrat'] text-[#e31b23] hover:text-white uppercase tracking-wider flex items-center space-x-1">
              <span>PLAY ONLINE</span>
              <span>❯</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE STORY (ARTHUR MORGAN STYLE CINEMATIC SECTION) */}
      {/* ========================================================================= */}
      <section id="story" className="py-20 px-4 sm:px-12 bg-gradient-to-r from-black via-[#140003] to-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-serif font-black tracking-widest text-[#e31b23] uppercase block">
              THE STORY
            </span>

            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black font-['Bebas_Neue'] tracking-tight text-white leading-none">
              LOYALTY. <br />
              HONOR. <br />
              <span className="text-[#e31b23]">REDEMPTION.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#b0b0b0] font-medium leading-relaxed">
              Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best
              bounty hunters in the nation closing in, the gang must rob, steal, and fight their way across
              America to survive.
            </p>

            <p className="text-xs text-[#888888] leading-relaxed">
              In Code Mafia II, an undercover saboteur lurks in your developer sprint. Corrupted pull requests,
              inverted boundaries, and hidden syntax traps threaten the codebase. Unmask the traitor before deployment.
            </p>

            <button
              onClick={onEnterLobby}
              className="px-7 py-3.5 bg-[#e31b23] hover:bg-[#b8141b] text-white font-black font-['Montserrat'] text-xs uppercase tracking-widest transition flex items-center space-x-2"
            >
              <span>EXPLORE THE STORY</span>
              <span>❯</span>
            </button>
          </div>

          {/* Right: Character Portrait Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden border-2 border-[#330005] bg-gradient-to-b from-[#220005] to-black shadow-2xl p-6 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e31b23]/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between border-b border-[#3a0008] pb-3">
                <span className="text-xs font-mono font-bold text-[#e31b23] tracking-widest">WANTED: DEAD OR ALIVE</span>
                <span className="text-[10px] font-mono text-[#888]">$5,000 BOUNTY</span>
              </div>

              {/* Centered Cat Mafia Portrait */}
              <div className="w-full flex justify-center my-4">
                <div className="w-44 aspect-[4/5]">
                  <CatTarotCard
                    player={{ name: "ARTHUR CAT", role: "MAFIA", isAlive: true }}
                    index={1}
                    isSelectable={false}
                    badgeText="OUTLAW DON"
                  />
                </div>
              </div>

              <div className="relative z-10 text-center border-t border-[#3a0008] pt-3">
                <div className="text-sm font-['Bebas_Neue'] tracking-wider text-white">THE SYNDICATE SABOTEUR</div>
                <div className="text-[10px] text-[#888] font-mono">SILICON UNDERWORLD • 2026</div>
              </div>
            </div>
          </div>

        </div>

        {/* 5 Red Line-Art Icons Strip */}
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#1a1a1a] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1">
            <Globe className="h-6 w-6 text-[#e31b23] mx-auto" />
            <div className="text-xs font-black font-['Bebas_Neue'] tracking-wider text-white">VAST OPEN WORLD</div>
            <div className="text-[10px] text-[#777]">Explore isolated sandboxes</div>
          </div>

          <div className="space-y-1">
            <Crosshair className="h-6 w-6 text-[#e31b23] mx-auto" />
            <div className="text-xs font-black font-['Bebas_Neue'] tracking-wider text-white">HUNT & SURVIVE</div>
            <div className="text-[10px] text-[#777]">Track bug injections</div>
          </div>

          <div className="space-y-1">
            <Layers className="h-6 w-6 text-[#e31b23] mx-auto" />
            <div className="text-xs font-black font-['Bebas_Neue'] tracking-wider text-white">GAMES & ACTIVITIES</div>
            <div className="text-[10px] text-[#777]">12 tarot character cards</div>
          </div>

          <div className="space-y-1">
            <Radio className="h-6 w-6 text-[#e31b23] mx-auto" />
            <div className="text-xs font-black font-['Bebas_Neue'] tracking-wider text-white">BOND WITH SQUAD</div>
            <div className="text-[10px] text-[#777]">Live WebRTC voice chat</div>
          </div>

          <div className="space-y-1">
            <Users className="h-6 w-6 text-[#e31b23] mx-auto" />
            <div className="text-xs font-black font-['Bebas_Neue'] tracking-wider text-white">RED DEAD ONLINE</div>
            <div className="text-[10px] text-[#777]">Global Supabase leaderboards</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LATEST TRAILERS & MEDIA (CAROUSEL WITH RED ARROWS) */}
      {/* ========================================================================= */}
      <section id="media" className="py-20 px-4 sm:px-12 bg-black border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black font-['Bebas_Neue'] tracking-wider text-white">
              LATEST TRAILERS & MEDIA
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCarouselIndex(prev => (prev === 0 ? MEDIA_ITEMS.length - 1 : prev - 1))}
                className="h-8 w-8 rounded bg-[#151515] hover:bg-[#e31b23] text-white flex items-center justify-center transition font-bold"
              >
                ‹
              </button>
              <button
                onClick={() => setCarouselIndex(prev => (prev === MEDIA_ITEMS.length - 1 ? 0 : prev + 1))}
                className="h-8 w-8 rounded bg-[#151515] hover:bg-[#e31b23] text-white flex items-center justify-center transition font-bold"
              >
                ›
              </button>
              <button onClick={onEnterLobby} className="text-xs font-mono font-bold text-[#e31b23] hover:text-white uppercase ml-4">
                VIEW ALL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MEDIA_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedVideo(item)}
                className="group bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#e31b23] p-3 cursor-pointer transition-all duration-300 space-y-3"
              >
                {/* Media Thumbnail Frame */}
                <div className="aspect-video rounded bg-gradient-to-br from-[#2a0004] via-[#100002] to-black border border-[#2a2a2a] relative overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition">
                  <div className="h-10 w-10 rounded-full bg-[#e31b23] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition">
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-[8px] font-mono text-[#aaa]">
                    {item.length}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-white group-hover:text-[#e31b23] transition line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[#e31b23] font-bold uppercase tracking-wider block mt-0.5">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CINEMATIC FOOTER (ROCKSTAR / ESRB THEMED) */}
      {/* ========================================================================= */}
      <footer className="bg-black border-t-2 border-[#1c1c1c] pt-16 pb-12 px-4 sm:px-12 text-[#888888] text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Logo + ESRB M Rating */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center tracking-tighter">
                <span className="text-2xl font-black font-['Bebas_Neue'] tracking-wider text-white">
                  CODE MAFIA
                </span>
                <span className="ml-1 text-2xl font-black text-[#e31b23] font-serif">II</span>
              </div>

              {/* ESRB Box */}
              <div className="p-3 border-2 border-[#444444] bg-[#080808] max-w-[260px] flex items-center space-x-3">
                <div className="h-12 w-10 border-2 border-white bg-black flex items-center justify-center text-white font-black text-xl font-serif shrink-0">
                  M
                </div>
                <div className="text-[9px] font-mono text-[#cccccc] leading-tight">
                  <strong className="text-white block text-[10px]">MATURE 17+</strong>
                  Blood and Gore<br />
                  Intense Violence<br />
                  Strong Language<br />
                  Use of Code Sabotage
                </div>
              </div>
            </div>

            {/* Game column */}
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-black text-white uppercase tracking-widest text-[11px] font-['Bebas_Neue']">
                GAME
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#story" className="hover:text-white transition">Story</a></li>
                <li><a href="#features" className="hover:text-white transition">Gameplay</a></li>
                <li><a href="#online" className="hover:text-white transition">Code Mafia Online</a></li>
                <li><a href="#media" className="hover:text-white transition">News & Updates</a></li>
              </ul>
            </div>

            {/* Support column */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="font-black text-white uppercase tracking-widest text-[11px] font-['Bebas_Neue']">
                SUPPORT
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="https://github.com/RudrakshRakeshZodage/ChidiyaGHAR_Ignite" target="_blank" rel="noreferrer" className="hover:text-white transition">Help Center</a></li>
                <li><button onClick={onOpenProfile} className="hover:text-white transition">52-Week Dossier</button></li>
                <li><button onClick={onOpenLeaderboard} className="hover:text-white transition">Rankings API</button></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-black text-white uppercase tracking-widest text-[11px] font-['Bebas_Neue']">
                NEWSLETTER
              </h4>
              <p className="text-[11px] text-[#888]">
                Get the latest news and updates straight to your inbox.
              </p>
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#e31b23]"
                />
                <button
                  type="button"
                  onClick={() => alert("Subscribed to Code Mafia Dispatch!")}
                  className="px-3.5 py-2 bg-[#e31b23] hover:bg-[#b8141b] text-white font-bold text-xs"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Social Icons & Rockstar Square Badge */}
          <div className="pt-8 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center space-x-6 text-[#999999]">
              <span className="hover:text-white cursor-pointer">Facebook</span>
              <span className="hover:text-white cursor-pointer">X / Twitter</span>
              <span className="hover:text-white cursor-pointer">Instagram</span>
              <span className="hover:text-white cursor-pointer">YouTube</span>
              <span className="hover:text-white cursor-pointer">Twitch</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-[10px] text-[#666]">
                © 2026 ChidiyaGHAR Games. Code Mafia, Red Dead, and RDR2 are inspired creations.
              </span>
              {/* Rockstar R* Badge */}
              <div className="h-7 w-7 rounded bg-[#e31b23] flex items-center justify-center text-black font-black text-sm font-sans shadow">
                R★
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Video Modal Briefing */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="max-w-2xl w-full bg-[#0d0d0d] border border-[#e31b23] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252525] pb-3">
              <span className="font-['Bebas_Neue'] text-lg text-white tracking-wider">{selectedVideo.title}</span>
              <button onClick={() => setSelectedVideo(null)} className="text-[#888] hover:text-white text-sm">✕</button>
            </div>
            <div className="aspect-video bg-black border border-[#222] flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-[#e31b23] flex items-center justify-center text-white">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>
              <p className="text-xs text-[#aaa] font-mono">{selectedVideo.desc}</p>
            </div>
            <button
              onClick={() => { setSelectedVideo(null); onEnterLobby(); }}
              className="w-full py-3 bg-[#e31b23] hover:bg-[#b8141b] text-white font-black text-xs uppercase tracking-widest"
            >
              DEPLOY TO LIVE GAMEPLAY
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
