// src/pages/RestaurantPage.jsx
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { NotificationsContext } from "../context/NotificationsContext";
import {
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Leaf,
  Utensils,
  MessageSquarePlus,
  Search,
  ChefHat,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";
import { getReviews, deleteReview } from "../api/reviewsApi";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";
import MenuItemCard from "../components/MenuItemCard";
import PageContainer from "../components/PageContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function RestaurantPage() {
  const { id } = useParams();
  const { addToCart, cart = [] } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { add: addToast } = useContext(NotificationsContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(true);
  const [error, setError] = useState("");

  // Menu controls
  const [menuSearch, setMenuSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const reviewsRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Fetch restaurant + menu
  useEffect(() => {
    let mounted = true;
    const fetchRestaurant = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get(`/restaurants/${id}`);
        if (!mounted) return;
        setRestaurant(data?.restaurant || null);
        setMenu(Array.isArray(data?.menu) ? data.menu : []);
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load restaurant. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchRestaurant();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      setRevLoading(true);
      try {
        const list = await getReviews(id);
        if (!mounted) return;
        setReviews(list);
      } finally {
        if (mounted) setRevLoading(false);
      }
    };
    if (id) fetchReviews();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = (cartItem) => {
    if (!cartItem) return;
    addToCart(cartItem, cartItem.quantity || 1, restaurant?._id || restaurant?.id);
    addToast({
      type: "success",
      title: "Added to cart",
      message: cartItem.name || "Item",
    });
  };

  const handleReviewAdded = (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch {
      // ignore
    }
  };

  const myId = user?.id || user?._id;
  const alreadyReviewed = myId && reviews.some((r) => String(r?.user?._id || r?.user) === String(myId));

  const categories = useMemo(() => {
    const set = new Set();
    for (const item of menu) {
      if (item?.category) set.add(item.category);
    }
    return ["all", ...Array.from(set)];
  }, [menu]);

  const heroChips = useMemo(() => {
    const arr = [];
    if (Array.isArray(restaurant?.cuisines) && restaurant.cuisines.length) {
      arr.push(...restaurant.cuisines);
    } else if (Array.isArray(restaurant?.tags) && restaurant.tags.length) {
      arr.push(...restaurant.tags);
    }
    return arr.slice(0, 6);
  }, [restaurant]);

  const filteredMenu = useMemo(() => {
    let list = [...menu];

    if (activeCategory !== "all") {
      list = list.filter((i) => i.category === activeCategory);
    }

    if (vegOnly) {
      list = list.filter((i) => i.isVeg === true);
    }

    const q = menuSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => i.name?.toLowerCase().includes(q));
    }

    if (sortBy === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [menu, vegOnly, menuSearch, sortBy, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-full bg-surface-50">
        <PageContainer className="py-6">
          <div className="h-56 sm:h-64 md:h-80 w-full rounded-2xl bg-surface-200 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-surface-200 animate-pulse" />
            ))}
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-full bg-surface-50 flex items-center justify-center px-4">
        <p className="text-stone-600 font-medium">Restaurant not found.</p>
      </div>
    );
  }

  const bannerImg =
    (restaurant.image && restaurant.image.trim() && restaurant.image) ||
    (restaurant.banner && restaurant.banner.trim() && restaurant.banner) ||
    "https://via.placeholder.com/1200x400?text=Restaurant";

  const isOpen = restaurant?.isOpen !== false;
  const average = Number(restaurant.rating || 0).toFixed(1);

  const Chip = ({ active, onClick, children }) => (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-touch touch-target ${
        active
          ? "bg-brand-600 text-white shadow-card"
          : "bg-white text-stone-700 border border-stone-200 hover:border-brand-300 hover:bg-brand-50"
      }`}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="min-h-full bg-surface-50">
      <PageContainer className="px-0 sm:px-5">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[400px] md:h-[500px] w-full overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={bannerImg}
              alt={restaurant.name || "Restaurant"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col justify-end px-4 md:px-8 pb-8 md:pb-12">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              {/* Restaurant Name */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {restaurant.name || "Restaurant"}
              </h1>

              {/* Info Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-gray-900">{average}</span>
                  {restaurant.numReviews && (
                    <span className="text-gray-600 text-sm">({restaurant.numReviews} reviews)</span>
                  )}
                </div>

                {restaurant.deliveryTime && (
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <Clock className="w-5 h-5 text-brand-600" />
                    <span className="text-stone-900 font-medium tabular-nums">{restaurant.deliveryTime} min</span>
                  </div>
                )}

                {restaurant.location && (
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    <span className="text-stone-900 font-medium">{restaurant.location}</span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-semibold ${
                    isOpen
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isOpen ? "bg-white animate-pulse" : "bg-gray-300"}`} />
                  {isOpen ? "Open Now" : "Closed"}
                </div>
              </div>

              {/* Cuisine Tags */}
              {heroChips.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {heroChips.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full text-sm bg-white/90 backdrop-blur-sm text-gray-700 font-medium shadow-md"
                    >
                      #{c}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 px-6 py-3 rounded-full font-semibold transition shadow-lg hover:shadow-xl"
                >
                  <MessageSquarePlus className="w-5 h-5" />
                  Write Review
                </motion.button>

                <Link to="/cart">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-semibold transition shadow-card hover:shadow-card-hover min-h-touch touch-target"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    View cart
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* About Section */}
        {(restaurant.description || restaurant.address) && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-4 md:mx-8 -mt-8 relative z-10"
          >
            <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 border border-stone-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-100 rounded-xl">
                  <ChefHat className="w-6 h-6 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-800">About</h2>
              </div>
              {restaurant.description && (
                <p className="text-stone-600 leading-relaxed mb-3">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-2 text-stone-600">
                  <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <p>{restaurant.address}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Filters Section */}
        <div className="px-4 md:px-8 mt-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-card border border-stone-200 p-4 sm:p-6"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-stone-800">Categories</h3>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((c) => (
                  <Chip
                    key={c}
                    active={activeCategory === c}
                    onClick={() => setActiveCategory(c)}
                  >
                    {c === "all" ? "All Items" : c}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Veg Filter */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setVegOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all min-h-touch touch-target ${
                  vegOnly
                    ? "bg-emerald-600 text-white shadow-card"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <Leaf className="w-4 h-4" />
                Veg Only
              </motion.button>

              {/* Sort Buttons */}
              <div className="flex items-center gap-2 bg-surface-100 rounded-xl p-1">
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "rating"
                      ? "bg-white shadow-sm text-stone-900 border border-stone-200"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Rating
                  </div>
                </button>
                <button
                  onClick={() => setSortBy("priceAsc")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "priceAsc"
                      ? "bg-white shadow-sm text-stone-900 border border-stone-200"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ₹ Low
                </button>
                <button
                  onClick={() => setSortBy("priceDesc")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "priceDesc"
                      ? "bg-white shadow-sm text-stone-900 border border-stone-200"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ₹ High
                </button>
              </div>

              {/* Search */}
              <div className="relative ml-auto min-w-[200px] sm:min-w-[240px]">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full border-2 border-stone-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition text-stone-800"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Menu Grid */}
        <div className="px-4 md:px-8 mt-8">
          {filteredMenu.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-200 rounded-2xl mb-4">
                <Utensils className="w-10 h-10 text-stone-400" />
              </div>
              <p className="text-stone-600 text-lg font-medium">No items match your filters.</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setVegOnly(false);
                  setMenuSearch("");
                  setSortBy("");
                }}
                className="mt-4 text-brand-600 hover:text-brand-500 font-semibold underline"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredMenu.map((item) => (
                <motion.div key={item._id} variants={cardVariants}>
                  <MenuItemCard
                    item={item}
                    addToCart={handleAddToCart}
                    restaurantId={restaurant?._id || restaurant?.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Reviews Section */}
        <div
          ref={reviewsRef}
          className="px-4 md:px-8 mt-20"
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-3xl shadow-card p-6 md:p-10 border border-stone-200"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-brand-100 rounded-xl">
                <Star className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Ratings & Reviews</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reviews List */}
              <div>
                {revLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <ReviewsList reviews={reviews} onDelete={handleReviewDelete} />
                )}
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-card">
                <h3 className="text-xl font-bold text-stone-800 mb-4">Share your experience</h3>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-stone-600 mb-4">Sign in to write a review</p>
                    <Link
                      to="/login"
                      className="inline-block bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-card min-h-touch touch-target"
                    >
                      Sign in
                    </Link>
                  </div>
                ) : alreadyReviewed ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
                      <Award className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-stone-600 font-medium">
                      You have already reviewed this restaurant. Thank you!
                    </p>
                  </div>
                ) : (
                  <ReviewForm restaurantId={id} onAdded={handleReviewAdded} />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sticky View Cart bar – mobile when cart has items from this restaurant */}
        {(() => {
          const restId = restaurant?._id || restaurant?.id;
          const cartItemsFromRest = Array.isArray(cart)
            ? cart.filter((it) => String(it?.restaurant || "") === String(restId))
            : [];
          const count = cartItemsFromRest.reduce((sum, it) => sum + Number(it?.quantity || 1), 0);
          if (count === 0) return null;
          return (
            <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-nav p-3">
              <Link
                to="/cart"
                className="flex items-center justify-between w-full max-w-lg mx-auto px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-card transition-colors touch-target"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  View cart
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </Link>
            </div>
          );
        })()}
      </PageContainer>
    </div>
  );
}