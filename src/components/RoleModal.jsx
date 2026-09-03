import React, { useState, useEffect } from 'react';
import { Shield, Skull, Bug, CheckCircle2, AlertOctagon, Sparkles } from 'lucide-react';

export default function RoleModal({ player, onAcknowledge }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!player?.role) return null;

  const isMafia = player.role === "MAFIA";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full">
        {/* Glow backdrop */}
        <div className={`absolute -inset-1 rounded-3xl blur-2xl opacity-75 transition duration-1000 ${
          isMafia ? "bg-rose-600/50 glow-red" : "bg-emerald-500/50 glow-green"
        }`} />

        <div className="relative glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-center space-y-6">
          {/* Top Secret Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold tracking-widest uppercase text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span>CLASSIFIED ROLE ASSIGNMENT</span>
          </div>

          {/* Role Reveal Card */}
          <div className={`py-6 px-4 rounded-xl border transition-all duration-700 ${
            revealed ? "scale-100 opacity-100" : "scale-90 opacity-40"
          } ${
            isMafia
              ? "bg-rose-950/40 border-rose-600/60 shadow-lg shadow-rose-950/50"
              : "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50"
          }`}>
            <div className="flex justify-center mb-3">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner border ${
                isMafia ? "bg-rose-900/60 border-rose-500 text-rose-300" : "bg-emerald-900/60 border-emerald-400 text-emerald-300"
              }`}>
                {isMafia ? "🕵️‍♂️" : "👨‍💻"}
              </div>
            </div>

            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              Your Secret Identity
            </h2>
            <h1 className={`text-3xl font-black font-display tracking-wider mt-1 ${
              isMafia ? "text-rose-400" : "text-emerald-400"
            }`}>
              {isMafia ? "CODE MAFIA (SABOTEUR)" : "SYSTEM DEVELOPER"}
            </h1>
          </div>

          {/* Objectives */}
          <div className="text-left space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wide text-xs">
              {isMafia ? <AlertOctagon className="h-4 w-4 text-rose-400" /> : <Shield className="h-4 w-4 text-emerald-400" />}
              <span>Primary Mission Objective</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {player.roleDetails?.objective || (
                isMafia
                  ? "Prevent unit tests from passing by injecting stealth logic bugs without getting caught by the dev team."
                  : "Collaborate with your team to fix all intentional defects, pass 100% of the unit tests, and identify the saboteurs."
              )}
            </p>

            {/* Tactical Tips */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tactical Protocol:</span>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                {isMafia ? (
                  <>
                    <li>Subtly flip conditions or alter comparison boundaries.</li>
                    <li>Feign innocence and blame other coders during emergency meetings.</li>
                    <li>Survive until the timer expires or mafia outnumbers devs.</li>
                  </>
                ) : (
                  <>
                    <li>Inspect test failure assertion messages to track down defects.</li>
                    <li>Keep an eye on the audit activity feed to see who edited what.</li>
                    <li>Call an emergency meeting if you catch suspicious commits.</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onAcknowledge}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide shadow-xl transition active:scale-[0.98] ${
              isMafia
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            I UNDERSTAND MY MISSION → ENTER ARENA
          </button>
        </div>
      </div>
    </div>
  );
}
