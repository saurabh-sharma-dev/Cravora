// src/components/StarRating.jsx
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * StarRating
 * Props:
 * - value: number (0..5)
 * - onChange: function(newValue: number)
 * - readOnly: boolean
 * - size: number (icon size)
 * - max: number (default 5)
 * - className: string (optional)
 */
export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 22,
  max = 5,
  className = "",
}) {
  const [hover, setHover] = useState(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const displayValue = hover ?? value;

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
      setRating(Math.max(1, (value || 0) - 1));
    } else if (key === "home") {
      e.preventDefault();
      setRating(1);
    } else if (key === "end") {
      e.preventDefault();
      setRating(max);
    } else if (key === "0" || key === "delete" || key === "backspace") {
      e.preventDefault();
      setRating(0);
    } else if (key === " " || key === "enter") {
      // keep current
      e.preventDefault();
      setRating(displayValue || 0);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      aria-readonly={readOnly}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={onKeyDown}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {stars.map((s) => {
        const active = s <= displayValue;
        const interactive = !readOnly;
        return (
          <motion.button
            key={s}
            type="button"
            role="radio"
            aria-checked={s === value}
            aria-label={`Rate ${s}`}
            title={`Rate ${s}`}
            disabled={!interactive}
            onClick={() => interactive && setRating(s)}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(null)}
            whileHover={interactive ? { scale: 1.12, rotate: 1 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            className={`relative grid place-items-center rounded-md transition ${
              interactive ? "cursor-pointer" : "cursor-default"
            }`}
            style={{ lineHeight: 0 }}
          >
            {/* Soft glow for active stars */}
            <motion.span
              className="absolute inset-0 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 0.3 : 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background:
                  "radial-gradient(12px 12px at 50% 50%, rgba(255, 204, 0, 0.35), transparent)",
              }}
            />
            <Star
              size={size}
              className={`drop-shadow-sm ${
                active ? "text-yellow-500 fill-yellow-400" : "text-gray-300"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}