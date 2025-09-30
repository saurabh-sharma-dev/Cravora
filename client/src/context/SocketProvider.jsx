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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Helper: play a small sound
  const playSound = (path = "/notify.mp3") => {
    try {
      const a = new Audio(path);
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch {}
  };

  // Admin socket
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;

    const s = connectAdminSocket();
    if (!s) return;
    adminSocketRef.current = s;

    const onNewOrder = (summary) => {
      setAdminOrderPing((c) => c + 1);
      playSound();
      const msg = `₹${summary.total} • ${summary.itemsCount} items • ${summary.user?.name || "user"}`;
      add({
        type: "success",
        title: "New Order",
        message: msg,
        action: { label: "View Orders", onClick: () => navigate("/admin/dashboard") },
        timeout: 6000,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Order", { body: msg, tag: `order-${summary.id}`, icon: "/icon-192.png" });
      }
    };

    s.on("connect", () => console.log("🔌 Admin socket connected", s.id));
    s.on("disconnect", () => console.log("🔌 Admin socket disconnected"));
    s.on("order:new", onNewOrder);

    // Optional: if you emit admin status updates
    // const onAdminStatus = (payload) => { ... };
    // s.on("order:status", onAdminStatus);

    return () => {
      s.off("order:new", onNewOrder);
      // s.off("order:status", onAdminStatus);
      s.off("connect");
      s.off("disconnect");
      s.disconnect();
    };
  }, [add, navigate]);

  // User socket
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (!userToken) return;

    const s = connectUserSocket();
    if (!s) return;
    userSocketRef.current = s;

    const onPlaced = (order) => {
      add({
        type: "success",
        title: "Order Placed",
        message: `We’ve received your order • ₹${order.total}`,
        action: { label: "Track", onClick: () => navigate("/my-orders") },
        timeout: 5000,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Placed", { body: `Total ₹${order.total}`, icon: "/icon-192.png" });
      }
    };

    const onStatus = ({ id, status }) => {
      add({
        type: "success",
        title: "Order Update",
        message: `Your order is now ${status}`,
        action: { label: "View", onClick: () => navigate("/my-orders") },
        timeout: 5000,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Order Update", { body: `Status: ${status}`, icon: "/icon-192.png" });
      }
    };

    s.on("connect", () => console.log("🔌 User socket connected", s.id));
    s.on("disconnect", () => console.log("🔌 User socket disconnected"));
    s.on("order:placed", onPlaced);
    s.on("order:status", onStatus);

    return () => {
      s.off("order:placed", onPlaced);
      s.off("order:status", onStatus);
      s.off("connect");
      s.off("disconnect");
      s.disconnect();
    };
  }, [add, navigate]);

  const resetAdminPing = () => setAdminOrderPing(0);

  const value = useMemo(() => ({ adminOrderPing, resetAdminPing }), [adminOrderPing]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};