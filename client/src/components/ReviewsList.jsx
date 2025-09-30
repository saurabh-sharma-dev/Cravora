// src/components/ReviewsList.jsx
import React, { useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageSquareText } from "lucide-react";
import StarRating from "./StarRating";
import { AuthContext } from "../context/AuthContext";

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

function getInitial(name = "U") {
  const ch = String(name || "U").trim()[0] || "U";
  return ch.toUpperCase();
}

export default function ReviewsList({ reviews = [], onDelete }) {
  const { user } = useContext(AuthContext);
  const myId = user?.id || user?._id;

  const sorted = useMemo(() => {
    // newest first
    return [...(reviews || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [reviews]);

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <p className="text-gray-600 text-sm">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {sorted.map((r) => {
          const uid = r?.user?._id || r?.user;
          const canDelete = myId && uid && String(myId) === String(uid);
          const avatar = r?.user?.avatar;
          const name = r?.user?.name || "User";
          const created = r?.createdAt;

          return (
            <motion.div
              key={r._id}
              variants={itemVariants}
              layout
              className="relative rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Decorative top gradient */}
              <div className="absolute left-0 right-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-500" />

              <div className="flex items-start justify-between gap-3">
                {/* Avatar + Name + Date */}
                <div className="flex items-start gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold border">
                      {getInitial(name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]" title={name}>
                        {name}
                      </p>
                      {/* Numeric rating chip */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                        ⭐ {Number(r?.rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{formatDate(created)}</p>
                  </div>
                </div>

                {/* Stars + Delete */}
                <div className="flex items-center gap-2">
                  <StarRating value={Number(r.rating || 0)} readOnly size={18} />
                  {canDelete && (
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete?.(r._id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded transition"
                      title="Delete review"
                      aria-label="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Comment */}
              {r.comment && (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {r.comment}
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}