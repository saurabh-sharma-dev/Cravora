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
import FavoritesPage from "./pages/FavoritesPage";
import NotFoundPage from "./pages/NotFoundPage";
import BottomNav from "./components/BottomNav";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";

// Notifications + Socket providers
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
        <FavoritesProvider>
          <LocationProvider>
            <SearchProvider>
              <ThemeProvider>
                <NotificationsProvider>
                  <SocketProvider>
                    <div className="font-sans min-h-screen flex flex-col bg-surface-50 text-stone-800 overflow-x-hidden">
                    {/* Header */}
                    <Header />

                    {/* Main Content – one structure for all pages; space above bottom nav on mobile */}
                    <main className="flex-1 w-full min-h-0 px-4 sm:px-5 py-4 sm:py-6 page-content-mobile">
                      <Routes>
                        {/* Public Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/restaurants/:id" element={<RestaurantPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />

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

                        {/* 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>

                    {/* Footer */}
                    <Footer />

                    {/* Bottom Nav (mobile) */}
                    <BottomNav />
                    </div>
                  </SocketProvider>
                </NotificationsProvider>
              </ThemeProvider>
            </SearchProvider>
          </LocationProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;