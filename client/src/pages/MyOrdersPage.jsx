// src/pages/MyOrdersPage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Clock,
  MapPin,
  Wallet,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { CartContext } from "../context/CartContext";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

const STATUS_STYLES = {
  placed: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-purple-100 text-purple-700",
  preparing: "bg-blue-100 text-blue-700",
  "out-for-delivery": "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STEPS = ["placed", "confirmed", "preparing", "out-for-delivery", "delivered"];

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | delivered | cancelled
  const [q, setQ] = useState("");

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await API.get("/orders/my");
        const list = Array.isArray(res?.data?.orders) ? res.data.orders : [];
        setOrders(list);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Derived counts for filters
  const counts = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
    const total = orders.length;
    return { delivered, cancelled, active, total };
  }, [orders]);

  // Filtered list (by status + search)
  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (statusFilter === "active") {
      list = list.filter((o) => !["delivered", "cancelled"].includes(o.status));
    } else if (statusFilter === "delivered") {
      list = list.filter((o) => o.status === "delivered");
    } else if (statusFilter === "cancelled") {
      list = list.filter((o) => o.status === "cancelled");
    }

    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((o) => {
        const id = String(o._id || "").toLowerCase();
        const rest = String(o.restaurant?.name || "").toLowerCase();
        return id.includes(query) || rest.includes(query);
      });
    }

    return list;
  }, [orders, statusFilter, q]);

  // Reorder: add items back to cart and go to cart
  const handleReorder = (order) => {
    if (!order?.items?.length) return;
    const restaurantId = order.restaurant?._id || order.restaurant;
    for (const it of order.items) {
      const menuId = it.menuItem?._id || it.menuItem || undefined;
      addToCart(
        {
          _id: menuId || it._id || `${it.name}-${it.price}`,
          menuItem: menuId || null,
          name: it.name || "Item",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image:
            it?.menuItem?.image && String(it.menuItem.image).trim()
              ? it.menuItem.image
              : "https://via.placeholder.com/200x150",
          isVeg: it?.menuItem?.isVeg ?? true,
          restaurant: restaurantId,
          description: it?.menuItem?.description || "",
        },
        Number(it.quantity || 1),
        restaurantId
      );
    }
    navigate("/cart");
  };

  // Timeline step component
  const StatusTimeline = ({ status }) => {
    if (status === "cancelled") {
      return (
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-600 font-medium">Cancelled</span>
        </div>
      );
    }
    const idx = STEPS.indexOf(status);
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const active = i <= idx;
            return (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-2 w-full rounded ${active ? "bg-green-500" : "bg-gray-200"}`}
                  style={{ maxWidth: i === 0 || i === STEPS.length - 1 ? "50%" : "100%" }}
                />
                <div className="mt-2 flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      active ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                  <div className={`mt-1 text-[11px] ${active ? "text-green-700" : "text-gray-400"}`}>
                    {STATUS_LABEL[s]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
        <div className="mt-4">
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full shadow hover:opacity-90"
          >
            🔄 Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-gray-600">Looks like you haven’t placed any yummy orders yet.</p>
        <Link
          to="/restaurants"
          className="mt-4 inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full shadow hover:opacity-90"
        >
          🏠 Start Ordering
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-orange-500" />
          My Orders
          <span className="ml-2 text-base text-gray-500 font-normal">({counts.total})</span>
        </h2>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            {[
              { key: "all", label: `All (${counts.total})` },
              { key: "active", label: `Active (${counts.active})` },
              { key: "delivered", label: `Delivered (${counts.delivered})` },
              { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  statusFilter === t.key ? "bg-white shadow font-semibold" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by restaurant or order ID"
              className="border rounded-full pl-7 pr-3 py-1.5 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-6">
        {filtered.map((order, idx) => {
          const id = String(order._id || "");
          const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
          const total = formatINR(order.total);
          const itemsCount = (order.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0);
          const isExpanded = expandedId === id;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="border rounded-xl shadow-md bg-white overflow-hidden hover:shadow-lg transition"
            >
              {/* Header row */}
              <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-gray-800">
                      #{id.slice(-6)} • {order.restaurant?.name || "Restaurant"}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {created}
                    </span>
                    {order.address && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {order.address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">₹{total}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                    <Wallet className="w-4 h-4" />
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 ml-auto mt-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 ml-auto mt-2" />
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="px-4 pb-3">
                <StatusTimeline status={order.status} />
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-4 border-t bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <ul className="divide-y text-sm">
                      {(order.items || []).map((it, i) => (
                        <li key={it._id || it.menuItem || i} className="py-2 flex justify-between">
                          <span className="text-gray-700">
                            {it.name} × {it.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{formatINR(Number(it.price) * Number(it.quantity))}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                      <span className="text-sm text-gray-600">{itemsCount} items</span>
                      <div className="flex items-center gap-2">
                        {/* Track: just toggles expand here */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : id)}
                          className="text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
                        >
                          <Truck className="w-4 h-4" /> Track
                        </button>

                        {order.status === "delivered" ? (
                          <Link
                            to={`/restaurants/${order.restaurant?._id || order.restaurant}`}
                            className="text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
                            title="Rate & review"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Rate/Review
                          </Link>
                        ) : null}

                        {/* Optional invoice button (non-functional placeholder) */}
                        <button
                          className="text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-full border bg-white text-gray-500 cursor-not-allowed"
                          title="Invoice coming soon"
                          disabled
                        >
                          <Receipt className="w-4 h-4" /> Invoice
                        </button>

                        {/* Reorder */}
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-sm bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white px-4 py-1.5 rounded-full shadow"
                        >
                          🔄 Reorder
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}