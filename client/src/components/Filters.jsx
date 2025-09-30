// src/components/Filters.jsx
import React, { useEffect, useState } from "react";
import { Star, Clock, Leaf, TrendingUp, ArrowUpDown, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Filters({ onFilter }) {
  const [vegOnly, setVegOnly] = useState(false);          // client-side only
  const [minRating, setMinRating] = useState(0);          // backend: minRating
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(null); // backend: maxDeliveryTime
  const [sortBy, setSortBy] = useState("");               // client-side only: "popularity" | "rating"
  const [priceOrder, setPriceOrder] = useState("");       // client-side only: "lowToHigh" | "highToLow"

  // Build a clean object for backend (only supported query params)
  const buildApiParams = (f) => {
    const params = {};
    if (f.minRating > 0) params.minRating = f.minRating;
    if (f.maxDeliveryTime) params.maxDeliveryTime = f.maxDeliveryTime;
    // Note: tags, location, search can be added by parent when needed
    return params;
  };

  const updateFilters = (changes = {}) => {
    const next = {
      vegOnly,
      minRating,
      maxDeliveryTime,
      sortBy,
      priceOrder,
      ...changes,
    };

    // Send both raw UI filters and API-ready params to parent
    // Parent can call: listRestaurants(filters.params) and then apply client-side sorting/veg filter
    const payload = {
      ...next,
      params: buildApiParams(next),
    };

    if (onFilter) onFilter(payload);
  };

  // Emit initial filters once on mount
  useEffect(() => {
    updateFilters({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pillClass =
    "px-3 py-1 rounded-full text-sm font-medium shadow-md transition-all duration-300";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filter Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="flex flex-wrap gap-3 items-center p-5 bg-white/95 backdrop-blur-lg 
                   rounded-3xl shadow-lg border border-gray-200 sticky top-4 z-50"
      >
        {/* Title */}
        <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
          <Filter size={22} className="text-red-500 animate-pulse" />
          Filters
        </div>

        {/* Veg Only (client-side filter) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const newVal = !vegOnly;
            setVegOnly(newVal);
            updateFilters({ vegOnly: newVal });
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all duration-300
            ${
              vegOnly
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-green-50 shadow"
            }`}
        >
          <Leaf size={18} /> Veg Only
        </motion.button>

        {/* Rating (backend: minRating) */}
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500" size={18} />
          <select
            value={minRating}
            onChange={(e) => {
              const rating = Number(e.target.value);
              setMinRating(rating);
              updateFilters({ minRating: rating });
            }}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white 
                       shadow-sm hover:shadow-md transition 
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3+ ⭐</option>
            <option value={4}>4+ ⭐</option>
            <option value={4.5}>4.5+ ⭐</option>
          </select>
        </div>

        {/* Delivery Time (backend: maxDeliveryTime) */}
        <div className="flex items-center gap-2">
          <Clock className="text-blue-500" size={18} />
          <select
            value={maxDeliveryTime ?? ""}
            onChange={(e) => {
              const time = e.target.value ? Number(e.target.value) : null;
              setMaxDeliveryTime(time);
              updateFilters({ maxDeliveryTime: time });
            }}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white 
                       shadow-sm hover:shadow-md transition 
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Any Time</option>
            <option value={15}>≤ 15 min</option>
            <option value={30}>≤ 30 min</option>
            <option value={45}>≤ 45 min</option>
          </select>
        </div>

        {/* Sort (client-side) */}
        <div className="flex items-center gap-2">
          <TrendingUp className="text-purple-500" size={18} />
          <select
            value={sortBy}
            onChange={(e) => {
              const value = e.target.value;
              setSortBy(value);
              updateFilters({ sortBy: value });
            }}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white 
                       shadow-sm hover:shadow-md transition 
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Sort by</option>
            <option value="popularity">Popularity</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Price (client-side based on Restaurant.averageCost) */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-indigo-500" size={18} />
          <select
            value={priceOrder}
            onChange={(e) => {
              const value = e.target.value;
              setPriceOrder(value);
              updateFilters({ priceOrder: value });
            }}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white 
                       shadow-sm hover:shadow-md transition 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Price</option>
            <option value="lowToHigh">Low → High</option>
            <option value="highToLow">High → Low</option>
          </select>
        </div>
      </motion.div>

      {/* Active Filters Tags */}
      <div className="flex flex-wrap gap-2 px-4">
        <AnimatePresence>
          {vegOnly && (
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${pillClass} bg-green-600 text-white`}
            >
              Veg Only
            </motion.span>
          )}
          {minRating > 0 && (
            <motion.span
              layout
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={`${pillClass} bg-yellow-100 text-yellow-800`}
            >
              {minRating}+ ⭐
            </motion.span>
          )}
          {maxDeliveryTime && (
            <motion.span
              layout
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className={`${pillClass} bg-blue-100 text-blue-800`}
            >
              ≤ {maxDeliveryTime} min
            </motion.span>
          )}
          {sortBy && (
            <motion.span
              layout
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 10 }}
              className={`${pillClass} bg-purple-100 text-purple-800 capitalize`}
            >
              {sortBy}
            </motion.span>
          )}
          {priceOrder && (
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${pillClass} bg-indigo-100 text-indigo-800`}
            >
              {priceOrder === "lowToHigh" ? "Low → High" : "High → Low"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}