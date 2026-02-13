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
  Package,
  Clock,
  DollarSign,
  Sparkles,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  Edit3,
  Zap,
  Award,
  Banknote,
  Wallet,
  Info,
  TrendingUp,
  Gift,
  Star,
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

// ==================== SUB-COMPONENTS ====================

const StepIndicator = ({ currentStep = 3 }) => {
  const steps = [
    { label: "Cart", icon: ShoppingCart, color: "from-blue-500 to-cyan-500" },
    { label: "Checkout", icon: MapPin, color: "from-purple-500 to-pink-500" },
    { label: "Confirm", icon: CheckCircle, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-0 p-2 rounded-2xl bg-white shadow-xl border border-gray-100">
          {steps.map((step, idx) => {
            const isActive = idx + 1 === currentStep;
            const isCompleted = idx + 1 < currentStep;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
                  className={`
                    flex items-center gap-3 px-5 py-3 rounded-xl transition-all
                    ${isActive ? 'shadow-lg' : ''}
                  `}
                >
                  {/* Icon Circle */}
                  <div className="relative">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`
                        relative flex items-center justify-center w-12 h-12 rounded-xl
                        transition-all duration-300 shadow-lg
                        ${
                          isActive
                            ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110`
                            : isCompleted
                            ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white"
                            : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                        }
                      `}
                    >
                      <Icon size={isActive ? 24 : 20} strokeWidth={2.5} />
                    </motion.div>

                    {/* Checkmark Badge */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="hidden md:block">
                    <div
                      className={`
                        text-sm font-bold transition-colors
                        ${isActive ? "text-gray-900" : isCompleted ? "text-emerald-600" : "text-gray-400"}
                      `}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isActive ? "In Progress" : isCompleted ? "Completed" : "Pending"}
                    </div>
                  </div>
                </motion.div>

                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="flex items-center px-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: idx * 0.15 + 0.2 }}
                      className={`
                        h-0.5 w-8 md:w-12 rounded-full origin-left
                        ${isCompleted ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gray-200"}
                      `}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AddressSection = ({ address, setAddress, validAddress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-blue-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
            >
              <MapPin className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-1">Delivery Address</h3>
              <p className="text-sm text-gray-600 font-medium">Where should we deliver your order?</p>
            </div>
          </div>
          
          {validAddress && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              <span className="text-sm font-bold">Verified</span>
            </motion.div>
          )}
        </div>

        {/* Address Input */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Info size={16} className="text-indigo-600" />
            Complete Address
          </label>
          
          <div className="relative">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              placeholder="🏠 House No., Building Name, Street, Area, Landmark, City, State, PIN Code"
              className={`
                w-full p-5 border-2 rounded-2xl resize-none text-gray-800 font-medium
                placeholder-gray-400 transition-all focus:outline-none
                bg-white/90 backdrop-blur-sm shadow-inner
                ${
                  validAddress
                    ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    : "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                }
              `}
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 text-xs font-semibold">
              <span className={validAddress ? "text-emerald-600" : "text-red-600"}>
                {address.length}/100
              </span>
            </div>
          </div>

          {/* Validation Message */}
          <AnimatePresence>
            {!validAddress && address.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
              >
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  Please enter at least 5 characters for a valid address
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tip */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-900 mb-1">💡 Pro Tip</p>
                <p className="text-xs text-blue-700">
                  Add landmarks for faster delivery. Example: "Near City Mall, Behind SBI Bank"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PaymentSection = ({ payment, notes, setNotes }) => {
  const paymentConfig = {
    cod: {
      icon: Banknote,
      label: "Cash on Delivery",
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50/50 via-green-50/30 to-teal-50/50",
      badge: "Pay when you receive",
      color: "emerald"
    },
    card: {
      icon: CreditCard,
      label: "Card Payment",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50/50 via-pink-50/30 to-rose-50/50",
      badge: "Credit/Debit Card",
      color: "purple"
    },
    upi: {
      icon: Wallet,
      label: "UPI Payment",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50/50 via-cyan-50/30 to-sky-50/50",
      badge: "Google Pay, PhonePe, etc.",
      color: "blue"
    },
    online: {
      icon: CreditCard,
      label: "Online Payment",
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50/50 via-purple-50/30 to-violet-50/50",
      badge: "Secure Payment",
      color: "indigo"
    },
  };

  const config = paymentConfig[payment] || paymentConfig.cod;
  const PaymentIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-emerald-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8"
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl shadow-${config.color}-500/30`}
            >
              <PaymentIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-1">Payment Method</h3>
              <p className="text-sm text-gray-600 font-medium">{config.label}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
              <ShieldCheck size={16} strokeWidth={2.5} />
              <span className="text-sm font-bold">Secure</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{config.badge}</span>
          </div>
        </div>

        {/* Delivery Instructions */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Clock size={18} className="text-emerald-600" strokeWidth={2.5} />
            Special Delivery Instructions
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Ring the bell twice, Call on arrival, Leave at door"
              maxLength={100}
              className="w-full border-2 border-emerald-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 bg-white/90 transition-all shadow-sm placeholder:text-gray-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
              {notes.length}/100
            </div>
          </div>
        </div>

        {/* Delivery Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estimated Time */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-900 mb-0.5">Delivery Time</p>
                <p className="text-sm font-black text-orange-700">30-45 minutes</p>
              </div>
              <Zap className="w-6 h-6 text-orange-500" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Safety Badge */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-900 mb-0.5">Safety First</p>
                <p className="text-sm font-black text-green-700">Contactless Delivery</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={2.5} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const OrderItemsCard = ({ items, mixedRestaurants, missingRestaurantRef, invalidMenuItems }) => {
  const hasErrors = mixedRestaurants || missingRestaurantRef || invalidMenuItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-purple-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-fuchsia-200/30 to-rose-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30"
            >
              <Package className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-1">Order Items</h3>
              <p className="text-sm text-gray-600 font-medium">{items.length} delicious item(s)</p>
            </div>
          </div>
          
          <Link
            to="/cart"
            className="group/edit inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Edit3 size={16} strokeWidth={2.5} />
            <span>Edit Cart</span>
            <ChevronRight size={16} className="group-hover/edit:translate-x-1 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6 custom-scrollbar">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="group/item relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-lg"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 to-pink-50/0 group-hover/item:from-purple-50/50 group-hover/item:to-pink-50/50 transition-all duration-300" />
              
              {/* Item Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                />
                {/* Veg/Non-veg Badge */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-sm ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                {/* Quantity Badge */}
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
                  {item.quantity}
                </div>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0 relative z-10">
                <h4 className="font-black text-gray-900 text-base truncate mb-1">{item.name}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-semibold">₹{formatINR(item.price)}</span>
                  <span className="text-gray-400">×</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                    {item.quantity}
                  </span>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right relative z-10 flex-shrink-0">
                <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{formatINR(item.price * item.quantity)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Messages */}
        <AnimatePresence>
          {hasErrors && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {mixedRestaurants && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">Multiple Restaurants</p>
                    <p className="text-xs text-red-700">
                      You can only order from one restaurant at a time. Please remove items from other restaurants.
                    </p>
                  </div>
                </div>
              )}
              {missingRestaurantRef && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">Missing Restaurant Info</p>
                    <p className="text-xs text-red-700">
                      Some items are missing restaurant reference. Please re-add them from the menu.
                    </p>
                  </div>
                </div>
              )}
              {invalidMenuItems && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">Invalid Menu Items</p>
                    <p className="text-xs text-red-700">
                      Some items are missing menu reference. Please re-add them from the menu.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const BillSummaryCard = ({
  subTotal,
  baseDelivery,
  taxes,
  toPay,
  deliveryThreshold,
  canPlaceOrder,
  loading,
  placeOrder,
}) => {
  const isFreeDelivery = baseDelivery === 0;
  const amountNeeded = deliveryThreshold - subTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="sticky top-24 relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-orange-100/50 shadow-2xl p-8"
    >
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-200/30 to-rose-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 flex items-center justify-center shadow-xl shadow-orange-500/30"
          >
            <Receipt className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">Bill Summary</h3>
            <p className="text-sm text-gray-600 font-medium">Review your charges</p>
          </div>
        </div>

        {/* Free Delivery Progress */}
        {!isFreeDelivery && amountNeeded > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Gift size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-amber-900">
                  Add ₹{formatINR(amountNeeded)} for FREE Delivery!
                </p>
                <p className="text-xs text-amber-700">Save ₹{formatINR(baseDelivery)}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(subTotal / deliveryThreshold) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </motion.div>
        )}

        {/* Bill Breakdown */}
        <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-gray-50/80 to-orange-50/30 border-2 border-gray-100 mb-6">
          {/* Item Total */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign size={18} className="text-gray-400" strokeWidth={2.5} />
              <span className="font-semibold">Item Total</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">₹{formatINR(subTotal)}</span>
          </div>

          {/* Delivery Fee */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-700">
                <Truck size={18} className="text-gray-400" strokeWidth={2.5} />
                <span className="font-semibold">Delivery Fee</span>
              </div>
              {!isFreeDelivery && (
                <span className="text-xs text-gray-500 ml-6">
                  Free on orders above ₹{formatINR(deliveryThreshold)}
                </span>
              )}
            </div>
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                <Award size={16} strokeWidth={2.5} />
                <span className="font-black text-sm">FREE</span>
              </div>
            ) : (
              <span className="font-bold text-gray-900 text-lg">₹{formatINR(baseDelivery)}</span>
            )}
          </div>

          {/* Taxes */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Receipt size={18} className="text-gray-400" strokeWidth={2.5} />
              <span className="font-semibold">Taxes & Charges</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">₹{formatINR(taxes)}</span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-black text-gray-900 text-lg mb-1">Grand Total</p>
              <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                ₹{formatINR(toPay)}
              </div>
              <div className="text-xs text-gray-500 font-semibold">Final Amount</div>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" strokeWidth={2.5} />
              <div>
                <p className="text-xs font-black text-green-900">Secure</p>
                <p className="text-[10px] text-green-700">SSL Encrypted</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              <div>
                <p className="text-xs font-black text-blue-900">Quality</p>
                <p className="text-[10px] text-blue-700">Guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <motion.button
          whileHover={{ scale: canPlaceOrder && !loading ? 1.02 : 1 }}
          whileTap={{ scale: canPlaceOrder && !loading ? 0.98 : 1 }}
          onClick={placeOrder}
          disabled={!canPlaceOrder || loading}
          className={`
            relative w-full px-8 py-5 rounded-2xl font-black text-white text-lg
            shadow-xl transition-all overflow-hidden group
            ${
              canPlaceOrder && !loading
                ? "bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:shadow-2xl hover:shadow-orange-500/50"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }
          `}
        >
          {/* Animated Background */}
          {canPlaceOrder && !loading && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </>
          )}

          {/* Button Content */}
          <span className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                />
                Placing Your Order...
              </>
            ) : canPlaceOrder ? (
              <>
                <Sparkles size={24} strokeWidth={2.5} />
                Confirm & Place Order
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </>
            ) : (
              <>
                <AlertTriangle size={24} strokeWidth={2.5} />
                Fix Errors to Continue
              </>
            )}
          </span>
        </motion.button>

        {/* Terms Notice */}
        <p className="mt-4 text-center text-xs text-gray-500 leading-relaxed">
          By placing this order, you agree to our{" "}
          <Link to="/terms" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cart: ctxCart = [], totalPrice: ctxTotal = 0, clearCart } = useContext(CartContext);

  const state = location.state || {};
  const stateCart = Array.isArray(state.cart) ? state.cart : [];
  const stateTotal = Number(state.totalPrice || 0);
  const initialAddress = state.address || "";
  const initialPaymentMethod = state.paymentMethod || "cod";
  const stateNotes = state.notes || "";

  const rawItems = stateCart.length ? stateCart : ctxCart;
  const subTotal = stateCart.length ? stateTotal : ctxTotal;

  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [notes, setNotes] = useState(stateNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rawItems || rawItems.length === 0) {
      navigate("/checkout", { replace: true });
    }
  }, [rawItems, navigate]);

  const normalizePaymentMethod = (pm) => {
    const p = String(pm || "").toLowerCase();
    if (!p || p === "cod" || p.includes("cash")) return "cod";
    if (p.includes("card")) return "card";
    if (p.includes("upi")) return "upi";
    if (p.includes("online")) return "online";
    return p;
  };

  const payment = useMemo(() => normalizePaymentMethod(paymentMethod), [paymentMethod]);

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
            : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
        price: Number(it.price || 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
        restaurant: rest,
        menuItem,
        isVeg: it.isVeg ?? true,
      };
    });
  }, [rawItems]);

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

  const deliveryThreshold = 299;
  const baseDelivery = subTotal >= deliveryThreshold ? 0 : 29;
  const taxes = Math.round(subTotal * 0.05);
  const toPay = Math.max(subTotal + baseDelivery + taxes, 0);

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
        setError("You can order from one restaurant at a time.");
      } else if (missingRestaurantRef) {
        setError("Some items are missing their restaurant reference.");
      } else if (invalidMenuItems) {
        setError("Some items are missing their menu reference.");
      } else if (!validAddress) {
        setError("Please enter a valid address (min 5 characters).");
      } else if (!restaurantId) {
        setError("Restaurant is required.");
      }
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        restaurant: restaurantId,
        items: items.map((it) => ({
          menuItem: it.menuItem,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        address: address.trim(),
        paymentMethod: payment,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ x: -4, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/checkout")}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-xl transition-all shadow-lg font-bold"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            <span>Back to Checkout</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-xl shadow-green-500/30"
          >
            <Shield className="w-5 h-5" strokeWidth={2.5} />
            <span>100% Secure & Encrypted</span>
          </motion.div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={3} />

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-12 text-white shadow-2xl mb-10"
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/30 mb-6 shadow-xl"
            >
              <Sparkles size={20} strokeWidth={2.5} />
              <span className="font-bold text-lg">Final Step!</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
            >
              Confirm Your Order
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto"
            >
              Review your order details and complete your delicious purchase in seconds!
            </motion.p>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 shadow-xl p-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                  <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-red-900 text-lg mb-1">Order Error</p>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <AddressSection address={address} setAddress={setAddress} validAddress={validAddress} />
            <PaymentSection payment={payment} notes={notes} setNotes={setNotes} />
            <OrderItemsCard
              items={items}
              mixedRestaurants={mixedRestaurants}
              missingRestaurantRef={missingRestaurantRef}
              invalidMenuItems={invalidMenuItems}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <BillSummaryCard
              subTotal={subTotal}
              baseDelivery={baseDelivery}
              taxes={taxes}
              toPay={toPay}
              deliveryThreshold={deliveryThreshold}
              canPlaceOrder={canPlaceOrder}
              loading={loading}
              placeOrder={placeOrder}
            />
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}