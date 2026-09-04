import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Flame } from 'lucide-react';
import { horrorAmbience } from '../services/horrorAmbienceService';

export default function AmbienceAudioControl() {
  const [state, setState] = useState({
    isPlaying: horrorAmbience.isPlaying,
    isMuted: horrorAmbience.isMuted,
    volume: horrorAmbience.volume
  });
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  useEffect(() => {
    const unsubscribe = horrorAmbience.subscribe(setState);

    // Auto-start ambience on first user interaction with the window
    const handleFirstGesture = () => {
      horrorAmbience.start();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      unsubscribe();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  const handleToggle = () => {
    horrorAmbience.toggleMute();
  };

  const handleVolumeChange = (e) => {
    horrorAmbience.setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowVolumePopup(!showVolumePopup);
        }}
        title={`Horror Whispers & Drone: ${state.isMuted ? "MUTED (Click to activate)" : "PLAYING (Click to mute, Right click for volume)"}`}
        className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-300 select-none shadow-md ${
          !state.isMuted && state.isPlaying
            ? "bg-[#180a0c] border-[#e31b23] text-rose-300 shadow-rose-950/70"
            : "bg-[#0c0a0a] border-[#2d1215] text-slate-500 hover:text-slate-300"
        }`}
      >
        {!state.isMuted && state.isPlaying ? (
          <>
            <div className="relative flex items-center justify-center">
              <span className="absolute h-3 w-3 rounded-full bg-rose-600 animate-ping opacity-60"></span>
              <Volume2 className="h-3.5 w-3.5 text-[#e31b23] relative z-10" />
            </div>
            <span className="hidden xl:inline text-[10px] font-mono font-bold tracking-wider text-rose-400">
              WHISPERS
            </span>
          </>
        ) : (
          <>
            <VolumeX className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden xl:inline text-[10px] font-mono text-slate-500">
              AUDIO MUTED
            </span>
          </>
        )}
      </button>

      {/* Optional volume slider popup */}
      {showVolumePopup && (
        <div className="absolute right-0 top-12 z-50 p-3 rounded-xl bg-[#0e0708] border border-[#e31b23]/50 shadow-2xl space-y-2 w-44 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 font-bold">
            <span>HORROR DRONE</span>
            <span className="text-[#e31b23]">{Math.round(state.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.volume}
            onChange={handleVolumeChange}
            className="w-full accent-[#e31b23] h-1.5 bg-black rounded-lg cursor-pointer"
          />
          <p className="text-[9px] font-mono text-slate-500 leading-tight">
            Soft background murmurs, heartbeats & binaural dread drone.
          </p>
        </div>
      )}
    </div>
  );
}
