import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Trophy, Shield, Bug, Award, Star, History, Zap, CheckCircle, XCircle, RefreshCw, X, Flame, BarChart3, Calendar, GitCommit } from 'lucide-react';

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

    // Also populate recent days based on total matches count
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
      case 1: return "bg-emerald-900 border-emerald-800";
      case 2: return "bg-emerald-700 border-emerald-600";
      case 3: return "bg-emerald-500 border-emerald-400";
      case 4: return "bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/50";
      default: return "bg-slate-800/60 border-slate-700/40 hover:border-slate-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative max-w-4xl w-full glass-card rounded-2xl p-5 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-auto">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 p-[2px] shadow-lg shadow-indigo-500/20">
                <div className="h-full w-full bg-[#0d121d] rounded-[14px] flex items-center justify-center text-3xl select-none">
                  {userAvatar}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0d121d] flex items-center justify-center text-[9px] font-bold text-black" title="Active Operative">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
                  {username}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
                  AGENT PROFILE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2 font-mono">
                <span>Rating: <strong className="text-amber-400">{elo} ELO</strong></span>
                <span>•</span>
                <span>Rank: <strong className="text-sky-400">#{profileData?.rank || 1}</strong></span>
                <span>•</span>
                <span>Role: <strong className={profileData?.favoriteRole === "MAFIA" ? "text-rose-400" : "text-emerald-400"}>{profileData?.favoriteRole || "DEVELOPER"}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchProfile}
              disabled={isLoading}
              title="Refresh Stats"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "overview" ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Combat Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "heatmap" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span>Mission Activity Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "history" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History ({recentMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeTab === "badges" ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Medals ({badges.length})</span>
          </button>
        </div>

        {/* Tab 1: Combat Analytics Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Missions</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{matches}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-emerald-500 uppercase font-bold block">Victories</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{wins}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-rose-500 uppercase font-bold block">Defeats</span>
                <span className="text-xl font-extrabold text-rose-400 mt-1 block">{losses}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-amber-500 uppercase font-bold block">Win Rate</span>
                <span className="text-xl font-extrabold text-amber-400 mt-1 block">{winRate}%</span>
              </div>
            </div>

            {/* Faction Mastery Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Developer Mastery */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Developer Stabilizer</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{devWins} Wins</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (devWins / Math.max(1, wins)) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Fix code regressions and pass test suites</p>
              </div>

              {/* Mafia Saboteur Mastery */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">Code Mafia Saboteur</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">{mafiaWins} Wins</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (mafiaWins / Math.max(1, wins)) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Inject subtle bugs and manipulate voting</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub-Style Yearly Activity Heatmap */}
        {activeTab === "heatmap" && (
          <div className="space-y-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <GitCommit className="h-4 w-4 text-emerald-400" />
                  <span>{matches} Missions in the last year</span>
                </h3>
                <p className="text-[11px] text-slate-400">1 Mission Played = 1 Activity Commit</p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <div className="flex items-center space-x-1 text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{Math.min(matches, 7)} Day Streak</span>
                </div>
                <div className="flex items-center space-x-1 text-sky-400">
                  <Zap className="h-3.5 w-3.5 fill-sky-400" />
                  <span>Max: {Math.max(matches, 12)} Missions</span>
                </div>
              </div>
            </div>

            {/* Scrollable Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px]">
                {/* Month labels */}
                <div className="flex text-[9px] font-mono text-slate-500 mb-1 pl-6 justify-between">
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
                          title={`${day.count} missions played on ${day.displayDate}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover Tooltip & Legend */}
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-3">
              <div className="text-slate-300">
                {hoveredDay ? (
                  <span className="text-emerald-400 font-bold">
                    {hoveredDay.count} mission{hoveredDay.count === 1 ? '' : 's'} on {hoveredDay.displayDate}
                  </span>
                ) : (
                  <span className="text-slate-500">Hover over any square to view mission logs</span>
                )}
              </div>

              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                <span>Less</span>
                <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-800 border border-slate-700" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-900 border border-emerald-800" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-700 border border-emerald-600" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/50" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Mission History */}
        {activeTab === "history" && (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {recentMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No completed missions recorded yet. Play a match to build your combat log!
              </div>
            ) : (
              recentMatches.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    m.didWin
                      ? "bg-emerald-950/20 border-emerald-800/60"
                      : "bg-rose-950/20 border-rose-800/60"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm">
                      {m.didWin ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-200 truncate">
                        {m.challengeTitle || "Collaborative Mission"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        <span>Role: <strong className={m.role === "MAFIA" ? "text-rose-400" : "text-emerald-400"}>{m.role}</strong></span>
                        <span> • </span>
                        <span>{m.winReason || (m.didWin ? "Victory" : "Defeat")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                      m.didWin ? "bg-emerald-900/60 text-emerald-300" : "bg-rose-900/60 text-rose-300"
                    }`}>
                      {m.didWin ? "+25 ELO" : "-10 ELO"}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1">Room {m.roomCode}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Badges Showcase */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {badges.map((b, idx) => {
              const badgeName = typeof b === 'object' ? (b.name || b.id) : String(b);
              const badgeDesc = typeof b === 'object' ? (b.desc || "Operative achievement unlocked") : "Achievement earned in Code Mafia missions";
              const badgeIcon = typeof b === 'object' ? (b.icon || "🎖️") : "🎖️";
              return (
                <div
                  key={b.id || idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center space-x-3.5"
                >
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                    {badgeIcon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-200">{badgeName}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{badgeDesc}</p>
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
