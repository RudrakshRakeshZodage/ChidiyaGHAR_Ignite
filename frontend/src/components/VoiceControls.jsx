import React from 'react';
import { Mic, MicOff, Volume2, Radio, Sparkles } from 'lucide-react';

export default function VoiceControls({
  isMuted = true,
  isSpeaking = false,
  onToggleMute,
  activeSpeakers = [],
  isCompact = false
}) {
  return (
    <div className="flex items-center space-x-2">
      {/* Mic Mute / Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        title={isMuted ? "Click to unmute microphone" : "Click to mute microphone"}
        className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-md ${
          isMuted
            ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700'
            : isSpeaking
            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-emerald-400 shadow-emerald-500/40 animate-pulse'
            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
        }`}
      >
        {isMuted ? (
          <>
            <MicOff className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">MIC OFF</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5 text-emerald-300" />
            <span className="hidden sm:inline">MIC LIVE</span>
            {/* Live Audio Waveform Bars */}
            <span className="flex items-end space-x-0.5 h-3 ml-1">
              <span className={`w-0.5 bg-emerald-300 rounded-full transition-all ${isSpeaking ? 'h-3 animate-bounce' : 'h-1'}`} />
              <span className={`w-0.5 bg-emerald-300 rounded-full transition-all ${isSpeaking ? 'h-2 animate-pulse' : 'h-1'}`} />
              <span className={`w-0.5 bg-emerald-300 rounded-full transition-all ${isSpeaking ? 'h-3.5 animate-bounce' : 'h-1'}`} />
            </span>
          </>
        )}
      </button>

      {/* Active Speaker Notification */}
      {!isCompact && activeSpeakers.length > 0 && (
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-[11px] font-mono text-emerald-300 animate-fade-in">
          <Radio className="h-3 w-3 text-emerald-400 animate-ping" />
          <span className="font-semibold">{activeSpeakers.join(", ")} is speaking...</span>
        </div>
      )}
    </div>
  );
}
