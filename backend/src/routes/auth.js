import express from "express";
import { supabase } from "../db/supabase.js";

export function createAuthRouter() {
  const router = express.Router();

  /**
   * POST /api/auth/signup
   * Register a new user with Email and Password
   */
  router.post("/signup", async (req, res) => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const displayName = username || email.split("@")[0];

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: displayName,
            avatar: "👨‍💻"
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({
        message: "Account created successfully!",
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: displayName,
          createdAt: data.user?.created_at
        },
        session: data.session
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during signup" });
    }
  });

  /**
   * POST /api/auth/login
   * Sign in with Email and Password
   */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      const username = data.user?.user_metadata?.username || email.split("@")[0];

      return res.json({
        message: "Logged in successfully!",
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username,
          avatar: data.user?.user_metadata?.avatar || "👨‍💻"
        },
        token: data.session?.access_token,
        session: data.session
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during login" });
    }
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user profile
   */
  router.get("/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization token" });
      }

      const token = authHeader.split(" ")[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired session token" });
      }

      const username = user.user_metadata?.username || user.email.split("@")[0];

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          username,
          avatar: user.user_metadata?.avatar || "👨‍💻"
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/auth/logout
   */
  router.post("/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        await supabase.auth.admin?.signOut?.(token).catch(() => {});
      }
      return res.json({ message: "Logged out successfully" });
    } catch (err) {
      return res.json({ message: "Logged out" });
    }
  });

  return router;
}
