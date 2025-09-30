// src/pages/CartPage.jsx
import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Percent,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const fadeItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function CartPage() {
  const navigate = useNavigate();
  const { cart = [], totalPrice, removeFromCart, updateQuantity } = useContext(CartContext);
  const items = Array.isArray(cart) ? cart : [];

  // Subtotal from context or computed
  const subTotal = useMemo(() => {
    if (typeof totalPrice === "number") return totalPrice;
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      return sum + qty * price;
    }, 0);
  }, [items, totalPrice]);

  // Simple coupon system (Swiggy-like feel)
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null); // { code, discount, freeDelivery }
  const [couponMsg, setCouponMsg] = useState("");

  const deliveryThreshold = 299;
  const baseDelivery = subTotal >= deliveryThreshold ? 0 : 29;
  const freeDelivery = applied?.freeDelivery ? true : false;
  const deliveryFee = freeDelivery ? 0 : baseDelivery;

  const taxes = Math.round(subTotal * 0.05); // 5% illustrative
  const discount = Math.min(
    applied?.discount || 0,
    subTotal // cap at subtotal
  );

  const grandTotal = Math.max(subTotal + deliveryFee + taxes - discount, 0);

  const handleApplyCoupon = () => {
    const code = String(coupon || "").trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code");
      return;
    }
    // Simple examples:
    // WELCOME10 -> 10% off upto ₹100
    // SAVE50    -> Flat ₹50 off on orders ₹399+
    // FREEDEL   -> Free delivery (no min)
    let next = null;
    if (code === "WELCOME10") {
      const disc = Math.min(Math.floor(subTotal * 0.1), 100);
      if (disc <= 0) return setCouponMsg("Not eligible yet");
      next = { code, discount: disc, freeDelivery: false };
      setApplied(next);
      setCouponMsg(`Applied WELCOME10: Saved ₹${disc}`);
    } else if (code === "SAVE50") {
      if (subTotal < 399) return setCouponMsg("Min order ₹399 for SAVE50");
      next = { code, discount: 50, freeDelivery: false };
      setApplied(next);
      setCouponMsg("Applied SAVE50: Flat ₹50 off");
    } else if (code === "FREEDEL") {
      next = { code, discount: 0, freeDelivery: true };
      setApplied(next);
      setCouponMsg("Applied FREEDEL: Delivery is free");
    } else {
      setCouponMsg("Invalid coupon");
    }
  };

  const clearCoupon = () => {
    setApplied(null);
    setCoupon("");
    setCouponMsg("");
  };

  const handleUpdateQty = (item, nextQty) => {
    const id = item._id || item.menuItem || item.id;
    if (!id) return;
    if (nextQty < 1) return;
    updateQuantity(id, nextQty);
  };

  const handleRemove = (item, idx) => {
    const id = item._id || item.menuItem || `${item.name || "item"}-${idx}`;
    removeFromCart(id);
  };

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            Your Cart
          </h2>
          <p className="text-sm text-gray-500">
            Tasty picks, fast delivery. Modify items or apply coupons below.
          </p>
        </div>

        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5"
          >
            <Sparkles size={16} />
            <span className="text-sm">
              Free delivery above ₹{deliveryThreshold}
            </span>
          </motion.div>
        )}
      </div>

      {items.length === 0 ? (
        // Empty state
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center mt-16 gap-4"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty Cart"
            className="w-28 h-28 opacity-80"
          />
          <p className="text-gray-600 text-lg text-center">
            Your cart is empty. Start adding delicious food! 🍕
          </p>
          <Link
            to="/"
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-2.5 rounded-full font-semibold shadow"
          >
            Browse Restaurants
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Items */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <AnimatePresence>
              {items.map((item, idx) => {
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                const img =
                  item.image && String(item.image).trim()
                    ? item.image
                    : "https://via.placeholder.com/140";
                const line = qty * price;
                const isVeg = item.isVeg ?? true;

                return (
                  <motion.div
                    variants={fadeItem}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -8 }}
                    key={(item._id || item.menuItem || `${item.name}-${idx}`) + "-line"}
                    className="bg-white rounded-2xl border shadow-sm p-4 md:p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={img}
                          alt={item.name || "Cart item"}
                          className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl"
                        />
                        {/* Veg/Non-veg */}
                        <span
                          className={`absolute -bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full border shadow ${
                            isVeg
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-800">
                              {item.name || "Item"}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.description || "Delicious food awaiting you!"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-base md:text-lg font-bold text-gray-800">
                              ₹{formatINR(line)}
                            </div>
                            <div className="text-[12px] text-gray-400">₹{formatINR(price)} each</div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          {/* Stepper */}
                          <div className="inline-flex items-center border rounded-full overflow-hidden">
                            <button
                              onClick={() => handleUpdateQty(item, qty - 1)}
                              disabled={qty <= 1}
                              className={`px-3 py-1.5 md:px-4 md:py-2 transition ${
                                qty <= 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                              title="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1.5 md:px-5 md:py-2 bg-white font-medium">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item, qty + 1)}
                              className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 hover:bg-gray-100 transition"
                              title="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => handleRemove(item, idx)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Browsing */}
            <div className="pt-1">
              <Link
                to="/"
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                ← Continue browsing
              </Link>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="col-span-12 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border shadow-lg p-5 sticky top-24"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h4>

              {/* Coupon */}
              <div className="mb-4 rounded-xl border p-3 bg-gradient-to-r from-orange-50 to-pink-50">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag size={16} className="text-orange-500" />
                  Apply Coupon
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. WELCOME10, SAVE50, FREEDEL"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-black transition"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-1 min-h-[18px] text-xs">
                  {couponMsg && <span className="text-gray-600">{couponMsg}</span>}
                </div>
                {applied?.code && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs bg-white border rounded-full px-2.5 py-1">
                    <Percent size={14} className="text-emerald-600" />
                    <span className="font-semibold">{applied.code}</span>
                    <button
                      onClick={clearCoupon}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Price rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items total</span>
                  <span className="font-semibold text-gray-800">₹{formatINR(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery fee {subTotal < deliveryThreshold && !freeDelivery ? "(below ₹299)" : ""}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <>₹{formatINR(deliveryFee)}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & charges</span>
                  <span className="font-semibold text-gray-800">₹{formatINR(taxes)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-emerald-600">− ₹{formatINR(discount)}</span>
                  </div>
                )}
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">To Pay</span>
                  <span className="text-lg font-extrabold text-gray-900">₹{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Secure badge */}
              <div className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1">
                <Shield size={14} className="text-gray-400" />
                Safe & secure payments
              </div>

              {/* Checkout CTA */}
              <button
                onClick={proceedToCheckout}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold text-sm md:text-base px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </motion.div>

            {/* Mobile sticky bar */}
            <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40">
              <div className="mx-3 mb-3 rounded-2xl bg-white shadow-xl border p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">To Pay</div>
                  <div className="text-lg font-extrabold text-gray-900">₹{formatINR(grandTotal)}</div>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  Checkout <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}