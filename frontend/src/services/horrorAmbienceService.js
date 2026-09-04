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
      this.startCreepySpokenWhispers();
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
    droneGain.gain.setValueAtTime(0.32, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(110, this.audioCtx.currentTime);

    // Left oscillator (48Hz)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(46, this.audioCtx.currentTime);

    // Right oscillator (47.5Hz - creates binaural beating tension)
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(47.5, this.audioCtx.currentTime);

    // Low rumble undertone
    const osc3 = this.audioCtx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(32, this.audioCtx.currentTime);

    // Slow LFO filter sweep
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.08, this.audioCtx.currentTime); // 12s slow breathing cycle
    lfoGain.gain.setValueAtTime(45, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    this.nodes.push(osc1, osc2, osc3, lfo, droneGain, filter, lfoGain);
  }

  /**
   * Layer 2: Formant-Filtered Noise simulating continuous indistinct demonic human whispers
   */
  startWhisperFormantEngine() {
    if (!this.audioCtx || !this.masterGain) return;

    // Generate Pink/Brown Noise Buffer (6 seconds looped)
    const bufferSize = this.audioCtx.sampleRate * 6;
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // 3 Human Vocal Formant Bandpass Filters (throat resonance /u/, /o/, /a/)
    const formant1 = this.audioCtx.createBiquadFilter();
    formant1.type = "bandpass";
    formant1.frequency.setValueAtTime(360, this.audioCtx.currentTime);
    formant1.Q.setValueAtTime(5.5, this.audioCtx.currentTime);

    const formant2 = this.audioCtx.createBiquadFilter();
    formant2.type = "bandpass";
    formant2.frequency.setValueAtTime(980, this.audioCtx.currentTime);
    formant2.Q.setValueAtTime(6.0, this.audioCtx.currentTime);

    const formant3 = this.audioCtx.createBiquadFilter();
    formant3.type = "bandpass";
    formant3.frequency.setValueAtTime(2400, this.audioCtx.currentTime);
    formant3.Q.setValueAtTime(4.0, this.audioCtx.currentTime);

    const whisperGain = this.audioCtx.createGain();
    whisperGain.gain.setValueAtTime(0.38, this.audioCtx.currentTime);

    // Dynamic slow whispering breath modulator
    const flutterLfo = this.audioCtx.createOscillator();
    const flutterGain = this.audioCtx.createGain();
    flutterLfo.frequency.setValueAtTime(0.28, this.audioCtx.currentTime); // Whispering breath cadence
    flutterGain.gain.setValueAtTime(0.16, this.audioCtx.currentTime);
    flutterLfo.connect(flutterGain);
    flutterGain.connect(whisperGain.gain);
    flutterLfo.start();

    noiseSource.connect(formant1);
    noiseSource.connect(formant2);
    noiseSource.connect(formant3);
    formant1.connect(whisperGain);
    formant2.connect(whisperGain);
    formant3.connect(whisperGain);
    whisperGain.connect(this.masterGain);

    noiseSource.start();

    this.nodes.push(noiseSource, formant1, formant2, formant3, whisperGain, flutterLfo, flutterGain);

    // Periodically shift vowel formants to simulate whispering chorus of shadows
    const formantsList = [
      [280, 850, 2200],
      [420, 1150, 2600],
      [340, 720, 1950],
      [520, 1350, 2800],
      [250, 620, 1800]
    ];

    let formantIdx = 0;
    this.whisperInterval = setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      formantIdx = (formantIdx + 1) % formantsList.length;
      const [f1, f2, f3] = formantsList[formantIdx];
      const now = this.audioCtx.currentTime;
      formant1.frequency.setTargetAtTime(f1, now, 1.8);
      formant2.frequency.setTargetAtTime(f2, now, 1.8);
      formant3.frequency.setTargetAtTime(f3, now, 1.8);
    }, 3800);
  }

  /**
   * Layer 3: Menacing Sub-Bass Heartbeat Pulse (~52 BPM)
   */
  startHeartbeatPulse() {
    if (!this.audioCtx || !this.masterGain) return;

    const playThump = () => {
      if (!this.audioCtx || !this.isPlaying || this.audioCtx.state !== "running") return;
      const now = this.audioCtx.currentTime;

      // Double beat: lub-dub
      [0, 0.24].forEach((offset, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(85, now + offset);

        osc.type = "sine";
        osc.frequency.setValueAtTime(idx === 0 ? 56 : 48, now + offset);
        osc.frequency.exponentialRampToValueAtTime(32, now + offset + 0.22);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.35 : 0.24, now + offset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.35);
      });
    };

    // Trigger heartbeat every ~1.15 seconds
    this.heartbeatInterval = setInterval(playThump, 1150);
  }

  /**
   * Layer 4: Soft Dissonant Horror Pad (Tritone / Diabolus in Musica)
   */
  startDissonantPads() {
    if (!this.audioCtx || !this.masterGain) return;

    // C2 (65.4Hz) + F#2 (92.5Hz - Tritone) + C#3 (138.6Hz)
    const freqs = [65.4, 92.5, 138.6];
    const padGain = this.audioCtx.createGain();
    padGain.gain.setValueAtTime(0.10, this.audioCtx.currentTime);

    const padFilter = this.audioCtx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.setValueAtTime(260, this.audioCtx.currentTime);

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
   * Layer 5: Big Horrific Haunting Spoken Whispers (Voice Synthesis)
   */
  startCreepySpokenWhispers() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const phrases = [
      "Who among us is the saboteur...?",
      "The tests are failing...",
      "Do not trust them...",
      "Someone is watching your code...",
      "A regression was committed...",
      "Look closer at the line numbers...",
      "Find the liar before the timer expires...",
      "There is a ghost in the motherboard...",
      "They are pretending to debug...",
      "One of us is a traitor...",
      "Listen to the shadows...",
      "They know what you did in production...",
      "Every line you write is poisoned...",
      "There will be blood in the pull request...",
      "The saboteur is sitting right beside you..."
    ];

    const speakWhisper = () => {
      if (this.isMuted || !this.isPlaying) return;
      try {
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.72; // Slow, deliberate horrific whisper
        utterance.pitch = 0.30; // Deep, raspy demonic pitch
        utterance.volume = Math.min(0.85, Math.max(0.45, this.volume * 1.5)); // Big, clearly audible horror voice

        // Pick deep English voices if available
        const voices = window.speechSynthesis.getVoices();
        const whisperVoice = voices.find(v => 
          v.lang.startsWith("en") && 
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David") || v.name.includes("Male") || v.name.includes("Zira"))
        ) || voices[0];
        
        if (whisperVoice) utterance.voice = whisperVoice;

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Speech synthesis optional
      }
    };

    // First big whisper triggers quickly after 2.5s, then every ~15 seconds
    setTimeout(speakWhisper, 2500);
    this.spokenWhisperInterval = setInterval(speakWhisper, 15000);
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
    if (this.spokenWhisperInterval) clearInterval(this.spokenWhisperInterval);
    this.whisperInterval = null;
    this.heartbeatInterval = null;
    this.spokenWhisperInterval = null;

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
