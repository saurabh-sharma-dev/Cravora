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
  ShoppingCart,
  Gift,
  TrendingDown,
  Award,
  Zap,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Receipt,
} from "lucide-react";
import PageContainer from "../components/PageContainer";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

// ==================== SUB-COMPONENTS ====================

const CartHeader = ({ itemCount, deliveryThreshold }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-6 sm:p-8 text-white shadow-card mb-6 sm:mb-8"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-0.5">Your cart</h1>
            <p className="text-white/90 text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"} · Ready for checkout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20">
            <Truck className="w-4 h-4" />
            <span className="text-sm font-semibold">FREE delivery</span>
          </div>
          <span className="text-xs text-white/80">Above ₹{deliveryThreshold}</span>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyCart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4"
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 mb-6 rounded-2xl bg-surface-200 flex items-center justify-center">
        <ShoppingCart className="w-14 h-14 sm:w-16 sm:h-16 text-stone-400" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2 text-center">Your cart is empty</h3>
      <p className="text-stone-500 text-sm sm:text-base mb-8 text-center max-w-sm">
        Add dishes from your favorite restaurants and they’ll show up here.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-card transition-colors min-h-touch touch-target"
      >
        <ShoppingCart size={20} />
        Browse restaurants
        <ArrowRight size={20} />
      </Link>
      <div className="mt-10 w-full max-w-sm">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3 text-center">Try something</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["🍕 Pizza", "🍔 Burgers", "🍛 Biryani", "🍰 Desserts"].map((item) => (
            <Link
              key={item}
              to="/"
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 shadow-card hover:border-brand-200 hover:bg-brand-50/50 text-sm font-medium text-stone-700 transition-colors touch-target"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CartItem = ({ item, index, handleUpdateQty, handleRemove }) => {
  const qty = Number(item.quantity || 1);
  const price = Number(item.price || 0);
  const img = item.image && String(item.image).trim() ? item.image : "https://via.placeholder.com/140";
  const line = qty * price;
  const isVeg = item.isVeg ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-card hover:shadow-card-hover transition-shadow p-4 sm:p-5"
    >
      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-100 border border-stone-100">
            <img
              src={img}
              alt={item.name || "Cart item"}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -bottom-1 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              isVeg ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isVeg ? "Veg" : "Non-Veg"}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-stone-800 truncate">
              {item.name || "Item"}
            </h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRemove(item, index)}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 flex items-center justify-center touch-target transition-colors"
              title="Remove item"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
          <p className="text-sm text-stone-500 line-clamp-2 mb-3">
            {item.description || "Delicious food awaiting you!"}
          </p>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center rounded-xl border border-stone-200 overflow-hidden bg-surface-50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdateQty(item, qty - 1)}
                disabled={qty <= 1}
                className={`w-10 h-10 flex items-center justify-center touch-target transition-colors ${
                  qty <= 1 ? "bg-surface-100 text-stone-300 cursor-not-allowed" : "bg-white hover:bg-brand-50 text-brand-600"
                }`}
              >
                <Minus size={18} />
              </motion.button>
              <div className="w-10 h-10 flex items-center justify-center bg-white font-bold text-stone-800 tabular-nums border-x border-stone-100">
                {qty}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdateQty(item, qty + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-brand-50 text-brand-600 touch-target transition-colors"
              >
                <Plus size={18} />
              </motion.button>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-stone-800 tabular-nums">₹{formatINR(line)}</div>
              <div className="text-xs text-stone-500">₹{formatINR(price)} each</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CouponSection = ({ coupon, setCoupon, handleApplyCoupon, couponMsg, applied, clearCoupon }) => {
  const availableCoupons = [
    { code: "WELCOME10", desc: "10% off upto ₹100", icon: Gift, gradient: "from-blue-400 to-indigo-500" },
    { code: "SAVE50", desc: "Flat ₹50 off on ₹399+", icon: Percent, gradient: "from-green-400 to-emerald-500" },
    { code: "FREEDEL", desc: "Free delivery", icon: Truck, gradient: "from-orange-400 to-red-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-card p-5 sm:p-6 mb-6"
    >
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center">
            <Tag className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">Apply coupon</h3>
            <p className="text-sm text-stone-500">Save more on this order</p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-stone-800 min-h-touch"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyCoupon}
            className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-card transition-colors min-h-touch touch-target"
          >
            Apply
          </motion.button>
        </div>

        {/* Message */}
        {couponMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              applied ? "bg-green-100 border border-green-300 text-green-700" : "bg-amber-100 border border-amber-300 text-amber-700"
            }`}
          >
            {applied ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm font-medium">{couponMsg}</span>
          </motion.div>
        )}

        {/* Applied Coupon */}
        {applied?.code && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-700 mb-4"
          >
            <CheckCircle size={16} />
            <span className="font-bold">{applied.code}</span>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearCoupon}
              className="w-5 h-5 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center"
            >
              <X size={12} />
            </motion.button>
          </motion.div>
        )}

        {/* Available Coupons */}
        {!applied && (
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase mb-3">Available Coupons</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableCoupons.map((c) => {
                const Icon = c.icon;
                return (
                  <motion.button
                    key={c.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCoupon(c.code)}
                    className="relative overflow-hidden p-3 rounded-xl bg-white border border-stone-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left shadow-card hover:shadow-card-hover"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${c.gradient} opacity-10 rounded-full blur-xl`} />
                    <div className="relative flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-sm text-stone-800">{c.code}</span>
                    </div>
                    <p className="text-xs text-stone-600">{c.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SavingsHighlight = ({ discount, freeDelivery, baseDelivery }) => {
  const totalSavings = discount + (freeDelivery ? baseDelivery : 0);
  
  if (totalSavings === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      className="mb-4 p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <TrendingDown className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-700">You're saving big!</p>
          <p className="text-2xl font-extrabold text-green-900">₹{formatINR(totalSavings)}</p>
        </div>
        <Award className="w-10 h-10 text-green-400" />
      </div>
    </motion.div>
  );
};

const OrderSummary = ({
  subTotal,
  deliveryFee,
  taxes,
  discount,
  grandTotal,
  deliveryThreshold,
  freeDelivery,
  proceedToCheckout,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-card p-5 sm:p-6 sticky top-24"
    >
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800">Bill summary</h3>
            <p className="text-sm text-stone-500">Review your order</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 p-4 rounded-xl bg-surface-50 border border-stone-200 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Item total</span>
            <span className="font-semibold text-stone-800 tabular-nums">₹{formatINR(subTotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-stone-600">Delivery fee</span>
              {subTotal < deliveryThreshold && !freeDelivery && (
                <span className="text-xs text-stone-500">Add ₹{deliveryThreshold - subTotal} for free delivery</span>
              )}
            </div>
            <span className={`font-semibold tabular-nums ${deliveryFee === 0 ? "text-emerald-600" : "text-stone-800"}`}>
              {deliveryFee === 0 ? (
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  FREE
                </span>
              ) : (
                `₹${formatINR(deliveryFee)}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Taxes & Charges</span>
            <span className="font-semibold text-stone-800 tabular-nums">₹{formatINR(taxes)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Discount</span>
              <span className="font-semibold text-emerald-600">−₹{formatINR(discount)}</span>
            </div>
          )}

          <div className="h-px bg-stone-200 my-2" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-stone-800">Total Amount</span>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-800 tabular-nums">
                ₹{formatINR(grandTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-4">
          <Shield className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-700">100% Safe & Secure</p>
            <p className="text-[10px] text-green-600">SSL encrypted checkout</p>
          </div>
        </div>

        {/* Checkout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={proceedToCheckout}
          className="w-full px-6 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg shadow-card hover:shadow-card-hover transition-all min-h-touch touch-target"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles size={20} />
            Proceed to Checkout
            <ArrowRight size={20} />
          </span>
        </motion.button>

        <Link
          to="/"
          className="mt-3 block text-center text-sm text-brand-600 hover:text-brand-500 font-medium hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>
    </motion.div>
  );
};

const MobileCheckoutBar = ({ grandTotal, proceedToCheckout }) => {
  return (
    <div className="lg:hidden fixed left-0 right-0 z-50 bottom-20 pb-safe">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="mx-3 mb-2 rounded-2xl bg-white shadow-card-hover border border-stone-200 p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-500">Total Amount</div>
            <div className="text-xl font-extrabold text-stone-800 tabular-nums">
              ₹{formatINR(grandTotal)}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={proceedToCheckout}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-card flex items-center gap-2 min-h-touch touch-target"
          >
            Checkout
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function CartPage() {
  const navigate = useNavigate();
  const { cart = [], totalPrice, removeFromCart, updateQuantity } = useContext(CartContext);
  const items = Array.isArray(cart) ? cart : [];

  // Subtotal
  const subTotal = useMemo(() => {
    if (typeof totalPrice === "number") return totalPrice;
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      return sum + qty * price;
    }, 0);
  }, [items, totalPrice]);

  // Coupon state
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");

  const deliveryThreshold = 299;
  const baseDelivery = subTotal >= deliveryThreshold ? 0 : 29;
  const freeDelivery = applied?.freeDelivery ? true : false;
  const deliveryFee = freeDelivery ? 0 : baseDelivery;

  const taxes = Math.round(subTotal * 0.05);
  const discount = Math.min(applied?.discount || 0, subTotal);
  const grandTotal = Math.max(subTotal + deliveryFee + taxes - discount, 0);

  const handleApplyCoupon = () => {
    const code = String(coupon || "").trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code");
      setTimeout(() => setCouponMsg(""), 2000);
      return;
    }

    let next = null;
    if (code === "WELCOME10") {
      const disc = Math.min(Math.floor(subTotal * 0.1), 100);
      if (disc <= 0) {
        setCouponMsg("Not eligible for this coupon");
        setTimeout(() => setCouponMsg(""), 2000);
        return;
      }
      next = { code, discount: disc, freeDelivery: false };
      setApplied(next);
      setCouponMsg(`🎉 You saved ₹${disc} with ${code}`);
    } else if (code === "SAVE50") {
      if (subTotal < 399) {
        setCouponMsg("Minimum order ₹399 required");
        setTimeout(() => setCouponMsg(""), 2000);
        return;
      }
      next = { code, discount: 50, freeDelivery: false };
      setApplied(next);
      setCouponMsg("🎉 Flat ₹50 off applied");
    } else if (code === "FREEDEL") {
      next = { code, discount: 0, freeDelivery: true };
      setApplied(next);
      setCouponMsg("🎉 Free delivery unlocked");
    } else {
      setCouponMsg("Invalid or expired coupon code");
      setTimeout(() => setCouponMsg(""), 2000);
    }
  };

  const clearCoupon = () => {
    setApplied(null);
    setCoupon("");
    setCouponMsg("");
  };

  const handleUpdateQty = (item, nextQty) => {
    const id = item._id || item.menuItem || item.id;
    if (!id || nextQty < 1) return;
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
    <div className="min-h-full bg-surface-50">
      <PageContainer className="py-6 sm:py-8">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <CartHeader itemCount={items.length} deliveryThreshold={deliveryThreshold} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Items + Coupons */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <CartItem
                        key={item._id || item.menuItem || `item-${idx}`}
                        item={item}
                        index={idx}
                        handleUpdateQty={handleUpdateQty}
                        handleRemove={handleRemove}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Coupon Section */}
                <CouponSection
                  coupon={coupon}
                  setCoupon={setCoupon}
                  handleApplyCoupon={handleApplyCoupon}
                  couponMsg={couponMsg}
                  applied={applied}
                  clearCoupon={clearCoupon}
                />
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-1">
                <SavingsHighlight
                  discount={discount}
                  freeDelivery={freeDelivery}
                  baseDelivery={baseDelivery}
                />
                <OrderSummary
                  subTotal={subTotal}
                  deliveryFee={deliveryFee}
                  taxes={taxes}
                  discount={discount}
                  grandTotal={grandTotal}
                  deliveryThreshold={deliveryThreshold}
                  freeDelivery={freeDelivery}
                  proceedToCheckout={proceedToCheckout}
                />
              </div>
            </div>

            {/* Mobile Checkout Bar */}
            <MobileCheckoutBar grandTotal={grandTotal} proceedToCheckout={proceedToCheckout} />
          </>
        )}
      </PageContainer>
    </div>
  );
}