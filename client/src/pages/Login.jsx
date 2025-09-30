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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please log in to your account
        </p>

        {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full border p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full border p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
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
            <Link to="/forgot-password" className="text-sm text-red-500 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`w-full text-white font-semibold px-4 py-3 rounded-lg transition duration-200 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Register link */}
        <p className="text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-red-500 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}