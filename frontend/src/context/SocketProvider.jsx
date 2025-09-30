// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { connectAdminSocket, connectUserSocket } from "../services/socket";
import { NotificationsContext } from "./NotificationsContext";
import { useNavigate } from "react-router-dom";

export const SocketContext = createContext({
  adminOrderPing: 0,
  resetAdminPing: () => {},
});

export const SocketProvider = ({ children }) => {
  const navigate = useNavigate();
  const { add } = useContext(NotificationsContext);

  const adminSocketRef = useRef(null);
  const userSocketRef = useRef(null);

  const [adminOrderPing, setAdminOrderPing] = useState(0);

  // Ask for browser notification permission once
  useEffect(() => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      // ignore (SSR or unsupported)
    }
  }, []);

  // Helper: play a small sound
  const playSound = (path = "/notify.mp3") => {
    try {
      const a = new Audio(path);
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  // Helper: browser notification
  const notifyBrowser = (title, body, tag) => {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, tag, icon: "/icon-192.png" });
      }
    } catch {
      // ignore
    }
  };

  // Admin socket
  useEffect(() => {
    const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!adminToken) return;

    // Connect (connectAdminSocket should send { auth: { token, role: 'admin' } } internally)
    let s = null;
    try {
      s = connectAdminSocket();
    } catch {
      s = null;
    }
    if (!s) return;

    adminSocketRef.current = s;

    const onConnect = () => console.log("🔌 Admin socket connected", s.id);
    const onDisconnect = () => console.log("🔌 Admin socket disconnected");

    const onNewOrder = (summary) => {
      setAdminOrderPing((c) => c + 1);
      playSound();
      const msg = `₹${summary.total} • ${summary.itemsCount} items • ${summary.user?.name || "user"}`;
      add?.({
        type: "success",
        title: "New Order",
        message: msg,
        action: { label: "View Orders", onClick: () => navigate("/admin/dashboard") },
        timeout: 6000,
      });
      notifyBrowser("New Order", msg, `order-${summary.id}`);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("order:new", onNewOrder);

    // Optional: admin-side status updates
    // const onAdminStatus = (payload) => { ... };
    // s.on("order:status", onAdminStatus);

    return () => {
      try {
        s.off("order:new", onNewOrder);
        // s.off("order:status", onAdminStatus);
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.disconnect();
      } catch {
        // ignore
      }
    };
  }, [add, navigate]);

  // User socket
  useEffect(() => {
    const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!userToken) return;

    // Connect (connectUserSocket should send { auth: { token, role: 'user' } } internally)
    let s = null;
    try {
      s = connectUserSocket();
    } catch {
      s = null;
    }
    if (!s) return;

    userSocketRef.current = s;

    const onConnect = () => console.log("🔌 User socket connected", s.id);
    const onDisconnect = () => console.log("🔌 User socket disconnected");

    const onPlaced = (order) => {
      add?.({
        type: "success",
        title: "Order Placed",
        message: `We’ve received your order • ₹${order.total}`,
        action: { label: "Track", onClick: () => navigate("/my-orders") },
        timeout: 5000,
      });
      notifyBrowser("Order Placed", `Total ₹${order.total}`, `order-placed-${order._id}`);
    };

    const onStatus = ({ id, status }) => {
      const text = `Your order is now ${status}`;
      add?.({
        type: "success",
        title: "Order Update",
        message: text,
        action: { label: "View", onClick: () => navigate("/my-orders") },
        timeout: 5000,
      });
      notifyBrowser("Order Update", `Status: ${status}`, `order-status-${id}`);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("order:placed", onPlaced);
    s.on("order:status", onStatus);

    return () => {
      try {
        s.off("order:placed", onPlaced);
        s.off("order:status", onStatus);
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.disconnect();
      } catch {
        // ignore
      }
    };
  }, [add, navigate]);

  const resetAdminPing = () => setAdminOrderPing(0);

  const value = useMemo(
    () => ({ adminOrderPing, resetAdminPing }),
    [adminOrderPing]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};