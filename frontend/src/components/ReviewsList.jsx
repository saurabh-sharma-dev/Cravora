// src/components/ReviewsList.jsx
import React, { useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageSquareText, Star, Calendar, User, ThumbsUp, Award } from "lucide-react";
import StarRating from "./StarRating";
import { AuthContext } from "../context/AuthContext";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
    },
  },
};

// Helper functions
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function getInitials(name = "User") {
  const words = String(name).trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return String(name).trim()[0]?.toUpperCase() || "U";
}

function getRatingColor(rating) {
  if (rating >= 4.5) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (rating >= 4) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  if (rating >= 3) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
  if (rating >= 2) return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

// Empty State Component
const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-8 md:p-12 text-center"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
          <MessageSquareText className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Be the first to share your experience and help others make informed decisions!
        </p>
      </div>
    </motion.div>
  );
};

// Review Card Component
const ReviewCard = ({ review, canDelete, onDelete }) => {
  const rating = Number(review?.rating || 0);
  const ratingColors = getRatingColor(rating);
  const avatar = review?.user?.avatar;
  const name = review?.user?.name || "Anonymous User";
  const created = review?.createdAt;
  const comment = review?.comment;

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

      {/* Card Content */}
      <div className="p-5">
        {/* Header: Avatar, Name, Rating */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {getInitials(name)}
                </div>
              )}
              {/* Top Reviewer Badge */}
              {rating >= 4.5 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-sm">
                  <Award className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Name & Date */}
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-gray-900 truncate" title={name}>
                {name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatDate(created)}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete?.(review._id)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all shadow-sm hover:shadow"
                title="Delete review"
                aria-label="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Rating Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StarRating value={rating} readOnly size="small" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${ratingColors.bg} ${ratingColors.text} border ${ratingColors.border}`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-bold">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Helpful button (placeholder) */}
          {/* <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-xs font-medium text-gray-600">
            <ThumbsUp className="w-3 h-3" />
            Helpful
          </button> */}
        </div>

        {/* Comment */}
        {comment && (
          <div className="relative">
            <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-purple-200 to-pink-200 rounded-full" />
            <p className="text-sm text-gray-700 leading-relaxed pl-3 whitespace-pre-line">
              {comment}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Component
export default function ReviewsList({ reviews = [], onDelete }) {
  const { user } = useContext(AuthContext);
  const myId = user?.id || user?._id;

  // Sort reviews: newest first
  const sortedReviews = useMemo(() => {
    return [...(reviews || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [reviews]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!reviews.length) return null;

    const total = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total;
    const distribution = [5, 4, 3, 2, 1].map(star => 
      reviews.filter(r => Math.round(Number(r.rating || 0)) === star).length
    );

    return { total, avgRating, distribution };
  }, [reviews]);

  // Empty state
  if (!sortedReviews.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-xl bg-white/80 backdrop-blur-sm border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="text-3xl font-extrabold text-gray-900">
                  {stats.avgRating.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {stats.total} {stats.total === 1 ? "Review" : "Reviews"}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const count = stats.distribution[idx];
                const percentage = (count / stats.total) * 100;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-8">
                      {star} <Star className="w-2.5 h-2.5 inline fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
            {sortedReviews.length}
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {sortedReviews.map((review) => {
              const userId = review?.user?._id || review?.user;
              const canDelete = myId && userId && String(myId) === String(userId);

              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  canDelete={canDelete}
                  onDelete={onDelete}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}