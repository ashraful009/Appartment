import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";



const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]                 = useState(true); 

  
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        setUser(data.data.user);
        setIsAuthenticated(true);
      } catch {
        
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  
  const register = async (formData) => {
    const { data } = await axios.post("/api/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data.data);
    setIsAuthenticated(true);
    return data.data;
  };

  
  const login = async (credentials) => {
    const { data } = await axios.post("/api/auth/login", credentials);
    setUser(data.data);
    setIsAuthenticated(true);
    return data.data;
  };

  
  const refreshUser = async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.data.user);
      setIsAuthenticated(true);
      return data.data.user;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  
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

  
  
  const hasRole    = (role)    => Array.isArray(user?.roles) && user.roles.includes(role);
  const hasAnyRole = (...roles) => Array.isArray(user?.roles) && roles.some(r => user.roles.includes(r));

  const value = { user, isAuthenticated, loading, register, login, logout, refreshUser, hasRole, hasAnyRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
