// src/pages/Home.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import API from "../api";
import RestaurantCard from "../components/RestaurantCard";
import SkeletonCard from "../components/SkeletonCard";
// Removed big Filters component
// import Filters from "../components/Filters";
import { useLocationContext } from "../context/LocationContext";
import { useSearchContext } from "../context/SearchContext";
import { motion } from "framer-motion";
import { MapPin, Leaf, Star, Clock, ArrowUpDown, XCircle } from "lucide-react";

export default function Home() {
  // Raw list from backend
  const [restaurants, setRestaurants] = useState([]);
  // Client-side filtered list
  const [shown, setShown] = useState([]);
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters (compact swiggy-style controls)
  const [flt, setFlt] = useState({
    params: {},      // backend: { minRating, maxDeliveryTime }
    vegOnly: false,  // client
    sortBy: "",      // client: "popularity" | "rating"
    priceOrder: "",  // client: "lowToHigh" | "highToLow"
  });

  const { location } = useLocationContext();
  const { searchQuery } = useSearchContext();

  // Helpers to update filters
  const setMinRating = (r) =>
    setFlt((p) => ({ ...p, params: { ...p.params, ...(r ? { minRating: r } : (() => { const { minRating, ...rest } = p.params; return rest; })()) } }));
  const setMaxTime = (t) =>
    setFlt((p) => ({ ...p, params: { ...p.params, ...(t ? { maxDeliveryTime: t } : (() => { const { maxDeliveryTime, ...rest } = p.params; return rest; })()) } }));
  const toggleVeg = () => setFlt((p) => ({ ...p, vegOnly: !p.vegOnly }));
  const setSortBy = (v) => setFlt((p) => ({ ...p, sortBy: v }));
  const setPriceOrder = (v) => setFlt((p) => ({ ...p, priceOrder: p.priceOrder === v ? "" : v }));
  const resetFilters = () => setFlt({ params: {}, vegOnly: false, sortBy: "", priceOrder: "" });

  // Current param values
  const minRating = Number(flt.params.minRating || 0);
  const maxTime = Number(flt.params.maxDeliveryTime || 0);

  // Fetch from backend (debounced + abortable)
  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { ...(flt.params || {}) };
        if (location && location.toLowerCase() !== "all") params.location = location;
        if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();

        const { data } = await API.get("/restaurants", { params, signal: controller.signal });
        const list = Array.isArray(data?.restaurants)
          ? data.restaurants
          : Array.isArray(data)
          ? data
          : [];
        setRestaurants(list);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("❌ Error fetching restaurants:", err.response?.data || err.message);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(run, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [flt.params, location, searchQuery]);

  // Apply client-side filters
  useEffect(() => {
    let list = [...restaurants];

    // Veg only
    if (flt.vegOnly) {
      list = list.filter((r) => Array.isArray(r.menu) && r.menu.some((i) => i.isVeg === true));
    }

    // Sort by rating/popularity
    if (flt.sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (flt.sortBy === "popularity") {
      list.sort((a, b) => Number(b.numReviews || 0) - Number(a.numReviews || 0));
    }

    // Price sort: by averageCost, fallback to average of menu prices
    const avgPrice = (r) => {
      if (typeof r.averageCost === "number" && !Number.isNaN(r.averageCost)) return r.averageCost;
      if (Array.isArray(r.menu) && r.menu.length) {
        const sum = r.menu.reduce((acc, it) => acc + Number(it.price || 0), 0);
        return sum / r.menu.length;
      }
      return 0;
    };

    if (flt.priceOrder === "lowToHigh") {
      list.sort((a, b) => avgPrice(a) - avgPrice(b));
    } else if (flt.priceOrder === "highToLow") {
      list.sort((a, b) => avgPrice(b) - avgPrice(a));
    }

    setShown(list);
  }, [restaurants, flt.vegOnly, flt.sortBy, flt.priceOrder]);

  // Headline + info
  const headline = useMemo(() => {
    if (location && location.toLowerCase() !== "all") return `Explore Restaurants in ${location}`;
    return "Explore Restaurants";
  }, [location]);

  const locationLabel = location && location.toLowerCase() !== "all" ? location : "All locations";

  // Small chip component
  const Chip = useCallback(
    ({ active, onClick, children, className = "" }) => (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full border text-xs md:text-sm transition ${
          active ? "bg-gray-900 text-white border-gray-900 shadow" : "bg-white/90 text-gray-700 hover:bg-white"
        } ${className}`}
      >
        {children}
      </motion.button>
    ),
    []
  );

  return (
    <div className="font-poppins bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-3 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[1.2rem] p-6 md:p-7 text-white shadow-xl"
          style={{
            background:
              "radial-gradient(820px 240px at 12% -18%, rgba(255,255,255,0.18), transparent), radial-gradient(520px 220px at 88% -18%, rgba(255,255,255,0.08), transparent), linear-gradient(90deg, #ef4444 0%, #ec4899 50%, #8b5cf6 100%)",
          }}
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-6 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-[22px] md:text-[30px] font-extrabold drop-shadow-sm leading-tight">
                {headline}
              </h1>
              <p className="text-xs md:text-sm text-white/90">Delicious food, fast delivery 🚀</p>
            </div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs md:text-sm shadow"
            >
              <MapPin size={16} />
              <span className="font-medium">{locationLabel}</span>
              <span className="mx-2 h-4 w-px bg-white/40" />
              <span>{shown.length} result{shown.length === 1 ? "" : "s"}</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* COMPACT FILTER BAR (sticky) */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="sticky top-20 z-30"
        >
          <div className="rounded-xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 p-2.5 shadow-md border border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Veg toggle */}
              <Chip active={flt.vegOnly} onClick={toggleVeg} className={`${flt.vegOnly ? "bg-green-600 border-green-600" : ""} inline-flex items-center gap-1`}>
                <Leaf size={14} className={flt.vegOnly ? "text-white" : "text-green-600"} />
                Veg only
              </Chip>

              {/* Rating */}
              <Chip active={minRating === 4} onClick={() => setMinRating(minRating === 4 ? 0 : 4)} className={`${minRating === 4 ? "bg-amber-500 border-amber-500" : ""} inline-flex items-center gap-1`}>
                <Star size={14} className={minRating === 4 ? "text-white" : "text-amber-500"} /> 4.0+
              </Chip>
              <Chip active={minRating === 4.5} onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)} className={`${minRating === 4.5 ? "bg-amber-600 border-amber-600" : ""} inline-flex items-center gap-1`}>
                <Star size={14} className={minRating === 4.5 ? "text-white" : "text-amber-600"} /> 4.5+
              </Chip>

              {/* Delivery time */}
              <Chip active={maxTime === 30} onClick={() => setMaxTime(maxTime === 30 ? 0 : 30)} className={`${maxTime === 30 ? "bg-indigo-600 border-indigo-600" : ""} inline-flex items-center gap-1`}>
                <Clock size={14} className={maxTime === 30 ? "text-white" : "text-indigo-600"} /> Under 30m
              </Chip>
              <Chip active={maxTime === 45} onClick={() => setMaxTime(maxTime === 45 ? 0 : 45)} className={`${maxTime === 45 ? "bg-indigo-600 border-indigo-600" : ""} inline-flex items-center gap-1`}>
                <Clock size={14} className={maxTime === 45 ? "text-white" : "text-indigo-600"} /> Under 45m
              </Chip>

              {/* Divider */}
              <span className="mx-1 h-5 w-px bg-gray-200" />

              {/* Sort by */}
              <div className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-600">
                <ArrowUpDown size={14} className="text-gray-500" />
                <select
                  value={flt.sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-full px-2.5 py-1.5 text-xs md:text-sm"
                >
                  <option value="">Sort by</option>
                  <option value="rating">Rating</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>

              {/* Price order */}
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setPriceOrder("lowToHigh")}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm ${flt.priceOrder === "lowToHigh" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                >
                  ₹ Low
                </button>
                <button
                  onClick={() => setPriceOrder("highToLow")}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm ${flt.priceOrder === "highToLow" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                >
                  ₹ High
                </button>
              </div>

              {/* Reset */}
              {(flt.vegOnly || minRating || maxTime || flt.sortBy || flt.priceOrder) && (
                <button
                  onClick={resetFilters}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs md:text-sm rounded-full border bg-white hover:bg-gray-50 text-gray-700"
                  title="Reset filters"
                >
                  <XCircle size={14} className="text-gray-500" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* LIST */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-7">
        {error && <p className="text-center text-red-500 text-lg">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-10">
            <p className="text-gray-600 text-lg">No restaurants found</p>
            <p className="text-sm text-gray-500 mt-1">Try changing filters or search keywords.</p>
          </motion.div>
        ) : (
          <>
            <div className="mb-3 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{shown.length}</span>{" "}
              restaurant{shown.length === 1 ? "" : "s"}
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {shown.map((r) => (
                <motion.div
                  key={r._id || r.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35 }}
                >
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}