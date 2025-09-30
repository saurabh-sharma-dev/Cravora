// src/components/ReviewForm.jsx
import React, { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
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

  const ratingLabel = useMemo(() => {
    if (rating === 1) return "Terrible";
    if (rating === 2) return "Poor";
    if (rating === 3) return "Okay";
    if (rating === 4) return "Good";
    if (rating === 5) return "Excellent";
    return "Select";
  }, [rating]);

  if (!user) {
    return (
      <p className="text-sm text-gray-600">
        Please <span className="text-red-500 font-medium">login</span> to write a review.
      </p>
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
      setMsg("✅ Review added!");
      setRating(0);
      setComment("");
      onAdded?.(review);
    } catch (err) {
      // reviewsApi throws Error with message string
      const apiMsg = err?.message || "Failed to add review";
      // Normalize duplicate review message for a friendlier UI
      const friendly =
        apiMsg.includes("already reviewed")
          ? "You’ve already reviewed this restaurant."
          : apiMsg;
      setMsg(`❌ ${friendly}`);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = msg.startsWith("✅");
  const canSubmit =
    !loading && rating >= 1 && rating <= 5 && comment.length <= MAX_LEN;

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative space-y-4 bg-white p-5 rounded-2xl border shadow-sm"
    >
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">Your Rating</span>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} />
          <span className="text-sm text-gray-600 w-20 text-right">{ratingLabel}</span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-gray-800"
          rows={4}
          maxLength={MAX_LEN}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            Be respectful. Max {MAX_LEN} characters.
          </span>
          <span
            className={`text-xs ${
              comment.length > MAX_LEN * 0.9 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {comment.length}/{MAX_LEN}
          </span>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isSuccess
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
            role="alert"
            aria-live="polite"
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="leading-snug">{msg.replace(/^❌\s*/, "")}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <motion.button
          type="submit"
          whileHover={{ scale: canSubmit ? 1.02 : 1 }}
          whileTap={{ scale: canSubmit ? 0.97 : 1 }}
          disabled={!canSubmit}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white shadow-md transition ${
            canSubmit ? "bg-gray-900 hover:bg-black" : "bg-gray-400 cursor-not-allowed"
          }`}
          aria-disabled={!canSubmit}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Review
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}