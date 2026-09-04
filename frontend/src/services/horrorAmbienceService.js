/**
 * Procedural Horror & Psychological Ambience Engine for Code Mafia II
 * Generates continuous, soft, atmospheric horror background soundscape:
 * - Formant-filtered noise simulating eerie nonstop indistinct human whispers
 * - Deep 45Hz sub-bass drone with slow binaural LFO beating
 * - Low-frequency rhythmic heartbeat pulse
 * - Subtle resonant dissonant harmonic pads
 */

class HorrorAmbienceService {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = localStorage.getItem("codemafia_ambient_muted") === "true";
    this.volume = parseFloat(localStorage.getItem("codemafia_ambient_volume") || "0.35");
    
    // Nodes
    this.nodes = [];
    this.whisperInterval = null;
    this.heartbeatInterval = null;
    this.listeners = new Set();
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
  }

  /**
   * Start the continuous atmospheric horror soundscape
   */
  async start() {
    this.initContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn("AudioContext resume waiting for user gesture:", e.message);
      }
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      this.startSubDrone();
      this.startWhisperFormantEngine();
      this.startHeartbeatPulse();
      this.startDissonantPads();
      this.notifyListeners();
    } catch (err) {
      console.warn("[Horror Ambience] Error starting ambience:", err);
    }
  }

  /**
   * Layer 1: Deep 45Hz–55Hz Sub-Bass Drone with binaural detune
   */
  startSubDrone() {
    if (!this.audioCtx || !this.masterGain) return;

    const droneGain = this.audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(90, this.audioCtx.currentTime);

    // Left oscillator (48Hz)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(48, this.audioCtx.currentTime);

    // Right oscillator (49.5Hz - creates 1.5Hz binaural pulsation)
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(49.5, this.audioCtx.currentTime);

    // Slow LFO filter sweep
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime); // 10s period
    lfoGain.gain.setValueAtTime(30, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();

    this.nodes.push(osc1, osc2, lfo, droneGain, filter, lfoGain);
  }

  /**
   * Layer 2: Formant-Filtered Noise simulating continuous indistinct human whispers
   */
  startWhisperFormantEngine() {
    if (!this.audioCtx || !this.masterGain) return;

    // Generate Pink/Brown Noise Buffer (5 seconds looped)
    const bufferSize = this.audioCtx.sampleRate * 5;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Vocal Formant Bandpass Filters (/u/, /o/, /a/ vowel resonances)
    // F1: ~350Hz, F2: ~800Hz, F3: ~2200Hz
    const formant1 = this.audioCtx.createBiquadFilter();
    formant1.type = "bandpass";
    formant1.frequency.setValueAtTime(380, this.audioCtx.currentTime);
    formant1.Q.setValueAtTime(4.5, this.audioCtx.currentTime);

    const formant2 = this.audioCtx.createBiquadFilter();
    formant2.type = "bandpass";
    formant2.frequency.setValueAtTime(950, this.audioCtx.currentTime);
    formant2.Q.setValueAtTime(5.0, this.audioCtx.currentTime);

    const whisperGain = this.audioCtx.createGain();
    whisperGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);

    // Dynamic slow whispering flutter
    const flutterLfo = this.audioCtx.createOscillator();
    const flutterGain = this.audioCtx.createGain();
    flutterLfo.frequency.setValueAtTime(0.35, this.audioCtx.currentTime); // Whispering breath cadence
    flutterGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    flutterLfo.connect(flutterGain);
    flutterGain.connect(whisperGain.gain);
    flutterLfo.start();

    noiseSource.connect(formant1);
    noiseSource.connect(formant2);
    formant1.connect(whisperGain);
    formant2.connect(whisperGain);
    whisperGain.connect(this.masterGain);

    noiseSource.start();

    this.nodes.push(noiseSource, formant1, formant2, whisperGain, flutterLfo, flutterGain);

    // Periodically shift vowel formants to simulate multiple whispering entities
    const formantsList = [
      [300, 850],
      [450, 1100],
      [350, 700],
      [500, 1300],
      [280, 600]
    ];

    let formantIdx = 0;
    this.whisperInterval = setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      formantIdx = (formantIdx + 1) % formantsList.length;
      const [f1, f2] = formantsList[formantIdx];
      const now = this.audioCtx.currentTime;
      formant1.frequency.setTargetAtTime(f1, now, 2.0);
      formant2.frequency.setTargetAtTime(f2, now, 2.0);
    }, 4500);
  }

  /**
   * Layer 3: Subtle Sub-Bass Heartbeat Pulse (~56 BPM)
   */
  startHeartbeatPulse() {
    if (!this.audioCtx || !this.masterGain) return;

    const playThump = () => {
      if (!this.audioCtx || !this.isPlaying || this.audioCtx.state !== "running") return;
      const now = this.audioCtx.currentTime;

      // Double beat: lub-dub
      [0, 0.22].forEach((offset, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(80, now + offset);

        osc.type = "sine";
        osc.frequency.setValueAtTime(idx === 0 ? 58 : 52, now + offset);
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.18);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.25 : 0.18, now + offset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.3);
      });
    };

    // Trigger heartbeat every ~1.1 seconds (~55 BPM)
    this.heartbeatInterval = setInterval(playThump, 1150);
  }

  /**
   * Layer 4: Soft Dissonant Chords (Tritone / Minor Second Horror Pad)
   */
  startDissonantPads() {
    if (!this.audioCtx || !this.masterGain) return;

    // C2 (65.4Hz) + F#2 (92.5Hz - Tritone / Diabolus in Musica) + C#3 (138.6Hz)
    const freqs = [65.4, 92.5, 138.6];
    const padGain = this.audioCtx.createGain();
    padGain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);

    const padFilter = this.audioCtx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.setValueAtTime(220, this.audioCtx.currentTime);

    freqs.forEach(freq => {
      const osc = this.audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.connect(padFilter);
      osc.start();
      this.nodes.push(osc);
    });

    padFilter.connect(padGain);
    padGain.connect(this.masterGain);
    this.nodes.push(padFilter, padGain);
  }

  /**
   * Toggle Mute / Unmute
   */
  toggleMute() {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem("codemafia_ambient_muted", String(this.isMuted));

    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.2);
    }

    if (!this.isPlaying && !this.isMuted) {
      this.start();
    }

    this.notifyListeners();
    return this.isMuted;
  }

  /**
   * Set Master Volume (0.0 to 1.0)
   */
  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    localStorage.setItem("codemafia_ambient_volume", String(this.volume));

    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.1);
    }

    this.notifyListeners();
  }

  /**
   * Stop Ambience Engine
   */
  stop() {
    if (this.whisperInterval) clearInterval(this.whisperInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.whisperInterval = null;
    this.heartbeatInterval = null;

    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn({
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume
    }));
  }
}

export const horrorAmbience = new HorrorAmbienceService();
