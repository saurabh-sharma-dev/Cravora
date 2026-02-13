// src/components/RestaurantCard.jsx – Unique design, mobile-first
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin, ChevronRight, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { FavoritesContext } from "../context/FavoritesContext";

const MotionLink = motion(Link);

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function RestaurantCard({ restaurant }) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  if (!restaurant) return null;

  const imageUrl =
    restaurant?.image && typeof restaurant.image === "string" && restaurant.image.trim()
      ? restaurant.image
      : "https://via.placeholder.com/400x220?text=Restaurant";

  const restaurantId = restaurant?._id || restaurant?.id || null;
  const name = restaurant?.name || "Unnamed Restaurant";
  const ratingNum = Number(restaurant?.rating ?? 0);
  const numReviews = Number(restaurant?.numReviews ?? 0);
  const deliveryTime = Number(restaurant?.deliveryTime ?? 30);
  const location = restaurant?.location || "";
  const isOpen = restaurant?.isOpen !== false;
  const cuisines =
    Array.isArray(restaurant?.cuisines) && restaurant.cuisines.length
      ? restaurant.cuisines
      : Array.isArray(restaurant?.tags)
      ? restaurant.tags
      : [];
  const minOrder = Number(restaurant?.averageCost) || 200;

  const favorited = isFavorite(restaurantId);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(restaurantId);
  };

  return (
    <MotionLink
      to={restaurantId ? `/restaurants/${restaurantId}` : "#"}
      whileTap={{ scale: 0.98 }}
      className="block group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-stone-200/80 active:opacity-95"
    >
      <div className="relative overflow-hidden h-40 sm:h-44">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <motion.button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center shadow-md touch-target z-10"
          whileTap={{ scale: 0.9 }}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-5 h-5 ${favorited ? "fill-accent-500 text-accent-500" : "text-stone-400"}`}
          />
        </motion.button>

        {!isOpen ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-stone-900/90 text-white text-xs font-bold">
            CLOSED
          </div>
        ) : restaurant?.isPromoted ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-accent-500 text-white text-xs font-bold">
            Featured
          </div>
        ) : null}

        {ratingNum > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow border border-stone-200/50">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-stone-800 tabular-nums">{ratingNum.toFixed(1)}</span>
            {numReviews > 0 && (
              <span className="text-xs text-stone-500">({numReviews})</span>
            )}
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-brand-600 text-white px-2 py-1.5 rounded-lg shadow border border-brand-500/50">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-bold tabular-nums">{deliveryTime} min</span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1 truncate">
          {name}
        </h3>
        {cuisines.length > 0 && (
          <p className="text-sm text-stone-500 mb-2 truncate">
            {cuisines.slice(0, 3).join(", ")}
            {cuisines.length > 3 && ` +${cuisines.length - 3}`}
          </p>
        )}
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-500 font-medium">
              Min order ₹{formatINR(minOrder)}
            </span>
            {ratingNum >= 4.5 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                <Award className="w-3 h-3" /> Top rated
              </span>
            )}
          </div>
          <span className="flex items-center gap-0.5 text-brand-600 text-sm font-semibold group-hover:gap-1 transition-all">
            View menu
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </MotionLink>
  );
}
