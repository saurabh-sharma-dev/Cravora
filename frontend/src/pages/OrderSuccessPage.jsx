// src/pages/OrderSuccessPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import {
  CheckCircle2,
  MapPin,
  Wallet,
  Clock,
  Copy,
  Share2,
  Receipt,
  Home as HomeIcon,
  ShoppingBag,
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(state?.order || null);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  // SSR-safe window + resize listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
  }, []);

  // Redirect if no order found
  useEffect(() => {
    if (!order) navigate("/", { replace: true });
  }, [order, navigate]);

  // Stop confetti after a bit
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, []);

  // Guard
  if (!order) return null;

  // Derived info
  const idShort = useMemo(() => String(order._id || "").slice(-6), [order]);
  const itemsCount = useMemo(
    () => (order.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0),
    [order]
  );
  const paymentLabel = useMemo(() => {
    const p = String(order.paymentMethod || "").toLowerCase();
    if (p === "cod" || p === "cash") return "Cash on Delivery";
    if (p === "card") return "Card";
    if (p === "upi") return "UPI";
    return "Online";
  }, [order]);

  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
  const total = formatINR(order.total);
  const restaurantName = order?.restaurant?.name || "Restaurant";
  const restaurantLoc = order?.restaurant?.location || "";

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order._id || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const shareOrder = async () => {
    const text = `Order #${idShort} • ₹${total} • ${restaurantName}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Order Placed", text, url: window.location.origin + "/my-orders" });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {}
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center relative">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && winSize.width > 0 && (
          <Confetti width={winSize.width} height={winSize.height} numberOfPieces={350} recycle={false} />
        )}
      </AnimatePresence>

      {/* Top Success Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full"
      >
        <div
          className="rounded-2xl overflow-hidden shadow-xl border"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)",
          }}
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 12 }}
                className="rounded-full bg-white/20 p-2"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Order Placed Successfully</h2>
              <p className="text-white/90 text-sm">Thanks for your order. We’re getting it ready!</p>
            </div>
          </div>

          {/* Info + Actions */}
          <div className="p-5 md:p-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="text-xl font-extrabold text-gray-900 mt-1">₹{total}</div>
              </div>
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xs text-gray-500">Payment</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">{paymentLabel}</div>
              </div>
              <div className="rounded-xl bg-white shadow-sm border p-3">
                <div className="text-xs text-gray-500">Items</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">{itemsCount}</div>
              </div>
            </div>

            {/* Order meta */}
            <div className="rounded-xl bg-white shadow-sm border p-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">
                    Order <span className="font-mono">#{idShort}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {createdAt}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyOrderId}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied" : "Copy ID"}
                  </button>
                  <button
                    onClick={shareOrder}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-gray-700">
                    <div className="font-semibold">{restaurantName}</div>
                    <div className="text-xs text-gray-500">{restaurantLoc}</div>
                    {order.address && (
                      <div className="text-xs text-gray-600 mt-1">{order.address}</div>
                    )}
                  </div>
                </div>

                <div className="text-sm flex items-start gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div className="text-gray-700">
                    <div className="font-semibold">Payment</div>
                    <div className="text-xs text-gray-500">{paymentLabel}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-5 rounded-xl bg-white shadow-sm border p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Order Items</h3>
                <span className="text-xs text-gray-500">{itemsCount} item{itemsCount === 1 ? "" : "s"}</span>
              </div>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                <ul className="divide-y">
                  {order.items.map((item, idx) => {
                    const img =
                      item?.menuItem?.image ||
                      item?.image ||
                      "https://via.placeholder.com/64?text=Food";
                    return (
                      <li key={item._id || item.menuItem || idx} className="flex items-center py-2 gap-3">
                        <img src={img} alt={item.name} className="w-12 h-12 rounded-lg object-cover border" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <div className="font-semibold text-gray-900">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">No items found in this order.</p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Link
                to="/my-orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow transition"
                title="Track in My Orders"
              >
                <ShoppingBag className="w-4 h-4" />
                Track My Orders
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 px-5 py-2.5 rounded-lg font-semibold shadow transition"
                title="Back Home"
              >
                <HomeIcon className="w-4 h-4" />
                Back Home
              </Link>
              <button
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-500 px-5 py-2.5 rounded-lg font-semibold shadow border cursor-not-allowed"
                title="Invoice coming soon"
              >
                <Receipt className="w-4 h-4" />
                Invoice
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ETA hint */}
      <div className="mt-4 text-xs text-gray-500">
        Estimated delivery in <span className="font-semibold text-gray-700">30–45 mins</span>. We’ll keep you posted.
      </div>
    </div>
  );
}