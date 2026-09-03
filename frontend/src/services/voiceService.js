/**
 * Ultra Low-Latency Real-Time Voice Service with Advanced Noise Cancellation
 * Features:
 * - Browser DSP Hardware Noise Suppression + Echo Cancellation + Auto Gain Control
 * - Web Audio API Highpass & Bandpass Voice Clarity Filtering
 * - Adaptive Voice-Activity Noise Gate (VAD) to eliminate background hum & keyboard noise
 * - Anti-Feedback protection to prevent mic loopback echo
 * - Direct WebRTC P2P Mesh with smart deduplication against socket relay
 */

import { socketService } from './socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
};

class VoiceService {
  constructor() {
    this.localStream = null;
    this.filteredStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.scriptProcessor = null;
    this.silentGain = null;
    this.isMuted = true;
    this.isSpeaking = false;
    this.animationFrameId = null;
    this.listeners = new Map();

    // Noise Gate settings
    this.gateThreshold = 0.025; // Minimum RMS volume for speech transmission
    this.gateHoldMs = 250; // Hold gate open after speech pauses for smooth natural cadence
    this.lastSpeechTime = 0;

    // WebRTC Peer Connections: targetPlayerId -> RTCPeerConnection
    this.peerConnections = new Map();
    this.remoteAudioElements = new Map();
    this.activeWebRTCPeers = new Set();

    // Socket audio playback queue
    this.playbackContext = null;
    this.nextPlayTime = 0;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  /**
   * Initializes microphone with aggressive hardware & software noise cancellation
   */
  async initMicrophone() {
    if (this.localStream) return true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn("⚠️ Microphone access not supported in this browser.");
        return false;
      }

      // Request microphone with full noise cancellation and echo suppression flags
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          googEchoCancellation: { ideal: true },
          googAutoGainControl: { ideal: true },
          googNoiseSuppression: { ideal: true },
          googHighpassFilter: { ideal: true },
          googTypingNoiseDetection: { ideal: true },
          googAudioMirroring: { ideal: false },
          channelCount: 1,
          sampleRate: 48000
        },
        video: false
      });

      // Default to muted
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });

      // Audio Context with DSP Filter Chain (Highpass + Vocal Presence)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.localStream);

        // 1. High-Pass Filter @ 90Hz to strip AC hum, fan rumble, desk vibrations
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(90, this.audioContext.currentTime);
        highpass.Q.setValueAtTime(0.7, this.audioContext.currentTime);

        // 2. Low-Pass Filter @ 7500Hz to eliminate high-frequency electronic hiss
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(7500, this.audioContext.currentTime);

        // 3. Peaking Filter @ 2000Hz for vocal articulation & speech boost
        const vocalBooster = this.audioContext.createBiquadFilter();
        vocalBooster.type = "peaking";
        vocalBooster.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        vocalBooster.gain.setValueAtTime(2.5, this.audioContext.currentTime);

        // 4. Analyser for speech energy detection
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.3;

        // Connect DSP filter chain
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(vocalBooster);
        vocalBooster.connect(this.analyser);

        // 5. Silent destination to prevent mic looping back into own speakers (Anti-Feedback)
        this.silentGain = this.audioContext.createGain();
        this.silentGain.gain.setValueAtTime(0, this.audioContext.currentTime);

        // Low-latency socket chunk streamer with noise gate
        this.setupLowLatencySocketStream(vocalBooster);
        this.startLevelDetection();
      }

      this.setupSocketListeners();

      // Inform room peers
      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socket.emit("voice:join_room");
      }

      this.emit("stream:ready", this.localStream);
      return true;
    } catch (err) {
      console.warn("🎤 Microphone permission denied or device not found:", err.message);
      return false;
    }
  }

  /**
   * Setup WebRTC and low-latency binary audio stream socket handlers
   */
  setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on("voice:user_joined", async ({ playerId }) => {
      if (playerId && this.localStream) {
        await this.createPeerOffer(playerId);
      }
    });

    socket.on("voice:webrtc_offer", async ({ senderId, offer }) => {
      await this.handlePeerOffer(senderId, offer);
    });

    socket.on("voice:webrtc_answer", async ({ senderId, answer }) => {
      await this.handlePeerAnswer(senderId, answer);
    });

    socket.on("voice:webrtc_ice", async ({ senderId, candidate }) => {
      await this.handlePeerIce(senderId, candidate);
    });

    // Fallback socket relay audio (Only played if WebRTC track is NOT active to prevent dual echo)
    socket.on("voice:audio_chunk", ({ senderId, audioData }) => {
      if (!this.activeWebRTCPeers.has(senderId)) {
        this.playReceivedAudioChunk(audioData);
      }
    });
  }

  getOrCreatePeerConnection(targetId) {
    if (this.peerConnections.has(targetId)) {
      return this.peerConnections.get(targetId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = socketService.getSocket();

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit("voice:webrtc_ice", {
          targetId,
          candidate: e.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        this.activeWebRTCPeers.add(targetId);
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.activeWebRTCPeers.delete(targetId);
      }
    };

    // When remote audio track is received from peer
    pc.ontrack = (event) => {
      this.activeWebRTCPeers.add(targetId);
      let audioEl = this.remoteAudioElements.get(targetId);
      if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        audioEl.playsInline = true;
        document.body.appendChild(audioEl);
        this.remoteAudioElements.set(targetId, audioEl);
      }
      audioEl.srcObject = event.streams[0];
    };

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    this.peerConnections.set(targetId, pc);
    return pc;
  }

  async createPeerOffer(targetId) {
    try {
      const pc = this.getOrCreatePeerConnection(targetId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await pc.setLocalDescription(offer);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("voice:webrtc_offer", { targetId, offer });
      }
    } catch (err) {
      console.warn(`[WebRTC] Error creating offer for ${targetId}:`, err.message);
    }
  }

  async handlePeerOffer(senderId, offer) {
    try {
      const pc = this.getOrCreatePeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("voice:webrtc_answer", { targetId: senderId, answer });
      }
    } catch (err) {
      console.warn(`[WebRTC] Error handling offer from ${senderId}:`, err.message);
    }
  }

  async handlePeerAnswer(senderId, answer) {
    try {
      const pc = this.peerConnections.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn(`[WebRTC] Error handling answer from ${senderId}:`, err.message);
    }
  }

  async handlePeerIce(senderId, candidate) {
    try {
      const pc = this.peerConnections.get(senderId);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn(`[WebRTC] Error adding ICE from ${senderId}:`, err.message);
    }
  }

  /**
   * Captures raw audio buffers with dynamic Noise Gate (VAD)
   */
  setupLowLatencySocketStream(filteredSource) {
    try {
      // 1024 buffer size
      this.scriptProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);
      filteredSource.connect(this.scriptProcessor);

      // Connect to zero-gain node to prevent microphone hearing itself (NO FEEDBACK ECHO)
      this.scriptProcessor.connect(this.silentGain);
      this.silentGain.connect(this.audioContext.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate Root Mean Square (RMS) to determine voice activity
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const now = Date.now();

        if (rms >= this.gateThreshold) {
          this.lastSpeechTime = now;
        }

        // Noise gate: only pass audio if actively speaking or within release hold window
        const isGateOpen = (now - this.lastSpeechTime) < this.gateHoldMs;
        if (!isGateOpen) return;

        // Convert Float32 to Int16 PCM array
        const pcmBuffer = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const socket = socketService.getSocket();
        if (socket && socket.connected) {
          socket.emit("voice:audio_chunk", pcmBuffer.buffer);
        }
      };
    } catch (err) {
      console.warn("ScriptProcessor setup warning:", err.message);
    }
  }

  /**
   * High quality PCM playback on receiver side
   */
  playReceivedAudioChunk(audioBuffer) {
    try {
      if (!this.playbackContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.playbackContext = new AudioCtx({ sampleRate: 48000 });
      }

      if (this.playbackContext.state === "suspended") {
        this.playbackContext.resume();
      }

      const pcm16 = new Int16Array(audioBuffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      const audioBuf = this.playbackContext.createBuffer(1, float32.length, 48000);
      audioBuf.getChannelData(0).set(float32);

      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuf;
      source.connect(this.playbackContext.destination);

      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuf.duration;
    } catch (err) {
      // Ignore jitter
    }
  }

  /**
   * Voice Activity Detection (VAD) & Speaking level meter
   */
  startLevelDetection() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkLevel = () => {
      if (!this.analyser || this.isMuted) {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.emit("speaking:change", false);
        }
        this.animationFrameId = requestAnimationFrame(checkLevel);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      // Focus on human vocal frequencies (index ~6 to ~70 in 512-bin FFT at 48kHz)
      let vocalSum = 0;
      let count = 0;
      for (let i = 6; i < Math.min(80, dataArray.length); i++) {
        vocalSum += dataArray[i];
        count++;
      }
      const vocalAvg = count > 0 ? vocalSum / count : 0;
      const speaking = vocalAvg > 22; // strict voice threshold to eliminate background room noise

      if (speaking !== this.isSpeaking) {
        this.isSpeaking = speaking;
        this.emit("speaking:change", speaking);
      }

      this.animationFrameId = requestAnimationFrame(checkLevel);
    };

    this.animationFrameId = requestAnimationFrame(checkLevel);
  }

  /**
   * Mute / Unmute
   */
  async toggleMute() {
    if (!this.localStream) {
      const initialized = await this.initMicrophone();
      if (!initialized) {
        this.isMuted = !this.isMuted;
        this.emit("mute:change", this.isMuted);
        return this.isMuted;
      }
    }

    this.isMuted = !this.isMuted;

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    if (this.playbackContext && this.playbackContext.state === "suspended") {
      this.playbackContext.resume();
    }

    this.emit("mute:change", this.isMuted);
    return this.isMuted;
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.remoteAudioElements.forEach(el => el.remove());
    this.remoteAudioElements.clear();
    this.activeWebRTCPeers.clear();
  }
}

export const voiceService = new VoiceService();
