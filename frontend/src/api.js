// src/api/index.js
import axios from "axios";

// Remove trailing slashes
const normalize = (u) => String(u || "").replace(/\/+$/, "");

// Decide base URL:
// 1) If VITE_API_URL is set, treat it as full API URL (do NOT append /api).
// 2) Else use VITE_API_BASE_URL (root) and append /api.
// 3) Else in DEV fallback to http://localhost:5000 (append /api).
// 4) Else fallback to current origin (append /api).
const env = import.meta?.env || {};
const explicitAPI = env.VITE_API_URL ? normalize(env.VITE_API_URL) : null;

const root =
  normalize(
    env.VITE_API_BASE_URL ||
      env.VITE_BACKEND_URL ||
      (env.DEV ? "http://localhost:5000" : (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000"))
  );

export const API_BASE_URL = explicitAPI || `${root}/api`;

// SSR-safe localStorage
const storage = typeof window !== "undefined" ? window.localStorage : null;

// Optional global 401 handler (you can set from AuthProvider)
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = typeof fn === "function" ? fn : null;
};

// Helpers to set/clear default Authorization header
export const setAuthToken = (token) => {
  if (token && API?.defaults?.headers?.common) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};
export const clearAuthToken = () => {
  if (API?.defaults?.headers?.common?.Authorization) {
    delete API.defaults.headers.common.Authorization;
  }
};

// Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 20000,
  // withCredentials: false,
});

// Attach JWT token (user or admin) automatically
API.interceptors.request.use(
  (config) => {
    const token =
      (storage && storage.getItem("token")) ||
      (storage && storage.getItem("adminToken"));
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const msg = data?.msg || data?.message || error?.message || "Request failed";
    if (msg) error.message = msg;

    if (status === 401 && typeof onUnauthorized === "function") {
      try {
        onUnauthorized(error);
      } catch {}
    }

    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn("API Error:", {
        url: error?.config?.url,
        status,
        msg,
      });
    }
    return Promise.reject(error);
  }
);

export default API;