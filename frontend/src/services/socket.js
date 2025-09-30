// src/services/socket.js
import { io } from "socket.io-client";

// Pick the best base URL for sockets (env first, then API URL, then current origin, then localhost)
const getRawBaseUrl = () => {
  const env = import.meta?.env || {};
  return (
    env.VITE_SOCKET_URL ||
    env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000") ||
    "http://localhost:5000"
  );
};

// Normalize URL (remove trailing slashes)
const normalize = (u) => String(u || "").replace(/\/+$/, "");
const SOCKET_URL = normalize(getRawBaseUrl());

// Common socket options
const common = {
  path: "/socket.io", // default; change only if server uses a custom path
  transports: ["websocket", "polling"],
  withCredentials: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
};

let adminSocket = null;
let userSocket = null;

const bindCommonEvents = (socket, role) => {
  if (!socket) return;
  const dev = !!import.meta.env?.DEV;

  socket.on("connect", () => {
    if (dev) console.log(`[socket:${role}] connected`, socket.id);
  });
  socket.on("disconnect", (reason) => {
    if (dev) console.log(`[socket:${role}] disconnected`, reason);
  });
  socket.on("connect_error", (err) => {
    if (dev) console.warn(`[socket:${role}] connect_error:`, err?.message || err);
  });
  socket.on("reconnect_attempt", (attempt) => {
    if (dev) console.log(`[socket:${role}] reconnect_attempt #${attempt}`);
  });
  socket.on("reconnect_error", (err) => {
    if (dev) console.warn(`[socket:${role}] reconnect_error:`, err?.message || err);
  });
  socket.on("reconnect_failed", () => {
    if (dev) console.warn(`[socket:${role}] reconnect_failed`);
  });
};

export const connectAdminSocket = () => {
  if (typeof window === "undefined") return null;
  const token = window.localStorage?.getItem("adminToken");
  if (!token) return null;

  // Reuse existing instance if present
  if (adminSocket) {
    adminSocket.auth = { token, role: "admin" };
    if (adminSocket.disconnected) adminSocket.connect();
    return adminSocket;
  }

  adminSocket = io(SOCKET_URL, { ...common, auth: { token, role: "admin" } });
  bindCommonEvents(adminSocket, "admin");
  return adminSocket;
};

export const connectUserSocket = () => {
  if (typeof window === "undefined") return null;
  const token = window.localStorage?.getItem("token");
  if (!token) return null;

  // Reuse existing instance if present
  if (userSocket) {
    userSocket.auth = { token, role: "user" };
    if (userSocket.disconnected) userSocket.connect();
    return userSocket;
  }

  userSocket = io(SOCKET_URL, { ...common, auth: { token, role: "user" } });
  bindCommonEvents(userSocket, "user");
  return userSocket;
};

export const getAdminSocket = () => adminSocket;
export const getUserSocket = () => userSocket;

export const disconnectAdminSocket = () => {
  if (!adminSocket) return;
  try {
    adminSocket.removeAllListeners();
    adminSocket.disconnect();
  } catch {}
  adminSocket = null;
};

export const disconnectUserSocket = () => {
  if (!userSocket) return;
  try {
    userSocket.removeAllListeners();
    userSocket.disconnect();
  } catch {}
  userSocket = null;
};

// If tokens change after login/logout, refresh sockets auth and reconnect if needed
export const refreshSocketsAuth = () => {
  if (typeof window === "undefined") return;
  const adminToken = window.localStorage?.getItem("adminToken");
  const userToken = window.localStorage?.getItem("token");

  if (adminSocket) {
    if (adminToken) {
      adminSocket.auth = { token: adminToken, role: "admin" };
      if (adminSocket.disconnected) adminSocket.connect();
    } else {
      disconnectAdminSocket();
    }
  }

  if (userSocket) {
    if (userToken) {
      userSocket.auth = { token: userToken, role: "user" };
      if (userSocket.disconnected) userSocket.connect();
    } else {
      disconnectUserSocket();
    }
  }
};

export default {
  connectAdminSocket,
  connectUserSocket,
  getAdminSocket,
  getUserSocket,
  disconnectAdminSocket,
  disconnectUserSocket,
  refreshSocketsAuth,
};