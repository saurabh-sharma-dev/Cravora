// src/pages/Home.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import API from "../api";
import RestaurantCard from "../components/RestaurantCard";
import SkeletonCard from "../components/SkeletonCard";
import PageContainer from "../components/PageContainer";
import { useLocationContext } from "../context/LocationContext";
import { useSearchContext } from "../context/SearchContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Leaf,
  Star,
  Clock,
  ArrowUpDown,
  XCircle,
  Sparkles,
  Package,
  Search,
  Truck,
  RefreshCw,
  ClipboardList,
  Tag,
  Percent,
  Gift,
} from "lucide-react";

// ==================== SUB-COMPONENTS ====================

const HeroSection = React.memo(({ headline, locationLabel, resultCount }) => {
  return (
    <section className="pt-1 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-5 sm:p-6 md:p-7 text-white shadow-card"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium mb-2"
            >
              <Sparkles size={12} /> {locationLabel}
            </motion.span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {headline}
            </h1>
            <p className="text-sm text-white/90">
              {resultCount} restaurants • Fast delivery
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-semibold truncate max-w-[100px] sm:max-w-none">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20">
              <Package className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-semibold tabular-nums">{resultCount}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

const FilterChip = React.memo(({ active, onClick, children, icon: Icon, variant = "default" }) => {
  const variantStyles = {
    default: active
      ? "bg-brand-600 text-white border-brand-600"
      : "bg-white text-stone-600 border-stone-200 hover:border-brand-300",
    green: active
      ? "bg-emerald-600 text-white border-emerald-600"
      : "bg-white text-stone-600 border-stone-200 hover:border-emerald-300",
    amber: active
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white text-stone-600 border-stone-200 hover:border-amber-300",
    indigo: active
      ? "bg-brand-600 text-white border-brand-600"
      : "bg-white text-stone-600 border-stone-200 hover:border-brand-300",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-xl min-h-touch
        border font-medium text-xs transition-colors touch-target
        ${variantStyles[variant]}
      `}
    >
      {Icon && <Icon size={14} className={active ? "text-white" : "text-current"} />}
      {children}
    </motion.button>
  );
});

FilterChip.displayName = "FilterChip";

const FilterBar = React.memo(({
  vegOnly,
  minRating,
  maxTime,
  sortBy,
  priceOrder,
  hasCategory,
  onVegToggle,
  onRatingChange,
  onTimeChange,
  onSortChange,
  onPriceChange,
  onReset,
}) => {
  const hasActiveFilters = vegOnly || minRating || maxTime || sortBy || priceOrder || hasCategory;

  return (
    <section className="relative mt-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-[4.5rem] z-40 bg-white/95 backdrop-blur-lg rounded-2xl shadow-card border border-stone-200/80 p-3"
      >
        {/* Compact Filter Layout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Veg Filter */}
          <FilterChip active={vegOnly} onClick={onVegToggle} icon={Leaf} variant="green">
            Veg
          </FilterChip>

          {/* Rating Filters */}
          <FilterChip
            active={minRating === 4}
            onClick={() => onRatingChange(minRating === 4 ? 0 : 4)}
            icon={Star}
            variant="amber"
          >
            4.0+
          </FilterChip>
          <FilterChip
            active={minRating === 4.5}
            onClick={() => onRatingChange(minRating === 4.5 ? 0 : 4.5)}
            icon={Star}
            variant="amber"
          >
            4.5+
          </FilterChip>

          {/* Delivery Time */}
          <FilterChip
            active={maxTime === 30}
            onClick={() => onTimeChange(maxTime === 30 ? 0 : 30)}
            icon={Clock}
            variant="indigo"
          >
            Fast (30m)
          </FilterChip>

          <div className="h-6 w-px bg-stone-200 hidden md:block" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <ArrowUpDown size={14} className="text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-white hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 min-h-touch cursor-pointer"
            >
              <option value="">Sort</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popular</option>
            </select>
          </div>

          {/* Price Toggle */}
          <div className="inline-flex items-center rounded-xl bg-surface-100 p-0.5">
            <button
              onClick={() => onPriceChange("lowToHigh")}
              className={`px-3 py-2 rounded-lg text-xs font-medium min-h-touch transition-all ${
                priceOrder === "lowToHigh"
                  ? "bg-white shadow-sm text-stone-900 border border-stone-200"
                  : "text-stone-600"
              }`}
            >
              ₹ Low
            </button>
            <button
              onClick={() => onPriceChange("highToLow")}
              className={`px-3 py-2 rounded-lg text-xs font-medium min-h-touch transition-all ${
                priceOrder === "highToLow"
                  ? "bg-white shadow-sm text-stone-900 border border-stone-200"
                  : "text-stone-600"
              }`}
            >
              ₹ High
            </button>
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
                onClick={onReset}
                className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-accent-500 text-white font-medium text-xs min-h-touch hover:bg-accent-600 transition-all touch-target"
              >
                <XCircle size={14} />
                Reset
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
});

FilterBar.displayName = "FilterBar";

// Cuisine/category options (match backend tags/cuisines)
const CATEGORIES = [
  { id: "", label: "All", icon: "🍽️" },
  { id: "Pizza", label: "Pizza", icon: "🍕" },
  { id: "Burger", label: "Burgers", icon: "🍔" },
  { id: "Biryani", label: "Biryani", icon: "🍛" },
  { id: "North Indian", label: "North Indian", icon: "🥘" },
  { id: "South Indian", label: "South Indian", icon: "🥣" },
  { id: "Chinese", label: "Chinese", icon: "🥡" },
  { id: "Desserts", label: "Desserts", icon: "🍰" },
  { id: "Fast Food", label: "Fast Food", icon: "🌭" },
  { id: "Street Food", label: "Street Food", icon: "🫔" },
];

const CategoryBar = React.memo(({ selected, onSelect }) => {
  return (
    <section className="py-2">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = (selected || "") === cat.id;
          return (
            <motion.button
              key={cat.id || "all"}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(cat.id || "")}
              className={`
                flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl min-h-touch
                font-medium text-sm whitespace-nowrap transition-colors border touch-target
                ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600 shadow-md"
                    : "bg-white text-stone-600 border-stone-200 hover:border-brand-300 hover:bg-brand-50"
                }
              `}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
});
CategoryBar.displayName = "CategoryBar";

const OFFERS = [
  {
    id: "free-delivery",
    title: "Free delivery",
    subtitle: "On orders above ₹299",
    code: "FREEDEL",
    icon: Truck,
    gradient: "from-brand-500 to-brand-700",
    bg: "bg-brand-50",
    border: "border-brand-200",
  },
  {
    id: "first-order",
    title: "20% off first order",
    subtitle: "Use code WELCOME10",
    code: "WELCOME10",
    icon: Gift,
    gradient: "from-accent-500 to-accent-600",
    bg: "bg-accent-50",
    border: "border-accent-200",
  },
  {
    id: "save50",
    title: "Flat ₹50 off",
    subtitle: "On orders above ₹399",
    code: "SAVE50",
    icon: Percent,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
];

const OffersSection = React.memo(() => {
  return (
    <section className="py-3">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-bold text-stone-800">Offers for you</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {OFFERS.map((offer) => {
          const Icon = offer.icon;
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl border-2 shadow-card hover:shadow-card-hover transition-all overflow-hidden bg-white border-stone-200 hover:border-brand-200"
            >
              <div className={`flex items-center gap-4 p-4 ${offer.bg} border-b ${offer.border}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-stone-800 truncate">{offer.title}</p>
                  <p className="text-sm text-stone-600 truncate">{offer.subtitle}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Code: {offer.code}</span>
                <Sparkles className="w-4 h-4 text-brand-500" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
});
OffersSection.displayName = "OffersSection";

const EmptyState = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 mb-4 rounded-2xl bg-surface-200 flex items-center justify-center">
        <Search className="w-10 h-10 text-stone-400" />
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-2">No restaurants found</h3>
      <p className="text-sm text-stone-500 text-center max-w-sm">
        Try changing filters or search
      </p>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

const ErrorState = React.memo(({ error }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-24 h-24 mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">{error}</p>
    </motion.div>
  );
});

ErrorState.displayName = "ErrorState";

const LoadingState = React.memo(() => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const ResultsHeader = React.memo(({ count }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{count}</span>{" "}
          {count === 1 ? "restaurant" : "restaurants"}
        </span>
      </div>
    </motion.div>
  );
});

ResultsHeader.displayName = "ResultsHeader";

const RestaurantGrid = React.memo(({ restaurants, loading, error }) => {
  if (error) return <ErrorState error={error} />;
  if (loading) return <LoadingState />;
  if (restaurants.length === 0) return <EmptyState />;

  return (
    <>
      <ResultsHeader count={restaurants.length} />

        <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {restaurants.map((restaurant) => (
          <motion.div
            key={restaurant._id || restaurant.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                },
              },
            }}
          >
            <RestaurantCard restaurant={restaurant} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
});

RestaurantGrid.displayName = "RestaurantGrid";

// ==================== MAIN COMPONENT ====================

export default function Home() {
  // ==================== STATE ====================
  const [restaurants, setRestaurants] = useState([]);
  const [shown, setShown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flt, setFlt] = useState({
    params: {},
    vegOnly: false,
    sortBy: "",
    priceOrder: "",
  });
  const [category, setCategory] = useState("");

  // ==================== CONTEXTS ====================
  const { location } = useLocationContext();
  const { searchQuery } = useSearchContext();
  const { user } = useContext(AuthContext);

  // ==================== FILTER HANDLERS ====================
  const setMinRating = useCallback((r) => {
    setFlt((prev) => ({
      ...prev,
      params: r
        ? { ...prev.params, minRating: r }
        : (() => {
            const { minRating, ...rest } = prev.params;
            return rest;
          })(),
    }));
  }, []);

  const setMaxTime = useCallback((t) => {
    setFlt((prev) => ({
      ...prev,
      params: t
        ? { ...prev.params, maxDeliveryTime: t }
        : (() => {
            const { maxDeliveryTime, ...rest } = prev.params;
            return rest;
          })(),
    }));
  }, []);

  const toggleVeg = useCallback(() => {
    setFlt((prev) => ({ ...prev, vegOnly: !prev.vegOnly }));
  }, []);

  const setSortBy = useCallback((v) => {
    setFlt((prev) => ({ ...prev, sortBy: v }));
  }, []);

  const setPriceOrder = useCallback((v) => {
    setFlt((prev) => ({ ...prev, priceOrder: prev.priceOrder === v ? "" : v }));
  }, []);

  const resetFilters = useCallback(() => {
    setFlt({ params: {}, vegOnly: false, sortBy: "", priceOrder: "" });
    setCategory("");
  }, []);

  const setCategoryFilter = useCallback((cat) => {
    setCategory((prev) => (prev === cat ? "" : cat));
  }, []);

  // ==================== COMPUTED VALUES ====================
  const minRating = Number(flt.params.minRating || 0);
  const maxTime = Number(flt.params.maxDeliveryTime || 0);

  const headline = useMemo(() => {
    if (location && location.toLowerCase() !== "all") {
      return `Restaurants in ${location}`;
    }
    return "Restaurants Near You";
  }, [location]);

  const locationLabel = useMemo(() => {
    return location && location.toLowerCase() !== "all" ? location : "All";
  }, [location]);

  // ==================== EFFECTS ====================

  // Fetch restaurants from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchRestaurants = async () => {
      setLoading(true);
      setError("");

      try {
        const params = { ...flt.params };

        if (location && location.toLowerCase() !== "all") {
          params.location = location;
        }

        if (searchQuery?.trim()) {
          params.search = searchQuery.trim();
        }

        // Category filter: backend supports tags (and cuisines). Try tags first.
        if (category && category.trim()) {
          params.tags = category.trim();
        }

        const { data } = await API.get("/restaurants", {
          params,
          signal: controller.signal,
        });

        const list = Array.isArray(data?.restaurants)
          ? data.restaurants
          : Array.isArray(data)
          ? data
          : [];

        setRestaurants(list);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("❌ Error fetching restaurants:", err.response?.data || err.message);
        setError("Failed to load restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchRestaurants, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [flt.params, location, searchQuery, category]);

  // Apply client-side filters
  useEffect(() => {
    let list = [...restaurants];

    if (flt.vegOnly) {
      list = list.filter(
        (r) => Array.isArray(r.menu) && r.menu.some((item) => item.isVeg === true)
      );
    }

    if (flt.sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (flt.sortBy === "popularity") {
      list.sort((a, b) => Number(b.numReviews || 0) - Number(a.numReviews || 0));
    }

    const getAvgPrice = (restaurant) => {
      if (typeof restaurant.averageCost === "number" && !Number.isNaN(restaurant.averageCost)) {
        return restaurant.averageCost;
      }
      if (Array.isArray(restaurant.menu) && restaurant.menu.length) {
        const sum = restaurant.menu.reduce((acc, item) => acc + Number(item.price || 0), 0);
        return sum / restaurant.menu.length;
      }
      return 0;
    };

    if (flt.priceOrder === "lowToHigh") {
      list.sort((a, b) => getAvgPrice(a) - getAvgPrice(b));
    } else if (flt.priceOrder === "highToLow") {
      list.sort((a, b) => getAvgPrice(b) - getAvgPrice(a));
    }

    setShown(list);
  }, [restaurants, flt.vegOnly, flt.sortBy, flt.priceOrder]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-full bg-surface-50 font-sans">
      <PageContainer className="space-y-0">
        <HeroSection headline={headline} locationLabel={locationLabel} resultCount={shown.length} />

        <OffersSection />

        {/* Quick actions – when logged in */}
        {user && (
          <section className="py-2">
          <div className="flex gap-2">
            <Link
              to="/my-orders"
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all touch-target min-h-touch"
            >
              <span className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-brand-600" />
              </span>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">Track order</p>
                <p className="text-xs text-stone-500">See status & ETA</p>
              </div>
            </Link>
            <Link
              to="/my-orders"
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all touch-target min-h-touch"
            >
              <span className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-accent-600" />
              </span>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">Reorder</p>
                <p className="text-xs text-stone-500">Past orders</p>
              </div>
            </Link>
            </div>
          </section>
        )}

        <CategoryBar selected={category} onSelect={setCategoryFilter} />
        <FilterBar
        vegOnly={flt.vegOnly}
        minRating={minRating}
        maxTime={maxTime}
        sortBy={flt.sortBy}
        priceOrder={flt.priceOrder}
        hasCategory={!!(category && category.trim())}
        onVegToggle={toggleVeg}
        onRatingChange={setMinRating}
        onTimeChange={setMaxTime}
        onSortChange={setSortBy}
        onPriceChange={setPriceOrder}
        onReset={resetFilters}
        />
        <main className="py-4">
          <RestaurantGrid restaurants={shown} loading={loading} error={error} />
        </main>
      </PageContainer>
    </div>
  );
}