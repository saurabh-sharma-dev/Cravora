// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

// ✅ Custom hook for consuming ThemeContext easily
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // ✅ Determine initial theme safely
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light"; // SSR safety
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  };

  // ✅ Lazy initialization to avoid running getInitialTheme on every render
  const [theme, setTheme] = useState(() => getInitialTheme());

  // ✅ Apply theme class to <html> and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Toggle theme
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};