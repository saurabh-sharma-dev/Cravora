// src/components/MenuItemCard.jsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, Plus, ShoppingCart } from "lucide-react";

/**
 * MenuItemCard
 * Props:
 * - item: { _id, name, description, price, image, isVeg, available, rating, restaurant, category?, spicyLevel? }
 * - addToCart: function(cartItem)
 * - restaurantId: optional fallback
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

  // Resolve restaurant id
  const resolvedRestaurantId =
    (typeof item?.restaurant === "object" ? item.restaurant?._id : item?.restaurant) ||
    restaurantId ||
    null;

  const hasMenuItemId = Boolean(item?._id);

  const canAdd = Boolean(
    available && addToCart && hasMenuItemId && resolvedRestaurantId && priceNum > 0
  );

  const disabledReason = useMemo(() => {
    if (!available) return "Currently unavailable";
    if (!hasMenuItemId) return "Missing menu id";
    if (!resolvedRestaurantId) return "Missing restaurant";
    if (!(priceNum > 0)) return "Invalid price";
    if (!addToCart) return "Action unavailable";
    return "";
  }, [available, hasMenuItemId, resolvedRestaurantId, priceNum, addToCart]);

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart({
      _id: item._id,
      menuItem: item._id,
      restaurant: resolvedRestaurantId,
      name,
      price: priceNum > 0 ? priceNum : 1,
      quantity: 1,
      image: imageUrl,
      isVeg,
      description,
    });
  };

  const spicyConfig = {
    hot: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Spicy" },
    medium: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Medium" },
    mild: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Mild" },
  };

  const spicy = spicyConfig[item?.spicyLevel] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-stone-200/80 transition-all ${
        !available ? "opacity-70" : ""
      }`}
    >
      {/* Image Section */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-surface-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top Left: Veg/Non-Veg Indicator */}
        <div className="absolute top-3 left-3">
          <div
            className={`w-5 h-5 rounded-sm flex items-center justify-center ${
              isVeg ? "bg-white border-2 border-green-600" : "bg-white border-2 border-red-600"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
          </div>
        </div>

        {/* Top Right: Rating */}
        {ratingNum > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-stone-800 tabular-nums">{ratingNum.toFixed(1)}</span>
          </div>
        )}

        {/* Bottom Left: Spicy Level */}
        {spicy && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1 ${spicy.bg} ${spicy.border} border px-2 py-1 rounded-lg shadow-md`}>
            <Flame className={`w-3.5 h-3.5 ${spicy.color}`} />
            <span className={`text-xs font-semibold ${spicy.color}`}>{spicy.label}</span>
          </div>
        )}

        {/* Unavailable Overlay */}
        {!available && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white/95 text-stone-800 font-bold text-sm shadow-card">
              Not Available
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category Tag */}
        {item?.category && (
          <span className="inline-block px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
            {item.category}
          </span>
        )}

        <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors" title={name}>
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-stone-500 mb-3 line-clamp-2" title={description}>
          {description}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between gap-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">Price</span>
            <span className="text-lg font-bold text-stone-800 tabular-nums">
              ₹{priceNum > 0 ? priceNum : "—"}
            </span>
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={!canAdd}
            whileTap={{ scale: canAdd ? 0.96 : 1 }}
            title={!canAdd ? disabledReason : "Add to cart"}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-card transition-all min-h-touch touch-target
              ${canAdd ? "bg-brand-600 hover:bg-brand-500 text-white" : "bg-surface-200 text-stone-400 cursor-not-allowed"}
            `}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;