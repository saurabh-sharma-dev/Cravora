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
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function CheckoutPage() {
  const { cart = [], totalPrice = 0 } = useContext(CartContext);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  // saved addresses
  const [savedHome, setSavedHome] = useState("");
  const [savedWork, setSavedWork] = useState("");
  const [addrMsg, setAddrMsg] = useState("");

  const navigate = useNavigate();

  // Normalize items and PRESERVE menuItem + restaurant
  const items = useMemo(
    () =>
      (cart || []).map((it, idx) => {
        const menuItem = it.menuItem || it._id || null;
        const restaurant =
          typeof it.restaurant === "object" ? it.restaurant?._id : it.restaurant || null;
        return {
          id: it._id || it.menuItem || `i-${idx}`,
          menuItem, // REQUIRED later
          restaurant, // REQUIRED later
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

  const computedTotal = useMemo(() => {
    const sum = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    return totalPrice || sum;
  }, [items, totalPrice]);

  // Ensure single restaurant and valid refs
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

  // Load saved addresses
  useEffect(() => {
    try {
      setSavedHome(localStorage.getItem("addr:home") || "");
      setSavedWork(localStorage.getItem("addr:work") || "");
    } catch {}
  }, []);

  // Helpers: address actions
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
      setAddrMsg(`Saved as ${key === "home" ? "Home" : "Work"}`);
      setTimeout(() => setAddrMsg(""), 1500);
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
        setAddrMsg("Location fetched (edit if needed)");
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

    navigate("/confirm-order", {
      state: {
        cart: items,
        totalPrice: computedTotal,
        address: address.trim(),
        paymentMethod,
        notes: notes.trim() || undefined,
      },
    });
  };

  // Step indicator chip
  const Step = ({ label, active }) => (
    <div className="flex items-center gap-2">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
          active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        {label[0]}
      </div>
      <span className={`text-sm ${active ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-green-50 py-8 px-3">
      {/* Steps */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Step label="Cart" active={false} />
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Step label="Checkout" active />
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Step label="Confirm" active={false} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-5 md:p-6 mx-auto"
      >
        {/* Warnings */}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Your cart is empty.{" "}
                <Link to="/restaurants" className="underline ml-1">
                  Browse
                </Link>
              </motion.div>
            )}
            {mixedRestaurants && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                You have items from multiple restaurants. Please keep items from one restaurant.
              </motion.div>
            )}
            {missingRestaurantRef && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Some items are missing their restaurant reference. Please re-add items from the restaurant page.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Address + Payment */}
          <div className="space-y-5">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Delivery Address
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applySaved("home")}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      savedHome ? "text-gray-700 hover:bg-gray-50" : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={savedHome ? "Use saved Home address" : "No Home address saved"}
                  >
                    <Home className="w-3.5 h-3.5 inline mr-1" />
                    Home
                  </button>
                  <button
                    onClick={() => applySaved("work")}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      savedWork ? "text-gray-700 hover:bg-gray-50" : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={savedWork ? "Use saved Work address" : "No Work address saved"}
                  >
                    <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                    Work
                  </button>
                </div>
              </div>

              <textarea
                className={`mt-3 w-full p-3 border rounded-lg focus:ring-2 resize-none text-gray-700 placeholder-gray-400 ${
                  touched && !validAddress
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-200 focus:ring-green-400"
                }`}
                rows={3}
                placeholder="Flat/House No., Street, Area, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => setTouched(true)}
              />

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="inline-flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1.5 text-gray-700 hover:bg-gray-50"
                >
                  <Navigation className="w-3.5 h-3.5 text-green-600" />
                  Use current location
                </button>
                <button
                  type="button"
                  onClick={() => saveCurrent("home")}
                  className="inline-flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1.5 text-gray-700 hover:bg-gray-50"
                >
                  <Home className="w-3.5 h-3.5" />
                  Save as Home
                </button>
                <button
                  type="button"
                  onClick={() => saveCurrent("work")}
                  className="inline-flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1.5 text-gray-700 hover:bg-gray-50"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Save as Work
                </button>
                <span className="text-xs text-gray-500 inline-flex items-center gap-1 ml-auto">
                  <CheckCircle2 className={`w-4 h-4 ${validAddress ? "text-green-600" : "text-gray-400"}`} />
                  {validAddress ? "Looks good" : "Min 5 characters"}
                </span>
              </div>

              <AnimatePresence>
                {addrMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 text-xs text-gray-600"
                  >
                    {addrMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes */}
              <div className="mt-3">
                <label className="text-sm text-gray-700 mb-1 inline-block">Delivery notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring the bell, call on arrival"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 border-gray-200"
                />
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" /> Payment Method
              </h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-green-500 w-4 h-4"
                  />
                  <span className="text-gray-800 text-sm">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                  <input type="radio" value="online" checked={false} disabled className="w-4 h-4" />
                  <span className="text-gray-500 text-sm">Online (Coming Soon)</span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Right: Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-white p-4 md:p-5 shadow-lg md:sticky md:top-24 h-fit"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" /> Order Summary
            </h3>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 text-sm">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center border-b border-gray-100 pb-1"
                >
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    ₹{formatINR(item.price * item.quantity)}
                  </span>
                </motion.div>
              ))}
              {items.length === 0 && (
                <p className="text-gray-500">
                  No items in cart. <Link to="/restaurants" className="underline">Browse</Link>
                </p>
              )}
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items total</span>
                <span className="font-semibold text-gray-800">₹{formatINR(computedTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Delivery & taxes shown at order confirmation</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-700">To Pay</span>
                <span className="text-lg font-extrabold text-gray-900">₹{formatINR(computedTotal)}</span>
              </div>

              <div className="mt-3 text-[11px] text-gray-500 inline-flex items-center gap-1">
                <Shield size={12} className="text-gray-400" />
                Safe & secure payments
              </div>

              <motion.button
                whileTap={{ scale: canContinue ? 0.98 : 1 }}
                whileHover={{ scale: canContinue ? 1.02 : 1 }}
                onClick={handleContinue}
                disabled={!canContinue}
                className={`mt-4 w-full px-5 py-3 rounded-xl font-bold text-white text-sm md:text-base shadow-md transition ${
                  !canContinue
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
              >
                {items.length === 0
                  ? "Your cart is empty"
                  : mixedRestaurants
                  ? "Fix cart (Multiple restaurants)"
                  : missingRestaurantRef
                  ? "Re-add items"
                  : validAddress
                  ? "Place Order →"
                  : "Enter address to continue"}
              </motion.button>

              <div className="mt-3 text-center">
                <Link to="/cart" className="text-sm text-blue-600 hover:underline">
                  ← Edit Cart
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}