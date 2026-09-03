import React, { useRef, useEffect } from 'react';
import { Activity, GitCommit, Play, AlertTriangle, UserCheck, UserX, MessageSquare } from 'lucide-react';

export default function ActivityFeed({ activityLog = [] }) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activityLog]);

  const getIcon = (type) => {
    switch (type) {
      case "CODE_EDIT":
        return <GitCommit className="h-3.5 w-3.5 text-sky-400" />;
      case "TESTS_RUN":
        return <Play className="h-3.5 w-3.5 text-emerald-400" />;
      case "MEETING_CALLED":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
      case "PLAYER_JOINED":
        return <UserCheck className="h-3.5 w-3.5 text-teal-400" />;
      case "PLAYER_LEFT":
        return <UserX className="h-3.5 w-3.5 text-slate-500" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#0d121d] border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-sky-400" />
          <h3 className="font-bold text-sm text-white font-display tracking-wide">
            AUDIT & ACTIVITY LOG
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          LIVE FEED
        </span>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
        {activityLog.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No activity logged yet.
          </div>
        ) : (
          activityLog.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition flex items-start space-x-2.5"
            >
              <div className="mt-0.5 p-1 rounded-md bg-slate-800 border border-slate-700">
                {getIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 leading-relaxed break-words">{log.text}</p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
