// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, Phone, Check } from "lucide-react";

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
    if (error) setError("");
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

      const { data } = await API.post("/auth/register", payload);

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
    <div className="min-h-full flex items-center justify-center bg-surface-50 p-4 sm:p-6 py-8 sm:py-12">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 border border-stone-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-2xl mb-4">
              <User className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
              Create account
            </h2>
            <p className="text-stone-500 text-sm">
              Sign up to order and track deliveries
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border-2 border-stone-200 rounded-xl px-12 py-3.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-surface-50 focus:bg-white min-h-touch"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border-2 border-stone-200 rounded-xl px-12 py-3.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-surface-50 focus:bg-white min-h-touch"
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Phone <span className="text-stone-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  title="Enter 10 digit phone"
                  autoComplete="tel"
                  placeholder="1234567890"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border-2 border-stone-200 rounded-xl px-12 py-3.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-surface-50 focus:bg-white min-h-touch"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-2 border-stone-200 rounded-xl px-12 py-3.5 pr-12 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-surface-50 focus:bg-white min-h-touch"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition-colors w-10 h-10 flex items-center justify-center touch-target rounded-lg"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-2 border-stone-200 rounded-xl px-12 py-3.5 pr-12 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-surface-50 focus:bg-white min-h-touch"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition-colors"
                  aria-label={showConfirmPwd ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`w-full mt-6 relative overflow-hidden group ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-500"
              } text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Create Account
                  </>
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-transparent text-brand-600 hover:text-brand-500 transition-all duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          By signing up, you agree to our{" "}
          <a href="#" className="text-brand-600 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-brand-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}