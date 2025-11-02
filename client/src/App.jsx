import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Layout from "./components/Layout.jsx";
import SubscriptionWall from "./components/SubscriptionWall.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewExpenses from "./pages/ViewExpenses.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import Profile from "./pages/Profile.jsx";
import { UserProvider, useUser } from "./contexts/UserContext.jsx";
import API from "./api/api.js";

function AppContent() {
  const { user, loading } = useUser();
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);

  // Global error handler for subscription expired
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error === 'subscription_expired') {
          setSubscriptionExpired(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if subscription has expired
  useEffect(() => {
    if (user) {
      const now = new Date();
      const subscriptionEndsAt = new Date(user.subscriptionEndsAt);
      
      if (now > subscriptionEndsAt) {
        setSubscriptionExpired(true);
      } else {
        setSubscriptionExpired(false);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="erp-loading-spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If subscription expired, show subscription wall
  if (user && subscriptionExpired) {
    return <SubscriptionWall />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/view-expenses" element={<Layout><ViewExpenses /></Layout>} />
            <Route path="/add-expense" element={<Layout><AddExpense /></Layout>} />
            <Route path="/payment-history" element={<Layout><PaymentHistory /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;