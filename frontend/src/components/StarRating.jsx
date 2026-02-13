// src/components/StarRating.jsx (Enhanced Version)
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "medium",
  max = 5,
  showLabel = false,
  showCount = false,
  count = 0,
  variant = "default", // 'default' | 'gradient' | 'outlined'
  className = "",
}) {
  const [hover, setHover] = useState(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const displayValue = hover ?? value;

  // Size configurations
  const sizeConfig = {
    small: { icon: 14, gap: "gap-0.5", padding: "p-0.5", text: "text-xs" },
    medium: { icon: 20, gap: "gap-1", padding: "p-1", text: "text-sm" },
    large: { icon: 28, gap: "gap-1.5", padding: "p-1.5", text: "text-base" },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Rating labels with emojis
  const labels = {
    0: { text: "No rating", emoji: "⭐", color: "text-gray-500" },
    1: { text: "Poor", emoji: "😞", color: "text-red-600" },
    2: { text: "Fair", emoji: "😕", color: "text-orange-600" },
    3: { text: "Good", emoji: "😐", color: "text-yellow-600" },
    4: { text: "Very Good", emoji: "😊", color: "text-lime-600" },
    5: { text: "Excellent", emoji: "🤩", color: "text-emerald-600" },
  };

  const currentLabel = labels[Math.round(displayValue)] || labels[0];

  // Variant styles
  const variantStyles = {
    default: {
      active: "text-amber-400 fill-amber-400",
      inactive: "text-gray-300",
      hover: "hover:text-amber-300",
    },
    gradient: {
      active: "text-amber-500 fill-amber-400",
      inactive: "text-gray-300",
      hover: "hover:text-amber-400",
    },
    outlined: {
      active: "text-amber-500 fill-none stroke-2",
      inactive: "text-gray-300 fill-none",
      hover: "hover:text-amber-400",
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  const setRating = useCallback(
    (v) => {
      if (readOnly) return;
      if (typeof onChange === "function") onChange(v);
    },
    [readOnly, onChange]
  );

  const onKeyDown = (e) => {
    if (readOnly) return;
    const key = e.key.toLowerCase();

    if (["arrowright", "arrowup"].includes(key)) {
      e.preventDefault();
      setRating(Math.min(max, (value || 0) + 1));
    } else if (["arrowleft", "arrowdown"].includes(key)) {
      e.preventDefault();
      setRating(Math.max(0, (value || 0) - 1));
    } else if (key === "home") {
      e.preventDefault();
      setRating(1);
    } else if (key === "end") {
      e.preventDefault();
      setRating(max);
    } else if (["0", "delete", "backspace"].includes(key)) {
      e.preventDefault();
      setRating(0);
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Stars Container */}
      <div
        role="radiogroup"
        aria-label="Rating"
        aria-readonly={readOnly}
        tabIndex={readOnly ? -1 : 0}
        onKeyDown={onKeyDown}
        className={`inline-flex items-center ${config.gap} ${
          readOnly ? "" : "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-lg transition-all"
        } ${config.padding}`}
      >
        {stars.map((starNum) => {
          const isActive = starNum <= displayValue;
          const isHovered = starNum <= (hover ?? 0);
          const interactive = !readOnly;

          return (
            <motion.button
              key={starNum}
              type="button"
              role="radio"
              aria-checked={starNum === value}
              aria-label={`${starNum} star${starNum > 1 ? "s" : ""}`}
              disabled={!interactive}
              onClick={() => interactive && setRating(starNum)}
              onMouseEnter={() => interactive && setHover(starNum)}
              onMouseLeave={() => interactive && setHover(null)}
              whileHover={interactive ? { scale: 1.2, rotate: 10 } : {}}
              whileTap={interactive ? { scale: 0.85 } : {}}
              className={`relative focus:outline-none ${
                interactive ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {/* Glow effect */}
              <AnimatePresence>
                {isActive && interactive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 -z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-40" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Star Icon */}
              <Star
                size={config.icon}
                className={`transition-all duration-200 ${
                  isActive
                    ? isHovered
                      ? `${styles.active} drop-shadow-lg scale-110`
                      : styles.active
                    : interactive
                    ? `${styles.inactive} ${styles.hover}`
                    : styles.inactive
                }`}
                strokeWidth={variant === "outlined" ? 2.5 : 2}
              />

              {/* Sparkle effect on hover */}
              {isHovered && interactive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Label & Count */}
      {(showLabel || showCount) && (
        <div className="flex items-center gap-2">
          {showLabel && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-lg">{currentLabel.emoji}</span>
              <div className="flex flex-col">
                <span className={`${config.text} font-bold ${currentLabel.color}`}>
                  {displayValue > 0 ? displayValue.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-gray-500">{currentLabel.text}</span>
              </div>
            </motion.div>
          )}

          {showCount && count > 0 && (
            <span className="text-xs text-gray-500">
              ({count.toLocaleString()} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>
      )}
    </div>
  );
}