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
  Package,
  Sparkles,
  Award,
  ChevronRight,
  Download,
  MapPinned,
  CreditCard,
  CheckCircle,
  Star,
  Zap,
  Gift,
  Percent,
  TrendingUp,
  Shield,
  Bell,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  Heart,
  ThumbsUp,
} from "lucide-react";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

// ==================== SUB-COMPONENTS ====================

const SuccessHero = ({ idShort, restaurantName, total }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-10 md:p-14 text-white shadow-2xl mb-10"
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      <div className="relative z-10">
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* Pulsing Background */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/30 rounded-full blur-2xl"
            />

            {/* Main Icon Container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-4 border-white/40 shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* Floating Sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-20, -40, -20],
                  x: [0, (i - 1) * 10, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="absolute"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 30}%`,
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg tracking-tight"
          >
            Order Placed Successfully! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-white/95 mb-8 font-medium max-w-2xl mx-auto"
          >
            Thank you for your order! We're preparing your delicious meal with care.
          </motion.p>

          {/* Order Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/25 backdrop-blur-xl border-2 border-white/40 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Receipt className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/80 font-semibold">Order ID</div>
                <div className="font-mono font-black text-lg">#{idShort}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/25 backdrop-blur-xl border-2 border-white/40 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/80 font-semibold">Restaurant</div>
                <div className="font-bold text-lg truncate max-w-[150px]">{restaurantName}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/25 backdrop-blur-xl border-2 border-white/40 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/80 font-semibold">Total Amount</div>
                <div className="font-black text-2xl">₹{total}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const QuickStats = ({ total, paymentLabel, itemsCount, createdAt }) => {
  const stats = [
    {
      label: "Total Amount",
      value: `₹${total}`,
      subtext: "Inclusive of all taxes",
      icon: Wallet,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "from-purple-400 to-pink-500",
      ring: "ring-purple-100",
    },
    {
      label: "Payment Method",
      value: paymentLabel,
      subtext: "Confirmed & Secured",
      icon: CreditCard,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "from-blue-400 to-indigo-500",
      ring: "ring-blue-100",
    },
    {
      label: "Total Items",
      value: itemsCount,
      subtext: "Freshly prepared",
      icon: Package,
      gradient: "from-orange-500 to-red-600",
      iconBg: "from-orange-400 to-red-500",
      ring: "ring-orange-100",
    },
    {
      label: "Order Time",
      value: createdAt ? new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A",
      subtext: new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      icon: Clock,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "from-emerald-400 to-teal-500",
      ring: "ring-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + idx * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all p-6"
          >
            {/* Decorative Gradient Blob */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />

            <div className="relative">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.iconBg} shadow-xl shadow-${stat.gradient.split(' ')[1].split('-')[0]}-500/30 mb-4`}
              >
                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Label */}
              <div className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wide">{stat.label}</div>

              {/* Value */}
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{stat.value}</div>

              {/* Subtext */}
              <div className="text-xs text-gray-500 font-medium">{stat.subtext}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const OrderDetailsCard = ({ order, idShort, copied, copyOrderId, shareOrder, restaurantName, restaurantLoc }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-blue-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 mb-8"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
            >
              <MapPinned className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-1">Order Details</h3>
              <p className="text-sm text-gray-600 font-semibold">Order #{idShort}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyOrderId}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg
                ${copied
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {copied ? (
                <>
                  <CheckCircle size={16} strokeWidth={2.5} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} strokeWidth={2.5} />
                  Copy ID
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareOrder}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Share2 size={16} strokeWidth={2.5} />
              Share
            </motion.button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant & Delivery */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-orange-700 font-bold mb-2 uppercase tracking-wide">Restaurant & Delivery</div>
                <div className="font-black text-xl text-gray-900 mb-1 truncate">{restaurantName}</div>
                {restaurantLoc && (
                  <div className="text-sm text-gray-600 mb-3">{restaurantLoc}</div>
                )}
                {order.address && (
                  <div className="mt-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-orange-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{order.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/30 rounded-full blur-2xl" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                <Wallet className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-emerald-700 font-bold mb-2 uppercase tracking-wide">Payment Information</div>
                <div className="font-black text-xl text-gray-900 mb-1">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</div>
                <div className="text-sm text-gray-600 mb-3">Total: ₹{formatINR(order.total)}</div>
                
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md">
                    <CheckCircle size={14} strokeWidth={2.5} />
                    <span className="text-xs font-bold">Confirmed</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-200 text-emerald-700">
                    <Shield size={14} strokeWidth={2.5} />
                    <span className="text-xs font-bold">Secured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OrderItemsCard = ({ items, itemsCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.7, duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-purple-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 mb-8"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-fuchsia-200/30 to-rose-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30"
            >
              <ShoppingBag className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-1">Order Items</h3>
              <p className="text-sm text-gray-600 font-semibold">{itemsCount} delicious item(s)</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
            <Award className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-xs font-bold text-purple-700">Premium Quality</span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, idx) => {
            const img = item?.menuItem?.image || item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
            const itemTotal = (item.price || 0) * (item.quantity || 1);

            return (
              <motion.div
                key={item._id || item.menuItem || idx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 + idx * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="group/item relative overflow-hidden flex items-center gap-5 p-5 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-lg"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 to-pink-50/0 group-hover/item:from-purple-50/50 group-hover/item:to-pink-50/50 transition-all duration-300" />

                {/* Item Image */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-gray-100">
                  <img
                    src={img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                  />
                  {/* Veg/Non-veg Indicator */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-sm ${item?.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  {/* Quantity Badge */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-black shadow-lg">
                    {item.quantity}×
                  </div>
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0 relative z-10">
                  <h4 className="font-black text-lg text-gray-900 mb-2 truncate">{item.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-semibold">₹{formatINR(item.price)} each</span>
                    <span className="text-gray-300">×</span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-black">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right relative z-10 flex-shrink-0">
                  <div className="text-xs text-gray-500 font-semibold mb-1">Total</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{formatINR(itemTotal)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const DeliveryTracker = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.9, duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 p-8 md:p-10 mb-8 text-white shadow-2xl"
    >
      {/* Animated Background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"
      />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Content */}
        <div className="flex items-center gap-5">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-2xl"
          >
            <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div className="text-sm text-white/80 font-bold mb-1 uppercase tracking-wide">Estimated Delivery</div>
            <div className="text-4xl md:text-5xl font-black mb-2">30-45 Min</div>
            <div className="text-sm text-white/90 font-medium">We'll notify you on every update</div>
          </div>
        </div>

        {/* Right Content - Animated Dots */}
        <div className="flex items-center gap-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="w-4 h-4 rounded-full bg-white/80 shadow-lg"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ActionButtons = () => {
  const actions = [
    {
      to: "/my-orders",
      label: "Track Order",
      description: "View live order status",
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "blue",
    },
    {
      to: "/restaurants",
      label: "Order Again",
      description: "Browse more restaurants",
      icon: HomeIcon,
      gradient: "from-emerald-500 to-green-600",
      shadowColor: "emerald",
    },
    {
      to: "#support",
      label: "Need Help?",
      description: "Contact support",
      icon: MessageCircle,
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "purple",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            to={action.to}
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-gray-100 p-6 hover:shadow-2xl transition-all duration-300"
          >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-xl shadow-${action.shadowColor}-500/30 flex-shrink-0 group-hover:shadow-2xl`}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="font-black text-xl text-gray-900 group-hover:text-white mb-1 transition-colors">
                  {action.label}
                </div>
                <div className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                  {action.description}
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" strokeWidth={2.5} />
            </div>
          </Link>
        );
      })}
    </motion.div>
  );
};

const PromoCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.3, duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-8 md:p-10 text-white shadow-2xl mb-8"
    >
      {/* Animated Background */}
      <motion.div
        animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [100, -100, 100], y: [50, -50, 50] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"
      />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Content */}
        <div className="flex items-center gap-5">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-2xl flex-shrink-0"
          >
            <Gift className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div className="text-sm font-bold text-white/90 mb-1 uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={16} strokeWidth={2.5} />
              Special Offer!
            </div>
            <div className="text-3xl md:text-4xl font-black mb-2">Get 20% OFF</div>
            <div className="text-base text-white/90 font-medium">
              On your next order • Use code:{" "}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-mono font-black ml-2">
                THANKYOU20
                <Copy size={14} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>

        {/* Right Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden lg:block"
        >
          <Percent className="w-24 h-24 text-white/20" strokeWidth={2} />
        </motion.div>
      </div>
    </motion.div>
  );
};

const FeedbackCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-gray-100 shadow-xl p-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/30 mb-6"
        >
          <Star className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <h3 className="text-2xl font-black text-gray-900 mb-3">How was your experience?</h3>
        <p className="text-gray-600 mb-6 font-medium max-w-md mx-auto">
          Your feedback helps us serve you better
        </p>

        <div className="flex items-center justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Star className="w-6 h-6 text-white" strokeWidth={2.5} fill="white" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

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

  // Stop confetti after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Guard
  if (!order) return null;

  // Derived info
  const idShort = useMemo(() => String(order._id || "").slice(-6).toUpperCase(), [order]);
  const itemsCount = useMemo(
    () => (order.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0),
    [order]
  );
  const paymentLabel = useMemo(() => {
    const p = String(order.paymentMethod || "").toLowerCase();
    if (p === "cod" || p === "cash") return "Cash on Delivery";
    if (p === "card") return "Card Payment";
    if (p === "upi") return "UPI Payment";
    return "Online Payment";
  }, [order]);

  const total = formatINR(order.total);
  const restaurantName = order?.restaurant?.name || "Restaurant";
  const restaurantLoc = order?.restaurant?.location || "";

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order._id || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOrder = async () => {
    const text = `🎉 Order placed successfully!\n\nOrder ID: #${idShort}\nRestaurant: ${restaurantName}\nTotal: ₹${total}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Order Placed Successfully",
          text,
          url: window.location.origin + "/my-orders",
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && winSize.width > 0 && (
          <Confetti
            width={winSize.width}
            height={winSize.height}
            numberOfPieces={500}
            recycle={false}
            gravity={0.3}
            colors={["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"]}
            drawShape={(ctx) => {
              ctx.beginPath();
              for (let i = 0; i < 22; i++) {
                const angle = 0.35 * i;
                const x = (0.2 + 1.5 * angle) * Math.cos(angle);
                const y = (0.2 + 1.5 * angle) * Math.sin(angle);
                ctx.lineTo(x, y);
              }
              ctx.stroke();
              ctx.closePath();
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Success Hero */}
        <SuccessHero idShort={idShort} restaurantName={restaurantName} total={total} />

        {/* Quick Stats */}
        <QuickStats
          total={total}
          paymentLabel={paymentLabel}
          itemsCount={itemsCount}
          createdAt={order.createdAt}
        />

        {/* Order Details */}
        <OrderDetailsCard
          order={order}
          idShort={idShort}
          copied={copied}
          copyOrderId={copyOrderId}
          shareOrder={shareOrder}
          restaurantName={restaurantName}
          restaurantLoc={restaurantLoc}
        />

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <OrderItemsCard items={order.items} itemsCount={itemsCount} />
        )}

        {/* Delivery Tracker */}
        <DeliveryTracker />

        {/* Action Buttons */}
        <ActionButtons />

        {/* Promo Card */}
        <PromoCard />

        {/* Feedback Card */}
        <FeedbackCard />
      </div>
    </div>
  );
}