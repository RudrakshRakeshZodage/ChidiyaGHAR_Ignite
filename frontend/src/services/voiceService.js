/**
 * Ultra Low-Latency Real-Time Voice Service for Code Mafia
 * Combines direct WebRTC P2P Mesh (< 40ms latency) with low-latency binary PCM socket audio relay fallback.
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
    this.isMuted = true;
    this.isSpeaking = false;
    this.animationFrameId = null;
    this.listeners = new Map();

    // WebRTC Peer Connections: targetPlayerId -> RTCPeerConnection
    this.peerConnections = new Map();
    this.remoteAudioElements = new Map();

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
   * Initializes local microphone stream and real-time audio pipeline
   */
  async initMicrophone() {
    if (this.localStream) return true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn("⚠️ Microphone access not supported in this browser.");
        return false;
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 24000
        },
        video: false
      });

      // Default to muted
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });

      // Audio Context for speaking level detection and low-latency chunk relay
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx({ sampleRate: 24000 });
        const source = this.audioContext.createMediaStreamSource(this.localStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        // Low latency PCM chunk capture
        this.setupLowLatencySocketStream(source);
        this.startLevelDetection();
      }

      this.setupSocketListeners();

      // Inform room peers that voice is ready
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

    // 1. Peer joined voice room -> create WebRTC offer
    socket.on("voice:user_joined", async ({ playerId }) => {
      if (playerId && this.localStream) {
        await this.createPeerOffer(playerId);
      }
    });

    // 2. Incoming WebRTC Offer
    socket.on("voice:webrtc_offer", async ({ senderId, offer }) => {
      await this.handlePeerOffer(senderId, offer);
    });

    // 3. Incoming WebRTC Answer
    socket.on("voice:webrtc_answer", async ({ senderId, answer }) => {
      await this.handlePeerAnswer(senderId, answer);
    });

    // 4. Incoming WebRTC ICE Candidate
    socket.on("voice:webrtc_ice", async ({ senderId, candidate }) => {
      await this.handlePeerIce(senderId, candidate);
    });

    // 5. Fallback low-latency binary audio chunk from socket
    socket.on("voice:audio_chunk", ({ senderId, audioData }) => {
      this.playReceivedAudioChunk(audioData);
    });
  }

  /**
   * Low latency WebRTC Peer Connection Factory
   */
  getOrCreatePeerConnection(targetId) {
    if (this.peerConnections.has(targetId)) {
      return this.peerConnections.get(targetId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = socketService.getSocket();

    // Send ICE candidates to peer
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit("voice:webrtc_ice", {
          targetId,
          candidate: e.candidate
        });
      }
    };

    // When remote audio track is received from peer, play it directly
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
   * Captures raw audio buffers at low latency (< 30ms) for high-speed socket stream relay
   */
  setupLowLatencySocketStream(source) {
    try {
      // 1024 buffer size at 24kHz = ~42ms audio chunk
      this.scriptProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);
      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (this.isMuted || !this.isSpeaking) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM array for ultra-compact transfer
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
   * Ultra low-latency PCM playback on receiver side
   */
  playReceivedAudioChunk(audioBuffer) {
    try {
      if (!this.playbackContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.playbackContext = new AudioCtx({ sampleRate: 24000 });
      }

      if (this.playbackContext.state === "suspended") {
        this.playbackContext.resume();
      }

      const pcm16 = new Int16Array(audioBuffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      const audioBuf = this.playbackContext.createBuffer(1, float32.length, 24000);
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
      // Ignore audio chunk jitter
    }
  }

  /**
   * Speech level analysis
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
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const speaking = avg > 15; // responsive speaking threshold

      if (speaking !== this.isSpeaking) {
        this.isSpeaking = speaking;
        this.emit("speaking:change", speaking);
      }

      this.animationFrameId = requestAnimationFrame(checkLevel);
    };

    this.animationFrameId = requestAnimationFrame(checkLevel);
  }

  /**
   * Toggles mute / unmute state
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

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.remoteAudioElements.forEach(el => el.remove());
    this.remoteAudioElements.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.isMuted = true;
    this.isSpeaking = false;
  }
}

export const voiceService = new VoiceService();
