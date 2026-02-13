// src/components/Header.jsx – Mobile-first, unique design
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation as useRouteLocation } from "react-router-dom";
import { MapPin, Search, ShoppingCart, ChevronDown, X, User, Heart, ClipboardList, LogOut, HelpCircle } from "lucide-react";
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
  const routeLocation = useRouteLocation();

  const [openLocation, setOpenLocation] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [locations, setLocations] = useState(["All"]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const locationBtnRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = useMemo(
    () =>
      Array.isArray(cart)
        ? cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0)
        : 0,
    [cart]
  );

  const isHome = routeLocation.pathname === "/";
  const showOffersBar = isHome;

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const { data } = await API.get("/locations");
        if (!isMounted) return;
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
        cleaned.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        setLocations(["All", ...cleaned]);
        const saved = localStorage.getItem("selectedLocation");
        if (saved && !selectedLocation) setLocation(saved === "All" ? "" : saved);
      } catch {
        if (!isMounted) setLocations(["All"]);
      }
    };
    fetchLocations();
    return () => { isMounted = false; };
  }, [selectedLocation, setLocation]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !locationBtnRef.current?.contains(e.target)) {
        setOpenLocation(false);
        setHighlightIndex(-1);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenLocation(false);
        setOpenProfile(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const applyLocation = (loc) => {
    setLocation(loc === "All" ? "" : loc);
    localStorage.setItem("selectedLocation", loc || "All");
    setOpenLocation(false);
    setHighlightIndex(-1);
    navigate("/", { replace: true });
  };

  const submitSearch = (e) => {
    e?.preventDefault?.();
    navigate("/", { replace: true });
    searchInputRef.current?.blur();
  };

  const currentLocLabel = selectedLocation || "Select location";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200/80 shadow-sm">
      {/* Main bar – mobile-first single row */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 min-h-touch">
        {/* Logo – touch target */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0 min-h-touch min-w-touch rounded-xl -m-1 p-1 active:opacity-80"
          aria-label="BiteDash Home"
        >
          <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 text-white shadow-md">
            <span className="text-base sm:text-lg">🍔</span>
          </span>
          <span className="hidden sm:inline text-lg font-bold text-stone-800">
            BiteDash
          </span>
        </Link>

        {/* Delivery to – compact on mobile */}
        <div className="relative flex-1 min-w-0">
          <motion.button
            ref={locationBtnRef}
            type="button"
            onClick={() => setOpenLocation((v) => !v)}
            className="flex items-center gap-1.5 w-full min-h-touch rounded-xl bg-surface-100 hover:bg-surface-200 border border-stone-200/80 px-3 py-2 text-left transition-colors touch-target"
            aria-expanded={openLocation}
          >
            <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span className="truncate text-sm font-medium text-stone-700" title={currentLocLabel}>
              {currentLocLabel}
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-400 flex-shrink-0 ml-auto transition-transform ${openLocation ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {openLocation && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-card max-h-56 overflow-y-auto z-20"
              >
                {locations.map((loc, idx) => {
                  const isActive = (loc === "All" && !selectedLocation) || loc === selectedLocation;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => applyLocation(loc)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-stone-700 hover:bg-surface-50"
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search – full on md+, icon + expand on mobile */}
        <form onSubmit={submitSearch} className="hidden md:block flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search food or restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-stone-200 bg-surface-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm"
              aria-label="Search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </form>

        {/* Right: Profile (or Login) + Cart */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!user ? (
            <>
              <Link
                to="/login"
                className="flex sm:hidden items-center justify-center w-10 h-10 rounded-xl bg-surface-100 border border-stone-200 text-stone-600 hover:bg-brand-50 hover:text-brand-600 transition-colors touch-target"
                aria-label="Login"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center min-h-touch px-3 rounded-xl text-sm font-medium text-stone-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center min-h-touch px-3 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                Sign up
              </Link>
              <Link
                to="/admin/login"
                className="hidden md:inline-flex items-center min-h-touch px-2 rounded-lg text-xs text-stone-500 hover:text-stone-700"
              >
                Admin
              </Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <motion.button
                type="button"
                onClick={() => setOpenProfile((v) => !v)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-100 border border-stone-200 text-stone-600 hover:bg-surface-200 transition-colors touch-target"
                aria-label="Account menu"
              >
                <User className="w-5 h-5" />
              </motion.button>
              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-stone-200 shadow-card py-1 z-20"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800 truncate">Hi, {user.name}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setOpenProfile(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-surface-50"
                    >
                      <ClipboardList className="w-4 h-4 text-brand-600" /> My Orders
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setOpenProfile(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-surface-50"
                    >
                      <Heart className="w-4 h-4 text-brand-600" /> Favorites
                    </Link>
                    <a
                      href="#help"
                      onClick={() => setOpenProfile(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-surface-50"
                    >
                      <HelpCircle className="w-4 h-4 text-stone-500" /> Help
                    </a>
                    <button
                      type="button"
                      onClick={() => { setOpenProfile(false); logout(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <Link
            to="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface-100 border border-stone-200 text-stone-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors touch-target"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search – full width below main bar when on home */}
      {isHome && (
        <div className="md:hidden px-3 pb-3">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search for dishes or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 bg-surface-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              aria-label="Search"
            />
          </form>
        </div>
      )}

      {/* Offers strip – only on home */}
      {showOffersBar && (
        <div className="hidden sm:block border-t border-stone-100 bg-brand-50/50">
          <div className="px-4 py-2 flex items-center justify-center gap-2 text-xs text-brand-800 font-medium">
            <span>Free delivery on orders above ₹500</span>
            <span className="text-stone-400">•</span>
            <span>Use <strong>BITEDASH10</strong> for 10% off</span>
          </div>
        </div>
      )}
    </header>
  );
}
