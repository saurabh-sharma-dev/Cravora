// src/api/adminApi.js
import axios from "axios";

// Base URL (Vite)
const RAW_BASE_URL =
  (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000").toString();

// Ensure no trailing slash
const ROOT_URL = RAW_BASE_URL.replace(/\/+$/, "");

// Final base URL for admin endpoints
const BASE_URL = `${ROOT_URL}/api/admin`;

// Safe localStorage access (avoids errors if window not available)
const storage = typeof window !== "undefined" ? window.localStorage : null;

const getToken = () => {
  if (!storage) return null;
  return storage.getItem("adminToken") || storage.getItem("token");
};

const setAdminSession = (token, admin) => {
  if (!storage) return;
  if (token) storage.setItem("adminToken", token);
  if (admin) storage.setItem("admin", JSON.stringify(admin));
};

const clearAdminSession = () => {
  if (!storage) return;
  storage.removeItem("adminToken");
  storage.removeItem("admin");
};

// Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 20000,
});

// Attach admin token automatically
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uniform error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      "Request failed";

    // Auto-clear session on unauthorized
    if (status === 401) {
      clearAdminSession();
    }
    return Promise.reject(new Error(msg));
  }
);

// Admin auth
export const adminLogin = async (formData) => {
  const { data } = await API.post("/login", formData);
  if (data?.token) {
    setAdminSession(data.token, data.admin);
  }
  return data;
};

// Admin restaurant endpoints
export const getRestaurants = async () => {
  const { data } = await API.get("/restaurants");
  return data;
};

export const addRestaurant = async (payload) => {
  const { data } = await API.post("/restaurants", payload);
  return data;
};

export const addMenuItem = async (restaurantId, payload) => {
  const { data } = await API.post(`/restaurants/${restaurantId}/menu`, payload);
  return data;
};

// Optional deletes
export const deleteRestaurant = async (restaurantId) => {
  const { data } = await API.delete(`/restaurants/${restaurantId}`);
  return data;
};

export const deleteMenuItem = async (menuItemId) => {
  const { data } = await API.delete(`/menu/${menuItemId}`);
  return data;
};

// Utilities
export const logoutAdmin = () => clearAdminSession();

export default API;