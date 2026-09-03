import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Shield, Bug, Users, Sparkles, X, Star, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function LeaderboardModal({ isOpen, onClose, player, authUser }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'dev' | 'mafia'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState({ totalMatchesPlayed: 840, activeDevelopers: 320, activeMafia: 110 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setLeaderboardData(data.leaderboard || []);
          if (data.totalMatchesPlayed) {
            setStats({
              totalMatchesPlayed: data.totalMatchesPlayed,
              activeDevelopers: data.activeDevelopers,
              activeMafia: data.activeMafia
            });
          }
        }
      } catch (err) {
        console.warn("Using offline leaderboard data:", err.message);
        // Fallback default leaderboard
        setLeaderboardData([
          { id: "1", rank: 1, name: "ShadowHacker", avatar: "🥷", elo: 2480, winRate: "88%", matches: 54, favoriteRole: "MAFIA", devWins: 18, mafiaWins: 30, badges: ["Master Saboteur", "Ghost Committer"] },
          { id: "2", rank: 2, name: "PixelDoctor", avatar: "👩‍💻", elo: 2390, winRate: "82%", matches: 61, favoriteRole: "DEVELOPER", devWins: 42, mafiaWins: 8, badges: ["Grandmaster Debugger", "Test Speedrunner"] },
          { id: "3", rank: 3, name: "CyberSpecter", avatar: "👻", elo: 2280, winRate: "79%", matches: 48, favoriteRole: "MAFIA", devWins: 12, mafiaWins: 26, badges: ["Stealth Infiltrator"] },
          { id: "4", rank: 4, name: "DevWizard", avatar: "🧙‍♂️", elo: 2190, winRate: "75%", matches: 52, favoriteRole: "DEVELOPER", devWins: 35, mafiaWins: 4, badges: ["Architecture Stabilizer"] },
          { id: "5", rank: 5, name: "NullPointer", avatar: "🤖", elo: 2110, winRate: "71%", matches: 45, favoriteRole: "MAFIA", devWins: 14, mafiaWins: 18, badges: ["Exception Crafter"] },
          { id: "6", rank: 6, name: "AaravCoder", avatar: "👨‍💻", elo: 2040, winRate: "68%", matches: 38, favoriteRole: "DEVELOPER", devWins: 22, mafiaWins: 4, badges: ["Bug Hunter"] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAgents = leaderboardData.filter((item) => {
    if (filter === "dev") return item.favoriteRole === "DEVELOPER";
    if (filter === "mafia") return item.favoriteRole === "MAFIA";
    return true;
  });

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="h-7 w-7 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">🥇</span>;
    if (rank === 2) return <span className="h-7 w-7 rounded-xl bg-slate-400/20 border border-slate-300 text-slate-300 flex items-center justify-center font-bold text-xs">🥈</span>;
    if (rank === 3) return <span className="h-7 w-7 rounded-xl bg-amber-700/20 border border-amber-600 text-amber-600 flex items-center justify-center font-bold text-xs">🥉</span>;
    return <span className="h-7 w-7 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold text-xs">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative max-w-3xl w-full glass-card rounded-2xl p-5 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white tracking-wide">
                GLOBAL AGENT LEADERBOARD
              </h2>
              <p className="text-xs text-slate-400">
                Top ranked System Stabilizers & Code Mafia Saboteurs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Missions</span>
            <span className="text-base sm:text-lg font-extrabold text-sky-400">{stats.totalMatchesPlayed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Devs</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400">{stats.activeDevelopers}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Mafia</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-400">{stats.activeMafia}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
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
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">Season 1 Active</span>
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredAgents.map((agent) => {
            const isMafiaPref = agent.favoriteRole === "MAFIA";
            return (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {getRankBadge(agent.rank)}

                  <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                    {agent.avatar || "👨‍💻"}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-200 flex items-center space-x-1.5">
                      <span className="truncate">{agent.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        isMafiaPref ? "bg-rose-950/80 text-rose-300 border border-rose-800" : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      }`}>
                        {isMafiaPref ? "Mafia Main" : "Dev Main"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{agent.matches} Matches</span>
                      <span>•</span>
                      <span className="text-emerald-400">{agent.winRate} Win Rate</span>
                      {agent.badges?.[0] && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 truncate">{agent.badges[0]}</span>
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
                  <span className="text-[10px] text-slate-500">Global Score</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
