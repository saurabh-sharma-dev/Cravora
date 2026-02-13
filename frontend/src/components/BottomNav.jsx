// src/components/BottomNav.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, ClipboardList, User } from "lucide-react";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/cart", icon: ShoppingCart, label: "Cart", showBadge: true },
  { to: "/my-orders", icon: ClipboardList, label: "Orders" },
  { to: "/account", icon: User, label: "Account" },
];

export default function BottomNav() {
  const location = useLocation();
  const { cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const cartCount = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0)
    : 0;

  const getPath = (to) => {
    if (to === "/account") return user ? "/my-orders" : "/login";
    if (to === "/search") return "/";
    return to;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t border-stone-200 shadow-nav pb-safe"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map(({ to, icon: Icon, label, showBadge }) => {
          const path = getPath(to);
          const isActive =
            path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);
          const badge = showBadge && cartCount > 0;

          return (
            <Link
              key={to}
              to={path}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 text-stone-500 transition-colors touch-target min-h-touch"
              aria-current={isActive ? "page" : undefined}
            >
              <motion.span
                className={`flex flex-col items-center gap-0.5 ${
                  isActive ? "text-brand-600" : "active:opacity-70"
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <span className="relative inline-flex">
                  <Icon size={22} strokeWidth={2} />
                  {badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-bold tabular-nums">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium truncate max-w-[64px]">
                  {to === "/account" && user ? "Account" : label}
                </span>
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-brand-600"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
