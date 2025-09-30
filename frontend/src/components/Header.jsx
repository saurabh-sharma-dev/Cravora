// src/components/Header.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  MapPinIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";

import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useLocationContext } from "../context/LocationContext";
import { useSearchContext } from "../context/SearchContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { location: selectedLocation, setLocation } = useLocationContext();
  const { searchQuery, setSearchQuery } = useSearchContext();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState(["All"]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = useMemo(
    () =>
      Array.isArray(cart)
        ? cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0)
        : 0,
    [cart]
  );

  // Fetch all available locations
  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const { data } = await API.get("/locations");
        if (!isMounted) return;

        // Clean, dedupe, sort
        const list = Array.isArray(data?.locations) ? data.locations : [];
        const cleaned = [];
        const seen = new Set();
        for (const l of list) {
          const v = String(l || "").trim();
          if (!v) continue;
          const key = v.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            cleaned.push(v);
          }
        }
        cleaned.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        setLocations(["All", ...cleaned]);

        // Load saved location (optional)
        const saved = localStorage.getItem("selectedLocation");
        if (saved && !selectedLocation) {
          setLocation(saved === "All" ? "" : saved);
        }
      } catch {
        if (!isMounted) return;
        setLocations(["All"]);
      }
    };
    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, [selectedLocation, setLocation]);

  // Close dropdown on click outside + Escape + keyboard nav
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        setHighlightIndex(-1);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          const max = locations.length - 1;
          return prev < max ? prev + 1 : 0;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          const max = locations.length - 1;
          return prev > 0 ? prev - 1 : max;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex >= 0) {
          const loc = locations[highlightIndex];
          applyLocation(loc);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, locations, highlightIndex]);

  const applyLocation = (loc) => {
    const value = loc === "All" ? "" : loc;
    setLocation(value);
    localStorage.setItem("selectedLocation", loc || "All");
    setOpen(false);
    setHighlightIndex(-1);
    // Optionally navigate to home so filters apply immediately
    navigate("/", { replace: true });
  };

  // Search submit (press Enter or click icon)
  const submitSearch = (e) => {
    e?.preventDefault?.();
    // Navigate to home where listing + Filters apply search
    navigate("/", { replace: true });
    searchInputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery("");
    navigate("/", { replace: true });
    searchInputRef.current?.focus();
  };

  const currentLocLabel = selectedLocation || "Select Location";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="container mx-auto flex flex-wrap justify-between items-center py-4 px-6 gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold bg-clip-text text-transparent 
                     bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 
                     hover:scale-110 transform transition-all tracking-wider"
        >
          🍔 <span className="font-serif">Foodie</span>
        </Link>

        {/* Location + Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl relative">
          {/* Location Dropdown */}
          <div className="relative">
            <motion.button
              ref={buttonRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls="location-menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 
                         transition rounded-full px-4 py-2 text-gray-700 font-medium shadow-sm"
            >
              <MapPinIcon className="h-5 w-5 text-red-500" />
              <span className="truncate max-w-[120px]" title={currentLocLabel}>
                {currentLocLabel || "Select Location"}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div
                  ref={dropdownRef}
                  id="location-menu"
                  role="listbox"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute mt-2 w-56 bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto border"
                >
                  {locations.map((loc, idx) => {
                    const isActive =
                      (loc === "All" && !selectedLocation) ||
                      loc === selectedLocation;
                    const isHighlighted = idx === highlightIndex;
                    return (
                      <div
                        key={loc}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onMouseLeave={() => setHighlightIndex(-1)}
                        onClick={() => applyLocation(loc)}
                        className={`px-4 py-2 cursor-pointer transition-all ${
                          isHighlighted || isActive
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        } ${isActive ? "font-semibold" : "font-normal"}`}
                      >
                        {loc}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Bar */}
          <form onSubmit={submitSearch} className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-full pl-10 pr-10 py-2 
                         focus:outline-none focus:ring-2 focus:ring-red-500 
                         shadow-sm hover:shadow-md transition-all duration-300"
              aria-label="Search"
            />
            <MagnifyingGlassIcon
              onClick={submitSearch}
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 cursor-pointer hover:text-gray-600"
            />
            {!!searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        {/* User & Cart */}
        <nav className="flex items-center gap-6">
          {!user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-red-500 transition font-medium"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-red-500 transition font-medium"
                >
                  Register
                </Link>
              </motion.div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/login")}
                className="bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition"
              >
                Admin Login
              </motion.button>
            </>
          ) : (
            <>
              <span className="text-gray-700 font-medium hidden md:inline">
                Hi, {user.name}
              </span>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/my-orders"
                  className="text-gray-600 hover:text-red-500 transition font-medium"
                >
                  My Orders
                </Link>
              </motion.div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="text-gray-600 hover:text-red-500 transition font-medium"
              >
                Logout
              </motion.button>
            </>
          )}

          {/* Cart Icon with Badge */}
          <motion.div whileHover={{ scale: 1.15 }} className="relative">
            <Link to="/cart" aria-label="Cart">
              <ShoppingCartIcon className="h-7 w-7 text-gray-700 hover:text-red-500 transition" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white 
                             text-xs px-2 py-0.5 rounded-full shadow"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          </motion.div>
        </nav>
      </div>
    </header>
  );
}