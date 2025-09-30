// src/api/index.js
import axios from "axios";

// Resolve base URL from env (Vite) with sensible defaults
const ROOT =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

// Trim trailing slashes
const trimmed = ROOT.replace(/\/+$/, "");

// If ROOT already contains "/api" at the end or like "/api/", use as-is.
// Otherwise, append "/api"
const baseURL = /\/api(\/)?$/.test(trimmed) ? trimmed : `${trimmed}/api`;

// Create axios instance
const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT token (user or admin) automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
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
    const msg = data?.msg || data?.message || error.message || "Request failed";
    console.error("API Error:", msg);

    // Optionally handle 401s globally
    // if (status === 401) {
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("adminToken");
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  }
);

export default API;