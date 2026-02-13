// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const emailTrim = String(email).trim().toLowerCase();
    const pwd = String(password);
    if (!emailTrim || !pwd) {
      setError("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email: emailTrim, password: pwd });
      if (data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/", { replace: true });
      } else {
        setError("❌ Login failed. Please try again.");
      }
    } catch (err) {
      const apiMsg = err?.response?.data?.msg;
      setError(apiMsg || "❌ Invalid email or password");
      console.error("Login error:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-surface-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-stone-200 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-stone-800 mb-2">
          Welcome back
        </h2>
        <p className="text-center text-stone-500 mb-6 text-sm">
          Sign in to order and track deliveries
        </p>

        {error && <p className="text-red-600 mb-4 text-center text-sm font-medium rounded-xl bg-red-50 border border-red-200 p-3">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full border-2 border-stone-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 min-h-touch bg-surface-50"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full border-2 border-stone-200 p-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 min-h-touch bg-surface-50"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              required
              minLength={6}
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

          {/* Forgot password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`w-full text-white font-semibold px-4 py-3 rounded-xl min-h-touch transition-colors ${
              loading ? "bg-stone-400 cursor-not-allowed" : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-stone-200" />
          <span className="px-3 text-stone-400 text-sm">or</span>
          <hr className="flex-grow border-stone-200" />
        </div>

        {/* Register link */}
        <p className="text-center text-stone-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}