// src/context/FavoritesContext.jsx
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "foodie_favorites";

export const FavoritesContext = createContext({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Failed to save favorites", e);
  }
}

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(loadFavorites);

  useEffect(() => {
    saveFavorites(favoriteIds);
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (id) => {
      const sid = id ? String(id) : "";
      return favoriteIds.includes(sid);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback((id) => {
    const sid = id ? String(id) : "";
    if (!sid) return;
    setFavoriteIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  }, []);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
