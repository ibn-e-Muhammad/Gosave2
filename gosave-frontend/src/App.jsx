import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "./contexts/AuthContext";

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Home from "./pages/Home";
import Deals from "./pages/Deals";
import Partners from "./pages/Partners";
import Membership from "./pages/Membership";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import AdminVerify from "./pages/AdminVerify";
import AdminDashboard from "./pages/Admin/Dashboard";
import PartnerDashboard from "./components/Partner/PartnerDashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [message, setMessage] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/health`);
        setMessage(response.data.message);
        setApiStatus("connected");
      } catch (error) {
        console.error("Failed to fetch health check:", error);
        setMessage("Could not connect to the API server.");
        setApiStatus("disconnected");
      }
    };
    fetchHealth();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-royal-gradient">
          <Navbar />

          {/* API Status Banner */}
          <div
            className={`fixed top-18 left-0 right-0 z-40 text-center py-2 text-sm backdrop-blur-sm ${
              apiStatus === "connected"
                ? "bg-validation-success/20 text-white border-b border-validation-success/30"
                : apiStatus === "disconnected"
                ? "bg-validation-error/20 text-white border-b border-validation-error/30"
                : "bg-royal-gold/20 text-white border-b border-royal-gold/30"
            }`}
          >
            API Status: {message || "Checking connection..."}
          </div>

          {/* Main Content */}
          <main className="pt-24">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/admin/verify" element={<AdminVerify />} />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["member", "admin"]}
                    requireMembership={true}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Partner Only Routes */}
              <Route
                path="/partner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["partner", "admin"]}>
                    <PartnerDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
