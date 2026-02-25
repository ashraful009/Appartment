import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ── Axios base config ─────────────────────────────────────────────────────
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true; // Always send cookies

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]                 = useState(true); // true while verifying session

  // On app mount: silently check if the user has a valid session cookie
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        // No valid session — this is expected for guests
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * register — accepts a FormData object so it supports optional avatar uploads.
   * Sends multipart/form-data to /api/auth/register, then updates user state.
   */
  const register = async (formData) => {
    const { data } = await axios.post("/api/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  /**
   * login — call this after a successful /api/auth/login response.
   * Accepts plain credentials object { email, password }.
   */
  const login = async (credentials) => {
    const { data } = await axios.post("/api/auth/login", credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  /**
   * logout — clear cookie on server, reset state.
   */
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = { user, isAuthenticated, loading, register, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom hook ───────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
