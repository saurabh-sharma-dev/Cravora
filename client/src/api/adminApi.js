import axios from "axios";

// Vite: use import.meta.env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api/admin`,
  headers: { "Content-Type": "application/json" },
});

// Attach admin token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Admin auth
export const adminLogin = async (formData) => {
  const { data } = await API.post("/login", formData);
  if (data?.token) {
    localStorage.setItem("adminToken", data.token);
    if (data?.admin) localStorage.setItem("admin", JSON.stringify(data.admin));
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

// Optional
// export const deleteRestaurant = async (restaurantId) => {
//   const { data } = await API.delete(`/restaurants/${restaurantId}`);
//   return data;
// };
// export const deleteMenuItem = async (menuItemId) => {
//   const { data } = await API.delete(`/menu/${menuItemId}`);
//   return data;
// };

export default API;