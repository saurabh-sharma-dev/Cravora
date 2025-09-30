// src/App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Pages
import Home from "./pages/Home";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext";

// NEW: Notifications + Socket providers
import { NotificationsProvider } from "./context/NotificationsContext";
import { SocketProvider } from "./context/SocketProvider";

// Protected Route for normal users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    // Keep your existing providers
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <SearchProvider>
            <ThemeProvider>
              {/* Wrap the actual UI with Notifications + Socket */}
              <NotificationsProvider>
                <SocketProvider>
                  <div className="font-sans min-h-screen flex flex-col bg-gray-50">
                    {/* Header */}
                    <Header />

                    {/* Main Content */}
                    <main className="flex-1 container mx-auto px-4 py-6">
                      <Routes>
                        {/* Public Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/restaurants/:id" element={<RestaurantPage />} />
                        <Route path="/cart" element={<CartPage />} />

                        {/* Auth Pages */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Pages for normal users */}
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/confirm-order"
                          element={
                            <ProtectedRoute>
                              <OrderConfirmationPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/order-success"
                          element={
                            <ProtectedRoute>
                              <OrderSuccessPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/my-orders"
                          element={
                            <ProtectedRoute>
                              <MyOrdersPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route
                          path="/admin/dashboard"
                          element={
                            <AdminProtectedRoute>
                              <AdminDashboard />
                            </AdminProtectedRoute>
                          }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<p className="text-center mt-10">Page not found</p>} />
                      </Routes>
                    </main>

                    {/* Footer */}
                    <Footer />
                  </div>
                </SocketProvider>
              </NotificationsProvider>
            </ThemeProvider>
          </SearchProvider>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;