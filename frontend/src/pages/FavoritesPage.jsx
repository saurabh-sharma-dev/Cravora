// src/pages/FavoritesPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Clock, Star, ChefHat } from "lucide-react";
import API from "../api";
import RestaurantCard from "../components/RestaurantCard";
import { FavoritesContext } from "../context/FavoritesContext";
import SkeletonCard from "../components/SkeletonCard";
import PageContainer from "../components/PageContainer";

export default function FavoritesPage() {
  const { favoriteIds } = useContext(FavoritesContext);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!favoriteIds?.length) {
      setRestaurants([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all(
      favoriteIds.map((id) =>
        API.get(`/restaurants/${id}`).then((res) => res.data?.restaurant || null)
      )
    )
      .then((list) => {
        if (cancelled) return;
        setRestaurants(list.filter(Boolean));
      })
      .catch((err) => {
        if (!cancelled) setError("Failed to load some restaurants.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [favoriteIds?.length, favoriteIds?.join(",")]);

  if (loading) {
    return (
      <div className="min-h-full bg-surface-50">
        <PageContainer className="py-8">
          <div className="h-10 w-48 bg-surface-200 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-full bg-surface-50 flex items-center justify-center px-4"
      >
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition shadow-card min-h-touch touch-target"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!favoriteIds?.length || restaurants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-full bg-surface-50 flex items-center justify-center px-4 py-16"
      >
        <div className="max-w-md text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-brand-100 flex items-center justify-center border border-brand-200"
          >
            <Heart className="w-14 h-14 text-brand-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">No favorites yet</h2>
          <p className="text-stone-500 mb-8">
            Tap the heart on any restaurant to add it here. Your favorite spots will show up for quick reordering.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-card hover:shadow-card-hover transition min-h-touch touch-target"
          >
            <ChefHat size={20} />
            Explore Restaurants
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-full bg-surface-50">
      <PageContainer className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-800 flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-card">
              <Heart className="w-6 h-6" fill="currentColor" />
            </span>
            Your Favorites
          </h1>
          <p className="text-stone-500 mt-2">
            {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} saved
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05, delayChildren: 0.1 },
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {restaurants.map((restaurant) => (
              <motion.div
                key={restaurant._id || restaurant.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </PageContainer>
    </div>
  );
}
