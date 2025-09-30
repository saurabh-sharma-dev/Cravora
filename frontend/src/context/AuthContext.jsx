// src/context/AuthContext.jsx
import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import API from "../api";

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setUser: () => {},
  refreshProfile: async () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    delete API.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const login = useCallback((token, userData) => {
    if (!token || !userData) return;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await API.get("/auth/profile"); // { success, user }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      }
      logout();
      return null;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  // Load user profile if token exists on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    API.defaults.headers.common.Authorization = `Bearer ${token}`;

    (async () => {
      try {
        const { data } = await API.get("/auth/profile");
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (error) {
        console.error(
          "❌ Error fetching user profile:",
          error?.response?.data?.msg || error?.message
        );
        logout();
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  // Optional: keep auth state in sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token" || e.key === "user") {
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");
        if (!newToken || !newUser) {
          logout();
        } else {
          API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          try {
            setUser(JSON.parse(newUser));
          } catch {
            logout();
          }
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [logout]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loading,
      refreshProfile,
      isAuthenticated,
    }),
    [user, login, logout, loading, refreshProfile, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};