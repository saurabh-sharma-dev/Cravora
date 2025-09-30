// src/components/RestaurantCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Fix for Framer Motion deprecation: motion(Link) -> motion.create(Link)
const MotionLink = motion.create ? motion.create(Link) : motion(Link);

export default function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const imageUrl =
    restaurant?.image && typeof restaurant.image === "string" && restaurant.image.trim()
      ? restaurant.image
      : "https://via.placeholder.com/400x200?text=Restaurant";

  const restaurantId = restaurant?._id || restaurant?.id || null;
  const name = restaurant?.name || "Unnamed Restaurant";
  const ratingNum = Number(restaurant?.rating ?? 0);
  const numReviews = Number(restaurant?.numReviews ?? 0);
  const deliveryTime = Number(restaurant?.deliveryTime ?? 30);
  const location = restaurant?.location || "";
  const isOpen = restaurant?.isOpen !== false; // default open unless explicitly false
  const cuisines =
    Array.isArray(restaurant?.cuisines) && restaurant.cuisines.length
      ? restaurant.cuisines
      : Array.isArray(restaurant?.tags)
      ? restaurant.tags
      : [];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="relative group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 max-w-[280px] mx-auto overflow-hidden"
    >
      {/* Restaurant Image with overlay on hover */}
      <div className="relative overflow-hidden h-40">
        <motion.img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500"
          whileHover={{ scale: 1.1 }}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

        {/* Open/Closed badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
            isOpen ? "bg-green-600 text-white" : "bg-gray-700 text-white"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        {/* Name */}
        <h3 className="text-lg font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-purple-500">
          {name}
        </h3>

        {/* Cuisine badges */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {cuisines.slice(0, 4).map((cuisine, idx) => (
              <span
                key={`${cuisine}-${idx}`}
                className="bg-pink-50 text-pink-600 text-[11px] px-2 py-0.5 rounded-full font-medium"
              >
                {cuisine}
              </span>
            ))}
            {cuisines.length > 4 && (
              <span className="text-[11px] text-gray-500">+{cuisines.length - 4}</span>
            )}
          </div>
        )}

        {/* Rating + Delivery + Location */}
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
            <Star className="w-3 h-3 text-yellow-500" />
            {ratingNum > 0 ? ratingNum.toFixed(1) : "New"}
            {numReviews > 0 ? ` (${numReviews})` : ""}
          </span>
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> {deliveryTime} min
          </span>
          {location && (
            <span className="flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" /> {location}
            </span>
          )}
        </div>

        {/* Address */}
        {restaurant?.address && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            📍 {restaurant.address}
          </p>
        )}

        {/* View Menu Button */}
        {restaurantId ? (
          <MotionLink
            to={`/restaurants/${restaurantId}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 w-full text-center bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white font-semibold text-sm py-2 rounded-xl shadow hover:shadow-lg relative overflow-hidden transition-all"
          >
            <span className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-30 transition-all duration-500"></span>
            <span className="relative z-10">View Menu →</span>
          </MotionLink>
        ) : (
          <span className="mt-3 inline-block w-full text-center text-gray-400 font-medium px-4 py-2 rounded-xl border border-gray-300 text-sm">
            No Menu
          </span>
        )}
      </div>
    </motion.div>
  );
}