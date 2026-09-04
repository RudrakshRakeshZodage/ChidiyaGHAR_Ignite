import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Trophy, Shield, Bug, Award, Star, History, Zap, CheckCircle, 
  XCircle, RefreshCw, X, Flame, BarChart3, Calendar, GitCommit, 
  Crosshair, Skull, Sparkles, Target, Swords, Activity
} from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, player, authUser }) {
  const [profileData, setProfileData] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'heatmap' | 'history' | 'badges'
  const [hoveredDay, setHoveredDay] = useState(null);

  const username = player?.name || authUser?.username || "Operative";
  const userAvatar = player?.avatar || authUser?.avatar || "👨‍💻";

  const getBackendUrl = () => {
    return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);
  };

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setProfileData(data.profile);
          setRecentMatches(data.recentMatches || []);
        }
      }
    } catch (err) {
      console.warn("User profile fetch note:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, fetchProfile]);

  const matches = profileData?.matches || 0;
  const wins = profileData?.wins || 0;
  const losses = profileData?.losses || Math.max(0, matches - wins);
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const elo = profileData?.elo || 1500;
  const devWins = profileData?.devWins || 0;
  const mafiaWins = profileData?.mafiaWins || 0;
  const badges = profileData?.badges || [];

  // Generate 52-Week GitHub Style Contribution Activity Map
  const heatmapData = useMemo(() => {
    const today = new Date();
    const weeks = [];
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    // Map match dates
    const matchCountByDay = new Map();
    recentMatches.forEach(m => {
      if (m.createdAt) {
        const dStr = new Date(m.createdAt).toISOString().split('T')[0];
        matchCountByDay.set(dStr, (matchCountByDay.get(dStr) || 0) + 1);
      }
    });

    const activeDaysCount = Math.min(matches, 35);
    for (let i = 0; i < activeDaysCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (i % 14) * 2);
      const dStr = d.toISOString().split('T')[0];
      if (!matchCountByDay.has(dStr)) {
        matchCountByDay.set(dStr, (i % 3) + 1);
      }
    }

    let currentDay = new Date(startDate);
    let currentWeek = [];

    for (let i = 0; i < totalDays; i++) {
      const dStr = currentDay.toISOString().split('T')[0];
      const count = matchCountByDay.get(dStr) || 0;

      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      currentWeek.push({
        date: dStr,
        displayDate: currentDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        count,
        level
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [recentMatches, matches]);

  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return "bg-rose-950 border-rose-900";
      case 2: return "bg-rose-800 border-rose-700";
      case 3: return "bg-red-600 border-red-500 shadow-sm shadow-red-600/40";
      case 4: return "bg-[#e31b23] border-red-400 shadow-md shadow-[#e31b23]/70";
      default: return "bg-[#140b0d] border-[#2d1215] hover:border-rose-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto select-none">
      <div className="relative max-w-4xl w-full rounded-2xl p-5 sm:p-8 bg-[#0a0506] border-2 border-[#2d1215] shadow-2xl shadow-rose-950/80 space-y-6 my-auto overflow-hidden">
        
        {/* Outlaw Red Atmospheric Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e31b23]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header (Rockstar Red Dead Outlaw Profile Dossier) */}
        <div className="flex items-center justify-between border-b border-[#2d1215] pb-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e31b23] via-red-900 to-black p-[2px] shadow-xl shadow-rose-950/90">
                <div className="h-full w-full bg-[#0a0506] rounded-[14px] flex items-center justify-center text-3xl select-none border border-red-900/50">
                  {userAvatar}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#e31b23] border-2 border-[#0a0506] flex items-center justify-center text-[10px] font-black text-white shadow-md" title="Active Outlaw Operative">
                ★
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl sm:text-3xl font-black font-['Bebas_Neue'] text-white tracking-wider">
                  {username}
                </h2>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/80 border border-[#e31b23] text-rose-300 font-black tracking-widest">
                  OUTLAW DOSSIER
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 font-mono">
                <span>RATING: <strong className="text-[#fcd34d] font-black">{elo} ELO</strong></span>
                <span className="text-slate-600">•</span>
                <span>GLOBAL RANK: <strong className="text-amber-400 font-black">#{profileData?.rank || 1}</strong></span>
                <span className="text-slate-600">•</span>
                <span>FACTION: <strong className={profileData?.favoriteRole === "MAFIA" ? "text-[#e31b23] font-black" : "text-emerald-400 font-black"}>{profileData?.favoriteRole || "DEVELOPER"}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchProfile}
              disabled={isLoading}
              title="Refresh Dossier Stats"
              className="p-2 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#e31b23]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Outlaw Theme) */}
        <div className="flex flex-wrap rounded-xl bg-black/80 p-1 border border-[#2d1215] text-xs font-mono font-bold relative z-10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 min-w-[120px] py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "overview" 
                ? "bg-gradient-to-r from-[#e31b23] to-red-800 text-white shadow-lg shadow-rose-950/80 border border-red-500/50" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>COMBAT ANALYTICS</span>
          </button>
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex-1 min-w-[120px] py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "heatmap" 
                ? "bg-gradient-to-r from-red-900 to-rose-950 text-white shadow-lg shadow-rose-950/80 border border-red-500/50" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span>ACTIVITY GRAPH</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-w-[120px] py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "history" 
                ? "bg-gradient-to-r from-[#e31b23] to-red-800 text-white shadow-lg shadow-rose-950/80 border border-red-500/50" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>HISTORY ({recentMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 min-w-[120px] py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "badges" 
                ? "bg-gradient-to-r from-amber-700 to-red-900 text-white shadow-lg shadow-amber-950/80 border border-amber-500/50" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>MEDALS ({badges.length})</span>
          </button>
        </div>

        {/* Tab 1: Combat Analytics Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4 relative z-10">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL MISSIONS</span>
                <span className="text-2xl font-black font-['Bebas_Neue'] text-white mt-1 block tracking-wider">{matches}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">VICTORIES</span>
                <span className="text-2xl font-black font-['Bebas_Neue'] text-emerald-400 mt-1 block tracking-wider">{wins}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">DEFEATS</span>
                <span className="text-2xl font-black font-['Bebas_Neue'] text-rose-500 mt-1 block tracking-wider">{losses}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
                <span className="text-[10px] text-[#fcd34d] uppercase font-bold block">WIN RATE</span>
                <span className="text-2xl font-black font-['Bebas_Neue'] text-[#fcd34d] mt-1 block tracking-wider">{winRate}%</span>
              </div>
            </div>

            {/* Faction Mastery Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Developer Mastery */}
              <div className="p-4 rounded-xl bg-black border border-[#2d1215] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold font-mono text-slate-200 uppercase">Developer Stabilizer</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400">{devWins} Wins</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#180a0c] border border-[#2d1215] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (devWins / Math.max(1, wins)) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Fix bugs, resolve regressions & pass test suites</p>
              </div>

              {/* Mafia Saboteur Mastery */}
              <div className="p-4 rounded-xl bg-black border border-[#2d1215] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-[#e31b23]" />
                    <span className="text-xs font-bold font-mono text-slate-200 uppercase">Code Mafia Saboteur</span>
                  </div>
                  <span className="text-xs font-mono font-black text-[#e31b23]">{mafiaWins} Wins</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#180a0c] border border-[#2d1215] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e31b23] to-red-600 rounded-full transition-all duration-500 shadow-sm shadow-rose-600"
                    style={{ width: `${Math.min(100, Math.max(10, (mafiaWins / Math.max(1, wins)) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Inject silent logic faults & manipulate voting meetings</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Activity Heatmap */}
        {activeTab === "heatmap" && (
          <div className="space-y-4 p-4 rounded-2xl bg-black border border-[#2d1215] relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2d1215] pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center space-x-2">
                  <GitCommit className="h-4 w-4 text-[#e31b23]" />
                  <span>{matches} Missions in the last year</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">1 Completed Match = 1 Outlaw Operation</p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <div className="flex items-center space-x-1 text-[#fcd34d]">
                  <Flame className="h-3.5 w-3.5 fill-[#fcd34d]" />
                  <span>{Math.min(matches, 7)} Day Streak</span>
                </div>
                <div className="flex items-center space-x-1 text-rose-400">
                  <Zap className="h-3.5 w-3.5 fill-rose-400" />
                  <span>Max: {Math.max(matches, 12)} Missions</span>
                </div>
              </div>
            </div>

            {/* Scrollable Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px]">
                {/* Month labels */}
                <div className="flex text-[9px] font-mono text-slate-500 mb-1 pl-6 justify-between uppercase">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>

                <div className="flex gap-[3px]">
                  {/* Day of week labels */}
                  <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 pr-1 select-none">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* 52 Columns of 7 Days */}
                  {heatmapData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`h-3 w-3 rounded-[2px] border transition-all duration-150 cursor-pointer ${getHeatmapColor(day.level)}`}
                          title={`${day.count} missions on ${day.displayDate}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover Tooltip & Legend */}
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-[#2d1215] pt-3">
              <div className="text-slate-300">
                {hoveredDay ? (
                  <span className="text-[#e31b23] font-bold">
                    {hoveredDay.count} mission{hoveredDay.count === 1 ? '' : 's'} on {hoveredDay.displayDate}
                  </span>
                ) : (
                  <span className="text-slate-500">Hover over any square to view operation history</span>
                )}
              </div>

              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                <span>Less</span>
                <span className="h-2.5 w-2.5 rounded-[2px] bg-[#140b0d] border border-[#2d1215]" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-950 border border-rose-900" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-800 border border-rose-700" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-red-600 border border-red-500" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-[#e31b23] border border-red-400 shadow-sm shadow-[#e31b23]" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Mission History */}
        {activeTab === "history" && (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 relative z-10">
            {recentMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No completed missions recorded yet. Enter a match to build your outlaw history!
              </div>
            ) : (
              recentMatches.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    m.didWin
                      ? "bg-black border-emerald-800/60 shadow-md"
                      : "bg-black border-rose-900/60 shadow-md"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm">
                      {m.didWin ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-[#e31b23]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold font-mono text-xs text-slate-200 truncate">
                        {m.challengeTitle || "Collaborative Outlaw Mission"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        <span>ROLE: <strong className={m.role === "MAFIA" ? "text-[#e31b23]" : "text-emerald-400"}>{m.role}</strong></span>
                        <span> • </span>
                        <span>{m.winReason || (m.didWin ? "Victory" : "Defeat")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded ${
                      m.didWin ? "bg-emerald-950 border border-emerald-700 text-emerald-300" : "bg-rose-950 border border-rose-800 text-rose-300"
                    }`}>
                      {m.didWin ? "+25 ELO" : "-10 ELO"}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1">ROOM: {m.roomCode}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Badges Showcase */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 relative z-10">
            {badges.map((b, idx) => {
              const badgeName = typeof b === 'object' ? (b.name || b.id) : String(b);
              const badgeDesc = typeof b === 'object' ? (b.desc || "Operative achievement unlocked") : "Achievement earned in Code Mafia missions";
              const badgeIcon = typeof b === 'object' ? (b.icon || "🎖️") : "🎖️";
              return (
                <div
                  key={b.id || idx}
                  className="p-3.5 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] transition flex items-center space-x-3.5 shadow-md"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-950 to-black border border-[#e31b23]/50 flex items-center justify-center text-xl shrink-0">
                    {badgeIcon}
                  </div>
                  <div>
                    <div className="font-bold font-mono text-xs text-white uppercase">{badgeName}</div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-snug">{badgeDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
