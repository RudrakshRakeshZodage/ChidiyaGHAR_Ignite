import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, Flame, Shield, Bug, Users, Sparkles, X, Star, ArrowUpRight, TrendingUp, RefreshCw, Radio } from 'lucide-react';

export default function LeaderboardModal({ isOpen, onClose, player, authUser, room }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'dev' | 'mafia' | 'room'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState({ totalMatchesPlayed: 0, activeDevelopers: 0, activeMafia: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);
  };

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboard || []);
        if (data.totalMatchesPlayed !== undefined) {
          setStats({
            totalMatchesPlayed: data.totalMatchesPlayed,
            activeDevelopers: data.activeDevelopers,
            activeMafia: data.activeMafia
          });
        }
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Real-time leaderboard fetch note:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  // In-room live players
  const roomPlayersList = room?.players ? (
    Array.isArray(room.players) ? room.players : Object.values(room.players)
  ) : [];

  let displayedAgents = leaderboardData;
  if (filter === "dev") {
    displayedAgents = leaderboardData.filter(item => item.favoriteRole === "DEVELOPER");
  } else if (filter === "mafia") {
    displayedAgents = leaderboardData.filter(item => item.favoriteRole === "MAFIA");
  } else if (filter === "room") {
    displayedAgents = roomPlayersList.map((p, idx) => ({
      id: p.id || idx,
      rank: idx + 1,
      name: p.name,
      avatar: p.avatar || "👨‍💻",
      elo: p.role === "MAFIA" ? 1750 : 1620,
      winRate: p.isAlive ? "Active" : "Ejected",
      matches: 1,
      favoriteRole: p.role || "DEVELOPER",
      badges: [p.role === "MAFIA" ? "In-Room Saboteur" : "Active Stabilizer"]
    }));
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="h-7 w-7 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">🥇</span>;
    if (rank === 2) return <span className="h-7 w-7 rounded-xl bg-slate-400/20 border border-slate-300 text-slate-300 flex items-center justify-center font-bold text-xs">🥈</span>;
    if (rank === 3) return <span className="h-7 w-7 rounded-xl bg-amber-700/20 border border-amber-600 text-amber-600 flex items-center justify-center font-bold text-xs">🥉</span>;
    return <span className="h-7 w-7 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold text-xs">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative max-w-3xl w-full glass-card rounded-2xl p-5 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-auto">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Refresh */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black font-display text-white tracking-wide">
                  REAL-TIME AGENT LEADERBOARD
                </h2>
                <span className="flex items-center space-x-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>LIVE DATABASE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live rankings calculated directly from Supabase matches & live sessions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              title="Refresh live rankings"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
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

        {/* Real-time Overview Stats Row */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Missions</span>
            <span className="text-base sm:text-lg font-extrabold text-sky-400">{stats.totalMatchesPlayed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Live Developers</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400">{stats.activeDevelopers}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Live Mafia</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-400">{stats.activeMafia}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "all" ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              All Agents
            </button>
            <button
              onClick={() => setFilter("dev")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                filter === "dev" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Developers</span>
            </button>
            <button
              onClick={() => setFilter("mafia")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                filter === "mafia" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bug className="h-3.5 w-3.5" />
              <span>Code Mafia</span>
            </button>
            {roomPlayersList.length > 0 && (
              <button
                onClick={() => setFilter("room")}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                  filter === "room" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Room Squad ({roomPlayersList.length})</span>
              </button>
            )}
          </div>

          {lastUpdated && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Updated: {lastUpdated}
            </span>
          )}
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {displayedAgents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No match data available yet. Play a mission to appear on the leaderboard!
            </div>
          ) : (
            displayedAgents.map((agent, index) => {
              const isMafiaPref = agent.favoriteRole === "MAFIA";
              const isSelf = agent.name === (player?.name || authUser?.username);

              return (
                <div
                  key={agent.id || index}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isSelf
                      ? "bg-amber-950/20 border-amber-600/70 shadow-md shadow-amber-950/30"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {getRankBadge(agent.rank || index + 1)}

                    <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                      {agent.avatar || "👨‍💻"}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center space-x-1.5">
                        <span className="truncate">{agent.name}</span>
                        {isSelf && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold">
                            YOU
                          </span>
                        )}
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          isMafiaPref ? "bg-rose-950/80 text-rose-300 border border-rose-800" : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                        }`}>
                          {isMafiaPref ? "Mafia Main" : "Dev Main"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{agent.matches} Matches</span>
                        <span>•</span>
                        {agent.badges?.[0] && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 truncate">
                              {typeof agent.badges[0] === 'object' ? (agent.badges[0]?.name || agent.badges[0]?.id) : String(agent.badges[0])}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs sm:text-sm font-extrabold text-amber-400 flex items-center justify-end space-x-1">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{agent.elo} ELO</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Live Score</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
