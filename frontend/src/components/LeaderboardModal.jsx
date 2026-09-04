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
    if (rank === 1) {
      return (
        <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-black border-2 border-[#fcd34d] text-amber-300 flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/30">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-400/30 to-black border-2 border-slate-300 text-slate-200 flex items-center justify-center font-black text-sm shadow-md">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-800/30 to-black border-2 border-amber-600 text-amber-400 flex items-center justify-center font-black text-sm shadow-md">
          🥉
        </span>
      );
    }
    return (
      <span className="h-8 w-8 rounded-xl bg-black border border-[#2d1215] text-slate-400 flex items-center justify-center font-mono font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto select-none">
      <div className="relative max-w-3xl w-full rounded-2xl p-5 sm:p-8 bg-[#0a0506] border-2 border-[#2d1215] shadow-2xl shadow-rose-950/80 space-y-6 my-auto overflow-hidden">
        
        {/* Outlaw Red Atmospheric Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e31b23]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Refresh (Rockstar Red Dead Outlaw Style) */}
        <div className="flex items-center justify-between border-b border-[#2d1215] pb-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#e31b23] via-red-900 to-black p-[2px] shadow-xl shadow-rose-950/90 flex items-center justify-center">
              <div className="h-full w-full bg-[#0a0506] rounded-[14px] flex items-center justify-center text-[#fcd34d] border border-red-900/50">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl sm:text-3xl font-black font-['Bebas_Neue'] text-white tracking-wider">
                  REAL-TIME AGENT LEADERBOARD
                </h2>
                <span className="flex items-center space-x-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/80 border border-[#e31b23] text-rose-300 font-black tracking-widest animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e31b23]" />
                  <span>LIVE DATABASE</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Live rankings calculated directly from database matches & live outlaw sessions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              title="Refresh live rankings"
              className="p-2 rounded-xl bg-black border border-[#2d1215] hover:border-[#e31b23] text-slate-300 hover:text-white transition flex items-center space-x-1"
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

        {/* Real-time Overview Stats Row */}
        <div className="grid grid-cols-3 gap-3 font-mono relative z-10">
          <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL MISSIONS</span>
            <span className="text-2xl font-black font-['Bebas_Neue'] text-white mt-1 block tracking-wider">
              {stats.totalMatchesPlayed}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">LIVE DEVELOPERS</span>
            <span className="text-2xl font-black font-['Bebas_Neue'] text-emerald-400 mt-1 block tracking-wider">
              {stats.activeDevelopers}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-black border border-[#2d1215] text-center shadow-md">
            <span className="text-[10px] text-rose-400 uppercase font-bold block">LIVE MAFIA</span>
            <span className="text-2xl font-black font-['Bebas_Neue'] text-[#e31b23] mt-1 block tracking-wider">
              {stats.activeMafia}
            </span>
          </div>
        </div>

        {/* Filter Pills (Outlaw Theme) */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex flex-wrap rounded-xl bg-black/80 p-1 border border-[#2d1215] text-xs font-mono font-bold overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "all" 
                  ? "bg-gradient-to-r from-[#e31b23] to-red-800 text-white shadow-lg shadow-rose-950/80 border border-red-500/50" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Agents
            </button>
            <button
              onClick={() => setFilter("dev")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                filter === "dev" 
                  ? "bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow border border-emerald-500/50" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Developers</span>
            </button>
            <button
              onClick={() => setFilter("mafia")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                filter === "mafia" 
                  ? "bg-gradient-to-r from-[#e31b23] to-rose-950 text-white shadow border border-red-500/50" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bug className="h-3.5 w-3.5 text-[#e31b23]" />
              <span>Code Mafia</span>
            </button>
            {roomPlayersList.length > 0 && (
              <button
                onClick={() => setFilter("room")}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                  filter === "room" 
                    ? "bg-gradient-to-r from-amber-700 to-red-900 text-white shadow border border-amber-500/50" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>Room Squad ({roomPlayersList.length})</span>
              </button>
            )}
          </div>

          {lastUpdated && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              SYNC: {lastUpdated}
            </span>
          )}
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 relative z-10">
          {displayedAgents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No match data available yet. Complete a mission to claim your spot on the outlaw leaderboard!
            </div>
          ) : (
            displayedAgents.map((agent, index) => {
              const isMafiaPref = agent.favoriteRole === "MAFIA";
              const isSelf = agent.name === (player?.name || authUser?.username);

              return (
                <div
                  key={agent.id || index}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelf
                      ? "bg-gradient-to-r from-amber-950/40 via-black to-black border-2 border-amber-500/80 shadow-lg shadow-amber-950/50"
                      : "bg-black border border-[#2d1215] hover:border-red-900/80 shadow-md"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {getRankBadge(agent.rank || index + 1)}

                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-950/60 to-black border border-red-900/50 flex items-center justify-center text-lg shrink-0">
                      {agent.avatar || "👨‍💻"}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center space-x-2">
                        <span className="truncate font-mono">{agent.name}</span>
                        {isSelf && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#fcd34d] text-black font-black tracking-wider">
                            YOU
                          </span>
                        )}
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-black tracking-wider ${
                          isMafiaPref ? "bg-rose-950/90 text-[#e31b23] border border-[#e31b23]/60" : "bg-emerald-950/90 text-emerald-300 border border-emerald-700/60"
                        }`}>
                          {isMafiaPref ? "Mafia Main" : "Dev Main"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{agent.matches} Matches</span>
                        <span className="text-slate-600">•</span>
                        {agent.badges?.[0] ? (
                          <span className="text-[#fcd34d] truncate font-semibold">
                            {typeof agent.badges[0] === 'object' ? (agent.badges[0]?.name || agent.badges[0]?.id) : String(agent.badges[0])}
                          </span>
                        ) : (
                          <span className="text-slate-500">Active Operative</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="text-base sm:text-lg font-black font-['Bebas_Neue'] text-[#fcd34d] flex items-center justify-end space-x-1 tracking-wider">
                      <Star className="h-3.5 w-3.5 fill-[#fcd34d]" />
                      <span>{agent.elo} ELO</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Live Score</span>
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
