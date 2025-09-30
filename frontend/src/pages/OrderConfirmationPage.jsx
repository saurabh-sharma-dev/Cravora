// src/pages/OrderConfirmationPage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { CartContext } from "../context/CartContext";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Receipt,
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cart: ctxCart = [], totalPrice: ctxTotal = 0, clearCart } = useContext(CartContext);

  // Coming from CheckoutPage (optional)
  const state = location.state || {};
  const stateCart = Array.isArray(state.cart) ? state.cart : [];
  const stateTotal = Number(state.totalPrice || 0);
  const initialAddress = state.address || "";
  const initialPaymentMethod = state.paymentMethod || "cod";
  const stateNotes = state.notes || "";

  // Prefer state from checkout; fallback to context
  const rawItems = stateCart.length ? stateCart : ctxCart;
  const subTotal = stateCart.length ? stateTotal : ctxTotal;

  // Form states
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [notes, setNotes] = useState(stateNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no items
  useEffect(() => {
    if (!rawItems || rawItems.length === 0) {
      navigate("/checkout", { replace: true });
    }
  }, [rawItems, navigate]);

  // Normalize payment method
  const normalizePaymentMethod = (pm) => {
    const p = String(pm || "").toLowerCase();
    if (!p || p === "cod" || p.includes("cash")) return "cod";
    if (p.includes("card")) return "card";
    if (p.includes("upi")) return "upi";
    if (p.includes("online")) return "online";
    return p;
    // allowed on backend: cod | cash | card | upi | online
  };
  const payment = useMemo(() => normalizePaymentMethod(paymentMethod), [paymentMethod]);

  // Map items defensively and validate
  const items = useMemo(() => {
    return (rawItems || []).map((it, idx) => {
      const menuItem = it.menuItem || it._id || null;
      const rest = typeof it.restaurant === "object" ? it.restaurant?._id : it.restaurant || null;
      return {
        id: it._id || it.menuItem || `i-${idx}`,
        name: it.name || "Item",
        image:
          it.image && String(it.image).trim()
            ? it.image
            : "https://via.placeholder.com/80x80?text=Food",
        price: Number(it.price || 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
        restaurant: rest,
        menuItem,
        isVeg: it.isVeg ?? true,
      };
    });
  }, [rawItems]);

  // Restaurant checks
  const { restaurantId, mixedRestaurants, missingRestaurantRef, invalidMenuItems } = useMemo(() => {
    const restSet = new Set(items.map((i) => i.restaurant).filter(Boolean).map(String));
    const missingRest = items.some((i) => !i.restaurant);
    const invalidMenu = items.some((i) => !i.menuItem);
    return {
      restaurantId: restSet.values().next().value || null,
      mixedRestaurants: restSet.size > 1,
      missingRestaurantRef: missingRest,
      invalidMenuItems: invalidMenu,
    };
  }, [items]);

  // Totals (Swiggy-like)
  const deliveryThreshold = 299;
  const baseDelivery = subTotal >= deliveryThreshold ? 0 : 29;
  const taxes = Math.round(subTotal * 0.05); // illustrative
  const toPay = Math.max(subTotal + baseDelivery + taxes, 0);

  // Address + readiness
  const validAddress = String(address || "").trim().length >= 5;
  const canPlaceOrder =
    !loading &&
    items.length > 0 &&
    validAddress &&
    !mixedRestaurants &&
    !missingRestaurantRef &&
    !invalidMenuItems &&
    !!restaurantId;

  const placeOrder = async () => {
    setError("");

    if (!canPlaceOrder) {
      if (mixedRestaurants) {
        setError("You can order from one restaurant at a time. Please keep only one restaurant’s items.");
      } else if (missingRestaurantRef) {
        setError("Some items are missing their restaurant reference. Please re-add items from the restaurant page.");
      } else if (invalidMenuItems) {
        setError("Some items are missing their menu reference. Please re-add items from the restaurant page.");
      } else if (!validAddress) {
        setError("Please enter a valid address (min 5 characters).");
      } else if (!restaurantId) {
        setError("Restaurant is required. Please add items again.");
      }
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        restaurant: restaurantId, // REQUIRED by backend
        items: items.map((it) => ({
          menuItem: it.menuItem, // REQUIRED
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        address: address.trim(),
        paymentMethod: payment, // cod | card | upi | online
        notes: notes?.trim() || undefined,
      };

      const res = await API.post("/orders", orderData);
      const order = res?.data?.order || res?.data;

      clearCart();
      navigate("/order-success", { replace: true, state: { order } });
    } catch (err) {
      console.error("❌ Place order error:", err);
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        "Failed to place order. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/checkout")}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
          title="Back to Checkout"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Checkout
        </button>

        <div className="hidden md:inline-flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
          <Shield className="w-3.5 h-3.5" />
          Secure & encrypted
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center">Confirm Your Order</h2>
          <p className="text-center opacity-90 mt-1">Review details and place your order</p>
        </div>

        {/* Main grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Address + Payment + Delivery */}
          <div className="space-y-4">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gray-50 border shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-800">Delivery Address</h3>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Flat/House No., Street, Area, City"
                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none transition ${
                  validAddress ? "border-gray-300 focus:ring-green-300" : "border-red-300 focus:ring-red-200"
                }`}
              />
              <div className="mt-2 text-xs flex items-center gap-1">
                {validAddress ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Looks good</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Min 5 characters required</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gray-50 border shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Payment Method</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="font-medium">
                  {payment === "cod"
                    ? "Cash on Delivery"
                    : payment === "upi"
                    ? "UPI"
                    : payment === "card"
                    ? "Card"
                    : "Online"}
                </span>
              </div>
            </motion.div>

            {/* Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gray-50 border shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Delivery</h3>
              </div>
              <p className="text-sm text-gray-700">
                Estimated delivery in <span className="font-semibold">30–45 mins</span> after confirmation.
              </p>

              {/* Notes (optional) */}
              <div className="mt-3">
                <label className="text-sm text-gray-700 mb-1 inline-block">Delivery notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring the bell, call on arrival"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-300 border-gray-200"
                />
              </div>
            </motion.div>
          </div>

          {/* Right: Items + Summary + CTA */}
          <div className="space-y-4">
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gray-50 border shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Your Items</h3>
                <span className="text-xs text-gray-500">{items.length} item{items.length === 1 ? "" : "s"}</span>
              </div>
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-gray-900">
                      ₹{formatINR(item.price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>

              <AnimatePresence>
                {(mixedRestaurants || missingRestaurantRef || invalidMenuItems || !items.length) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 space-y-1"
                  >
                    {mixedRestaurants && (
                      <p className="text-sm text-red-600">
                        You have items from multiple restaurants. Please keep only one restaurant's items.
                      </p>
                    )}
                    {missingRestaurantRef && (
                      <p className="text-sm text-red-600">
                        Some items are missing their restaurant reference. Please re-add items from the restaurant page.
                      </p>
                    )}
                    {invalidMenuItems && (
                      <p className="text-sm text-red-600">
                        Some items are missing their menu reference. Please re-add items from the restaurant page.
                      </p>
                    )}
                    {!items.length && (
                      <p className="text-sm text-gray-600">
                        No items in cart. <Link className="underline" to="/restaurants">Browse restaurants</Link>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border shadow-inner"
            >
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items total</span>
                <span>₹{formatINR(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee {subTotal < deliveryThreshold ? "(below ₹299)" : ""}</span>
                <span>{baseDelivery === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `₹${formatINR(baseDelivery)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & charges</span>
                <span>₹{formatINR(taxes)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>To Pay</span>
                <span>₹{formatINR(toPay)}</span>
              </div>

              <div className="mt-2 text-[11px] text-gray-500 inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                Safe & secure payments
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Link to="/cart" className="text-sm text-blue-600 hover:underline">
                ← Edit Cart
              </Link>
              <button
                onClick={placeOrder}
                disabled={!canPlaceOrder}
                className={`inline-flex items-center gap-2 w-auto min-w-[200px] justify-center px-5 py-3 rounded-xl text-white font-semibold transition ${
                  canPlaceOrder
                    ? "bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                title={canPlaceOrder ? "Place Order" : "Complete details to continue"}
              >
                {loading ? "Placing Order..." : "Confirm & Place Order"}
                <Receipt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}