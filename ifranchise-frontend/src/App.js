import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./components/LandingPage";
import AdminLogin from "./components/AdminLogin";
import IPharmaForm from "./components/iPharmaForm";
import AdminDashboard from "./components/AdminDashboard";
import ApplyFranchise from "./components/ApplyFranchise";
import Receipts from "./components/Receipts";
import ReschedulePage from "./components/ReschedulePage";
import StaffDashboard from "./components/StaffDashboard";
import FranchiseeDashboard from "./components/FranchiseeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import FranchiseAdminDashboard from "./components/FranchiseAdminDashboard";
import SalesAdmin from "./components/SalesAdmin";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const handleAppLogout = () => {
    // First unmount every protected dashboard/component.
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("rememberedUser");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tempUser");

    // Wait until React has committed the dashboard unmount.
    setTimeout(async () => {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout error:", err);
      }
    }, 100);
  };

  const renderDashboard = () => {
    if (!user) {
      return <Navigate to="/admin-login" replace />;
    }

    switch (user.role) {
      case "Super Admin":
        return <AdminDashboard user={user} onLogout={handleAppLogout} />;

      case "Franchisee Operations Admin":
        return (
          <FranchiseAdminDashboard user={user} onLogout={handleAppLogout} />
        );

      case "Sales Admin":
        return <SalesAdmin user={user} onLogout={handleAppLogout} />;

      case "Franchisee":
        return <FranchiseeDashboard user={user} onLogout={handleAppLogout} />;

      case "Manager":
        return <ManagerDashboard user={user} onLogout={handleAppLogout} />;

      case "Staff":
        return <StaffDashboard user={user} onLogout={handleAppLogout} />;

      default:
        return <Navigate to="/admin-login" replace />;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          setUser(null);
          sessionStorage.removeItem("user");
          return;
        }

        if (!response.ok) {
          throw new Error(`Session check failed: ${response.status}`);
        }

        const data = await response.json();

        setUser(data);
        
      } catch (error) {
        console.error("Session restore failed:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/admin-login"
            element={
              user ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <AdminLogin onLogin={setUser} />
              )
            }
          />

          <Route path="/apply-pharma" element={<IPharmaForm />} />

          <Route path="/admin-dashboard" element={renderDashboard()} />

          <Route path="/apply-franchise" element={<ApplyFranchise />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/reschedule/:token" element={<ReschedulePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
