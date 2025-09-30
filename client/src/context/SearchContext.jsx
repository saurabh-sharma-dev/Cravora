// src/context/SearchContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const SearchContext = createContext();

/**
 * 🔍 SearchProvider
 * Manages global search state & debounced value for optimized API queries
 *
 * Provides:
 * - searchQuery:  current input text (instant)
 * - setSearchQuery: update function for search input
 * - debouncedSearch: debounced value (lagged, triggers after delay)
 * - clearSearch: resets the input text
 */
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ Debounce: update debouncedSearch after 300ms inactivity
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ✅ Reset search input
  const clearSearch = () => setSearchQuery("");

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// ✅ Custom hook for easy access
export const useSearchContext = () => useContext(SearchContext);