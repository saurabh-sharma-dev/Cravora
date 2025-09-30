import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const common = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
};

export const connectAdminSocket = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) return null;
  return io(BASE_URL, { ...common, auth: { token, role: "admin" } });
};

export const connectUserSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return io(BASE_URL, { ...common, auth: { token, role: "user" } });
};