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
  Package,
  Star,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  CreditCard,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import LiveOrderTracker from "../components/LiveOrderTracker";
import { connectUserSocket, getUserSocket } from "../services/socket";
import { CartContext } from "../context/CartContext";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

// ==================== CONFIGURATIONS ====================

const STATUS_CONFIG = {
  placed: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
    label: "Order Placed",
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    ringColor: "ring-amber-400/30",
    badgeBg: "bg-amber-100",
  },
  confirmed: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: CheckCircle2,
    label: "Confirmed",
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    ringColor: "ring-blue-400/30",
    badgeBg: "bg-blue-100",
  },
  preparing: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: Package,
    label: "Preparing",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    ringColor: "ring-violet-400/30",
    badgeBg: "bg-violet-100",
  },
  "out-for-delivery": {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    icon: Truck,
    label: "Out for Delivery",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    ringColor: "ring-cyan-400/30",
    badgeBg: "bg-cyan-100",
  },
  delivered: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle2,
    label: "Delivered",
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    ringColor: "ring-emerald-400/30",
    badgeBg: "bg-emerald-100",
  },
  cancelled: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: XCircle,
    label: "Cancelled",
    gradient: "from-rose-500 via-red-500 to-pink-600",
    ringColor: "ring-rose-400/30",
    badgeBg: "bg-rose-100",
  },
};

const STEPS = ["placed", "confirmed", "preparing", "out-for-delivery", "delivered"];

// ==================== ANIMATIONS ====================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ==================== PAGE HEADER ====================

