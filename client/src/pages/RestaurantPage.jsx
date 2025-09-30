// src/pages/RestaurantPage.jsx
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import {
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Leaf,
  Utensils,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import { getReviews, deleteReview } from "../api/reviewsApi";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function RestaurantPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(true);
  const [error, setError] = useState("");

  // Menu controls
  const [menuSearch, setMenuSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState(""); // "", "priceAsc", "priceDesc", "rating"
  const [activeCategory, setActiveCategory] = useState("all");

  const reviewsRef = useRef(null);

  // Scroll to top on route change
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

  const handleAddToCart = (item) => {
    if (!item) return;
    const price = Number(item.price || 0);
    addToCart(
      {
        _id: item._id || String(Date.now()),
        menuItem: item._id || null, // backend requires menuItem
        name: item.name || "Unnamed Item",
        price: price > 0 ? price : 1,
        quantity: 1,
        image:
          item.image && String(item.image).trim()
            ? item.image
            : "https://via.placeholder.com/200x150",
        isVeg: item.isVeg ?? true,
        restaurant: restaurant?._id || restaurant?.id || undefined, // backend requires restaurant
        description: item.description || "",
      },
      1,
      restaurant?._id
    );
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

  // Derived states
  const myId = user?.id || user?._id;
  const alreadyReviewed = myId && reviews.some((r) => String(r?.user?._id || r?.user) === String(myId));

  const categories = useMemo(() => {
    const set = new Set();
    for (const item of menu) {
      if (item?.category) set.add(item.category);
    }
    return ["all", ...Array.from(set)];
  }, [menu]);

  // For hero chips (cuisines/tags if available)
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

    // Category
    if (activeCategory !== "all") {
      list = list.filter((i) => i.category === activeCategory);
    }

    // Veg Only
    if (vegOnly) {
      list = list.filter((i) => i.isVeg === true);
    }

    // Search by name
    const q = menuSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => i.name?.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0)); // low→high
      list.reverse(); // high→low
    }

    return list;
  }, [menu, vegOnly, menuSearch, sortBy, activeCategory]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="h-48 w-full rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <p className="text-center mt-10 text-red-500 font-medium">
        {error}
      </p>
    );

  if (!restaurant) {
    return (
      <p className="text-center mt-10 text-red-500 font-medium">
        Restaurant not found.
      </p>
    );
  }

  const bannerImg =
    (restaurant.image && restaurant.image.trim() && restaurant.image) ||
    (restaurant.banner && restaurant.banner.trim() && restaurant.banner) ||
    "https://via.placeholder.com/1200x380?text=Restaurant";

  const isOpen = restaurant?.isOpen !== false;
  const average = Number(restaurant.rating || 0).toFixed(1);

  // Small Chip
  const Chip = ({ active, onClick, children }) => (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs md:text-sm whitespace-nowrap transition ${
        active ? "bg-gray-900 text-white border-gray-900 shadow" : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="p-0 pb-20 max-w-7xl mx-auto">
      {/* Hero/Banner */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden rounded-none md:rounded-b-3xl">
        <img
          src={bannerImg}
          alt={restaurant.name || "Restaurant"}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3"
        >
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold drop-shadow">
              {restaurant.name || "Restaurant"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-white/90 text-gray-800 px-2 py-0.5 rounded-full text-sm font-semibold shadow">
                <Star className="w-4 h-4 text-yellow-500" />
                {average} {restaurant.numReviews ? `(${restaurant.numReviews})` : ""}
              </span>
              {restaurant.deliveryTime && (
                <span className="inline-flex items-center gap-1 bg-white/90 text-gray-800 px-2 py-0.5 rounded-full text-sm shadow">
                  <Clock className="w-4 h-4" /> {restaurant.deliveryTime} min
                </span>
              )}
              {restaurant.location && (
                <span className="inline-flex items-center gap-1 bg-white/90 text-gray-800 px-2 py-0.5 rounded-full text-sm shadow">
                  <MapPin className="w-4 h-4" /> {restaurant.location}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm shadow ${
                  isOpen ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>

            {/* Hero chips (cuisines/tags) */}
            {heroChips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {heroChips.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-full text-xs bg-white/90 text-gray-700 shadow"
                  >
                    #{c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold transition shadow"
            >
              <MessageSquarePlus className="w-5 h-5" />
              Write a review
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white px-4 py-2 rounded-lg font-semibold transition shadow"
            >
              <ShoppingCart className="w-5 h-5" />
              Go to Cart
            </Link>
          </div>
        </motion.div>
      </div>

      {/* About */}
      {(restaurant.description || restaurant.address) && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="px-4 md:px-6 mt-6"
        >
          {restaurant.description && (
            <p className="text-gray-700 text-base">{restaurant.description}</p>
          )}
          {restaurant.address && (
            <p className="text-gray-500 text-sm mt-1">📍 {restaurant.address}</p>
          )}
        </motion.div>
      )}

      {/* Sticky Controls */}
      <div className="px-4 md:px-6 mt-8">
        {/* Category chips (scrollable) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="sticky top-20 z-40"
        >
          <div className="bg-white/90 backdrop-blur border rounded-2xl shadow-sm px-3 py-3">
            <div className="flex items-center gap-2 mb-2 text-gray-700 text-xs md:text-sm">
              <Utensils className="w-4 h-4" />
              <span className="font-semibold">Menu Categories</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <Chip
                  key={c}
                  active={activeCategory === c}
                  onClick={() => setActiveCategory(c)}
                >
                  {c === "all" ? "All" : c}
                </Chip>
              ))}
            </div>

            {/* Secondary controls */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setVegOnly((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${
                  vegOnly ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <Leaf className="w-4 h-4" /> Veg only
              </motion.button>

              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    sortBy === "rating" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Rating
                </button>
                <button
                  onClick={() => setSortBy("priceAsc")}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    sortBy === "priceAsc" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ₹ Low
                </button>
                <button
                  onClick={() => setSortBy("priceDesc")}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    sortBy === "priceDesc" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ₹ High
                </button>
              </div>

              {/* Search in menu */}
              <div className="relative ml-auto min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search in menu..."
                  className="w-full border rounded-full pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu List */}
      <div className="px-4 md:px-6 mt-4">
        {filteredMenu.length === 0 ? (
          <motion.p variants={fadeUp} initial="hidden" animate="visible" className="text-gray-500">
            No items match your filters.
          </motion.p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {filteredMenu.map((item) => {
              const img =
                item.image && String(item.image).trim()
                  ? item.image
                  : "https://via.placeholder.com/200x150";
              const isVeg = item.isVeg ?? true;
              const available = item.available !== false;
              const rating = Number(item.rating || 0);

              return (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between border ${
                    !available ? "opacity-75" : "opacity-100"
                  }`}
                >
                  {/* Top row: veg dot + badges */}
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-sm border ${
                          isVeg ? "bg-green-600 border-green-700" : "bg-red-600 border-red-700"
                        }`}
                      />
                      <span className="text-gray-500">{isVeg ? "Veg" : "Non-Veg"}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {rating > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                          ⭐ {rating.toFixed(1)}
                        </span>
                      )}
                      {!available && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="mt-2 mb-4 h-40 overflow-hidden rounded-lg">
                    <img
                      src={img}
                      alt={item.name || "Menu Item"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.name || "Item"}
                    </h3>
                    {item.category && (
                      <p className="text-xs text-gray-500 mb-1">#{item.category}</p>
                    )}
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {item.description || "Delicious food item."}
                    </p>
                    <p className="text-gray-700 font-bold mb-2">₹{formatINR(item.price)}</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: available ? 0.97 : 1 }}
                    onClick={() => available && handleAddToCart(item)}
                    disabled={!available}
                    className={`mt-2 w-full flex items-center justify-center gap-2 font-semibold px-3 py-2 rounded-lg transition ${
                      available
                        ? "bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white shadow"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Reviews */}
      <div
        ref={reviewsRef}
        className="px-4 md:px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Ratings & Reviews
          </h2>
          {revLoading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : (
            <ReviewsList reviews={reviews} onDelete={handleReviewDelete} />
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Write a review</h3>
          {!user ? (
            <p className="text-sm text-gray-600">
              Please{" "}
              <Link to="/login" className="text-red-500 underline">
                login
              </Link>{" "}
              to write a review.
            </p>
          ) : alreadyReviewed ? (
            <p className="text-gray-600">
              You have already reviewed this restaurant.
            </p>
          ) : (
            <ReviewForm restaurantId={id} onAdded={handleReviewAdded} />
          )}
        </motion.div>
      </div>
    </div>
  );
}