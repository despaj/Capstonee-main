import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const authChannelRef = useRef(null);

  const handleAppLogout = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client": "web",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status}`);
      }

      // Server session has been successfully destroyed.
      setUser(null);

      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tempUser");

      authChannelRef.current?.postMessage({
        type: "LOGOUT",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
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

  const restoreSession = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;

      if (!API_URL) {
        console.error("REACT_APP_API_URL is not configured.");
        setUser(null);
        return;
      }

      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Session restore failed: ${res.status}`);
      }

      const data = await res.json();

      if (!data.authenticated || !data.user) {
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error("Session restore failed:", err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("franchisync_auth");

    authChannelRef.current = channel;

    channel.onmessage = async (event) => {
      if (event.data?.type === "LOGIN") {
        await restoreSession();
      }

      if (event.data?.type === "LOGOUT") {
        setUser(null);

        sessionStorage.removeItem("tempUser");
        sessionStorage.removeItem("user");
      }
    };

    return () => {
      channel.close();
      authChannelRef.current = null;
    };
  }, [restoreSession]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/admin-login"
            element={
              user ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <AdminLogin
                  onLogin={(loggedInUser) => {
                    setUser(loggedInUser);

                    authChannelRef.current?.postMessage({
                      type: "LOGIN",
                    });
                  }}
                />
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
