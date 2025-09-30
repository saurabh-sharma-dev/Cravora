// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError(""); // clear error on change
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    setError("");

    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim().toLowerCase();
    const phone = String(form.phone || "").trim();
    const password = String(form.password || "");
    const confirmPassword = String(form.confirmPassword || "");

    if (!name || !email || !password) {
      setError("⚠️ Please fill all required fields");
      return;
    }
    if (password.length < 6) {
      setError("⚠️ Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("⚠️ Passwords do not match");
      return;
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setError("⚠️ Phone must be exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, password };
      if (phone) payload.phone = phone;

      const { data } = await API.post("/auth/register", payload); // { success, token, user }

      if (data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError("❌ Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.msg || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join us and start ordering your favorite meals!
        </p>

        {error && (
          <p className="text-red-600 bg-red-100 py-2 px-4 rounded-lg mb-4 text-center font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              required
            />
          </div>

          {/* Phone (optional) */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              inputMode="numeric"
              pattern="[0-9]{10}"
              title="Enter 10 digit phone"
              autoComplete="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPwd ? "text" : "password"}
              name="password"
              placeholder="Password (min 6 chars)"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-10 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPwd ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-10 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label={showConfirmPwd ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPwd ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`w-full flex items-center justify-center gap-2 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-800 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}