// src/api/reviewsApi.js
import API from "../api";

export const addReview = async (restaurantId, { rating, comment }) => {
  const { data } = await API.post(`/reviews/${restaurantId}`, { rating, comment });
  return data.review;
};

export const getReviews = async (restaurantId) => {
  const { data } = await API.get(`/reviews/${restaurantId}`);
  return data.reviews || [];
};

export const deleteReview = async (reviewId) => {
  const { data } = await API.delete(`/reviews/${reviewId}`);
  return data;
};