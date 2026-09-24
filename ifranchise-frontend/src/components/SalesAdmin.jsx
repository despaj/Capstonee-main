//copy here dashboard content (analysis, sales trend, sales vs stock)

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ifranchisejpg from "../assets/ifranchisejpg.jpg";
import franchisync from "../assets/franchisyncjpg.jpg";
import jsPDF from "jspdf";
import MenuInventoryContent from "./MenuInventoryContent";
import StockInventoryContent from "./StockInventoryContent";
import html2canvas from "html2canvas";
import logoIfranchise from "../assets/report/ifranchise-logo.png";
import logoSync from "../assets/report/franchsync-logo.png";

import {
  Home,
  Box,
  FileText,
  FileCheck,
  Users,
  BarChart2,
  MessageCircle,
  User,
  ShoppingCart,
  LogOut,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
  Grid3X3,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Building2,
  Store,
  TrendingDown,
  TrendingUp,
  Layers,
  GitBranch,
  DoorOpen,
  Logout,
  Globe,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Archive,
  Calendar,
  Pin,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  RefreshCw,
  Eye,
  Clock,
  Info,
  Download,
  History,
  RotateCcw,
  UserPlus,
  CheckCircle,
  ChevronRight,
  XIcon,
  HistoryIcon,
  Lock,
  Unlock,
  CheckCircle2,
  Zap,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  SearchIcon,
  Brain,
  PieChart,
  LineChart,
  ShieldCheck,
  Bell,
  Printer,
} from "lucide-react";

import { adminModuleFetch } from "../utils/adminModuleFetch";

const ADMIN_API_BASE = String(process.env.REACT_APP_API_URL || "")
  .trim()
  .replace(/;+$/, "")
  .replace(/\/+$/, "");

function useAdminLiveRefresh(refresh, dependencies) {
  useEffect(() => {
    let stopped = false,
      running = false,
      queued = false,
      timer;
    const run = async () => {
      if (stopped) return;
      if (running) {
        queued = true;
        return;
      }
      running = true;
      try {
        await refresh();
      } catch (error) {
        console.error("Dashboard refresh failed", error);
      } finally {
        running = false;
        if (queued && !stopped) {
          queued = false;
          timer = setTimeout(run, 300);
        }
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(run, 300);
    };
    const visible = () => {
      if (document.visibilityState !== "hidden") schedule();
    };
    run();
    const interval = setInterval(() => {
      if (document.visibilityState !== "hidden") run();
    }, 15000);
    window.addEventListener("franchisync:data-changed", schedule);
    window.addEventListener("focus", visible);
    window.addEventListener("online", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener("franchisync:data-changed", schedule);
      window.removeEventListener("focus", visible);
      window.removeEventListener("online", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, dependencies);
}

const C = {
  // core
  green: "#3b791e",
  greenDk: "#2c5c16",
  greenMid: "#c9dba0",
  greenLt: "#f0f5e8",
  teal: "#509820",
  lime: "#d1c53e",
  limeInk: "#24310C",
  ink: "#3f8b28",
  muted: "#5C6B60",
  border: "#E1E6D8",
  bg: "#F6F7F1",
  white: "#ffffff",
  warn: "#b45309",
  warnBg: "#fff7ed",
  ok: "#2c5c16",
  okBg: "#f0f5e8",
  red: "#c0392b",
  redBg: "#fdf1f0",
  redBorder: "#f2c9c4",
};

const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root,
  button, input, select, textarea, option {
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .sa-root,
  .sa-root *,
  .sa-root *::before,
  .sa-root *::after {
    font-family:'Plus Jakarta Sans',sans-serif !important;
  }
  :root {
    --g1:#bdd43c; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
    --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
    --lime:#bdd43c; --lime-ink:#24310C; --white:#ffffff;
    --gray-100:#F3F4F1; --gray-200:#E1E6D8; --gray-300:#D4DBC8;
    --gray-400:#9CA89C; --gray-500:#6B7A65; --gray-600:#4B5A45;
    --gray-700:#374132; --gray-800:#1F2A1B;
    --shadow:rgba(50,109,32,0.10); --shadow-strong:rgba(14,59,34,0.20);
    --card-border:#E1E6D8;
    --grad-main:linear-gradient(135deg,#509820,#3b791e);
    --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
    --grad-gold:linear-gradient(135deg,#e9cd30,#bdd43c);
    --grad-bg:#F6F7F1;
  }

  /* ── Sidebar shell ── */
  .sa-sidebar {
    background:#fff;
    box-shadow: 1px 0 0 #E1E6D8;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 18px 14px;
    overflow-y: auto;
    z-index: 100;
  }

  .sa-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px 18px;
  }

  .sa-logo-mark {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    flex-shrink: 0;
  }

  .sa-brand {
    font-size: 16px;
    white-space: nowrap;
  }

  .sa-toggle {
    background: none;
    border: 1px solid #E1E6D8;
    border-radius: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #5C6B60;
    flex-shrink: 0;
  }

  /* ── Section labels ("Main Menu" / "Account") ── */
  .sa-nav-section {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9CA89C;
    padding: 12px 10px 6px;
  }

  /* ── Nav ── */
  .sa-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sa-nav-item {
    font-family:'Plus Jakarta Sans',sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    color: #5C6B60;
    cursor: pointer;
    position: relative;
    font-size: 14px;
    font-weight: 500;
    transition: background .15s ease, color .15s ease;
  }
  .sa-nav-item:hover { background:#F6F7F1; color:#12241B; }
  .sa-nav-item.active {
    background:#F6F7F1;
    color:#2c5c16;
    box-shadow:none;
    font-weight:700;
  }
  .sa-nav-item.active .sa-nav-icon { color:#3b791e; }
  .sa-nav-item.logout { color:#c0392b; }
  .sa-nav-item.logout:hover { background:#fdf1f0; }

  .sa-nav-icon {
    flex-shrink:0;
    display:flex;
    align-items: center;
    justify-content:center;
    width:22px;
    height: 22px;
  }

  .sa-nav-label {
    flex: 1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  .sa-nav-bar {
    position:absolute;
    right:6px;
    top:20%;
    height:60%;
    width:3px;
    border-radius:2px;
    background:#bdd43c;
  }

  /* ── Topbar ── */
  .sa-topbar {
    background:#fff;
    box-shadow:none;
    border-bottom:1px solid #E1E6D8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 30px;
  }
  .sa-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-size: 22px; font-weight: 800; }
  .sa-avatar {
    background:#12241B; color:#bdd43c; box-shadow:none; border-radius:12px;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
  }
  .sa-user-name { font-weight: 700; font-size: 13px; color: #12241B; text-align: right; }
  .sa-user-role { font-size: 11.5px; color: #5C6B60; text-align: right; }
`;
const smallBtnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  height: 28,
  padding: "0 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  background: C.white,
};

const bmInput = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1.5px solid #b2dfdb",
  fontSize: 13,
  color: "#0d2b1e",
  background: "#f0fdf5",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const invInputSt = {
  height: 36,
  padding: "0 11px",
  borderRadius: 9,
  border: `1px solid ${C.border}`,
  background: C.bg,
  fontSize: 13,
  color: C.ink,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  width: "100%",
};

const BmSection = ({ children, style = {} }) => (
  <div
    style={{
      background: C.white,
      border: `1px solid rgba(0,168,76,0.12)`,
      borderRadius: 18,
      boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
      overflow: "hidden",
      marginBottom: 24,
      ...style,
    }}
  >
    {children}
  </div>
);
const BmSectionHeader = ({ title, subtitle, action }) => (
  <div
    style={{
      background: `linear-gradient(135deg,#509820,#3b791e)`,
      color: C.white,
      padding: "16px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
    {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
  </div>
);

const bmLabel = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "#2e6725",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const btnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 38,
  padding: "0 18px",
  borderRadius: 999,
  border: `1.5px solid ${C.border}`,
  background: C.white,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  whiteSpace: "nowrap",
  color: C.green,
  transition: "all .2s cubic-bezier(.4,0,.2,1)",
};

const fmtPeriod = (period) => {
  if (!period) return "—";

  const parts = period.split("→").map((p) => p.trim());

  const formatPart = (p) => {
    const d = new Date(p);
    if (isNaN(d.getTime())) return p;
    return d.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return parts.map(formatPart).join(" → ");
};

const fmtPeso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TrashIcon = ({ size = 14, ...p }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ─── Shared stat card ─────────────────────────────────────────────────────────
function BmStatCard({ label, value, sub, icon, bg }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid rgba(0,168,76,0.12)`,
        borderRadius: 18,
        padding: "20px 22px",
        boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,140,60,0.13)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#5a7a65",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>
        {sub}
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SalesAdmin() {
  const navigate = useNavigate();

  const getUserFromStorage = () => {
    const s =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("tempUser") ||
      localStorage.getItem("rememberedUser");

    if (!s) return null;

    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/me`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          console.error("Failed to load current user:", response.status);
          return;
        }

        const data = await response.json();

        setUser(data.user || data);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  const [activeModule, setActiveModule] = useState(
    () => sessionStorage.getItem("sa_activeModule") || "dashboard",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [brands, setBrands] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [preset, setPreset] = useState("month");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const current = getUserFromStorage();
    if (!current) navigate("/admin-login");
    else setUser(current);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("sa_activeModule", activeModule);
  }, [activeModule]);

  useAdminLiveRefresh(async () => {
    const response = await adminModuleFetch(
      `${process.env.REACT_APP_API_URL}/dashboard/stats?preset=${preset}`,
      { cache: "no-store" },
    );
    if (response.ok) setStats(await response.json());
  }, [preset]);
  useAdminLiveRefresh(async () => {
    const response = await adminModuleFetch(
      `${process.env.REACT_APP_API_URL}/transactions`,
      { cache: "no-store" },
    );
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) setTransactions(data);
    }
  }, []);

  useEffect(() => {
    adminModuleFetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then((r) => r.json())
      .then((d) => setBrands(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminModuleFetch(`${process.env.REACT_APP_API_URL}/transactions`)
      .then((r) => r.json())
      .then((d) => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const confirmLogout = async () => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;
      await adminModuleFetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
    } catch {
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("sa_activeModule");
      window.location.href = "/admin-login";
    }
  };

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      section: "main",
    },
    {
      id: "reports",
      label: "Sales & Reports",
      icon: <BarChart2 size={20} />,
      section: "main",
    },
    {
      id: "stockInventory",
      label: "Stock Inventory",
      icon: <Layers size={20} />,
      section: "main",
    },
    {
      id: "inventory",
      label: "Product Catalogue",
      icon: <Box size={20} />,
      section: "main",
    },
    {
      id: "mobileShop",
      label: "Mobile Shop Supplies",
      icon: <ShoppingCart size={20} />,
      section: "main",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: <User size={20} />,
      section: "account",
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut size={20} />,
      section: "account",
      action: () => setShowLogoutModal(true),
    },
  ];
  const mainNav = navigation.filter((n) => n.section === "main");
  const accountNav = navigation.filter((n) => n.section === "account");

  const moduleLabel =
    navigation.find((n) => n.id === activeModule)?.label || "Dashboard";

  return (
    <div className="sa-root">
      <style>
        {ADMIN_CSS}
        {`
         .sa-root {
     font-family:'Plus Jakarta Sans',sans-serif;
     display:flex; min-height:100vh;
     background: #F6F7F1;
     background-image: radial-gradient(#E1E6D8 1px, transparent 1px);
     background-size: 22px 22px;
   }
   .sa-sidebar {
     width:${sidebarCollapsed ? "76px" : "272px"};
     transition: width 0.3s ease;
   }
   .sa-main {
     flex: 1;
     min-width: 0;
     margin-left:${sidebarCollapsed ? "76px" : "272px"};
     transition: margin-left 0.3s ease;
   }
     .sa-content {
     width: 100%;
     max-width: 1400px;
     margin: 0 auto;
     padding: 20px 30px 40px;
     box-sizing: border-box;
   }
.sa-logo-mark {
  background: #12241B;           /* dark chip, not gradient */
  color:#bdd43c;
  box-shadow:none;
  border-radius:10px;
}
.sa-brand { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-weight:800; }
.sa-nav-item {
  font-family:'Plus Jakarta Sans',sans-serif;
  border-radius:12px;
  color:#5C6B60;
}
.sa-nav-item:hover { background:#F6F7F1; color:#12241B; }
.sa-nav-item.active {
  background:#F6F7F1;
  color:#2c5c16;
  box-shadow:none;                /* remove the inset ring */
  font-weight:700;
}
.sa-nav-item.active .sa-nav-icon { color:#3b791e; }
.sa-nav-bar {
  background:#bdd43c;             /* lime active-rail, not gradient */
  width:3px;
}
.sa-nav-item.logout { color:#c0392b; }
.sa-nav-item.logout:hover { background:#fdf1f0; }
        .sa-nav-icon { flex-shrink:0; display:flex; justify-content:center; width:22px; }
        .sa-nav-label {
          display:${sidebarCollapsed ? "none" : "block"};
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .sa-nav-bar {
          position:absolute; right:0; top:20%; height:60%;
          width:3px; border-radius:2px; background:var(--grad-main);
        }
        .sa-main {
          flex:1;
          margin-left:${sidebarCollapsed ? "76px" : "272px"};
          transition:margin-left 0.3s ease;
        }
        
     .sa-topbar {
  width:100%;
  background:#fff;
  backdrop-filter:none;
  box-shadow:none;
  border-bottom:1px solid #E1E6D8;
  box-sizing:border-box;
}
.sa-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; }
.sa-avatar { background:#12241B; color:#bdd43c; box-shadow:none; border-radius:12px; }
      `}
      </style>

      {/* ── SIDEBAR ── */}

      <aside className="sa-sidebar">
        <div className="sa-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoSync}
                alt="FranchiSync"
                style={{ height: 50, width: "auto", objectFit: "contain" }}
              />
            </div>
          )}
          {sidebarCollapsed && (
            <img
              src={logoIfranchise}
              alt="iFranchise"
              style={{
                height: 35,
                width: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
              }}
            />
          )}
          {!sidebarCollapsed && (
            <button
              className="sa-toggle"
              onClick={() => setSidebarCollapsed(true)}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <button
              className="sa-toggle"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <nav className="sa-nav">
          {!sidebarCollapsed && <div className="sa-nav-section">Main Menu</div>}
          {mainNav.map((item) => (
            <div
              key={item.id}
              className={`sa-nav-item${activeModule === item.id ? " active" : ""}`}
              onClick={() =>
                item.action ? item.action() : setActiveModule(item.id)
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span className="sa-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="sa-nav-bar" />}
            </div>
          ))}

          {!sidebarCollapsed && (
            <div className="sa-nav-section" style={{ marginTop: 8 }}>
              Account
            </div>
          )}
          {accountNav.map((item) => (
            <div
              key={item.id}
              className={`sa-nav-item${item.id === "logout" ? " logout" : ""}${activeModule === item.id ? " active" : ""}`}
              onClick={() =>
                item.action ? item.action() : setActiveModule(item.id)
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span className="sa-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="sa-main">
        <div className="sa-topbar">
          <div>
            <h1 className="sa-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div className="sa-user-name">{user?.name}</div>
              <div className="sa-user-role">Sales Admin — {user?.branch}</div>
            </div>
            <div className="sa-avatar">
              {user?.name ? user.name.trim()[0].toUpperCase() : "S"}
            </div>
          </div>
        </div>

        <div className="sa-content">
          {activeModule === "dashboard" && (
            <SalesDashboardContent
              transactions={transactions}
              brands={brands}
            />
          )}
          {activeModule === "inventory" && (
            <MenuInventoryContent user={user} brands={brands} />
          )}
          {activeModule === "stockInventory" && (
            <StockInventoryContent user={user} brands={brands} />
          )}
          {activeModule === "mobileShop" && (
            <SalesMobileShopContent user={user} brands={brands} />
          )}
          {activeModule === "reports" && (
            <SalesReportsContent user={user} brands={brands} />
          )}
          {activeModule === "profile" && <SalesProfileContent user={user} />}
        </div>
      </main>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 22,
              padding: "32px 36px",
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              border: "1px solid rgba(0,168,76,0.15)",
              animation: "slideUp .25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background:
                  "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                border: "1.5px solid rgba(239,68,68,0.15)",
              }}
            >
              <LogOut size={28} color="#dc2626" strokeWidth={1.75} />
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#0d2b1e",
                marginBottom: 8,
              }}
            >
              Log out?
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "1.5px solid #b2dfdb",
                  background: "#f0fdf5",
                  color: "#5a7a65",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fmtAmt = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtShort = (n) => {
  if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k";
  return "₱" + Number(n).toFixed(0);
};
const fmtPeso1 = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const fmt8 = (d) => d.toISOString().slice(0, 10);
const FONT = "'Plus Jakarta Sans', sans-serif";
const PAL = [
  "#00c853",
  "#00897b",
  "#26a69a",
  "#43a047",
  "#66bb6a",
  "#f59e0b",
  "#1d4ed8",
  "#7c3aed",
  "#db2777",
  "#ea580c",
];

function ComboChart({
  barData = [],
  lineData = [],
  labels = [],
  height = 200,
}) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
  const W = 700,
    H = height,
    PL = 56,
    PR = 48,
    PT = 16,
    PB = 32;
  const pW = W - PL - PR,
    pH = H - PT - PB;
  const barSeries = Array.isArray(barData[0]) ? barData : [barData];
  const maxBar = Math.max(...barSeries.flat(), 1) * 1.2;
  const maxLine = Math.max(...(lineData || []), 1) * 1.2;
  const minLine = Math.min(...(lineData || []), 0);
  const n = labels.length;
  const bW = Math.min(22, pW / Math.max(n, 1) - 6);

  const linepts = (lineData || []).map((v, i) => ({
    x: PL + (i / Math.max(n - 1, 1)) * pW,
    y: PT + pH - ((v - minLine) / (maxLine - minLine || 1)) * pH,
    v,
  }));
  let linePath = "";
  if (linepts.length > 1) {
    linePath = `M ${linepts[0].x} ${linepts[0].y}`;
    for (let i = 0; i < linepts.length - 1; i++) {
      const cx = (linepts[i].x + linepts[i + 1].x) / 2;
      linePath += ` C ${cx} ${linepts[i].y}, ${cx} ${linepts[i + 1].y}, ${linepts[i + 1].x} ${linepts[i + 1].y}`;
    }
  }
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PT + pH * (1 - t),
    label: fmtShort(t * maxBar),
  }));

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0,
      bestD = Infinity;
    labels.forEach((_, i) => {
      const x = PL + (i / Math.max(n - 1, 1)) * pW;
      const d = Math.abs(x - mx);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setTip({
      i: best,
      x: PL + (best / Math.max(n - 1, 1)) * pW,
      label: labels[best],
    });
  };

  return (
    <div
      style={{ position: "relative", cursor: "crosshair" }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTip(null)}
    >
      <svg
        ref={ref}
        style={{ width: "100%", display: "block", overflow: "visible" }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          {barSeries.map((_, si) => (
            <linearGradient
              key={si}
              id={`cbg${si}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
              <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
            </linearGradient>
          ))}
          <linearGradient id="clgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PL}
              y1={t.y}
              x2={W - PR}
              y2={t.y}
              stroke="#e8ede9"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={PL - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b9070"
              fontFamily={FONT}
            >
              {t.label}
            </text>
          </g>
        ))}
        {labels.map((lbl, i) => {
          const groupW = pW / Math.max(n, 1);
          const groupX = PL + i * groupW + groupW / 2;
          return barSeries.map((series, si) => {
            const v = series[i] || 0;
            const bH = (v / maxBar) * pH;
            const x = groupX - (barSeries.length / 2 - si) * (bW + 2) - bW / 2;
            return (
              <rect
                key={`${i}-${si}`}
                x={x}
                y={PT + pH - bH}
                width={bW}
                height={bH}
                rx="4"
                fill={`url(#cbg${si})`}
                opacity={tip?.i === i ? 1 : 0.82}
              />
            );
          });
        })}
        {labels.map((lbl, i) => (
          <text
            key={i}
            x={PL + (i / Math.max(n - 1, 1)) * pW}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#6b9070"
            fontFamily={FONT}
          >
            {lbl}
          </text>
        ))}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#clgLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        {linepts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tip?.i === i ? 5 : 3}
            fill="#1d4ed8"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {tip && (
          <line
            x1={tip.x}
            y1={PT}
            x2={tip.x}
            y2={PT + pH}
            stroke="#00c853"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.4"
          />
        )}
      </svg>
      {tip && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: `${(tip.x / W) * 100}%`,
            transform: "translateX(-50%)",
            background: "#0d2b1e",
            color: "#fff",
            borderRadius: 10,
            padding: "8px 12px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: 11,
            fontFamily: FONT,
            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>
            {tip.label}
          </div>
          {barSeries.map((s, si) => (
            <div key={si} style={{ color: PAL[si] }}>
              {fmtShort(s[tip.i] || 0)}
            </div>
          ))}
          {lineData?.[tip.i] != null && (
            <div style={{ color: "#93c5fd" }}>
              GP%: {lineData[tip.i].toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HBarChart({ data = [] }) {
  const maxV = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#0d2b1e",
                fontFamily: FONT,
              }}
            >
              {d.label}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: PAL[i % PAL.length],
                fontFamily: FONT,
              }}
            >
              {fmtShort(d.value)}
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "#f0fdf5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`,
                width: `${(d.value / maxV) * 100}%`,
                transition: "width .6s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChartSVG({
  segments = [],
  size = 140,
  innerRadius = 0.6,
  centerLabel = "",
  centerSub = "",
  showLegend = true,
}) {
  const [hover, setHover] = useState(null);
  const R = size / 2,
    cx = R,
    cy = R;
  const outerR = R - 4,
    innerR = outerR * innerRadius;
  const total = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
  const slices = segments.map((seg, i) => {
    let pct = (seg.value || 0) / total;
    const sa = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    let ea = cum * 2 * Math.PI - Math.PI / 2;

    if (pct >= 0.9999) ea -= 0.0001;

    const x1 = cx + outerR * Math.cos(sa),
      y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea),
      y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(ea),
      iy1 = cy + innerR * Math.sin(ea);
    const ix2 = cx + innerR * Math.cos(sa),
      iy2 = cy + innerR * Math.sin(sa);
    const large = ea - sa > Math.PI ? 1 : 0;
    const mid = sa + (ea - sa) / 2;
    return {
      ...seg,
      path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`,
      mid,
      pct,
      color: seg.color || PAL[i % PAL.length],
    };
  });
  const hov = hover !== null ? slices[hover] : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ flexShrink: 0 }}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            opacity={hover === null ? 0.88 : hover === i ? 1 : 0.42}
            stroke="#fff"
            strokeWidth="2"
            transform={
              hover === i
                ? `translate(${Math.cos(s.mid) * 4} ${Math.sin(s.mid) * 4})`
                : ""
            }
            style={{ transition: "all .18s", cursor: "pointer" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {innerRadius > 0 && (
          <>
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill="#0d2b1e"
              fontFamily={FONT}
            >
              {hov
                ? Math.round(hov.pct * 100) + "%"
                : centerLabel || total.toLocaleString()}
            </text>
            <text
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              fontSize="9.5"
              fill="#5a7a65"
              fontFamily={FONT}
            >
              {hov ? hov.label : centerSub || "total"}
            </text>
          </>
        )}
      </svg>
      {showLegend && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            minWidth: 0,
          }}
        >
          {slices.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                opacity: hover === null ? 1 : hover === i ? 1 : 0.45,
                transition: "opacity .15s",
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#0d2b1e",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: FONT,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT }}
                >
                  {Math.round(s.pct * 100)}% · {(s.value || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SparkBar({ values = [], color = "#00c853", height = 30 }) {
  if (!values.length) return null;
  const maxV = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: color,
            opacity: 0.4 + 0.6 * (i / values.length),
            borderRadius: 2,
            height: `${Math.max(4, (v / maxV) * height)}px`,
          }}
        />
      ))}
    </div>
  );
}
function PanelCard({ children, style: s }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(50,109,32,0.05)",
        transition: "box-shadow .25s ease, transform .25s ease",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, sub, gradient, action }) {
  if (gradient) {
    return (
      <div
        style={{
          background: gradient,
          padding: "13px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 33,
              height: 33,
              borderRadius: 9,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,0.28)",
            }}
          >
            <Icon size={17} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
              }}
            >
              {title}
            </div>
            {sub && (
              <div
                style={{
                  fontSize: 10.5,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 1,
                }}
              >
                {sub}
              </div>
            )}
          </div>
        </div>
        {action}
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${C.border}`,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={C.lime} />
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 14,
              color: C.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          {sub && (
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function ChartLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        color: "#5a7a65",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: FONT,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.green,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.lime,
          boxShadow: "0 0 0 3px rgba(189,212,60,0.3)",
        }}
      />
      {children}
    </span>
  );
}
function BulletItem({ text, color = "#00897b", size = "normal" }) {
  const fs = size === "small" ? 11 : 12.5;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          marginTop: fs === 11 ? 4 : 5,
        }}
      />
      <span
        style={{
          fontSize: fs,
          color: "#0d2b1e",
          lineHeight: 1.6,
          fontFamily: FONT,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function SalesTrendSection({
  values,
  labels,
  kpiData,
  total,
  avg,
  peak,
  low,
  peakLabel,
  pctChange,
  trending,
  getRangeLabel,
  filterLabel,
  filterBrand,
  filterBranch,
  brands = [],
  transactionCount = 0,
  averageTransaction = 0,
  branchPerformance = [],
  brandPerformance = [],
  branchProfitability = [],
  categoryPerformance = [],
}) {
  const panelRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const isFiltered = !!(filterBrand || filterBranch);

  const selectedBrandObj = useMemo(
    () => brands.find((b) => String(b.id) === String(filterBrand)),
    [brands, filterBrand],
  );

  const catData = useMemo(() => {
    if (
      Array.isArray(kpiData?.categoryBreakdown) &&
      kpiData.categoryBreakdown.length
    ) {
      return kpiData.categoryBreakdown;
    }
    return Array.isArray(categoryPerformance) ? categoryPerformance : [];
  }, [kpiData, categoryPerformance]);

  const brandBreakdownData = useMemo(() => {
    if (
      Array.isArray(kpiData?.brandBreakdown) &&
      kpiData.brandBreakdown.length
    ) {
      return kpiData.brandBreakdown;
    }
    return brandPerformance;
  }, [kpiData, brandPerformance]);

  const categoryPanelData = isFiltered ? catData : brandBreakdownData;
  const categoryPanelTitle = isFiltered
    ? "Sales by Category"
    : "Sales by Brand";
  const CategoryPanelIcon = isFiltered ? PieChart : Globe;

  const branchData = useMemo(() => {
    if (
      Array.isArray(kpiData?.branchBreakdown) &&
      kpiData.branchBreakdown.length
    )
      return kpiData.branchBreakdown.slice(0, 6);
    return branchPerformance.slice(0, 6);
  }, [kpiData, branchPerformance]);

  const branchAttentionItems = useMemo(() => {
    const rows = Array.isArray(branchProfitability)
      ? branchProfitability.filter((row) => Number(row?.revenue || 0) > 0)
      : [];

    if (!rows.length) return [];

    const items = [];
    const usedBranches = new Set();

    const addItem = (row, config) => {
      if (!row?.branch || usedBranches.has(row.branch) || items.length >= 5)
        return;
      usedBranches.add(row.branch);
      items.push({
        branch: row.branch,
        ...config,
      });
    };

    // 1. Data quality comes first. A 100% margin caused by zero COGS should
    //    never be presented as a genuine high-margin success.
    rows
      .filter((row) => Number(row.cogs || 0) <= 0)
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .forEach((row) => {
        addItem(row, {
          status: "DATA CHECK",
          tone: "info",
          title: "Verify cost data",
          detail: `${Number(row.margin || 0).toFixed(1)}% margin with no recorded COGS.`,
          action:
            "Confirm transaction cost-of-goods data before interpreting profitability.",
        });
      });

    // 2. Low-margin branches need management attention.
    rows
      .filter(
        (row) => Number(row.cogs || 0) > 0 && Number(row.margin || 0) < 25,
      )
      .sort((a, b) => Number(a.margin || 0) - Number(b.margin || 0))
      .forEach((row) => {
        addItem(row, {
          status: "MARGIN WATCH",
          tone: "warning",
          title: "Margin requires review",
          detail: `${Number(row.margin || 0).toFixed(1)}% margin on ${fmtAmt(row.revenue)} revenue.`,
          action: "Review product costs, pricing, discounts and sales mix.",
        });
      });

    // 3. High-margin branches may be good candidates for controlled growth.
    rows
      .filter(
        (row) => Number(row.cogs || 0) > 0 && Number(row.margin || 0) >= 40,
      )
      .sort((a, b) => Number(b.margin || 0) - Number(a.margin || 0))
      .forEach((row) => {
        addItem(row, {
          status: "GROWTH OPPORTUNITY",
          tone: "success",
          title: "Strong margin performance",
          detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.avgOrder)} average order.`,
          action:
            "Assess whether sales volume can be increased while preserving current margins.",
        });
      });

    // 4. Flag branches whose transaction volume is materially below the group.
    const avgTransactions =
      rows.reduce((sum, row) => sum + Number(row.transactions || 0), 0) /
      Math.max(rows.length, 1);

    rows
      .filter(
        (row) =>
          Number(row.transactions || 0) > 0 &&
          Number(row.transactions || 0) < Math.max(2, avgTransactions * 0.5),
      )
      .sort((a, b) => Number(a.transactions || 0) - Number(b.transactions || 0))
      .forEach((row) => {
        addItem(row, {
          status: "LOW VOLUME",
          tone: "neutral",
          title: "Low transaction activity",
          detail: `${Number(row.transactions || 0).toLocaleString()} transaction${Number(row.transactions || 0) === 1 ? "" : "s"} · ${fmtAmt(row.avgOrder)} average order.`,
          action:
            "Review traffic, local demand and branch-level selling activity.",
        });
      });

    // 5. If space remains, surface one stable branch as a positive benchmark.
    rows
      .filter(
        (row) =>
          Number(row.cogs || 0) > 0 &&
          Number(row.margin || 0) >= 25 &&
          Number(row.margin || 0) < 40,
      )
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .forEach((row) => {
        addItem(row, {
          status: "STABLE",
          tone: "healthy",
          title: "Healthy operating range",
          detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.revenue)} revenue.`,
          action:
            "Maintain performance and monitor for changes in cost or transaction volume.",
        });
      });

    return items.slice(0, 5);
  }, [branchProfitability]);

  const gpLine = useMemo(() => {
    return kpiData?.gpSeries?.length === values.length ? kpiData.gpSeries : [];
  }, [kpiData, values]);

  const priorYearValues = useMemo(() => {
    return kpiData?.priorYearValues?.length === values.length
      ? kpiData.priorYearValues
      : [];
  }, [kpiData, values]);

  const hasGpData = gpLine.length === values.length && values.length > 0;
  const hasPriorYearData =
    priorYearValues.length === values.length && values.length > 0;

  const hasData = total > 0;
  const grossProfit = kpiData?.salesProfit ?? null;
  const txCount = kpiData?.txCount ?? transactionCount ?? 0;
  const avgOrder = kpiData?.avgOrder ?? averageTransaction ?? 0;

  const analysisBullets = useMemo(() => {
    if (!hasData) return [];
    const bullets = [];
    bullets.push(
      `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`,
    );
    if (grossProfit != null)
      bullets.push(
        `Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max(kpiData?.totalSales ?? total, 1)) * 100)}% margin.`,
      );
    bullets.push(
      `${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt(avgOrder)}.`,
    );
    bullets.push(
      `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`,
    );
    bullets.push(
      `Peak revenue of ${fmtAmt(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt(peak - avg)}.`,
    );
    if (low < avg * 0.5)
      bullets.push(
        `Lowest period at ${fmtAmt(low)} — significantly below average, consider investigating that interval.`,
      );
    if (categoryPanelData.length) {
      const top = categoryPanelData[0];
      bullets.push(
        `${top.label} is the top-performing ${isFiltered ? "category" : "brand"} at ${fmtShort(top.value)} (${Math.round((top.value / total) * 100)}% of revenue).`,
      );
    }
    if (branchData.length) {
      const topBranch = branchData[0];
      bullets.push(
        `${topBranch.label} leads branch revenue at ${fmtShort(topBranch.value)}.`,
      );
    }
    return bullets;
  }, [
    hasData,
    total,
    grossProfit,
    txCount,
    avgOrder,
    trending,
    pctChange,
    peak,
    peakLabel,
    avg,
    low,
    categoryPanelData,
    branchData,
    kpiData,
    getRangeLabel,
    filterLabel,
    isFiltered,
  ]);

  // ── Print ──
  const handlePrint = () => {
    if (!panelRef.current) return;
    const printContents = panelRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to print this report.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { margin: 0; background: #ffffff !important; }
            @media print { @page { margin: 14mm; } button { display: none !important; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  // ── Download PDF ──
  const handleDownloadPDF = async () => {
    if (!panelRef.current) return;
    setPdfBusy(true);
    try {
      const margin = 30;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      const canvas = await html2canvas(panelRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: panelRef.current.scrollWidth,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const pageContentH = pageHeight - margin * 2 - 20;
      const totalPages = Math.max(1, Math.ceil(imgHeight / pageContentH));

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = margin - page * pageContentH;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          yOffset,
          contentWidth,
          imgHeight,
          undefined,
          "FAST",
        );
        pdf.setDrawColor(224, 242, 241);
        pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `Page ${page + 1} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 14,
          { align: "right" },
        );
      }
      pdf.save(
        `Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={TrendingUp}
        title="Sales Trend Analysis"
        sub={`${getRangeLabel()} · ${filterLabel}`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfBusy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: pdfBusy ? "not-allowed" : "pointer",
                fontFamily: FONT,
                opacity: pdfBusy ? 0.7 : 1,
              }}
            >
              <Download
                size={13}
                style={{
                  animation: pdfBusy ? "spin 0.8s linear infinite" : "none",
                }}
              />
              {pdfBusy ? "Preparing…" : "Download PDF"}
            </button>
          </div>
        }
      />
      <div ref={panelRef} style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 18,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChartLabel>
              <BarChart2 size={11} color="#00897b" /> Sales Trend %
            </ChartLabel>
            {hasData ? (
              <>
                <ComboChart
                  barData={
                    hasPriorYearData ? [values, priorYearValues] : [values]
                  }
                  lineData={hasGpData ? gpLine : []}
                  labels={labels}
                  height={220}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 10,
                    marginBottom: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { color: PAL[0], label: "Sales — selected period" },
                    ...(hasPriorYearData
                      ? [{ color: PAL[1], label: "Prior-year sales" }]
                      : []),
                    ...(hasGpData
                      ? [
                          {
                            color: "#1d4ed8",
                            label: "Gross Profit %",
                            line: true,
                          },
                        ]
                      : []),
                  ].map((l, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {l.line ? (
                        <svg width={22} height={10}>
                          <line
                            x1="0"
                            y1="5"
                            x2="22"
                            y2="5"
                            stroke={l.color}
                            strokeWidth="2.5"
                          />
                          <circle cx="11" cy="5" r="3" fill={l.color} />
                        </svg>
                      ) : (
                        <div
                          style={{
                            width: 12,
                            height: 10,
                            borderRadius: 3,
                            background: l.color,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: "#5a7a65",
                          fontFamily: FONT,
                        }}
                      >
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {[
                    {
                      label: "Total Revenue",
                      text: `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`,
                      icon: TrendingUp,
                      color: "#059669",
                      bg: "#ecfdf5",
                      border: "#a7f3d0",
                    },
                    ...(grossProfit != null
                      ? [
                          {
                            label: "Gross Profit",
                            text: `Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max(kpiData?.totalSales ?? total, 1)) * 100)}% margin.`,
                            icon: BarChart2,
                            color: "#1d4ed8",
                            bg: "#eff6ff",
                            border: "#bfdbfe",
                          },
                        ]
                      : []),
                    {
                      label: "Period Trend",
                      text: `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`,
                      icon: trending ? ArrowUpRight : ArrowDownRight,
                      color: trending ? "#059669" : "#dc2626",
                      bg: trending ? "#ecfdf5" : "#fef2f2",
                      border: trending ? "#a7f3d0" : "#fecaca",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        borderRadius: 11,
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: "#fff",
                          border: `1px solid ${card.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 2px 6px ${card.border}`,
                        }}
                      >
                        <card.icon size={16} color={card.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            color: card.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            fontFamily: FONT,
                            marginBottom: 3,
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#0d2b1e",
                            lineHeight: 1.55,
                            fontFamily: FONT,
                          }}
                        >
                          {card.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f8fffe",
                  borderRadius: 12,
                  border: "1.5px dashed #b2dfdb",
                }}
              >
                <BarChart2 size={28} color="#b2dfdb" />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    marginTop: 8,
                    color: "#5a7a65",
                    fontFamily: FONT,
                    textAlign: "center",
                    padding: "0 20px",
                  }}
                >
                  No data found for {getRangeLabel()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 4,
                    fontFamily: FONT,
                  }}
                >
                  Try a different range, brand, or branch
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              background: "linear-gradient(160deg,#f0fdf5,#eaf5ec)",
              border: "1px solid #c8e6c9",
              borderRadius: 14,
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 15,
                  borderRadius: 2,
                  background: "linear-gradient(180deg,#00c853,#00897b)",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#00695c",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: FONT,
                }}
              >
                Period Analysis
              </span>
            </div>
            {hasData ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 7,
                    marginBottom: 12,
                  }}
                >
                  {[
                    {
                      label: "Peak",
                      value: fmtAmt(peak),
                      sub: `on ${peakLabel}`,
                      color: "#059669",
                      bg: "#ecfdf5",
                      border: "#a7f3d0",
                    },
                    {
                      label: "Low",
                      value: fmtAmt(low),
                      sub: "Period min",
                      color: "#d97706",
                      bg: "#fffbeb",
                      border: "#fde68a",
                    },
                    {
                      label: "Average",
                      value: fmtAmt(avg),
                      sub: `${labels.length} pts`,
                      color: "#1d4ed8",
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                    },
                    {
                      label: "Trend",
                      value: `${trending ? "+" : ""}${pctChange}%`,
                      sub: trending ? "Upward" : "Downward",
                      color: trending ? "#059669" : "#dc2626",
                      bg: trending ? "#ecfdf5" : "#fef2f2",
                      border: trending ? "#a7f3d0" : "#fecaca",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: s.bg,
                        borderRadius: 9,
                        padding: "8px 9px",
                        border: `1px solid ${s.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          color: "#5a7a65",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: FONT,
                          marginBottom: 2,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: s.color,
                          fontFamily: FONT,
                          lineHeight: 1.15,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "#5a7a65",
                          fontFamily: FONT,
                          marginTop: 1,
                        }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#5a7a65",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                    marginBottom: 8,
                  }}
                >
                  Key Observations
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: 1,
                  }}
                >
                  {analysisBullets.slice(3).map((text, i) => {
                    const dotColors = [
                      "#7c3aed",
                      "#059669",
                      "#d97706",
                      "#dc2626",
                      "#00897b",
                      "#1d4ed8",
                    ];
                    const bgColors = [
                      "#f5f3ff",
                      "#ecfdf5",
                      "#fffbeb",
                      "#fef2f2",
                      "#f0fdf5",
                      "#eff6ff",
                    ];
                    const bdrColors = [
                      "#ddd6fe",
                      "#a7f3d0",
                      "#fde68a",
                      "#fecaca",
                      "#d1eedd",
                      "#bfdbfe",
                    ];
                    const dc = dotColors[i % dotColors.length];
                    const bc = bgColors[i % bgColors.length];
                    const bd = bdrColors[i % bdrColors.length];
                    return (
                      <div
                        key={i}
                        style={{
                          background: bc,
                          border: `1px solid ${bd}`,
                          borderRadius: 9,
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: dc,
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "#0d2b1e",
                            lineHeight: 1.55,
                            fontFamily: FONT,
                          }}
                        >
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Info size={22} color="#b2dfdb" />
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  Select a date range and branch to see analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Period Summary column removed — 2-column spaced layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "#f8fffe",
              border: "1px solid #e0f2f1",
              borderRadius: 14,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChartLabel>
              <CategoryPanelIcon size={11} color="#00897b" />{" "}
              {categoryPanelTitle}
            </ChartLabel>
            {categoryPanelData.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <DonutChartSVG
                    segments={categoryPanelData.map((d, i) => ({
                      label: d.label,
                      value: d.value,
                      color: PAL[i % PAL.length],
                    }))}
                    size={150}
                    centerLabel={
                      hasData
                        ? fmtShort(
                            categoryPanelData.reduce(
                              (s, d) => s + (d.value || 0),
                              0,
                            ),
                          )
                        : "—"
                    }
                    centerSub="total"
                    showLegend={false}
                  />
                </div>
                <div
                  style={{
                    height: 1,
                    background: "#e0f2f1",
                    margin: "2px 0 14px",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#5a7a65",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 10,
                  }}
                >
                  {isFiltered ? "Category Breakdown" : "Brand Breakdown"}
                </div>
                <div style={{ flex: 1 }}>
                  <HBarChart
                    data={categoryPanelData
                      .slice(0, 8)
                      .map((d) => ({ label: d.label, value: d.value }))}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b2dfdb",
                  fontFamily: FONT,
                  fontSize: 12,
                  textAlign: "center",
                  padding: "0 10px",
                }}
              >
                {isFiltered
                  ? "No category data available for this brand/branch yet."
                  : "No data"}
              </div>
            )}
          </div>
          <div
            style={{
              background: "#f8fffe",
              border: "1px solid #e0f2f1",
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <ChartLabel>
              <Target size={11} color="#00897b" />
              Branch Attention & Opportunities
            </ChartLabel>

            <div
              style={{
                fontSize: 10.5,
                color: "#789086",
                lineHeight: 1.5,
                marginTop: -3,
                marginBottom: 12,
                fontFamily: FONT,
              }}
            >
              Priority observations from branch profitability and transaction
              data
            </div>

            {branchAttentionItems.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {branchAttentionItems.map((item, index) => {
                  const tone = {
                    info: {
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                      accent: "#2563eb",
                      badgeBg: "#dbeafe",
                      badgeText: "#1e40af",
                    },
                    warning: {
                      bg: "#fffbeb",
                      border: "#fde68a",
                      accent: "#d97706",
                      badgeBg: "#fef3c7",
                      badgeText: "#92400e",
                    },
                    success: {
                      bg: "#ecfdf5",
                      border: "#a7f3d0",
                      accent: "#059669",
                      badgeBg: "#d1fae5",
                      badgeText: "#047857",
                    },
                    neutral: {
                      bg: "#f8fafc",
                      border: "#e2e8f0",
                      accent: "#64748b",
                      badgeBg: "#f1f5f9",
                      badgeText: "#475569",
                    },
                    healthy: {
                      bg: "#f0f5e8",
                      border: "#c9dba0",
                      accent: "#3b791e",
                      badgeBg: "#e8f0dd",
                      badgeText: "#2c5c16",
                    },
                  }[item.tone] || {
                    bg: "#f8fafc",
                    border: "#e2e8f0",
                    accent: "#64748b",
                    badgeBg: "#f1f5f9",
                    badgeText: "#475569",
                  };

                  return (
                    <div
                      key={`${item.branch}-${index}`}
                      style={{
                        background: tone.bg,
                        border: `1px solid ${tone.border}`,
                        borderLeft: `3px solid ${tone.accent}`,
                        borderRadius: 10,
                        padding: "9px 10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: "#102a1c",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: FONT,
                          }}
                        >
                          {item.branch}
                        </div>

                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: ".05em",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: 20,
                            background: tone.badgeBg,
                            color: tone.badgeText,
                            fontFamily: FONT,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "#334155",
                          lineHeight: 1.45,
                          fontFamily: FONT,
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          lineHeight: 1.5,
                          marginTop: 2,
                          fontFamily: FONT,
                        }}
                      >
                        {item.detail}
                      </div>

                      <div
                        style={{
                          fontSize: 9.7,
                          fontWeight: 700,
                          color: tone.accent,
                          lineHeight: 1.45,
                          marginTop: 4,
                          fontFamily: FONT,
                        }}
                      >
                        {item.action}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontFamily: FONT,
                  fontSize: 11.5,
                  textAlign: "center",
                  lineHeight: 1.6,
                  padding: 16,
                }}
              >
                No branch profitability observations are available for this
                filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function PrescriptiveSection({
  transactions,
  filterLabel,
  preset,
  total,
  values,
  labels = [],
  kpiData,
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const exportRef = useRef(null); // offscreen report layout used for Print + PDF

  const runAnalysis = async () => {
    if (!transactions?.length) {
      setError("No transaction data available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions, preset, filterLabel }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(
          new Date().toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch {
      setError("Could not reach the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const projRev = analysis?.projectedRevenue ?? null;
  const projChg = analysis?.projectedChange ?? null;
  const peakDay = analysis?.peakDay ?? null;
  const slowDay = analysis?.slowestDay ?? null;
  const conf = analysis?.confidence ?? null;

  // Prescriptive anomaly groups.
  // "ghost_sales" is the backend's existing anomalyType for a branch that
  // recorded sales while one or more inventory items are already at zero stock.
  const ghostStockAnomalies = useMemo(() => {
    const rows = Array.isArray(analysis?.stockAnomalies)
      ? analysis.stockAnomalies
      : [];

    return rows.filter((a) => {
      const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
      return type === "ghost_sales" || type === "ghost_stock";
    });
  }, [analysis]);

  // Preserve the other anomaly types instead of removing existing functionality.
  const otherStockAnomalies = useMemo(() => {
    const rows = Array.isArray(analysis?.stockAnomalies)
      ? analysis.stockAnomalies
      : [];

    return rows.filter((a) => {
      const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
      return type !== "ghost_sales" && type !== "ghost_stock";
    });
  }, [analysis]);

  const typeStyle = (type) =>
    ({
      success: {
        borderColor: "#059669",
        bg: "#ecfdf5",
        color: "#065f46",
        badgeBg: "#d1fae5",
        dot: "#059669",
      },
      warning: {
        borderColor: "#d97706",
        bg: "#fffbeb",
        color: "#92400e",
        badgeBg: "#fef3c7",
        dot: "#f59e0b",
      },
      info: {
        borderColor: "#2563eb",
        bg: "#eff6ff",
        color: "#1e40af",
        badgeBg: "#dbeafe",
        dot: "#3b82f6",
      },
    })[type] || {
      borderColor: "#6b7280",
      bg: "#f9fafb",
      color: "#374151",
      badgeBg: "#f3f4f6",
      dot: "#6b7280",
    };

  const preRunBullets = useMemo(() => {
    if (!total) return [];
    return [
      `${transactions?.length?.toLocaleString() ?? 0} transaction records are available to the AI service.`,
      `Recorded revenue represented by the selected dashboard series is ${fmtAmt(total)}.`,
      `The evidence charts below show the historical values supplied for analysis. AI forecasts only appear after Run AI Analysis is completed.`,
    ];
  }, [total, transactions]);

  // ── Print (opens the offscreen report layout in a new tab) ─────────────
  const handlePrint = () => {
    if (!exportRef.current) return;
    const printContents = exportRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to print this report.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { margin: 0; background: #ffffff !important; }
            @media print { @page { margin: 14mm; } button { display: none !important; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  // ── Download as an actual PDF file (same layout as Print) ──────────────
  const handleDownloadPDF = async () => {
    if (!exportRef.current) return;
    setPdfBusy(true);
    try {
      const margin = 30; // pt
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: exportRef.current.scrollWidth,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const pageContentH = pageHeight - margin * 2 - 20; // reserve a little for page number
      const totalPages = Math.max(1, Math.ceil(imgHeight / pageContentH));

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = margin - page * pageContentH;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          yOffset,
          contentWidth,
          imgHeight,
          undefined,
          "FAST",
        );

        pdf.setDrawColor(224, 242, 241);
        pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `Page ${page + 1} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 14,
          { align: "right" },
        );
      }

      pdf.save(
        `Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Brain}
        title="AI Prescriptive Analysis"
        sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
        gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handlePrint}
              title="Print"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(0,200,83,0.22)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfBusy}
              title="Download as PDF"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(0,200,83,0.22)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: pdfBusy ? "not-allowed" : "pointer",
                fontFamily: FONT,
                opacity: pdfBusy ? 0.7 : 1,
              }}
            >
              <Download
                size={13}
                style={{
                  animation: pdfBusy ? "spin 0.8s linear infinite" : "none",
                }}
              />
              {pdfBusy ? "Preparing…" : "Download PDF"}
            </button>
            <button
              onClick={runAnalysis}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: FONT,
              }}
            >
              <Zap
                size={12}
                style={{
                  animation: loading ? "spin 0.8s linear infinite" : "none",
                }}
              />
              {loading
                ? "Analyzing…"
                : analysis
                  ? "Re-run AI"
                  : "Run AI Analysis"}
            </button>
          </div>
        }
      />

      {/* ── Live dashboard view (unchanged, compact) ── */}
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,.8fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #dbeafe",
              borderRadius: 14,
              padding: "15px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: "#1e3a5f",
                    fontFamily: FONT,
                  }}
                >
                  Historical Revenue Evidence
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#64748b",
                    marginTop: 2,
                    fontFamily: FONT,
                  }}
                >
                  Actual dashboard series used as evidence for the AI analysis
                </div>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontFamily: FONT,
                }}
              >
                SOURCE DATA
              </span>
            </div>
            <DashboardLineGraph labels={labels} values={values} height={210} />
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #dbeafe",
              borderRadius: 14,
              padding: "15px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "#1e3a5f",
                fontFamily: FONT,
              }}
            >
              AI Output Evidence
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#64748b",
                marginTop: 2,
                marginBottom: 12,
                fontFamily: FONT,
              }}
            >
              Forecast fields stay empty until the AI returns them
            </div>
            {analysis ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[
                  [
                    "Projected 7-Day Revenue",
                    projRev != null ? fmtAmt(projRev) : "Not returned",
                  ],
                  [
                    "Projected Change",
                    projChg != null
                      ? `${projChg >= 0 ? "+" : ""}${Number(projChg).toFixed(1)}%`
                      : "Not returned",
                  ],
                  ["Peak Day", peakDay || "Not returned"],
                  ["Slowest Day", slowDay || "Not returned"],
                  ["Confidence", conf != null ? `${conf}%` : "Not returned"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "9px 10px",
                      borderRadius: 9,
                      background: "#f8fbff",
                      border: "1px solid #e5edf8",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </span>
                    <strong
                      style={{
                        fontSize: 11,
                        color: "#1e3a5f",
                        textAlign: "right",
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  minHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #bfdbfe",
                  borderRadius: 10,
                  background: "#f8fbff",
                  color: "#64748b",
                  fontSize: 11.5,
                  textAlign: "center",
                  padding: 18,
                }}
              >
                Run AI Analysis to generate forecast evidence and
                recommendations.
              </div>
            )}
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: "linear-gradient(160deg,#eff6ff,#dbeafe)",
                border: "1px solid #bfdbfe",
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: "linear-gradient(180deg,#3b82f6,#1d4ed8)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1d4ed8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: FONT,
                  }}
                >
                  {analysis ? "AI Summary" : "Data Overview"} · {filterLabel}
                </span>
              </div>
              {analysis ? (
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#0d2b1e",
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {analysis.summary}
                </p>
              ) : (
                <>
                  {preRunBullets.length > 0 ? (
                    preRunBullets.map((b, i) => (
                      <BulletItem key={i} text={b} color="#3b82f6" />
                    ))
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontFamily: FONT,
                        fontStyle: "italic",
                      }}
                    >
                      Load transactions and run AI Analysis to generate
                      insights.
                    </p>
                  )}
                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: 9,
                        marginTop: 8,
                      }}
                    >
                      <AlertTriangle size={13} color="#dc2626" />
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "#dc2626",
                          fontWeight: 600,
                          fontFamily: FONT,
                        }}
                      >
                        {error}
                      </span>
                    </div>
                  )}
                  {loading && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: "2.5px solid #dbeafe",
                          borderTopColor: "#2563eb",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#5a7a65",
                          fontFamily: FONT,
                        }}
                      >
                        Sending {transactions?.length} transactions to Groq…
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Ghost Stock Anomalies Across Branches — directly under AI Summary */}
            {analysis && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #fecaca",
                  borderRadius: 14,
                  padding: "14px 15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: ghostStockAnomalies.length > 0 ? 10 : 0,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: "#dc2626",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT,
                    }}
                  >
                    Ghost Stock Anomalies Across Branches
                  </span>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background:
                        ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                      color:
                        ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b",
                      fontFamily: FONT,
                    }}
                  >
                    {ghostStockAnomalies.length}
                  </span>
                </div>

                <div
                  style={{
                    marginBottom: 11,
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: "#fff7f7",
                    border: "1px solid #fee2e2",
                    fontSize: 11.5,
                    color: "#7f1d1d",
                    lineHeight: 1.6,
                    fontFamily: FONT,
                  }}
                >
                  <strong>What is a ghost stock anomaly?</strong> A ghost stock
                  anomaly occurs when a branch records sales while one or more
                  related inventory items are already recorded as zero stock in
                  the system. This means the sales record and inventory record
                  may be out of sync and should be verified through stock
                  reconciliation.
                </div>

                {ghostStockAnomalies.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {ghostStockAnomalies.map((a, i) => {
                      const severity = String(
                        a?.severity || "critical",
                      ).toLowerCase();
                      const severityColor =
                        severity === "critical"
                          ? "#dc2626"
                          : severity === "warning"
                            ? "#d97706"
                            : "#2563eb";

                      return (
                        <div
                          key={`${a?.branch || "branch"}-${i}`}
                          style={{
                            background:
                              "linear-gradient(145deg,#fff7f7,#fef2f2)",
                            border: "1px solid #fecaca",
                            borderLeft: `4px solid ${severityColor}`,
                            borderRadius: 12,
                            padding: "13px 14px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <AlertTriangle size={13} color={severityColor} />

                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: "#fee2e2",
                                color: "#991b1b",
                                textTransform: "uppercase",
                                fontFamily: FONT,
                              }}
                            >
                              Ghost Stock
                            </span>

                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#0d2b1e",
                                fontFamily: FONT,
                              }}
                            >
                              {a?.branch || "Unknown Branch"}
                            </span>

                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background:
                                  severity === "critical"
                                    ? "#fee2e2"
                                    : severity === "warning"
                                      ? "#fef3c7"
                                      : "#dbeafe",
                                color:
                                  severity === "critical"
                                    ? "#991b1b"
                                    : severity === "warning"
                                      ? "#92400e"
                                      : "#1e40af",
                                textTransform: "uppercase",
                                fontFamily: FONT,
                              }}
                            >
                              {severity}
                            </span>
                          </div>

                          <BulletItem
                            text={
                              a?.finding ||
                              "Sales activity was detected while related inventory is already recorded at zero stock."
                            }
                            color={severityColor}
                            size="small"
                          />

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.78)",
                              border: "1px solid #fecaca",
                              marginTop: 7,
                            }}
                          >
                            <CheckCircle
                              size={12}
                              color="#059669"
                              style={{ flexShrink: 0, marginTop: 2 }}
                            />
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT,
                              }}
                            >
                              {a?.action ||
                                "Verify the branch's physical stock, reconcile recent sales against inventory movements, and correct the stock record before further replenishment decisions."}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px 11px",
                      borderRadius: 9,
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    <CheckCircle size={14} color="#059669" />
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "#64748b",
                        lineHeight: 1.55,
                        fontFamily: FONT,
                      }}
                    >
                      No ghost stock anomaly was detected in the branches
                      included in this analysis.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preserve non-ghost stock/sales anomalies below the ghost-stock section */}
            {analysis && otherStockAnomalies.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: "#d97706",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT,
                    }}
                  >
                    Other Stock vs Sales Anomalies
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#fef3c7",
                      color: "#92400e",
                      fontFamily: FONT,
                    }}
                  >
                    {otherStockAnomalies.length}
                  </span>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {otherStockAnomalies.map((a, i) => {
                    const cfg = {
                      low_stock_no_reorder: {
                        bg: "#fffbeb",
                        border: "#fde68a",
                        label: "Not Reordering",
                        labelBg: "#fef3c7",
                        labelColor: "#92400e",
                        dot: "#d97706",
                      },
                      dead_stock: {
                        bg: "#eff6ff",
                        border: "#bfdbfe",
                        label: "Dead Stock",
                        labelBg: "#dbeafe",
                        labelColor: "#1e40af",
                        dot: "#2563eb",
                      },
                    }[a?.anomalyType] || {
                      bg: "#f8fffe",
                      border: "#d1eedd",
                      label: "Anomaly",
                      labelBg: "#e0f2f1",
                      labelColor: "#00695c",
                      dot: "#00897b",
                    };

                    return (
                      <div
                        key={i}
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: 12,
                          padding: "13px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: cfg.dot,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 20,
                              background: cfg.labelBg,
                              color: cfg.labelColor,
                              textTransform: "uppercase",
                              fontFamily: FONT,
                            }}
                          >
                            {cfg.label}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0d2b1e",
                              fontFamily: FONT,
                            }}
                          >
                            {a?.branch || "Unknown Branch"}
                          </span>
                        </div>

                        <BulletItem
                          text={a?.finding}
                          color={cfg.dot}
                          size="small"
                        />

                        {a?.action && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                              padding: "7px 9px",
                              borderRadius: 7,
                              background: "rgba(255,255,255,0.65)",
                              border: `1px solid ${cfg.border}`,
                              marginTop: 6,
                            }}
                          >
                            <CheckCircle
                              size={12}
                              color={cfg.dot}
                              style={{ flexShrink: 0, marginTop: 1 }}
                            />
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT,
                              }}
                            >
                              {a.action}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            {analysis?.recommendations?.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: "linear-gradient(180deg,#00c853,#00897b)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#0d2b1e",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT,
                    }}
                  >
                    Actionable Recommendations
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#e0f2f1",
                      color: "#00695c",
                      fontFamily: FONT,
                    }}
                  >
                    {analysis.recommendations.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div
                        key={i}
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.borderColor}25`,
                          borderRadius: 12,
                          padding: "12px 12px 12px 16px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: s.borderColor,
                            borderRadius: "4px 0 0 4px",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: s.dot,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: s.color,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              background: s.badgeBg,
                              padding: "2px 7px",
                              borderRadius: 20,
                              fontFamily: FONT,
                            }}
                          >
                            {rec.branch || rec.type}
                          </span>
                        </div>
                        <BulletItem
                          text={rec.text}
                          color={s.dot}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  background: "#fafbff",
                  border: "1.5px dashed #dbeafe",
                  borderRadius: 14,
                  padding: "28px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 10,
                }}
              >
                <Brain size={32} color="#bfdbfe" />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#0d2b1e",
                    fontFamily: FONT,
                  }}
                >
                  Recommendations will appear here
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.65,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {transactions?.length
                    ? `${transactions.length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
                    : "Load transactions then run the AI analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── OFFSCREEN report layout — used only by Print & Download PDF ── */}
      <div
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: 800,
            background: "#fff",
            padding: "44px 48px 36px",
            fontFamily: FONT,
            color: "#0d2b1e",
          }}
        >
          {/* Letterhead */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 18,
              marginBottom: 26,
              borderBottom: "4px solid #00c853",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <img
                src={logoIfranchise}
                alt="iFranchise Business Services Corp."
                style={{ height: 58, width: "auto" }}
              />
              <div style={{ width: 1, height: 44, background: "#d1eedd" }} />
              <img
                src={logoSync}
                alt="FranchiSync"
                style={{ height: 46, width: "auto" }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5a7a65",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                iFranchise Business Services Corp.
              </div>
              <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Title block */}
          <div style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0d2b1e",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              AI Prescriptive Analysis Report
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#00897b",
                  background: "#e0f2f1",
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                {filterLabel}
              </span>
              {lastRun && (
                <span
                  style={{ fontSize: 13, color: "#5a7a65", fontWeight: 600 }}
                >
                  AI run at {lastRun}
                </span>
              )}
            </div>
          </div>

          {/* KPI summary grid — larger, readable */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              marginBottom: 30,
            }}
          >
            {[
              {
                label: "Projected 7-Day Revenue",
                value: projRev ? fmtAmt(projRev) : "—",
                sub: projRev
                  ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior period`
                  : "Not yet calculated",
                color: "#059669",
                bg: "#ecfdf5",
                border: "#a7f3d0",
              },
              {
                label: "Peak Day Forecast",
                value: peakDay || "—",
                sub: "Highest revenue day",
                color: "#1d4ed8",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                label: "Slowest Day Forecast",
                value: slowDay || "—",
                sub: "Lowest revenue day",
                color: "#d97706",
                bg: "#fffbeb",
                border: "#fde68a",
              },
              {
                label: "Confidence Score",
                value: conf ? `${conf}%` : "—",
                sub: conf
                  ? conf >= 80
                    ? "High confidence"
                    : conf >= 60
                      ? "Medium confidence"
                      : "Low — needs more data"
                  : "Not yet calculated",
                color: "#7c3aed",
                bg: "#f5f3ff",
                border: "#ddd6fe",
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: card.bg,
                  border: `1.5px solid ${card.border}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#5a7a65",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 8,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: card.color,
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 12.5, color: "#5a7a65", marginTop: 6 }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Executive summary */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 20,
                  borderRadius: 3,
                  background: "linear-gradient(180deg,#00c853,#00897b)",
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                {analysis ? "Executive Summary" : "Data Overview"}
              </span>
            </div>
            {analysis ? (
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.85,
                  margin: 0,
                  color: "#1a1a1a",
                }}
              >
                {analysis.summary}
              </p>
            ) : (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 14,
                  lineHeight: 2,
                  color: "#1a1a1a",
                }}
              >
                {preRunBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Ghost Stock Anomalies Across Branches */}
          {analysis && (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 20,
                    borderRadius: 3,
                    background: "#dc2626",
                  }}
                />
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}
                >
                  Ghost Stock Anomalies Across Branches
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background:
                      ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                    color:
                      ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b",
                  }}
                >
                  {ghostStockAnomalies.length}
                </span>
              </div>

              <div
                style={{
                  marginBottom: 14,
                  padding: "11px 13px",
                  borderRadius: 9,
                  background: "#fff7f7",
                  border: "1px solid #fee2e2",
                  fontSize: 12.5,
                  color: "#7f1d1d",
                  lineHeight: 1.65,
                }}
              >
                <strong>What is a ghost stock anomaly?</strong> A ghost stock
                anomaly occurs when a branch records sales while one or more
                related inventory items are already recorded as zero stock in
                the system. This means the sales record and inventory record may
                be out of sync and should be verified through stock
                reconciliation.
              </div>

              {ghostStockAnomalies.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {ghostStockAnomalies.map((a, i) => (
                    <div
                      key={`${a?.branch || "branch"}-${i}`}
                      style={{
                        background: "#fef2f2",
                        border: "1.5px solid #fecaca",
                        borderLeft: "5px solid #dc2626",
                        borderRadius: 12,
                        padding: "16px 18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            color: "#991b1b",
                            textTransform: "uppercase",
                          }}
                        >
                          Ghost Stock
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {a?.branch || "Unknown Branch"}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fee2e2",
                            color: "#991b1b",
                            textTransform: "uppercase",
                          }}
                        >
                          {a?.severity || "critical"}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.7,
                          margin: "0 0 8px",
                        }}
                      >
                        {a?.finding ||
                          "Sales activity was detected while related inventory is recorded at zero stock."}
                      </p>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.7)",
                          borderRadius: 8,
                          padding: "9px 12px",
                        }}
                      >
                        →{" "}
                        {a?.action ||
                          "Verify physical stock, reconcile inventory movements, and correct the branch stock record."}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  No ghost stock anomaly was detected in the branches included
                  in this analysis.
                </div>
              )}
            </div>
          )}

          {/* Preserve other stock/sales anomalies in exported reports */}
          {analysis && otherStockAnomalies.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 20,
                    borderRadius: 3,
                    background: "#d97706",
                  }}
                />
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}
                >
                  Other Stock vs Sales Anomalies
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  {otherStockAnomalies.length}
                </span>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {otherStockAnomalies.map((a, i) => {
                  const cfg = {
                    low_stock_no_reorder: {
                      bg: "#fffbeb",
                      border: "#fde68a",
                      label: "Not Reordering",
                    },
                    dead_stock: {
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                      label: "Dead Stock",
                    },
                  }[a?.anomalyType] || {
                    bg: "#f8fffe",
                    border: "#d1eedd",
                    label: "Anomaly",
                  };

                  return (
                    <div
                      key={i}
                      style={{
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        borderRadius: 12,
                        padding: "16px 18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            textTransform: "uppercase",
                          }}
                        >
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {a?.branch || "Unknown Branch"}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.7,
                          margin: "0 0 8px",
                        }}
                      >
                        {a?.finding}
                      </p>

                      {a?.action && (
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: 8,
                            padding: "9px 12px",
                          }}
                        >
                          → {a.action}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis?.recommendations?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 20,
                    borderRadius: 3,
                    background: "linear-gradient(180deg,#00c853,#00897b)",
                  }}
                />
                <span
                  style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}
                >
                  Actionable Recommendations
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#e0f2f1",
                    color: "#00695c",
                  }}
                >
                  {analysis.recommendations.length}
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {analysis.recommendations.map((rec, i) => {
                  const s = typeStyle(rec.type);
                  return (
                    <div
                      key={i}
                      style={{
                        background: s.bg,
                        border: `1.5px solid ${s.borderColor}40`,
                        borderLeft: `5px solid ${s.borderColor}`,
                        borderRadius: 10,
                        padding: "14px 18px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: s.color,
                          background: s.badgeBg,
                          padding: "3px 10px",
                          borderRadius: 20,
                          textTransform: "uppercase",
                        }}
                      >
                        {rec.branch || rec.type}
                      </span>
                      <p
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.75,
                          margin: "8px 0 0",
                        }}
                      >
                        {rec.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 36,
              paddingTop: 14,
              borderTop: "1.5px solid #e0f2f1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
              Generated by FranchiSync · Franchise Business Services Corp.
            </span>
            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
              AI analysis powered by Groq
            </span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function SalesVsStockSection({
  preset,
  appliedRange,
  rangeMode,
  filterBranch,
  filterBrand,
  selectedBrand,
  total,
  transactions = [],
}) {
  const [data, setData] = useState(null);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("top10");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) {
        params.set("from", appliedRange.from);
        params.set("to", appliedRange.to);
      } else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const names = (selectedBrand.branches || []).map((br) =>
          typeof br === "string" ? br : br.name,
        );
        if (names.length) params.set("branches", names.join(","));
      }
      const [analyticsRes, inventoryRes] = await Promise.all([
        adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`,
        ),
        adminModuleFetch(`${process.env.REACT_APP_API_URL}/ingredients`),
      ]);
      const json = analyticsRes.ok ? await analyticsRes.json() : {};
      const inventoryJson = inventoryRes.ok ? await inventoryRes.json() : [];
      setData(json);
      setInventoryRows(Array.isArray(inventoryJson) ? inventoryJson : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    preset,
    rangeMode,
    appliedRange,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const top10 = data?.top10 ?? [];
  const fast = data?.fastMoving ?? [];
  const slow = data?.slowMoving ?? [];
  const totalSKUs = data?.totalProducts ?? 0;
  const fastCount = fast.length;
  const slowCount = slow.length;

  const stockEvidence = useMemo(() => {
    /*
      Build the stock charts from the SAME filtered transaction records used by
      the dashboard instead of relying only on top10/fast/slow lists.

      This fixes the empty charts when a sold product exists in transactions
      and inventory but was omitted from one of the analytics summary arrays.
    */

    const normalizeName = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "");

    const normalizeText = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const parseItems = (raw) => {
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Number of days represented by the current dashboard filter.
    let periodDays = 30;

    if (rangeMode === "preset") {
      periodDays =
        preset === "day"
          ? 1
          : preset === "week"
            ? 7
            : preset === "year"
              ? 365
              : 30;
    } else if (appliedRange?.from && appliedRange?.to) {
      periodDays = Math.max(
        1,
        Math.ceil(
          (new Date(appliedRange.to + "T23:59:59") -
            new Date(appliedRange.from + "T00:00:00")) /
            864e5,
        ),
      );
    }

    /*
      Aggregate actual units sold from the already-filtered transactions.
      Store both an ID key and a normalized-name key because older transaction
      rows may not consistently contain the inventory/ingredient ID.
    */
    const soldById = new Map();
    const soldByName = new Map();

    (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
      const txBranch = normalizeText(tx?.branch);

      parseItems(tx?.items).forEach((item) => {
        const qty = Number(
          item?.qty ?? item?.quantity ?? item?.quantity_sold ?? 0,
        );

        if (!Number.isFinite(qty) || qty <= 0) return;

        const itemId =
          item?.ingredient_id ??
          item?.inventory_id ??
          item?.product_id ??
          item?.id ??
          null;

        const itemName =
          item?.name ??
          item?.product_name ??
          item?.item_name ??
          item?.title ??
          "";

        /*
          Include branch in the name key where possible so two branches selling
          products with the same name don't accidentally share sales quantities.
        */
        const nameKey = normalizeName(itemName);

        if (itemId != null && itemId !== "") {
          const idKey = `${txBranch}|${String(itemId)}`;
          soldById.set(idKey, (soldById.get(idKey) || 0) + qty);

          // Compatibility key for rows where inventory has no branch.
          const globalIdKey = `|${String(itemId)}`;
          soldById.set(globalIdKey, (soldById.get(globalIdKey) || 0) + qty);
        }

        if (nameKey) {
          const branchNameKey = `${txBranch}|${nameKey}`;
          soldByName.set(
            branchNameKey,
            (soldByName.get(branchNameKey) || 0) + qty,
          );

          // Compatibility key for inventory records without a branch value.
          const globalNameKey = `|${nameKey}`;
          soldByName.set(
            globalNameKey,
            (soldByName.get(globalNameKey) || 0) + qty,
          );
        }
      });
    });

    const selectedBranchNames =
      filterBrand && selectedBrand
        ? (selectedBrand.branches || [])
            .map((br) => (typeof br === "string" ? br : br?.name))
            .filter(Boolean)
        : [];

    const inventoryInScope = (
      Array.isArray(inventoryRows) ? inventoryRows : []
    ).filter((inv) => {
      const invBranch = String(inv?.branch || "").trim();
      const invBrand = normalizeText(inv?.brand);

      if (filterBranch) {
        return invBranch === filterBranch;
      }

      if (filterBrand && selectedBrand) {
        const branchMatches =
          selectedBranchNames.length === 0 ||
          selectedBranchNames.includes(invBranch);

        const brandMatches =
          !invBrand || invBrand === normalizeText(selectedBrand?.name);

        return branchMatches && brandMatches;
      }

      return true;
    });

    const rows = inventoryInScope
      .map((inv) => {
        const invBranch = normalizeText(inv?.branch);
        const invName = normalizeName(inv?.name);

        const invId =
          inv?.id ?? inv?.ingredient_id ?? inv?.inventory_id ?? null;

        let sold = 0;

        if (invId != null && invId !== "") {
          sold =
            soldById.get(`${invBranch}|${String(invId)}`) ??
            soldById.get(`|${String(invId)}`) ??
            0;
        }

        // Fallback to normalized product name for older transactions.
        if (sold <= 0 && invName) {
          sold =
            soldByName.get(`${invBranch}|${invName}`) ??
            soldByName.get(`|${invName}`) ??
            0;
        }

        /*
          These two charts are sales-vs-stock charts, so only products that
          actually have sales in the selected period are meaningful.
        */
        if (!(sold > 0)) return null;

        const stock = Number(inv?.stock ?? 0);
        const reorder = Number(
          inv?.min_stock ?? inv?.reorder_point ?? inv?.minimum_stock ?? 0,
        );

        const dailySales = sold / Math.max(periodDays, 1);
        const daysLeft = dailySales > 0 ? stock / dailySales : null;
        const ratio = sold > 0 ? stock / sold : null;

        let status = "OK";
        let recommendation = "Monitor stock level";

        if (stock <= reorder || (daysLeft != null && daysLeft < 14)) {
          status = "CRITICAL";
          recommendation = "Restock urgently";
        } else if (
          (daysLeft != null && daysLeft > 90) ||
          (ratio != null && ratio > 3)
        ) {
          status = "OVERSTOCK";
          recommendation = "Reduce ordering / promote";
        } else if (daysLeft != null && daysLeft < 30) {
          status = "WATCH";
          recommendation = "Reorder soon";
        }

        return {
          id: invId,
          name: inv?.name || "Unnamed Product",
          branch: inv?.branch || "Unassigned",
          brand: inv?.brand || "",
          stock,
          reorder,
          sold,
          daysLeft,
          ratio,
          status,
          recommendation,
          unit: inv?.unit || "units",
        };
      })
      .filter(Boolean);

    /*
      Put the products with the greatest sales first, while still keeping
      critical items visible near the top.
    */
    rows.sort((a, b) => {
      const priority = {
        CRITICAL: 0,
        WATCH: 1,
        OK: 2,
        OVERSTOCK: 3,
      };

      const p = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
      return p !== 0 ? p : b.sold - a.sold;
    });

    return rows.slice(0, 10);
  }, [
    transactions,
    inventoryRows,
    preset,
    rangeMode,
    appliedRange,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  const revenuePie = top10.slice(0, 5).map((p, i) => ({
    label: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    value: p.totalRevenue,
    color: PAL[i],
  }));
  const moverPie =
    totalSKUs > 0
      ? [
          { label: "Fast Movers", value: fastCount, color: "#059669" },
          { label: "Slow Movers", value: slowCount, color: "#dc2626" },
          {
            label: "Normal",
            value: Math.max(0, totalSKUs - fastCount - slowCount),
            color: "#94a3b8",
          },
        ].filter((d) => d.value > 0)
      : [];

  const TABS = [
    { id: "top10", label: "Top Products", icon: BarChart2 },
    { id: "fast", label: "Fast Movers", icon: TrendingUp },
    { id: "slow", label: "Slow Movers", icon: TrendingDown },
    { id: "buyers", label: "Top Performers", icon: Target },
  ];
  const tabSt = (a) => ({
    padding: "6px 13px",
    borderRadius: 8,
    border: "none",
    fontSize: 11.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT,
    transition: "all .15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
    color: a ? "#fff" : "#5a7a65",
    boxShadow: a ? "0 2px 8px rgba(0,180,90,.28)" : "none",
  });
  const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2e"];

  const renderList = () => {
    const isBuyers = tab === "buyers";
    const list = isBuyers
      ? data?.topBuyers
      : tab === "top10"
        ? top10
        : tab === "fast"
          ? fast
          : slow;
    if (!list?.length)
      return (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 12,
            border: "1.5px dashed #d1eedd",
            borderRadius: 10,
            fontFamily: FONT,
          }}
        >
          No data for this filter.
        </div>
      );
    const maxR = Math.max(
      1,
      ...list.map((p) => (isBuyers ? p.totalItems : p.totalRevenue)),
    );
    const maxQ = isBuyers ? maxR : Math.max(1, ...list.map((p) => p.totalQty));
    return list.slice(0, 8).map((p, i) => (
      <div
        key={p.name}
        style={{
          display: "grid",
          gridTemplateColumns: isBuyers
            ? "28px 1fr 70px 1fr"
            : "28px 1fr 65px 70px 1fr",
          gap: 8,
          alignItems: "center",
          padding: "8px 10px",
          borderBottom: "1px solid #f4fbf6",
          borderRadius: 7,
          transition: "background .1s",
          cursor: "default",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f4fbf6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 7,
            background:
              i < 3
                ? [
                    "rgba(245,158,11,0.12)",
                    "rgba(148,163,184,0.15)",
                    "rgba(205,124,46,0.12)",
                  ][i]
                : "#f4f6f8",
            fontWeight: 800,
            fontSize: 11,
            color: i < 3 ? RANK_COLORS[i] : "#9ca3af",
            fontFamily: FONT,
          }}
        >
          {i + 1}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: "#0d2b1e",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: FONT,
            }}
          >
            {p.name}
          </div>
          {!isBuyers && p.branchBreakdown && (
            <div
              style={{
                fontSize: 9.5,
                color: "#94a3b8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT,
              }}
            >
              {Object.entries(p.branchBreakdown)
                .slice(0, 2)
                .map(([br, q]) => `${br}: ${q}`)
                .join(" · ")}
            </div>
          )}
        </div>
        {!isBuyers && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 11,
                color: "#0d2b1e",
                fontFamily: FONT,
              }}
            >
              {p.totalQty?.toLocaleString()}
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "#e8f5e9",
                marginTop: 2,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${(p.totalQty / maxQ) * 100}%`,
                  background: PAL[i % PAL.length],
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            textAlign: "right",
            fontWeight: 700,
            fontSize: 12,
            color: "#00897b",
            fontFamily: FONT,
          }}
        >
          {isBuyers ? p.totalItems?.toLocaleString() : fmtPeso1(p.totalRevenue)}
        </div>
        <div style={{ paddingLeft: 8 }}>
          {isBuyers ? (
            <span
              style={{
                background: "#e0f2f1",
                color: "#00695c",
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT,
              }}
            >
              {p.topProduct}
            </span>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: "#f0fdf5",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${(p.totalRevenue / maxR) * 100}%`,
                    background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: "#94a3b8",
                  minWidth: 28,
                  textAlign: "right",
                  fontFamily: FONT,
                }}
              >
                {Math.round((p.totalRevenue / maxR) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Package}
        title="Sales vs Stock Recommendations"
        sub="Product performance · fast/slow movers · stock health"
        action={
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 9,
              border: "1.5px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: FONT,
            }}
          >
            <RefreshCw
              size={12}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        {stockEvidence.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #d1eedd",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 18,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 13,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 18,
                  borderRadius: 4,
                  background: "#22c55e",
                }}
              />
              <strong style={{ fontSize: 13, color: "#102a1c" }}>
                Inventory Recommendation Report
              </strong>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "#ecfdf5",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                }}
              >
                ACTUAL STOCK + SALES
              </span>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 760,
                fontFamily: FONT,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Product",
                    "Stock",
                    "Period Sales",
                    "Reorder Pt",
                    "Days Left",
                    "Status",
                    "Recommendation",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign:
                          h === "Product" || h === "Recommendation"
                            ? "left"
                            : "center",
                        fontSize: 9.5,
                        color: "#8290a3",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        borderBottom: "1px solid #d1eedd",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockEvidence.map((r, i) => (
                  <tr
                    key={r.id ?? `${r.name}-${r.branch}-${r.brand}`}
                    style={{ background: i % 2 ? "#f5fcf7" : "#fff" }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#183126",
                      }}
                    >
                      {r.name}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 11,
                        textAlign: "center",
                        fontWeight: 800,
                      }}
                    >
                      {r.stock}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 11,
                        textAlign: "center",
                      }}
                    >
                      {r.sold}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 11,
                        textAlign: "center",
                      }}
                    >
                      {r.reorder}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 11,
                        textAlign: "center",
                        fontWeight: 800,
                        color: r.status === "CRITICAL" ? "#ef4444" : "#334155",
                      }}
                    >
                      {r.daysLeft == null ? "—" : `${Math.round(r.daysLeft)}d`}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background:
                            r.status === "CRITICAL"
                              ? "#fef2f2"
                              : r.status === "OVERSTOCK"
                                ? "#eff6ff"
                                : r.status === "WATCH"
                                  ? "#fffbeb"
                                  : "#ecfdf5",
                          color:
                            r.status === "CRITICAL"
                              ? "#ef4444"
                              : r.status === "OVERSTOCK"
                                ? "#2563eb"
                                : r.status === "WATCH"
                                  ? "#d97706"
                                  : "#15803d",
                          border: "1px solid currentColor",
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color:
                          r.status === "CRITICAL"
                            ? "#ef4444"
                            : r.status === "OVERSTOCK"
                              ? "#2563eb"
                              : "#15803d",
                      }}
                    >
                      {r.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: "SKUs Tracked",
              value: totalSKUs || "—",
              color: "#0d2b1e",
              bg: "#f0fdf5",
              border: "#d1eedd",
              icon: Layers,
            },
            {
              label: "Fast Movers",
              value: fastCount || "—",
              color: "#059669",
              bg: "#ecfdf5",
              border: "#a7f3d0",
              icon: TrendingUp,
            },
            {
              label: "Slow Movers",
              value: slowCount || "—",
              color: "#dc2626",
              bg: "#fef2f2",
              border: "#fecaca",
              icon: TrendingDown,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 12,
                padding: "11px 13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 4,
                }}
              >
                <s.icon size={11} color={s.color} />
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#5a7a65",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: s.color,
                  fontFamily: FONT,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 3,
                background: "#f4f8f5",
                borderRadius: 11,
                padding: 4,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={tabSt(tab === t.id)}
                >
                  <t.icon size={11} /> {t.label}
                </button>
              ))}
            </div>
            {!loading &&
              (top10.length > 0 ||
                fast.length > 0 ||
                slow.length > 0 ||
                data?.topBuyers?.length > 0) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      tab === "buyers"
                        ? "28px 1fr 70px 1fr"
                        : "28px 1fr 65px 70px 1fr",
                    gap: 8,
                    padding: "7px 10px",
                    borderBottom: "2px solid #e8f5e9",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#00897b",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 4,
                    fontFamily: FONT,
                  }}
                >
                  <span>#</span>
                  <span>Name</span>
                  {tab !== "buyers" && (
                    <span style={{ textAlign: "right" }}>Units</span>
                  )}
                  <span style={{ textAlign: "right" }}>
                    {tab === "buyers" ? "Items" : "Revenue"}
                  </span>
                  <span style={{ paddingLeft: 8 }}>
                    {tab === "buyers" ? "Top Product" : "Share"}
                  </span>
                </div>
              )}
            {loading ? (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "3px solid #d1eedd",
                    borderTopColor: "#00897b",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 10px",
                  }}
                />
                <div
                  style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}
                >
                  Loading…
                </div>
              </div>
            ) : (
              renderList()
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: "#f8fffe",
                border: "1px solid #e0f2f1",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <PieChart size={11} color="#00897b" /> Revenue Share (Top 5)
              </ChartLabel>
              {revenuePie.length > 0 ? (
                <DonutChartSVG segments={revenuePie} size={120} />
              ) : (
                <div
                  style={{
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b2dfdb",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  —
                </div>
              )}
            </div>
            <div
              style={{
                background: "#f8fffe",
                border: "1px solid #e0f2f1",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <Activity size={11} color="#00897b" /> Product Velocity
              </ChartLabel>
              {moverPie.length > 0 ? (
                <DonutChartSVG
                  segments={moverPie}
                  size={110}
                  centerLabel={totalSKUs.toString()}
                  centerSub="SKUs"
                />
              ) : (
                <div
                  style={{
                    height: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b2dfdb",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  —
                </div>
              )}
            </div>
            <div
              style={{
                background: "#f8fffe",
                border: "1px solid #e0f2f1",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <ShoppingCart size={11} color="#00897b" /> Stock Recommendations
              </ChartLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  {
                    label: "Reorder Soon",
                    count: slowCount || 0,
                    color: "#d97706",
                    bg: "#fffbeb",
                    border: "#fde68a",
                    icon: AlertTriangle,
                  },
                  {
                    label: "Healthy Stock",
                    count: Math.max(0, totalSKUs - slowCount - fastCount),
                    color: "#059669",
                    bg: "#ecfdf5",
                    border: "#a7f3d0",
                    icon: CheckCircle,
                  },
                  {
                    label: "High Demand",
                    count: fastCount || 0,
                    color: "#1d4ed8",
                    bg: "#eff6ff",
                    border: "#bfdbfe",
                    icon: TrendingUp,
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      background: r.bg,
                      border: `1px solid ${r.border}`,
                      borderRadius: 9,
                      padding: "8px 11px",
                    }}
                  >
                    <r.icon size={13} color={r.color} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#0d2b1e",
                        fontFamily: FONT,
                      }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: r.color,
                        fontFamily: FONT,
                      }}
                    >
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function InfoModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type = "info", title, message, confirmLabel, cancelLabel } = modal;

  const iconMap = {
    error: (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#dc2626"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    success: (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2e7d32"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    info: (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    warning: (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d97706"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    confirm: (
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d97706"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  const hc = {
    error: { bg: "#fef2f2", border: "#fecaca", titleColor: "#991b1b" },
    success: { bg: "#e8f5e9", border: "#c8e6c9", titleColor: "#00695c" },
    info: { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
    warning: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
    confirm: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
  }[type] || { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: `1px solid ${hc.border}`,
          fontFamily: FONT,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: hc.bg,
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${hc.border}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 13,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[type]}</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: hc.titleColor,
                marginBottom: 4,
                fontFamily: FONT,
              }}
            >
              {title}
            </div>
            {message && (
              <div
                style={{
                  fontSize: 13,
                  color: "#0d2b1e",
                  lineHeight: 1.6,
                  opacity: 0.85,
                  fontFamily: FONT,
                }}
              >
                {message}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `1px solid ${hc.border}`,
              background: "transparent",
              cursor: "pointer",
              color: "#5a7a65",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          style={{
            padding: "14px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {type === "confirm" && (
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #b2dfdb",
                background: "#f0fdf5",
                color: "#5a7a65",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            onClick={type === "confirm" ? onConfirm : onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background:
                type === "confirm"
                  ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : "linear-gradient(135deg,#00c853,#00897b)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            {confirmLabel || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardLineGraph({ labels = [], values = [], height = 230 }) {
  const [hover, setHover] = useState(null);
  const W = 760,
    H = height,
    PL = 54,
    PR = 18,
    PT = 20,
    PB = 38;
  const safeValues = values.map((v) => Number(v || 0));
  const max = Math.max(...safeValues, 1);
  const pW = W - PL - PR,
    pH = H - PT - PB;
  const x = (i) =>
    labels.length <= 1 ? PL + pW / 2 : PL + (i / (labels.length - 1)) * pW;
  const y = (v) => PT + pH - (Number(v || 0) / max) * pH;
  const points = safeValues.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const tickIdx =
    labels.length <= 7
      ? labels.map((_, i) => i)
      : Array.from(
          new Set([
            0,
            ...Array.from({ length: 5 }, (_, i) =>
              Math.round(((i + 1) * (labels.length - 1)) / 6),
            ),
            labels.length - 1,
          ]),
        );
  const grid = [0, 0.25, 0.5, 0.75, 1];

  if (!labels.length || !values.length)
    return (
      <DashboardEmptyState message="No revenue data for the selected period." />
    );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Revenue trend chart"
      >
        {grid.map((g, i) => {
          const yy = PT + pH - g * pH;
          return (
            <g key={i}>
              <line
                x1={PL}
                y1={yy}
                x2={W - PR}
                y2={yy}
                stroke="#E8EEE5"
                strokeWidth="1"
              />
              <text
                x={PL - 9}
                y={yy + 4}
                textAnchor="end"
                fontSize="10"
                fill="#7A887B"
                fontFamily={FONT}
              >
                {fmtShort(max * g)}
              </text>
            </g>
          );
        })}
        <polyline
          points={points}
          fill="none"
          stroke="#3b791e"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {safeValues.map((v, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={hover === i ? 5 : 3.5}
              fill="#fff"
              stroke="#3b791e"
              strokeWidth="2.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
            <rect
              x={x(i) - 10}
              y={PT}
              width="20"
              height={pH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
        {tickIdx.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 12}
            textAnchor="middle"
            fontSize="10"
            fill="#7A887B"
            fontFamily={FONT}
          >
            {labels[i]}
          </text>
        ))}
      </svg>
      {hover != null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: "#12241B",
            color: "#fff",
            borderRadius: 9,
            padding: "7px 10px",
            fontSize: 11,
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(18,36,27,.18)",
            pointerEvents: "none",
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 9.5, marginBottom: 2 }}>
            {labels[hover]}
          </div>
          {fmtAmt(safeValues[hover])}
        </div>
      )}
    </div>
  );
}

function DashboardBarGraph({ labels = [], values = [], height = 230 }) {
  const [hover, setHover] = useState(null);
  const W = 760,
    H = height,
    PL = 46,
    PR = 16,
    PT = 20,
    PB = 38;
  const safeValues = values.map((v) => Number(v || 0));
  const max = Math.max(...safeValues, 1);
  const pW = W - PL - PR,
    pH = H - PT - PB;
  const gap = 6;
  const bw = Math.max(4, pW / Math.max(labels.length, 1) - gap);
  const tickIdx =
    labels.length <= 7
      ? labels.map((_, i) => i)
      : Array.from(
          new Set([
            0,
            ...Array.from({ length: 5 }, (_, i) =>
              Math.round(((i + 1) * (labels.length - 1)) / 6),
            ),
            labels.length - 1,
          ]),
        );
  const grid = [0, 0.25, 0.5, 0.75, 1];
  if (!labels.length || !values.length)
    return (
      <DashboardEmptyState message="No transaction data for the selected period." />
    );
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Transaction volume chart"
      >
        {grid.map((g, i) => {
          const yy = PT + pH - g * pH;
          return (
            <g key={i}>
              <line x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#E8EEE5" />
              <text
                x={PL - 8}
                y={yy + 4}
                textAnchor="end"
                fontSize="10"
                fill="#7A887B"
                fontFamily={FONT}
              >
                {Math.round(max * g)}
              </text>
            </g>
          );
        })}
        {safeValues.map((v, i) => {
          const slot = pW / Math.max(labels.length, 1);
          const xx = PL + i * slot + (slot - bw) / 2;
          const hh = (v / max) * pH;
          const yy = PT + pH - hh;
          return (
            <rect
              key={i}
              x={xx}
              y={yy}
              width={bw}
              height={Math.max(hh, 1)}
              rx="4"
              fill={hover === i ? "#2c5c16" : "#c9dba0"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
        {tickIdx.map((i) => {
          const slot = pW / Math.max(labels.length, 1);
          return (
            <text
              key={i}
              x={PL + i * slot + slot / 2}
              y={H - 12}
              textAnchor="middle"
              fontSize="10"
              fill="#7A887B"
              fontFamily={FONT}
            >
              {labels[i]}
            </text>
          );
        })}
      </svg>
      {hover != null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: "#12241B",
            color: "#fff",
            borderRadius: 9,
            padding: "7px 10px",
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 9.5, marginBottom: 2 }}>
            {labels[hover]}
          </div>
          {safeValues[hover].toLocaleString()} transactions
        </div>
      )}
    </div>
  );
}

function DashboardEmptyState({ message }) {
  return (
    <div
      style={{
        height: 230,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed #D7E1D4",
        borderRadius: 12,
        background: "#FAFCF8",
        color: "#7A887B",
        fontSize: 12,
        fontWeight: 600,
        textAlign: "center",
        padding: 20,
      }}
    >
      {message}
    </div>
  );
}

function DashboardRankBars({ data = [] }) {
  if (!data.length)
    return (
      <DashboardEmptyState message="No branch sales data for the selected period." />
    );
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 13,
        padding: "4px 0 2px",
      }}
    >
      {data.slice(0, 6).map((d, i) => (
        <div key={`${d.label}-${i}`}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: "#F1F5EC",
                  color: "#3b791e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#243128",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {d.label}
              </span>
            </div>
            <strong
              style={{ fontSize: 12, color: "#243128", whiteSpace: "nowrap" }}
            >
              {fmtAmt(d.value)}
            </strong>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "#EEF2EA",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(d.value / max) * 100}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg,#3b791e,#bdd43c)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const B2B_DEFAULT_GROWTH_TARGET = 20;
const B2B_HQ_MONTHLY_TARGET = 50000;
const B2B_FALLBACK_THRESHOLDS = {
  highOrderDropPct: 25,
  watchOrderDropPct: 10,
  posStableFloorPct: -5,
};

const b2bNum = (...values) => {
  for (const value of values) {
    const n = Number(value);
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(n)
    )
      return n;
  }
  return 0;
};

const b2bNullableNum = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const b2bArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const b2bMonthKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const b2bShiftMonth = (monthKey, delta) => {
  const [y, m] = String(monthKey || "")
    .split("-")
    .map(Number);
  if (!y || !m) return b2bMonthKey(new Date());
  return b2bMonthKey(new Date(y, m - 1 + delta, 1));
};

const b2bMonthLabel = (monthKey) => {
  const [y, m] = String(monthKey || "")
    .split("-")
    .map(Number);
  if (!y || !m) return monthKey || "—";
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });
};

const b2bDateOfOrder = (o) =>
  o?.order_date || o?.created_at || o?.createdAt || o?.updated_at || null;
const b2bDateOfTx = (tx) =>
  tx?.date || tx?.created_at || tx?.createdAt || tx?.transaction_date || null;
const b2bDateOfInventory = (row) =>
  row?.snapshot_date ||
  row?.counted_at ||
  row?.stock_date ||
  row?.as_of_date ||
  row?.updated_at ||
  null;
const b2bOrderAmount = (o) =>
  b2bNum(o?.net_amount, o?.total_amount, o?.total, o?.amount);
const b2bTxAmount = (tx) =>
  b2bNum(tx?.net_total, tx?.total, tx?.total_amount, tx?.grand_total);
const b2bBranchName = (row) =>
  String(
    row?.branch_name || row?.branch || row?.store_name || row?.store || "",
  ).trim();
const b2bBrandName = (row) =>
  String(row?.brand_name || row?.brand || "").trim();
// GET /orders joins order_items to shop_items and returns this exact line shape.
const b2bOrderItems = (o) => {
  const lines =
    [o?.items, o?.order_items, o?.orderItems]
      .map(b2bArray)
      .find((items) => items.length) || [];
  return lines
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      ...item,
      name:
        item.name ||
        item.item_name ||
        item.product_name ||
        (item.shop_item_id != null
          ? `Supply item #${item.shop_item_id}`
          : "Item name unavailable"),
      qty: b2bNum(item.qty, item.quantity),
      price: b2bNullableNum(item.price, item.unit_price),
    }));
};
const b2bTxItems = (tx) =>
  b2bArray(tx?.items || tx?.transaction_items || tx?.transactionItems);
const b2bItemQty = (item) =>
  b2bNum(
    item?.qty_received,
    item?.received_qty,
    item?.qty,
    item?.quantity,
    item?.quantity_sold,
  );
const b2bItemId = (item) =>
  item?.product_id ??
  item?.inventory_id ??
  item?.ingredient_id ??
  item?.shop_item_id ??
  item?.id ??
  null;
const b2bItemName = (item) =>
  String(
    item?.product_name ||
      item?.item_name ||
      item?.name ||
      item?.title ||
      (b2bItemId(item) != null ? `SKU ${b2bItemId(item)}` : "Unknown SKU"),
  ).trim();
const b2bInventoryOpening = (item) =>
  b2bNullableNum(
    item?.opening_stock,
    item?.openingStock,
    item?.beginning_stock,
    item?.beginningStock,
  );
const b2bInventoryClosing = (item) =>
  b2bNullableNum(
    item?.closing_stock,
    item?.closingStock,
    item?.ending_stock,
    item?.endingStock,
    item?.on_hand,
    item?.current_stock,
    item?.stock,
  );
const b2bInventoryDisposal = (item) =>
  b2bNullableNum(
    item?.disposed_qty,
    item?.disposal_qty,
    item?.disposed,
    item?.waste_qty,
    item?.waste,
  );
const b2bInventoryTransferIn = (item) =>
  b2bNullableNum(item?.transfer_in, item?.transferIn, item?.transfers_in);
const b2bInventoryTransferOut = (item) =>
  b2bNullableNum(item?.transfer_out, item?.transferOut, item?.transfers_out);
const b2bInventoryAdjustment = (item) =>
  b2bNullableNum(
    item?.manual_adjustment,
    item?.adjustment_qty,
    item?.adjustment,
  );
const b2bKeyPart = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
const b2bSkuKey = (item, parentBrand, parentBranch) =>
  [
    b2bKeyPart(parentBranch || b2bBranchName(item)),
    b2bKeyPart(parentBrand || b2bBrandName(item)),
    b2bKeyPart(b2bItemName(item)) || String(b2bItemId(item) ?? "unknown"),
  ].join("|");

const b2bIsEarnedOrder = (o) => {
  const s = String(o?.status || "").toLowerCase();
  return [
    "received",
    "delivered",
    "fulfilled",
    "completed",
    "complete",
  ].includes(s);
};

const b2bIsCompletedTx = (tx) => {
  if (
    tx?.is_voided ||
    tx?.voided ||
    String(tx?.status || "").toLowerCase() === "void"
  )
    return false;
  const status = String(tx?.status || "").toLowerCase();
  if (!status) return true;
  return ["paid", "completed", "complete", "success", "successful"].includes(
    status,
  );
};

function B2BRiskBadge({ risk }) {
  const normalized = String(risk || "Normal").toLowerCase();
  const high = normalized.includes("high") || normalized.includes("critical");
  const watch =
    normalized.includes("watch") ||
    normalized.includes("medium") ||
    normalized.includes("moderate");
  const missing =
    normalized.includes("no data") || normalized.includes("no transactions");
  const label = missing
    ? risk
    : high
      ? "High Risk"
      : watch
        ? "Watch"
        : "Normal";
  const style = missing
    ? { color: "#5C6B60", background: "#F6F7F1", border: "#E1E6D8" }
    : high
      ? { color: "#b42318", background: "#fff1f0", border: "#fecdca" }
      : watch
        ? { color: "#b54708", background: "#fffaeb", border: "#fedf89" }
        : { color: "#2c5c16", background: "#f0f5e8", border: "#c9dba0" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 20,
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.color,
        fontSize: 10.5,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.color,
        }}
      />
      {label}
    </span>
  );
}

const b2bMaskedValue = (value) => {
  const text = String(value ?? "");
  if (!text || text === "—") return "—";
  if (text.trim().startsWith("₱")) return "₱••••••";
  if (text.includes("%")) return "•••%";
  return "••••";
};

function B2BVisibilityIcon({ masked, size = 15 }) {
  return masked ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function B2BMetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "green",
  onClick,
  loading = false,
  defaultMasked = false,
  maskable = true,
}) {
  const [masked, setMasked] = useState(defaultMasked);
  const tones = {
    green: { iconBg: "#eef7e9", icon: "#3b791e", accent: "#3b791e" },
    blue: { iconBg: "#eff6ff", icon: "#2563eb", accent: "#2563eb" },
    amber: { iconBg: "#fff7ed", icon: "#b45309", accent: "#b45309" },
    red: { iconBg: "#fef2f2", icon: "#c0392b", accent: "#c0392b" },
  };
  const t = tones[tone] || tones.green;
  const displayValue = loading ? "…" : masked ? b2bMaskedValue(value) : value;
  const open = () => {
    if (onClick) onClick();
  };
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open ${label} breakdown` : label}
      onClick={open}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      style={{
        textAlign: "left",
        width: "100%",
        background: "#fff",
        border: "1px solid #E1E6D8",
        borderRadius: 16,
        padding: "16px 17px",
        boxShadow: "0 2px 12px rgba(50,109,32,.06)",
        cursor: onClick ? "pointer" : "default",
        fontFamily: FONT,
        minHeight: 126,
        transition: "transform .15s ease, box-shadow .15s ease",
        position: "relative",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(50,109,32,.10)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(50,109,32,.06)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              color: "#5C6B60",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 850,
              color: "#12241B",
              marginTop: 7,
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayValue}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {maskable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMasked((v) => !v);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label={masked ? `Show ${label}` : `Hide ${label}`}
              title={masked ? "Show value" : "Hide value"}
              style={{
                width: 29,
                height: 29,
                borderRadius: 9,
                border: "1px solid #DDE8DA",
                background: "#fff",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <B2BVisibilityIcon masked={masked} size={14} />
            </button>
          )}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: t.iconBg,
              color: t.icon,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {Icon ? <Icon size={17} /> : null}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          paddingTop: 9,
          borderTop: "1px solid #EEF2EA",
          fontSize: 10.5,
          lineHeight: 1.45,
          color: "#5C6B60",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ flex: 1 }}>{note}</span>
        {onClick && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              color: t.accent,
              fontSize: 9.5,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            Breakdown <ChevronRight size={12} />
          </span>
        )}
      </div>
    </div>
  );
}

function B2BSummaryMetricCard({
  label,
  value,
  loading = false,
  color = "#12241B",
  border = "#E1E6D8",
  onClick,
}) {
  const [masked, setMasked] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        background: "rgba(255,255,255,.82)",
        border: `1px solid ${border}`,
        borderRadius: 11,
        padding: "10px 12px",
        cursor: "pointer",
        position: "relative",
        transition: "transform .15s ease, box-shadow .15s ease",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 7px 18px rgba(18,36,27,.09)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            color: "#71806F",
          }}
        >
          {label}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMasked((v) => !v);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={masked ? `Show ${label}` : `Hide ${label}`}
          title={masked ? "Show value" : "Hide value"}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            border: "1px solid #DDE8DA",
            background: "#fff",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <B2BVisibilityIcon masked={masked} size={13} />
        </button>
      </div>
      <div style={{ fontSize: 17, fontWeight: 850, color, marginTop: 4 }}>
        {loading ? "…" : masked ? b2bMaskedValue(value) : value}
      </div>
      <div
        style={{
          fontSize: 9.3,
          fontWeight: 800,
          color: "#3b791e",
          marginTop: 5,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        View breakdown <ChevronRight size={11} />
      </div>
    </div>
  );
}

function B2BBranchItemTable({ selected, user, api, onBack }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (selected.orders.every((o) => b2bOrderItems(o).length) && !attempt)
      return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      if (!user?.role) throw new Error("Sign in again to load item evidence.");
      const hq = ["Super Admin", "Franchisee Operations Admin"].includes(
        user.role,
      );
      if (
        !hq &&
        (!user.brand ||
          !user.branch ||
          !b2bSameScope(user.brand, selected.brand) ||
          !b2bSameScope(user.branch, selected.branch))
      )
        throw new Error(
          "This branch is outside your assigned brand and branch.",
        );
      const params = new URLSearchParams({
        role: user.role,
        brand: selected.brand,
        branch: selected.branch,
      });
      const response = await adminModuleFetch(`${api}/orders?${params}`, {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          `Item evidence could not be loaded (${response.status}).`,
        );
      const payload = await response.json();
      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      if (!controller.signal.aborted)
        setDetails(
          records.filter(
            (o) =>
              b2bSameScope(b2bBrandName(o), selected.brand) &&
              b2bSameScope(b2bBranchName(o), selected.branch),
          ),
        );
    })()
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selected, user, api, attempt]);
  const rows = selected.orders
    .flatMap((order) => {
      const updated = details.find((o) => String(o.id) === String(order.id));
      const items = b2bOrderItems(updated || order);
      return items.length
        ? items.map((item, index) => ({
            order,
            item,
            key: `${order.id}-${index}`,
          }))
        : [{ order, item: null, key: `${order.id}-missing` }];
    })
    .filter(({ order, item }) =>
      `${order.id} ${item ? b2bItemName(item) : "Item details unavailable"}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const pages = Math.max(1, Math.ceil(rows.length / 15)),
    currentPage = Math.min(page, pages);
  const th = {
    padding: "10px 11px",
    fontSize: 9.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    color: C.muted,
    background: C.bg,
    borderBottom: `1px solid ${C.border}`,
    textAlign: "left",
    whiteSpace: "nowrap",
  };
  const td = {
    padding: "11px",
    fontSize: 11,
    borderBottom: "1px solid #EEF3EC",
    color: C.dark,
  };
  return (
    <div className="ad-evidence-view">
      <button
        type="button"
        onClick={onBack}
        style={{ ...btnSt, marginBottom: 12 }}
      >
        Back to branches
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800 }}>
            {selected.branch} · Ordered Items
          </h3>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {selected.brand} · Source orders for the selected comparison
          </p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.greenDk }}>
          {selected.orders.length} orders
        </span>
      </div>
      <input
        aria-label="Search items or order number"
        placeholder="Search item or order number…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        style={{ ...invInputSt, maxWidth: 340, marginBottom: 12 }}
      />
      {loading && (
        <p
          role="status"
          style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}
        >
          Loading item evidence…
        </p>
      )}
      {error && (
        <div
          role="status"
          style={{ fontSize: 11, color: C.red, marginBottom: 10 }}
        >
          {error}{" "}
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            style={smallBtnSt}
          >
            Retry
          </button>
        </div>
      )}
      <div
        style={{
          overflowX: "auto",
          border: `1px solid ${C.border}`,
          borderRadius: 13,
        }}
      >
        <table
          aria-label="Branch ordered item evidence"
          aria-busy={loading}
          style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {[
                "Item / Order #",
                "Order date",
                "Quantity",
                "Unit price",
                "Line total",
              ].map((label, i) => (
                <th
                  key={label}
                  style={{ ...th, textAlign: i > 1 ? "right" : "left" }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .slice((currentPage - 1) * 15, currentPage * 15)
              .map(({ order, item, key }, i) => (
                <tr
                  key={key}
                  style={{ background: i % 2 ? "#FBFDF9" : "#fff" }}
                >
                  <td style={td}>
                    <div style={{ fontWeight: 750 }}>
                      {item
                        ? b2bItemName(item)
                        : loading
                          ? "Loading items…"
                          : "Item details unavailable"}
                    </div>
                    <div
                      style={{ fontSize: 9.5, color: C.muted, marginTop: 3 }}
                    >
                      Order #{order.id}
                    </div>
                  </td>
                  <td style={td}>
                    {b2bDateOfOrder(order)
                      ? new Date(b2bDateOfOrder(order)).toLocaleDateString(
                          "en-PH",
                        )
                      : "—"}
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {item ? b2bItemQty(item).toLocaleString() : "—"}
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {item?.price == null ? "—" : fmtAmt(item.price)}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontWeight: 750,
                      color: C.greenDk,
                    }}
                  >
                    {item?.price == null
                      ? "—"
                      : fmtAmt(item.price * b2bItemQty(item))}
                  </td>
                </tr>
              ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={5}
                  style={{ ...td, textAlign: "center", padding: 24 }}
                >
                  No matching item evidence.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav
          aria-label="Item evidence pages"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            fontSize: 11,
          }}
        >
          <button
            type="button"
            style={btnSt}
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pages}
          </span>
          <button
            type="button"
            style={btnSt}
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function B2BKpiBreakdown({
  user,
  api,
  metric,
  initialBrand = "",
  initialBranch = "",
  productRows = [],
  skuRows = [],
  orders = [],
  ordersReady = false,
  branchRows = [],
  month,
  onOpenSku,
  compact = false,
  initialSelected = null,
  onSelectBranch,
}) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(initialSelected);
  const [query, setQuery] = useState("");
  const size = 10;
  const scope = (row) =>
    (!initialBrand || b2bSameScope(row.brand, initialBrand)) &&
    (!initialBranch || b2bSameScope(row.branch, initialBranch));
  const previous = b2bShiftMonth(month, -1);
  const isHq = [
    "hqRevenue",
    "hqPrevious",
    "hqChange",
    "target",
    "targetGap",
  ].includes(metric);
  const scopedOrders = orders.filter(
    (o) =>
      b2bIsEarnedOrder(o) &&
      scope({ brand: b2bBrandName(o), branch: b2bBranchName(o) }),
  );
  const current = scopedOrders.filter(
    (o) => b2bMonthKey(b2bDateOfOrder(o)) === month,
  );
  const prior = scopedOrders.filter(
    (o) => b2bMonthKey(b2bDateOfOrder(o)) === previous,
  );
  const sum = (list) => list.reduce((n, o) => n + b2bOrderAmount(o), 0);
  const currentTotal = sum(current),
    previousTotal = sum(prior);
  let rows = [];
  if (isHq) {
    const groups = new Map();
    branchRows.filter(scope).forEach((r) => {
      const id = JSON.stringify([r.brand, r.branch]);
      groups.set(id, {
        id,
        brand: r.brand,
        branch: r.branch,
        current: 0,
        previous: 0,
        orders: [],
      });
    });
    (metric === "hqPrevious"
      ? prior
      : metric === "hqChange"
        ? [...current, ...prior]
        : current
    ).forEach((o) => {
      const brand = b2bBrandName(o),
        branch = b2bBranchName(o);
      const key = JSON.stringify([brand, branch]);
      const row = groups.get(key) || {
        id: key,
        brand,
        branch,
        current: 0,
        previous: 0,
        orders: [],
      };
      row[b2bMonthKey(b2bDateOfOrder(o)) === month ? "current" : "previous"] +=
        b2bOrderAmount(o);
      row.orders.push(o);
      groups.set(key, row);
    });
    rows = [...groups.values()];
  } else if (metric === "atRisk")
    rows = branchRows
      .filter(scope)
      .filter((r) => /high|watch|medium/i.test(r.risk || ""));
  else
    rows = (metric === "posRevenue" ? productRows : skuRows)
      .filter(scope)
      .filter((r) => metric !== "unexplained" || r.stockVariance != null);
  const rowValue = (row) =>
    isHq
      ? Number(metric === "hqPrevious" ? row.previous : row.current) || 0
      : metric === "posRevenue"
        ? Number(row.revenue) || 0
        : Math.abs(Number(row.stockVariance) || 0);
  rows.sort(
    (a, b) =>
      rowValue(b) - rowValue(a) ||
      (isHq
        ? Number(b.previous || 0) - Number(a.previous || 0) ||
          (b.orders?.length || 0) - (a.orders?.length || 0)
        : 0) ||
      String(a.brand).localeCompare(String(b.brand)) ||
      String(a.branch).localeCompare(String(b.branch)) ||
      String(a.product || "").localeCompare(String(b.product || "")),
  );
  if (query.trim())
    rows = rows.filter((r) =>
      `${r.brand} ${r.branch}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const selectBranch = (row) => {
    if (onSelectBranch) onSelectBranch(row);
    else {
      setSelected(row);
    }
  };
  const pages = Math.max(1, Math.ceil(rows.length / size)),
    activePage = Math.min(page, pages);
  const revenue = rows.reduce((n, r) => n + Number(r.revenue || 0), 0);
  const th = {
    padding: "9px 10px",
    textAlign: "left",
    fontSize: 9.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    background: "#F6F7F1",
    color: "#5C6B60",
  };
  const td = {
    padding: "9px 10px",
    fontSize: 11.5,
    borderBottom: "1px solid #E1E6D8",
  };
  const button = {
    ...btnSt,
    minHeight: 34,
    height: "auto",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 650,
  };
  const card = (label, value) => (
    <div style={{ padding: 12, border: "1px solid #E1E6D8", borderRadius: 12 }}>
      <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          marginTop: 6,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
  if (selected)
    return (
      <B2BBranchItemTable
        key={selected.id}
        selected={rows.find((r) => r.id === selected.id) || selected}
        user={user}
        api={api}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <div className="ad-evidence-view" key="summary">
      {!compact && (
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          {initialBrand || "All brands"} · {initialBranch || "All branches"} ·{" "}
          {b2bMonthLabel(month)}
        </p>
      )}
      {!compact && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {isHq && ordersReady && (
            <>
              {card(
                metric === "hqPrevious"
                  ? "Previous supply revenue"
                  : "Supply order revenue",
                fmtAmt(metric === "hqPrevious" ? previousTotal : currentTotal),
              )}
              {metric === "hqChange" && (
                <>
                  {card("Previous month", fmtAmt(previousTotal))}
                  {card("Revenue change", fmtAmt(currentTotal - previousTotal))}
                  {previousTotal > 0 &&
                    card(
                      "Month-on-month",
                      `${(((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)}%`,
                    )}
                </>
              )}
            </>
          )}
          {metric === "posRevenue" &&
            card("POS revenue in verified item evidence", fmtAmt(revenue))}
          {metric === "atRisk" &&
            card("At-risk branches", rows.length.toLocaleString())}
        </div>
      )}
      {metric === "hqChange" && (
        <label
          style={{
            display: "block",
            marginBottom: 12,
            fontSize: 11,
            color: C.muted,
          }}
        >
          Find a branch or brand
          <input
            aria-label="Find a branch or brand"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search branch or brand…"
            style={{
              ...invInputSt,
              display: "block",
              maxWidth: 360,
              marginTop: 5,
            }}
          />
        </label>
      )}
      {isHq ? (
        <p style={{ fontSize: 12, marginBottom: 14 }}>
          Supply revenue uses received orders, grouped by order creation month.
          Profit or loss requires cost data.
        </p>
      ) : metric === "posRevenue" ? (
        <p style={{ fontSize: 12, marginBottom: 14 }}>
          Total of the item revenue shown below for this scope. Records with
          unverified ownership are excluded.
        </p>
      ) : null}
      {isHq && !ordersReady ? (
        <p role="status">
          Supply order evidence is unavailable. No revenue total is calculated
          from missing records.
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: `1px solid ${C.border}`,
            borderRadius: 13,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  ...(isHq ? ["Branch / Brand"] : ["Brand", "Branch"]),
                  ...(isHq
                    ? [
                        metric === "hqPrevious"
                          ? "Previous supply revenue"
                          : "Supply revenue",
                        ...(metric === "hqChange"
                          ? ["Previous revenue", "Change", "Change %"]
                          : []),
                        "Orders",
                      ]
                    : metric === "atRisk"
                      ? ["Risk", "Reason"]
                      : [
                          "Item",
                          metric === "posRevenue"
                            ? "POS revenue"
                            : "Stock variance",
                        ]),
                  ...(metric !== "atRisk" ? ["Evidence"] : []),
                ].map((h) => (
                  <th style={th} key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows
                .slice((activePage - 1) * size, activePage * size)
                .map((r, i) => (
                  <tr
                    key={JSON.stringify([r.brand, r.branch, r.id, i])}
                    className={isHq ? "ad-branch-change-row" : undefined}
                    tabIndex={isHq ? 0 : undefined}
                    aria-label={
                      isHq
                        ? `View order evidence for ${r.branch}, ${r.brand}`
                        : undefined
                    }
                    onClick={isHq ? () => selectBranch(r) : undefined}
                    onKeyDown={
                      isHq
                        ? (e) => {
                            if (
                              e.target === e.currentTarget &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              selectBranch(r);
                            }
                          }
                        : undefined
                    }
                    style={{
                      cursor: isHq ? "pointer" : "default",
                      background: i % 2 ? "#FBFDF9" : "#fff",
                    }}
                  >
                    {isHq ? (
                      <td style={td}>
                        <div style={{ fontWeight: 800, color: C.dark }}>
                          {r.branch || "Branch not recorded"}
                        </div>
                        <div
                          style={{
                            fontSize: 9.5,
                            color: C.muted,
                            marginTop: 3,
                          }}
                        >
                          {r.brand || "Brand not recorded"}
                        </div>
                      </td>
                    ) : (
                      <>
                        <td style={td}>{r.brand || "Brand not recorded"}</td>
                        <td style={td}>{r.branch || "Branch not recorded"}</td>
                      </>
                    )}
                    {isHq ? (
                      <>
                        <td style={td}>
                          {fmtAmt(
                            metric === "hqPrevious" ? r.previous : r.current,
                          )}
                        </td>
                        {metric === "hqChange" && (
                          <>
                            <td style={td}>{fmtAmt(r.previous)}</td>
                            <td
                              style={{
                                ...td,
                                color:
                                  r.current < r.previous ? C.red : C.greenDk,
                                fontWeight: 700,
                              }}
                            >
                              {r.current > r.previous ? "+" : ""}
                              {fmtAmt(r.current - r.previous)}
                            </td>
                            <td style={td}>
                              {r.previous > 0
                                ? `${r.current > r.previous ? "+" : ""}${(((r.current - r.previous) / r.previous) * 100).toFixed(1)}%`
                                : r.current > 0
                                  ? "No prior revenue"
                                  : "—"}
                            </td>
                          </>
                        )}
                        <td style={td}>{r.orders.length}</td>
                      </>
                    ) : metric === "atRisk" ? (
                      <>
                        <td style={td}>{r.risk}</td>
                        <td style={td}>{r.reason}</td>
                      </>
                    ) : (
                      <>
                        <td style={td}>{r.product}</td>
                        <td style={td}>
                          {metric === "posRevenue"
                            ? fmtAmt(r.revenue)
                            : r.stockVariance == null
                              ? "Not available"
                              : r.stockVariance.toLocaleString()}
                        </td>
                      </>
                    )}
                    {metric !== "atRisk" && (
                      <td style={td}>
                        <button
                          type="button"
                          style={button}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isHq) selectBranch(r);
                            else onOpenSku?.(r);
                          }}
                          aria-label={`View evidence for ${r.product || r.branch}, ${r.brand}`}
                        >
                          {isHq ? "View item evidence" : "View item"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          {!rows.length && (
            <p style={{ padding: 20 }}>
              No matching evidence for this scope and period.
            </p>
          )}
        </div>
      )}
      {pages > 1 && (
        <nav
          aria-label="Evidence pages"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <button
            style={button}
            disabled={activePage === 1}
            onClick={() => setPage(activePage - 1)}
          >
            Previous
          </button>
          <span>
            Page {activePage} of {pages} · {rows.length} rows
          </span>
          <button
            style={button}
            disabled={activePage === pages}
            onClick={() => setPage(activePage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function B2BDualTrendChart({ data = [], onPointClick }) {
  const [hover, setHover] = useState(null);
  if (!data.length)
    return (
      <DashboardEmptyState message="No HQ supply / POS trend data for the selected filters." />
    );
  const W = 760,
    H = 240,
    PL = 55,
    PR = 24,
    PT = 20,
    PB = 38;
  const pW = W - PL - PR,
    pH = H - PT - PB;
  const hasTarget = data.some(
    (d) =>
      b2bNullableNum(d?.targetRevenue) != null && Number(d.targetRevenue) > 0,
  );
  const maxV =
    Math.max(
      1,
      ...data.flatMap((d) => [
        b2bNum(d.hqRevenue),
        b2bNum(d.posRevenue),
        b2bNum(d.targetRevenue),
      ]),
    ) * 1.12;
  const point = (v, i) => ({
    x: PL + (i / Math.max(1, data.length - 1)) * pW,
    y: PT + pH - (b2bNum(v) / maxV) * pH,
  });
  const hqPts = data.map((d, i) => point(d.hqRevenue, i));
  const posPts = data.map((d, i) => point(d.posRevenue, i));
  const targetPts = data.map((d, i) => point(d.targetRevenue, i));
  const pathOf = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          marginBottom: 8,
          fontSize: 10.5,
          fontWeight: 700,
          color: "#5C6B60",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: "#3b791e",
            }}
          />
          HQ Supply Revenue
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: "#2563eb",
            }}
          />
          Franchisee POS Revenue
        </span>
        {hasTarget && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{ width: 11, height: 0, borderTop: "2px dashed #b45309" }}
            />
            HQ Monthly Target
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 240, display: "block" }}
      >
        {ticks.map((t) => {
          const y = PT + pH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PL}
                y1={y}
                x2={W - PR}
                y2={y}
                stroke="#E9EEE6"
                strokeDasharray="4 4"
              />
              <text
                x={PL - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="9.5"
                fill="#71806F"
                fontFamily={FONT}
              >
                {fmtShort(maxV * t)}
              </text>
            </g>
          );
        })}
        <path
          d={pathOf(hqPts)}
          fill="none"
          stroke="#3b791e"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={pathOf(posPts)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {hasTarget && (
          <path
            d={pathOf(targetPts)}
            fill="none"
            stroke="#b45309"
            strokeWidth="2.25"
            strokeDasharray="7 6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {data.map((d, i) => {
          const h = hqPts[i],
            p = posPts[i];
          const isHover = hover === i;
          return (
            <g
              key={d.month || d.label || i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onPointClick?.(d)}
              style={{ cursor: onPointClick ? "pointer" : "default" }}
            >
              <rect
                x={Math.max(PL, h.x - 28)}
                y={PT}
                width={56}
                height={pH}
                fill="transparent"
              />
              <circle
                cx={h.x}
                cy={h.y}
                r={isHover ? 5 : 3.5}
                fill="#3b791e"
                stroke="#fff"
                strokeWidth="2"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHover ? 5 : 3.5}
                fill="#2563eb"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={h.x}
                y={H - 10}
                textAnchor="middle"
                fontSize="9.5"
                fill="#71806F"
                fontFamily={FONT}
              >
                {d.label || b2bMonthLabel(d.month)}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div
          style={{
            position: "absolute",
            top: 35,
            right: 10,
            background: "#12241B",
            color: "#fff",
            borderRadius: 10,
            padding: "9px 11px",
            fontSize: 10.5,
            boxShadow: "0 10px 25px rgba(0,0,0,.16)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 4 }}>
            {data[hover].label || b2bMonthLabel(data[hover].month)}
          </div>
          <div style={{ opacity: 0.78 }}>
            HQ: {fmtAmt(data[hover].hqRevenue)}
          </div>
          <div style={{ opacity: 0.78 }}>
            POS: {fmtAmt(data[hover].posRevenue)}
          </div>
          {hasTarget && (
            <div style={{ opacity: 0.78 }}>
              Target: {fmtAmt(data[hover].targetRevenue)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const b2bScopeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
const b2bSameScope = (a, b) => b2bScopeText(a) === b2bScopeText(b);

function b2bVerifiedItemScope(item, parentBrand, parentBranch, catalog) {
  const name =
    item?.product || item?.product_name || item?.item_name || item?.name || "";
  const id =
    item?.productId ??
    item?.product_id ??
    item?.inventory_id ??
    item?.ingredient_id ??
    item?.id;
  // Prefer the recorded name when present: IDs from different tables can collide.
  const candidates = catalog.filter((c) => {
    const cid = b2bItemId(c);
    const nameMatches = name && b2bSameScope(b2bItemName(c), name);
    return name
      ? nameMatches
      : id != null && cid != null && String(id) === String(cid);
  });
  const directBrand = b2bBrandName(item);
  const directBranch = b2bBranchName(item);
  const owners = [...new Set(candidates.map(b2bBrandName).filter(Boolean))];
  const itemBrand = directBrand || (owners.length === 1 ? owners[0] : "");
  const itemBranch = directBranch || parentBranch;
  if (
    !itemBrand ||
    !itemBranch ||
    /unknown|unassigned|not set|,|—/i.test(itemBrand)
  )
    return null;
  if (parentBrand && !b2bSameScope(itemBrand, parentBrand)) return null;
  if (parentBranch && !b2bSameScope(itemBranch, parentBranch)) return null;
  // A catalog is required to validate product ownership, even for aggregate API rows.
  if (!candidates.some((c) => b2bSameScope(b2bBrandName(c), itemBrand)))
    return null;
  return { brand: itemBrand, branch: itemBranch };
}

function B2BRevenueAssuranceDashboard({
  transactions = [],
  brands = [],
  user,
  view = "overview",
  onOpenSalesAi,
}) {
  const API = ADMIN_API_BASE;
  const [month, setMonth] = useState(() => b2bMonthKey(new Date()));
  const [branch, setBranch] = useState("");
  const [brand, setBrand] = useState("");
  const [risk, setRisk] = useState("all");
  const [growthTargetPct] = useState(B2B_DEFAULT_GROWTH_TARGET);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const completedB2BScopeRef = useRef(null);
  const completedB2BModeRef = useRef(null);
  const activeB2BRequestRef = useRef(null);
  useEffect(
    () => () => {
      activeB2BRequestRef.current = null;
    },
    [],
  );
  const [sourceMode, setSourceMode] = useState("aggregated");
  const [overviewApi, setOverviewApi] = useState(null);
  const [branchesApi, setBranchesApi] = useState([]);
  const [brandsApi, setBrandsApi] = useState([]);
  const [anomaliesApi, setAnomaliesApi] = useState([]);
  const [productsApi, setProductsApi] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);
  const [ordersReady, setOrdersReady] = useState(false);
  const [rawInventory, setRawInventory] = useState([]);
  const [evidenceCatalog, setEvidenceCatalog] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [drilldown, setDrilldown] = useState(null);
  const [detailHistory, setDetailHistory] = useState([]);
  const detailRef = useRef(null);
  useEffect(() => {
    if (!drilldown) return;
    const previousFocus = document.activeElement;
    const dialog = detailRef.current;
    dialog?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setDrilldown(null);
        setDetailHistory([]);
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = [
        ...dialog.querySelectorAll(
          'button:not(:disabled), summary, a[href], input, select, [tabindex="0"]',
        ),
      ];
      const first = controls[0],
        last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog?.addEventListener("keydown", handleKey);
    return () => {
      dialog?.removeEventListener("keydown", handleKey);
      previousFocus?.focus?.();
    };
  }, [Boolean(drilldown)]);
  const rememberDetail = () => {
    if (drilldown) setDetailHistory((history) => [...history, drilldown]);
  };
  const closeDetail = () => {
    setDrilldown(null);
    setDetailHistory([]);
  };
  const backDetail = () => {
    if (!detailHistory.length) {
      closeDetail();
      return;
    }
    setDrilldown(detailHistory[detailHistory.length - 1]);
    setDetailHistory((history) => history.slice(0, -1));
  };

  const branchCatalog = useMemo(() => {
    const map = new Map();
    (brands || []).forEach((b) => {
      const brandName = String(
        b?.name || b?.brand || b?.brand_name || b?.brandName || "",
      ).trim();
      (Array.isArray(b?.branches) ? b.branches : []).forEach((br) => {
        const name =
          typeof br === "string"
            ? br
            : String(
                br?.name ||
                  br?.branch ||
                  br?.branch_name ||
                  br?.branchName ||
                  "",
              ).trim();
        if (!name) return;
        const current = map.get(name) || {
          name,
          id: typeof br === "object" ? (br?.id ?? br?.branch_id ?? name) : name,
          location: "",
          brandNames: [],
        };
        if (typeof br === "object")
          current.location = String(
            br?.location || br?.address || br?.city || current.location || "",
          ).trim();
        if (brandName && !current.brandNames.includes(brandName))
          current.brandNames.push(brandName);
        map.set(name, current);
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [brands]);

  const normalizeB2BBrand = useCallback((value) => {
    const name = String(value || "").trim();

    if (/^ipharma$/i.test(name)) return "iPharma Mart";
    if (/^ipharma mart$/i.test(name)) return "iPharma Mart";
    if (/^coffee spot$/i.test(name)) return "Coffee Spot";
    if (/^ifuel$/i.test(name)) return "iFuel";

    return name;
  }, []);

  const getOfficialBranchScope = useCallback(
    (branchName, brandName = "") => {
      const branchKey = String(branchName || "")
        .trim()
        .toLowerCase();

      if (!branchKey) return null;

      const catalogBranch = branchCatalog.find(
        (item) =>
          String(item?.name || "")
            .trim()
            .toLowerCase() === branchKey,
      );

      // Branch no longer exists in brands.js
      if (!catalogBranch) return null;

      const requestedBrand = normalizeB2BBrand(brandName);

      // No brand supplied — branch existence is enough.
      if (!requestedBrand) {
        return {
          branch: catalogBranch.name,
          brand: normalizeB2BBrand(catalogBranch.brandNames?.[0]) || "",
          catalog: catalogBranch,
        };
      }

      const officialBrand = (catalogBranch.brandNames || []).find(
        (name) =>
          normalizeB2BBrand(name).toLowerCase() ===
          requestedBrand.toLowerCase(),
      );

      // Branch exists, but NOT under this brand.
      if (!officialBrand) return null;

      return {
        branch: catalogBranch.name,
        brand: normalizeB2BBrand(officialBrand),
        catalog: catalogBranch,
      };
    },
    [branchCatalog, normalizeB2BBrand],
  );

  const isOfficialBrandBranch = useCallback(
    (branchName, brandName = "") =>
      Boolean(getOfficialBranchScope(branchName, brandName)),
    [getOfficialBranchScope],
  );

  const resolveBranchBrand = useCallback(
    (branchName, directBrand = "") => {
      const direct = String(directBrand || "").trim();
      if (direct && !/^unassigned|unknown|—$/i.test(direct)) return direct;
      const normalizedBranch = String(branchName || "")
        .trim()
        .toLowerCase();
      const catalogMatch = branchCatalog.find(
        (item) =>
          String(item.name || "")
            .trim()
            .toLowerCase() === normalizedBranch,
      );
      if (catalogMatch?.brandNames?.length)
        return catalogMatch.brandNames.join(", ");
      const transactionBrands = Array.from(
        new Set(
          (transactions || [])
            .filter(
              (tx) =>
                String(tx?.branch || tx?.branch_name || tx?.branchName || "")
                  .trim()
                  .toLowerCase() === normalizedBranch,
            )
            .map((tx) =>
              String(
                tx?.brand ||
                  tx?.brand_name ||
                  tx?.brandName ||
                  tx?.franchise_brand ||
                  "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      );
      return transactionBrands.join(", ") || "Brand not set";
    },
    [branchCatalog, transactions],
  );

  const brandOptions = useMemo(
    () =>
      (brands || [])
        .map((b) => ({
          id: b?.id ?? b?.brand_id ?? b?.name,
          name: String(b?.name || b?.brand || "").trim(),
        }))
        .filter((b) => b.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [brands],
  );
  const branchOptions = useMemo(() => {
    if (!brand) return branchCatalog;
    return branchCatalog.filter((br) => br.brandNames.includes(brand));
  }, [branchCatalog, brand]);

  useEffect(() => {
    if (branch && !branchOptions.some((br) => br.name === branch))
      setBranch("");
  }, [brand, branch, branchOptions]);

  const fetchJson = useCallback(async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const path = String(url).split("?")[0];
    try {
      const res = await adminModuleFetch(url, {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error(`${path}: invalid JSON response`);
      }
      if (json?.error)
        throw new Error(
          `${path}: ${typeof json.error === "string" ? json.error : "backend error"}`,
        );
      return json;
    } catch (error) {
      if (controller.signal.aborted) throw new Error(`${path}: timed out`);
      if (error instanceof TypeError)
        throw new Error(`${path}: connection or CORS error`);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const fetchRawOrdersFallback = useCallback(async () => {
    const params = new URLSearchParams();

    if (user?.branch) {
      params.set("branch", user.branch);
    }

    if (user?.brand) {
      params.set("brand", user.brand);
    }

    const query = params.toString();

    const data = await fetchJson(`${API}/orders${query ? `?${query}` : ""}`);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.data)) return data.data;

    throw new Error("Supply orders were not returned as a list");
  }, [API, user?.branch, user?.brand, fetchJson]);
  const loadB2B = useCallback(async () => {
    if (!API) {
      setLoading(false);
      setLoadError(
        "The API URL is not configured, so Mobile Orders and inventory cannot be loaded.",
      );
      return;
    }
    const scope = JSON.stringify([
      API,
      month,
      branch,
      brand,
      risk,
      growthTargetPct,
      user?.role,
      user?.branch,
      user?.brand,
    ]);
    // Manual refresh and polling share the same in-flight request.
    if (activeB2BRequestRef.current?.scope === scope) return;
    const request = { scope };
    activeB2BRequestRef.current = request;
    const isCurrent = () => activeB2BRequestRef.current === request;
    const background = completedB2BScopeRef.current === scope;
    setLoading(!background);
    setRefreshing(true);
    setLoadError("");
    try {
      const params = new URLSearchParams({ month });
      if (branch) params.set("branch", branch);
      if (brand) params.set("brand", brand);
      if (risk !== "all") params.set("risk", risk);
      params.set("growthTargetPct", String(growthTargetPct));

      const endpoints = [
        `${API}/dashboard/b2b/overview?${params.toString()}`,
        `${API}/dashboard/b2b/branches?${params.toString()}`,
        `${API}/dashboard/b2b/brands?${params.toString()}`,
        `${API}/dashboard/b2b/anomalies?${params.toString()}`,
        `${API}/dashboard/b2b/products?${params.toString()}`,
      ];

      const settled = await Promise.allSettled(endpoints.map(fetchJson));
      const catalogResults = await Promise.allSettled([
        fetchJson(`${API}/inventory`),
        fetchJson(`${API}/ingredients`),
      ]);
      if (!isCurrent()) return;
      if (catalogResults.some((result) => result.status === "fulfilled"))
        setEvidenceCatalog(
          catalogResults.flatMap((result) => {
            if (result.status !== "fulfilled") return [];
            const value = result.value;
            return Array.isArray(value)
              ? value
              : Array.isArray(value?.data)
                ? value.data
                : [];
          }),
        );
      const hasCoreSummary = settled
        .slice(0, 3)
        .every((r) => r.status === "fulfilled");

      if (
        !hasCoreSummary &&
        background &&
        completedB2BModeRef.current === "aggregated"
      ) {
        setLoadError(
          "Refresh unavailable. Showing the last loaded figures; retry Refresh.",
        );
        return;
      }
      if (hasCoreSummary) {
        setSourceMode("aggregated");
        const o = settled[0].status === "fulfilled" ? settled[0].value : null;
        const br = settled[1].status === "fulfilled" ? settled[1].value : [];
        const bd = settled[2].status === "fulfilled" ? settled[2].value : [];
        const an = settled[3].status === "fulfilled" ? settled[3].value : [];
        const pr = settled[4].status === "fulfilled" ? settled[4].value : [];
        setOverviewApi(o?.data || o || null);
        setBranchesApi(
          Array.isArray(br)
            ? br
            : Array.isArray(br?.branches)
              ? br.branches
              : Array.isArray(br?.data)
                ? br.data
                : [],
        );
        setBrandsApi(
          Array.isArray(bd)
            ? bd
            : Array.isArray(bd?.brands)
              ? bd.brands
              : Array.isArray(bd?.data)
                ? bd.data
                : [],
        );
        setAnomaliesApi(
          Array.isArray(an)
            ? an
            : Array.isArray(an?.anomalies)
              ? an.anomalies
              : Array.isArray(an?.data)
                ? an.data
                : [],
        );
        setProductsApi(
          Array.isArray(pr)
            ? pr
            : Array.isArray(pr?.products)
              ? pr.products
              : Array.isArray(pr?.data)
                ? pr.data
                : [],
        );
        try {
          const orders = await fetchRawOrdersFallback();
          if (!isCurrent()) return;
          setRawOrders(orders);
          setOrdersReady(true);
        } catch {
          if (!isCurrent()) return;
          if (!background) {
            setRawOrders([]);
            setOrdersReady(false);
          }
          setLoadError(
            "Supply orders could not be refreshed. Some evidence may be out of date.",
          );
        }
        setRawInventory([]);
      } else {
        const inventoryParams = new URLSearchParams();
        if (branch) inventoryParams.set("branch", branch);
        const [ordersResult, stockInventoryResult, posInventoryResult] =
          await Promise.allSettled([
            fetchRawOrdersFallback(),
            fetchJson(
              `${API}/ingredients${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`,
            ),
            fetchJson(
              `${API}/inventory${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`,
            ),
          ]);
        if (!isCurrent()) return;
        setSourceMode("fallback");
        setOverviewApi(null);
        setBranchesApi([]);
        setBrandsApi([]);
        setAnomaliesApi([]);
        setProductsApi([]);
        if (ordersResult.status === "fulfilled") {
          setOrdersReady(true);
          setRawOrders(ordersResult.value);
        } else if (!background) {
          setOrdersReady(false);
          setRawOrders([]);
        }
        const stockPayload =
          stockInventoryResult.status === "fulfilled"
            ? stockInventoryResult.value
            : [];
        const posPayload =
          posInventoryResult.status === "fulfilled"
            ? posInventoryResult.value
            : [];
        const stockRows = Array.isArray(stockPayload)
          ? stockPayload
          : Array.isArray(stockPayload?.data)
            ? stockPayload.data
            : [];
        const posRows = Array.isArray(posPayload)
          ? posPayload
          : Array.isArray(posPayload?.data)
            ? posPayload.data
            : [];
        const stockAvailable =
          stockInventoryResult.status === "fulfilled" ||
          posInventoryResult.status === "fulfilled";
        if (stockAvailable)
          setRawInventory(stockRows.length ? stockRows : posRows);
        else if (!background) setRawInventory([]);
        const failures = [];
        if (ordersResult.status === "rejected") {
          failures.push(
            `Supply orders could not load: ${ordersResult.reason?.message || "connection failed"}.`,
          );
        }
        if (!stockAvailable) {
          failures.push(
            `Stock evidence could not load: ingredients (${stockInventoryResult.reason?.message || "unavailable"}); inventory (${posInventoryResult.reason?.message || "unavailable"}). Revenue updates are still available when orders load.`,
          );
        }
        if (failures.length) {
          setLoadError(
            failures.join(" ") +
              (background
                ? " Previous values are retained only for sources that failed."
                : " Retry after checking the backend."),
          );
        }
      }
      completedB2BScopeRef.current = scope;
      completedB2BModeRef.current = hasCoreSummary ? "aggregated" : "fallback";
    } catch (error) {
      if (isCurrent())
        setLoadError("Dashboard update failed. Please retry Refresh.");
    } finally {
      if (isCurrent()) {
        activeB2BRequestRef.current = null;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [
    API,
    month,
    branch,
    brand,
    risk,
    growthTargetPct,
    fetchJson,
    fetchRawOrdersFallback,
    user?.role,
    user?.branch,
    user?.brand,
  ]);

  useAdminLiveRefresh(loadB2B, [loadB2B]);

  const fallback = useMemo(() => {
    const currentMonth = month;
    const prevMonth = b2bShiftMonth(month, -1);
    const monthMatches = (value, key) => b2bMonthKey(value) === key;
    const brandAllows = (name) => !brand || String(name || "") === brand;
    const branchAllows = (name) => !branch || String(name || "") === branch;

    const orders = rawOrders.filter((o) => {
      const rowBranch = b2bBranchName(o);
      const rowBrand = b2bBrandName(o);

      return (
        b2bIsEarnedOrder(o) &&
        isOfficialBrandBranch(rowBranch, rowBrand) &&
        brandAllows(normalizeB2BBrand(rowBrand)) &&
        branchAllows(rowBranch)
      );
    });

    const pos = (transactions || []).filter((tx) => {
      const rowBranch = b2bBranchName(tx);

      // POS stores brand in shop in your transactions table.
      const rowBrand =
        b2bBrandName(tx) || tx?.shop || tx?.brand || tx?.brand_name || "";

      return (
        b2bIsCompletedTx(tx) &&
        isOfficialBrandBranch(rowBranch, rowBrand) &&
        brandAllows(normalizeB2BBrand(rowBrand)) &&
        branchAllows(rowBranch)
      );
    });

    const inventory = (rawInventory || []).filter((row) => {
      const rowBranch = b2bBranchName(row);
      const rowBrand = b2bBrandName(row);

      if (!isOfficialBrandBranch(rowBranch, rowBrand)) {
        return false;
      }

      if (
        !brandAllows(normalizeB2BBrand(rowBrand)) ||
        !branchAllows(rowBranch)
      ) {
        return false;
      }

      if (currentMonth === b2bMonthKey(new Date())) {
        return true;
      }

      const snapshotDate = b2bDateOfInventory(row);

      if (snapshotDate) {
        return monthMatches(snapshotDate, currentMonth);
      }

      return false;
    });

    // Month-scoped records used by all fallback calculations.
    const currentOrders = orders.filter((o) =>
      monthMatches(b2bDateOfOrder(o), currentMonth),
    );
    const prevOrders = orders.filter((o) =>
      monthMatches(b2bDateOfOrder(o), prevMonth),
    );
    const currentTx = pos.filter((tx) =>
      monthMatches(b2bDateOfTx(tx), currentMonth),
    );
    const prevTx = pos.filter((tx) => monthMatches(b2bDateOfTx(tx), prevMonth));

    const hqRevenue = currentOrders.reduce(
      (sum, order) => sum + b2bOrderAmount(order),
      0,
    );
    const prevHqRevenue = prevOrders.reduce(
      (sum, order) => sum + b2bOrderAmount(order),
      0,
    );
    const posRevenue = currentTx.reduce((s, tx) => s + b2bTxAmount(tx), 0);
    const prevPosRevenue = prevTx.reduce((s, tx) => s + b2bTxAmount(tx), 0);
    const target = B2B_HQ_MONTHLY_TARGET;
    const attainment = target > 0 ? (hqRevenue / target) * 100 : null;
    const gap = Math.max(0, target - hqRevenue);

    const branchPairs = new Map();

    // ============================================================
    // ONLY branches currently registered in brands.js
    // ============================================================

    branchCatalog.forEach((cat) => {
      (cat.brandNames || []).forEach((brandName) => {
        const officialBrand = normalizeB2BBrand(brandName);

        if (!brandAllows(officialBrand)) return;
        if (!branchAllows(cat.name)) return;

        const key = JSON.stringify([officialBrand, cat.name]);

        branchPairs.set(key, {
          name: cat.name,
          brandName: officialBrand,
          cat,
        });
      });
    });

    const branchRows = Array.from(branchPairs.values())
      .map(({ name, brandName, cat }) => {
        const matches = (row) =>
          b2bSameScope(b2bBranchName(row), name) &&
          b2bSameScope(b2bBrandName(row), brandName);
        const currO = currentOrders.filter(matches),
          prevO = prevOrders.filter(matches);
        const currT = currentTx.filter(matches),
          prevT = prevTx.filter(matches),
          currI = inventory.filter(matches);
        const hq = currO.reduce((s, o) => s + b2bOrderAmount(o), 0);
        const prevHq = prevO.reduce((s, o) => s + b2bOrderAmount(o), 0);
        const posV = currT.reduce((s, tx) => s + b2bTxAmount(tx), 0);
        const prevPos = prevT.reduce((s, tx) => s + b2bTxAmount(tx), 0);
        const suppliedQty = currO
          .flatMap(b2bOrderItems)
          .reduce((s, i) => s + b2bItemQty(i), 0);
        const soldQty = currT
          .flatMap(b2bTxItems)
          .reduce((s, i) => s + b2bItemQty(i), 0);
        const openingValues = currI
          .map(b2bInventoryOpening)
          .filter((v) => v != null);
        const closingValues = currI
          .map(b2bInventoryClosing)
          .filter((v) => v != null);
        const openingQty =
          currI.length > 0 && openingValues.length === currI.length
            ? openingValues.reduce((s, v) => s + v, 0)
            : null;
        const endingStock =
          currI.length > 0 && closingValues.length === currI.length
            ? closingValues.reduce((s, v) => s + v, 0)
            : null;
        const disposalQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryDisposal(i)),
          0,
        );
        const transferInQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryTransferIn(i)),
          0,
        );
        const transferOutQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryTransferOut(i)),
          0,
        );
        const adjustmentQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryAdjustment(i)),
          0,
        );
        const officialAvailable = Math.max(
          0,
          b2bNum(openingQty) +
            suppliedQty +
            transferInQty -
            disposalQty -
            transferOutQty +
            adjustmentQty,
        );
        const orderCoverage =
          openingQty != null && soldQty > 0
            ? Math.min(100, (officialAvailable / soldQty) * 100)
            : null;
        const expectedClosing =
          openingQty != null && endingStock != null
            ? openingQty +
              suppliedQty +
              transferInQty -
              soldQty -
              disposalQty -
              transferOutQty +
              adjustmentQty
            : null;
        const stockVariance =
          expectedClosing == null ? null : endingStock - expectedClosing;
        const hqGrowth =
          prevHq > 0 ? ((hq - prevHq) / prevHq) * 100 : hq > 0 ? 100 : 0;
        const posGrowth =
          prevPos > 0 ? ((posV - prevPos) / prevPos) * 100 : posV > 0 ? 100 : 0;
        const targetV = 0; // HQ target is company-wide, not a quota for each branch.
        const targetPct = targetV > 0 ? (hq / targetV) * 100 : null;
        let riskLabel = stockVariance == null ? "No data yet" : "Normal";
        let reason = "No revenue-leakage signal from available order/POS data.";
        if (posV > 0 && hq === 0) {
          riskLabel = "High Risk";
          reason =
            "Active POS sales with no fulfilled HQ supply order in the selected month. Verify carry-over stock, approved transfers, or possible outside sourcing.";
        } else if (stockVariance != null && stockVariance > 0) {
          riskLabel = "High Risk";
          reason = `${stockVariance.toLocaleString()} units are above the stock expected from opening balance, HQ receipts, POS sales, disposal, and transfers.`;
        } else if (stockVariance != null && stockVariance < 0) {
          riskLabel = "High Risk";
          reason = `${Math.abs(stockVariance).toLocaleString()} units are missing from the expected stock balance and require a physical count.`;
        } else if (
          openingQty != null &&
          orderCoverage != null &&
          orderCoverage < 70 &&
          posV > 0
        ) {
          riskLabel = "High Risk";
          reason = `Only ${orderCoverage.toFixed(1)}% of reported POS-sold units are supported by opening stock and authorized HQ stock flow.`;
        } else if (
          posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct &&
          hqGrowth <= -B2B_FALLBACK_THRESHOLDS.highOrderDropPct
        ) {
          riskLabel = "High Risk";
          reason =
            "POS is stable/up while HQ supply revenue dropped materially.";
        } else if (
          posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct &&
          hqGrowth <= -B2B_FALLBACK_THRESHOLDS.watchOrderDropPct
        ) {
          riskLabel = "Watch";
          reason = "POS is stable/up while HQ supply revenue is declining.";
        }
        if (!currO.length && !currT.length) {
          riskLabel = "No transactions yet";
          reason =
            "No orders or completed POS transactions recorded for this month. Inventory evidence may be unavailable.";
        }
        return {
          id: JSON.stringify([brandName, cat?.id ?? name]),
          branch: name,
          brand: brandName,
          location: cat?.location || "—",
          hqRevenue: hq,
          posRevenue: posV,
          vsLastMonth: hqGrowth,
          posGrowth,
          targetPct,
          orderCoverage,
          stockVariance,
          suppliedQty,
          soldQty,
          openingStock: openingQty,
          endingStock,
          risk: riskLabel,
          reason,
          targetGap: Math.max(0, targetV - hq),
          prevHqRevenue: prevHq,
        };
      })
      .filter((r) => !branch || r.branch === branch);

    // Brand & Branch is the source of truth.
    // Do not resurrect deleted brands from historical orders/POS/inventory.
    const brandNames = new Set(
      brandOptions.map((b) => normalizeB2BBrand(b.name)).filter(Boolean),
    );
    const brandRows = Array.from(brandNames)
      .map((name) => {
        const currO = currentOrders.filter((o) => b2bBrandName(o) === name);
        const currT = currentTx.filter((tx) => b2bBrandName(tx) === name);
        const currI = inventory.filter((row) => b2bBrandName(row) === name);
        const hq = currO.reduce((s, o) => s + b2bOrderAmount(o), 0);
        const posV = currT.reduce((s, tx) => s + b2bTxAmount(tx), 0);
        const suppliedQty = currO
          .flatMap(b2bOrderItems)
          .reduce((s, i) => s + b2bItemQty(i), 0);
        const soldQty = currT
          .flatMap(b2bTxItems)
          .reduce((s, i) => s + b2bItemQty(i), 0);
        const openingValues = currI
          .map(b2bInventoryOpening)
          .filter((v) => v != null);
        const closingValues = currI
          .map(b2bInventoryClosing)
          .filter((v) => v != null);
        const openingStock =
          currI.length > 0 && openingValues.length === currI.length
            ? openingValues.reduce((s, v) => s + v, 0)
            : null;
        const endingStock =
          currI.length > 0 && closingValues.length === currI.length
            ? closingValues.reduce((s, v) => s + v, 0)
            : null;
        const disposalQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryDisposal(i)),
          0,
        );
        const transferInQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryTransferIn(i)),
          0,
        );
        const transferOutQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryTransferOut(i)),
          0,
        );
        const adjustmentQty = currI.reduce(
          (s, i) => s + b2bNum(b2bInventoryAdjustment(i)),
          0,
        );
        const expectedClosing =
          openingStock != null && endingStock != null
            ? openingStock +
              suppliedQty +
              transferInQty -
              soldQty -
              disposalQty -
              transferOutQty +
              adjustmentQty
            : null;
        const stockVariance =
          expectedClosing == null ? null : endingStock - expectedClosing;
        const availableQty =
          openingStock == null
            ? null
            : Math.max(0, openingStock + suppliedQty + transferInQty);
        const sellThrough =
          availableQty && availableQty > 0
            ? (soldQty / availableQty) * 100
            : null;
        return {
          id: brandOptions.find((b) => b.name === name)?.id ?? name,
          brand: name,
          hqRevenue: hq,
          posRevenue: posV,
          suppliedQty,
          soldQty,
          openingStock,
          endingStock,
          sellThrough,
          stockVariance,
        };
      })
      .filter((r) => !brand || r.brand === brand)
      .sort((a, b) => b.hqRevenue - a.hqRevenue);

    const riskRows = branchRows
      .filter((r) => /high|watch|medium/i.test(r.risk))
      .map((r) => ({
        id: `fallback-${r.branch}`,
        branch: r.branch,
        brand: r.brand,
        severity: r.risk,
        rule:
          r.hqRevenue === 0 && r.posRevenue > 0
            ? "No Recent HQ Order + Active Sales"
            : "High POS, Low HQ Orders",
        reason: r.reason,
        gapValue: r.targetGap,
        recommendation:
          "Review the branch → brand → SKU breakdown and verify the source of replenishment.",
      }));

    const skuMap = new Map();
    const addSku = (item, kind, parentBrand, parentBranch) => {
      const scope = b2bVerifiedItemScope(
        item,
        parentBrand,
        parentBranch,
        evidenceCatalog,
      );
      if (!scope) return;
      const resolvedBranch = scope.branch;
      const resolvedBrand = scope.brand;
      if (branch && resolvedBranch !== branch) return;
      if (brand && resolvedBrand !== brand) return;
      const id = b2bItemId(item);
      const name = b2bItemName(item);
      const key = b2bSkuKey(item, resolvedBrand, resolvedBranch);
      const row = skuMap.get(key) || {
        id: id ?? key,
        sku: id != null ? String(id) : "—",
        product: name,
        brand: resolvedBrand,
        branch: resolvedBranch,
        suppliedQty: 0,
        soldQty: 0,
        openingStock: null,
        endingStock: null,
        disposal: null,
        transferIn: null,
        transferOut: null,
        adjustment: null,
        transfers: null,
        stockVariance: null,
      };
      if (kind === "supply") row.suppliedQty += b2bItemQty(item);
      if (kind === "sale") row.soldQty += b2bItemQty(item);
      if (kind === "inventory") {
        row.openingStock = b2bInventoryOpening(item);
        row.endingStock = b2bInventoryClosing(item);
        row.disposal = b2bInventoryDisposal(item);
        row.transferIn = b2bInventoryTransferIn(item);
        row.transferOut = b2bInventoryTransferOut(item);
        row.adjustment = b2bInventoryAdjustment(item);
        row.transfers = b2bNum(row.transferIn) + b2bNum(row.transferOut);
      }
      skuMap.set(key, row);
    };
    currentOrders.forEach((o) =>
      b2bOrderItems(o).forEach((i) =>
        addSku(
          i,
          "supply",
          b2bBrandName(o) || b2bBrandName(i),
          b2bBranchName(o) || b2bBranchName(i),
        ),
      ),
    );
    currentTx.forEach((tx) =>
      b2bTxItems(tx).forEach((i) =>
        addSku(
          i,
          "sale",
          b2bBrandName(tx) || b2bBrandName(i),
          b2bBranchName(tx) || b2bBranchName(i),
        ),
      ),
    );
    inventory.forEach((row) =>
      addSku(row, "inventory", b2bBrandName(row), b2bBranchName(row)),
    );
    const skuRows = Array.from(skuMap.values())
      .map((row) => {
        const hasFullBalance =
          row.openingStock != null && row.endingStock != null;
        const expectedClosing = hasFullBalance
          ? row.openingStock +
            row.suppliedQty +
            b2bNum(row.transferIn) -
            row.soldQty -
            b2bNum(row.disposal) -
            b2bNum(row.transferOut) +
            b2bNum(row.adjustment)
          : null;
        return {
          ...row,
          stockVariance:
            expectedClosing == null ? null : row.endingStock - expectedClosing,
        };
      })
      .sort(
        (a, b) =>
          Math.abs(b.stockVariance || 0) - Math.abs(a.stockVariance || 0) ||
          b.soldQty + b.suppliedQty - (a.soldQty + a.suppliedQty),
      );

    const stockRiskRows = skuRows
      .filter((row) => row.stockVariance != null && row.stockVariance !== 0)
      .map((row, index) => ({
        id: `stock-${row.id}-${index}`,
        branch: row.branch,
        brand: row.brand,
        sku: row.product,
        severity: "High Risk",
        rule:
          row.stockVariance > 0
            ? "Suspected Unofficial Supply"
            : "Ghost Stock / Shrinkage",
        reason:
          row.stockVariance > 0
            ? `${row.stockVariance.toLocaleString()} recorded units are not explained by verified opening stock, HQ receipts, POS sales, disposal, and transfers.`
            : `${Math.abs(row.stockVariance).toLocaleString()} units expected by the stock ledger are missing from recorded closing stock.`,
        gapValue: null,
        recommendation:
          "Request a physical count, verify the source order or transfer, and review manual inventory adjustments.",
      }));

    const trend = [];
    for (let offset = -5; offset <= 0; offset++) {
      const key = b2bShiftMonth(currentMonth, offset);
      const o = orders
        .filter((x) => monthMatches(b2bDateOfOrder(x), key))
        .reduce((s, x) => s + b2bOrderAmount(x), 0);
      const t = pos
        .filter((x) => monthMatches(b2bDateOfTx(x), key))
        .reduce((s, x) => s + b2bTxAmount(x), 0);
      trend.push({
        month: key,
        label: b2bMonthLabel(key).replace(/\s\d{4}$/, ""),
        hqRevenue: o,
        posRevenue: t,
        targetRevenue: B2B_HQ_MONTHLY_TARGET,
      });
    }

    const suppliedUnits = brandRows.reduce(
      (sum, row) => sum + Number(row.suppliedQty || 0),
      0,
    );
    const soldUnits = brandRows.reduce(
      (sum, row) => sum + Number(row.soldQty || 0),
      0,
    );
    const openingUnits = brandRows.reduce(
      (sum, row) => sum + Number(row.openingStock || 0),
      0,
    );
    const hasOpeningEvidence =
      brandRows.length > 0 &&
      brandRows.every((row) => row.openingStock != null);
    const coverage =
      hasOpeningEvidence && soldUnits > 0
        ? Math.min(
            100,
            ((suppliedUnits + (hasOpeningEvidence ? openingUnits : 0)) /
              soldUnits) *
              100,
          )
        : null;
    const unexplained = skuRows
      .filter((row) => row.stockVariance != null)
      .reduce((sum, row) => sum + Math.abs(Number(row.stockVariance || 0)), 0);
    const sellThrough =
      hasOpeningEvidence && openingUnits + suppliedUnits > 0
        ? (soldUnits / (openingUnits + suppliedUnits)) * 100
        : null;
    const allAnomalies = [...stockRiskRows, ...riskRows];
    const atRisk = new Set(
      allAnomalies.map((row) => row.branch).filter(Boolean),
    ).size;

    return {
      hqRevenue,
      prevHqRevenue,
      posRevenue,
      prevPosRevenue,
      target,
      attainment,
      gap,
      coverage,
      unexplained,
      sellThrough,
      atRisk,
      branchRows,
      brandRows,
      anomalies: allAnomalies,
      skuRows,
      trend,
    };
  }, [
    month,
    branch,
    brand,
    rawOrders,
    rawInventory,
    transactions,
    branchCatalog,
    brandOptions,
    growthTargetPct,
    evidenceCatalog,
    isOfficialBrandBranch,
    normalizeB2BBrand,
  ]);

  const normalizedOverview = useMemo(() => {
    const o = overviewApi || {};
    const hqRevenue = b2bNullableNum(
      o?.hqSupplyRevenue,
      o?.hq_supply_revenue,
      o?.supplyRevenue,
      o?.franchisyncSupplyRevenue,
    );
    const posRevenue = b2bNullableNum(
      o?.posRevenue,
      o?.pos_revenue,
      o?.franchiseePosRevenue,
      o?.franchisee_pos_revenue,
    );
    const target = B2B_HQ_MONTHLY_TARGET;
    const targetGap = Math.max(0, target - (hqRevenue ?? fallback.hqRevenue));
    const targetAttainment = ((hqRevenue ?? fallback.hqRevenue) / target) * 100;
    const coverage = b2bNullableNum(
      o?.orderCoverage,
      o?.order_coverage,
      o?.coveragePct,
      o?.coverage_pct,
    );
    const atRisk = b2bNullableNum(
      o?.atRiskBranches,
      o?.at_risk_branches,
      o?.riskCount,
      o?.risk_count,
    );
    const unexplained = b2bNullableNum(
      o?.unexplainedStock,
      o?.unexplained_stock,
      o?.unexplainedStockUnits,
      o?.unexplained_stock_units,
    );
    const sellThrough = b2bNullableNum(
      o?.sellThrough,
      o?.sell_through,
      o?.sellThroughPct,
      o?.sell_through_pct,
    );
    const prevHqRevenue = b2bNullableNum(
      o?.previousHqSupplyRevenue,
      o?.previous_hq_supply_revenue,
      o?.prevHqRevenue,
      o?.prev_hq_revenue,
    );
    const prevPosRevenue = b2bNullableNum(
      o?.previousPosRevenue,
      o?.previous_pos_revenue,
      o?.prevPosRevenue,
      o?.prev_pos_revenue,
    );
    return {
      hqRevenue: hqRevenue ?? fallback.hqRevenue,
      posRevenue: posRevenue ?? fallback.posRevenue,
      target: target ?? fallback.target,
      targetGap: targetGap ?? fallback.gap,
      targetAttainment: targetAttainment ?? fallback.attainment,
      coverage: coverage ?? fallback.coverage,
      atRisk: atRisk ?? (sourceMode === "fallback" ? fallback.atRisk : 0),
      unexplained: unexplained ?? fallback.unexplained,
      sellThrough: sellThrough ?? fallback.sellThrough,
      prevHqRevenue: prevHqRevenue ?? fallback.prevHqRevenue,
      prevPosRevenue: prevPosRevenue ?? fallback.prevPosRevenue,
    };
  }, [overviewApi, fallback, sourceMode]);

  const branchRows = useMemo(() => {
    const riskMatches = (value) =>
      risk === "all" ||
      String(value || "")
        .toLowerCase()
        .includes(risk.toLowerCase().replace("high-risk", "high"));

    // Fallback rows are already generated exclusively from branchCatalog.
    if (sourceMode === "fallback" || !branchesApi.length) {
      return fallback.branchRows
        .map(b2bAssessBranch)
        .filter(
          (r) =>
            isOfficialBrandBranch(r.branch, r.brand) &&
            (!brand ||
              normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)) &&
            (!branch || b2bSameScope(r.branch, branch)) &&
            riskMatches(r.risk),
        );
    }

    // Aggregated API can contain historical/deleted branches.
    // Validate every row against the current Brand & Branch catalog.
    const reported = branchesApi
      .map((r, i) => {
        const rawBranch = String(
          r?.branch_name || r?.branch || r?.name || "",
        ).trim();

        const rawBrand = String(
          r?.brand_name || r?.brand || r?.brandName || "",
        ).trim();

        const official = getOfficialBranchScope(rawBranch, rawBrand);

        // Deleted branch, deleted brand, or invalid brand/branch pairing.
        if (!official) return null;

        return {
          id:
            r?.branch_id ??
            r?.id ??
            official.catalog?.id ??
            `${official.brand}-${official.branch}-${i}`,
          branch: official.branch,
          brand: official.brand,
          location: String(
            official.catalog?.location || r?.location || r?.address || "—",
          ),
          hqRevenue: b2bNullableNum(
            r?.hq_supply_revenue,
            r?.hqRevenue,
            r?.supply_revenue,
          ),
          posRevenue: b2bNullableNum(
            r?.pos_revenue,
            r?.posRevenue,
            r?.franchisee_pos_revenue,
          ),
          vsLastMonth: b2bNullableNum(
            r?.mom_growth,
            r?.vs_last_month,
            r?.hq_growth_pct,
          ),
          targetPct: b2bNullableNum(
            r?.target_pct,
            r?.targetAttainment,
            r?.target_attainment_pct,
          ),
          targetGap: b2bNullableNum(
            r?.target_gap,
            r?.targetGap,
            r?.revenue_gap,
          ),
          prevHqRevenue: b2bNullableNum(
            r?.previous_hq_supply_revenue,
            r?.prevHqRevenue,
            r?.previous_revenue,
          ),
          orderCoverage: b2bNullableNum(
            r?.order_coverage,
            r?.coverage_pct,
            r?.orderCoverage,
          ),
          stockVariance: b2bNullableNum(r?.stock_variance, r?.stockVariance),
          risk: String(
            r?.risk || r?.risk_status || r?.anomaly_status || "No data yet",
          ),
          reason: String(r?.reason || r?.risk_reason || ""),
        };
      })
      .filter(Boolean)
      .filter(
        (r) =>
          (!brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)) &&
          (!branch || b2bSameScope(r.branch, branch)),
      );

    // Start only with valid current branches from fallback.branchRows.
    const merged = new Map(
      fallback.branchRows
        .filter((r) => isOfficialBrandBranch(r.branch, r.brand))
        .map((r) => [JSON.stringify([r.brand, r.branch]), r]),
    );

    reported.forEach((r) => {
      const key = JSON.stringify([r.brand, r.branch]);
      const existing = merged.get(key);

      merged.set(key, {
        ...existing,
        ...r,
        risk:
          r.hqRevenue === 0 &&
          r.posRevenue === 0 &&
          existing?.risk === "No transactions yet"
            ? existing.risk
            : r.risk,
      });
    });

    return [...merged.values()]
      .map(b2bAssessBranch)
      .filter(
        (r) =>
          isOfficialBrandBranch(r.branch, r.brand) &&
          (!brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)) &&
          (!branch || b2bSameScope(r.branch, branch)) &&
          riskMatches(r.risk),
      );
  }, [
    sourceMode,
    branchesApi,
    fallback.branchRows,
    brand,
    branch,
    risk,
    isOfficialBrandBranch,
    getOfficialBranchScope,
    normalizeB2BBrand,
  ]);

  const brandRows = useMemo(() => {
    const officialBrands = new Set(
      brandOptions.map((b) => normalizeB2BBrand(b.name)).filter(Boolean),
    );

    if (sourceMode === "fallback" || !brandsApi.length) {
      return fallback.brandRows.filter(
        (r) =>
          officialBrands.has(normalizeB2BBrand(r.brand)) &&
          (!brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)),
      );
    }

    const reported = brandsApi
      .map((r, i) => {
        const officialBrand = normalizeB2BBrand(
          r?.brand_name || r?.brand || r?.name || "",
        );

        if (!officialBrands.has(officialBrand)) return null;

        return {
          id: r?.brand_id ?? r?.id ?? officialBrand ?? i,
          brand: officialBrand,
          hqRevenue: b2bNum(
            r?.hq_supply_revenue,
            r?.hqRevenue,
            r?.supply_revenue,
          ),
          posRevenue: b2bNum(r?.pos_revenue, r?.posRevenue),
          suppliedQty: b2bNum(
            r?.supplied_qty,
            r?.qty_supplied,
            r?.quantity_supplied,
          ),
          soldQty: b2bNum(r?.sold_qty, r?.qty_sold, r?.quantity_sold),
          endingStock: b2bNullableNum(
            r?.ending_stock,
            r?.closing_stock,
            r?.on_hand,
          ),
          sellThrough: b2bNullableNum(r?.sell_through, r?.sell_through_pct),
          stockVariance: b2bNullableNum(r?.stock_variance, r?.stockVariance),
        };
      })
      .filter(Boolean)
      .filter(
        (r) =>
          !brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand),
      );

    const merged = new Map(
      fallback.brandRows
        .filter((r) => officialBrands.has(normalizeB2BBrand(r.brand)))
        .map((r) => [normalizeB2BBrand(r.brand), r]),
    );

    reported.forEach((r) => {
      const key = normalizeB2BBrand(r.brand);
      merged.set(key, { ...merged.get(key), ...r, brand: key });
    });

    return [...merged.values()].filter(
      (r) =>
        officialBrands.has(normalizeB2BBrand(r.brand)) &&
        (!brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)),
    );
  }, [
    sourceMode,
    brandsApi,
    fallback.brandRows,
    brand,
    brandOptions,
    normalizeB2BBrand,
  ]);

  const anomalies = useMemo(() => {
    const riskMatches = (value) =>
      risk === "all" ||
      String(value || "")
        .toLowerCase()
        .includes(risk.toLowerCase().replace("high-risk", "high"));

    const rows =
      sourceMode === "fallback" || !anomaliesApi.length
        ? fallback.anomalies
        : anomaliesApi
            .map((r, i) => {
              const rawBranch = String(
                r?.branch_name || r?.branch || "",
              ).trim();

              const rawBrand = String(r?.brand_name || r?.brand || "").trim();

              const official = getOfficialBranchScope(rawBranch, rawBrand);
              if (!official) return null;

              return {
                id: r?.id ?? i,
                branch: official.branch,
                brand: official.brand,
                sku: String(r?.sku || r?.product_name || ""),
                severity: String(r?.severity || r?.risk || "Watch"),
                rule: String(
                  r?.rule || r?.rule_name || r?.anomaly || "Anomaly",
                ),
                reason: String(
                  r?.reason || r?.message || "Review supporting evidence.",
                ),
                gapValue: b2bNullableNum(
                  r?.gap_value,
                  r?.value_gap,
                  r?.amount_gap,
                ),
                recommendation: String(
                  r?.recommendation ||
                    "Review linked order, POS, and inventory evidence.",
                ),
              };
            })
            .filter(Boolean);

    return rows.filter(
      (r) =>
        isOfficialBrandBranch(r.branch, r.brand) &&
        (!brand || normalizeB2BBrand(r.brand) === normalizeB2BBrand(brand)) &&
        (!branch || b2bSameScope(r.branch, branch)) &&
        riskMatches(r.severity),
    );
  }, [
    sourceMode,
    anomaliesApi,
    fallback.anomalies,
    risk,
    brand,
    branch,
    isOfficialBrandBranch,
    getOfficialBranchScope,
    normalizeB2BBrand,
  ]);

  const trendData = useMemo(() => {
    const o = overviewApi || {};
    const raw = b2bArray(
      o?.trend ||
        o?.monthlyTrend ||
        o?.monthly_trend ||
        o?.revenueTrend ||
        o?.revenue_trend,
    );
    if (!raw.length) return fallback.trend;
    const mapped = raw.map((r, i) => ({
      month: String(r?.month || r?.period || ""),
      label: String(
        r?.label ||
          (r?.month
            ? b2bMonthLabel(r.month).replace(/\s\d{4}$/, "|")
            : `M${i + 1}`),
      ).replace("|", ""),
      hqRevenue: b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
      posRevenue: b2bNum(r?.pos_revenue, r?.posRevenue),
      targetRevenue: b2bNullableNum(
        r?.target_revenue,
        r?.targetRevenue,
        r?.monthly_target,
        r?.target,
      ),
    }));
    return mapped.map((row) => ({
      ...row,
      targetRevenue: B2B_HQ_MONTHLY_TARGET,
    }));
  }, [overviewApi, fallback.trend, growthTargetPct]);

  const skuRows = fallback.skuRows;

  const transactionProductEvidenceRows = useMemo(() => {
    const productMap = new Map();
    const parseItems = (raw) => {
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    (transactions || []).forEach((tx) => {
      if (!b2bIsCompletedTx(tx) || b2bMonthKey(b2bDateOfTx(tx)) !== month)
        return;
      const txBranch =
        b2bBranchName(tx) || String(tx?.branch || "Unassigned Branch");
      const rawTxBrand =
        b2bBrandName(tx) || tx?.shop || tx?.brand || tx?.brand_name || "";
      const officialTxScope = getOfficialBranchScope(txBranch, rawTxBrand);
      if (!officialTxScope) return;
      const txBrand = officialTxScope.brand;
      if (branch && txBranch !== branch) return;
      if (
        brand &&
        !txBrand
          .split(",")
          .map((value) => value.trim())
          .includes(brand)
      )
        return;

      const txItems = parseItems(tx?.items);
      const itemGrossTotal = txItems.reduce((sum, item) => {
        const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
        return sum + (Number(item?.price ?? 0) || 0) * qty;
      }, 0);
      const transactionNetTotal =
        Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;
      const netAllocationRatio =
        itemGrossTotal > 0 && transactionNetTotal > 0
          ? transactionNetTotal / itemGrossTotal
          : 1;

      txItems.forEach((item, itemIndex) => {
        const scope = b2bVerifiedItemScope(
          item,
          txBrand,
          txBranch,
          evidenceCatalog,
        );
        if (!scope) return;
        const sku = String(
          item?.id ??
            item?.inventory_id ??
            item?.product_id ??
            item?.sku ??
            `ITEM-${itemIndex + 1}`,
        );
        const product = String(
          item?.name ||
            item?.product_name ||
            item?.item_name ||
            "Unnamed Product",
        );
        const soldQty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
        const grossLineRevenue =
          Number(item?.total ?? item?.line_total ?? 0) ||
          (Number(item?.price ?? 0) || 0) * soldQty;
        const lineRevenue = grossLineRevenue * netAllocationRatio;
        const key = `${txBrand}::${txBranch}::${sku}::${product}`;
        const existing = productMap.get(key) || {
          id: key,
          productId: item?.product_id ?? item?.inventory_id ?? item?.id ?? null,
          sku,
          product,
          brand: scope.brand,
          branch: scope.branch,
          soldQty: 0,
          revenue: 0,
          transactionIds: new Set(),
          lastSale: null,
        };
        existing.soldQty += soldQty;
        existing.revenue += lineRevenue;
        existing.transactionIds.add(tx?.id ?? `${txBranch}-${tx?.created_at}`);
        const saleDate = b2bDateOfTx(tx);
        if (
          saleDate &&
          (!existing.lastSale ||
            new Date(saleDate) > new Date(existing.lastSale))
        )
          existing.lastSale = saleDate;
        productMap.set(key, existing);
      });
    });

    return Array.from(productMap.values())
      .map((row) => ({
        ...row,
        transactionCount: row.transactionIds.size,
        transactionIds: undefined,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.soldQty - a.soldQty);
  }, [
    transactions,
    month,
    branch,
    brand,
    getOfficialBranchScope,
    evidenceCatalog,
  ]);

  const productEvidenceRows = useMemo(() => {
    const rows =
      sourceMode === "aggregated" && productsApi.length
        ? productsApi.map((row, index) => ({
            id: row?.product_id ?? row?.id ?? index,
            productId: row?.product_id ?? row?.id ?? null,
            sku: String(
              row?.sku_name ||
                row?.sku ||
                row?.product_name ||
                row?.name ||
                "Unnamed Product",
            ),
            product: String(
              row?.product_name ||
                row?.name ||
                row?.sku_name ||
                "Unnamed Product",
            ),
            brand: String(row?.brand_name || row?.brand || "Brand not set"),
            branch: String(
              row?.branch_name || row?.branch || "Unassigned Branch",
            ),
            branchId: row?.branch_id ?? null,
            brandId: row?.brand_id ?? null,
            soldQty: b2bNum(row?.sold_qty, row?.quantity_sold),
            revenue: b2bNum(row?.line_revenue, row?.revenue, row?.net_revenue),
            transactionCount: b2bNum(row?.transaction_count, row?.transactions),
            lastSale: row?.last_sale || row?.lastSale || null,
          }))
        : transactionProductEvidenceRows;
    return rows
      .filter(
        (row) =>
          isOfficialBrandBranch(row.branch, row.brand) &&
          (!brand ||
            b2bSameScope(
              normalizeB2BBrand(row.brand),
              normalizeB2BBrand(brand),
            )) &&
          (!branch || b2bSameScope(row.branch, branch)) &&
          b2bVerifiedItemScope(row, row.brand, row.branch, evidenceCatalog),
      )
      .sort(
        (a, b) =>
          String(a.brand).localeCompare(String(b.brand)) ||
          String(a.branch).localeCompare(String(b.branch)) ||
          String(a.product).localeCompare(String(b.product)),
      );
  }, [
    sourceMode,
    productsApi,
    transactionProductEvidenceRows,
    brand,
    branch,
    evidenceCatalog,
    isOfficialBrandBranch,
    normalizeB2BBrand,
  ]);

  const sortedBranchRows = useMemo(
    () =>
      [...branchRows].sort(
        (a, b) =>
          Number(b.hqRevenue || 0) - Number(a.hqRevenue || 0) ||
          Number(b.posRevenue || 0) - Number(a.posRevenue || 0) ||
          Number(b.prevHqRevenue || 0) - Number(a.prevHqRevenue || 0) ||
          String(a.brand).localeCompare(String(b.brand)) ||
          String(a.branch).localeCompare(String(b.branch)),
      ),
    [branchRows],
  );

  const monthlyLeaders = useMemo(() => {
    const byHq = [...branchRows].sort(
      (a, b) => Number(b.hqRevenue || 0) - Number(a.hqRevenue || 0),
    );
    const byPos = [...branchRows].sort(
      (a, b) => Number(b.posRevenue || 0) - Number(a.posRevenue || 0),
    );
    const byBrand = [...brandRows].sort(
      (a, b) => Number(b.hqRevenue || 0) - Number(a.hqRevenue || 0),
    );
    const leakage = [...branchRows].sort((a, b) => {
      const aGap = Number(a.posRevenue || 0) - Number(a.hqRevenue || 0);
      const bGap = Number(b.posRevenue || 0) - Number(b.hqRevenue || 0);
      return bGap - aGap;
    });
    return {
      hqBranch: byHq[0] || null,
      posBranch: byPos[0] || null,
      hqBrand: byBrand[0] || null,
      leakageBranch: leakage[0] || null,
    };
  }, [branchRows, brandRows]);

  const openKpi = (metric, title) => {
    rememberDetail();
    setDrilldown({
      type: "kpi",
      title: title || metric,
      loading: false,
      data: {
        metric,
        scopeBrand:
          drilldown?.data?.scopeBrand || drilldown?.data?.brand || brand,
        scopeBranch:
          drilldown?.data?.scopeBranch ||
          (drilldown?.type === "branch" ? drilldown?.data?.branch : "") ||
          branch,
      },
    });
  };

  const openBranch = async (row) => {
    rememberDetail();
    setDrilldown({
      type: "branch",
      title: row.branch,
      loading: true,
      data: b2bAssessBranch(row),
    });
    if (sourceMode === "aggregated") {
      try {
        const data = await fetchJson(
          `${API}/dashboard/b2b/branches/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`,
        );
        setDrilldown({
          type: "branch",
          title: row.branch,
          loading: false,
          data: b2bAssessBranch({ ...row, ...(data?.data || data) }),
        });
        return;
      } catch {}
    }
    setDrilldown({
      type: "branch",
      title: row.branch,
      loading: false,
      data: b2bAssessBranch(row),
    });
  };

  const openBrand = async (row) => {
    rememberDetail();
    setDrilldown({ type: "brand", title: row.brand, loading: true, data: row });
    const selectedBranchRow = branch
      ? branchCatalog.find((b) => b.name === branch)
      : null;
    if (sourceMode === "aggregated" && selectedBranchRow) {
      try {
        const data = await fetchJson(
          `${API}/dashboard/b2b/branches/${encodeURIComponent(selectedBranchRow.id)}/brands/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`,
        );
        setDrilldown({
          type: "brand",
          title: row.brand,
          loading: false,
          data: { ...row, ...(data?.data || data) },
        });
        return;
      } catch {}
    }
    setDrilldown({
      type: "brand",
      title: row.brand,
      loading: false,
      data: row,
    });
  };

  const openSku = async (row) => {
    rememberDetail();
    setDrilldown({ type: "sku", title: row.product, loading: true, data: row });
    const selectedBranchRow = row?.branchId
      ? { id: row.branchId, name: row.branch }
      : branchCatalog.find(
          (b) =>
            b.name === row.branch &&
            (!row.brand || b.brandNames.includes(row.brand)),
        );
    if (
      sourceMode === "aggregated" &&
      selectedBranchRow &&
      (row?.productId ?? row?.id) != null
    ) {
      try {
        const q = new URLSearchParams({
          branchId: String(selectedBranchRow.id),
          productId: String(row?.productId ?? row.id),
          brand: row.brand,
          branch: row.branch,
          month,
        });
        const data = await fetchJson(
          `${API}/dashboard/b2b/reconcile?${q.toString()}`,
        );
        const detail = data?.data || data;
        if (
          (b2bBrandName(detail) &&
            !b2bSameScope(b2bBrandName(detail), row.brand)) ||
          (b2bBranchName(detail) &&
            !b2bSameScope(b2bBranchName(detail), row.branch))
        )
          throw new Error("Evidence scope mismatch");
        const ingredients = Array.isArray(detail?.ingredients)
          ? detail.ingredients.filter(
              (i) =>
                (!b2bBrandName(i) ||
                  b2bSameScope(b2bBrandName(i), row.brand)) &&
                (!b2bBranchName(i) ||
                  b2bSameScope(b2bBranchName(i), row.branch)),
            )
          : undefined;
        setDrilldown({
          type: "sku",
          title: row.product,
          loading: false,
          data: {
            ...row,
            ...detail,
            brand: row.brand,
            branch: row.branch,
            product: row.product,
            ingredients,
          },
        });
        return;
      } catch {}
    }
    setDrilldown({
      type: "sku",
      title: row.product,
      loading: false,
      data: row,
      warning:
        "Full opening/receipt/POS/disposal/transfer/manual-adjustment evidence needs the B2B stock evidence endpoint and inventory movement references.",
    });
  };

  const stockDataReady =
    normalizedOverview.coverage != null ||
    normalizedOverview.unexplained != null ||
    normalizedOverview.sellThrough != null ||
    branchRows.some(
      (r) => r.stockVariance != null || r.orderCoverage != null,
    ) ||
    brandRows.some((r) => r.endingStock != null || r.stockVariance != null);
  const hqMoM =
    normalizedOverview.prevHqRevenue > 0
      ? ((normalizedOverview.hqRevenue - normalizedOverview.prevHqRevenue) /
          normalizedOverview.prevHqRevenue) *
        100
      : null;
  const posMoM =
    normalizedOverview.prevPosRevenue > 0
      ? ((normalizedOverview.posRevenue - normalizedOverview.prevPosRevenue) /
          normalizedOverview.prevPosRevenue) *
        100
      : null;
  const hasPreviousHqRevenue =
    Number(normalizedOverview.prevHqRevenue || 0) > 0;
  const hqRevenueDifference =
    Number(normalizedOverview.hqRevenue || 0) -
    Number(normalizedOverview.prevHqRevenue || 0);
  const hqRevenueDirection = !hasPreviousHqRevenue
    ? "neutral"
    : hqRevenueDifference > 0
      ? "up"
      : hqRevenueDifference < 0
        ? "down"
        : "same";
  const hqRevenueStatus =
    hqRevenueDirection === "up"
      ? {
          label: "REVENUE UP",
          title: "San Juan (Head Office) revenue is higher this month",
          color: "#2c5c16",
          bg: "#f0f5e8",
          border: "#c9dba0",
          icon: TrendingUp,
        }
      : hqRevenueDirection === "down"
        ? {
            label: "REVENUE DOWN",
            title: "San Juan (Head Office) revenue is lower this month",
            color: "#b42318",
            bg: "#fef3f2",
            border: "#f2c9c4",
            icon: TrendingDown,
          }
        : hqRevenueDirection === "same"
          ? {
              label: "NO CHANGE",
              title: "San Juan (Head Office) revenue is unchanged",
              color: "#7c5d12",
              bg: "#fffbeb",
              border: "#fde68a",
              icon: Activity,
            }
          : {
              label: "NO BASELINE",
              title:
                "San Juan (Head Office) monthly comparison is not available yet",
              color: "#5C6B60",
              bg: "#F6F7F1",
              border: "#E1E6D8",
              icon: Info,
            };
  const HqStatusIcon = hqRevenueStatus.icon;
  const isOverviewView = view === "overview";
  const isGhostView = view === "ghost";

  const franchisorActions = useMemo(() => {
    const items = [];
    const highRiskCount = branchRows.filter((r) =>
      String(r.risk || "")
        .toLowerCase()
        .includes("high"),
    ).length;
    const topAnomaly = anomalies[0];
    const targetGap = Number(normalizedOverview.targetGap || 0);
    const unexplained = Number(normalizedOverview.unexplained || 0);
    const coverage = normalizedOverview.coverage;

    if (targetGap > 0)
      items.push({
        priority: "Revenue priority",
        tone: "amber",
        title: `Close the ${fmtAmt(targetGap)} HQ revenue gap`,
        evidence: `Current HQ supply revenue is ${normalizedOverview.targetAttainment == null ? "below target" : `${Math.max(0, 100 - normalizedOverview.targetAttainment).toFixed(1)}% short of target`}.`,
        action:
          "Review branches with weak ordering activity, confirm upcoming replenishment needs, and validate whether the target remains realistic.",
      });

    if (highRiskCount > 0 || Number(normalizedOverview.atRisk || 0) > 0)
      items.push({
        priority: "Loss investigation",
        tone: "red",
        title: `Investigate ${Math.max(highRiskCount, Number(normalizedOverview.atRisk || 0))} at-risk branch${Math.max(highRiskCount, Number(normalizedOverview.atRisk || 0)) === 1 ? "" : "es"}`,
        evidence:
          topAnomaly?.reason ||
          "Revenue, HQ ordering, or stock movement is inconsistent at one or more branches.",
        action:
          topAnomaly?.recommendation ||
          "Open Ghost Stock / Revenue Leakage, start with the highest-risk branch, then reconcile the affected SKU records.",
      });

    if (unexplained > 0)
      items.push({
        priority: "Inventory control",
        tone: "red",
        title: `Reconcile ${unexplained.toLocaleString()} unexplained stock unit${unexplained === 1 ? "" : "s"}`,
        evidence:
          "Recorded closing stock does not fully agree with opening stock, HQ receipts, POS sales, disposal, and transfers.",
        action:
          "Require physical counts and source references before approving adjustments or new replenishment.",
      });

    if (coverage != null && coverage < 70)
      items.push({
        priority: "Supply assurance",
        tone: "amber",
        title: `Improve HQ order coverage from ${Number(coverage).toFixed(1)}%`,
        evidence:
          "A material portion of reported sell-through is not supported by authorized HQ stock flow.",
        action:
          "Verify external sourcing, missing receipts, unposted transfers, and delayed mobile-order acknowledgements.",
      });

    if (!items.length)
      items.push({
        priority: "Healthy position",
        tone: "green",
        title: "No immediate revenue or stock-control exception",
        evidence:
          "Current targets, risk rules, and available stock movement evidence show no material exception.",
        action:
          "Maintain controls, review the AI forecast, and continue monitoring changes by branch and SKU.",
      });

    return items.slice(0, 3);
  }, [branchRows, anomalies, normalizedOverview]);

  const tableWrap = {
    overflowX: "auto",
    border: "1px solid #E7EEE4",
    borderRadius: 13,
  };
  const th = {
    padding: "10px 11px",
    fontSize: 9.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    color: "#71806F",
    background: "#F6FAF3",
    borderBottom: "1px solid #DDE8DA",
    whiteSpace: "nowrap",
  };
  const td = {
    padding: "11px",
    fontSize: 11,
    color: "#334155",
    borderBottom: "1px solid #EEF3EC",
    whiteSpace: "nowrap",
  };
  const sectionCard = {
    background: "#fff",
    border: "1px solid #E1E6D8",
    borderRadius: 18,
    padding: "18px 20px",
    boxShadow: "0 2px 14px rgba(50,109,32,.06)",
  };

  return (
    <div style={{ fontFamily: FONT, marginBottom: 22 }}>
      <style>{`
          .b2b-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.b2b-overview-kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.b2b-two-col{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.8fr);gap:15px}.b2b-overview-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:14px}.b2b-filter-grid{display:grid;grid-template-columns:160px minmax(170px,1fr) minmax(170px,1fr) minmax(145px,.8fr) 125px;gap:10px;align-items:end}.b2b-brand-grid{display:grid;grid-template-columns:1fr;gap:12px}.b2b-hq-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}@media(max-width:1180px){.b2b-kpi-grid,.b2b-overview-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.b2b-two-col,.b2b-overview-grid{grid-template-columns:1fr}.b2b-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.franchisor-action-row{grid-template-columns:1fr 1fr!important}.franchisor-action-row>div:last-child{grid-column:1/-1}}@media(max-width:680px){.b2b-kpi-grid,.b2b-overview-kpi-grid,.b2b-filter-grid,.b2b-hq-summary-grid{grid-template-columns:1fr}.b2b-filter-grid button{width:100%}.franchisor-action-row{grid-template-columns:1fr!important}.franchisor-action-row>div:last-child{grid-column:auto}}
        `}</style>

      {isOverviewView && (
        <div
          style={{
            ...sectionCard,
            marginBottom: 14,
            padding: "17px 18px",
            border: `1px solid ${hqRevenueStatus.border}`,
            borderLeft: `5px solid ${hqRevenueStatus.color}`,
            background: hqRevenueStatus.bg,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 260, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 6,
                }}
              >
                <HqStatusIcon size={17} color={hqRevenueStatus.color} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 850,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: hqRevenueStatus.color,
                  }}
                >
                  San Juan Head Office Monthly Performance
                </span>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 850,
                  color: "#12241B",
                  lineHeight: 1.25,
                }}
              >
                {hqRevenueStatus.title}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 11.5,
                  color: "#5C6B60",
                  lineHeight: 1.5,
                }}
              >
                {hasPreviousHqRevenue ? (
                  <>
                    This month is{" "}
                    <b style={{ color: hqRevenueStatus.color }}>
                      {Math.abs(hqMoM || 0).toFixed(1)}%{" "}
                      {hqRevenueDifference >= 0 ? "higher" : "lower"}
                    </b>{" "}
                    than last month based on total fulfilled/delivered Head
                    Office supply orders.
                  </>
                ) : (
                  <>
                    There is no previous-month San Juan Head Office supply
                    revenue available yet for comparison.
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#fff",
                  border: `1px solid ${hqRevenueStatus.border}`,
                  color: hqRevenueStatus.color,
                  fontSize: 10,
                  fontWeight: 850,
                }}
              >
                {hqRevenueStatus.label}
              </span>
              <button
                onClick={loadB2B}
                disabled={loading || refreshing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #DDE8DA",
                  background: "#fff",
                  color: "#3b791e",
                  borderRadius: 9,
                  padding: "7px 10px",
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: loading || refreshing ? "wait" : "pointer",
                }}
              >
                <RefreshCw
                  size={12}
                  style={{
                    animation: refreshing ? "spin .8s linear infinite" : "none",
                  }}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="b2b-hq-summary-grid">
            <B2BSummaryMetricCard
              label="This Month"
              value={fmtAmt(normalizedOverview.hqRevenue)}
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={() => openKpi("hqRevenue", "Current HQ Supply Revenue")}
            />
            <B2BSummaryMetricCard
              label="Last Month"
              value={
                hasPreviousHqRevenue
                  ? fmtAmt(normalizedOverview.prevHqRevenue)
                  : "—"
              }
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={() =>
                openKpi("hqPrevious", "Previous-Month HQ Supply Revenue")
              }
            />
            <B2BSummaryMetricCard
              label="Month-on-Month Change"
              value={
                hasPreviousHqRevenue
                  ? `${hqRevenueDifference >= 0 ? "+" : "−"}${fmtAmt(Math.abs(hqRevenueDifference))}`
                  : "—"
              }
              loading={loading}
              color={hqRevenueStatus.color}
              border={hqRevenueStatus.border}
              onClick={() => openKpi("hqChange", "HQ Month-on-Month Change")}
            />
          </div>
        </div>
      )}

      <div style={{ ...sectionCard, padding: "15px 16px", marginBottom: 14 }}>
        <div className="b2b-filter-grid">
          <label>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#71806F",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Month
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ ...invInputSt, marginTop: 5, height: 37 }}
            />
          </label>
          <label>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#71806F",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Brand
            </span>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={{ ...invInputSt, marginTop: 5, height: 37 }}
            >
              <option value="">All Brands</option>
              {brandOptions.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#71806F",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Branch / Brand / Location
            </span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{ ...invInputSt, marginTop: 5, height: 37 }}
            >
              <option value="">All Branches</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} — {b.brandNames?.join(", ") || "Unassigned Brand"}
                  {b.location && b.location !== "—" ? ` — ${b.location}` : ""}
                </option>
              ))}
            </select>
          </label>
          {isGhostView && (
            <label>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#71806F",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                Risk Status
              </span>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                style={{ ...invInputSt, marginTop: 5, height: 37 }}
              >
                <option value="all">All Statuses</option>
                <option value="high">High Risk</option>
                <option value="watch">Watch</option>
                <option value="normal">Normal</option>
                <option value="stock check">Stock check needed</option>
                <option value="no transactions">No transactions</option>
              </select>
            </label>
          )}
          {isOverviewView && (
            <label>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#71806F",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                Monthly HQ Target
              </span>
              <input
                type="text"
                value={fmtAmt(B2B_HQ_MONTHLY_TARGET)}
                readOnly
                aria-label="Monthly company-wide HQ target"
                style={{ ...invInputSt, marginTop: 5, height: 37 }}
              />
            </label>
          )}
        </div>
      </div>

      {loadError && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #f2c9c4",
            color: "#991b1b",
            fontSize: 11.5,
            display: "flex",
            gap: 7,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {loadError}
        </div>
      )}
      {sourceMode === "fallback" && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: 10.8,
            lineHeight: 1.5,
            display: "flex",
            gap: 7,
            alignItems: "flex-start",
          }}
        >
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            This view is using your existing Mobile Orders, POS transactions,
            and branch inventory endpoints. Exact historical ghost-stock proof
            still requires dated opening/closing counts and inventory movements
            linked to their source order, sale, disposal, or transfer.
          </span>
        </div>
      )}

      {isOverviewView && (
        <div style={{ ...sectionCard, marginBottom: 15, padding: "18px 19px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 13,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 15,
                  fontWeight: 850,
                  color: "#12241B",
                }}
              >
                <Brain size={16} color="#3b791e" /> Franchisor Decision Summary
              </div>
              <div style={{ fontSize: 10.8, color: "#5C6B60", marginTop: 4 }}>
                What needs attention now, why it matters, and the next business
                action.
              </div>
            </div>
            <button
              onClick={onOpenSalesAi}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 11px",
                borderRadius: 9,
                border: "1px solid #C9DBA0",
                background: "#F4F8F0",
                color: "#2c5c16",
                fontSize: 10.5,
                fontWeight: 850,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Open Sales &amp; AI Guidance <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {franchisorActions.map((item, index) => {
              const tone =
                item.tone === "red"
                  ? {
                      accent: "#c0392b",
                      bg: "#fff7f7",
                      border: "#f2c9c4",
                      badge: "#fdf1f0",
                    }
                  : item.tone === "amber"
                    ? {
                        accent: "#b45309",
                        bg: "#fffbeb",
                        border: "#fde68a",
                        badge: "#fef3c7",
                      }
                    : {
                        accent: "#2c5c16",
                        bg: "#f4f8f0",
                        border: "#c9dba0",
                        badge: "#eaf3df",
                      };
              return (
                <div
                  className="franchisor-action-row"
                  key={`${item.priority}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(145px,.42fr) minmax(220px,.8fr) minmax(280px,1.25fr)",
                    gap: 13,
                    padding: "12px 13px",
                    borderRadius: 12,
                    border: `1px solid ${tone.border}`,
                    borderLeft: `4px solid ${tone.accent}`,
                    background: tone.bg,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 8px",
                        borderRadius: 20,
                        background: tone.badge,
                        color: tone.accent,
                        fontSize: 9.3,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: ".055em",
                      }}
                    >
                      {index + 1}. {item.priority}
                    </span>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 850,
                        color: "#12241B",
                        marginTop: 7,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 9.2,
                        fontWeight: 850,
                        color: "#71806F",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      Evidence
                    </div>
                    <div
                      style={{
                        fontSize: 10.7,
                        color: "#526052",
                        lineHeight: 1.55,
                      }}
                    >
                      {item.evidence}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 9.2,
                        fontWeight: 850,
                        color: tone.accent,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      Recommended next step
                    </div>
                    <div
                      style={{
                        fontSize: 10.8,
                        color: "#26372B",
                        lineHeight: 1.55,
                        fontWeight: 650,
                      }}
                    >
                      {item.action}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isGhostView && (
        <div
          style={{
            ...sectionCard,
            marginBottom: 15,
            padding: "15px 17px",
            borderLeft: "5px solid #c0392b",
            background: "linear-gradient(135deg,#fff,#fff8f7)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 14.5,
                  fontWeight: 850,
                  color: "#12241B",
                }}
              >
                <ShieldCheck size={16} color="#c0392b" /> Loss Investigation
                Workflow
              </div>
              <div style={{ fontSize: 10.8, color: "#5C6B60", marginTop: 4 }}>
                Start with a risk branch, identify the affected SKU, verify
                movement evidence, then assign the corrective action.
              </div>
            </div>
          </div>
        </div>
      )}

      {isOverviewView && (
        <div
          className="b2b-kpi-grid b2b-overview-kpi-grid"
          style={{ marginBottom: 12 }}
        >
          <B2BMetricCard
            label="FranchiSync Supply Revenue"
            value={fmtAmt(normalizedOverview.hqRevenue)}
            icon={Package}
            tone="green"
            loading={loading}
            onClick={() => openKpi("hqRevenue", "FranchiSync Supply Revenue")}
            note={`${hqMoM == null ? "No prior-month baseline" : `${hqMoM >= 0 ? "+" : ""}${hqMoM.toFixed(1)}% vs last month`} · fulfilled/delivered HQ orders`}
          />
          <B2BMetricCard
            label="Franchisee POS Revenue"
            value={fmtAmt(normalizedOverview.posRevenue)}
            icon={ShoppingCart}
            tone="blue"
            loading={loading}
            onClick={() => openKpi("posRevenue", "Franchisee POS Revenue")}
            note={`${posMoM == null ? "No prior-month baseline" : `${posMoM >= 0 ? "+" : ""}${posMoM.toFixed(1)}% vs last month`} · paid/completed POS`}
          />
        </div>
      )}

      {isGhostView && normalizedOverview.coverage != null && (
        <div className="b2b-kpi-grid" style={{ marginBottom: 15 }}>
          {normalizedOverview.coverage != null && (
            <B2BMetricCard
              label="HQ Order Coverage"
              value={
                normalizedOverview.coverage == null
                  ? "—"
                  : `${normalizedOverview.coverage.toFixed(1)}%`
              }
              icon={ShieldCheck}
              tone={
                normalizedOverview.coverage != null &&
                normalizedOverview.coverage < 70
                  ? "red"
                  : "green"
              }
              loading={loading}
              onClick={() => openKpi("coverage", "HQ Order Coverage")}
              note={
                normalizedOverview.coverage == null
                  ? "Requires authorized stock movement evidence"
                  : "Authorized HQ stock coverage of reported sell-through"
              }
            />
          )}
        </div>
      )}

      {isOverviewView && (
        <div style={{ ...sectionCard, marginBottom: 15 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#12241B" }}>
                6-Month Supply Revenue vs POS Revenue
              </div>
              <div
                style={{
                  fontSize: 10.8,
                  color: "#5C6B60",
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                Green is FranchiSync supply revenue, blue is franchisee POS
                revenue, and the dashed line is the HQ target. If POS stays high
                while supply revenue falls, inspect the affected branch. Click a
                month to focus the dashboard.
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: "#5C6B60", fontWeight: 700 }}>
              {b2bMonthLabel(month)}
            </div>
          </div>
          <B2BDualTrendChart
            data={trendData}
            onPointClick={(d) => {
              if (d?.month) setMonth(d.month);
            }}
          />
        </div>
      )}

      {isGhostView && (
        <div
          className="b2b-two-col"
          style={{ marginBottom: 15, gridTemplateColumns: "1fr" }}
        >
          <div style={sectionCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 15, fontWeight: 800, color: "#12241B" }}
                >
                  Loss Risk by Branch
                </div>
                <div style={{ fontSize: 10.8, color: "#5C6B60", marginTop: 3 }}>
                  Highest HQ supply revenue first, then POS revenue. Click a
                  branch for evidence.
                </div>
              </div>
              <span
                style={{ fontSize: 10.5, fontWeight: 800, color: "#3b791e" }}
              >
                {sortedBranchRows.length} branches
              </span>
            </div>
            <div style={tableWrap}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 760,
                }}
              >
                <thead>
                  <tr>
                    {["Branch / Brand", "HQ Supply", "POS Revenue", "Risk"].map(
                      (h, i) => (
                        <th
                          key={h}
                          style={{
                            ...th,
                            textAlign: i === 0 ? "left" : "right",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedBranchRows.length ? (
                    sortedBranchRows.map((r, i) => (
                      <tr
                        key={r.id}
                        onClick={() => openBranch(r)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openBranch(r);
                          }
                        }}
                        aria-label={`View ${r.brand} ${r.branch} details`}
                        style={{
                          cursor: "pointer",
                          background: i % 2 ? "#FBFDF9" : "#fff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F4F8F0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 ? "#FBFDF9" : "#fff")
                        }
                      >
                        <td style={{ ...td, color: "#12241B" }}>
                          <div style={{ fontWeight: 850 }}>{r.branch}</div>
                          <div
                            style={{
                              fontSize: 9.5,
                              fontWeight: 650,
                              color: "#5C6B60",
                              marginTop: 3,
                            }}
                          >
                            {r.brand || "Brand not set"}
                          </div>
                        </td>
                        <td
                          style={{
                            ...td,
                            textAlign: "right",
                            fontWeight: 800,
                            color: "#3b791e",
                          }}
                        >
                          {fmtAmt(r.hqRevenue)}
                        </td>
                        <td
                          style={{
                            ...td,
                            textAlign: "right",
                            fontWeight: 800,
                            color: "#2563eb",
                          }}
                        >
                          {fmtAmt(r.posRevenue)}
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <B2BRiskBadge risk={r.risk} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: 28,
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: 11.5,
                        }}
                      >
                        No branch risk data for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...sectionCard, display: "none" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#12241B" }}>
              Store Location View
            </div>
            <div
              style={{
                fontSize: 10.8,
                color: "#5C6B60",
                marginTop: 3,
                marginBottom: 13,
              }}
            >
              Fast location scan · click a store to open branch detail
            </div>
            <div
              style={{
                display: "grid",
                gap: 8,
                maxHeight: 390,
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {sortedBranchRows.length ? (
                sortedBranchRows.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => openBranch(r)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 11px",
                      border: "1px solid #E7EEE4",
                      borderRadius: 11,
                      background: i % 2 ? "#FBFDF9" : "#fff",
                      cursor: "pointer",
                      fontFamily: FONT,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        minWidth: 0,
                      }}
                    >
                      <MapPin
                        size={14}
                        color="#3b791e"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#12241B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.branch}
                        </div>
                        <div
                          style={{
                            fontSize: 9.5,
                            color: "#8A9687",
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.brand || "Brand not set"}
                        </div>
                      </div>
                    </div>
                    <B2BRiskBadge risk={r.risk} />
                  </button>
                ))
              ) : (
                <DashboardEmptyState message="No store locations available." />
              )}
            </div>
          </div>
        </div>
      )}

      {drilldown && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(18,36,27,.58)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="ad-detail-dialog"
            ref={detailRef}
            role="dialog"
            aria-modal="true"
            aria-label={drilldown.title}
            tabIndex={-1}
            style={{
              width: "min(940px,96vw)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #DDE8DA",
              boxShadow: "0 30px 80px rgba(18,36,27,.28)",
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#fff",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: "17px 20px",
                borderBottom: "1px solid #E7EEE4",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: "#5C6B60",
                  }}
                >
                  {drilldown.type} detail · {b2bMonthLabel(month)}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 850,
                    color: "#12241B",
                    marginTop: 3,
                  }}
                >
                  {drilldown.title}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={backDetail}
                  style={{
                    ...btnSt,
                    height: 34,
                    minHeight: 34,
                    padding: "6px 10px",
                    fontSize: 11,
                    borderRadius: 8,
                  }}
                >
                  Back
                </button>
                <button
                  aria-label="Close details"
                  onClick={closeDetail}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    border: "1px solid #E1E6D8",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#5C6B60",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {drilldown.loading ? (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#5C6B60" }}
                >
                  <RefreshCw
                    size={22}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                  <div style={{ marginTop: 8, fontSize: 11.5 }}>
                    Loading drilldown evidence…
                  </div>
                </div>
              ) : (
                <>
                  {drilldown.warning && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        color: "#92400e",
                        fontSize: 10.8,
                        lineHeight: 1.5,
                      }}
                    >
                      {drilldown.warning}
                    </div>
                  )}
                  {drilldown.type === "branch" && (
                    <div>
                      <div
                        className="b2b-kpi-grid"
                        style={{
                          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                          marginBottom: 14,
                        }}
                      >
                        <B2BMetricCard
                          label="HQ Supply Revenue"
                          value={fmtAmt(
                            b2bNullableNum(
                              drilldown.data?.hq_supply_revenue,
                              drilldown.data?.hqRevenue,
                            ) ?? 0,
                          )}
                          icon={Package}
                          note="Open complete HQ breakdown"
                          onClick={() =>
                            openKpi("hqRevenue", "HQ Supply Revenue")
                          }
                        />
                        <B2BMetricCard
                          label="POS Revenue"
                          value={fmtAmt(
                            b2bNullableNum(
                              drilldown.data?.pos_revenue,
                              drilldown.data?.posRevenue,
                            ) ?? 0,
                          )}
                          icon={ShoppingCart}
                          tone="blue"
                          note="Open complete POS breakdown"
                          onClick={() => openKpi("posRevenue", "POS Revenue")}
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <div style={sectionCard}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#12241B",
                              marginBottom: 8,
                            }}
                          >
                            Branch assessment
                          </div>
                          <div
                            style={{
                              fontSize: 10.8,
                              color: "#5C6B60",
                              lineHeight: 1.6,
                            }}
                          >
                            {drilldown.data?.reason ||
                              drilldown.data?.risk_reason ||
                              "No anomaly explanation was returned for this branch."}
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <B2BRiskBadge
                              risk={
                                drilldown.data?.risk ||
                                drilldown.data?.risk_status
                              }
                            />
                          </div>
                        </div>
                        <div style={sectionCard}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#12241B",
                              marginBottom: 8,
                            }}
                          >
                            Branch context
                          </div>
                          <div
                            style={{
                              fontSize: 10.8,
                              color: "#5C6B60",
                              lineHeight: 1.6,
                            }}
                          >
                            Branch:{" "}
                            <b>{drilldown.data?.branch || drilldown.title}</b>
                            <br />
                            Brand:{" "}
                            <b>{drilldown.data?.brand || "Unassigned Brand"}</b>
                            <br />
                            Location: <b>{drilldown.data?.location || "—"}</b>
                            <br />
                            Selected month: <b>{b2bMonthLabel(month)}</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {drilldown.type === "brand" && (
                    <div>
                      <div
                        className="b2b-kpi-grid"
                        style={{
                          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                          marginBottom: 14,
                        }}
                      >
                        <B2BMetricCard
                          label="HQ Supply Revenue"
                          value={fmtAmt(
                            b2bNullableNum(
                              drilldown.data?.hq_supply_revenue,
                              drilldown.data?.hqRevenue,
                            ) ?? 0,
                          )}
                          icon={Package}
                          note="Open complete HQ breakdown"
                          onClick={() =>
                            openKpi("hqRevenue", "HQ Supply Revenue")
                          }
                        />
                        <B2BMetricCard
                          label="POS Revenue"
                          value={fmtAmt(
                            b2bNullableNum(
                              drilldown.data?.pos_revenue,
                              drilldown.data?.posRevenue,
                            ) ?? 0,
                          )}
                          icon={ShoppingCart}
                          tone="blue"
                          note="Open complete POS breakdown"
                          onClick={() => openKpi("posRevenue", "POS Revenue")}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 10.8,
                          color: "#5C6B60",
                          lineHeight: 1.6,
                        }}
                      >
                        Click an SKU in the ghost stock evidence table for
                        opening stock, HQ receipts, POS deductions, disposal,
                        manual adjustment, closing stock and variance evidence.
                      </div>
                    </div>
                  )}
                  {drilldown.type === "sku" && (
                    <div>
                      <div style={tableWrap}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 860,
                          }}
                        >
                          <thead>
                            <tr>
                              <th style={{ ...th, textAlign: "left" }}>
                                Product / Brand
                              </th>
                              {[
                                "Opening",
                                "HQ Receipts",
                                "POS Sold",
                                "Disposal / Waste",
                                "Transfer In",
                                "Transfer Out",
                                "Recorded Closing",
                                "Variance",
                              ].map((h) => (
                                <th
                                  key={h}
                                  style={{ ...th, textAlign: "right" }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ ...td, textAlign: "left" }}>
                                <b>
                                  {drilldown.data?.product ||
                                    drilldown.data?.sku ||
                                    "SKU"}
                                </b>
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "#5C6B60",
                                    marginTop: 2,
                                  }}
                                >
                                  {drilldown.data?.brand || "Brand not set"}
                                  {drilldown.data?.branch
                                    ? ` · ${drilldown.data.branch}`
                                    : ""}
                                </div>
                              </td>
                              <td style={{ ...td, textAlign: "right" }}>
                                {b2bNullableNum(
                                  drilldown.data?.opening_stock,
                                  drilldown.data?.openingStock,
                                ) == null
                                  ? "—"
                                  : b2bNullableNum(
                                      drilldown.data?.opening_stock,
                                      drilldown.data?.openingStock,
                                    ).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  ...td,
                                  textAlign: "right",
                                  fontWeight: 800,
                                  color: "#3b791e",
                                }}
                              >
                                {b2bNum(
                                  drilldown.data?.hq_received,
                                  drilldown.data?.received_qty,
                                  drilldown.data?.suppliedQty,
                                ).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  ...td,
                                  textAlign: "right",
                                  fontWeight: 800,
                                  color: "#2563eb",
                                }}
                              >
                                {b2bNum(
                                  drilldown.data?.pos_sold,
                                  drilldown.data?.sold_qty,
                                  drilldown.data?.soldQty,
                                ).toLocaleString()}
                              </td>
                              <td style={{ ...td, textAlign: "right" }}>
                                {b2bNullableNum(
                                  drilldown.data?.disposal,
                                  drilldown.data?.waste,
                                ) == null
                                  ? "—"
                                  : b2bNum(
                                      drilldown.data?.disposal,
                                      drilldown.data?.waste,
                                    ).toLocaleString()}
                              </td>
                              <td style={{ ...td, textAlign: "right" }}>
                                {b2bNullableNum(drilldown.data?.transfer_in) ==
                                null
                                  ? "—"
                                  : b2bNum(
                                      drilldown.data?.transfer_in,
                                    ).toLocaleString()}
                              </td>
                              <td style={{ ...td, textAlign: "right" }}>
                                {b2bNullableNum(drilldown.data?.transfer_out) ==
                                null
                                  ? "—"
                                  : b2bNum(
                                      drilldown.data?.transfer_out,
                                    ).toLocaleString()}
                              </td>
                              <td style={{ ...td, textAlign: "right" }}>
                                {b2bNullableNum(
                                  drilldown.data?.closing_stock,
                                  drilldown.data?.endingStock,
                                ) == null
                                  ? "—"
                                  : b2bNullableNum(
                                      drilldown.data?.closing_stock,
                                      drilldown.data?.endingStock,
                                    ).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  ...td,
                                  textAlign: "right",
                                  fontWeight: 800,
                                  color: "#c0392b",
                                }}
                              >
                                {b2bNullableNum(
                                  drilldown.data?.variance,
                                  drilldown.data?.stockVariance,
                                ) == null
                                  ? "—"
                                  : b2bNullableNum(
                                      drilldown.data?.variance,
                                      drilldown.data?.stockVariance,
                                    ).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 10.5,
                          color: "#5C6B60",
                          lineHeight: 1.55,
                        }}
                      >
                        Evidence endpoint should also return linked Mobile Order
                        references, POS transactions, inventory movements,
                        source/reference IDs, user/reason for manual
                        adjustments, and before/after quantities.
                      </div>
                    </div>
                  )}
                  {drilldown.type === "sku" &&
                    Array.isArray(drilldown.data?.ingredients) && (
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 850,
                            color: "#12241B",
                            marginBottom: 4,
                          }}
                        >
                          Specific ingredients for this product
                        </div>
                        <div
                          style={{
                            fontSize: 10.2,
                            color: "#5C6B60",
                            lineHeight: 1.5,
                            marginBottom: 9,
                          }}
                        >
                          {drilldown.data?.brand || "Brand not set"} ·{" "}
                          {drilldown.data?.branch || "Branch not set"} ·{" "}
                          {drilldown.data?.product ||
                            drilldown.data?.sku ||
                            "Product"}
                        </div>
                        <div style={tableWrap}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              minWidth: 760,
                            }}
                          >
                            <thead>
                              <tr>
                                {[
                                  "Ingredient",
                                  "Required usage",
                                  "HQ received",
                                  "Current stock",
                                  "Unit",
                                  "Variance",
                                ].map((label, index) => (
                                  <th
                                    key={label}
                                    style={{
                                      ...th,
                                      textAlign: index === 0 ? "left" : "right",
                                    }}
                                  >
                                    {label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {drilldown.data.ingredients.length ? (
                                [...drilldown.data.ingredients]
                                  .sort((a, b) =>
                                    String(
                                      a?.ingredient_name || "",
                                    ).localeCompare(
                                      String(b?.ingredient_name || ""),
                                    ),
                                  )
                                  .map((ingredient, index) => (
                                    <tr
                                      key={
                                        ingredient?.ingredient_id ??
                                        `${ingredient?.ingredient_name}-${index}`
                                      }
                                      style={{
                                        background:
                                          index % 2 ? "#FBFDF9" : "#fff",
                                      }}
                                    >
                                      <td
                                        style={{
                                          ...td,
                                          textAlign: "left",
                                          fontWeight: 800,
                                          color: "#12241B",
                                        }}
                                      >
                                        {ingredient?.ingredient_name ||
                                          "Unnamed ingredient"}
                                      </td>
                                      <td
                                        style={{
                                          ...td,
                                          textAlign: "right",
                                          fontWeight: 800,
                                          color: "#2563eb",
                                        }}
                                      >
                                        {b2bNum(
                                          ingredient?.expected_pos_usage,
                                        ).toLocaleString()}
                                      </td>
                                      <td
                                        style={{
                                          ...td,
                                          textAlign: "right",
                                          fontWeight: 800,
                                          color: "#3b791e",
                                        }}
                                      >
                                        {b2bNum(
                                          ingredient?.hq_received,
                                        ).toLocaleString()}
                                      </td>
                                      <td style={{ ...td, textAlign: "right" }}>
                                        {b2bNullableNum(
                                          ingredient?.closing_stock,
                                        ) == null
                                          ? "—"
                                          : b2bNum(
                                              ingredient?.closing_stock,
                                            ).toLocaleString()}
                                      </td>
                                      <td style={{ ...td, textAlign: "right" }}>
                                        {ingredient?.unit || "—"}
                                      </td>
                                      <td
                                        style={{
                                          ...td,
                                          textAlign: "right",
                                          fontWeight: 800,
                                          color:
                                            b2bNullableNum(
                                              ingredient?.variance,
                                            ) == null
                                              ? "#94a3b8"
                                              : "#c0392b",
                                        }}
                                      >
                                        {b2bNullableNum(ingredient?.variance) ==
                                        null
                                          ? "—"
                                          : b2bNum(
                                              ingredient?.variance,
                                            ).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="6"
                                    style={{
                                      padding: 24,
                                      textAlign: "center",
                                      color: "#94a3b8",
                                      fontSize: 10.8,
                                    }}
                                  >
                                    No recipe ingredients are linked to this
                                    product for this brand and branch.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div
                          style={{
                            marginTop: 9,
                            fontSize: 9.8,
                            color: "#82907F",
                            lineHeight: 1.5,
                          }}
                        >
                          Required usage = POS units sold × recipe quantity.
                          Ingredient rows are restricted to the selected
                          product’s exact brand and branch.
                        </div>
                      </div>
                    )}
                  {drilldown.type === "kpi" && (
                    <B2BKpiBreakdown
                      key={`${drilldown.data?.metric}-${drilldown.data?.scopeBrand}-${drilldown.data?.scopeBranch}`}
                      metric={drilldown.data?.metric}
                      initialSelected={drilldown.data?.selectedOrders || null}
                      user={user}
                      api={API}
                      orders={rawOrders}
                      ordersReady={ordersReady}
                      initialBrand={drilldown.data?.scopeBrand || ""}
                      initialBranch={drilldown.data?.scopeBranch || ""}
                      overview={normalizedOverview}
                      branchRows={sortedBranchRows}
                      brandRows={brandRows}
                      skuRows={skuRows}
                      productRows={productEvidenceRows}
                      anomalies={anomalies}
                      month={month}
                      growthTargetPct={growthTargetPct}
                      onOpenBranch={openBranch}
                      onOpenBrand={openBrand}
                      onOpenSku={openSku}
                    />
                  )}
                  {drilldown.type === "anomaly" && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#5C6B60",
                        lineHeight: 1.65,
                      }}
                    >
                      <B2BRiskBadge risk={drilldown.data?.severity} />
                      <div style={{ marginTop: 12 }}>
                        <b>Reason:</b> {drilldown.data?.reason}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <b>Recommended action:</b>{" "}
                        {drilldown.data?.recommendation}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OperationalKpiBreakdownModal({
  detail,
  onClose,
  overview,
  branchRows = [],
  rangeLabel,
  filterLabel,
}) {
  if (!detail) return null;
  const id = detail.id;
  const rows = [...branchRows].sort((a, b) => {
    if (id === "transactions")
      return Number(b.transactions || 0) - Number(a.transactions || 0);
    if (id === "averageSale")
      return Number(b.avgOrder || 0) - Number(a.avgOrder || 0);
    return Number(b.revenue || 0) - Number(a.revenue || 0);
  });
  const totalRevenue = Number(overview?.revenue || 0);
  const totalTransactions = Number(overview?.transactions || 0);
  const averageSale = Number(overview?.averageSale || 0);
  const activeBranches = Number(overview?.activeBranches || 0);
  const summaryCards = [
    [
      "Revenue",
      fmtAmt(totalRevenue),
      TrendingUp,
      "green",
      "Actual selected-period sales",
    ],
    [
      "Transactions",
      totalTransactions.toLocaleString(),
      ShoppingCart,
      "blue",
      "Completed sales records",
    ],
    [
      "Average Sale",
      fmtAmt(averageSale),
      BarChart2,
      "amber",
      "Revenue per transaction",
    ],
    [
      "Active Branches",
      activeBranches.toLocaleString(),
      Store,
      "green",
      "Branches with recorded sales",
    ],
  ];
  const descriptions = {
    revenue:
      "Actual POS revenue split by branch, including available cost and margin evidence.",
    transactions: "Completed POS transaction volume split by branch.",
    averageSale:
      "Average transaction value by branch, with volume and revenue context.",
    activeBranches:
      "All branches with sales activity inside the current dashboard scope.",
  };
  const columns =
    id === "transactions"
      ? [
          [
            "Branch / Brand",
            "left",
            (r) => (
              <>
                <b>{r.branch}</b>
                <div style={{ fontSize: 9, color: "#5C6B60", marginTop: 2 }}>
                  {r.brand || "Unassigned Brand"}
                </div>
              </>
            ),
          ],
          [
            "Transactions",
            "right",
            (r) => Number(r.transactions || 0).toLocaleString(),
          ],
          ["Average Sale", "right", (r) => fmtAmt(r.avgOrder)],
          ["Revenue", "right", (r) => fmtAmt(r.revenue)],
        ]
      : id === "averageSale"
        ? [
            [
              "Branch / Brand",
              "left",
              (r) => (
                <>
                  <b>{r.branch}</b>
                  <div style={{ fontSize: 9, color: "#5C6B60", marginTop: 2 }}>
                    {r.brand || "Unassigned Brand"}
                  </div>
                </>
              ),
            ],
            ["Average Sale", "right", (r) => fmtAmt(r.avgOrder)],
            [
              "Transactions",
              "right",
              (r) => Number(r.transactions || 0).toLocaleString(),
            ],
            ["Revenue", "right", (r) => fmtAmt(r.revenue)],
          ]
        : id === "activeBranches"
          ? [
              [
                "Branch / Brand",
                "left",
                (r) => (
                  <>
                    <b>{r.branch}</b>
                    <div
                      style={{ fontSize: 9, color: "#5C6B60", marginTop: 2 }}
                    >
                      {r.brand || "Unassigned Brand"}
                    </div>
                  </>
                ),
              ],
              ["Revenue", "right", (r) => fmtAmt(r.revenue)],
              [
                "Transactions",
                "right",
                (r) => Number(r.transactions || 0).toLocaleString(),
              ],
              ["Avg. Sale", "right", (r) => fmtAmt(r.avgOrder)],
              [
                "Margin",
                "right",
                (r) =>
                  r.hasCogs
                    ? `${Number(r.margin || 0).toFixed(1)}%`
                    : "No COGS",
              ],
            ]
          : [
              [
                "Branch / Brand",
                "left",
                (r) => (
                  <>
                    <b>{r.branch}</b>
                    <div
                      style={{ fontSize: 9, color: "#5C6B60", marginTop: 2 }}
                    >
                      {r.brand || "Unassigned Brand"}
                    </div>
                  </>
                ),
              ],
              ["Revenue", "right", (r) => fmtAmt(r.revenue)],
              [
                "Revenue Share",
                "right",
                (r) =>
                  totalRevenue > 0
                    ? `${((Number(r.revenue || 0) / totalRevenue) * 100).toFixed(1)}%`
                    : "—",
              ],
              [
                "Gross Profit",
                "right",
                (r) => (r.hasCogs ? fmtAmt(r.grossProfit) : "No COGS"),
              ],
              [
                "Margin",
                "right",
                (r) =>
                  r.hasCogs ? `${Number(r.margin || 0).toFixed(1)}%` : "—",
              ],
            ];
  const th = {
    padding: "10px 11px",
    fontSize: 9.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    color: "#71806F",
    background: "#F6FAF3",
    borderBottom: "1px solid #DDE8DA",
    whiteSpace: "nowrap",
  };
  const td = {
    padding: "11px",
    fontSize: 10.8,
    color: "#334155",
    borderBottom: "1px solid #EEF3EC",
  };
  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5100,
        background: "rgba(18,36,27,.58)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(940px,96vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #DDE8DA",
          boxShadow: "0 30px 80px rgba(18,36,27,.28)",
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "#fff",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "17px 20px",
            borderBottom: "1px solid #E7EEE4",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                color: "#5C6B60",
              }}
            >
              Operational KPI detail · {rangeLabel}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 850,
                color: "#12241B",
                marginTop: 3,
              }}
            >
              {detail.label} Breakdown
            </div>
            <div style={{ fontSize: 10.5, color: "#71806F", marginTop: 3 }}>
              {filterLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "1px solid #E1E6D8",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#5C6B60",
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "#F6FAF3",
              border: "1px solid #DDE8DA",
              fontSize: 10.8,
              color: "#5C6B60",
              lineHeight: 1.55,
              marginBottom: 13,
            }}
          >
            {descriptions[id] || descriptions.revenue} Values remain scoped to
            the active date, brand, and branch filters.
          </div>
          <div
            className="b2b-kpi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
              gap: 12,
              marginBottom: 14,
            }}
          >
            {summaryCards.map(([label, value, Icon, tone, note]) => (
              <B2BMetricCard
                key={label}
                label={label}
                value={value}
                icon={Icon}
                tone={tone}
                note={note}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 850,
              color: "#12241B",
              marginBottom: 8,
            }}
          >
            Branch breakdown
          </div>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #E7EEE4",
              borderRadius: 13,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 720,
              }}
            >
              <thead>
                <tr>
                  {columns.map(([label, align]) => (
                    <th key={label} style={{ ...th, textAlign: align }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row, index) => (
                    <tr
                      key={row.branch || index}
                      style={{ background: index % 2 ? "#FBFDF9" : "#fff" }}
                    >
                      {columns.map(([label, align, render]) => (
                        <td key={label} style={{ ...td, textAlign: align }}>
                          {render(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        padding: 28,
                        textAlign: "center",
                        fontSize: 10.8,
                        color: "#82907F",
                      }}
                    >
                      No branch evidence is available for this KPI and filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesDashboardContent({
  transactions,
  brands: propBrands = [],
  user,
}) {
  const today = new Date();

  const [rangeMode, setRangeMode] = useState("preset");
  const [preset, setPreset] = useState("month");
  const [customFrom, setCustomFrom] = useState(
    fmt8(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [customTo, setCustomTo] = useState(fmt8(today));
  const [appliedRange, setAppliedRange] = useState(null);
  const [archives, setArchives] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dashboardArchives") || "[]");
    } catch {
      return [];
    }
  });
  const [showArchive, setShowArchive] = useState(false);
  const [viewArchive, setViewArchive] = useState(null);
  const [archiveYear, setArchiveYear] = useState(String(today.getFullYear()));

  const [filterBrand, setFilterBrand] = useState(null);
  const [filterBranch, setFilterBranch] = useState(null);
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const [branchDropOpen, setBranchDropOpen] = useState(false);
  const [brandQ, setBrandQ] = useState("");
  const [branchQ, setBranchQ] = useState("");
  const brandRef = useRef(null);
  const branchRef = useRef(null);
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  const [applyingRange, setApplyingRange] = useState(false);

  const [infoModal, setInfoModal] = useState(null);
  const showInfo = (opts) => setInfoModal(opts);
  const closeInfo = () => setInfoModal(null);

  const [toast, setToast] = useState(null);

  const [hiddenKpis, setHiddenKpis] = useState({}); // { [index]: true } = hidden
  const [operationalKpiDetail, setOperationalKpiDetail] = useState(null);
  const [analysisTab, setAnalysisTab] = useState("sales");
  const [dashboardTab, setDashboardTab] = useState("overview");

  useEffect(() => {
    const fn = (e) => {
      if (brandRef.current && !brandRef.current.contains(e.target))
        setBrandDropOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target))
        setBranchDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const brandList = propBrands.length > 0 ? propBrands : [];

  // ============================================================
  // BRAND & BRANCH SOURCE OF TRUTH
  // Only show dashboard data that still exists in brands.js
  // ============================================================

  const validBrandBranchMap = useMemo(() => {
    const map = new Map();

    (brandList || []).forEach((brandObj) => {
      const brandName = String(brandObj?.name || "").trim();

      if (!brandName) return;

      (brandObj?.branches || []).forEach((branchObj) => {
        const branchName =
          typeof branchObj === "string"
            ? branchObj.trim()
            : String(branchObj?.name || "").trim();

        if (!branchName) return;

        map.set(branchName.toLowerCase(), {
          brand: brandName,
          branch: branchName,
        });
      });
    });

    return map;
  }, [brandList]);

  const validTransactions = useMemo(() => {
    return (transactions || [])
      .filter((tx) => {
        const branch = String(tx?.branch || "")
          .trim()
          .toLowerCase();

        if (!branch) return false;

        // Branch must currently exist in Brand & Branch
        const official = validBrandBranchMap.get(branch);

        if (!official) return false;

        // If POS has a brand/shop, it must also match the
        // official brand that owns this branch.
        const txBrand = String(
          tx?.shop || tx?.brand || tx?.brand_name || tx?.franchise_brand || "",
        )
          .trim()
          .toLowerCase();

        if (!txBrand) return true;

        const officialBrand = official.brand.toLowerCase();

        // Compatibility for old iPharma naming
        const normalizeBrand = (name) => {
          if (name === "ipharma") return "ipharma mart";
          return name;
        };

        return normalizeBrand(txBrand) === normalizeBrand(officialBrand);
      })
      .map((tx) => {
        const branchKey = String(tx?.branch || "")
          .trim()
          .toLowerCase();

        const official = validBrandBranchMap.get(branchKey);

        // Force dashboard to use official Brand & Branch naming
        return {
          ...tx,
          branch: official?.branch || tx.branch,
          brand: official?.brand || tx.brand,
          shop: official?.brand || tx.shop,
        };
      });
  }, [transactions, validBrandBranchMap]);

  const selectedBrand = brandList.find((b) => b.id === filterBrand);
  const branchList = selectedBrand
    ? (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      )
    : [];
  const filteredBrands = brandList.filter(
    (b) => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()),
  );
  const filteredBranches = branchList.filter(
    (br) => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()),
  );

  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) {
        params.set("from", appliedRange.from);
        params.set("to", appliedRange.to);
      } else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const bn = (selectedBrand.branches || []).map((br) =>
          typeof br === "string" ? br : br.name,
        );
        if (bn.length) params.set("branches", bn.join(","));
      }
      const res = await adminModuleFetch(
        `${ADMIN_API_BASE}/dashboard/stats?${params}`,
      );
      const d = await res.json();
      if (!d.error) setKpiData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setKpiLoading(false);
    }
  }, [
    rangeMode,
    preset,
    appliedRange,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  useEffect(() => {
    if (!viewArchive) fetchKpis();
  }, [fetchKpis, viewArchive]);

  const filterLabel = filterBranch
    ? filterBranch
    : filterBrand
      ? selectedBrand?.name + " – All Branches"
      : "All Brands & Branches";

  const getRangeLabel = () => {
    if (viewArchive) return `Archive: ${viewArchive.year}`;
    if (rangeMode === "custom" && appliedRange)
      return `${appliedRange.from} → ${appliedRange.to}`;
    return (
      {
        day: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
      }[preset] || "This Month"
    );
  };

  const chartData = useMemo(() => {
    if (viewArchive) return viewArchive.chartData;
    let txList = validTransactions;
    if (filterBranch)
      txList = validTransactions.filter((tx) => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      );
      txList = validTransactions.filter((tx) => bn.includes(tx.branch));
    }
    if (!txList.length) return { labels: [], values: [] };
    const now = new Date();
    const isCustom = rangeMode === "custom" && appliedRange;

    const filtered = txList.filter((tx) => {
      const d = new Date(tx.created_at);
      if (isCustom) {
        const f = new Date(appliedRange.from + "T00:00:00");
        const t = new Date(appliedRange.to + "T23:59:59.999");
        return d >= f && d <= t;
      }
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const s = new Date(now);
        s.setDate(now.getDate() - now.getDay());
        s.setHours(0, 0, 0, 0);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      }
      if (preset === "month")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });

    if (isCustom) {
      const from = new Date(appliedRange.from + "T00:00:00");
      const to = new Date(appliedRange.to + "T23:59:59.999");
      const nw = Math.max(1, Math.ceil((to - from) / (7 * 864e5)) + 1);
      const labels = Array.from({ length: nw }, (_, i) => `W${i + 1}`);
      const values = Array(nw).fill(0);
      filtered.forEach((tx) => {
        const wi = Math.min(
          Math.floor((new Date(tx.created_at) - from) / (7 * 864e5)),
          nw - 1,
        );
        values[wi] += tx.total || 0;
      });
      return { labels, values };
    }

    const groupedMap = new Map();
    const addToGroup = (key, label, amount) => {
      const prev = groupedMap.get(key) || { label, sortKey: key, value: 0 };
      prev.value += amount;
      groupedMap.set(key, prev);
    };

    if (preset === "day") {
      filtered.forEach((tx) => {
        const d = new Date(tx.created_at);
        addToGroup(d.getHours(), `${d.getHours()}:00`, Number(tx.total || 0));
      });
    } else if (preset === "week") {
      filtered.forEach((tx) => {
        const d = new Date(tx.created_at);
        addToGroup(
          d.getDay(),
          d.toLocaleDateString("en-US", { weekday: "short" }),
          Number(tx.total || 0),
        );
      });
    } else if (preset === "month") {
      filtered.forEach((tx) => {
        const d = new Date(tx.created_at);
        addToGroup(d.getDate(), `D${d.getDate()}`, Number(tx.total || 0));
      });
    } else if (preset === "year") {
      filtered.forEach((tx) => {
        const d = new Date(tx.created_at);
        addToGroup(
          d.getMonth(),
          d.toLocaleDateString("en-US", { month: "short" }),
          Number(tx.total || 0),
        );
      });
    }

    const sortedGroups = Array.from(groupedMap.values()).sort(
      (a, b) => a.sortKey - b.sortKey,
    );
    const labels = sortedGroups.map((e) => e.label);
    return { labels, values: sortedGroups.map((e) => e.value) };
  }, [
    transactions,
    preset,
    rangeMode,
    appliedRange,
    viewArchive,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  const filteredTransactions = useMemo(() => {
    let txList = validTransactions;
    if (filterBranch)
      txList = validTransactions.filter((tx) => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      );
      txList = validTransactions.filter((tx) => bn.includes(tx.branch));
    }

    const isCustom = rangeMode === "custom" && appliedRange;
    const now = new Date();
    return txList.filter((tx) => {
      const d = new Date(tx.created_at);
      if (isCustom) {
        const from = new Date(appliedRange.from + "T00:00:00");
        const to = new Date(appliedRange.to + "T23:59:59.999");
        return d >= from && d <= to;
      }
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const s = new Date(now);
        s.setDate(now.getDate() - now.getDay());
        s.setHours(0, 0, 0, 0);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      }
      if (preset === "month")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [
    transactions,
    filterBranch,
    filterBrand,
    selectedBrand,
    rangeMode,
    appliedRange,
    preset,
  ]);

  const values = viewArchive
    ? chartData?.values || []
    : kpiData?.revenueSeries?.length
      ? kpiData.revenueSeries
      : chartData.values;
  const chartLabels = viewArchive
    ? chartData?.labels || []
    : kpiData?.revenueSeries?.length
      ? kpiData.revenueLabels
      : chartData.labels;
  const total = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg = useMemo(
    () => (values.length ? Math.round(total / values.length) : 0),
    [total, values.length],
  );
  const peak = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );
  const low = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const peakLabel = values.length ? chartLabels[values.indexOf(peak)] : "—";
  const pctChange =
    values.length > 1 && values[0] > 0
      ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1)
      : "0.0";
  const trending = Number(pctChange) >= 0;

  const actualRevenue = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, tx) => sum + Number(tx.total || tx.total_amount || 0),
        0,
      ),
    [filteredTransactions],
  );
  const transactionCount = viewArchive
    ? Number(viewArchive?.kpis?.transactionCount ?? 0)
    : filteredTransactions.length;
  const averageTransaction = viewArchive
    ? Number(viewArchive?.kpis?.avgOrder ?? viewArchive?.kpis?.avgSales ?? 0)
    : transactionCount
      ? actualRevenue / transactionCount
      : 0;
  const activeBranchCount = viewArchive
    ? Number(viewArchive?.kpis?.activeBranchCount ?? 0)
    : new Set(filteredTransactions.map((tx) => tx.branch).filter(Boolean)).size;

  const transactionCountSeries = useMemo(() => {
    if (viewArchive || !chartLabels.length) return [];
    const counts = Object.fromEntries(chartLabels.map((label) => [label, 0]));
    const now = new Date();
    const isCustom = rangeMode === "custom" && appliedRange;
    let customFromDate = null;
    if (isCustom) customFromDate = new Date(appliedRange.from + "T00:00:00");

    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      let label;
      if (isCustom) {
        const wi = Math.max(0, Math.floor((d - customFromDate) / (7 * 864e5)));
        label = `W${wi + 1}`;
      } else if (preset === "day") label = `${d.getHours()}:00`;
      else if (preset === "week")
        label = d.toLocaleDateString("en-US", { weekday: "short" });
      else if (preset === "month") label = `D${d.getDate()}`;
      else if (preset === "year")
        label = d.toLocaleDateString("en-US", { month: "short" });
      if (label in counts) counts[label] += 1;
    });
    return chartLabels.map((label) => counts[label] || 0);
  }, [
    filteredTransactions,
    chartLabels,
    preset,
    rangeMode,
    appliedRange,
    viewArchive,
  ]);

  const branchPerformance = useMemo(() => {
    if (viewArchive) return [];

    const grouped = {};

    filteredTransactions.forEach((tx) => {
      const branch = String(tx?.branch || "Unassigned").trim() || "Unassigned";

      // POS transactions store the brand in `shop`
      let brand = String(
        tx?.shop || tx?.brand || tx?.brand_name || tx?.franchise_brand || "",
      ).trim();

      // Normalize brand names
      if (brand.toLowerCase() === "ipharma") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "ipharma mart") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "coffee spot") {
        brand = "Coffee Spot";
      } else if (brand.toLowerCase() === "ifuel") {
        brand = "iFuel";
      }

      if (!brand) {
        brand = "Unassigned Brand";
      }

      const key = `${brand}::${branch}`;

      grouped[key] =
        (grouped[key] || 0) + Number(tx?.total ?? tx?.total_amount ?? 0);
    });

    return Object.entries(grouped)
      .map(([key, value]) => {
        const [brand, branch] = key.split("::");

        return {
          label: `${branch} · ${brand}`,
          value,
          branch,
          brand,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, viewArchive]);

  const branchProfitability = useMemo(() => {
    if (viewArchive) return [];

    const grouped = {};

    filteredTransactions.forEach((tx) => {
      const branch = String(tx?.branch || "Unassigned").trim() || "Unassigned";
      let brand = String(
        tx?.shop || tx?.brand || tx?.brand_name || tx?.franchise_brand || "",
      ).trim();

      if (brand.toLowerCase() === "ipharma") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "ipharma mart") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "coffee spot") {
        brand = "Coffee Spot";
      } else if (brand.toLowerCase() === "ifuel") {
        brand = "iFuel";
      }

      if (!brand) {
        brand = "Unassigned Brand";
      }
      const groupKey = `${brand}::${branch}`;
      const revenue =
        Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;

      let cogs = Number(
        tx?.cogs ??
          tx?.total_cogs ??
          tx?.cost_of_goods ??
          tx?.cost_of_goods_sold ??
          0,
      );

      if (!Number.isFinite(cogs)) cogs = 0;

      if (cogs === 0) {
        let items = tx?.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }

        if (Array.isArray(items)) {
          const itemCogs = items.reduce((sum, item) => {
            const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
            const unitCost =
              Number(
                item?.cost ??
                  item?.unit_cost ??
                  item?.unitCost ??
                  item?.purchase_cost ??
                  0,
              ) || 0;
            const lineCogs =
              Number(item?.cogs ?? item?.total_cost ?? item?.cost_total ?? 0) ||
              0;

            return sum + (lineCogs > 0 ? lineCogs : unitCost * qty);
          }, 0);

          if (itemCogs > 0) cogs = itemCogs;
        }
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          branch,
          brand,
          revenue: 0,
          cogs: 0,
          transactions: 0,
          hasCogs: false,
        };
      }

      grouped[groupKey].revenue += revenue;
      grouped[groupKey].cogs += cogs;
      grouped[groupKey].transactions += 1;

      if (
        cogs > 0 ||
        tx?.cogs != null ||
        tx?.total_cogs != null ||
        tx?.cost_of_goods != null ||
        tx?.cost_of_goods_sold != null
      ) {
        grouped[groupKey].hasCogs = true;
      }
    });

    return Object.values(grouped)
      .map((row) => {
        const grossProfit = row.revenue - row.cogs;
        const margin = row.revenue > 0 ? (grossProfit / row.revenue) * 100 : 0;
        const avgOrder =
          row.transactions > 0 ? row.revenue / row.transactions : 0;

        return { ...row, grossProfit, margin, avgOrder };
      })
      .sort((a, b) => b.grossProfit - a.grossProfit || b.revenue - a.revenue);
  }, [filteredTransactions, viewArchive]);

  const brandPerformance = useMemo(() => {
    if (viewArchive) return [];

    const grouped = {};

    filteredTransactions.forEach((tx) => {
      let brand = String(
        tx?.shop || tx?.brand || tx?.brand_name || tx?.franchise_brand || "",
      ).trim();

      if (brand.toLowerCase() === "ipharma") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "ipharma mart") {
        brand = "iPharma Mart";
      } else if (brand.toLowerCase() === "coffee spot") {
        brand = "Coffee Spot";
      } else if (brand.toLowerCase() === "ifuel") {
        brand = "iFuel";
      }

      if (!brand) {
        brand = "Unassigned Brand";
      }

      grouped[brand] =
        (grouped[brand] || 0) + Number(tx?.total ?? tx?.total_amount ?? 0);
    });

    return Object.entries(grouped)
      .map(([label, value]) => ({
        label,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, viewArchive]);

  const getTransactionsForArchiveYear = (year) => {
    let txList = validTransactions;
    if (filterBranch)
      txList = validTransactions.filter((tx) => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const branchNames = (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      );
      txList = validTransactions.filter((tx) =>
        branchNames.includes(tx.branch),
      );
    }
    return txList.filter((tx) => {
      const d = new Date(tx.created_at);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === year;
    });
  };

  const buildArchiveSnapshot = (year, yearTransactions) => {
    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyValues = Array(12).fill(0);

    yearTransactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (Number.isNaN(d.getTime())) return;
      monthlyValues[d.getMonth()] += Number(tx.total || tx.total_amount || 0);
    });

    const revenue = monthlyValues.reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
    const transactionCount = yearTransactions.length;
    const averageOrder = transactionCount ? revenue / transactionCount : 0;
    const activeBranches = new Set(
      yearTransactions.map((tx) => tx.branch).filter(Boolean),
    ).size;
    const peakSales = monthlyValues.length ? Math.max(...monthlyValues) : 0;

    return {
      year,
      label: `Full Year ${year}`,
      savedAt: new Date().toLocaleString("en-PH"),
      filterLabel,
      chartData: { labels, values: monthlyValues },
      kpis: {
        totalSales: revenue,
        salesRevenue: revenue,
        avgSales: averageOrder,
        avgOrder: averageOrder,
        peakSales,
        transactionCount,
        activeBranchCount: activeBranches,
      },
    };
  };

  const saveArchive = (snapshot) => {
    const upd = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(upd);
    localStorage.setItem("dashboardArchives", JSON.stringify(upd));
    setArchiveYear(String(snapshot.year));
    showInfo({
      type: "success",
      title: "Archive Saved",
      message: `${snapshot.label} was archived successfully with ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}.`,
    });
  };

  const requestArchiveYear = () => {
    const year = parseInt(archiveYear, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      showInfo({
        type: "warning",
        title: "Invalid Year",
        message: "Enter a valid year from 2000 to 2100.",
      });
      return;
    }
    if (archives.some((a) => Number(a.year) === year)) {
      showInfo({
        type: "warning",
        title: "Already Archived",
        message: `Year ${year} is already archived.`,
      });
      return;
    }

    const yearTransactions = getTransactionsForArchiveYear(year);
    if (yearTransactions.length === 0) {
      showInfo({
        type: "info",
        title: "No Data Found",
        message: `No sales data was found for ${year} under ${filterLabel}. Nothing was archived.`,
      });
      return;
    }

    const snapshot = buildArchiveSnapshot(year, yearTransactions);
    showInfo({
      type: "confirm",
      confirmTone: "success",
      title: `Archive ${year}?`,
      message: `Data found: ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}, ${fmtAmt(snapshot.kpis.totalSales)} revenue, and ${snapshot.kpis.activeBranchCount.toLocaleString()} active branch${snapshot.kpis.activeBranchCount === 1 ? "" : "es"}. Confirm to save this yearly snapshot.`,
      confirmLabel: "Confirm Archive",
      cancelLabel: "Cancel",
      onConfirm: () => saveArchive(snapshot),
    });
  };

  const deleteArchive = (year) => {
    showInfo({
      type: "confirm",
      title: "Delete Archive?",
      message: `Are you sure you want to delete the archive for ${year}? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        const upd = archives.filter((a) => a.year !== year);
        setArchives(upd);
        localStorage.setItem("dashboardArchives", JSON.stringify(upd));
        if (viewArchive?.year === year) setViewArchive(null);
        closeInfo();
      },
    });
  };

  const applyCustomRange = async () => {
    if (!customFrom || !customTo) {
      showInfo({
        type: "warning",
        title: "Missing Dates",
        message: "Please select both a start and end date.",
      });
      return;
    }
    if (customFrom > customTo) {
      showInfo({
        type: "warning",
        title: "Invalid Range",
        message: '"From" cannot be after "To".',
      });
      return;
    }

    let txList = validTransactions;
    if (filterBranch)
      txList = validTransactions.filter((tx) => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      );
      txList = validTransactions.filter((tx) => bn.includes(tx.branch));
    }

    const from = new Date(customFrom + "T00:00:00");
    const to = new Date(customTo + "T23:59:59.999");

    const hasData = txList.some((tx) => {
      const d = new Date(tx.created_at);
      return d >= from && d <= to;
    });

    if (!hasData) {
      showInfo({
        type: "error",
        title: "No Data Found",
        message: `No data found for the selected date range (${customFrom} → ${customTo})${filterLabel !== "All Brands & Branches" ? ` — ${filterLabel}` : ""}. Please choose a different date range.`,
      });
      return;
    }

    setApplyingRange(true);
    try {
      setRangeMode("custom");
      setAppliedRange({ from: customFrom, to: customTo });
      setViewArchive(null);

      // Fetch KPIs for this exact range right now, so the button reflects real completion
      setKpiLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("from", customFrom);
        params.set("to", customTo);
        if (filterBranch) params.set("branch", filterBranch);
        else if (filterBrand && selectedBrand) {
          const bn = (selectedBrand.branches || []).map((br) =>
            typeof br === "string" ? br : br.name,
          );
          if (bn.length) params.set("branches", bn.join(","));
        }
        const res = await adminModuleFetch(
          `${ADMIN_API_BASE}/dashboard/stats?${params}`,
        );
        const d = await res.json();
        if (!d.error) setKpiData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setKpiLoading(false);
      }

      setToast({
        title: "Date Range Applied",
        message: `Showing data from ${customFrom} to ${customTo}.`,
      });
    } finally {
      setApplyingRange(false);
    }
  };

  const filterInputSt = {
    height: 36,
    padding: "0 11px",
    borderRadius: 9,
    border: "1px solid #E1E6D8",
    background: "#f0f5e8",
    fontSize: 13,
    color: "#12241B",
    outline: "none",
    fontFamily: FONT,
    boxSizing: "border-box",
    width: "100%",
  };
  const dropSt = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 400,
    background: "#fff",
    border: "1px solid #E1E6D8",
    borderRadius: 11,
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    maxHeight: 220,
    overflowY: "auto",
  };
  const optSt = (a) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: a ? "#2c5c16" : "#12241B",
    fontWeight: a ? 700 : 500,
    background: a ? "#f0f5e8" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: FONT,
  });
  const tabSt = (a) => ({
    padding: "6px 13px",
    borderRadius: 9,
    border: "none",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT,
    transition: "all .15s",
    background: a ? "linear-gradient(135deg,#3b791e,#3b791e)" : "transparent",
    color: a ? "#fff" : "#5C6B60",
    boxShadow: a ? "0 2px 8px rgba(0,180,90,.35)" : "none",
  });

  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @media(max-width:900px){.qa-dashboard-tabs{grid-template-columns:1fr!important}.qa-dashboard-tabs button{min-height:58px!important}}
        `}</style>

      {/* Archive banner */}
      {viewArchive && (
        <div
          style={{
            background: "linear-gradient(135deg,#12241B,#1a4a2e)",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 20px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: FONT,
            }}
          >
            <Archive size={16} /> Viewing Archive: {viewArchive.year}
            <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>
              — saved {viewArchive.savedAt}
            </span>
          </span>
          <button
            onClick={() => setViewArchive(null)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: FONT,
            }}
          >
            <X size={12} /> Exit Archive View
          </button>
        </div>
      )}

      <div
        className="qa-dashboard-tabs"
        style={{
          background: "#fff",
          border: "1px solid #DCE9DB",
          borderRadius: 16,
          padding: 7,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 7,
          boxShadow: "0 2px 14px rgba(50,109,32,.06)",
        }}
      >
        {[
          {
            id: "overview",
            number: "01",
            label: "Overview",
            question: "What needs attention?",
            icon: Home,
          },
          {
            id: "sales_ai",
            number: "02",
            label: "Sales Trend Analysis",
            question: "How are actual sales changing?",
            icon: LineChart,
          },
          {
            id: "ghost",
            number: "03",
            label: "Ghost Stock / Revenue Leakage",
            question: "Where are losses coming from?",
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const active = dashboardTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setDashboardTab(tab.id);
                if (tab.id !== "sales_ai") setViewArchive(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 10,
                minHeight: 67,
                padding: "11px 13px",
                borderRadius: 12,
                border: `1px solid ${active ? "#A9C982" : "transparent"}`,
                background: active
                  ? "linear-gradient(135deg,#F2F7EB,#EAF3DF)"
                  : "transparent",
                color: active ? "#2c5c16" : "#64748b",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: FONT,
                boxShadow: active
                  ? "inset 0 0 0 1px rgba(59,121,30,.05)"
                  : "none",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "#3b791e" : "#F1F5F2",
                  color: active ? "#fff" : "#71806F",
                }}
              >
                <Icon size={16} />
              </span>
              <span style={{ minWidth: 0, textAlign: "left" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    opacity: 0.72,
                    marginBottom: 2,
                  }}
                >
                  {tab.number}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.4,
                    fontWeight: 850,
                    lineHeight: 1.25,
                  }}
                >
                  {tab.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 9.4,
                    color: active ? "#5C6B60" : "#94a3b8",
                    fontWeight: 650,
                    marginTop: 3,
                    lineHeight: 1.25,
                  }}
                >
                  {tab.question}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Overview and Ghost Stock share the B2B evidence source but render different decisions. */}
      {!viewArchive && (
        <div
          style={{ display: dashboardTab === "sales_ai" ? "none" : "block" }}
        >
          <B2BRevenueAssuranceDashboard
            transactions={transactions}
            brands={propBrands}
            user={user}
            view={dashboardTab === "ghost" ? "ghost" : "overview"}
            onOpenSalesAi={() => setDashboardTab("sales_ai")}
          />
        </div>
      )}

      {!viewArchive && dashboardTab === "ghost" && (
        <SalesVsStockSection
          preset={preset}
          appliedRange={appliedRange}
          rangeMode={rangeMode}
          filterBranch={filterBranch}
          filterBrand={filterBrand}
          selectedBrand={selectedBrand}
          total={total}
          transactions={filteredTransactions}
        />
      )}

      {!viewArchive && dashboardTab === "ghost" && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "17px 18px",
              margin: "0 0 14px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#eff6ff,#f8fbff)",
              border: "1px solid #bfdbfe",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2563eb",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <Brain size={17} />
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 850, color: "#1e3a5f" }}>
                AI Prescriptive Guidance
              </div>
              <div
                style={{
                  fontSize: 10.8,
                  color: "#52627a",
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                Use the detected ghost-stock and revenue-leakage evidence to
                generate prioritized corrective actions for the selected
                branches.
              </div>
            </div>
          </div>
          <PrescriptiveSection
            transactions={filteredTransactions}
            filterLabel={filterLabel}
            preset={preset}
            total={total}
            values={values}
            labels={chartLabels}
            kpiData={kpiData}
            showStockAnomalies={false}
          />
        </div>
      )}

      <div
        style={{
          display: dashboardTab === "sales_ai" ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "4px 0 14px",
            color: "#5C6B60",
          }}
        >
          <div style={{ height: 1, background: "#E1E6D8", flex: 1 }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              whiteSpace: "nowrap",
            }}
          >
            Sales &amp; AI Decision Workspace
          </span>
          <div style={{ height: 1, background: "#E1E6D8", flex: 1 }} />
        </div>

        <OperationalKpiBreakdownModal
          detail={operationalKpiDetail}
          onClose={() => setOperationalKpiDetail(null)}
          overview={{
            revenue: viewArchive
              ? (viewArchive?.kpis?.totalSales ?? total)
              : (kpiData?.salesRevenue ?? actualRevenue),
            transactions: transactionCount,
            averageSale: viewArchive
              ? averageTransaction
              : (kpiData?.avgOrder ?? averageTransaction),
            activeBranches: activeBranchCount,
          }}
          branchRows={branchProfitability}
          rangeLabel={getRangeLabel()}
          filterLabel={filterLabel}
        />

        {/* ── Filter + Date toolbar ── */}
        <div
          style={{
            order: 1,
            background: "#fff",
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 14,
            boxShadow: "0 1px 8px rgba(0,140,60,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {/* Brand dropdown */}
          <div ref={brandRef} style={{ position: "relative", minWidth: 170 }}>
            <div
              onClick={() => {
                setBrandDropOpen((v) => !v);
                setBrandQ("");
              }}
              style={{
                ...filterInputSt,
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                paddingRight: 26,
                userSelect: "none",
                color: filterBrand ? "#12241B" : "#5C6B60",
              }}
            >
              <Globe size={12} color="#3b791e" />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                {selectedBrand ? selectedBrand.name : "All Brands"}
              </span>
              <ChevronDown
                size={10}
                style={{ position: "absolute", right: 8, color: "#5C6B60" }}
              />
            </div>
            {brandDropOpen && (
              <div style={dropSt}>
                <div
                  style={{
                    padding: "6px 8px",
                    borderBottom: "1px solid #E1E6D8",
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={10}
                      style={{
                        position: "absolute",
                        left: 7,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#5C6B60",
                      }}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={brandQ}
                      onChange={(e) => setBrandQ(e.target.value)}
                      placeholder="Search…"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        ...filterInputSt,
                        height: 28,
                        fontSize: 11,
                        paddingLeft: 24,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={optSt(!filterBrand)}
                  onMouseDown={() => {
                    setFilterBrand(null);
                    setFilterBranch(null);
                    setBrandDropOpen(false);
                  }}
                >
                  All Brands
                </div>
                {filteredBrands.map((b) => (
                  <div
                    key={b.id}
                    style={optSt(filterBrand === b.id)}
                    onMouseDown={() => {
                      setFilterBrand(b.id);
                      setFilterBranch(null);
                      setBrandDropOpen(false);
                      setBrandQ("");
                    }}
                  >
                    <Store size={12} color="#3b791e" /> {b.name}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: "#5C6B60",
                      }}
                    >
                      {(b.branches || []).length} branches
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch dropdown */}
          <div
            ref={branchRef}
            style={{
              position: "relative",
              minWidth: 180,
              opacity: filterBrand ? 1 : 0.45,
            }}
          >
            <div
              onClick={() => {
                if (filterBrand) {
                  setBranchDropOpen((v) => !v);
                  setBranchQ("");
                }
              }}
              style={{
                ...filterInputSt,
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: filterBrand ? "pointer" : "not-allowed",
                paddingRight: 26,
                userSelect: "none",
                color: filterBranch ? "#12241B" : "#5C6B60",
              }}
            >
              <Store size={12} color={filterBrand ? "#3b791e" : "#5C6B60"} />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                {filterBranch ||
                  (filterBrand ? "All Branches" : "Select brand first")}
              </span>
              {filterBrand && (
                <ChevronDown
                  size={10}
                  style={{ position: "absolute", right: 8, color: "#5C6B60" }}
                />
              )}
            </div>
            {branchDropOpen && filterBrand && (
              <div style={dropSt}>
                <div
                  style={{
                    padding: "6px 8px",
                    borderBottom: "1px solid #E1E6D8",
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={10}
                      style={{
                        position: "absolute",
                        left: 7,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#5C6B60",
                      }}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={branchQ}
                      onChange={(e) => setBranchQ(e.target.value)}
                      placeholder="Search…"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        ...filterInputSt,
                        height: 28,
                        fontSize: 11,
                        paddingLeft: 24,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={optSt(!filterBranch)}
                  onMouseDown={() => {
                    setFilterBranch(null);
                    setBranchDropOpen(false);
                  }}
                >
                  All Branches
                </div>
                {filteredBranches.map((br) => (
                  <div
                    key={br}
                    style={optSt(filterBranch === br)}
                    onMouseDown={() => {
                      setFilterBranch(br);
                      setBranchDropOpen(false);
                      setBranchQ("");
                    }}
                  >
                    <Store size={11} color="#3b791e" /> {br}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active chips */}
          {(filterBrand || filterBranch) && (
            <>
              {filterBrand && !filterBranch && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 9px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#f0f5e8",
                    color: "#2c5c16",
                    border: "1px solid #E1E6D8",
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                  onClick={() => {
                    setFilterBrand(null);
                    setFilterBranch(null);
                  }}
                >
                  <Store size={10} /> {selectedBrand?.name} <X size={9} />
                </span>
              )}
              {filterBranch && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 9px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#f0f5e8",
                    color: "#2c5c16",
                    border: "1px solid #E1E6D8",
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                  onClick={() => setFilterBranch(null)}
                >
                  <Store size={10} /> {filterBranch} <X size={9} />
                </span>
              )}
              <button
                onClick={() => {
                  setFilterBrand(null);
                  setFilterBranch(null);
                }}
                style={{
                  padding: "3px 9px",
                  borderRadius: 20,
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Clear
              </button>
            </>
          )}

          <div
            style={{
              width: 1,
              height: 24,
              background: "#e0ede2",
              margin: "0 4px",
            }}
          />

          {/* Preset tabs */}
          <div
            style={{
              display: "flex",
              gap: 3,
              background: "#F6F7F1",
              borderRadius: 10,
              padding: 3,
            }}
          >
            {["day", "week", "month", "year"].map((p) => (
              <button
                key={p}
                style={tabSt(rangeMode === "preset" && preset === p)}
                onClick={() => {
                  setRangeMode("preset");
                  setPreset(p);
                  setViewArchive(null);
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} color="#5C6B60" />
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              max={customTo}
              style={{
                padding: "6px 9px",
                borderRadius: 8,
                border: "1.5px solid #E1E6D8",
                background: "#f0f5e8",
                fontSize: 11,
                fontFamily: FONT,
                color: "#12241B",
                outline: "none",
              }}
            />
            <span style={{ color: "#5C6B60", fontSize: 11, fontFamily: FONT }}>
              to
            </span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              min={customFrom}
              max={fmt8(today)}
              style={{
                padding: "6px 9px",
                borderRadius: 8,
                border: "1.5px solid #E1E6D8",
                background: "#f0f5e8",
                fontSize: 11,
                fontFamily: FONT,
                color: "#12241B",
                outline: "none",
              }}
            />
            <button
              onClick={applyCustomRange}
              disabled={applyingRange}
              style={{
                padding: "6px 13px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg,#3b791e,#3b791e)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: applyingRange ? "not-allowed" : "pointer",
                fontFamily: FONT,
                opacity: applyingRange ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {applyingRange ? (
                <>
                  <svg
                    width={11}
                    height={11}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                  Applying…
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Archive */}
          <button
            onClick={() => setShowArchive((v) => !v)}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 9,
              border: "1.5px solid #E1E6D8",
              background: showArchive ? "#f0f5e8" : "#fff",
              color: "#2c5c16",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Archive size={13} /> Archives
            {archives.length > 0 && (
              <span
                style={{
                  background: "#3b791e",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {archives.length}
              </span>
            )}
          </button>
        </div>

        {/* Archive panel */}
        {showArchive && (
          <div
            style={{
              order: 3,
              background: "#fff",
              border: "1px solid rgba(0,168,76,0.15)",
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "0 2px 16px rgba(0,140,60,0.08)",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#12241B",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Archive size={15} color="#3b791e" /> Yearly Archives
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  value={archiveYear}
                  onChange={(e) => setArchiveYear(e.target.value)}
                  min="2000"
                  max="2100"
                  placeholder="Year"
                  style={{
                    padding: "6px 9px",
                    borderRadius: 8,
                    border: "1.5px solid #E1E6D8",
                    background: "#f0f5e8",
                    fontSize: 12,
                    fontFamily: FONT,
                    color: "#12241B",
                    outline: "none",
                    width: 86,
                  }}
                />
                <button
                  onClick={requestArchiveYear}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg,#3b791e,#3b791e)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                >
                  <Plus size={12} /> Archive Year
                </button>
              </div>
            </div>
            {archives.length === 0 ? (
              <div
                style={{
                  padding: "20px 0",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontFamily: FONT,
                }}
              >
                No archives yet.
              </div>
            ) : (
              archives.map((a) => (
                <div
                  key={a.year}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 13px",
                    borderRadius: 9,
                    border: "1px solid #f0f5e8",
                    marginBottom: 7,
                    background: "#f8fffe",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: "#12241B",
                        fontFamily: FONT,
                      }}
                    >
                      {a.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "#5C6B60",
                        marginTop: 2,
                        fontFamily: FONT,
                      }}
                    >
                      Saved: {a.savedAt} · Total: {fmtAmt(a.kpis.totalSales)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button
                      onClick={() => {
                        setViewArchive(viewArchive?.year === a.year ? null : a);
                        setShowArchive(false);
                      }}
                      style={{
                        padding: "4px 11px",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: FONT,
                        border: `1px solid ${viewArchive?.year === a.year ? "#3b791e" : "#E1E6D8"}`,
                        background:
                          viewArchive?.year === a.year ? "#f0f5e8" : "#f8fffe",
                        color: "#2c5c16",
                      }}
                    >
                      {viewArchive?.year === a.year ? "Viewing" : "View"}
                    </button>
                    <button
                      onClick={() => deleteArchive(a.year)}
                      style={{
                        padding: "4px 11px",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: FONT,
                        border: "1px solid #f2c9c4",
                        background: "#fff",
                        color: "#c0392b",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Analysis workspace tabs ── */}
        <div style={{ display: "none" }}>
          {[
            { id: "sales", label: "Sales Trend", icon: TrendingUp },
            { id: "prescriptive", label: "Prescriptive Analysis", icon: Brain },
            { id: "stock", label: "Sales vs Stock", icon: Package },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAnalysisTab(t.id)}
              style={{
                position: "relative",
                minWidth: 170,
                padding: "17px 16px 15px",
                border: "none",
                background: "transparent",
                color: analysisTab === t.id ? "#139a43" : "#94a3b8",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                whiteSpace: "nowrap",
              }}
            >
              <t.icon size={14} />
              {t.label}
              {analysisTab === t.id && (
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    bottom: 0,
                    height: 2.5,
                    borderRadius: "4px 4px 0 0",
                    background: "#22a447",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {false && analysisTab === "sales" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.65fr) minmax(330px,.85fr)",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E1E6D8",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "0 2px 14px rgba(50,109,32,.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#12241B",
                      }}
                    >
                      Revenue Trend
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#5C6B60", marginTop: 3 }}
                    >
                      Actual revenue movement · {getRangeLabel()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#7A887B",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                      }}
                    >
                      Period revenue
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#3b791e",
                        marginTop: 2,
                      }}
                    >
                      {fmtAmt(
                        viewArchive
                          ? (viewArchive?.kpis?.totalSales ?? total)
                          : actualRevenue,
                      )}
                    </div>
                  </div>
                </div>
                <DashboardLineGraph labels={chartLabels} values={values} />
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E1E6D8",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "0 2px 14px rgba(50,109,32,.06)",
                }}
              >
                <div
                  style={{ fontSize: 15, fontWeight: 800, color: "#12241B" }}
                >
                  Branch Performance
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#5C6B60",
                    marginTop: 3,
                    marginBottom: 16,
                  }}
                >
                  Ranked by actual revenue
                </div>
                <DashboardRankBars data={branchPerformance} />
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E1E6D8",
                borderRadius: 18,
                padding: "18px 20px",
                marginBottom: 18,
                boxShadow: "0 2px 14px rgba(50,109,32,.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#12241B",
                      }}
                    >
                      Branch Profitability
                    </div>
                    {!viewArchive && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: "#ecfdf5",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                          letterSpacing: ".04em",
                        }}
                      >
                        API DATA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#5C6B60", marginTop: 4 }}>
                    Revenue, gross profit, margin and transaction efficiency by
                    branch
                  </div>
                </div>

                {!viewArchive && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: "#7A887B",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                      }}
                    >
                      Branches analyzed
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#3b791e",
                        marginTop: 2,
                      }}
                    >
                      {branchProfitability.length.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {branchProfitability.length > 0 ? (
                <div
                  style={{
                    overflowX: "auto",
                    border: "1px solid #E7EEE4",
                    borderRadius: 13,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 820,
                      fontFamily: FONT,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#F6FAF3" }}>
                        {[
                          { label: "Branch / Brand", align: "left" },
                          { label: "Revenue", align: "right" },
                          { label: "Gross Profit", align: "right" },
                          { label: "Margin", align: "center" },
                          { label: "Transactions", align: "center" },
                          { label: "Avg. Order", align: "right" },
                        ].map((h) => (
                          <th
                            key={h.label}
                            style={{
                              padding: "11px 13px",
                              textAlign: h.align,
                              fontSize: 9.5,
                              color: "#71806F",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: ".065em",
                              borderBottom: "1px solid #DDE8DA",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {branchProfitability.map((row, index) => {
                        const hasProfitData = row.hasCogs;
                        const marginColor = !hasProfitData
                          ? "#94a3b8"
                          : row.margin >= 40
                            ? "#15803d"
                            : row.margin >= 25
                              ? "#3b791e"
                              : row.margin >= 15
                                ? "#d97706"
                                : "#c0392b";

                        const marginBg = !hasProfitData
                          ? "#f8fafc"
                          : row.margin >= 40
                            ? "#ecfdf5"
                            : row.margin >= 25
                              ? "#f0f5e8"
                              : row.margin >= 15
                                ? "#fffbeb"
                                : "#fef2f2";

                        const borderBottom =
                          index === branchProfitability.length - 1
                            ? "none"
                            : "1px solid #EEF3EC";

                        return (
                          <tr
                            key={row.branch}
                            style={{
                              background: index % 2 === 0 ? "#fff" : "#FBFDF9",
                            }}
                          >
                            <td style={{ padding: "12px 13px", borderBottom }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 9,
                                }}
                              >
                                <span
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 8,
                                    background: "#F0F5E8",
                                    color: "#3b791e",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontWeight: 800,
                                    flexShrink: 0,
                                  }}
                                >
                                  {index + 1}
                                </span>
                                <span style={{ minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: 11.5,
                                      fontWeight: 800,
                                      color: "#12241B",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {row.branch}
                                  </span>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: 9.4,
                                      fontWeight: 650,
                                      color: "#5C6B60",
                                      marginTop: 2,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {row.brand || "Unassigned Brand"}
                                  </span>
                                </span>
                              </div>
                            </td>

                            <td
                              style={{
                                padding: "12px 13px",
                                textAlign: "right",
                                fontSize: 11.5,
                                fontWeight: 800,
                                color: "#183126",
                                whiteSpace: "nowrap",
                                borderBottom,
                              }}
                            >
                              {fmtAmt(row.revenue)}
                            </td>

                            <td
                              style={{
                                padding: "12px 13px",
                                textAlign: "right",
                                fontSize: 11.5,
                                fontWeight: 800,
                                color: hasProfitData ? "#1d4ed8" : "#94a3b8",
                                whiteSpace: "nowrap",
                                borderBottom,
                              }}
                            >
                              {hasProfitData ? fmtAmt(row.grossProfit) : "—"}
                            </td>

                            <td
                              style={{
                                padding: "12px 13px",
                                textAlign: "center",
                                borderBottom,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: 60,
                                  padding: "4px 8px",
                                  borderRadius: 20,
                                  background: marginBg,
                                  color: marginColor,
                                  border: `1px solid ${marginColor}25`,
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {hasProfitData
                                  ? `${row.margin.toFixed(1)}%`
                                  : "No COGS"}
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "12px 13px",
                                textAlign: "center",
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: "#334155",
                                borderBottom,
                              }}
                            >
                              {row.transactions.toLocaleString()}
                            </td>

                            <td
                              style={{
                                padding: "12px 13px",
                                textAlign: "right",
                                fontSize: 11.5,
                                fontWeight: 800,
                                color: "#3b791e",
                                whiteSpace: "nowrap",
                                borderBottom,
                              }}
                            >
                              {fmtAmt(row.avgOrder)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px dashed #D7E1D4",
                    borderRadius: 12,
                    background: "#FAFCF8",
                    color: "#7A887B",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  {viewArchive
                    ? "Branch profitability is not stored in this archived dashboard snapshot."
                    : "No branch transaction data is available for the selected filter."}
                </div>
              )}

              {!viewArchive &&
                branchProfitability.length > 0 &&
                branchProfitability.some((row) => !row.hasCogs) && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      padding: "9px 11px",
                      borderRadius: 9,
                      background: "#fffaf0",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      fontSize: 10.5,
                      lineHeight: 1.55,
                    }}
                  >
                    <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      Gross Profit and Margin show “No COGS” when the
                      transaction API has no cost-of-goods value. Revenue,
                      Transactions and Avg. Order still come directly from the
                      API.
                    </span>
                  </div>
                )}
            </div>
            <SalesTrendSection
              values={values}
              labels={chartLabels}
              kpiData={kpiData}
              total={total}
              avg={avg}
              peak={peak}
              low={low}
              peakLabel={peakLabel}
              pctChange={pctChange}
              trending={trending}
              getRangeLabel={getRangeLabel}
              filterLabel={filterLabel}
              filterBrand={filterBrand}
              filterBranch={filterBranch}
              brands={brandList}
              transactionCount={transactionCount || 0}
              averageTransaction={averageTransaction}
              branchPerformance={branchPerformance}
              brandPerformance={brandPerformance}
              branchProfitability={branchProfitability}
            />
          </>
        )}

        {false && analysisTab === "prescriptive" && (
          <PrescriptiveSection
            transactions={filteredTransactions}
            filterLabel={filterLabel}
            preset={preset}
            total={total}
            values={values}
            labels={chartLabels}
            kpiData={kpiData}
          />
        )}

        {false && analysisTab === "stock" && (
          <SalesVsStockSection
            preset={preset}
            appliedRange={appliedRange}
            rangeMode={rangeMode}
            filterBranch={filterBranch}
            filterBrand={filterBrand}
            selectedBrand={selectedBrand}
            total={total}
            transactions={filteredTransactions}
          />
        )}

        {dashboardTab === "sales_ai" && (
          <div style={{ order: 4 }}>
            <div
              style={{
                background: "linear-gradient(135deg,#F4F8F0,#fff)",
                border: "1px solid #DCE9DB",
                borderLeft: "5px solid #3b791e",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 850,
                  color: "#12241B",
                }}
              >
                <LineChart size={16} color="#3b791e" /> Read the actual sales
                evidence first
              </div>
              <div
                style={{
                  fontSize: 10.8,
                  color: "#5C6B60",
                  lineHeight: 1.55,
                  marginTop: 5,
                }}
              >
                Use the actual revenue line, period summary, and branch
                profitability below to understand sales movement. Corrective
                recommendations are kept with the loss evidence in Ghost Stock /
                Revenue Leakage.
              </div>
            </div>

            <SalesTrendSection
              values={values}
              labels={chartLabels}
              kpiData={kpiData}
              total={total}
              avg={avg}
              peak={peak}
              low={low}
              peakLabel={peakLabel}
              pctChange={pctChange}
              trending={trending}
              getRangeLabel={getRangeLabel}
              filterLabel={filterLabel}
              filterBrand={filterBrand}
              filterBranch={filterBranch}
              brands={brandList}
              transactionCount={transactionCount || 0}
              averageTransaction={averageTransaction}
              branchPerformance={branchPerformance}
              brandPerformance={brandPerformance}
              branchProfitability={branchProfitability}
            />
          </div>
        )}
      </div>

      <InfoModal
        modal={infoModal}
        onClose={closeInfo}
        onConfirm={() => {
          if (infoModal?.onConfirm) infoModal.onConfirm();
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

// MOBILE SHOP CONTENT
const Field = ({ label, error, children }) => (
  <div>
    <label
      style={{
        fontSize: "0.8rem",
        fontWeight: 700,
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p
        style={{
          color: "#e53935",
          fontSize: "0.72rem",
          marginTop: 3,
          fontWeight: 600,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

function MultiSelectBranchDropdown({
  branches,
  selected,
  onChange,
  disabled,
  error,
  msInputStyle,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggle = (br) => {
    const updated = selected.includes(br)
      ? selected.filter((b) => b !== br)
      : [...selected, br];
    onChange(updated);
  };

  const selectAll = () => onChange([...branches]);
  const clearAll = () => onChange([]);

  const label = disabled
    ? "Select a brand first"
    : selected.length === 0
      ? "Select branches…"
      : selected.length === branches.length
        ? "All branches"
        : selected.join(", ");

  return (
    <div ref={ref} style={{ position: "relative", marginTop: "0.3rem" }}>
      <div
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        style={{
          ...msInputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          border: `1px solid ${error ? "#e53935" : "#d1eedd"}`,
          userSelect: "none",
          paddingRight: 10,
          minHeight: 36,
          height: "auto",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {selected.length > 0 && !disabled ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
            {selected.map((br) => (
              <span
                key={br}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#e0f2f1",
                  color: "#00695c",
                  border: "1px solid #b2dfdb",
                }}
              >
                {br}
                <span
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    toggle(br);
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: 12,
                    lineHeight: 1,
                    color: "#5a7a65",
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
        )}
        <svg
          width={11}
          height={11}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.muted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .15s",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 500,
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 12px",
              borderBottom: `1px solid ${C.border}`,
              background: "#f8fffe",
            }}
          >
            <span
              onMouseDown={(e) => {
                e.preventDefault();
                selectAll();
              }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#00897b",
                cursor: "pointer",
              }}
            >
              Select All
            </span>
            <span
              onMouseDown={(e) => {
                e.preventDefault();
                clearAll();
              }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                cursor: "pointer",
              }}
            >
              Clear
            </span>
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {branches.length === 0 ? (
              <div
                style={{
                  padding: "12px",
                  fontSize: 12,
                  color: C.muted,
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                No branches available
              </div>
            ) : (
              branches.map((br) => (
                <div
                  key={br}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggle(br);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    cursor: "pointer",
                    fontSize: 13,
                    background: selected.includes(br) ? "#f0fdf5" : C.white,
                    borderBottom: `1px solid #f5fdf7`,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      flexShrink: 0,
                      border: `2px solid ${selected.includes(br) ? "#00897b" : "#b2dfdb"}`,
                      background: selected.includes(br) ? "#00897b" : C.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected.includes(br) && (
                      <svg
                        width={9}
                        height={9}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontWeight: selected.includes(br) ? 700 : 500,
                      color: selected.includes(br) ? "#00695c" : C.ink,
                    }}
                  >
                    {br}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    if (toast.type === "loading") return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isErr = toast.type === "error";
  const isLoading = toast.type === "loading";

  return (
    <div
      style={{
        position: "fixed",
        top: 22,
        right: 22,
        zIndex: 4000,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        maxWidth: 380,
        padding: "16px 18px",
        borderRadius: 14,
        background: isErr ? "#fef2f2" : "#f0fdf5",
        borderLeft: `5px solid ${isErr ? "#dc2626" : "#00897b"}`,
        border: `1px solid ${isErr ? "#fecaca" : "#b2dfdb"}`,
        borderLeftWidth: 5,
        boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        animation: "toastIn .22s ease",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isErr ? "#dc2626" : "#00897b",
          color: "#fff",
          boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(0,137,123,0.4)"}`,
        }}
      >
        {isErr ? (
          <AlertTriangle size={16} />
        ) : isLoading ? (
          <RefreshCw
            size={16}
            style={{ animation: "spin 0.8s linear infinite" }}
          />
        ) : (
          <Check size={16} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: isErr ? "#7f1d1d" : "#0d2b1e",
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: 12.5,
              color: isErr ? "#991b1b" : "#3f5f4f",
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </div>
        )}
      </div>

      {!isLoading && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: isErr ? "#991b1b" : "#3f5f4f",
            cursor: "pointer",
            padding: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function ShopDeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 18,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 680,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2
              style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}
            >
              Delete History
            </h2>
            {history.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "#fee2e2",
                  color: "#e53935",
                }}
              >
                {history.length} deleted
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${C.border}`,
              background: "#e0f2f1",
              cursor: "pointer",
              color: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>
        {history.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 90px 110px 100px",
              gap: 8,
              padding: "6px 0 10px",
              borderBottom: "2px solid #e0f2f1",
              fontSize: 10,
              fontWeight: 700,
              color: "#5a7a65",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Item</span>
            <span>Shop</span>
            <span>Price</span>
            <span>Deleted At</span>
            <span></span>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              No deleted items yet.
            </div>
          ) : (
            history.map((entry, i) => {
              const d = entry.data || {};
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 90px 110px 100px",
                    gap: 8,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      i < history.length - 1 ? "1px solid #f0f8f0" : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}
                    >
                      {d.brand || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#5a7a65" }}>{d.shop}</div>
                  <div
                    style={{ fontSize: 12, color: C.green, fontWeight: 700 }}
                  >
                    {fmtPeso(d.price || 0)}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {entry.deletedAt
                      ? new Date(entry.deletedAt).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Manila",
                        })
                      : "—"}
                  </div>
                  <button
                    onClick={() => onRestore(entry)}
                    disabled={restoringId !== null}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #00897b",
                      background: "#e0f2f1",
                      color: "#00695c",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      opacity:
                        restoringId !== null
                          ? restoringId === entry.id
                            ? 0.85
                            : 0.4
                          : 1,
                    }}
                  >
                    {restoringId === entry.id ? "Restoring…" : "Restore"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ShopDeleteConfirmModal({ item, deleting, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2500,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: "1px solid #fecaca",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#fef2f2",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#991b1b",
              marginBottom: 5,
            }}
          >
            Delete Item
          </div>
          <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{item.name}"</strong>?
          </div>
          <div
            style={{
              marginTop: 8,
              background: "#fff5f5",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#7f1d1d",
            }}
          >
            This will move the item to Delete History where it can be restored.
          </div>
        </div>
        <div
          style={{
            padding: "12px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            gap: 20,
          }}
        >
          <div style={{ fontSize: 12 }}>
            <div
              style={{
                color: C.muted,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Shop
            </div>
            <div style={{ fontWeight: 700, color: C.ink }}>{item.shop}</div>
          </div>
          <div style={{ fontSize: 12 }}>
            <div
              style={{
                color: C.muted,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Price
            </div>
            <div style={{ fontWeight: 700, color: C.ink }}>
              {fmtPeso(item.price)}
            </div>
          </div>
          <div style={{ fontSize: 12 }}>
            <div
              style={{
                color: C.muted,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Stock
            </div>
            <div style={{ fontWeight: 700, color: C.ink }}>
              {item.stock ?? 0}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "14px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.muted,
              fontWeight: 700,
              fontSize: 13,
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#e53935",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportLoadingModal({ visible, progress }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3500,
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 18,
          padding: "32px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
          border: "1px solid #c8e6c9",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: C.ink,
            marginBottom: 6,
          }}
        >
          Importing Excel
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Please wait while your data is being processed…
        </div>
        <div
          style={{
            background: "#e8f5e9",
            borderRadius: 999,
            height: 6,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg,${C.teal},${C.green})`,
              borderRadius: 999,
              height: "100%",
              width: `${progress.percent}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {progress.label}
        </div>
        {progress.current > 0 && (
          <div style={{ fontSize: 11, color: C.muted, opacity: 0.7 }}>
            {progress.current} / {progress.total} rows processed
          </div>
        )}
        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            fontWeight: 700,
            color: C.green,
          }}
        >
          Do not close this window
        </div>
      </div>
    </div>
  );
}

function UIModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type, title, message, confirmLabel, cancelLabel } = modal;
  const hc = {
    error: { bg: "#fef2f2", border: "#fecaca", titleColor: "#991b1b" },
    success: { bg: "#e8f5e9", border: "#c8e6c9", titleColor: "#00695c" },
    info: { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
    confirm: { bg: "#fef2f2", border: "#fecaca", titleColor: "#991b1b" },
  }[type] || { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: `1px solid ${hc.border}`,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: hc.bg,
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${hc.border}`,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: hc.titleColor,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          {message && (
            <div
              style={{
                fontSize: 13,
                color: C.ink,
                lineHeight: 1.6,
                opacity: 0.85,
              }}
            >
              {message}
            </div>
          )}
        </div>
        <div
          style={{
            padding: "14px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {type === "confirm" && (
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.muted,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            onClick={type === "confirm" ? onConfirm : onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background:
                type === "confirm"
                  ? "#e53935"
                  : `linear-gradient(135deg,${C.teal},${C.green})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {confirmLabel || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnlistBlockedModal({ item, onClose, onHideInstead }) {
  if (!item) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        zIndex: 1150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(3px)",
        animation: "fadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="msc-modal-card"
        style={{
          background: C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#fff3e0",
              color: "#e65100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <AlertIcon />
          </div>
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 900,
              color: C.ink,
              marginBottom: 6,
            }}
          >
            Can't Unlist This Item
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            <strong style={{ color: C.ink }}>{item.name}</strong> is linked to
            past orders and can't be removed from the Mobile Shop. Hide it
            instead — that keeps order history intact while taking it off the
            customer-facing shop.
          </div>
        </div>
        <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            className="msc-btn"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.ink,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Close
          </button>
          <button
            onClick={() => onHideInstead(item)}
            className="msc-btn"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg,${C.teal},${C.green})`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(0,180,90,0.3)",
            }}
          >
            Hide Instead
          </button>
        </div>
      </div>
    </div>
  );
}

const normalize = (str) => (str || "").trim().toLowerCase();
const MARKUP = 1.1; // shop price = stock cost + 10%

/* ── tiny inline icons (no external deps beyond lucide's core set) ── */

const EditIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const EyeIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44" />
    <path d="M1 1l22 22" />
    <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
  </svg>
);
const BoxIcon = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const CheckCircleIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const TagIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2.41 12.42A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" />
    <circle cx="7" cy="7" r="1" />
  </svg>
);
const ListIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const LayersIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

/* ── shared style atoms (mirrors Stock Inventory's system) ── */
const msInputStyle = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  borderRadius: 9,
  border: `1px solid ${C.border}`,
  marginTop: "0.3rem",
  fontSize: "0.85rem",
  color: C.ink,
  background: C.white,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: "border-color .15s, box-shadow .15s",
};
const readOnlyFieldStyle = {
  width: "100%",
  minHeight: 38,
  padding: "9px 12px",
  borderRadius: 9,
  border: `1px solid ${C.border}`,
  marginTop: "0.3rem",
  fontSize: "0.85rem",
  color: C.muted,
  background: "#f5f5f5",
  boxSizing: "border-box",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
};
const toolbarBtnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 38,
  padding: "0 16px",
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  border: "none",
};

const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 },
    );
  });
};

const computePrice = (cost) =>
  cost > 0 ? Math.round(cost * MARKUP * 100) / 100 : 0;
const keyFor = (item) =>
  item.id != null
    ? `id-${item.id}`
    : `new-${normalize(item.brand)}-${normalize(item.name)}`;

const placeholderImageFor = (name) =>
  `https://placehold.co/150x150/e8f5e9/2e7d32?text=${encodeURIComponent((name || "").slice(0, 8))}`;

function SalesMobileShopContent({ user, brands: propBrands = [] }) {
  const [activityLog, setActivityLog] = useState([]);
  const [shopItems, setShopItems] = useState([]); // listing overrides keyed to a stock product
  const [itemsLoading, setItemsLoading] = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null); // item pending unlist confirmation (modal)
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShop, setFilterShop] = useState("all");
  const [stockItems, setStockItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set()); // multi-select for bulk listing
  const [bulkListing, setBulkListing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const UNITS = [
    "pcs",
    "kg",
    "g",
    "liters",
    "ml",
    "tbsp",
    "tsp",
    "cups",
    "bottles",
    "packs",
    "bags",
    "boxes",
    "cans",
    "gallons",
  ];

  const computeDisplayPrice = (cost, unit) => {
    const bulkQty = ["g", "ml"].includes(unit)
      ? 1000
      : unit === "L"
        ? 200
        : unit === "kg"
          ? 50
          : unit === "pc"
            ? 50
            : 1;
    return Math.round(Number(cost || 0) * bulkQty * 1.12 * 100) / 100;
  };

  const bulkLabelFor = (unit) => {
    if (unit === "g") return "kg";
    if (unit === "ml") return "L";
    if (unit === "L") return "drum (200L)";
    if (unit === "kg") return "cylinder (50kg)";
    if (unit === "pc") return "pack (50pcs)";
    return unit;
  };

  const markupLabelFor = () => "+ 12%";

  const fetchActivityLog = useCallback(async () => {
    try {
      const res = await adminModuleFetch(`${ADMIN_API_BASE}/shop-activity-log`);
      const data = await res.json();
      setActivityLog(
        Array.isArray(data)
          ? data.map((row) => ({
              id: row.id,
              action: row.action,
              itemName: row.item_name ?? row.itemName,
              shop: row.shop,
              performedBy: row.performed_by ?? row.performedBy,
              role: row.role,
              changes: row.changes,
              timestamp: row.created_at ?? row.timestamp,
            }))
          : [],
      );
    } catch (err) {
      console.error("Failed to fetch shop activity log:", err);
    }
  }, []);

  // Listing overrides for products that have been set up for the Mobile Shop.
  // Stock Inventory remains the source of the product list and live cost.
  const fetchShopItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await adminModuleFetch(`${ADMIN_API_BASE}/shop-items`);
      const data = await res.json();
      setShopItems(Array.isArray(data) ? data : []);
    } catch {
      setShopItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // Stock Inventory ingredients — this is the single source of truth for
  // which products can appear in the Mobile Shop at all, and for cost.
  // In MobileShopContent, derive it from the brands prop instead of hardcoding:
  const fetchStockItems = useCallback(async () => {
    try {
      const headOfficeBranch = propBrands
        .flatMap((b) => b.branches || [])
        .map((br) => (typeof br === "string" ? br : br?.name))
        .find((name) => name?.toLowerCase().includes("head office"));

      if (!headOfficeBranch) {
        setStockItems([]);
        return;
      }

      const res = await adminModuleFetch(
        `${ADMIN_API_BASE}/ingredients?branch=${encodeURIComponent(headOfficeBranch)}`,
      );
      const data = await res.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch {
      setStockItems([]);
    }
  }, [propBrands]);

  useEffect(() => {
    fetchShopItems();
    fetchStockItems();
    fetchActivityLog();
  }, [fetchShopItems, fetchStockItems, fetchActivityLog]);

  // Pull the live unit cost from Stock Inventory. The shop price is always
  // derived from this — never entered by hand — so it stays in sync
  // automatically whenever cost changes upstream.
  const getCostFor = useCallback(
    (brandName, itemName) => {
      const b = normalize(brandName),
        n = normalize(itemName);
      const match = stockItems.find(
        (i) => normalize(i.brand) === b && normalize(i.name) === n,
      );
      return match ? Number(match.cost_per_unit || 0) : 0;
    },
    [stockItems],
  );

  // Every unique (brand, product name) combination that exists in Stock
  // Inventory. This — and only this — determines what CAN show up here.
  const uniqueStockProducts = useMemo(() => {
    const seen = new Map();
    stockItems.forEach((si) => {
      if (!si.brand || !si.name) return;
      const key = `${normalize(si.brand)}|${normalize(si.name)}`;
      if (!seen.has(key)) seen.set(key, { brand: si.brand, name: si.name });
    });
    return Array.from(seen.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [stockItems]);

  const items = useMemo(() => {
    return uniqueStockProducts.map((sp) => {
      const match = shopItems.find(
        (i) =>
          normalize(i.brand) === normalize(sp.brand) &&
          normalize(i.name) === normalize(sp.name),
      );
      const liveCost = getCostFor(sp.brand, sp.name);
      return {
        id: match ? match.id : null,
        name: sp.name,
        brand: sp.brand,
        shop: match ? match.shop : sp.brand,
        cost: liveCost,
        price: match
          ? Number(match.price)
          : computeDisplayPrice(liveCost, sp.unit, sp.brand),
        unit: match ? match.unit : "",
        is_visible: match ? !!match.is_visible : false,
        listed: !!match,
      };
    });
  }, [uniqueStockProducts, shopItems, getCostFor]);

  const uniqueShops = [
    ...new Set(items.map((i) => i.brand).filter(Boolean)),
  ].sort();

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (filterShop !== "all" && item.brand !== filterShop) return false;
    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
  );
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    pageStartIndex,
    pageStartIndex + ITEMS_PER_PAGE,
  );
  const pageStartDisplay = filteredItems.length === 0 ? 0 : pageStartIndex + 1;
  const pageEndDisplay = Math.min(
    pageStartIndex + ITEMS_PER_PAGE,
    filteredItems.length,
  );

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterShop]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  // Clear out any selected keys that no longer exist in the current item set
  // (e.g. a product was removed from Stock Inventory).
  useEffect(() => {
    setSelectedKeys((prev) => {
      const validKeys = new Set(items.map(keyFor));
      let changed = false;
      const next = new Set();
      prev.forEach((k) => {
        if (validKeys.has(k)) next.add(k);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [items]);

  const toggleSelect = (rowKey) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const selectedItems = items.filter((i) => selectedKeys.has(keyFor(i)));
  const selectedUnlistedCount = selectedItems.filter((i) => !i.listed).length;
  const allUnlistedCount = filteredItems.filter((i) => !i.listed).length;

  const validateEdit = () => {
    const errs = {};
    if (!editingItem.cost || editingItem.cost <= 0)
      errs.cost = "Set a cost for this product in Stock Inventory first";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openEditor = (item) => {
    setEditingItem({ ...item });
    setEditErrors({});
  };

  // Creates the listing (POST) the first time a product is edited, or
  // updates it (PUT) if a listing already exists. Stock is not part of
  // this payload's concern here — price is always synced live from
  // Stock Inventory, never entered manually.
  const saveEdit = async () => {
    if (editLoading || !validateEdit()) return;
    setEditLoading(true);
    const coords = await getBrowserLocation();
    const payload = {
      name: editingItem.name,
      unit: editingItem.unit || "",
      shop: editingItem.brand,
      brand: editingItem.brand,
      is_visible: editingItem.is_visible !== false,
      performed_by: user?.name || "System",
      performed_by_role: user?.role || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
    try {
      const url = editingItem.id
        ? `${ADMIN_API_BASE}/shop-items/${editingItem.id}`
        : `${ADMIN_API_BASE}/shop-items`;
      const method = editingItem.id ? "PUT" : "POST";
      await adminModuleFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setToast({
        type: "success",
        title: editingItem.id ? "Item Updated" : "Item Listed",
        message: editingItem.id
          ? `"${editingItem.name}" has been updated.`
          : `"${editingItem.name}" is now listed in the Mobile Shop.`,
      });
      setEditingItem(null);
      setEditErrors({});
      fetchShopItems();
      fetchActivityLog();
    } catch {
      setToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to save changes.",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Bulk-list one or more not-yet-listed products in a single action.
  const bulkListItems = async (candidateItems) => {
    const toList = candidateItems.filter((i) => !i.listed);
    if (toList.length === 0) {
      setToast({
        type: "error",
        title: "Nothing to List",
        message: "All selected items are already listed.",
      });
      return;
    }
    setBulkListing(true);
    const coords = await getBrowserLocation();
    let success = 0,
      failed = 0;
    for (const it of toList) {
      const payload = {
        name: it.name,
        unit: it.unit || "",
        shop: it.brand,
        brand: it.brand,
        is_visible: true,
        performed_by: user?.name || "System",
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };
      try {
        const res = await adminModuleFetch(`${ADMIN_API_BASE}/shop-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }
    setBulkListing(false);
    setSelectedKeys(new Set());
    fetchShopItems();
    fetchActivityLog();
    setToast({
      type: failed > 0 ? "error" : "success",
      title: "Bulk Listing Complete",
      message: `${success} item${success === 1 ? "" : "s"} listed${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
  };

  const deleteItem = async (item) => {
    if (!item.id) {
      setConfirmDeleteItem(null);
      return;
    }
    setDeleteLoading(true);
    const coords = await getBrowserLocation();
    try {
      await adminModuleFetch(`${ADMIN_API_BASE}/shop-items/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted_by: user?.name || "System",
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      setToast({
        type: "success",
        title: "Listing Removed",
        message: `"${item.name}" is no longer listed in the Mobile Shop.`,
      });
    } catch {
      setToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to remove the listing.",
      });
    } finally {
      setDeleteLoading(false);
      setConfirmDeleteItem(null);
      fetchShopItems();
      fetchActivityLog();
    }
  };

  const toggleVisibility = async (item) => {
    if (!item.id) return; // nothing to toggle until it's listed
    const coords = await getBrowserLocation();
    try {
      await adminModuleFetch(`${ADMIN_API_BASE}/shop-items/${item.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performed_by: user?.name || "System",
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      fetchShopItems();
      fetchActivityLog();
    } catch {
      setToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to update visibility.",
      });
    }
  };

  const [blockedUnlistItem, setBlockedUnlistItem] = useState(null);

  const forceHide = async (item) => {
    if (!item.id || item.is_visible === false) {
      setBlockedUnlistItem(null);
      return;
    }
    await toggleVisibility(item);
    setBlockedUnlistItem(null);
  };

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes riseIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .msc-row { cursor: pointer; transition: background .15s ease; }
          .msc-row:hover td { background: #f6fef8 !important; }
          .msc-row.selected td { background: ${C.greenLt} !important; }
          .msc-btn:not(:disabled):hover { filter: brightness(0.96); transform: translateY(-1px); }
          .msc-btn:not(:disabled):active { transform: translateY(0); }
          .msc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .msc-btn { transition: filter .12s ease, transform .12s ease, box-shadow .12s ease; }
          .msc-icon-btn:hover { filter: brightness(0.94); }
          .msc-edit:hover { background:#dcedff !important; }
          .msc-del:hover  { background:#fddede !important; }
          .msc-hide:hover { background:${C.greenLt} !important; }
          select, input { transition: border-color .15s ease, box-shadow .15s ease; }
          select:focus, input:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); }
          .msc-modal-card { animation: riseIn .18s cubic-bezier(.2,.8,.3,1); }
        `}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Edit / List Modal ── */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(3px)",
            animation: "fadeIn .15s ease",
          }}
        >
          <div
            className="msc-modal-card"
            style={{
              background: C.white,
              borderRadius: 18,
              width: "100%",
              maxWidth: 560,
              boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                background: `linear-gradient(135deg,${C.teal},${C.green})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <TagIcon size={15} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {editingItem.id ? "Edit Listing" : "List Item"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                    }}
                  >
                    {editingItem.brand} · {editingItem.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEditErrors({});
                }}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 6,
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <div
                style={{
                  fontSize: 11.5,
                  color: "#2c5c16",
                  background: C.greenLt,
                  border: `1px solid ${C.greenMid}`,
                  borderRadius: 10,
                  padding: "10px 13px",
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                This product comes from <strong>Stock Inventory</strong>. Its
                name, brand, and price can't be edited here — the shop price is
                calculated automatically from Stock Inventory cost, bulk pack
                size, and brand markup.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                <Field label="Brand">
                  <div style={readOnlyFieldStyle}>{editingItem.brand}</div>
                </Field>
                <Field label="Item Name">
                  <div style={readOnlyFieldStyle}>{editingItem.name}</div>
                </Field>
                <Field label="Shop Price" error={editErrors.cost}>
                  <div
                    style={{
                      ...readOnlyFieldStyle,
                      background: editErrors.cost ? "#fdeeee" : C.greenLt,
                      border: `1px solid ${editErrors.cost ? C.red : C.greenMid}`,
                      color: editErrors.cost ? C.red : C.green,
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 900 }}>
                      {editingItem.cost > 0
                        ? fmtPeso(
                            computeDisplayPrice(
                              editingItem.cost,
                              editingItem.unit,
                              editingItem.brand,
                            ),
                          )
                        : "—"}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: editErrors.cost ? C.red : "#3b791e",
                      }}
                    >
                      {editingItem.cost > 0
                        ? `cost ${fmtPeso(editingItem.cost)} × ${bulkLabelFor(editingItem.unit, editingItem.brand)} ${markupLabelFor(editingItem.brand)}`
                        : "no cost set"}
                    </span>
                  </div>
                </Field>
                <Field label="Unit (Optional)">
                  <select
                    value={editingItem.unit || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    }
                    style={msInputStyle}
                  >
                    <option value="">Select unit…</option>
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 13px",
                  borderRadius: 10,
                  background:
                    editingItem.is_visible !== false ? C.greenLt : "#f7f7f7",
                  border: `1px solid ${editingItem.is_visible !== false ? C.greenMid : C.border}`,
                }}
              >
                <div
                  onClick={() =>
                    setEditingItem((f) => ({
                      ...f,
                      is_visible: f.is_visible === false,
                    }))
                  }
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    cursor: "pointer",
                    position: "relative",
                    background:
                      editingItem.is_visible !== false
                        ? `linear-gradient(135deg,${C.teal},${C.green})`
                        : "#e0e0e0",
                    transition: "background .2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: editingItem.is_visible !== false ? 21 : 3,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left .2s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: C.ink,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setEditingItem((f) => ({
                      ...f,
                      is_visible: f.is_visible === false,
                    }))
                  }
                >
                  Visible in Mobile Shop
                </span>
              </div>

              <div
                style={{
                  marginTop: "1.4rem",
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEditErrors({});
                  }}
                  className="msc-btn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.muted,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={editLoading}
                  className="msc-btn"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: editLoading
                      ? C.greenMid
                      : `linear-gradient(135deg,${C.teal},${C.green})`,
                    color: C.white,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: editLoading ? "not-allowed" : "pointer",
                    opacity: editLoading ? 0.7 : 1,
                    boxShadow: "0 4px 14px rgba(0,180,90,0.3)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {editLoading
                    ? "Saving…"
                    : editingItem.id
                      ? "Save Changes"
                      : "List Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unlist Confirmation Modal ── */}
      {confirmDeleteItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(3px)",
            animation: "fadeIn .15s ease",
          }}
        >
          <div
            className="msc-modal-card"
            style={{
              background: C.white,
              borderRadius: 18,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#fdeeee",
                  color: "#e53935",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <AlertIcon />
              </div>
              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 900,
                  color: C.ink,
                  marginBottom: 6,
                }}
              >
                Unlist this item?
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                <strong style={{ color: C.ink }}>
                  {confirmDeleteItem.name}
                </strong>{" "}
                will be removed from the Mobile Shop. It'll stay in Stock
                Inventory and can be relisted anytime.
              </div>
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmDeleteItem(null)}
                disabled={deleteLoading}
                className="msc-btn"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.ink,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteItem(confirmDeleteItem)}
                disabled={deleteLoading}
                className="msc-btn"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: deleteLoading ? "#ef9a9a" : "#e53935",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 4px 14px rgba(229,57,53,0.3)",
                }}
              >
                {deleteLoading ? "Unlisting…" : "Yes, Unlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shop Items Card ── */}
      <div
        style={{
          background: C.white,
          borderRadius: 18,
          border: "1px solid rgba(0,168,76,0.12)",
          boxShadow: "0 4px 20px rgba(0,140,60,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            background: `linear-gradient(135deg,${C.teal},${C.green})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Mobile Shop Supplies
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Prices auto-set from cost, bulk size, and brand markup · click a
              row to select it for listing
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              background: "rgba(255,255,255,0.15)",
              padding: "5px 12px",
              borderRadius: 20,
            }}
          >
            {items.length} product{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            background: "#F6F7F1",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              color="#5C6B60"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px 12px 8px 30px",
                borderRadius: 9,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                background: C.white,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: "none",
                width: 220,
                height: 38,
                boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={filterShop}
            onChange={(e) => setFilterShop(e.target.value)}
            style={{ ...msInputStyle, marginTop: 0, width: 160 }}
          >
            <option value="all">All Shops</option>
            {uniqueShops.map((shop) => (
              <option key={shop} value={shop}>
                {shop}
              </option>
            ))}
          </select>
          {(searchQuery || filterShop !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterShop("all");
              }}
              className="msc-btn"
              style={{
                height: 38,
                padding: "0 12px",
                borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#5C6B60",
              }}
            >
              Clear
            </button>
          )}

          <span
            style={{
              display: "flex",
              gap: 8,
              marginLeft: "auto",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => bulkListItems(selectedItems)}
              disabled={bulkListing || selectedUnlistedCount === 0}
              className="msc-btn"
              title={
                selectedUnlistedCount === 0
                  ? "Click unlisted rows to select them"
                  : "List all selected items"
              }
              style={{
                ...toolbarBtnSt,
                border: `1.5px solid ${C.green}`,
                background: C.greenLt,
                color: C.greenDk,
              }}
            >
              <ListIcon /> List Items
              {selectedUnlistedCount > 0 ? ` (${selectedUnlistedCount})` : ""}
            </button>
            <button
              onClick={() => bulkListItems(filteredItems)}
              disabled={bulkListing || allUnlistedCount === 0}
              className="msc-btn"
              title="List every currently unlisted item shown below"
              style={{
                ...toolbarBtnSt,
                background: `linear-gradient(135deg,${C.teal},${C.green})`,
                color: "#fff",
                boxShadow: "0 3px 12px rgba(0,180,90,0.28)",
              }}
            >
              <LayersIcon />{" "}
              {bulkListing
                ? "Listing…"
                : `List All Items${allUnlistedCount > 0 ? ` (${allUnlistedCount})` : ""}`}
            </button>
          </span>

          <span
            style={{
              fontSize: 12,
              color: "#5C6B60",
              fontWeight: 600,
              width: "100%",
            }}
          >
            {filteredItems.length} of {items.length} products
            {selectedKeys.size > 0 ? ` · ${selectedKeys.size} selected` : ""}
          </span>
        </div>

        {itemsLoading ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: C.muted,
              fontSize: 13,
            }}
          >
            <RefreshCw
              size={20}
              style={{
                animation: "spin 0.9s linear infinite",
                marginBottom: 10,
              }}
            />
            <div>Loading shop items…</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{ padding: "56px 0", textAlign: "center", color: C.muted }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 10,
                opacity: 0.4,
              }}
            >
              <BoxIcon />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>
              No products found
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Add products in Stock Inventory first — they will then appear
              here.
            </div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Shop",
                      "Item Name",
                      "Price",
                      "Unit",
                      "Status",
                      "Manage",
                    ].map((label, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "11px 14px",
                          textAlign: i === 5 ? "right" : "left",
                          fontWeight: 800,
                          fontSize: 10.5,
                          color: "#3b791e",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap",
                          background: "#f8fffe",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => {
                    const rowKey = keyFor(item);
                    const isSelected = selectedKeys.has(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        className={`msc-row${isSelected ? " selected" : ""}`}
                        onClick={() => toggleSelect(rowKey)}
                        aria-selected={isSelected}
                        title={
                          isSelected
                            ? "Click row to deselect"
                            : "Click row to select"
                        }
                        style={{
                          borderBottom: "1px solid #f0f8f0",
                          opacity: item.listed ? 1 : 0.82,
                        }}
                      >
                        <td
                          style={{
                            padding: "11px 14px",
                            borderLeft: `3px solid ${isSelected ? C.green : "transparent"}`,
                          }}
                        >
                          <span
                            style={{
                              padding: "3px 9px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "#f0f5e8",
                              color: "#2c5c16",
                            }}
                          >
                            {item.brand}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "11px 14px",
                            fontWeight: 700,
                            color: C.ink,
                          }}
                        >
                          {item.name}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          {item.cost > 0 ? (
                            <div>
                              <div style={{ fontWeight: 800, color: C.green }}>
                                {fmtPeso(item.price)}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: C.muted,
                                  fontWeight: 600,
                                }}
                              >
                                cost {fmtPeso(item.cost)} + 12%
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontStyle: "italic",
                                fontWeight: 500,
                                color: C.muted,
                                fontSize: 12,
                              }}
                            >
                              no cost set
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "11px 14px",
                            color: C.muted,
                            fontSize: 12,
                          }}
                        >
                          {item.unit || (
                            <span style={{ fontStyle: "italic" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          {item.listed ? (
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: item.is_visible
                                  ? "#f0f5e8"
                                  : "#fce4ec",
                                color: item.is_visible ? "#2c5c16" : "#c62828",
                              }}
                            >
                              {item.is_visible ? "Visible" : "Hidden"}
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: "#f1f1f1",
                                color: "#8a8a8a",
                              }}
                            >
                              Not Listed
                            </span>
                          )}
                        </td>
                        <td
                          style={{ padding: "11px 14px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 5,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => openEditor(item)}
                              className="msc-btn msc-icon-btn msc-edit"
                              title={
                                item.listed ? "Edit listing" : "List this item"
                              }
                              style={{
                                ...smallBtnSt,
                                border: "1px solid #bbdefb",
                                color: "#1565c0",
                                background: "#e3f2fd",
                              }}
                            >
                              <EditIcon /> {item.listed ? "Edit" : "List"}
                            </button>
                            {item.listed && (
                              <>
                                <button
                                  onClick={() => toggleVisibility(item)}
                                  className="msc-btn msc-icon-btn msc-hide"
                                  title={
                                    item.is_visible
                                      ? "Hide from shop"
                                      : "Show in shop"
                                  }
                                  style={{
                                    ...smallBtnSt,
                                    border: `1px solid ${C.border}`,
                                    color: C.green,
                                  }}
                                >
                                  {item.is_visible ? (
                                    <EyeOffIcon />
                                  ) : (
                                    <EyeIcon />
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteItem(item)}
                                  className="msc-btn msc-icon-btn msc-del"
                                  title="Unlist"
                                  style={{
                                    ...smallBtnSt,
                                    border: "1px solid #ffcdd2",
                                    color: "#e53935",
                                    background: C.white,
                                  }}
                                >
                                  <TrashIcon />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "14px 18px",
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                background: "#F6F7F1",
              }}
            >
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                Showing {pageStartDisplay}-{pageEndDisplay} of{" "}
                {filteredItems.length}
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="msc-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.ink,
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  First
                </button>
                <button
                  type="button"
                  className="msc-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.ink,
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Previous
                </button>

                {visiblePages.map((page) => (
                  <button
                    type="button"
                    key={page}
                    className="msc-btn"
                    onClick={() => setCurrentPage(page)}
                    style={{
                      minWidth: 32,
                      padding: "7px 9px",
                      borderRadius: 8,
                      border: `1px solid ${page === currentPage ? C.green : C.border}`,
                      background: page === currentPage ? C.greenLt : C.white,
                      color: page === currentPage ? C.greenDk : C.ink,
                      fontSize: 11.5,
                      fontWeight: 800,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="msc-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.ink,
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="msc-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.ink,
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Last
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BrandBranchFilter({
  brands,
  activeBrand,
  activeBranch,
  onChangeBrand,
  onChangeBranch,
}) {
  const [brandQ, setBrandQ] = React.useState("");
  const [branchQ, setBranchQ] = React.useState("");
  const [openB, setOpenB] = React.useState(false);
  const [openBr, setOpenBr] = React.useState(false);
  const brandRef = React.useRef(null);
  const branchRef = React.useRef(null);

  React.useEffect(() => {
    const fn = (e) => {
      if (brandRef.current && !brandRef.current.contains(e.target))
        setOpenB(false);
      if (branchRef.current && !branchRef.current.contains(e.target))
        setOpenBr(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selectedBrand = brands.find((b) => b.id === activeBrand);
  const branchList = selectedBrand
    ? (selectedBrand.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      )
    : [];
  const filteredBrands = brands.filter(
    (b) => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()),
  );
  const filteredBranches = branchList.filter(
    (br) => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()),
  );
  const dropSt = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 300,
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    maxHeight: 230,
    overflowY: "auto",
  };
  const optSt = (active) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: active ? C.greenDk : C.ink,
    fontWeight: active ? 700 : 500,
    background: active ? C.greenLt : "transparent",
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div ref={brandRef} style={{ position: "relative", minWidth: 170 }}>
        <div
          onClick={() => {
            setOpenB((v) => !v);
            setBrandQ("");
          }}
          style={{
            ...invInputSt,
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer",
            paddingRight: 30,
            userSelect: "none",
            color: activeBrand ? C.ink : C.muted,
          }}
        >
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {selectedBrand ? selectedBrand.name : "All Brands"}
          </span>
        </div>
        {openB && (
          <div style={dropSt}>
            <div
              style={{
                padding: "7px 9px",
                borderBottom: `1px solid ${C.border}`,
                position: "sticky",
                top: 0,
                background: C.white,
              }}
            >
              <input
                autoFocus
                type="text"
                value={brandQ}
                onChange={(e) => setBrandQ(e.target.value)}
                placeholder="Search brand…"
                onClick={(e) => e.stopPropagation()}
                style={{ ...invInputSt, height: 30, fontSize: 12 }}
              />
            </div>
            <div
              style={optSt(!activeBrand)}
              onMouseDown={() => {
                onChangeBrand(null);
                onChangeBranch(null);
                setBrandQ("");
                setOpenB(false);
              }}
            >
              All Brands
            </div>
            {filteredBrands.map((b) => (
              <div
                key={b.id}
                style={optSt(activeBrand === b.id)}
                onMouseDown={() => {
                  onChangeBrand(b.id);
                  onChangeBranch(null);
                  setBrandQ("");
                  setOpenB(false);
                }}
              >
                {b.name}{" "}
                <span
                  style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}
                >
                  {(b.branches || []).length} branches
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        ref={branchRef}
        style={{
          position: "relative",
          minWidth: 190,
          opacity: activeBrand ? 1 : 0.45,
        }}
      >
        <div
          onClick={() => {
            if (activeBrand) {
              setOpenBr((v) => !v);
              setBranchQ("");
            }
          }}
          style={{
            ...invInputSt,
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: activeBrand ? "pointer" : "not-allowed",
            paddingRight: 30,
            userSelect: "none",
            color: activeBranch ? C.ink : C.muted,
          }}
        >
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {activeBranch ||
              (activeBrand ? "All Branches" : "Select brand first")}
          </span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div
              style={{
                padding: "7px 9px",
                borderBottom: `1px solid ${C.border}`,
                position: "sticky",
                top: 0,
                background: C.white,
              }}
            >
              <input
                autoFocus
                type="text"
                value={branchQ}
                onChange={(e) => setBranchQ(e.target.value)}
                placeholder="Search branch…"
                style={{ ...invInputSt, height: 30, fontSize: 12 }}
              />
            </div>
            <div
              style={optSt(!activeBranch)}
              onMouseDown={() => {
                onChangeBranch(null);
                setOpenBr(false);
              }}
            >
              All Branches
            </div>
            {filteredBranches.map((br) => (
              <div
                key={br}
                style={optSt(activeBranch === br)}
                onMouseDown={() => {
                  onChangeBranch(br);
                  setOpenBr(false);
                }}
              >
                {br}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const REPORT_STATUS = {
  pending: {
    label: "Pending",
    bg: "#faeeda",
    color: "#633806",
    dot: "#BA7517",
  },
  approved: {
    label: "Acknowledged",
    bg: "#eaf3de",
    color: "#27500a",
    dot: "#3B6D11",
  },
};

const API = process.env.REACT_APP_API_URL || "";

function Chip({ label, color, bg, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: bg,
      }}
    >
      {label}{" "}
      <X
        size={9}
        style={{ cursor: "pointer", marginLeft: 2 }}
        onClick={onRemove}
      />
    </span>
  );
}

function SalesReportsContent({ user, brands: propBrands = [] }) {
  const [reports, setReports] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brandBranchFilter, setBrandBranchFilter] = useState({});

  const [activityLog, setActivityLog] = useState([]);

  const [viewReport, setViewReport] = useState(null);
  const [approveReport, setApproveReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [logoB64, setlogoB64] = useState(null);
  const [iFranchise_logoB64, setiFranchise_logoB64] = useState(null);

  const [filterBrand, setFilterBrand] = useState(null);
  const [filterBranch, setFilterBranch] = useState(null);

  const [alertModal, setAlertModal] = useState(null);

  const showAlert = (title, message, type = "info") =>
    setAlertModal({ title, message, type });

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 },
      );
    });
  };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/reports-activity-log`,
      );
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders activity log:", err);
    }
  }, []);

  const logActivity = useCallback(
    async (action, itemName, branchName, changes = null) => {
      try {
        await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/shop-activity-log`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action,
              item_name: itemName,
              branch: branchName,
              performed_by: user?.name || "System",
              role: user?.role || "Unknown",
              changes,
            }),
          },
        );
      } catch (err) {
        console.warn("Activity log failed (non-fatal):", err);
      }
    },
    [user],
  );

  const fetchReports = useCallback(async () => {
    if (reports.length === 0) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await adminModuleFetch(`${API}/reports?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("fetchReports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchReports();
    fetchActivityLog();
  }, [fetchReports, fetchActivityLog]);

  useEffect(() => {
    loadImageAsBase64(franchisync)
      .then(setlogoB64)
      .catch((err) => console.warn("Failed to load left logo:", err));
    loadImageAsBase64Circular(ifranchisejpg)
      .then(setiFranchise_logoB64)
      .catch((err) => console.warn("Failed to load right logo:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // ── Sync open modals when reports state changes ─────────────────
  const syncModals = (updated) => {
    setViewReport((prev) =>
      prev ? updated.find((r) => r.id === prev.id) || prev : null,
    );
    setApproveReport((prev) =>
      prev ? updated.find((r) => r.id === prev.id) || prev : null,
    );
  };

  const patchReport = (updated) => {
    setReports((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      syncModals(next);
      return next;
    });
  };

  const brandList = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (!map[r.brand])
        map[r.brand] = { id: r.brand, name: r.brand, branches: [] };
      if (!map[r.brand].branches.includes(r.branch)) {
        map[r.brand].branches.push(r.branch);
      }
    });
    return Object.values(map);
  }, [reports]);

  const handleApprove = async (report) => {
    setActionLoading(true);
    try {
      const coords = await getBrowserLocation();
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/reports/${report.id}/approve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performedBy: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        },
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      await fetchReports();
      await fetchActivityLog();
      setViewReport(null);
      setApproveReport(null);
      setPdfPreviewUrl(null);
      showAlert(
        "Report Acknowledged",
        `Report #${report.id} has been acknowledged.`,
        "success",
      );
    } catch {
      showAlert(
        "Acknowledgment Failed",
        "Something went wrong while approving this report.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── Export CSV ─────────────────────────
  const handleExport = (brand) => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (filterStatus !== "all") params.set("status", filterStatus);
    window.open(`${API}/reports/export?${params}`, "_blank");
  };

  const allBrands = useMemo(() => {
    return [
      ...new Set(
        reports
          .filter((r) => !filterBrand || r.brand === filterBrand)
          .filter((r) => !filterBranch || r.branch === filterBranch)
          .map((r) => r.brand),
      ),
    ];
  }, [reports, filterBrand, filterBranch]);

  const getBrandBranches = (brand) => [
    ...new Set(reports.filter((r) => r.brand === brand).map((r) => r.branch)),
  ];

  const getBrandReports = (brand) => {
    const branchFilter = brandBranchFilter[brand] || "all";
    return reports.filter((r) => {
      if (r.brand !== brand) return false;
      if (branchFilter !== "all" && r.branch !== branchFilter) return false;
      if (filterBranch && r.branch !== filterBranch) return false; // ← new
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !String(r.id).toLowerCase().includes(q) &&
          !r.submittedBy.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  };

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "submitted").length,
    approved: reports.filter((r) => r.status === "approved").length,
  };

  const downloadReport = (report) => {
    const doc = generatePdfDoc(report);
    const safePeriod = (report.period || "")
      .replace(/→/g, "to")
      .replace(/[^\x00-\x7F]/g, "");
    doc.save(
      `report_${(report.branch || "").replace(/\s+/g, "_")}_${safePeriod.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    );
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const loadImageAsBase64Circular = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        ctx.restore();

        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const generatePdfDoc = (report) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = margin;
    };
    const checkY = (needed = 8) => {
      if (y + needed > pageH - margin) addPage();
    };

    const writeLine = (
      text,
      fontSize = 10,
      style = "normal",
      color = [30, 30, 30],
      indent = 0,
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach((line) => {
        checkY(fontSize * 0.45 + 2);
        doc.text(line, margin + indent, y);
        y += fontSize * 0.45 + 1.5;
      });
    };
    const writeDivider = (color = [180, 180, 180]) => {
      checkY(6);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 4;
    };

    y = margin;
    doc.setFillColor(13, 43, 30);
    doc.rect(0, 0, pageW, 38, "F");

    const circleLogoSize = 12; // small circular iFranchise logo
    const wideLogoW = 34; // wider main logo
    const wideLogoH = 12;
    const gap = 6;
    const logoY = 4;

    const totalWidth = circleLogoSize + gap + wideLogoW;
    const startX = (pageW - totalWidth) / 2;
    try {
      if (iFranchise_logoB64) {
        doc.addImage(
          iFranchise_logoB64,
          "JPEG",
          startX,
          logoY,
          circleLogoSize,
          circleLogoSize,
        );
      }
      if (logoB64) {
        doc.addImage(
          logoB64,
          "JPEG",
          startX + circleLogoSize + gap,
          logoY,
          wideLogoW,
          wideLogoH,
        );
      }
    } catch (err) {
      console.warn("Failed to add logos to PDF:", err);
    }

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("SALES & PERFORMANCE REPORT", pageW / 2, 28, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 220, 190);
    const safePeriod = (report.period || "")
      .replace(/→/g, "to")
      .replace(/[^\x00-\x7F]/g, "");

    doc.setFontSize(8);
    doc.setTextColor(120, 180, 150);
    doc.text("CONFIDENTIAL — FOR INTERNAL USE ONLY", pageW / 2, 34, {
      align: "center",
    });
    y = 46;

    const cleanContent = (report.content || "")
      .replace(/₱/g, "PHP ")
      .replace(/→/g, "to")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "--")
      .replace(/[═─━]+/g, "")
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanContent) {
      writeLine("No report content available.", 10, "normal", [100, 100, 100]);
    } else {
      cleanContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          y += 3;
          return;
        }
        if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
          checkY(14);
          y += 4;
          doc.setFillColor(0, 137, 123);
          doc.rect(margin, y - 4, 3, 9, "F");
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(13, 43, 30);
          doc.text(trimmed, margin + 6, y + 2);
          y += 8;
          writeDivider([0, 137, 123]);
        } else if (/^\d+\.\s+/.test(trimmed)) {
          checkY(8);
          const parts = trimmed.split(/(?<=^\d+\.)\s+/);
          const num = parts[0];
          const rest = parts.slice(1).join(" ");
          doc.setFontSize(9.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 137, 123);
          doc.text(num.replace(".", ""), margin + 2, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(40, 40, 40);
          const wrapped = doc.splitTextToSize(rest, contentW - 10);
          wrapped.forEach((wl, i) => {
            if (i > 0) checkY(6);
            doc.text(wl, margin + 9, y);
            y += 5.5;
          });
        } else {
          writeLine(trimmed, 9.5, "normal", [50, 50, 50]);
          y += 1;
        }
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 247, 245);
      doc.rect(0, pageH - 12, pageW, 12, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 140, 130);
      doc.text(`${report.branch} Branch  |  ${safePeriod}`, margin, pageH - 5);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, {
        align: "right",
      });
    }

    return doc; // return doc instead of calling .save()
  };

  // ── Sub-components (unchanged styling) ─────────────────────────
  const StatusBadge = ({ status }) => {
    const s = REPORT_STATUS[status] || REPORT_STATUS.pending;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background: s.bg,
          color: s.color,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.dot,
            display: "inline-block",
          }}
        />
        {s.label}
      </span>
    );
  };

  const handleViewReport = (report) => {
    const doc = generatePdfDoc(report);
    const url = doc.output("bloburl");
    setViewReport(report);
    setPdfPreviewUrl(url);
  };

  const ModalShell = ({
    title,
    subtitle,
    icon,
    onClose,
    children,
    maxWidth = 500,
  }) => (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            borderRadius: "20px 20px 0 0",
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {icon}
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.75)",
                    marginTop: 1,
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );

  const ReportMetaGrid = ({ report }) => (
    <>
      <div
        style={{
          marginBottom: 16,
          padding: "12px 14px",
          background: "#f0fdf5",
          borderRadius: 12,
          border: "1px solid #d1eedd",
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#5a7a65",
            marginBottom: 5,
          }}
        >
          Submitted By
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#0d2b1e" }}>
          {report.submittedBy}
        </div>
        <div style={{ fontSize: 12, color: "#5a7a65", marginTop: 1 }}>
          {report.role}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Brand", value: report.brand },
          { label: "Branch", value: report.branch },
          { label: "Period", value: fmtPeriod(report.period) },
          { label: "Submitted", value: fmtDate(report.submittedAt) },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              padding: "10px 12px",
              background: "#f8fffe",
              borderRadius: 10,
              border: "1px solid #e0f2f1",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#5a7a65",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e" }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (initialLoading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #d1eedd",
            borderTopColor: "#00897b",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5a7a65" }}>
          Loading reports…
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
          {error}
        </div>
        <button
          onClick={fetchReports}
          style={{
            padding: "9px 22px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Retry
        </button>
      </div>
    );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {viewReport && (
        <ModalShell
          title={`Report #${viewReport.id}`}
          subtitle={viewReport.brand + " · " + viewReport.branch}
          icon={<FileText size={16} color="#fff" />}
          onClose={() => {
            setViewReport(null);
            setPdfPreviewUrl(null);
          }}
          maxWidth={680}
        >
          <ReportMetaGrid report={viewReport} />

          {/* PDF shows immediately — no click needed */}
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #d1eedd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 14px",
                background: "#f0fdf5",
                borderBottom: "1px solid #d1eedd",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#00897b" }}>
                REP-{String(viewReport.id).padStart(5, "0")} ·{" "}
                {fmtPeriod(viewReport.period)}
              </span>
              <button
                onClick={() => downloadReport(viewReport)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#2E7D32,#00897b)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Download size={11} /> Download
              </button>
            </div>
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                style={{
                  width: "100%",
                  height: 500,
                  border: "none",
                  display: "block",
                }}
                title="Report PDF Preview"
              />
            )}
          </div>

          {viewReport.remark && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                background: "#fff3e0",
                borderRadius: 12,
                border: "1px solid #ffcc80",
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#e65100",
                  marginBottom: 4,
                }}
              >
                Return Remark
              </div>
              <div style={{ fontSize: 13, color: "#bf360c" }}>
                {viewReport.remark}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <StatusBadge status={viewReport.status} />
            <div style={{ display: "flex", gap: 8 }}>
              {viewReport.status !== "approved" && (
                <button
                  onClick={() => setApproveReport(viewReport)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#2E7D32,#00897b)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: actionLoading ? 0.7 : 1,
                    boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
                  }}
                >
                  {actionLoading ? (
                    <RefreshCw
                      size={13}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                  ) : (
                    <Check size={14} />
                  )}{" "}
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => {
                  setViewReport(null);
                  setPdfPreviewUrl(null);
                }}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "1px solid #b2dfdb",
                  background: "#f0fdf5",
                  color: "#5a7a65",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* APPROVE modal */}
      {approveReport && (
        <ModalShell
          title={`Acknowledge Report #${approveReport.id}`}
          subtitle={approveReport.brand + " · " + approveReport.branch}
          icon={<Check size={16} color="#fff" />}
          onClose={() => setApproveReport(null)}
          maxWidth={440}
        >
          <ReportMetaGrid report={approveReport} />
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#d1fae5,#e0f2f1)",
              border: "1px solid #a7f3d0",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Check size={18} color="#00897b" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e" }}>
                Confirm Acknowledgment
              </div>
              <div style={{ fontSize: 12, color: "#5a7a65", marginTop: 2 }}>
                This will mark the report as acknowledged. This action cannot be
                undone.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setApproveReport(null)}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "1px solid #b2dfdb",
                background: "#f0fdf5",
                color: "#5a7a65",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleApprove(approveReport)}
              disabled={actionLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: actionLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: actionLoading ? 0.7 : 1,
                boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
              }}
            >
              {actionLoading ? (
                <RefreshCw
                  size={13}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <Check size={14} />
              )}{" "}
              Acknowledge Report
            </button>
          </div>
        </ModalShell>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <BmStatCard
          label="Total Reports"
          value={counts.total}
          icon={<FileText size={20} color="#065f46" />}
          bg="linear-gradient(135deg,#d1fae5,#6ee7b7)"
          sub="All submissions"
        />
        <BmStatCard
          label="Under Review"
          value={counts.reviewed}
          icon={<Search size={20} color="#1e40af" />}
          bg="linear-gradient(135deg,#dbeafe,#93c5fd)"
          sub="Awaiting admin approval"
        />
        <BmStatCard
          label="Reviewed"
          value={counts.reviewed}
          icon={<Search size={20} color="#1e40af" />}
          bg="linear-gradient(135deg,#dbeafe,#93c5fd)"
          sub="Under evaluation"
        />
        <BmStatCard
          label="Acknowledged"
          value={counts.approved}
          icon={<Check size={20} color="#065f46" />}
          bg="linear-gradient(135deg,#d1fae5,#a7f3d0)"
          sub="Completed"
        />
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,168,76,0.13)",
          borderRadius: 16,
          padding: "14px 18px",
          marginBottom: 18,
          boxShadow: "0 1px 8px rgba(0,140,60,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div
            style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}
          >
            <Search
              size={13}
              color="#5a7a65"
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search ID or submitter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...bmInput, paddingLeft: 30, height: 36, width: "100%" }}
            />
            {search && (
              <div
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#5a7a65",
                }}
              >
                <X size={12} />
              </div>
            )}
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              ...bmInput,
              height: 36,
              width: "auto",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Statuses</option>
            {Object.entries(REPORT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Brand + Branch (the fancy component) */}
          <BrandBranchFilter
            brands={brandList}
            activeBrand={filterBrand}
            activeBranch={filterBranch}
            onChangeBrand={(id) => {
              setFilterBrand(id);
              setFilterBranch(null);
            }}
            onChangeBranch={(val) => setFilterBranch(val)}
          />

          {/* Export + Refresh pushed right */}
          <button
            onClick={() => handleExport(filterBrand || null)}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 10,
              border: "1.5px solid #b2dfdb",
              background: "#f0fdf5",
              color: "#00695c",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={fetchReports}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1.5px solid #b2dfdb",
              background: "#fff",
              color: "#5a7a65",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Active filter chips — mirrors inventory pattern */}
        {(search || filterStatus !== "all" || filterBrand || filterBranch) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid #d1eedd",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 11, color: "#5a7a65", fontWeight: 600 }}>
              Active:
            </span>
            {search && (
              <Chip
                label={`"${search}"`}
                color="#3949ab"
                bg="#e8eaf6"
                onRemove={() => setSearch("")}
              />
            )}
            {filterStatus !== "all" && (
              <Chip
                label={REPORT_STATUS[filterStatus]?.label}
                color="#00695c"
                bg="#e0f2f1"
                onRemove={() => setFilterStatus("all")}
              />
            )}
            {filterBrand && !filterBranch && (
              <Chip
                label={brandList.find((b) => b.id === filterBrand)?.name}
                color="#00695c"
                bg="#e8f5e9"
                onRemove={() => {
                  setFilterBrand(null);
                  setFilterBranch(null);
                }}
              />
            )}
            {filterBranch && (
              <Chip
                label={filterBranch}
                color="#00695c"
                bg="#e0f7fa"
                onRemove={() => setFilterBranch(null)}
              />
            )}
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setFilterBrand(null);
                setFilterBranch(null);
              }}
              style={{
                height: 24,
                padding: "0 10px",
                borderRadius: 7,
                border: "1px solid #d1eedd",
                background: "#fff",
                color: "#5a7a65",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* One BmSection per brand */}
      {allBrands.length === 0 ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "#5a7a65",
            fontSize: 13,
            fontStyle: "italic",
          }}
        >
          No reports found.
        </div>
      ) : (
        allBrands.map((brand) => {
          const branches = getBrandBranches(brand);
          const activeBranch = brandBranchFilter[brand] || "all";
          const brandReports = getBrandReports(brand);

          return (
            <BmSection key={brand}>
              <BmSectionHeader
                title={brand}
                icon={<Globe size={16} color="#fff" />}
                right={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.8)",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Branch
                      </span>
                      <select
                        value={activeBranch}
                        onChange={(e) =>
                          setBrandBranchFilter((prev) => ({
                            ...prev,
                            [brand]: e.target.value,
                          }))
                        }
                        style={{
                          height: 30,
                          padding: "0 10px",
                          borderRadius: 8,
                          border: "1.5px solid rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.15)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          outline: "none",
                          appearance: "none",
                        }}
                      >
                        <option
                          value="all"
                          style={{ color: "#0d2b1e", background: "#fff" }}
                        >
                          All branches
                        </option>
                        {branches.map((b) => (
                          <option
                            key={b}
                            value={b}
                            style={{ color: "#0d2b1e", background: "#fff" }}
                          >
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {brandReports.length} report
                      {brandReports.length !== 1 ? "s" : ""}
                    </span>
                    {/* Per-brand export */}
                    <button
                      onClick={() => handleExport(brand)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "1.5px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Download size={11} /> Export
                    </button>
                  </div>
                }
              />
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    minWidth: 780,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Report #",
                        "Submitted By",
                        "Role",
                        "Branch",
                        "Period",
                        "Date Submitted",
                        "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            fontWeight: 800,
                            fontSize: 10.5,
                            color: "#00897b",
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #d1eedd",
                            background: "#f8fffe",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brandReports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            padding: "36px 0",
                            textAlign: "center",
                            color: "#5a7a65",
                            fontSize: 13,
                            fontStyle: "italic",
                          }}
                        >
                          No reports match the current filters.
                        </td>
                      </tr>
                    ) : (
                      brandReports.map((report) => (
                        <tr
                          key={report.id}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f6fef8")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          style={{ borderBottom: "1px solid #f0f8f0" }}
                        >
                          <td
                            style={{
                              padding: "11px 14px",
                              fontWeight: 800,
                              color: "#0d2b1e",
                              fontSize: 12,
                            }}
                          >
                            REP-{String(report.id).padStart(5, "0")}{" "}
                            {/* ← was #{report.id} */}
                          </td>
                          <td
                            style={{
                              padding: "11px 14px",
                              fontWeight: 700,
                              color: "#0d2b1e",
                            }}
                          >
                            {report.submittedBy}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: "rgba(0,137,123,0.1)",
                                color: "#00695c",
                              }}
                            >
                              {report.role}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 12,
                              color: "#5a7a65",
                            }}
                          >
                            {report.branch}
                          </td>
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 12,
                              color: "#5a7a65",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtPeriod(report.period)}
                          </td>
                          <td
                            style={{
                              padding: "11px 14px",
                              fontSize: 11,
                              color: "#5a7a65",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtDate(report.submittedAt)}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <StatusBadge status={report.status} />
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <button
                              onClick={() => handleViewReport(report)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1.5px solid #b2dfdb",
                                background: "#e0f2f1",
                                color: "#00695c",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              <Eye size={13} /> View Report
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </BmSection>
          );
        })
      )}

      <Toast toast={alertModal} onClose={() => setAlertModal(null)} />
    </div>
  );
}

//PROFIILEE
function AlertModal({ message, type = "info", onClose }) {
  const colors = {
    success: {
      bg: "#f0fdf5",
      border: "#a7f3d0",
      Icon: CheckCircle2,
      text: "#059669",
    },
    error: {
      bg: "#fee2e2",
      border: "#fecaca",
      Icon: AlertTriangle,
      text: "#dc2626",
    },
    info: { bg: "#eff6ff", border: "#bfdbfe", Icon: Info, text: "#2563eb" },
  };
  const c = colors[type] || colors.info;
  const AlertIcon = c.Icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: `1px solid ${c.border}`,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: c.bg,
            color: c.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <AlertIcon size={26} />
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#0d2b1e",
            fontWeight: 700,
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "9px 28px",
            borderRadius: 10,
            border: "none",
            background: `linear-gradient(135deg,#2E7D32,#00897b)`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(0,180,90,0.28)",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function SalesProfileContent({ user }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    personalEmail: "",
    role: user?.role || "Sales Admin",
    branch: user?.branch || "",
    brand: user?.brand || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Sales Admin",
      branch: user.branch || "",
      brand: user.brand || "",
    }));
  }, [user]);

  // ── UI modal state ──
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showAlert = (message, type = "info") =>
    setAlertModal({ message, type });
  const showConfirm = (message, onConfirm) =>
    setConfirmModal({ message, onConfirm });

  // ── Keep formData in sync with user prop without re-rendering on every keystroke ──
  const formDataRef = React.useRef(formData);
  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target;
    formDataRef.current = { ...formDataRef.current, [name]: value };
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "newPassword") {
      if (value) {
        setShowPasswordValidation(true);
        setPasswordErrors(validatePasswordStrength(value).errors);
      } else {
        setShowPasswordValidation(false);
        setPasswordErrors([]);
      }
    }
    if (name === "confirmPassword") {
      // live match feedback handled by fieldErrors below
    }
  }, []);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password)) errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      errors.push("specialChar");
    return { isValid: errors.length === 0, errors };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/send-otp-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToSend }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        showAlert(`OTP has been sent to ${emailToSend}`, "success");
      } else
        showAlert(data.message || data.error || "Failed to send OTP.", "error");
    } catch (error) {
      console.error("Error sending OTP:", error);
      showAlert("Failed to send OTP. Please try again.", "error");
    }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError("");
      const emailToVerify = formData.personalEmail || formData.email;
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            email: emailToVerify,
            otp: otp.trim(),
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        setShowSuccessModal(true);
        localStorage.removeItem("user");
        localStorage.removeItem("tempUser");
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 3000);
      } else {
        setOtpError(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setOtpError("Failed to change password. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isUnlocked) return;

    const errs = {};
    const isPasswordChange =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (isPasswordChange) {
      if (!formData.currentPassword)
        errs.currentPassword = "Please enter your current password.";
      if (!formData.newPassword)
        errs.newPassword = "Please enter a new password.";
      else {
        const pv = validatePasswordStrength(formData.newPassword);
        if (!pv.isValid)
          errs.newPassword = "Password does not meet all requirements.";
      }
      if (!formData.confirmPassword) {
        errs.confirmPassword = "Please confirm your new password.";
      } else if (formData.newPassword !== formData.confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }
      if (!formData.personalEmail && !formData.email)
        errs.personalEmail = "An email is required to receive OTP.";

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
      sendOtp();
      setShowOtpModal(true);
    } else {
      updateProfile();
    }
  };

  const updateProfile = async () => {
    try {
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/users/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            branch: user.branch,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        showAlert("Profile updated successfully!", "success");
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsUnlocked(false);
      } else {
        showAlert(data.error || "Failed to update profile.", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Failed to update profile. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    showConfirm("Discard all unsaved changes?", () => {
      setFormData({
        name: user.name,
        email: user.email,
        personalEmail: "",
        role: user.role,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp("");
      setOtpSent(false);
      setShowOtpModal(false);
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setFieldErrors({});
      setIsUnlocked(false);
    });
  };

  if (!user) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#5a7a65",
        }}
      >
        Loading profile...
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // ── Shared input style ──
  const inputStyle = (disabled) => ({
    ...bmInput,
    marginTop: 4,
    background: disabled ? "#f5f8f5" : "#fff",
    color: disabled ? "#9ca3af" : "#0d2b1e",
    cursor: disabled ? "not-allowed" : "text",
    border: disabled ? "1.5px solid #e5e7eb" : "1.5px solid #b2dfdb",
  });

  const PwChecklist = () => (
    <div
      style={{
        marginTop: 8,
        fontSize: 12,
        padding: "10px 14px",
        background: "#f0fdf5",
        borderRadius: 10,
        border: "1.5px solid #b2dfdb",
      }}
    >
      <div
        style={{
          marginBottom: 6,
          fontWeight: 700,
          color: "#0d2b1e",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Password must contain:
      </div>
      {[
        ["minLength", "At least 8 characters"],
        ["uppercase", "Uppercase letter (A-Z)"],
        ["lowercase", "Lowercase letter (a-z)"],
        ["number", "Number (0-9)"],
        ["specialChar", "Special character (!@#$%^&*...)"],
      ].map(([key, text]) => (
        <div
          key={key}
          style={{
            color: passwordErrors.includes(key) ? "#dc2626" : "#059669",
            marginBottom: 3,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            {passwordErrors.includes(key) ? (
              <X size={12} />
            ) : (
              <Check size={12} />
            )}
          </span>{" "}
          {text}
        </div>
      ))}
    </div>
  );

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <span
        style={{
          fontSize: 11,
          color: "#dc2626",
          marginTop: 4,
          display: "block",
          fontWeight: 600,
        }}
      >
        {fieldErrors[name]}
      </span>
    ) : null;

  const EyeToggle = ({ show, onToggle, disabled }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#5a7a65",
        display: "flex",
        alignItems: "center",
        padding: 0,
      }}
    >
      {show ? (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Account Overview Card ── */}
      <div
        style={{
          background: C.white,
          border: "1px solid rgba(0,168,76,0.12)",
          borderRadius: 18,
          boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            padding: "16px 22px",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
            Account Overview
          </span>
        </div>
        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#00695c",
              flexShrink: 0,
              letterSpacing: 1,
              border: "2.5px solid #a7f3d0",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#0d2b1e",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#5a7a65",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5a7a65"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 7L2 7" />
              </svg>
              {user.email}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "rgba(0,137,123,0.1)",
                  color: "#00695c",
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {user.role}
              </span>
              {user.branch && (
                <span
                  style={{
                    background: "#f0fdf5",
                    color: "#0d2b1e",
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "1.5px solid #b2dfdb",
                  }}
                >
                  {user.branch}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: "#f0fdf5",
                border: "1.5px solid #b2dfdb",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#5a7a65",
                  marginBottom: 2,
                }}
              >
                Account Status
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#059669",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{ fontWeight: 800, fontSize: 13, color: "#059669" }}
                >
                  Active
                </span>
              </div>
            </div>
            {user.branch && (
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "#f0fdf5",
                  border: "1.5px solid #b2dfdb",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#5a7a65",
                    marginBottom: 2,
                  }}
                >
                  Branch
                </div>
                <div
                  style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e" }}
                >
                  {user.branch}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lock/Unlock Banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isUnlocked ? "#f0fdf5" : "#f5f8f5",
          border: `1.5px solid ${isUnlocked ? "#b2dfdb" : "#e5e7eb"}`,
          borderRadius: 14,
          padding: "12px 20px",
          marginBottom: 20,
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e" }}>
              {isUnlocked ? "Editing Enabled" : "Profile Locked"}
            </div>
            <div style={{ fontSize: 11, color: "#5a7a65" }}>
              {isUnlocked
                ? "Make your changes and save when done."
                : "Click Unlock to edit your profile."}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isUnlocked) {
              handleCancel();
            } else {
              setIsUnlocked(true);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 10,
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            background: isUnlocked
              ? "linear-gradient(135deg,#dc2626,#ef4444)"
              : "linear-gradient(135deg,#2E7D32,#00897b)",
            color: "#fff",
            boxShadow: isUnlocked
              ? "0 2px 8px rgba(220,38,38,0.3)"
              : "0 2px 8px rgba(0,180,90,0.3)",
          }}
        >
          {isUnlocked ? (
            <>
              <X size={13} /> Cancel
            </>
          ) : (
            <>
              <Unlock size={13} /> Unlock
            </>
          )}
        </button>
      </div>

      {/* ── Two-column: Personal Info + Change Password ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Personal Information Card ── */}
        <div
          style={{
            background: C.white,
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18,
            boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              padding: "16px 22px",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Personal Information
            </span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <FieldError name="name" />
            </div>

            {/* Work Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Work Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <FieldError name="email" />
            </div>

            {/* Personal Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>
                Personal Email{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                  (Optional)
                </span>
              </label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleInputChange}
                placeholder="your.personal@email.com"
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                OTP for password changes will be sent here
              </p>
              <FieldError name="personalEmail" />
            </div>

            {/* Role (always locked) */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                disabled
                style={{ ...inputStyle(true), background: "#f0f0f0" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={!isUnlocked}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: isUnlocked
                    ? "linear-gradient(135deg,#2E7D32,#00897b)"
                    : "#d1d5db",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  boxShadow: isUnlocked
                    ? "0 2px 10px rgba(0,180,90,0.28)"
                    : "none",
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div
          style={{
            background: C.white,
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18,
            boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              padding: "16px 22px",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Change Password
            </span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
            <div
              style={{
                background: isUnlocked ? "#f0fdf5" : "#f5f8f5",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                border: `1.5px solid ${isUnlocked ? C.border : "#e5e7eb"}`,
                fontSize: 12,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isUnlocked
                ? "An OTP will be sent to your email for verification"
                : "Unlock your profile to change your password"}
            </div>

            {/* Current Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Current Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder={
                    isUnlocked ? "Enter current password" : "••••••••"
                  }
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showCurrentPw}
                  onToggle={() => setShowCurrentPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              <FieldError name="currentPassword" />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>New Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showNewPw ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? "Enter new password" : "••••••••"}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showNewPw}
                  onToggle={() => setShowNewPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              {isUnlocked && showPasswordValidation && <PwChecklist />}
              <FieldError name="newPassword" />
            </div>

            {/* Confirm New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Confirm New Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? "Confirm new password" : "••••••••"}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showConfirmPw}
                  onToggle={() => setShowConfirmPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              {/* Live match indicator */}
              {isUnlocked && formData.confirmPassword && (
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: 600,
                    color:
                      formData.newPassword === formData.confirmPassword
                        ? "#059669"
                        : "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <Check size={12} /> Passwords match
                    </>
                  ) : (
                    <>
                      <X size={12} /> Passwords do not match
                    </>
                  )}
                </div>
              )}
              <FieldError name="confirmPassword" />
            </div>

            <button
              type="submit"
              disabled={!isUnlocked}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                background: isUnlocked
                  ? "linear-gradient(135deg,#2E7D32,#00897b)"
                  : "#d1d5db",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: isUnlocked ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                boxShadow: isUnlocked
                  ? "0 2px 10px rgba(0,180,90,0.28)"
                  : "none",
                opacity: isUnlocked ? 1 : 0.6,
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 20,
              padding: "28px 32px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "1.6rem",
                }}
              >
                <Lock size={24} />
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0d2b1e",
                  marginBottom: 6,
                }}
              >
                Verify OTP
              </h2>
              <p style={{ fontSize: 13, color: C.muted }}>
                Code sent to{" "}
                <strong style={{ color: "#0d2b1e" }}>
                  {formData.personalEmail || formData.email}
                </strong>
              </p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Enter 6-Digit OTP</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  setOtpError("");
                }}
                maxLength={6}
                autoFocus
                style={{
                  ...bmInput,
                  marginTop: 6,
                  fontSize: 24,
                  textAlign: "center",
                  letterSpacing: "0.6rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
            {otpSent && !otpError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: 10,
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                OTP sent successfully
              </div>
            )}
            {otpError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fee2e2",
                  borderRadius: 10,
                  border: "1.5px solid #fecaca",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Please try again {otpError}
              </div>
            )}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button
                type="button"
                onClick={sendOtp}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00897b",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Resend OTP
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpSent(false);
                  setOtpError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "1.5px solid #b2dfdb",
                  background: "#f0fdf5",
                  color: "#5a7a65",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtpAndChangePassword}
                disabled={otp.length !== 6}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#2E7D32,#00897b)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: otp.length !== 6 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: otp.length !== 6 ? 0.5 : 1,
                }}
              >
                Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 20,
              padding: "40px 36px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "2.2rem",
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "#0d2b1e",
                marginBottom: 10,
              }}
            >
              Password Changed!
            </h2>
            <p
              style={{
                color: C.muted,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Your password has been updated successfully.
              <br />
              You'll be redirected to login shortly.
            </p>
            <div
              style={{
                background: "#f0fdf5",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 12,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Info size={14} /> Use your new password on the next login
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Modal ── */}
      {alertModal && (
        <AlertModal
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal(null)}
        />
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 32px",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fff7ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 22,
              }}
            >
              <RotateCcw size={22} />
            </div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0d2b1e",
                marginBottom: 8,
              }}
            >
              Discard Changes?
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#5a7a65",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: "9px 22px",
                  borderRadius: 10,
                  border: "1px solid #b2dfdb",
                  background: "#f0fdf5",
                  color: "#5a7a65",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#c2410c,#ea580c)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(194,65,12,0.35)",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ACCOUNT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function generateTempPassword(length = 10) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghjkmnpqrstuvwxyz",
    "23456789",
    "!@#$",
  ];
  const chars = groups.join("");
  const password = [
    ...groups.map((group) => group[Math.floor(Math.random() * group.length)]),
    ...Array.from(
      { length: Math.max(length - groups.length, 0) },
      () => chars[Math.floor(Math.random() * chars.length)],
    ),
  ];
  return password.sort(() => Math.random() - 0.5).join("");
}

function CreateAccountModal({
  applicant,
  onClose,
  onAlert,
  defaultRole = "",
  roles = ["Administrator", "Franchisee"],
}) {
  const [tempPassword] = useState(generateTempPassword());
  const [sending, setSending] = useState(false);

  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [branches, setBranches] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/brands`,
        );
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!selectedBrandId) {
      setBranches([]);
      return;
    }
    const brand = brands.find((b) => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.fullName.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const role = form.role.value;
    const branch = form.branch.value;
    const selectedBrand = brands.find(
      (b) => String(b.id) === String(selectedBrandId),
    );
    const brand = selectedBrand?.name || "";

    setSending(true);
    try {
      const userRes = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password: tempPassword,
            role,
            brand,
            branch,
          }),
        },
      );
      if (!userRes.ok) {
        const err = await userRes.json();
        onAlert(err.error || "Failed to create account.", "error");
        setSending(false);
        return;
      }
      await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/send-credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, name, password: tempPassword }),
        },
      );
      onAlert(`Account created and credentials sent to ${email}!`, "success");
      onClose();
    } catch (err) {
      onAlert("Something went wrong. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 20,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "#0d2b1e",
              margin: 0,
            }}
          >
            Create Account
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #b2dfdb",
              background: "#e0f2f1",
              cursor: "pointer",
              color: "#00695c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
          Creating account for:{" "}
          <strong style={{ color: "#0d2b1e" }}>{applicant?.name}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          {[
            ["Full Name", "fullName", "text", applicant?.name],
            ["Email Address", "email", "email", applicant?.email],
            ["Phone Number", "phone", "tel", applicant?.phone],
          ].map(([label, name, type, def]) => (
            <div key={name} style={{ marginBottom: 14 }}>
              <label style={bmLabel}>{label}</label>
              <input
                name={name}
                type={type}
                defaultValue={def}
                required
                style={{ ...bmInput, marginTop: 4 }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Role</label>
            <select
              name="role"
              required
              defaultValue={defaultRole}
              disabled={roles.length === 1} // lock it if only one option
              style={{
                ...bmInput,
                marginTop: 4,
                appearance: "none",
                cursor: roles.length === 1 ? "not-allowed" : "pointer",
                opacity: roles.length === 1 ? 0.7 : 1,
              }}
            >
              {!defaultRole && <option value="">Select Role</option>}
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Brand</label>
            <select
              name="brand"
              required
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              style={{
                ...bmInput,
                marginTop: 4,
                appearance: "none",
                cursor: "pointer",
              }}
              disabled={brandsLoading}
            >
              <option value="">
                {brandsLoading ? "Loading brands..." : "Select Brand"}
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Assigned Branch</label>
            <select
              name="branch"
              required
              style={{
                ...bmInput,
                marginTop: 4,
                appearance: "none",
                cursor: "pointer",
              }}
              disabled={!selectedBrandId}
            >
              <option value="">
                {!selectedBrandId
                  ? "Select a brand first"
                  : branches.length === 0
                    ? "No branches available"
                    : "Select Branch"}
              </option>
              {branches.map((br) => (
                <option key={br.id ?? br.name} value={br.name ?? br}>
                  {br.name ?? br}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
              A temporary password will be auto-generated and emailed to the
              applicant upon account creation.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "1.5px solid #b2dfdb",
                background: "#f0fdf5",
                color: "#5a7a65",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(0,180,90,0.28)",
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? "Creating..." : " Create & Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const b2bAssessBranch = (row) => {
  const hqRevenue = b2bNullableNum(
    row?.hq_supply_revenue,
    row?.hqRevenue,
    row?.supply_revenue,
  );
  const posRevenue = b2bNullableNum(
    row?.pos_revenue,
    row?.posRevenue,
    row?.franchisee_pos_revenue,
  );
  const stockVariance = b2bNullableNum(row?.stock_variance, row?.stockVariance);
  const orderCoverage = b2bNullableNum(
    row?.order_coverage,
    row?.coverage_pct,
    row?.orderCoverage,
  );
  const amount = (value) =>
    value == null
      ? "not available"
      : `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const evidence = `Recorded HQ supply: ${amount(hqRevenue)}. Recorded POS sales: ${amount(posRevenue)}.`;
  const allowedPos = hqRevenue == null ? null : hqRevenue * 1.12;
  // Compare currency at cent precision so values that display equally
  // (e.g. ₱67,564.72 vs ₱67,564.7168) are treated as equal.
  const posForRisk = posRevenue == null ? null : Number(posRevenue.toFixed(2));
  const allowedForRisk =
    allowedPos == null ? null : Number(allowedPos.toFixed(2));
  let risk;
  let reason;

  if (hqRevenue == null || posRevenue == null) {
    risk = "Insufficient data";
    reason = `${evidence} Load the missing HQ order or POS records for this branch and period.`;
  } else if (hqRevenue === 0 && posRevenue === 0) {
    risk = "No transactions yet";
    reason = `${evidence} No HQ supply or POS activity is recorded for this period.`;
  } else if (hqRevenue === 0 && posRevenue > 0) {
    risk = "High Risk";
    reason = `${evidence} POS sales exceed the HQ supply baseline by more than 12% because the HQ supply is zero.`;
  } else if (posForRisk > allowedForRisk) {
    risk = "High Risk";
    reason = `${evidence} The POS total exceeds the HQ supply plus the allowed 12% variance (${amount(allowedPos)}).`;
  } else {
    risk = "Normal";
    reason = `${evidence} POS is within the allowed 12% variance of HQ supply (${amount(allowedPos)} maximum).`;
  }

  return {
    ...row,
    hqRevenue,
    posRevenue,
    stockVariance,
    orderCoverage,
    risk,
    reason,
  };
};
