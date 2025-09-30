// src/context/CartContext.jsx
import React, { createContext, useEffect, useMemo, useState, useCallback } from "react";

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isMixedRestaurants: false,
  restaurantId: null,
  setCart: () => {},
});

function normalizeItem(raw, fallbackRestaurant = null) {
  if (!raw) return null;

  // Ensure we have a stable id for cart rows (use menuItem/_id)
  const id = raw.menuItem || raw._id || raw.id || null;
  if (!id) return null;

  // Flatten restaurant to id string (not object)
  const restaurant =
    typeof raw.restaurant === "object"
      ? raw.restaurant?._id || null
      : raw.restaurant || fallbackRestaurant || null;

  const quantity = Math.max(1, Number(raw.quantity || 1));
  let price = Number(raw.price || 0);
  // Backend requires price >= 1 for order items, clamp here to avoid errors later
  if (!Number.isFinite(price) || price <= 0) price = 1;

  const normalized = {
    _id: id,               // use menuItem/_id as the primary key in the cart
    menuItem: id,          // REQUIRED by backend when placing order
    restaurant,            // REQUIRED by backend when placing order
    name: raw.name || "Item",
    image:
      raw.image && String(raw.image).trim()
        ? raw.image
        : "https://via.placeholder.com/80x80?text=Food",
    isVeg: raw.isVeg ?? true,
    description: raw.description || "",
    quantity,
    price,
  };

  return normalized;
}

function mergeDuplicates(items) {
  // Merge by _id (menuItem id) and sum quantities
  const map = new Map();
  for (const it of items) {
    if (!it?._id) continue;
    const prev = map.get(it._id);
    if (prev) {
      map.set(it._id, { ...prev, quantity: prev.quantity + (it.quantity || 1) });
    } else {
      map.set(it._id, it);
    }
  }
  return Array.from(map.values());
}

export const CartProvider = ({ children }) => {
  // Load and normalize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed
        .map((it) => normalizeItem(it))
        .filter(Boolean);
      return mergeDuplicates(normalized);
    } catch (err) {
      console.error("❌ Error parsing cart from localStorage:", err);
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("❌ Error saving cart to localStorage:", err);
    }
  }, [cart]);

  // One-time migration for older carts missing fields (optional but helpful)
  useEffect(() => {
    // If any item is missing menuItem/restaurant, normalize and resave
    const needsMigration = cart.some((it) => !it.menuItem || !it.restaurant);
    if (!needsMigration) return;
    const migrated = mergeDuplicates(cart.map((it) => normalizeItem(it)));
    setCart(migrated);
  }, []); // run once

  const addToCart = useCallback((item, quantity = 1, fallbackRestaurant = null) => {
    const normalized = normalizeItem({ ...item, quantity }, fallbackRestaurant);
    if (!normalized) {
      console.warn("⚠️ Skipping addToCart: invalid item or missing ids", item);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i._id === normalized._id);
      if (existing) {
        return prev.map((i) =>
          i._id === normalized._id ? { ...i, quantity: i.quantity + (normalized.quantity || 1) } : i
        );
      }
      return [...prev, normalized];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((item) => (item._id === id ? { ...item, quantity } : item)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // Derived values
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  // Restaurant consistency helpers (useful for checkout/confirm)
  const { isMixedRestaurants, restaurantId } = useMemo(() => {
    const set = new Set(cart.map((i) => i.restaurant).filter(Boolean).map(String));
    return {
      isMixedRestaurants: set.size > 1,
      restaurantId: set.values().next().value || null,
    };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalItems,
        totalPrice,
        isMixedRestaurants,
        restaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};