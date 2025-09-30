// src/api/reviewsApi.js
import API from "../api"; // expects baseURL like `${VITE_API_BASE_URL}/api` and auth token interceptor

const base = "/reviews";

const getErrMsg = (err) =>
  err?.response?.data?.msg ||
  err?.response?.data?.message ||
  err?.message ||
  "Request failed";

export const addReview = async (restaurantId, { rating, comment } = {}) => {
  try {
    if (!restaurantId) throw new Error("restaurantId is required");

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const payload = {
      rating: ratingNum,
      ...(typeof comment === "string" && comment.trim() ? { comment: comment.trim() } : {}),
    };

    const { data } = await API.post(`${base}/${encodeURIComponent(restaurantId)}`, payload);
    return data?.review;
  } catch (err) {
    throw new Error(getErrMsg(err));
  }
};

export const getReviews = async (restaurantId) => {
  try {
    if (!restaurantId) throw new Error("restaurantId is required");
    const { data } = await API.get(`${base}/${encodeURIComponent(restaurantId)}`);
    return Array.isArray(data?.reviews) ? data.reviews : [];
  } catch (err) {
    throw new Error(getErrMsg(err));
  }
};

export const deleteReview = async (reviewId) => {
  try {
    if (!reviewId) throw new Error("reviewId is required");
    const { data } = await API.delete(`${base}/${encodeURIComponent(reviewId)}`);
    return data;
  } catch (err) {
    throw new Error(getErrMsg(err));
  }
};

export default {
  addReview,
  getReviews,
  deleteReview,
};