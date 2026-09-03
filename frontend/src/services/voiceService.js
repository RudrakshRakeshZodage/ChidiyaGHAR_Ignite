/**
 * Ultra Low-Latency Real-Time Voice Service with Advanced Noise Cancellation
 * Features:
 * - Browser Hardware DSP Noise Suppression + Echo Cancellation + Auto Gain Control
 * - Web Audio API Highpass & Vocal Presence Filtering
 * - Adaptive Voice-Activity Gate (VAD) tuned for clear speech transmission
 * - Anti-Feedback protection to prevent mic loopback echo
 * - Direct WebRTC P2P Mesh with low-latency binary PCM socket relay
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
    this.audioContext = null;
    this.analyser = null;
    this.scriptProcessor = null;
    this.silentGain = null;
    this.isMuted = true;
    this.isSpeaking = false;
    this.animationFrameId = null;
    this.listeners = new Map();
    this.roomCode = null;
    this.playerId = null;

    // Noise Gate settings (gentle threshold so all natural voices transmit effortlessly)
    this.gateThreshold = 0.003; 
    this.gateHoldMs = 300; 
    this.lastSpeechTime = 0;

    // WebRTC Peer Connections: targetPlayerId -> RTCPeerConnection
    this.peerConnections = new Map();
    this.remoteAudioElements = new Map();

    // Socket audio playback queue
    this.playbackContext = null;
    this.nextPlayTime = 0;
  }

  setSession(roomCode, playerId) {
    this.roomCode = roomCode;
    this.playerId = playerId;
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
    if (this.localStream) {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      return true;
    }

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

      // Match current mute state
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });

      // Audio Context with DSP Filter Chain (Highpass + Vocal Presence)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx({ sampleRate: 48000 });
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        const source = this.audioContext.createMediaStreamSource(this.localStream);

        // 1. High-Pass Filter @ 80Hz to strip AC hum, fan rumble, desk vibrations
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(80, this.audioContext.currentTime);

        // 2. Low-Pass Filter @ 8000Hz to eliminate high-frequency electronic hiss
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(8000, this.audioContext.currentTime);

        // 3. Peaking Filter @ 2000Hz for vocal articulation & speech boost
        const vocalBooster = this.audioContext.createBiquadFilter();
        vocalBooster.type = "peaking";
        vocalBooster.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        vocalBooster.gain.setValueAtTime(3.0, this.audioContext.currentTime);

        // 4. Analyser for speech energy detection
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.2;

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
        socket.emit("voice:join_room", {
          roomCode: this.roomCode,
          playerId: this.playerId
        });
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

    // Real-time audio chunk playback
    socket.on("voice:audio_chunk", ({ senderId, audioData }) => {
      if (senderId !== this.playerId) {
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
          candidate: e.candidate,
          roomCode: this.roomCode,
          senderId: this.playerId
        });
      }
    };

    // When remote audio track is received from peer
    pc.ontrack = (event) => {
      let audioEl = this.remoteAudioElements.get(targetId);
      if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        audioEl.playsInline = true;
        document.body.appendChild(audioEl);
        this.remoteAudioElements.set(targetId, audioEl);
      }
      audioEl.srcObject = event.streams[0];
      audioEl.play().catch(() => {});
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
        socket.emit("voice:webrtc_offer", {
          targetId,
          offer,
          roomCode: this.roomCode,
          senderId: this.playerId
        });
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
        socket.emit("voice:webrtc_answer", {
          targetId: senderId,
          answer,
          roomCode: this.roomCode,
          senderId: this.playerId
        });
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
          socket.emit("voice:audio_chunk", {
            audioData: pcmBuffer.buffer,
            roomCode: this.roomCode,
            senderId: this.playerId
          });
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

      let vocalSum = 0;
      let count = 0;
      for (let i = 4; i < Math.min(60, dataArray.length); i++) {
        vocalSum += dataArray[i];
        count++;
      }
      const vocalAvg = count > 0 ? vocalSum / count : 0;
      const speaking = vocalAvg > 12;

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
      await this.initMicrophone();
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

    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit("voice:state_change", {
        roomCode: this.roomCode,
        playerId: this.playerId,
        isMuted: this.isMuted,
        isSpeaking: false
      });
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
  }
}

export const voiceService = new VoiceService();
