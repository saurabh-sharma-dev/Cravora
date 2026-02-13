// src/components/ReviewForm.jsx
import React, { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Send, MessageSquare, Award, Sparkles } from "lucide-react";
import StarRating from "./StarRating";
import { AuthContext } from "../context/AuthContext";
import { addReview } from "../api/reviewsApi";

const MAX_LEN = 500;

export default function ReviewForm({ restaurantId, onAdded }) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const ratingConfig = useMemo(() => {
    const configs = {
      1: { label: "Terrible", color: "text-red-600", bg: "bg-red-50", icon: "😞" },
      2: { label: "Poor", color: "text-orange-600", bg: "bg-orange-50", icon: "😕" },
      3: { label: "Okay", color: "text-yellow-600", bg: "bg-yellow-50", icon: "😐" },
      4: { label: "Good", color: "text-green-600", bg: "bg-green-50", icon: "😊" },
      5: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🤩" },
    };
    return configs[rating] || { label: "Select Rating", color: "text-gray-500", bg: "bg-gray-50", icon: "⭐" };
  }, [rating]);

  // Not logged in state
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Share Your Experience</h4>
            <p className="text-sm text-gray-600">
              Please <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold underline">login</Link> to write a review
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!rating || rating < 1 || rating > 5) {
      setMsg("Please select a rating between 1 and 5.");
      return;
    }
    if (comment.length > MAX_LEN) {
      setMsg(`Comment is too long (max ${MAX_LEN} characters).`);
      return;
    }

    setLoading(true);
    try {
      const review = await addReview(restaurantId, {
        rating,
        comment: comment.trim() || undefined,
      });
      setMsg("✅ Review added successfully!");
      setRating(0);
      setComment("");
      onAdded?.(review);
    } catch (err) {
      const apiMsg = err?.message || "Failed to add review";
      const friendly = apiMsg.includes("already reviewed")
        ? "You've already reviewed this restaurant."
        : apiMsg;
      setMsg(`❌ ${friendly}`);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = msg.startsWith("✅");
  const canSubmit = !loading && rating >= 1 && rating <= 5 && comment.length <= MAX_LEN;

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg"
    >
      {/* Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Write a Review</h3>
            <p className="text-sm text-white/90">Share your dining experience</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Rating Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Your Rating <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-center justify-between gap-4">
            <StarRating value={rating} onChange={setRating} size="large" />
            
            {rating > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${ratingConfig.bg} border border-gray-200`}
              >
                <span className="text-xl">{ratingConfig.icon}</span>
                <div>
                  <div className={`font-bold ${ratingConfig.color}`}>{ratingConfig.label}</div>
                  <div className="text-xs text-gray-500">{rating}/5 stars</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Your Review <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience... What did you love? What could be improved?"
              className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 placeholder-gray-400 text-gray-800 transition-all resize-none"
              rows={5}
              maxLength={MAX_LEN}
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-md ${
                  comment.length > MAX_LEN * 0.9
                    ? "bg-red-100 text-red-600"
                    : comment.length > MAX_LEN * 0.7
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {comment.length}/{MAX_LEN}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Be honest and respectful. Your review helps others make better choices.
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                isSuccess
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
              role="alert"
              aria-live="polite"
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{msg.replace(/^(✅|❌)\s*/, "")}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <motion.button
            type="submit"
            whileHover={{ scale: canSubmit ? 1.02 : 1 }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            disabled={!canSubmit}
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
              ${
                canSubmit
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
            aria-disabled={!canSubmit}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Review
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}