// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  Utensils,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer({ onSubscribe }) {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");

  const handleSubscribe = async () => {
    const value = email.trim();
    const isValid = /^\S+@\S+\.\S+$/.test(value);
    
    if (!isValid) {
      setSubscribeStatus("Please enter a valid email address");
      setTimeout(() => setSubscribeStatus(""), 3000);
      return;
    }

    if (typeof onSubscribe === "function") {
      try {
        await onSubscribe(value);
        setSubscribeStatus("✅ Successfully subscribed!");
        setEmail("");
      } catch {
        setSubscribeStatus("❌ Subscription failed. Try again.");
      }
    } else {
      setSubscribeStatus("✅ Successfully subscribed!");
      setEmail("");
    }
    
    setTimeout(() => setSubscribeStatus(""), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubscribe();
    }
  };

  // Quick Links
  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/favorites", label: "Favorites" },
    { to: "/cart", label: "Cart" },
    { to: "/my-orders", label: "My Orders" },
  ];

  // Support Links
  const supportLinks = [
    { to: "/help", label: "Help Center" },
    { to: "/contact", label: "Contact Us" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
  ];

  // Social Links
  const socialLinks = [
    { Icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-500" },
    { Icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-400" },
    { Icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-500" },
    { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-600" },
  ];

  // Features
  const features = [
    { Icon: Clock, label: "Fast Delivery" },
    { Icon: ShieldCheck, label: "Secure Payment" },
    { Icon: Award, label: "Top Quality" },
  ];

  return (
    <footer id="help" className="relative bg-stone-900 text-stone-300 overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 via-stone-900 to-stone-900" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  BiteDash
                </span>
              </motion.div>
            </Link>

            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              Order from top restaurants. Fast delivery, great deals, and your favorite food at your doorstep.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, idx) => {
                const Icon = feature.Icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <span className="text-stone-400">{feature.label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label, color }, idx) => (
                <motion.a
                  key={idx}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-all ${color}`}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-brand-400" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-stone-400 hover:text-brand-400 transition-all text-sm"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-brand-400" />
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-stone-400 hover:text-brand-400 transition-all text-sm"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 1234567890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@bitedash.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>123 Food Street, Flavor Town, India</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Subscribe to get exclusive offers, updates, and delicious deals delivered to your inbox!
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <motion.button
                type="button"
                onClick={handleSubscribe}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Subscribe Now
              </motion.button>

              {/* Status Message */}
              {subscribeStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs text-center ${
                    subscribeStatus.startsWith("✅") ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {subscribeStatus}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-2">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-white">
              BiteDash
            </span>
            . All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent-500 fill-accent-500 animate-pulse" /> in India
          </p>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-brand-400 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-700">•</span>
            <Link to="/terms" className="hover:text-brand-400 transition-colors">
              Terms
            </Link>
            <span className="text-gray-700">•</span>
            <Link to="/cookies" className="hover:text-brand-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}