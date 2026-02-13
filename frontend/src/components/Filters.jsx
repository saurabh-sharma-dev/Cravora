// src/components/Filters.jsx
import React, { useEffect, useState } from "react";
import {
  Star,
  Clock,
  Leaf,
  TrendingUp,
  ArrowUpDown,
  Filter as FilterIcon,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Filters({ onFilter = () => {} }) {
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [priceOrder, setPriceOrder] = useState("");

  // Build API params
  const buildApiParams = (f) => {
    const params = {};
    if (Number(f.minRating) > 0) params.minRating = Number(f.minRating);
    if (Number.isFinite(Number(f.maxDeliveryTime)) && Number(f.maxDeliveryTime) > 0) {
      params.maxDeliveryTime = Number(f.maxDeliveryTime);
    }
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

    const payload = {
      ...next,
      params: buildApiParams(next),
    };

    onFilter(payload);
  };

  // Initial emit
  useEffect(() => {
    updateFilters({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset all filters
  const resetAllFilters = () => {
    setVegOnly(false);
    setMinRating(0);
    setMaxDeliveryTime(null);
    setSortBy("");
    setPriceOrder("");
    updateFilters({
      vegOnly: false,
      minRating: 0,
      maxDeliveryTime: null,
      sortBy: "",
      priceOrder: "",
    });
  };

  // Check if any filter is active
  const hasActiveFilters =
    vegOnly || minRating > 0 || maxDeliveryTime || sortBy || priceOrder;

  return (
    <div className="w-full space-y-4">
      {/* Main Filter Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <FilterIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <p className="text-xs text-gray-500">Customize your search</p>
            </div>
          </div>

          {/* Reset Button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-200 transition-all shadow-sm"
              >
                <X size={16} />
                Reset All
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Veg Only Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const newVal = !vegOnly;
              setVegOnly(newVal);
              updateFilters({ vegOnly: newVal });
            }}
            className={`
              relative overflow-hidden rounded-xl p-4 border-2 transition-all shadow-md hover:shadow-lg
              ${
                vegOnly
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf size={20} className={vegOnly ? "text-white" : "text-green-600"} />
                <span className="font-semibold text-sm">Veg Only</span>
              </div>
              {vegOnly && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
              )}
            </div>
          </motion.button>

          {/* Rating Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
              <Star size={14} className="text-amber-500" />
              Minimum Rating
            </label>
            <div className="relative">
              <select
                value={minRating}
                onChange={(e) => {
                  const rating = Number(e.target.value);
                  setMinRating(rating);
                  updateFilters({ minRating: rating });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm shadow-sm"
              >
                <option value={0}>All Ratings</option>
                <option value={3}>3.0+ ⭐</option>
                <option value={4}>4.0+ ⭐⭐</option>
                <option value={4.5}>4.5+ ⭐⭐⭐</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Delivery Time Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
              <Clock size={14} className="text-blue-500" />
              Delivery Time
            </label>
            <div className="relative">
              <select
                value={maxDeliveryTime ?? ""}
                onChange={(e) => {
                  const time = e.target.value ? Number(e.target.value) : null;
                  setMaxDeliveryTime(time);
                  updateFilters({ maxDeliveryTime: time });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm shadow-sm"
              >
                <option value="">Any Time</option>
                <option value={15}>Under 15 min</option>
                <option value={30}>Under 30 min</option>
                <option value={45}>Under 45 min</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
              <TrendingUp size={14} className="text-purple-500" />
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  const value = e.target.value;
                  setSortBy(value);
                  updateFilters({ sortBy: value });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm shadow-sm"
              >
                <option value="">Default</option>
                <option value="popularity">🔥 Popularity</option>
                <option value="rating">⭐ Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Price Order Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
              <ArrowUpDown size={14} className="text-indigo-500" />
              Price Range
            </label>
            <div className="relative">
              <select
                value={priceOrder}
                onChange={(e) => {
                  const value = e.target.value;
                  setPriceOrder(value);
                  updateFilters({ priceOrder: value });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm shadow-sm"
              >
                <option value="">Any Price</option>
                <option value="lowToHigh">₹ Low → High</option>
                <option value="highToLow">₹ High → Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Sparkles size={16} className="text-purple-500" />
              Active Filters:
            </div>

            {vegOnly && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold border border-green-200 shadow-sm"
              >
                <Leaf size={12} />
                Veg Only
              </motion.span>
            )}

            {minRating > 0 && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 shadow-sm"
              >
                <Star size={12} />
                {minRating}+ Rating
              </motion.span>
            )}

            {maxDeliveryTime && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 shadow-sm"
              >
                <Clock size={12} />
                Under {maxDeliveryTime}m
              </motion.span>
            )}

            {sortBy && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 shadow-sm capitalize"
              >
                <TrendingUp size={12} />
                {sortBy}
              </motion.span>
            )}

            {priceOrder && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 shadow-sm"
              >
                <ArrowUpDown size={12} />
                {priceOrder === "lowToHigh" ? "₹ Low → High" : "₹ High → Low"}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}