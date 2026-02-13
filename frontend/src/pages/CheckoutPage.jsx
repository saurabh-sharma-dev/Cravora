// src/pages/CheckoutPage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "../context/CartContext";
import {
  MapPin,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  Briefcase,
  Navigation,
  Shield,
  Package,
  Clock,
  Sparkles,
  ArrowLeft,
  Banknote,
  Lock,
  CheckCircle,
  MapPinned,
  Tag,
  X,
  Truck,
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

const DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE_DEFAULT = 30;
const TAX_RATE = 0.05;

const PROMOS = {
  BITEDASH10: { type: "percent", value: 10, maxDiscount: 100, label: "10% off (max ₹100)" },
  FREESHIP: { type: "freeDelivery", label: "Free delivery" },
  SAVE50: { type: "flat", value: 50, minOrder: 399, label: "₹50 off on ₹399+" },
};

// ==================== SUB-COMPONENTS ====================

const StepIndicator = ({ currentStep = 2 }) => {
  const steps = [
    { label: "Cart", icon: ShoppingCart },
    { label: "Checkout", icon: MapPin },
    { label: "Confirm", icon: CheckCircle },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
      {steps.map((step, idx) => {
        const isActive = idx + 1 === currentStep;
        const isCompleted = idx + 1 < currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.label}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className={`
                  relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full
                  transition-all duration-300 shadow-lg
                  ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white scale-110"
                      : isCompleted
                      ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }
                `}
              >
                <Icon size={isActive ? 22 : 18} />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span
                className={`
                  hidden md:block text-sm font-semibold transition-colors
                  ${isActive ? "text-gray-900" : isCompleted ? "text-green-600" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </motion.div>
            {idx < steps.length - 1 && (
              <div className="flex items-center">
                <ChevronRight
                  className={`w-5 h-5 ${isCompleted ? "text-green-500" : "text-gray-300"}`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const AddressCard = ({
  address,
  setAddress,
  touched,
  validAddress,
  savedHome,
  savedWork,
  applySaved,
  saveCurrent,
  useCurrentLocation,
  addrMsg,
  notes,
  setNotes,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-100/50 shadow-xl p-6"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/40 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <MapPinned className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
              <p className="text-xs text-gray-500">Where should we deliver your order?</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applySaved("home")}
            disabled={!savedHome}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all shadow-sm
              ${
                savedHome
                  ? "bg-white hover:bg-emerald-50 text-gray-700 border border-emerald-200 hover:border-emerald-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }
            `}
          >
            <Home size={16} />
            {savedHome ? "Use Home" : "No Home"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applySaved("work")}
            disabled={!savedWork}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all shadow-sm
              ${
                savedWork
                  ? "bg-white hover:bg-emerald-50 text-gray-700 border border-emerald-200 hover:border-emerald-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }
            `}
          >
            <Briefcase size={16} />
            {savedWork ? "Use Work" : "No Work"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={useCurrentLocation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Navigation size={16} />
            Current Location
          </motion.button>
        </div>

        {/* Address Input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              className={`
                w-full p-4 border-2 rounded-xl resize-none text-gray-700 
                placeholder-gray-400 transition-all focus:outline-none
                bg-white/80 backdrop-blur-sm shadow-sm
                ${
                  touched && !validAddress
                    ? "border-red-300 focus:ring-4 focus:ring-red-100"
                    : "border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                }
              `}
              rows={4}
              placeholder="🏠 Enter your complete address (Flat/House No., Street, Area, City, Pincode)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="absolute bottom-3 right-3">
              {validAddress ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 size={18} className="text-white" />
                </motion.div>
              ) : (
                touched && (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Save Options */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveCurrent("home")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 transition-all"
              >
                <Home size={14} />
                Save as Home
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveCurrent("work")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 transition-all"
              >
                <Briefcase size={14} />
                Save as Work
              </motion.button>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                validAddress ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {validAddress ? (
                <>
                  <CheckCircle size={14} />
                  Looks good!
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  Min 5 characters
                </>
              )}
            </div>
          </div>

          {/* Address Message */}
          <AnimatePresence>
            {addrMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"
              >
                <CheckCircle2 size={16} />
                {addrMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery Notes */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock size={16} className="text-emerald-600" />
              Delivery Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Ring the bell twice, Call on arrival, Leave at door"
              className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/80 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PaymentCard = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border border-blue-100/50 shadow-xl p-6"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
            <p className="text-xs text-gray-500">Choose how you'd like to pay</p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          {/* Cash on Delivery */}
          <motion.label
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
              border-2 shadow-sm hover:shadow-md
              ${
                paymentMethod === "cod"
                  ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-400 shadow-emerald-200"
                  : "bg-white border-gray-200 hover:border-emerald-200"
              }
            `}
          >
            <input
              type="radio"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 accent-emerald-500"
            />
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethod === "cod"
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30"
                    : "bg-gray-100"
                }`}
              >
                <Banknote size={24} className={paymentMethod === "cod" ? "text-white" : "text-gray-400"} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Cash on Delivery</div>
                <div className="text-xs text-gray-500">Pay when you receive your order</div>
              </div>
              {paymentMethod === "cod" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </motion.div>
              )}
            </div>
          </motion.label>

          {/* Online Payment (Disabled) */}
          <div className="relative">
            <label
              className="
                flex items-center gap-4 p-4 rounded-xl cursor-not-allowed
                bg-gray-50 border-2 border-gray-200 opacity-60
              "
            >
              <input type="radio" value="online" disabled className="w-5 h-5" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Lock size={24} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-500">Online Payment</div>
                  <div className="text-xs text-gray-400">UPI, Cards, Wallets</div>
                </div>
              </div>
            </label>
            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-xs text-green-700 font-medium">
            100% Safe & Secure Payments
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const OrderSummaryCard = ({
  items,
  subTotal,
  deliveryFee,
  taxes,
  discount,
  grandTotal,
  canContinue,
  handleContinue,
  promoCode,
  setPromoCode,
  appliedPromo,
  onApplyPromo,
  onClearPromo,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-purple-50/30 border border-purple-100/50 shadow-2xl p-6 md:sticky md:top-24"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-100/40 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              <p className="text-xs text-gray-500">{items.length} item(s)</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4 custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full border-2 border-white ${
                      item.isVeg ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{formatINR(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">₹{formatINR(item.price)} each</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <Link to="/" className="text-purple-600 hover:underline text-sm font-medium">
                Browse Restaurants
              </Link>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            {/* Promo code */}
            <div className="mb-4">
              {appliedPromo ? (
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-700">
                    <CheckCircle size={16} />
                    {appliedPromo} applied
                  </span>
                  <button
                    type="button"
                    onClick={onClearPromo}
                    className="text-xs font-medium text-green-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <button
                    type="button"
                    onClick={onApplyPromo}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 border border-purple-100/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item total</span>
                <span className="font-semibold text-gray-900">₹{formatINR(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery fee</span>
                <span className={deliveryFee === 0 ? "font-semibold text-green-600" : "font-semibold text-gray-900"}>
                  {deliveryFee === 0 ? "FREE" : `₹${formatINR(deliveryFee)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & charges</span>
                <span className="font-semibold text-gray-900">₹{formatINR(taxes)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">−₹{formatINR(discount)}</span>
                </div>
              )}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">To pay</span>
                <div className="text-right">
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{formatINR(grandTotal)}
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: canContinue ? 1.02 : 1 }}
              whileTap={{ scale: canContinue ? 0.98 : 1 }}
              onClick={handleContinue}
              disabled={!canContinue}
              className={`
                mt-4 w-full px-6 py-4 rounded-xl font-bold text-white text-base
                shadow-lg transition-all relative overflow-hidden group
                ${
                  canContinue
                    ? "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 bg-size-200 hover:bg-pos-100 shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/50"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {canContinue ? (
                  <>
                    <Sparkles size={20} />
                    Place Order
                    <ChevronRight size={20} />
                  </>
                ) : (
                  "Complete address to continue"
                )}
              </span>
              {canContinue && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </motion.button>

            <Link
              to="/cart"
              className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              <ArrowLeft size={16} />
              Edit Cart
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function CheckoutPage() {
  const { cart = [], totalPrice = 0 } = useContext(CartContext);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [scheduledSlot, setScheduledSlot] = useState("now");

  const [savedHome, setSavedHome] = useState("");
  const [savedWork, setSavedWork] = useState("");
  const [addrMsg, setAddrMsg] = useState("");

  const navigate = useNavigate();

  const items = useMemo(
    () =>
      (cart || []).map((it, idx) => {
        const menuItem = it.menuItem || it._id || null;
        const restaurant =
          typeof it.restaurant === "object" ? it.restaurant?._id : it.restaurant || null;
        return {
          id: it._id || it.menuItem || `i-${idx}`,
          menuItem,
          restaurant,
          name: it.name || "Item",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image:
            it.image && String(it.image).trim()
              ? it.image
              : "https://via.placeholder.com/80x80?text=Food",
          isVeg: it.isVeg ?? true,
        };
      }),
    [cart]
  );

  const subTotal = useMemo(() => {
    const sum = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    return totalPrice || sum;
  }, [items, totalPrice]);

  const deliveryFee = useMemo(() => {
    if (appliedPromo?.type === "freeDelivery") return 0;
    return subTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_DEFAULT;
  }, [subTotal, appliedPromo]);

  const taxes = useMemo(() => Math.round(subTotal * TAX_RATE), [subTotal]);

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
      const d = Math.round((subTotal * appliedPromo.value) / 100);
      return Math.min(d, appliedPromo.maxDiscount || d);
    }
    if (appliedPromo.type === "flat" && subTotal >= (appliedPromo.minOrder || 0)) {
      return appliedPromo.value;
    }
    return 0;
  }, [subTotal, appliedPromo]);

  const grandTotal = useMemo(
    () => Math.max(0, subTotal + deliveryFee + taxes - discount),
    [subTotal, deliveryFee, taxes, discount]
  );

  const handleApplyPromo = () => {
    const code = String(promoCode || "").trim().toUpperCase();
    if (!code) return;
    const promo = PROMOS[code];
    if (!promo) {
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo({ ...promo, code });
  };

  const handleClearPromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  const { mixedRestaurants, missingRestaurantRef } = useMemo(() => {
    const set = new Set(
      items
        .map((i) => i.restaurant)
        .filter(Boolean)
        .map((r) => String(r))
    );
    const missing = items.some((i) => !i.restaurant);
    return { mixedRestaurants: set.size > 1, missingRestaurantRef: missing };
  }, [items]);

  const validAddress = address.trim().length >= 5;
  const canContinue =
    items.length > 0 && validAddress && !mixedRestaurants && !missingRestaurantRef;

  useEffect(() => {
    try {
      setSavedHome(localStorage.getItem("addr:home") || "");
      setSavedWork(localStorage.getItem("addr:work") || "");
    } catch {}
  }, []);

  const applySaved = (key) => {
    if (key === "home" && savedHome) setAddress(savedHome);
    if (key === "work" && savedWork) setAddress(savedWork);
    if ((key === "home" && !savedHome) || (key === "work" && !savedWork)) {
      setAddrMsg("No saved address found for this slot");
      setTimeout(() => setAddrMsg(""), 2000);
    }
  };

  const saveCurrent = (key) => {
    const val = address.trim();
    if (val.length < 5) {
      setAddrMsg("Enter a valid address to save");
      setTimeout(() => setAddrMsg(""), 2000);
      return;
    }
    try {
      localStorage.setItem(`addr:${key}`, val);
      if (key === "home") setSavedHome(val);
      if (key === "work") setSavedWork(val);
      setAddrMsg(`✓ Saved as ${key === "home" ? "Home" : "Work"}`);
      setTimeout(() => setAddrMsg(""), 2000);
    } catch {}
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddrMsg("Geolocation not supported");
      setTimeout(() => setAddrMsg(""), 2000);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords || {};
        const txt = `Current Location: ${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`;
        setAddress((prev) => (prev?.trim()?.length ? prev : txt));
        setAddrMsg("✓ Location fetched (edit if needed)");
        setTimeout(() => setAddrMsg(""), 2000);
      },
      () => {
        setAddrMsg("Unable to fetch location");
        setTimeout(() => setAddrMsg(""), 2000);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleContinue = () => {
    setTouched(true);
    if (!canContinue) return;

    let finalNotes = notes.trim();
    if (scheduledSlot && scheduledSlot !== "now") {
      finalNotes = finalNotes
        ? `${finalNotes}. Schedule: ${scheduledSlot}`
        : `Schedule: ${scheduledSlot}`;
    }

    navigate("/confirm-order", {
      state: {
        cart: items,
        totalPrice: subTotal,
        totalToPay: grandTotal,
        deliveryFee,
        discount,
        address: address.trim(),
        paymentMethod,
        notes: finalNotes || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Step Indicator */}
        <StepIndicator currentStep={2} />

        {/* Warning Messages */}
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">Your cart is empty</p>
                  <Link to="/restaurants" className="text-sm text-yellow-700 hover:underline">
                    Browse restaurants and add items to your cart
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {mixedRestaurants && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Multiple restaurants detected</p>
                  <p className="text-sm text-red-700">
                    Please keep items from a single restaurant only
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {missingRestaurantRef && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900">Invalid cart items</p>
                  <p className="text-sm text-orange-700">
                    Some items are missing restaurant information. Please re-add them.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            <AddressCard
              address={address}
              setAddress={setAddress}
              touched={touched}
              validAddress={validAddress}
              savedHome={savedHome}
              savedWork={savedWork}
              applySaved={applySaved}
              saveCurrent={saveCurrent}
              useCurrentLocation={useCurrentLocation}
              addrMsg={addrMsg}
              notes={notes}
              setNotes={setNotes}
            />

            {/* Scheduled delivery */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-gray-100 shadow-lg p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delivery time</h3>
                  <p className="text-xs text-gray-500">When do you want your order?</p>
                </div>
              </div>
              <select
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 text-gray-700 font-medium"
              >
                <option value="now">As soon as possible</option>
                <option value="Today 7-8 PM">Today 7:00 – 8:00 PM</option>
                <option value="Today 8-9 PM">Today 8:00 – 9:00 PM</option>
                <option value="Tomorrow 12-1 PM">Tomorrow 12:00 – 1:00 PM</option>
                <option value="Tomorrow 7-8 PM">Tomorrow 7:00 – 8:00 PM</option>
              </select>
            </motion.div>

            <PaymentCard paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              items={items}
              subTotal={subTotal}
              deliveryFee={deliveryFee}
              taxes={taxes}
              discount={discount}
              grandTotal={grandTotal}
              canContinue={canContinue}
              handleContinue={handleContinue}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              appliedPromo={appliedPromo ? `${appliedPromo.code} – ${appliedPromo.label}` : null}
              onApplyPromo={handleApplyPromo}
              onClearPromo={handleClearPromo}
            />
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-100 {
          background-position: 100% 0;
        }
      `}</style>
    </div>
  );
}