// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingCart, MapPin } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 mb-8 border-2 border-orange-200/50"
        >
          <MapPin className="w-14 h-14 text-orange-500" strokeWidth={1.5} />
        </motion.div>
        <p className="text-6xl font-black text-gray-200 mb-2">404</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Lost your appetite?
        </h1>
        <p className="text-gray-600 mb-8">
          This page doesn't exist. Head back home and order something delicious from BiteDash.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </motion.button>
          </Link>
          <Link to="/cart">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              View Cart
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
