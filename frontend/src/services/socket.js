import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.mockMode = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    try {
      this.socket = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
        this.mockMode = false;
        console.log("🟢 Connected to Code Mafia Server:", this.socket.id);
      });

      this.socket.on("connect_error", (err) => {
        console.warn("⚠️ Cannot connect to backend server at", BACKEND_URL, ":", err.message);
        this.isConnected = false;
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        console.log("🔴 Disconnected from Code Mafia Server:", reason);
      });

      return this.socket;
    } catch (err) {
      console.warn("Socket initialization failed, using simulator fallback:", err);
      return null;
    }
  }

  getSocket() {
    if (!this.socket || !this.socket.connected) {
      return this.connect();
    }
    return this.socket;
  }
}

export const socketService = new SocketService();
