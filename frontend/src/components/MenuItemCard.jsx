// src/components/MenuItemCard.jsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame } from "lucide-react";

/**
 * MenuItemCard
 * Props:
 * - item: {
 *     _id, name, description, price, image, isVeg, available, rating,
 *     restaurant (ObjectId string or populated object),
 *     category?, spicyLevel? ("mild" | "medium" | "hot")
 *   }
 * - addToCart: function(cartItem)
 * - restaurantId: optional (fallback if item.restaurant is missing)
 */
const MenuItemCard = ({ item, addToCart, restaurantId }) => {
  if (!item) return null;

  const imageUrl =
    item?.image && typeof item.image === "string" && item.image.trim()
      ? item.image
      : "https://via.placeholder.com/400x260?text=Dish";

  const name = item?.name || "Delicious Dish 🍴";
  const description = item?.description || "A tasty treat awaits you!";
  const priceNum = Number(item?.price ?? 0);
  const ratingNum = Number(item?.rating ?? 0);
  const isVeg = item?.isVeg ?? true;
  const available = item?.available !== false;

  // Resolve restaurant id from item or prop
  const resolvedRestaurantId =
    (typeof item?.restaurant === "object" ? item.restaurant?._id : item?.restaurant) ||
    restaurantId ||
    null;

  const hasMenuItemId = Boolean(item?._id);

  const canAdd = Boolean(
    available && addToCart && hasMenuItemId && resolvedRestaurantId && priceNum > 0
  );

  const disabledReason = useMemo(() => {
    if (!available) return "Unavailable";
    if (!hasMenuItemId) return "Missing menu id";
    if (!resolvedRestaurantId) return "Missing restaurant";
    if (!(priceNum > 0)) return "Invalid price";
    if (!addToCart) return "Action unavailable";
    return "";
  }, [available, hasMenuItemId, resolvedRestaurantId, priceNum, addToCart]);

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart({
      _id: item._id, // keep original id for cart keying
      menuItem: item._id, // REQUIRED by backend
      restaurant: resolvedRestaurantId, // REQUIRED by backend
      name,
      price: priceNum > 0 ? priceNum : 1,
      quantity: 1,
      image: imageUrl,
      isVeg,
      description,
    });
  };

  const spicyTone = item?.spicyLevel || "medium";
  const spicyBadge =
    spicyTone === "hot"
      ? "text-red-600 bg-red-50 border-red-200"
      : spicyTone === "mild"
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-orange-600 bg-orange-50 border-orange-200";

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col transition-all ${
        !available ? "opacity-80" : "opacity-100"
      }`}
    >
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {/* Veg / Non-Veg dot */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
            isVeg ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          {isVeg ? "Veg" : "Non-Veg"}
        </span>

        {/* Spicy badge (optional) */}
        {item?.spicyLevel && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${spicyBadge}`}
          >
            <Flame className="w-3 h-3" /> {spicyTone}
          </span>
        )}
      </div>

      {/* Unavailable badge */}
      <AnimatePresence>
        {!available && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800/90 text-white shadow-sm"
          >
            Unavailable
          </motion.span>
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500"
          whileHover={{ scale: 1.08 }}
        />

        {/* Gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Hover Add CTA over image (mobile-friendly stays below as well) */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!canAdd}
          aria-disabled={!canAdd}
          title={!canAdd ? disabledReason : "Add to Cart"}
          className={`hidden md:flex absolute bottom-3 right-3 z-10 items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-lg transition
            ${
              canAdd
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ scale: canAdd ? 1.03 : 1 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Add
        </motion.button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Title + rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-bold text-gray-900 truncate" title={name}>
            {name}
          </h3>
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            {ratingNum > 0 ? ratingNum.toFixed(1) : "New"}
          </span>
        </div>

        {/* Category (optional) */}
        {item?.category && (
          <p className="text-[11px] text-gray-500">#{item.category}</p>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>

        {/* Price + Add to Cart */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-green-600 font-extrabold text-lg">
            {priceNum > 0 ? `₹${priceNum}` : "₹—"}
          </span>

          {/* Primary Add CTA (mobile) */}
          <motion.button
            onClick={handleAddToCart}
            disabled={!canAdd}
            aria-disabled={!canAdd}
            whileHover={{ scale: canAdd ? 1.05 : 1 }}
            whileTap={{ scale: canAdd ? 0.95 : 1 }}
            title={!canAdd ? disabledReason : "Add to Cart"}
            className={`md:hidden inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold shadow-md transition
              ${
                canAdd
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {available ? "Add" : "Unavailable"}
          </motion.button>

          {/* Primary Add CTA (desktop) */}
          <motion.button
            onClick={handleAddToCart}
            disabled={!canAdd}
            aria-disabled={!canAdd}
            whileHover={{ scale: canAdd ? 1.05 : 1 }}
            whileTap={{ scale: canAdd ? 0.95 : 1 }}
            title={!canAdd ? disabledReason : "Add to Cart"}
            className={`hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold shadow-md transition
              ${
                canAdd
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {available ? "Add to Cart" : "Unavailable"}
          </motion.button>
        </div>

        {/* Helper hint */}
        {!available ? null : !resolvedRestaurantId || !hasMenuItemId ? (
          <p className="text-[11px] text-gray-500 mt-1">
            Tip: Open the restaurant’s page and add this item from there.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
};

export default MenuItemCard;