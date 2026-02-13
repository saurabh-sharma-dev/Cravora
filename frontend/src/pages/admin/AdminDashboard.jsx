// src/pages/admin/AdminDashboard.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import AdminAPI, { getRestaurants, addRestaurant, addMenuItem } from "../../api/adminApi";
import API from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { SocketContext } from "../../context/SocketProvider"; // fixed import
import { NotificationsContext } from "../../context/NotificationsContext";
import {
  Clock,
  User,
  Store,
  Wallet,
  Truck,
  CheckCircle2,
  Bell,
  RefreshCw,
  Filter as FilterIcon,
  Search,
  PlusCircle,
  Calendar,
  Download,
  LayoutGrid,
  List,
  BarChart3,
  SortAsc,
  SortDesc,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Timer,
  Copy,
} from "lucide-react";

const allowedStatuses = ["placed", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"];
const statusLabels = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusPillClass = {
  placed: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-purple-100 text-purple-700",
  preparing: "bg-blue-100 text-blue-700",
  "out-for-delivery": "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

// Tiny beep for new order (no external assets)
const useBeep = () => {
  const ctxRef = useRef(null);
  const play = () => {
    try {
      if (typeof window === "undefined") return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctxRef.current) ctxRef.current = new AC();
      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      o.start(now);
      o.stop(now + 0.24);
    } catch (_) {}
  };
  return play;
};

export default function AdminDashboard() {
  const { add } = useContext(NotificationsContext);
  const { adminOrderPing, resetAdminPing } = useContext(SocketContext);
  const beep = useBeep();

  // Restaurants
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersErr, setOrdersErr] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const ordersRef = useRef(null);
  const prevOrderIdsRef = useRef(new Set()); // for new order detection

  // UI/Filters
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeManageTab, setActiveManageTab] = useState("restaurant"); // 'restaurant' | 'menu'
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [restFilter, setRestFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Enhanced filters and prefs
  const [dateRange, setDateRange] = useState("all"); // all | today | 7d | 30d | custom
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | amount-desc | amount-asc
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [soundOn, setSoundOn] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Manage forms
  const [restName, setRestName] = useState("");
  const [restDesc, setRestDesc] = useState("");
  const [restAddress, setRestAddress] = useState("");
  const [restLocation, setRestLocation] = useState("");
  const [restImage, setRestImage] = useState("");
  const [restDeliveryTime, setRestDeliveryTime] = useState("");
  const [restTags, setRestTags] = useState("");

  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuImage, setMenuImage] = useState("");
  const [menuVeg, setMenuVeg] = useState(true);

  const [submittingRest, setSubmittingRest] = useState(false);
  const [submittingMenu, setSubmittingMenu] = useState(false);

  // Alerts (for Notifications panel)
  const [alerts, setAlerts] = useState([]);

  // Restaurant list utilities
  const [restSearch, setRestSearch] = useState("");

  const adminHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } }),
    []
  );

  // Persist basic UI prefs
  useEffect(() => {
    try {
      const get = (k, def) => localStorage.getItem(k) || def;
      setViewMode(get("ad_viewMode", "grid"));
      setSortBy(get("ad_sortBy", "newest"));
      setStatusFilter(get("ad_statusFilter", "all"));
      setRestFilter(get("ad_restFilter", "all"));
      setDateRange(get("ad_dateRange", "all"));
      setPageSize(Number(get("ad_pageSize", "10")) || 10);
      setSoundOn(get("ad_soundOn", "true") === "true");
      setAutoRefresh(get("ad_autoRefresh", "false") === "true");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ad_viewMode", viewMode);
      localStorage.setItem("ad_sortBy", sortBy);
      localStorage.setItem("ad_statusFilter", statusFilter);
      localStorage.setItem("ad_restFilter", restFilter);
      localStorage.setItem("ad_dateRange", dateRange);
      localStorage.setItem("ad_pageSize", String(pageSize));
      localStorage.setItem("ad_soundOn", String(soundOn));
      localStorage.setItem("ad_autoRefresh", String(autoRefresh));
    } catch {}
  }, [viewMode, sortBy, statusFilter, restFilter, dateRange, pageSize, soundOn, autoRefresh]);

  // Add alert
  const pushAlert = (type, title, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setAlerts((prev) => [{ id, type, title, text, ts: new Date() }, ...prev].slice(0, 30));
  };

  // Fetch restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants();
      const list = Array.isArray(data) ? data : data?.restaurants || [];
      setRestaurants(list);
      if (list.length && !selectedRest) setSelectedRest(list[0]._id);
    } catch (err) {
      console.error("❌ Error fetching restaurants:", err);
      setMessage("⚠️ Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersErr("");
    try {
      const res = await API.get("/orders", adminHeaders);
      const list = Array.isArray(res?.data?.orders) ? res.data.orders : [];

      // Detect brand new orders (for Alerts panel)
      const prev = prevOrderIdsRef.current;
      const nextIds = new Set(list.map((o) => String(o._id)));
      if (prev.size) {
        const newOnes = list.filter((o) => !prev.has(String(o._id)));
        newOnes.forEach((o) => {
          const itemsCount = (o.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0);
          pushAlert(
            "success",
            "New Order",
            `₹${o.total} • ${itemsCount} items • ${o.user?.name || "User"} • ${o.restaurant?.name || "Restaurant"}`
          );
        });
        if (newOnes.length) {
          add?.({
            type: "success",
            title: "New Orders",
            message: `${newOnes.length} new order${newOnes.length > 1 ? "s" : ""} received`,
            timeout: 4000,
          });
          if (soundOn) beep();
        }
      }
      prevOrderIdsRef.current = nextIds;

      setOrders(list);
      if (adminOrderPing > 0) resetAdminPing();
    } catch (err) {
      console.error("❌ Error fetching orders:", err?.response?.data || err.message);
      setOrdersErr("Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRestaurants();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional auto-refresh (socket remains primary)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  // Refresh orders on socket ping
  useEffect(() => {
    if (adminOrderPing > 0) {
      fetchOrders();
      ordersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOrderPing]);

  // Manage: Add restaurant
  const handleAddRestaurant = async () => {
    if (!restName || !restDesc || !restAddress || !restLocation) {
      setMessage("⚠️ Name, Description, Address, and Location are required");
      return;
    }
    setSubmittingRest(true);
    try {
      const payload = {
        name: restName.trim(),
        description: restDesc.trim(),
        address: restAddress.trim(),
        location: restLocation.trim(),
        image: restImage.trim() || "https://via.placeholder.com/400x200",
      };
      if (restDeliveryTime) payload.deliveryTime = Number(restDeliveryTime);
      if (restTags) payload.tags = restTags.split(",").map((t) => t.trim()).filter(Boolean);

      await addRestaurant(payload);

      setRestName("");
      setRestDesc("");
      setRestAddress("");
      setRestLocation("");
      setRestImage("");
      setRestDeliveryTime("");
      setRestTags("");

      setMessage("✅ Restaurant added successfully");
      pushAlert("success", "Restaurant Added", payload.name);
      fetchRestaurants();
    } catch (err) {
      console.error("❌ Error adding restaurant:", err);
      setMessage(err?.response?.data?.msg || "❌ Error adding restaurant");
      pushAlert("error", "Add Restaurant Failed", err?.response?.data?.msg || "Error occurred");
    } finally {
      setSubmittingRest(false);
    }
  };

  // Manage: Add menu item
  const handleAddMenu = async () => {
    const priceVal = Number(menuPrice);
    if (!selectedRest) return setMessage("⚠️ Please select a restaurant");
    if (!menuName || !menuDesc || !menuPrice) {
      setMessage("⚠️ Menu Name, Description and Price are required");
      return;
    }
    if (!Number.isFinite(priceVal) || priceVal <= 0) {
      setMessage("⚠️ Price must be a positive number");
      return;
    }

    setSubmittingMenu(true);
    try {
      await addMenuItem(selectedRest, {
        name: menuName.trim(),
        description: menuDesc.trim(),
        price: priceVal,
        image: menuImage.trim() || "https://via.placeholder.com/200",
        isVeg: !!menuVeg,
      });

      setMenuName("");
      setMenuDesc("");
      setMenuPrice("");
      setMenuImage("");
      setMenuVeg(true);

      setMessage("✅ Menu item added successfully");
      pushAlert("success", "Menu Item Added", menuName);
      fetchRestaurants();
    } catch (err) {
      console.error("❌ Error adding menu item:", err);
      setMessage(err?.response?.data?.msg || "❌ Error adding menu item");
      pushAlert("error", "Add Menu Failed", err?.response?.data?.msg || "Error occurred");
    } finally {
      setSubmittingMenu(false);
    }
  };

  // Delete restaurant
  const handleDeleteRestaurant = async (id, name) => {
    if (!id) return;
    const ok = window.confirm(`Delete restaurant "${name}" and its menu?`);
    if (!ok) return;
    try {
      await AdminAPI.delete(`/restaurants/${id}`);
      setMessage("✅ Restaurant deleted");
      pushAlert("success", "Restaurant Deleted", name);
      fetchRestaurants();
    } catch (err) {
      console.error("❌ Delete restaurant error:", err);
      const msg = err?.response?.data?.msg || "❌ Failed to delete restaurant";
      setMessage(msg);
      pushAlert("error", "Delete Failed", msg);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (menuItemId) => {
    if (!menuItemId) return;
    const ok = window.confirm("Delete this menu item?");
    if (!ok) return;
    try {
      await AdminAPI.delete(`/menu/${menuItemId}`);
      setMessage("✅ Menu item deleted");
      pushAlert("success", "Menu Item Deleted", String(menuItemId).slice(-6));
      fetchRestaurants();
    } catch (err) {
      console.error("❌ Delete menu item error:", err);
      const msg = err?.response?.data?.msg || "❌ Failed to delete menu item";
      setMessage(msg);
      pushAlert("error", "Delete Failed", msg);
    }
  };

  // Update order status
  const updateStatus = async (orderId, status) => {
    if (!orderId || !allowedStatuses.includes(status)) return;
    setUpdatingId(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status }, adminHeaders);
      const updated = data?.order;
      if (updated) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      }
      add?.({
        type: "success",
        title: "Status Updated",
        message: `Order #${String(orderId).slice(-6)} → ${statusLabels[status] || status}`,
        timeout: 3000,
      });
      pushAlert("success", "Order Status", `#${String(orderId).slice(-6)} → ${statusLabels[status] || status}`);
    } catch (err) {
      console.error("❌ Status update error:", err?.response?.data || err.message);
      const msg = err?.response?.data?.msg || "Could not update status";
      add?.({ type: "error", title: "Update Failed", message: msg, timeout: 4000 });
      pushAlert("error", "Status Update Failed", msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Export orders (filtered set)
  const exportOrders = () => {
    const header = ["Order ID", "Customer", "Restaurant", "Total", "Status", "Payment", "Created At"];
    const rows = filteredOrders.map((o) => [
      o._id,
      o.user?.name || "",
      o.restaurant?.name || "",
      o.total,
      o.status,
      o.paymentMethod === "cod" ? "COD" : "Online",
      o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushAlert("success", "Export Complete", "Orders exported as CSV");
  };

  // Autoclear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Derived: stats
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const open = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
    const revenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.total || 0), 0);
    return { total, delivered, open, revenue };
  }, [orders]);

  // Derived: status distribution
  const statusDistribution = useMemo(() => {
    const dist = {};
    for (const s of allowedStatuses) dist[s] = 0;
    for (const o of orders) dist[o.status] = (dist[o.status] || 0) + 1;
    return dist;
  }, [orders]);

  // Derived: restaurant filter options from orders
  const orderRestaurants = useMemo(() => {
    const map = new Map();
    for (const o of orders || []) {
      const id = o?.restaurant?._id || o?.restaurant;
      const name = o?.restaurant?.name || "Restaurant";
      if (id) map.set(String(id), name);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [orders]);

  // Helpers: date range check
  const inDateRange = (createdAt) => {
    if (!createdAt || dateRange === "all") return true;
    const d = new Date(createdAt);
    const now = new Date();
    const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (dateRange === "today") return startOfDay(d).getTime() === startOfDay(now).getTime();
    if (dateRange === "7d") return now - d <= 7 * 24 * 60 * 60 * 1000;
    if (dateRange === "30d") return now - d <= 30 * 24 * 60 * 60 * 1000;
    if (dateRange === "custom") {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo + "T23:59:59") : null;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    }
    return true;
  };

  // Filtered + sorted orders list
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (restFilter !== "all") list = list.filter((o) => String(o.restaurant?._id || o.restaurant) === restFilter);

    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const id = String(o._id || "").toLowerCase();
        const user = String(o.user?.name || "").toLowerCase();
        const rest = String(o.restaurant?.name || "").toLowerCase();
        return id.includes(q) || user.includes(q) || rest.includes(q);
      });
    }

    // Date range
    list = list.filter((o) => inDateRange(o.createdAt));

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "amount-desc") return Number(b.total || 0) - Number(a.total || 0);
      if (sortBy === "amount-asc") return Number(a.total || 0) - Number(b.total || 0);
      return 0;
    });

    return list;
  }, [orders, statusFilter, restFilter, searchText, sortBy, dateRange, customFrom, customTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  useEffect(() => {
    if (page !== pageClamped) setPage(pageClamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);
  const pagedOrders = useMemo(() => {
    const start = (pageClamped - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, pageClamped, pageSize]);

  // UI components
  const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 shadow-lg text-white"
      style={{
        background:
          gradient ||
          "linear-gradient(135deg, rgba(239,68,68,1) 0%, rgba(236,72,153,1) 60%, rgba(139,92,246,1) 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm/5 opacity-90">{title}</div>
          <div className="text-2xl font-extrabold mt-1">{value}</div>
        </div>
        <div className="opacity-90">{icon}</div>
      </div>
    </motion.div>
  );

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id));
      add?.({ type: "success", title: "Copied", message: `Order #${String(id).slice(-6)} copied`, timeout: 2000 });
    } catch {}
  };

  const orderAge = (createdAt) => {
    if (!createdAt) return "";
    const mins = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    const rm = mins % 60;
    return `${hrs}h ${rm}m ago`;
  };

  const statusProgress = (status) => {
    const idx = allowedStatuses.indexOf(status);
    if (idx < 0) return 0;
    return Math.round((idx / (allowedStatuses.length - 1)) * 100);
  };

  // Filter restaurants (UI only)
  const filteredRestaurants = useMemo(() => {
    const q = restSearch.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => [r.name, r.location, r.address].some((x) => String(x || "").toLowerCase().includes(q)));
  }, [restaurants, restSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      {/* Top header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h2>
          <p className="text-gray-500">Manage orders in real-time, track status and handle restaurants</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-white border rounded-full px-3 py-1 shadow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-gray-700">Live</span>
            {adminOrderPing > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">+{adminOrderPing}</span>
            )}
          </span>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn((s) => !s)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow bg-white hover:bg-gray-50 transition ${
              soundOn ? "text-green-600 border-green-200" : "text-gray-600"
            }`}
            title="Toggle sound for new orders"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound
          </button>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow bg-white hover:bg-gray-50 transition ${
              autoRefresh ? "text-blue-600 border-blue-200" : "text-gray-600"
            }`}
            title="Auto-refresh every 30s"
          >
            <Timer size={16} /> Auto
          </button>

          {/* Export */}
          <button
            onClick={exportOrders}
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow border hover:bg-gray-50 transition"
            title="Export filtered orders as CSV"
          >
            <Download size={16} /> Export
          </button>

          <button
            onClick={() => {
              fetchOrders();
              fetchRestaurants();
            }}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow hover:bg-black transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders" value={stats.total} icon={<Store size={28} />} />
        <StatCard
          title="Open Orders"
          value={stats.open}
          icon={<Truck size={28} />}
          gradient="linear-gradient(135deg,#06b6d4 0%, #3b82f6 100%)"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle2 size={28} />}
          gradient="linear-gradient(135deg,#10b981 0%, #84cc16 100%)"
        />
        <StatCard
          title="Revenue"
          value={`₹${formatINR(stats.revenue)}`}
          icon={<Wallet size={28} />}
          gradient="linear-gradient(135deg,#f59e0b 0%, #ef4444 100%)"
        />
      </div>

      {/* Message Alert */}
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="mb-4 text-center font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Live Orders */}
        <section ref={ordersRef} className="col-span-12 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border p-5"
          >
            {/* Controls row */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                🚚 Live Orders
                <span className="text-xs font-medium text-gray-500">({filteredOrders.length} filtered)</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status tabs */}
                <div className="flex overflow-x-auto rounded-full bg-gray-100 p-1">
                  {["all", ...allowedStatuses].map((s) => {
                    const active = statusFilter === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                          active ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        {s === "all" ? "All" : statusLabels[s] || s}
                      </button>
                    );
                  })}
                </div>

                {/* Restaurant filter */}
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <FilterIcon size={16} />
                  <select
                    value={restFilter}
                    onChange={(e) => {
                      setRestFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="all">All Restaurants</option>
                    {orderRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Date range */}
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setPage(1);
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>

                {dateRange === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => {
                        setCustomFrom(e.target.value);
                        setPage(1);
                      }}
                      className="border rounded-lg px-2 py-1.5 text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => {
                        setCustomTo(e.target.value);
                        setPage(1);
                      }}
                      className="border rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                )}

                {/* Sort */}
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  {sortBy.includes("amount") ? <SortDesc size={16} /> : <SortAsc size={16} />}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="amount-desc">Amount: High to Low</option>
                    <option value="amount-asc">Amount: Low to High</option>
                  </select>
                </label>

                {/* Page size */}
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <span>Page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value) || 10);
                      setPage(1);
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {[6, 10, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}/page
                      </option>
                    ))}
                  </select>
                </label>

                {/* View toggle */}
                <div className="flex rounded-full bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${
                      viewMode === "grid" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} /> Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${
                      viewMode === "list" ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="List View"
                  >
                    <List size={16} /> List
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
                  <input
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search ID / user / restaurant"
                    className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-64"
                  />
                </div>
              </div>
            </div>

            {/* Orders Content */}
            {ordersLoading ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2" : ""}`}>
                {Array.from({ length: viewMode === "grid" ? 4 : 3 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : ordersErr ? (
              <p className="text-red-500">{ordersErr}</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-gray-500">No orders match the filters.</p>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pagedOrders.map((o, idx) => {
                  const itemsCount = (o.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0);
                  const total = formatINR(o.total);
                  const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : "";
                  const expanded = expandedId === o._id;
                  const progress = statusProgress(o.status);

                  return (
                    <motion.div
                      key={o._id || idx}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.25 }}
                      className="border rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            Order <span className="font-mono text-sm">#{String(o._id).slice(-6)}</span>
                            <button
                              onClick={() => copyId(o._id)}
                              title="Copy order ID"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={14} /> {created} • {orderAge(o.createdAt)}
                          </div>

                          {/* Status progress */}
                          <div className="mt-2">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-pink-500 to-indigo-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPillClass[o.status]}`}
                              >
                                {statusLabels[o.status] || o.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                              {itemsCount} items
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                              <Wallet size={14} />
                              {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">₹{total}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                            <Store size={14} />
                            {o.restaurant?.name || "Restaurant"}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                            <User size={14} />
                            {o.user?.name || "User"}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck size={16} className="text-indigo-500" />
                          Update status:
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o._id, e.target.value)}
                            disabled={updatingId === o._id}
                            className="border rounded-lg px-3 py-1.5 text-sm"
                          >
                            {allowedStatuses.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setExpandedId(expanded ? null : o._id)}
                            className="text-sm text-gray-700 hover:text-gray-900 underline"
                          >
                            {expanded ? "Hide details" : "View details"}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Items */}
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-3 border-t pt-3"
                          >
                            {Array.isArray(o.items) && o.items.length > 0 ? (
                              <ul className="divide-y text-sm">
                                {o.items.map((it, i) => (
                                  <li key={i} className="py-2 flex justify-between">
                                    <span className="text-gray-700">
                                      {it.name} × {it.quantity}
                                    </span>
                                    <span className="font-medium">
                                      ₹{formatINR(Number(it.price) * Number(it.quantity))}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-400 text-sm">No items</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // List view (compact)
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Restaurant</th>
                      <th className="py-2 pr-4">Items</th>
                      <th className="py-2 pr-4">Payment</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((o) => {
                      const itemsCount = (o.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0);
                      return (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono">#{String(o._id).slice(-6)}</span>
                              <button className="text-gray-400 hover:text-gray-600" onClick={() => copyId(o._id)}>
                                <Copy size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">{orderAge(o.createdAt)}</div>
                          </td>
                          <td className="py-2 pr-4">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</td>
                          <td className="py-2 pr-4">{o.user?.name || "User"}</td>
                          <td className="py-2 pr-4">{o.restaurant?.name || "Restaurant"}</td>
                          <td className="py-2 pr-4">{itemsCount}</td>
                          <td className="py-2 pr-4">{o.paymentMethod === "cod" ? "COD" : "Online"}</td>
                          <td className="py-2 pr-4 font-semibold">₹{formatINR(o.total)}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPillClass[o.status]}`}>
                              {statusLabels[o.status] || o.status}
                            </span>
                          </td>
                          <td className="py-2">
                            <select
                              value={o.status}
                              onChange={(e) => updateStatus(o._id, e.target.value)}
                              disabled={updatingId === o._id}
                              className="border rounded-lg px-2 py-1 text-xs"
                            >
                              {allowedStatuses.map((s) => (
                                <option key={s} value={s}>
                                  {statusLabels[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!ordersLoading && filteredOrders.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div>
                  Showing {(pageClamped - 1) * pageSize + 1}–
                  {Math.min(filteredOrders.length, pageClamped * pageSize)} of {filteredOrders.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pageClamped === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="px-2">Page {pageClamped} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={pageClamped === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* RIGHT: Insights + Notifications + Manage */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Insights panel */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500" /> Insights
              </h4>
              <span className="text-xs text-gray-500">Status distribution</span>
            </div>
            <div className="space-y-3">
              {allowedStatuses.map((s) => {
                const count = statusDistribution[s] || 0;
                const total = orders.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{statusLabels[s]}</span>
                      <span className="text-gray-500">{count} • {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-2 ${
                          s === "placed" ? "bg-yellow-400" :
                          s === "confirmed" ? "bg-purple-400" :
                          s === "preparing" ? "bg-blue-400" :
                          s === "out-for-delivery" ? "bg-indigo-400" :
                          s === "delivered" ? "bg-green-500" :
                          "bg-red-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Notifications panel */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Bell size={18} className="text-red-500" /> Notifications
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAlerts([])}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border"
                >
                  Clear
                </button>
              </div>
            </div>

            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500">No recent alerts yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                <AnimatePresence>
                  {alerts.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`rounded-lg border p-3 ${
                        a.type === "success"
                          ? "border-green-200"
                          : a.type === "error"
                          ? "border-red-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{a.title}</div>
                          <div className="text-sm text-gray-600">{a.text}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(a.ts).toLocaleTimeString()}
                          </div>
                        </div>
                        <button
                          onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                          className="text-gray-400 hover:text-gray-600"
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Manage panel (tabs) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <PlusCircle size={18} className="text-pink-500" /> Manage
              </h4>
              <div className="flex rounded-full bg-gray-100 p-1">
                {[
                  { key: "restaurant", label: "Add Restaurant" },
                  { key: "menu", label: "Add Menu" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveManageTab(t.key)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      activeManageTab === t.key
                        ? "bg-white shadow font-semibold"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeManageTab === "restaurant" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={restName}
                  onChange={(e) => setRestName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={restDesc}
                  onChange={(e) => setRestDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={restAddress}
                  onChange={(e) => setRestAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="text"
                  placeholder="Location (City/Area)"
                  value={restLocation}
                  onChange={(e) => setRestLocation(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Delivery Time (mins)"
                    value={restDeliveryTime}
                    onChange={(e) => setRestDeliveryTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                    min="5"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={restTags}
                    onChange={(e) => setRestTags(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={restImage}
                  onChange={(e) => setRestImage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={handleAddRestaurant}
                  disabled={submittingRest}
                  className={`w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-2 rounded-lg shadow-md transition-transform hover:-translate-y-1 ${
                    submittingRest ? "opacity-70 cursor-not-allowed" : "hover:from-pink-600 hover:to-blue-600"
                  }`}
                >
                  {submittingRest ? "Adding..." : "Add Restaurant"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  onChange={(e) => setSelectedRest(e.target.value)}
                  value={selectedRest}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((rest) => (
                    <option key={rest._id} value={rest._id}>
                      {rest.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Menu Name"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                    min="1"
                    step="1"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={menuVeg}
                      onChange={(e) => setMenuVeg(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Veg item
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={menuImage}
                  onChange={(e) => setMenuImage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={handleAddMenu}
                  disabled={submittingMenu}
                  className={`w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-2 rounded-lg shadow-md transition-transform hover:-translate-y-1 ${
                    submittingMenu ? "opacity-70 cursor-not-allowed" : "hover:from-pink-600 hover:to-blue-600"
                  }`}
                >
                  {submittingMenu ? "Adding..." : "Add Menu Item"}
                </button>
              </div>
            )}
          </motion.div>
        </aside>
      </div>

      {/* Restaurants list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800">📋 Restaurants</h3>
          <div className="relative">
            <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
            <input
              value={restSearch}
              onChange={(e) => setRestSearch(e.target.value)}
              placeholder="Search restaurants"
              className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-64"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="text-gray-500">No restaurants found</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredRestaurants.map((rest, idx) => (
              <motion.div
                key={rest._id || idx}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl shadow-md p-4 border hover:border-pink-400 transition-all"
              >
                <img
                  src={rest?.image?.trim() ? rest.image : "https://via.placeholder.com/400x200?text=Restaurant"}
                  alt={rest?.name || "Restaurant"}
                  className="w-full h-36 object-cover rounded-lg mb-3 transition-transform duration-500 hover:scale-105"
                />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold">{rest.name}</h4>
                    <p className="text-gray-600 truncate">{rest.description}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {rest.address} {rest.location ? `• ${rest.location}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteRestaurant(rest._id, rest.name)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                    title="Delete restaurant"
                  >
                    Delete
                  </button>
                </div>

                <h5 className="mt-3 font-semibold">Menu:</h5>
                <ul className="list-disc list-inside text-gray-700 max-h-40 overflow-auto">
                  {Array.isArray(rest.menu) && rest.menu.length > 0 ? (
                    rest.menu.map((item) => (
                      <li key={item._id} className="flex items-center justify-between">
                        <span>
                          {item.name} – ₹{item.price}
                        </span>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                          title="Delete menu item"
                        >
                          Delete
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">No menu items yet</li>
                  )}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}