const PageHeader = ({ totalOrders, counts, statusFilter, setStatusFilter, searchQuery, setSearchQuery }) => {
  const filterOptions = [
    {
      key: "all",
      label: "All Orders",
      count: counts.total,
      icon: ShoppingBag,
      gradient: "from-slate-600 to-gray-700",
      color: "text-gray-700",
    },
    {
      key: "active",
      label: "Active",
      count: counts.active,
      icon: Zap,
      gradient: "from-orange-500 to-red-600",
      color: "text-orange-600",
    },
    {
      key: "delivered",
      label: "Delivered",
      count: counts.delivered,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      color: "text-emerald-600",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: counts.cancelled,
      icon: XCircle,
      gradient: "from-rose-500 to-pink-600",
      color: "text-rose-600",
    },
  ];

  return (
    <div className="mb-10 space-y-6">
      {/* Hero Section */}
      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-2xl"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative px-8 py-10 md:px-12 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-start gap-5"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <ShoppingBag className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  My Orders
                </h1>
                <p className="text-white/90 text-base md:text-lg font-medium">
                  Track and manage all your delicious orders
                </p>
              </div>
            </motion.div>

            {/* Right Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="flex flex-col items-start md:items-end gap-3"
            >
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-5xl font-black text-white mb-1">{totalOrders}</div>
                  <div className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                    Total Orders
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30">
                  <Award className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Filter Pills */}
        <motion.div
          {...slideIn}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 flex-1"
        >
          {filterOptions.map((option, idx) => {
            const Icon = option.icon;
            const isActive = statusFilter === option.key;

            return (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(option.key)}
                className={`
                  relative group px-5 py-3.5 rounded-2xl font-bold text-sm
                  transition-all duration-300 shadow-lg hover:shadow-xl
                  ${
                    isActive
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-xl`
                      : `bg-white ${option.color} border-2 border-gray-200 hover:border-gray-300`
                  }
                `}
              >
                <div className="relative flex items-center gap-2.5">
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{option.label}</span>
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-black
                      ${isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-700"}
                    `}
                  >
                    {option.count}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="relative w-full lg:w-96"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant or order ID..."
            className="w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-gray-200 
                     focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 
                     transition-all duration-300 shadow-sm hover:shadow-md text-gray-700 font-medium
                     placeholder:text-gray-400"
          />
        </motion.div>
      </div>
    </div>
  );
};

// ==================== EMPTY STATE ====================

const EmptyState = ({ statusFilter }) => {
  const messages = {
    all: {
      title: "No Orders Yet",
      message: "Start your culinary adventure today! Browse our amazing restaurants.",
      icon: ShoppingBag,
      gradient: "from-gray-400 to-gray-600",
    },
    active: {
      title: "No Active Orders",
      message: "All your orders are completed! Time to order something delicious.",
      icon: CheckCircle2,
      gradient: "from-emerald-400 to-teal-600",
    },
    delivered: {
      title: "No Delivered Orders",
      message: "Your delivered orders will appear here once you place an order.",
      icon: Package,
      gradient: "from-blue-400 to-indigo-600",
    },
    cancelled: {
      title: "No Cancelled Orders",
      message: "You haven't cancelled any orders. That's great!",
      icon: XCircle,
      gradient: "from-rose-400 to-pink-600",
    },
  };

  const config = messages[statusFilter] || messages.all;
  const Icon = config.icon;

  return (
    <motion.div
      {...scaleIn}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`w-40 h-40 mb-8 rounded-3xl bg-gradient-to-br ${config.gradient} 
                   flex items-center justify-center shadow-2xl relative`}
      >
        <Icon className="w-20 h-20 text-white" strokeWidth={2} />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 to-transparent" />
      </motion.div>

      <h3 className="text-3xl font-black text-gray-900 mb-3">{config.title}</h3>
      <p className="text-gray-500 text-lg mb-8 text-center max-w-md">{config.message}</p>

      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl 
                   bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg
                   shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <ShoppingBag size={22} strokeWidth={2.5} />
          Browse Restaurants
          <ArrowRight size={22} strokeWidth={2.5} />
        </motion.button>
      </Link>
    </motion.div>
  );
};

// ==================== STATUS TIMELINE ====================

const StatusTimeline = ({ status }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          {...scaleIn}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-rose-100 border-2 border-rose-300"
        >
          <XCircle className="w-6 h-6 text-rose-600" strokeWidth={2.5} />
          <span className="text-rose-700 font-bold text-lg">Order Cancelled</span>
        </motion.div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="py-8 px-6">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full" />
        
        {/* Progress Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-8 left-0 h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full shadow-lg"
        />

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {STEPS.map((step, idx) => {
            const config = STATUS_CONFIG[step];
            const Icon = config.icon;
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div
                    className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center
                      transition-all duration-500 shadow-xl z-10 relative
                      ${
                        isCompleted
                          ? `bg-gradient-to-br ${config.gradient} text-white ${
                              isCurrent ? "ring-4 ring-offset-4 " + config.ringColor : ""
                            }`
                          : "bg-white border-3 border-gray-300 text-gray-400"
                      }
                    `}
                  >
                    <Icon size={isCurrent ? 32 : 26} strokeWidth={2.5} />
                  </div>

                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-30`}
                    />
                  )}
                </motion.div>

                <div className="mt-4 text-center">
                  <div
                    className={`text-sm font-bold ${
                      isCompleted ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== ORDER CARD ====================

const OrderCard = ({ order, index, expandedId, setExpandedId, handleReorder }) => {
  const id = String(order._id || "");
  const isExpanded = expandedId === id;
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const StatusIcon = config.icon;

  const idShort = id.slice(-6).toUpperCase();
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }) : "";
  const total = formatINR(order.total);
  const itemsCount = (order.items || []).reduce((a, it) => a + Number(it.quantity || 0), 0);
  const restaurantName = order.restaurant?.name || "Restaurant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4 }}
      className="relative group overflow-hidden rounded-3xl bg-white border-2 border-gray-100 
               shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Status Strip */}
      <div className={`h-3 bg-gradient-to-r ${config.gradient}`} />

      {/* Main Content */}
      <div className="p-6 md:p-8">
        {/* Header */}
        <div
          className="cursor-pointer"
          onClick={() => setExpandedId(isExpanded ? null : id)}
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            {/* Left Side */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} 
                           flex items-center justify-center shadow-lg`}
                >
                  <StatusIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 text-2xl truncate mb-1">
                    {restaurantName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Order</span>
                    <span className="text-sm font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                      #{idShort}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <Clock size={18} className="text-gray-600" strokeWidth={2} />
                  <span className="text-sm font-semibold text-gray-700">{created}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <Package size={18} className="text-gray-600" strokeWidth={2} />
                  <span className="text-sm font-semibold text-gray-700">{itemsCount} Items</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  {order.paymentMethod === "cod" ? (
                    <Wallet size={18} className="text-gray-600" strokeWidth={2} />
                  ) : (
                    <CreditCard size={18} className="text-gray-600" strokeWidth={2} />
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </span>
                </div>
              </div>

              {/* Address */}
              {order.address && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100"
                >
                  <MapPin size={20} className="text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-sm font-medium text-gray-700 leading-relaxed">
                    {order.address}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-4">
              <div
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl ${config.bg} border-2 ${config.border}`}
              >
                <StatusIcon size={18} className={config.text} strokeWidth={2.5} />
                <span className={`text-sm font-black ${config.text} uppercase tracking-wide`}>
                  {config.label}
                </span>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-500 mb-1">Total Amount</div>
                <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ₹{total}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 
                         flex items-center justify-center transition-all duration-300 shadow-md"
              >
                {isExpanded ? (
                  <ChevronUp size={24} className="text-gray-700" strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={24} className="text-gray-700" strokeWidth={2.5} />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <StatusTimeline status={order.status} />
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden border-t-2 border-gray-100"
          >
            <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white space-y-6">
              {/* Items List */}
              <div>
                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Package size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  Order Items
                </h4>

                <div className="space-y-3">
                  {(order.items || []).map((item, idx) => {
                    const img =
                      item?.menuItem?.image || item?.image || "https://via.placeholder.com/80?text=Food";
                    const itemTotal = Number(item.price) * Number(item.quantity);

                    return (
                      <motion.div
                        key={item._id || item.menuItem || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-gray-100 
                                 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                          <img
                            src={img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-lg truncate mb-1">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-600">
                              ₹{formatINR(item.price)}
                            </span>
                            <span className="text-gray-400">×</span>
                            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                              {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-gray-900">
                            ₹{formatINR(itemTotal)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReorder(order)}
                  className="flex-1 min-w-[200px] h-14 inline-flex items-center justify-center gap-3 
                           px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white 
                           font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <RefreshCw size={20} strokeWidth={2.5} />
                  Reorder
                </motion.button>

                {order.status === "delivered" && (
                  <Link
                    to={`/restaurants/${order.restaurant?._id || order.restaurant}`}
                    className="flex-1 min-w-[200px]"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-14 inline-flex items-center justify-center gap-3 
                               px-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white 
                               font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Star size={20} strokeWidth={2.5} />
                      Rate & Review
                    </motion.button>
                  </Link>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 inline-flex items-center gap-3 px-6 rounded-2xl 
                           bg-white border-2 border-gray-200 text-gray-700 font-bold 
                           hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <Receipt size={20} strokeWidth={2.5} />
                  Download Invoice
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== LOADING SKELETON ====================

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-60 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl animate-pulse" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 flex-1 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-white rounded-3xl border-2 border-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
};

// ==================== ERROR STATE ====================

const ErrorState = ({ error }) => {
  return (
    <motion.div
      {...scaleIn}
      className="flex flex-col items-center justify-center min-h-screen py-20"
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-40 h-40 mb-8 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 
                 flex items-center justify-center shadow-2xl"
      >
        <AlertCircle className="w-20 h-20 text-white" strokeWidth={2} />
      </motion.div>

      <h3 className="text-3xl font-black text-gray-900 mb-3">Oops! Something went wrong</h3>
      <p className="text-gray-500 text-lg mb-8 text-center max-w-md">{error}</p>

      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl 
                   bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg
                   shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <RefreshCw size={22} strokeWidth={2.5} />
          Try Again
        </motion.button>
      </Link>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Live updates via existing Socket.IO connection
  useEffect(() => {
    let socket;
    try {
      socket = getUserSocket ? getUserSocket() : null;
      if (!socket && connectUserSocket) {
        socket = connectUserSocket();
      }
    } catch {
      socket = null;
    }
    if (!socket) return;

    const handlePlaced = (order) => {
      if (!order?._id) return;
      setOrders((prev) => {
        const exists = prev.some((o) => String(o._id) === String(order._id));
        if (exists) return prev;
        return [order, ...prev];
      });
    };

    const handleStatus = ({ id, status, updatedAt }) => {
      if (!id || !status) return;
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(id)
            ? { ...o, status, updatedAt: updatedAt || o.updatedAt }
            : o
        )
      );
    };

    socket.on("order:placed", handlePlaced);
    socket.on("order:status", handleStatus);

    return () => {
      try {
        socket.off("order:placed", handlePlaced);
        socket.off("order:status", handleStatus);
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  // Counts
  const counts = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
    const total = orders.length;
    return { delivered, cancelled, active, total };
  }, [orders]);

  // Filtered
  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (statusFilter === "active") {
      list = list.filter((o) => !["delivered", "cancelled"].includes(o.status));
    } else if (statusFilter === "delivered") {
      list = list.filter((o) => o.status === "delivered");
    } else if (statusFilter === "cancelled") {
      list = list.filter((o) => o.status === "cancelled");
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((o) => {
        const id = String(o._id || "").toLowerCase();
        const rest = String(o.restaurant?.name || "").toLowerCase();
        return id.includes(query) || rest.includes(query);
      });
    }

    return list;
  }, [orders, statusFilter, searchQuery]);

  const activeOrder = useMemo(
    () =>
      filtered.find((o) => !["delivered", "cancelled"].includes(o.status)) ||
      filtered[0] ||
      null,
    [filtered]
  );

  // Reorder
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

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          totalOrders={orders.length}
          counts={counts}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {activeOrder && <LiveOrderTracker order={activeOrder} />}

        {filtered.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <div className="space-y-6">
            {filtered.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                index={index}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                handleReorder={handleReorder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}