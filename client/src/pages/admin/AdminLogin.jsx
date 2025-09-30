// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });
      if (data?.token) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full animate-gradientBackground"></div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-10 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 animate-fadeIn"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-white tracking-wider neon-text">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4 animate-shake font-semibold">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/20 text-white placeholder-white transition duration-300 shadow-neon"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/20 text-white placeholder-white transition duration-300 shadow-neon"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition transform ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
          } shadow-lg hover:shadow-neon`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Gradient Animation & Shadows */}
      <style>{`
        /* Gradient Animation */
        @keyframes gradientBackground {
          0% { background: linear-gradient(270deg, #ff77ff, #4f46e5, #1e3a8a); }
          25% { background: linear-gradient(270deg, #4f46e5, #1e3a8a, #ff77ff); }
          50% { background: linear-gradient(270deg, #1e3a8a, #ff77ff, #4f46e5); }
          75% { background: linear-gradient(270deg, #ff77ff, #4f46e5, #1e3a8a); }
          100% { background: linear-gradient(270deg, #4f46e5, #1e3a8a, #ff77ff); }
        }

        .animate-gradientBackground {
          width: 100%;
          height: 100%;
          animation: gradientBackground 15s ease infinite;
          background-size: 600% 600%;
        }

        /* Shake animation for error */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.6s; }

        /* Neon text glow */
        .neon-text {
          text-shadow: 0 0 5px #ff77ff, 0 0 10px #ff77ff, 0 0 20px #4f46e5, 0 0 30px #1e3a8a;
        }

        /* Neon shadow for inputs and button */
        .shadow-neon {
          box-shadow: 0 0 5px #ff77ff, 0 0 10px #4f46e5, 0 0 20px #1e3a8a;
        }

        /* Fade in animation */
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
      `}</style>
    </div>
  );
}