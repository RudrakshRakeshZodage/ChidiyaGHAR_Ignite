import { supabase } from "./supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const STORAGE_KEY = "codemafia_auth_user";
const TOKEN_KEY = "codemafia_auth_token";

/**
 * Sign up a new user with email and password
 */
export async function signupWithEmail(email, password, username) {
  try {
    // 1. Try Backend API first
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create account");
    }

    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }
    if (data.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    }

    return { success: true, user: data.user, session: data.session };
  } catch (backendErr) {
    console.warn("Backend auth signup failed, trying Supabase direct client:", backendErr.message);

    // 2. Direct Supabase Fallback
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
          avatar: "👨‍💻"
        }
      }
    });

    if (error) throw error;

    const user = {
      id: data.user?.id,
      email: data.user?.email,
      username: username || email.split("@")[0],
      avatar: "👨‍💻"
    };

    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { success: true, user, session: data.session };
  }
}

/**
 * Sign in existing user with email and password
 */
export async function loginWithEmail(email, password) {
  try {
    // 1. Try Backend API first
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to sign in");
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    }

    return { success: true, user: data.user, token: data.token };
  } catch (backendErr) {
    console.warn("Backend auth login failed, trying Supabase direct client:", backendErr.message);

    // 2. Direct Supabase Fallback
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const user = {
      id: data.user?.id,
      email: data.user?.email,
      username: data.user?.user_metadata?.username || email.split("@")[0],
      avatar: data.user?.user_metadata?.avatar || "👨‍💻"
    };

    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { success: true, user, token: data.session?.access_token };
  }
}

/**
 * Get cached current user or check session
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Sign out
 */
export async function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  try {
    await supabase.auth.signOut();
  } catch {}
}
