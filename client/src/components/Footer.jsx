// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer({ onSubscribe }) {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    const value = email.trim();
    const isValid = /^\S+@\S+\.\S+$/.test(value);
    if (!isValid) {
      // Replace with your toast system if available
      alert("Please enter a valid email");
      return;
    }
    // If parent passed a callback, use it; otherwise just notify
    if (typeof onSubscribe === "function") {
      onSubscribe(value);
    } else {
      alert("Subscribed successfully!");
    }
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans mt-10 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 opacity-10 animate-gradient-x"></div>

      <div className="container mx-auto py-12 px-6 flex flex-col md:flex-row justify-between gap-10 relative z-10">
        {/* Brand & Description */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <Link
            to="/"
            className="text-3xl font-extrabold text-red-500 hover:text-red-600 transition-all tracking-wider transform hover:scale-110"
          >
            🍔 Foodie
          </Link>
          <p className="text-gray-400 leading-relaxed">
            Delivering your favorite meals fast and fresh. Explore thousands of restaurants and enjoy a seamless ordering experience.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-2">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }, idx) => (
              <motion.a
                key={idx}
                href="#"
                aria-label={label}
                whileHover={{ scale: 1.2, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-red-500 transition-all"
              >
                <Icon size={22} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3 md:w-1/6">
          <h3 className="font-semibold text-gray-200 text-lg border-b border-gray-700 pb-1">
            Quick Links
          </h3>
          <Link to="/" className="hover:text-red-500 transition-all hover:translate-x-1">Home</Link>
          <Link to="/restaurants" className="hover:text-red-500 transition-all hover:translate-x-1">Restaurants</Link>
          <Link to="/cart" className="hover:text-red-500 transition-all hover:translate-x-1">Cart</Link>
          <Link to="/my-orders" className="hover:text-red-500 transition-all hover:translate-x-1">My Orders</Link>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3 md:w-1/6">
          <h3 className="font-semibold text-gray-200 text-lg border-b border-gray-700 pb-1">
            Support
          </h3>
          <Link to="/help" className="hover:text-red-500 transition-all hover:translate-x-1">Help Center</Link>
          <Link to="/contact" className="hover:text-red-500 transition-all hover:translate-x-1">Contact Us</Link>
          <Link to="/privacy" className="hover:text-red-500 transition-all hover:translate-x-1">Privacy Policy</Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3 md:w-1/3">
          <h3 className="font-semibold text-gray-200 text-lg border-b border-gray-700 pb-1">
            Subscribe
          </h3>
          <p className="text-gray-400">Get the latest offers and updates delivered straight to your inbox.</p>
          <div className="flex gap-2 mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 rounded-l-full border border-gray-700 bg-gray-800 text-white 
                         focus:outline-none focus:ring-2 focus:ring-red-500 flex-1 
                         placeholder-gray-400 hover:shadow-lg transition"
            />
            <motion.button
              type="button"
              onClick={handleSubscribe}
              whileHover={{ scale: 1.08, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-r-full 
                         transition-all font-semibold shadow-md hover:shadow-xl"
            >
              Subscribe
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-8 py-4 text-center text-gray-500 text-sm relative z-10">
        © {new Date().getFullYear()} <span className="text-red-400 font-semibold">Foodie</span>. All rights reserved.
      </div>

      {/* Tailwind animation for gradient background */}
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 12s ease infinite;
          }
        `}
      </style>
    </footer>
  );
}