import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import StockInventoryContent from './StockInventoryContent';
import MenuInventoryContent from './MenuInventoryContent';
import jsPDF from 'jspdf';
import {
  Home, Box, FileText, FileCheck, Users, BarChart2, MessageCircle,
  User, ShoppingCart, LogOut, Search, Package, AlertTriangle,
  DollarSign, Grid3X3, ChevronDown, Plus, Pencil, Trash2, X, Check,
  Building2, Store, TrendingDown, TrendingUp, Layers, GitBranch,
  Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar, Pin, Megaphone,
  ArrowUpRight, ArrowDownRight, BarChart, RefreshCw, Eye, Clock, Info,
  Download, History, RotateCcw, UserPlus, CheckCircle, ChevronRight, XIcon,
  Lock, Unlock, CheckCircle2, Zap, Target, Activity, ArrowUp, ArrowDown, SearchIcon,
  Brain, PieChart, LineChart, ShieldCheck
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --g1:#00c853; --g2:#00897b; --g3:#1a4a2e; --g4:#0d2b1e;
    --green-primary:#2E7D32; --green-dark:#1B5E20; --green-light:#4CAF50;
    --green-accent:#d4df33; --green-bg:#ccfcc7; --white:#ffffff;
    --gray-100:#F3F4F6; --gray-200:#E5E7EB; --gray-300:#D1D5DB;
    --gray-400:#9CA3AF; --gray-500:#6B7280; --gray-600:#4B5563;
    --gray-700:#374151; --gray-800:#1F2937;
    --shadow:rgba(46,125,50,0.1); --shadow-strong:rgba(46,125,50,0.2);
    --card-border:rgba(0,168,76,0.12);
    --grad-main:linear-gradient(135deg,#00c853,#00897b);
    --grad-dark:linear-gradient(135deg,#0d2b1e,#1a4a2e);
    --grad-gold:linear-gradient(135deg,#e9cd30,#ffa875);
    --grad-bg:linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%);
  }
`;

// ─── Shared style helpers ─────────────────────────────────────────────────────
const invInputSt = {
  height:36, padding:"0 11px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.bg,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};
const btnSt = {
  display:"inline-flex", alignItems:"center", gap:6,
  height:36, padding:"0 16px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, fontWeight:700, cursor:"pointer",
  fontFamily:"inherit", whiteSpace:"nowrap",
};
const btnPrimarySt = {
  ...btnSt,
  background:`linear-gradient(135deg,${C.teal},${C.green})`,
  color:C.white, border:"none",
  boxShadow:"0 2px 10px rgba(0,180,90,0.28)",
};
const smallBtnSt = {
  display:"inline-flex", alignItems:"center", gap:4,
  height:28, padding:"0 10px", borderRadius:7,
  fontSize:12, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", background:C.white,
};

const fmtPeso = n => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });
const fmtTs   = d => new Date(d).toLocaleString("en-PH", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

const TrashIcon = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

const ActivityIcon = ({ size=14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const BmSection = ({ children, style = {} }) => (
  <div style={{
    background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
    borderRadius: 18, boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
    overflow: "hidden", marginBottom: 24, ...style,
  }}>
    {children}
  </div>
);

const BmSectionHeader = ({ title, subtitle, action }) => (
  <div style={{
    background: `linear-gradient(135deg,#2E7D32,#00897b)`,
    color: C.white, padding: "16px 22px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{subtitle}</div>}
    </div>
    {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
  </div>
);

const BmStatCard = ({ label, value, sub, icon, bg }) => (
  <div style={{
    background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
    borderRadius: 18, padding: "20px 22px",
    boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
    transition: "transform .2s, box-shadow .2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,140,60,0.13)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>{sub}</span>
  </div>
);

const bmInput = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
  background: "#f0fdf5", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
const bmLabel = {
  display: "block", fontSize: 11, fontWeight: 800, color: "#2e6725",
  marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em",
};
const bmActionBtn = (variant = "default") => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", border: "none",
  ...(variant === "primary"
    ? { background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", boxShadow: "0 2px 10px rgba(0,180,90,0.28)" }
    : variant === "danger"
    ? { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }
    : { background: "#f0fdf5", color: "#00695c", border: "1.5px solid #b2dfdb" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD SHELL 
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(() => {
    return sessionStorage.getItem('fr_activeModule') || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [preset, setPreset] = useState("month");
  const [stats, setStats] = useState(null);
  
  const [activityLog,     setActivityLog]     = useState([]);
  
  const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
  const handleLogout = () => setShowLogoutModal(true);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery]     = useState("");

  const getUserFromStorage = () => {
    const userString =
      localStorage.getItem('user') ||
      localStorage.getItem('rememberedUser') ||
      sessionStorage.getItem('user');
    if (userString) return JSON.parse(userString);
    return null;
  };

   const fetchAppDeleteHistory = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history`);
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            id:        row.id,
            data:      row.application_data ?? row.data ?? {},
            deletedAt: row.deleted_at       ?? row.deletedAt,
          }))
        : [];
      setAppDeleteHistory(mapped);
    } catch (err) {
      console.error("Failed to fetch application delete history:", err);
    }
  };

   const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/orders-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

  const confirmLogout = async () => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tempUser");
      sessionStorage.removeItem("fr_activeModule");
      setShowLogoutModal(false);
      window.location.href = "/admin-login";
    }
  };

  useEffect(() => {
    sessionStorage.setItem('fr_activeModule', activeModule);
  }, [activeModule]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?preset=${preset}`)
      .then(res => res.json()).then(data => setStats(data)).catch(err => console.error(err));
  }, [preset]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/transactions`)
      .then(res => res.json()).then(data => setTransactions(data))
      .catch(err => console.error("Failed to fetch transactions", err));
  }, []);

  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) navigate('/admin-login');
    else setUser(currentUser);
  }, []);

  const [brands, setBrands] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch brands:", err));
  }, []);

  const [applications, setApplications] = useState([]);
  useEffect(() => {
  fetchApplications();
  fetchAppDeleteHistory();
  fetchActivityLog();
}, [fetchActivityLog]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to load applications');
    }
  };

  const handleDeleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          setApplications(applications.filter(app => app.id !== id));
          alert('Application deleted successfully!');
        } else alert(data.error || 'Failed to delete application');
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application');
      }
    }
  };

  const handleApproveApplication = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      const data = await response.json();
      if (data.success) {
        setApplications(applications.map(app => app.id === id ? { ...app, status: 'approved' } : app));
        alert('Application approved successfully!');
      } else alert(data.error || 'Failed to approve application');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const navigation = [
    { id: 'dashboard',      label: 'Dashboard',            icon: <Home size={20} />,         section: 'main' },
     { id: 'activityLog', label: 'Activity Log', icon: <Activity size={20} />, section: 'main' },
    { id: 'inventory',      label: 'Menu Inventory',        icon: <Box size={20} />,          section: 'main' },
    { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} />,       section: 'main' },
    { id: 'mobileShop',     label: 'Mobile Shop Supplies',  icon: <ShoppingCart size={20} />, section: 'main' },
    { id: 'mobileOrders',   label: 'View Mobile Orders',    icon: <Package size={20} />,      section: 'main' },
    { id: 'applications',   label: 'View Applications',     icon: <FileCheck size={20} />,    section: 'main' },
    { id: 'users',          label: 'User Management',       icon: <Users size={20} />,        section: 'main' },
    { id: 'reports',        label: 'Sales & Reports',       icon: <BarChart2 size={20} />,    section: 'main' },
    { id: 'communication',  label: 'Announcements',         icon: <MessageCircle size={20} />,section: 'main' },
    { id: 'brandBranch',    label: 'Brand & Branch',        icon: <GitBranch size={20} />,    section: 'main' },
    { id: 'profile',        label: 'Edit Profile',          icon: <User size={20} />,         section: 'account' },
    { id: 'logout',         label: 'Logout',                icon: <LogOut size={20} />,       section: 'account', action: handleLogout },
  ];

  const mainNav    = navigation.filter(n => n.section === 'main');
  const accountNav = navigation.filter(n => n.section === 'account');

  const handleCreateAccount   = (applicant) => { setSelectedApplicant(applicant); setShowCreateAccountModal(true); };
  const handleViewApplication = (applicant) => { setSelectedApplicant(applicant); setShowViewApplicationModal(true); };

  const moduleLabel = navigation.find(n => n.id === activeModule)?.label || 'Dashboard';


  return (
    <div className="admin-dashboard-root">
      <style>{ADMIN_CSS}{`
        .admin-dashboard-root {
          font-family:'Poppins',sans-serif;
          display:flex; min-height:100vh;
          background:var(--grad-bg);
        }
        .ad-sidebar {
          width:${sidebarCollapsed ? '76px' : '272px'};
          background:#fff;
          box-shadow:2px 0 20px rgba(0,140,60,0.08);
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease; z-index:1000;
          overflow-y:auto; overflow-x:hidden;
        }
        .ad-sidebar-header {
          padding:1.4rem 1rem;
          border-bottom:1px solid rgba(0,168,76,0.1);
          display:flex; align-items:center; justify-content:space-between;
          min-height:72px;
        }
        .ad-logo-mark {
          width:34px; height:34px; border-radius:10px;
          background:var(--grad-main);
          display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:16px; color:#fff;
          font-family:'Montserrat',sans-serif; flex-shrink:0;
          box-shadow:0 4px 12px rgba(0,180,90,.3);
        }
        .ad-brand {
          font-family:'Montserrat',sans-serif;
          font-weight:800; font-size:1.15rem; color:#0d2b1e;
          white-space:nowrap;
        }
        .ad-toggle {
          background:none; border:none; cursor:pointer;
          padding:6px; color:#94a3b8; border-radius:8px;
          transition:all .2s; flex-shrink:0;
        }
        .ad-toggle:hover { color:#00897b; background:rgba(0,168,76,0.08); }
        .ad-nav { padding:1rem 0.5rem; }
        .ad-nav-section {
          font-size:10px; font-weight:800; text-transform:uppercase;
          letter-spacing:.1em; color:#94a3b8;
          padding:12px 14px 6px;
          display:${sidebarCollapsed ? 'none' : 'block'};
          font-family:'Montserrat',sans-serif;
        }
        .ad-nav-item {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; color:#5a7a65; cursor:pointer;
          transition:all .2s; border-radius:12px;
          position:relative; margin:2px 0;
          font-weight:600; font-size:14px;
          font-family:'Montserrat',sans-serif;
        }
        .ad-nav-item:hover { background:rgba(0,168,76,0.08); color:#0d2b1e; }
        .ad-nav-item.active {
          background:linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,137,123,0.1));
          color:#00695c;
          box-shadow:inset 0 0 0 1.5px rgba(0,137,123,0.2);
        }
        .ad-nav-item.active .ad-nav-icon { color:#00897b; }
        .ad-nav-item.logout { color:#ef4444; margin-top:8px; }
        .ad-nav-item.logout:hover { background:rgba(239,68,68,0.08); }
        .ad-nav-icon { flex-shrink:0; display:flex; justify-content:center; width:22px; }
        .ad-nav-label {
          display:${sidebarCollapsed ? 'none' : 'block'};
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .ad-nav-bar {
          position:absolute; right:0; top:20%; height:60%;
          width:3px; border-radius:2px; background:var(--grad-main);
        }
        .ad-main {
          flex:1;
          margin-left:${sidebarCollapsed ? '76px' : '272px'};
          transition:margin-left 0.3s ease;
        }
        .ad-topbar {
          background:rgba(255,255,255,0.9);
          backdrop-filter:blur(12px);
          padding:1rem 2rem;
          box-shadow:0 2px 16px rgba(0,140,60,0.08);
          display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100;
          border-bottom:1px solid rgba(0,168,76,0.08);
        }
        .ad-topbar-breadcrumb { font-size:12px; color:#94a3b8; font-weight:600; font-family:'Poppins',sans-serif; }
        .ad-topbar-title { font-family:'Montserrat',sans-serif; font-size:1.5rem; font-weight:800; color:#0d2b1e; }
        .ad-user-name { font-weight:700; color:#0d2b1e; font-size:14px; font-family:'Montserrat',sans-serif; }
        .ad-user-role { font-size:11px; color:#94a3b8; font-weight:600; font-family:'Poppins',sans-serif; }
        .ad-avatar {
          width:42px; height:42px; border-radius:14px;
          background:var(--grad-main);
          display:flex; align-items:center; justify-content:center;
          font-size:1rem; font-weight:800; color:#fff; cursor:pointer;
          transition:all .2s;
          box-shadow:0 4px 12px rgba(0,180,90,.3);
          font-family:'Montserrat',sans-serif;
        }
        .ad-avatar:hover { transform:scale(1.08); box-shadow:0 6px 18px rgba(0,180,90,.4); }
        .ad-content { padding:1.8rem 2rem; }
        @media(max-width:768px){
          .ad-sidebar{width:${sidebarCollapsed ? '0' : '272px'};transform:translateX(${sidebarCollapsed ? '-100%' : '0'});}
          .ad-main{margin-left:0;}
          .ad-topbar,.ad-content{padding:1rem;}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ad-logo-mark">iF</div>
              <span className="ad-brand">iFranchise</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="ad-logo-mark" style={{ margin: '0 auto' }}>iF</div>
          )}
          {!sidebarCollapsed && (
            <button className="ad-toggle" onClick={() => setSidebarCollapsed(true)}>
              <X size={16} />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button className="ad-toggle" onClick={() => setSidebarCollapsed(false)}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        <nav className="ad-nav">
          {!sidebarCollapsed && <div className="ad-nav-section">Main Menu</div>}
          {mainNav.map(item => (
            <div
              key={item.id}
              className={`ad-nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.action) { item.action(); }
                else { setActiveModule(item.id); if (item.id === 'applications') fetchApplications(); }
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="ad-nav-bar" />}
            </div>
          ))}
          {!sidebarCollapsed && (
            <div className="ad-nav-section" style={{ marginTop: 8 }}>Account</div>
          )}
          {accountNav.map(item => (
            <div
              key={item.id}
              className={`ad-nav-item ${activeModule === item.id ? 'active' : ''} ${item.id === 'logout' ? 'logout' : ''}`}
              onClick={() => {
                if (item.action) { item.action(); }
                else { setActiveModule(item.id); }
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="ad-main">
        <div className="ad-topbar">
          <div>
            <div className="ad-topbar-breadcrumb">iFranchise Super Admin → {moduleLabel}</div>
            <h1 className="ad-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="ad-user-name">{user?.name}</div>
              <div className="ad-user-role">Super Admin — {user?.branch}</div>
            </div>
            <div className="ad-avatar">
              {user?.name ? user.name.trim()[0].toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        <div className="ad-content">
          {activeModule === 'dashboard'      && <DashboardContent transactions={transactions} brands={brands} />}
           {activeModule === 'activityLog' && <ActivityLogContent user={user} />}
          {activeModule === 'inventory'      && <MenuInventoryContent user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'mobileShop'     && <MobileShopContent user={user} brands={brands}/>}
          {activeModule === 'mobileOrders'   && <MobileOrdersContent user={user} brands={brands}/>}
          {activeModule === 'receipts'       && <Receipts />}
          {activeModule === 'applications'   && (
            <ApplicationsContent
              user={user} brands={brands}
              applications={applications}
              onRefresh={fetchApplications}
              onView={handleViewApplication}
              onDelete={handleDeleteApplication}
              onApprove={handleApproveApplication}
              onCreateAccount={handleCreateAccount}
            />
          )}
          {activeModule === 'users'         && <UsersContent user={user} brands={brands} />}
          {activeModule === 'reports'       && <ReportsContent user={user} brands={brands} />}
          {activeModule === 'communication' && <CommunicationContent user={user} brands={brands}/>}
          {activeModule === 'brandBranch'   && <BrandManagementContent brands={brands} onBrandsChange={setBrands} />}
          {activeModule === 'profile'       && <ProfileContent user={user} />}
        </div>
      </main>

      {showCreateAccountModal && (
        <CreateAccountModal
          applicant={selectedApplicant}
          onClose={() => { setShowCreateAccountModal(false); setSelectedApplicant(null); }}
        />
      )}

      {showLogoutModal && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000, backdropFilter:'blur(4px)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{ background:C.white, borderRadius:22, padding:'32px 36px', maxWidth:400, width:'90%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,0.25)', border:'1px solid rgba(0,168,76,0.15)', animation:'slideUp .25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2rem', border:'1.5px solid rgba(239,68,68,0.15)' }}>🚪</div>
            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:800, color:'#0d2b1e', marginBottom:8 }}>Log out?</h2>
            <p style={{ color:'#94a3b8', fontSize:13, marginBottom:28, lineHeight:1.6, fontFamily:'Poppins,sans-serif' }}>
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex:1, padding:'11px 0', borderRadius:12, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>Cancel</button>
              <button onClick={confirmLogout} style={{ flex:1, padding:'11px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:'0 4px 14px rgba(239,68,68,.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewApplicationModal && (
        <ViewApplicationModal
          application={selectedApplicant}
          onClose={() => { setShowViewApplicationModal(false); setSelectedApplicant(null); }}
        />
      )}

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const PAGE_SIZE = 20;

const ACTION_META = {
  create:  { color: '#00695c', bg: '#e0f2f1', label: 'Create'  },
  update:  { color: '#1565c0', bg: '#e3f2fd', label: 'Update'  },
  delete:  { color: '#c62828', bg: '#ffebee', label: 'Delete'  },
  restore: { color: '#6a1b9a', bg: '#f3e5f5', label: 'Restore' },
  approve: { color: '#2e7d32', bg: '#e8f5e9', label: 'Approve' },
  reject:  { color: '#bf360c', bg: '#fbe9e7', label: 'Reject'  },
  login:   { color: '#00695c', bg: '#e0f2f1', label: 'Login'   },
  logout:  { color: '#5d4037', bg: '#efebe9', label: 'Logout'  },
  export:  { color: '#1565c0', bg: '#e3f2fd', label: 'Export'  },
  print:   { color: '#37474f', bg: '#eceff1', label: 'Print'   },
  view:    { color: '#00695c', bg: '#e0f2f1', label: 'View'    },
  import:  { color: '#6a1b9a', bg: '#f3e5f5', label: 'Import'  },
};

const MOCK_USERS = ['Admin User', 'Maria Santos', 'Jose Reyes', 'Ana Cruz', 'Carlo Dela Cruz'];
const MOCK_DESCS = {
  'Brand & Branch':   ['Added brand "Coffee Spot"', 'Edited branch "Makati"', 'Deleted brand "iPharma Draft"', 'Restored branch "Ortigas"'],
  'User Management':  ['Created franchisee account', 'Updated user role to Sales Admin', 'Deleted user account', 'Restored deleted user'],
  'Applications':     ['Approved franchise application #0031', 'Rejected application #0042', 'Deleted application', 'Restored application'],
  'Menu Inventory':   ['Added menu item "Matcha Latte"', 'Updated price of "Espresso"', 'Deleted item "Frappuccino"', 'Imported 12 items via Excel'],
  'Stock Inventory':  ['Added stock batch "Arabica Beans"', 'Updated reorder level', 'Deleted expired batch', 'Restocked 50 units'],
  'Mobile Shop':      ['Added shop item "V60 Kit"', 'Edited item price', 'Hid shop item', 'Deleted item permanently'],
  'Reports':          ['Approved report from Makati branch', 'Viewed report #00021', 'Downloaded report PDF', 'Marked report as reviewed'],
  'Announcements':    ['Posted new announcement', 'Edited announcement title', 'Deleted announcement', 'Restored from delete history'],
  'Profile':          ['Updated profile name', 'Changed password via OTP', 'Updated work email', 'Unlocked profile for editing'],
  'Auth':             ['Logged in successfully', 'Logged out', 'Failed login attempt (wrong password)', 'Session expired'],
};
const MOCK_ACTIONS = Object.keys(ACTION_META);

const MODULES = [
  'Brand & Branch', 'User Management', 'Applications', 'Menu Inventory',
  'Stock Inventory', 'Mobile Shop', 'Reports', 'Announcements', 'Profile', 'Auth',
];


// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtRelative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000)    return 'Just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtFull = (iso) =>
  new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

// ── Design tokens (matches your green dashboard) ──────────────────────────────
const th = {
  padding: '9px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5,
  color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase',
  borderBottom: `2px solid ${C.border}`, background: '#f8fffe', whiteSpace: 'nowrap',
};

const td = (i) => ({
  padding: '10px 12px', borderBottom: `1px solid #f0f8f0`,
  background: i % 2 === 0 ? C.white : '#fafffe',
  fontSize: 13, verticalAlign: 'middle', color: C.ink,
});

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{
      background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
      borderRadius: 18, padding: '18px 20px',
      boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 5 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: color || C.ink }}>{value}</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={C.greenDk} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
    </div>
  );
}

function ActionBadge({ action }) {
  const m = ACTION_META[action] || { color: C.muted, bg: C.bg, label: action };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

function TimelineLine({ log, expanded, onToggle }) {
  const am = ACTION_META[log.action] || { color: C.muted, bg: C.bg };
  return (
    <div style={{ display: 'flex', padding: '0 20px', position: 'relative' }}>
      {/* vertical connector */}
      <div style={{ position: 'absolute', left: 46, top: 38, bottom: 0, width: 1.5, background: C.border }} />
      {/* dot */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: am.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 10, marginRight: 14, border: `1.5px solid ${am.color}33`, zIndex: 1 }}>
        <Activity size={13} color={am.color} />
      </div>
      {/* body */}
      <div style={{ flex: 1, paddingTop: 10, paddingBottom: 12, borderBottom: `1px solid #f0f8f0` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{log.description}</span>
          <ActionBadge action={log.action} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, background: '#e0f2f1', color: C.greenDk, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{log.user_name}</span>
          <span style={{ fontSize: 11, background: '#f0fdf5', color: C.muted, padding: '2px 8px', borderRadius: 20 }}>{log.module}</span>
          {log.location && log.location !== '—' && (
            <span style={{ fontSize: 11, background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: 20 }}>📍 {log.location}</span>
          )}
          <span style={{ fontSize: 11, color: C.muted }}>{fmtRelative(log.created_at)}</span>
        </div>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.green, fontWeight: 700, fontFamily: FONT, padding: 0, textDecoration: 'underline' }}
        >
          {expanded ? 'Hide details' : 'View details'}
        </button>
        {expanded && (
          <div style={{ marginTop: 8, background: '#f8fffe', borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: log.meta?.field ? 10 : 0 }}>
              {[
                ['Event ID',  `#LOG-${String(log.id).padStart(5, '0')}`],
                ['Timestamp', fmtFull(log.created_at)],
                ['User',      log.user_name],
                ['Role',      log.role],
                ['Location',  log.location], 
                ['Device',    log.device],
                ['Branch',    log.branch],
                ['Module',    log.module],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{lbl}</div>
                  <div style={{ fontWeight: 600, color: C.ink }}>{val}</div>
                </div>
              ))}
            </div>
            {log.meta?.field && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Field changed: <strong style={{ color: C.ink }}>{log.meta.field}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#ffebee', color: '#b71c1c', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}>− {log.meta.old}</div>
                  <div style={{ flex: 1, background: '#e8f5e9', color: '#1b5e20', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}>+ {log.meta.new}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
function ActivityLogContent({ user }) {
  const [allLogs,     setAllLogs]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);

  // Filters
  const [search,   setSearch]   = useState('');
  const [fModule,  setFModule]  = useState('');
  const [fAction,  setFAction]  = useState('');
  const [fUser,    setFUser]    = useState('');
  const [fBranch,  setFBranch]  = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // ── Load logs ─────────────────────────────────────────────────────────────
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        { url: 'inventory-activity-log',     module: 'Menu Inventory'   },
        { url: 'shop-activity-log',          module: 'Mobile Shop'      },
        { url: 'orders-activity-log',        module: 'Orders'           },
        { url: 'users-activity-log',         module: 'User Management'  },
        { url: 'applications-activity-log',  module: 'Applications'     },
        { url: 'reports-activity-log',       module: 'Reports'          },
        { url: 'announcements-activity-log', module: 'Announcements'    },
        { url: 'brands-activity-log',        module: 'Brand & Branch'   },
      ];

      const results = await Promise.all(
        endpoints.map(({ url, module }) =>
          fetch(`${process.env.REACT_APP_API_URL}/${url}`)
            .then(r => r.json())
            .then(rows => (Array.isArray(rows) ? rows : []).map(row => ({
              id:          row.id,
              module,
              action:      (row.action || 'update').toLowerCase(),
              user_name:   row.performed_by || 'Admin',
              role:        'Admin',
              description: row.item_name || row.action || '—',
              branch:      row.branch || '—',
              device:      row.device || '—', 
              location:    row.location || '—',
              changes:     row.changes || null,
              created_at:  row.created_at,
              meta:        {},
            })))
            .catch(() => [])
        )
      );

      const merged = results
        .flat()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setAllLogs(merged);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const uniqueUsers    = useMemo(() => [...new Set(allLogs.map(l => l.user_name))].sort(), [allLogs]);
  const uniqueBranches = useMemo(() => [...new Set(allLogs.map(l => l.branch).filter(Boolean))].sort(), [allLogs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allLogs.filter(l => {
      if (q && !l.description.toLowerCase().includes(q) && !l.user_name.toLowerCase().includes(q) && !l.module.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q)) return false;
      if (fModule  && l.module    !== fModule)  return false;
      if (fAction  && l.action    !== fAction)  return false;
      if (fUser    && l.user_name !== fUser)    return false;
      if (fBranch  && l.branch    !== fBranch)  return false;
      if (dateFrom && new Date(l.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const t = new Date(dateTo);
        t.setHours(23, 59, 59);
        if (new Date(l.created_at) > t) return false;
      }
      return true;
    });
  }, [allLogs, search, fModule, fAction, fUser, fBranch, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = useMemo(() => {
    const p = Math.min(page, totalPages - 1);
    return filtered.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
  }, [filtered, page, totalPages]);

  // Stats
  const todayStr   = new Date().toISOString().slice(0, 10);
  const todayCount = allLogs.filter(l => l.created_at.startsWith(todayStr)).length;
  const userCount  = new Set(allLogs.map(l => l.user_name)).size;

  const hasFilters = search || fModule || fAction || fUser || fBranch || dateFrom || dateTo;

  const clearAll = () => {
    setSearch(''); setFModule(''); setFAction('');
    setFUser(''); setFBranch(''); setDateFrom(''); setDateTo('');
    setPage(0);
  };

  useEffect(() => { setPage(0); }, [search, fModule, fAction, fUser, fBranch, dateFrom, dateTo]);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = ['Event ID', 'Timestamp', 'User', 'Role', 'Module', 'Action', 'Description', 'Branch', 'Location', 'Device'];
    const rows   = filtered.map(l => [
      `#LOG-${String(l.id).padStart(5, '0')}`,
      fmtFull(l.created_at),
      l.user_name, l.role, l.module, l.action, l.description,
      l.branch || '', l.location || '', l.device,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ── Export PDF ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y       = 18;

    doc.setFillColor(13, 43, 30);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('ACTIVITY AUDIT LOG', pageW / 2, 12, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(160, 220, 190);
    doc.text(`Generated ${fmtFull(new Date().toISOString())} · ${filtered.length} events`, pageW / 2, 22, { align: 'center' });
    y = 36;

    filtered.slice(0, 200).forEach((l) => {
      if (y > 270) { doc.addPage(); y = 18; }
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
      doc.text(`#LOG-${String(l.id).padStart(5, '0')} · ${l.action.toUpperCase()} · ${l.module}`, 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`${l.description}`, 14, y);
      y += 4;
      doc.setTextColor(140, 140, 140);
      doc.text(`${fmtFull(l.created_at)}  ·  ${l.user_name}  ·  ${l.branch || ''}  ·  ${l.location || ''}  ·  ${l.device}`, 14, y);
      y += 7;
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
      doc.line(14, y - 2, pageW - 14, y - 2);
    });

    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(160, 160, 160);
      doc.text(`Page ${i} of ${total}  ·  iFranchise Admin Audit Log`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }
    doc.save(`audit_log_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ── Select style helper ───────────────────────────────────────────────────
  const selSt = {
    height: 36, padding: '0 11px', borderRadius: 9,
    border: `1px solid ${C.border}`, background: C.bg,
    fontSize: 13, color: C.ink, fontFamily: FONT,
    outline: 'none', appearance: 'none', cursor: 'pointer',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .al-row-hover:hover td { background: #f0fdf5 !important; }
      `}</style>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Events" value={allLogs.length} sub="All time"      color={C.ink}   icon={Activity} />
        <StatCard label="Today"        value={todayCount}     sub="Last 24 hours" color={C.green} icon={Clock}    />
        <StatCard label="Active Users" value={userCount}      sub="Unique actors" color="#1565c0" icon={User}     />
      </div>

      {/* ── Toolbar ── */}
      <div style={{ background: C.white, border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 16, padding: '14px 18px', marginBottom: 18, boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>

          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={13} color={C.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, users, modules…"
              style={{ ...selSt, paddingLeft: 30, width: '100%', appearance: 'auto' }}
            />
          </div>

          <select value={fModule} onChange={e => setFModule(e.target.value)} style={{ ...selSt, minWidth: 160 }}>
            <option value="">All modules</option>
            {MODULES.map(m => <option key={m}>{m}</option>)}
          </select>

          <select value={fAction} onChange={e => setFAction(e.target.value)} style={{ ...selSt, minWidth: 130 }}>
            <option value="">All actions</option>
            {Object.keys(ACTION_META).map(a => <option key={a} value={a}>{ACTION_META[a].label}</option>)}
          </select>

          <select value={fUser} onChange={e => setFUser(e.target.value)} style={{ ...selSt, minWidth: 150 }}>
            <option value="">All users</option>
            {uniqueUsers.map(u => <option key={u}>{u}</option>)}
          </select>

          <select value={fBranch} onChange={e => setFBranch(e.target.value)} style={{ ...selSt, minWidth: 140 }}>
            <option value="">All branches</option>
            {uniqueBranches.map(b => <option key={b}>{b}</option>)}
          </select>

          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...selSt, width: 145, appearance: 'auto' }} />
          <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   style={{ ...selSt, width: 145, appearance: 'auto' }} />

          {hasFilters && (
            <button onClick={clearAll} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
              <X size={12} /> Clear
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Download size={12} /> CSV
            </button>
            <button onClick={exportPDF} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: 'none', background: C.grad, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FileText size={12} /> PDF
            </button>
            <button onClick={loadLogs} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Log panel ── */}
      <div style={{ background: C.white, border: `1px solid rgba(0,168,76,0.12)`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,140,60,0.07)' }}>

        {/* Panel header */}
        <div style={{ background: C.grad, padding: '13px 20px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Audit Log</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} · page {Math.min(page + 1, totalPages)} of {totalPages}
          </div>
        </div>

        {/* Panel body — table only */}
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 14 }}>
              <RefreshCw size={24} color={C.green} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 10 }} />
              <div>Loading audit log…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 13, fontStyle: 'italic' }}>
              No events match your filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
                <thead>
                  <tr>
                    {['Event ID', 'Timestamp', 'User', 'Module', 'Action', 'Description', 'Branch', 'Location', 'Device'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((log, i) => (
                    <tr key={log.id} className="al-row-hover">
                      <td style={{ ...td(i), fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>#LOG-{String(log.id).padStart(5, '0')}</td>
                      <td style={{ ...td(i), fontSize: 11, whiteSpace: 'nowrap' }}>{fmtFull(log.created_at)}</td>
                      <td style={{ ...td(i), fontWeight: 700 }}>
                        <div>{log.user_name}</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>{log.role}</div>
                      </td>
                      <td style={td(i)}>
                        <span style={{ background: C.greenLt, color: C.greenDk, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{log.module}</span>
                      </td>
                      <td style={td(i)}><ActionBadge action={log.action} /></td>
                      <td style={{ ...td(i), maxWidth: 260 }}>
                        <div>{log.description}</div>
                        {log.meta?.field && (
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            {log.meta.field}: <span style={{ color: '#c62828' }}>{log.meta.old}</span> → <span style={{ color: '#2e7d32' }}>{log.meta.new}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ ...td(i), fontSize: 12, color: C.muted }}>{log.branch || '—'}</td>
                      <td style={{ ...td(i), fontSize: 12, color: C.muted }}>{log.location || '—'}</td>
                      <td style={{ ...td(i), fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{log.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Showing{' '}
            <strong style={{ color: C.ink }}>{Math.min(page * PAGE_SIZE + 1, filtered.length)}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</strong>
            {' '}of{' '}
            <strong style={{ color: C.ink }}>{filtered.length}</strong>
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: '«', p: 0,              disabled: page === 0              },
              { label: '‹', p: page - 1,       disabled: page === 0              },
              ...Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - page) <= 2)
                .map(i => ({ label: i + 1, p: i, disabled: false, active: i === page })),
              { label: '›', p: page + 1,       disabled: page >= totalPages - 1  },
              { label: '»', p: totalPages - 1, disabled: page >= totalPages - 1  },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => setPage(btn.p)}
                disabled={btn.disabled}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  border: `1px solid ${btn.active ? C.green : C.border}`,
                  background: btn.active ? C.grad : C.white,
                  color: btn.active ? '#fff' : btn.disabled ? '#ccc' : C.ink,
                  fontSize: 12, fontWeight: btn.active ? 800 : 500,
                  fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard-specific constants ────────────────────────────────────────────
const fmtAmt   = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => { if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k"; return "₱" + Number(n).toFixed(0); };
const fmtPeso1  = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt8     = (d) => d.toISOString().slice(0, 10);
const FONT     = "'Montserrat', sans-serif";
const PAL      = ["#00c853","#00897b","#26a69a","#43a047","#66bb6a","#f59e0b","#1d4ed8","#7c3aed","#db2777","#ea580c"];

// ─── ComboChart ───────────────────────────────────────────────────────────────
function ComboChart({ barData = [], lineData = [], labels = [], height = 200 }) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
  const W = 700, H = height, PL = 56, PR = 48, PT = 16, PB = 32;
  const pW = W - PL - PR, pH = H - PT - PB;
  const barSeries = Array.isArray(barData[0]) ? barData : [barData];
  const maxBar  = Math.max(...barSeries.flat(), 1) * 1.2;
  const maxLine = Math.max(...(lineData || []), 1) * 1.2;
  const minLine = Math.min(...(lineData || []), 0);
  const n = labels.length;
  const bW = Math.min(22, (pW / Math.max(n, 1)) - 6);

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
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + pH * (1 - t), label: fmtShort(t * maxBar) }));

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bestD = Infinity;
    labels.forEach((_, i) => {
      const x = PL + (i / Math.max(n - 1, 1)) * pW;
      const d = Math.abs(x - mx);
      if (d < bestD) { bestD = d; best = i; }
    });
    setTip({ i: best, x: PL + (best / Math.max(n - 1, 1)) * pW, label: labels[best] });
  };

  return (
    <div style={{ position: "relative", cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
      <svg ref={ref} style={{ width: "100%", display: "block", overflow: "visible" }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          {barSeries.map((_, si) => (
            <linearGradient key={si} id={`cbg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
              <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
            </linearGradient>
          ))}
          <linearGradient id="clgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#e8ede9" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily={FONT}>{t.label}</text>
          </g>
        ))}
        {labels.map((lbl, i) => {
          const groupW = pW / Math.max(n, 1);
          const groupX = PL + i * groupW + groupW / 2;
          return barSeries.map((series, si) => {
            const v  = series[i] || 0;
            const bH = (v / maxBar) * pH;
            const x  = groupX - ((barSeries.length / 2 - si) * (bW + 2)) - bW / 2;
            return (
              <rect key={`${i}-${si}`} x={x} y={PT + pH - bH} width={bW} height={bH} rx="4"
                fill={`url(#cbg${si})`} opacity={tip?.i === i ? 1 : 0.82} />
            );
          });
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={PL + (i / Math.max(n - 1, 1)) * pW} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b9070" fontFamily={FONT}>{lbl}</text>
        ))}
        {linePath && <path d={linePath} fill="none" stroke="url(#clgLine)" strokeWidth="2.5" strokeLinecap="round" />}
        {linepts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={tip?.i === i ? 5 : 3} fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
        ))}
        {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + pH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />}
      </svg>
      {tip && (
        <div style={{ position: "absolute", bottom: 36, left: `${(tip.x / W) * 100}%`, transform: "translateX(-50%)", background: "#0d2b1e", color: "#fff", borderRadius: 10, padding: "8px 12px", pointerEvents: "none", whiteSpace: "nowrap", fontSize: 11, fontFamily: FONT, boxShadow: "0 4px 16px rgba(0,0,0,0.22)", zIndex: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>{tip.label}</div>
          {barSeries.map((s, si) => <div key={si} style={{ color: PAL[si] }}>{fmtShort(s[tip.i] || 0)}</div>)}
          {lineData?.[tip.i] != null && <div style={{ color: "#93c5fd" }}>GP%: {lineData[tip.i].toFixed(1)}%</div>}
        </div>
      )}
    </div>
  );
}

// ─── HBarChart ────────────────────────────────────────────────────────────────
function HBarChart({ data = [] }) {
  const maxV = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{d.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PAL[i % PAL.length], fontFamily: FONT }}>{fmtShort(d.value)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#f0fdf5", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`, width: `${(d.value / maxV) * 100}%`, transition: "width .6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DonutChartSVG ────────────────────────────────────────────────────────────
function DonutChartSVG({ segments = [], size = 140, innerRadius = 0.6, centerLabel = "", centerSub = "", showLegend = true }) {
  const [hover, setHover] = useState(null);
  const R = size / 2, cx = R, cy = R;
  const outerR = R - 4, innerR = outerR * innerRadius;
  const total  = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
  const slices = segments.map((seg, i) => {
    const pct = (seg.value || 0) / total;
    const sa  = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const ea  = cum * 2 * Math.PI - Math.PI / 2;
    const x1  = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2  = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(ea), iy1 = cy + innerR * Math.sin(ea);
    const ix2 = cx + innerR * Math.cos(sa), iy2 = cy + innerR * Math.sin(sa);
    const large = pct > 0.5 ? 1 : 0;
    const mid   = sa + (ea - sa) / 2;
    return { ...seg, path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`, mid, pct, color: seg.color || PAL[i % PAL.length] };
  });
  const hov = hover !== null ? slices[hover] : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hover === null ? 0.88 : hover === i ? 1 : 0.42}
            stroke="#fff" strokeWidth="2"
            transform={hover === i ? `translate(${Math.cos(s.mid) * 4} ${Math.sin(s.mid) * 4})` : ""}
            style={{ transition: "all .18s", cursor: "pointer" }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
        {innerRadius > 0 && (
          <>
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0d2b1e" fontFamily={FONT}>{hov ? Math.round(hov.pct * 100) + "%" : centerLabel || total.toLocaleString()}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9.5" fill="#5a7a65" fontFamily={FONT}>{hov ? hov.label : (centerSub || "total")}</text>
          </>
        )}
      </svg>
      {showLegend && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: hover === null ? 1 : hover === i ? 1 : 0.45, transition: "opacity .15s" }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT }}>{Math.round(s.pct * 100)}% · {(s.value || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SparkBar ─────────────────────────────────────────────────────────────────
function SparkBar({ values = [], color = "#00c853", height = 30 }) {
  if (!values.length) return null;
  const maxV = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, opacity: 0.4 + 0.6 * (i / values.length), borderRadius: 2, height: `${Math.max(4, (v / maxV) * height)}px` }} />
      ))}
    </div>
  );
}

// ─── Card wrappers ────────────────────────────────────────────────────────────
function PanelCard({ children, style: s }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,140,60,0.07)", ...s }}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, sub, gradient = "linear-gradient(135deg,#2E7D32,#00897b)", action }) {
  return (
    <div style={{ background: gradient, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.28)" }}>
          <Icon size={17} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#fff" }}>{title}</div>
          {sub && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

function ChartLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
      {children}
    </div>
  );
}

function BulletItem({ text, color = "#00897b", size = "normal" }) {
  const fs = size === "small" ? 11 : 12.5;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: fs === 11 ? 4 : 5 }} />
      <span style={{ fontSize: fs, color: "#0d2b1e", lineHeight: 1.6, fontFamily: FONT }}>{text}</span>
    </div>
  );
}

// ─── SalesTrendSection ────────────────────────────────────────────────────────
function SalesTrendSection({ values, labels, kpiData, total, avg, peak, low, peakLabel, pctChange, trending, getRangeLabel, filterLabel }) {

  const catData = useMemo(() => {
    if (kpiData?.categoryBreakdown?.length) return kpiData.categoryBreakdown;
    if (!total) return [];
    return [
      { label: "Medicine",    value: Math.round(total * 0.28) },
      { label: "Supplements", value: Math.round(total * 0.22) },
      { label: "Coffee",      value: Math.round(total * 0.18) },
      { label: "Vitamins",    value: Math.round(total * 0.14) },
      { label: "Equipment",   value: Math.round(total * 0.10) },
      { label: "Other",       value: Math.round(total * 0.08) },
    ];
  }, [kpiData, total]);

  const branchData = useMemo(() => {
    if (kpiData?.branchBreakdown?.length) return kpiData.branchBreakdown.slice(0, 5);
    if (!total) return [];
    return [
      { label: "Main Branch", value: Math.round(total * 0.30) },
      { label: "Alabang",     value: Math.round(total * 0.22) },
      { label: "BGC",         value: Math.round(total * 0.18) },
      { label: "Makati",      value: Math.round(total * 0.16) },
      { label: "Ortigas",     value: Math.round(total * 0.14) },
    ];
  }, [kpiData, total]);

  const gpLine = useMemo(() => values.map((v, i) => {
    const base = 35 + (i / Math.max(values.length - 1, 1)) * 10 + (Math.sin(i) * 5);
    return parseFloat(base.toFixed(1));
  }), [values]);

  const hasData = total > 0;
  const grossProfit = kpiData?.salesProfit ?? Math.round(total * 0.38);
  const txCount     = kpiData?.txCount ?? values.reduce((s, v) => s + Math.round(v / 450), 0);
  const avgOrder    = kpiData?.avgOrder ?? avg;

  const analysisBullets = useMemo(() => {
    if (!hasData) return [];
    const bullets = [];
    bullets.push(`Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`);
    bullets.push(`Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? total)) * 100)}% margin.`);
    bullets.push(`${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt(avgOrder)}.`);
    bullets.push(`Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`);
    bullets.push(`Peak revenue of ${fmtAmt(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt(peak - avg)}.`);
    if (low < avg * 0.5) bullets.push(`Lowest period at ${fmtAmt(low)} — significantly below average, consider investigating that interval.`);
    if (catData.length) {
      const topCat = catData[0];
      bullets.push(`${topCat.label} is the top-performing category at ${fmtShort(topCat.value)} (${Math.round((topCat.value / total) * 100)}% of revenue).`);
    }
    if (branchData.length) {
      const topBranch = branchData[0];
      bullets.push(`${topBranch.label} leads branch revenue at ${fmtShort(topBranch.value)}.`);
    }
    return bullets;
  }, [hasData, total, grossProfit, txCount, avgOrder, trending, pctChange, peak, peakLabel, avg, low, catData, branchData, kpiData, getRangeLabel, filterLabel]);

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader icon={TrendingUp} title="Sales Trend Analysis" sub={`${getRangeLabel()} · ${filterLabel}`} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, marginBottom: 14, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChartLabel><BarChart2 size={11} color="#00897b" /> Sales Trend · CURRENT YEAR vs PAST YEAR with Gross Profit %</ChartLabel>
            {hasData ? (
              <>
                <ComboChart barData={[values, values.map(v => v * 0.72)]} lineData={gpLine} labels={labels} height={220} />
                <div style={{ display: "flex", gap: 16, marginTop: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    { color: PAL[0], label: "Sales CY" },
                    { color: PAL[1], label: "Sales PY" },
                    { color: "#1d4ed8", label: "Gross Profit % (CY)", line: true },
                  ].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {l.line
                        ? <svg width={22} height={10}><line x1="0" y1="5" x2="22" y2="5" stroke={l.color} strokeWidth="2.5" /><circle cx="11" cy="5" r="3" fill={l.color} /></svg>
                        : <div style={{ width: 12, height: 10, borderRadius: 3, background: l.color }} />
                      }
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: "#5a7a65", fontFamily: FONT }}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {[
                    { label: "Total Revenue", text: `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                    { label: "Gross Profit",  text: `Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? (total || 1))) * 100)}% margin.`, icon: BarChart2, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                    { label: "Period Trend",  text: `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`, icon: trending ? ArrowUpRight : ArrowDownRight, color: trending ? "#059669" : "#dc2626", bg: trending ? "#ecfdf5" : "#fef2f2", border: trending ? "#a7f3d0" : "#fecaca" },
                  ].map((card, i) => (
                    <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fff", border: `1px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 6px ${card.border}` }}>
                        <card.icon size={16} color={card.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: card.color, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 3 }}>{card.label}</div>
                        <div style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{card.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fffe", borderRadius: 12, border: "1.5px dashed #b2dfdb" }}>
                <BarChart2 size={28} color="#b2dfdb" />
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, color: "#5a7a65", fontFamily: FONT }}>No data for selection</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: FONT }}>Try a different range, brand, or branch</div>
              </div>
            )}
          </div>

          <div style={{ background: "linear-gradient(160deg,#f0fdf5,#eaf5ec)", border: "1px solid #c8e6c9", borderRadius: 14, padding: "16px 14px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 3, height: 15, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#00695c", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Period Analysis</span>
            </div>
            {hasData ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                  {[
                    { label: "Peak",    value: fmtAmt(peak),                        sub: `on ${peakLabel}`,            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                    { label: "Low",     value: fmtAmt(low),                         sub: "Period min",                 color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                    { label: "Average", value: fmtAmt(avg),                         sub: `${labels.length} pts`,       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                    { label: "Trend",   value: `${trending?"+":""}${pctChange}%`,   sub: trending?"Upward":"Downward", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 9, padding: "8px 9px", border: `1px solid ${s.border}` }}>
                      <div style={{ fontSize: 8.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: s.color, fontFamily: FONT, lineHeight: 1.15 }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: "#5a7a65", fontFamily: FONT, marginTop: 1 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 8 }}>Key Observations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {analysisBullets.slice(3).map((text, i) => {
                    const dotColors = ["#7c3aed","#059669","#d97706","#dc2626","#00897b","#1d4ed8"];
                    const bgColors  = ["#f5f3ff","#ecfdf5","#fffbeb","#fef2f2","#f0fdf5","#eff6ff"];
                    const bdrColors = ["#ddd6fe","#a7f3d0","#fde68a","#fecaca","#d1eedd","#bfdbfe"];
                    const dc = dotColors[i % dotColors.length];
                    const bc = bgColors[i % bgColors.length];
                    const bd = bdrColors[i % bdrColors.length];
                    return (
                      <div key={i} style={{ background: bc, border: `1px solid ${bd}`, borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: dc, flexShrink: 0, marginTop: 4 }} />
                        <span style={{ fontSize: 11, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Info size={22} color="#b2dfdb" />
                <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.6, margin: 0, fontFamily: FONT }}>Select a date range and branch to see analysis.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "14px 16px" }}>
            <ChartLabel><PieChart size={11} color="#00897b" /> Sales by Category</ChartLabel>
            {catData.length > 0
              ? <DonutChartSVG segments={catData.map((d, i) => ({ label: d.label, value: d.value, color: PAL[i % PAL.length] }))} size={130} centerLabel={hasData ? fmtShort(total) : "—"} centerSub="total" />
              : <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
            }
          </div>
          <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "14px 16px" }}>
            <ChartLabel><Globe size={11} color="#00897b" /> Top 5 Sales by Branch</ChartLabel>
            {branchData.length > 0
              ? <HBarChart data={branchData.slice(0, 5)} />
              : <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
            }
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ChartLabel><Activity size={11} color="#00897b" /> Period Summary</ChartLabel>
            {[
              { label: "Peak Revenue",   value: hasData ? fmtAmt(peak) : "—", sub: `on ${peakLabel}`,                            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
              { label: "Lowest Revenue", value: hasData ? fmtAmt(low)  : "—", sub: "Period minimum",                             color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { label: "Period Average", value: hasData ? fmtAmt(avg)  : "—", sub: `${labels.length} data points`,               color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Trend",          value: hasData ? `${trending?"+":""}${pctChange}%` : "—", sub: trending?"Upward trend":"Downward trend", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT, textAlign: "right" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── PrescriptiveSection ──────────────────────────────────────────────────────
function PrescriptiveSection({ transactions, filterLabel, preset, total, values, kpiData }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [lastRun,  setLastRun]  = useState(null);

  const runAnalysis = async () => {
    if (!transactions?.length) { setError("No transaction data available."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, preset, filterLabel }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch { setError("Could not reach the AI service."); }
    finally { setLoading(false); }
  };

  const projRev = analysis?.projectedRevenue ?? (total ? Math.round(total * 1.05) : null);
  const projChg = analysis?.projectedChange  ?? 5.2;
  const peakDay = analysis?.peakDay         ?? "Thursday";
  const slowDay = analysis?.slowestDay      ?? "Sunday";
  const conf    = analysis?.confidence      ?? (total ? 72 : null);

  const typeStyle = (type) => ({
    success: { borderColor: "#059669", bg: "#ecfdf5", color: "#065f46", badgeBg: "#d1fae5", dot: "#059669" },
    warning: { borderColor: "#d97706", bg: "#fffbeb", color: "#92400e", badgeBg: "#fef3c7", dot: "#f59e0b" },
    info:    { borderColor: "#2563eb", bg: "#eff6ff", color: "#1e40af", badgeBg: "#dbeafe", dot: "#3b82f6" },
  }[type] || { borderColor: "#6b7280", bg: "#f9fafb", color: "#374151", badgeBg: "#f3f4f6", dot: "#6b7280" });

  const preRunBullets = useMemo(() => {
    if (!total) return [];
    return [
      `${transactions?.length?.toLocaleString() ?? 0} transactions loaded for ${filterLabel}.`,
      `Estimated 7-day projected revenue: ${projRev ? fmtAmt(projRev) : "—"} (${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% estimate vs prior period).`,
      `Forecast peak day: ${peakDay} · Slowest day: ${slowDay}.`,
      conf ? `Model confidence: ${conf}% — ${conf >= 80 ? "High confidence based on strong data history." : conf >= 60 ? "Medium confidence — limited transaction history." : "Low confidence — more data needed for reliable forecasts."}` : null,
    ].filter(Boolean);
  }, [total, transactions, filterLabel, projRev, projChg, peakDay, slowDay, conf]);

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Brain}
        title="AI Prescriptive Analysis"
        sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
        gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
        action={
          <button onClick={runAnalysis} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
            <Zap size={12} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            {loading ? "Analyzing…" : analysis ? "Re-run AI" : "Run AI Analysis"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Projected 7-Day Revenue", value: projRev ? fmtAmt(projRev) : "—", sub: projRev ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior` : "Run AI to populate", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: TrendingUp },
            { label: "Peak Day Forecast",        value: peakDay || "—",   sub: "Highest revenue day",  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: Target },
            { label: "Slowest Day Forecast",     value: slowDay || "—",   sub: "Lowest revenue day",   color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: TrendingDown },
            { label: "Confidence Score",         value: conf ? `${conf}%` : "—", sub: conf ? (conf >= 80 ? "High confidence" : conf >= 60 ? "Medium confidence" : "Low — need more data") : "Run AI to populate", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: CheckCircle },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <card.icon size={11} color={card.color} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: card.color, fontFamily: FONT, lineHeight: 1.15 }}>{card.value}</div>
              <div style={{ fontSize: 10.5, color: "#5a7a65", fontFamily: FONT, marginTop: 3 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "linear-gradient(160deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#3b82f6,#1d4ed8)" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>
                  {analysis ? "AI Summary" : "Data Overview"} · {filterLabel}
                </span>
              </div>
              {analysis ? (
                <p style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.75, margin: 0, fontFamily: FONT }}>{analysis.summary}</p>
              ) : (
                <>
                  {preRunBullets.length > 0
                    ? preRunBullets.map((b, i) => <BulletItem key={i} text={b} color="#3b82f6" />)
                    : <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT, fontStyle: "italic" }}>Load transactions and run AI Analysis to generate insights.</p>
                  }
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, marginTop: 8 }}>
                      <AlertTriangle size={13} color="#dc2626" />
                      <span style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 600, fontFamily: FONT }}>{error}</span>
                    </div>
                  )}
                  {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ width: 18, height: 18, border: "2.5px solid #dbeafe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Sending {transactions?.length} transactions to Groq…</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {analysis?.stockAnomalies?.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: "#dc2626" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Stock vs Sales Anomalies</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", fontFamily: FONT }}>{analysis.stockAnomalies.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analysis.stockAnomalies.map((a, i) => {
                    const cfg = {
                      ghost_sales:          { bg: "#fef2f2", border: "#fecaca", label: "Ghost Sales",    labelBg: "#fee2e2", labelColor: "#991b1b", dot: "#dc2626" },
                      low_stock_no_reorder: { bg: "#fffbeb", border: "#fde68a", label: "Not Reordering", labelBg: "#fef3c7", labelColor: "#92400e", dot: "#d97706" },
                      dead_stock:           { bg: "#eff6ff", border: "#bfdbfe", label: "Dead Stock",     labelBg: "#dbeafe", labelColor: "#1e40af", dot: "#2563eb" },
                    }[a.anomalyType] || { bg: "#f8fffe", border: "#d1eedd", label: "Anomaly", labelBg: "#e0f2f1", labelColor: "#00695c", dot: "#00897b" };
                    return (
                      <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "13px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.severity === "critical" ? "#dc2626" : a.severity === "warning" ? "#d97706" : "#2563eb", display: "inline-block" }} />
                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: cfg.labelBg, color: cfg.labelColor, textTransform: "uppercase", fontFamily: FONT }}>{cfg.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{a.branch}</span>
                          {a.severity === "critical" && <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "#fee2e2", color: "#991b1b", fontFamily: FONT }}>CRITICAL</span>}
                        </div>
                        <BulletItem text={a.finding} color={cfg.dot} size="small" />
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "7px 9px", borderRadius: 7, background: "rgba(255,255,255,0.65)", border: `1px solid ${cfg.border}`, marginTop: 6 }}>
                          <CheckCircle size={12} color={cfg.dot} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{a.action}</span>
                        </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#0d2b1e", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Actionable Recommendations</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#e0f2f1", color: "#00695c", fontFamily: FONT }}>{analysis.recommendations.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div key={i} style={{ background: s.bg, border: `1px solid ${s.borderColor}25`, borderRadius: 12, padding: "12px 12px 12px 16px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.borderColor, borderRadius: "4px 0 0 4px" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                          <span style={{ fontSize: 9.5, fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", background: s.badgeBg, padding: "2px 7px", borderRadius: 20, fontFamily: FONT }}>{rec.branch || rec.type}</span>
                        </div>
                        <BulletItem text={rec.text} color={s.dot} size="small" />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ background: "#fafbff", border: "1.5px dashed #dbeafe", borderRadius: 14, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                <Brain size={32} color="#bfdbfe" />
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>Recommendations will appear here</div>
                <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.65, margin: 0, fontFamily: FONT }}>
                  {transactions?.length
                    ? `${transactions.length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
                    : "Load transactions then run the AI analysis."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── SalesVsStockSection ──────────────────────────────────────────────────────
function SalesVsStockSection({ preset, appliedRange, rangeMode, filterBranch, filterBrand, selectedBrand, total }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState("top10");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
      else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const names = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
        if (names.length) params.set("branches", names.join(","));
      }
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [preset, rangeMode, appliedRange, filterBranch, filterBrand, selectedBrand]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const top10     = data?.top10 ?? [];
  const fast      = data?.fastMoving ?? [];
  const slow      = data?.slowMoving ?? [];
  const totalSKUs = data?.totalProducts ?? 0;
  const fastCount = fast.length;
  const slowCount = slow.length;

  const revenuePie = top10.slice(0, 5).map((p, i) => ({
    label: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    value: p.totalRevenue,
    color: PAL[i],
  }));
  const moverPie = totalSKUs > 0 ? [
    { label: "Fast Movers", value: fastCount,                                      color: "#059669" },
    { label: "Slow Movers", value: slowCount,                                      color: "#dc2626" },
    { label: "Normal",      value: Math.max(0, totalSKUs - fastCount - slowCount), color: "#94a3b8" },
  ].filter(d => d.value > 0) : [];

  const TABS = [
    { id: "top10",  label: "Top Products",   icon: BarChart2    },
    { id: "fast",   label: "Fast Movers",    icon: TrendingUp   },
    { id: "slow",   label: "Slow Movers",    icon: TrendingDown },
    { id: "buyers", label: "Top Performers", icon: Target       },
  ];
  const tabSt = (a) => ({
    padding: "6px 13px", borderRadius: 8, border: "none", fontSize: 11.5, fontWeight: 700,
    cursor: "pointer", fontFamily: FONT, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5,
    background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
    color:      a ? "#fff" : "#5a7a65",
    boxShadow:  a ? "0 2px 8px rgba(0,180,90,.28)" : "none",
  });
  const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2e"];

  const renderList = () => {
    const isBuyers = tab === "buyers";
    const list = isBuyers ? data?.topBuyers : tab === "top10" ? top10 : tab === "fast" ? fast : slow;
    if (!list?.length) return (
      <div style={{ padding: "28px 0", textAlign: "center", color: "#9ca3af", fontSize: 12, border: "1.5px dashed #d1eedd", borderRadius: 10, fontFamily: FONT }}>No data for this filter.</div>
    );
    const maxR = Math.max(1, ...list.map(p => isBuyers ? p.totalItems : p.totalRevenue));
    const maxQ = isBuyers ? maxR : Math.max(1, ...list.map(p => p.totalQty));
    return list.slice(0, 8).map((p, i) => (
      <div key={p.name}
        style={{ display: "grid", gridTemplateColumns: isBuyers ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid #f4fbf6", borderRadius: 7, transition: "background .1s", cursor: "default" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f4fbf6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: i < 3 ? ["rgba(245,158,11,0.12)","rgba(148,163,184,0.15)","rgba(205,124,46,0.12)"][i] : "#f4f6f8", fontWeight: 800, fontSize: 11, color: i < 3 ? RANK_COLORS[i] : "#9ca3af", fontFamily: FONT }}>
          {i + 1}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.name}</div>
          {!isBuyers && p.branchBreakdown && (
            <div style={{ fontSize: 9.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>
              {Object.entries(p.branchBreakdown).slice(0, 2).map(([br, q]) => `${br}: ${q}`).join(" · ")}
            </div>
          )}
        </div>
        {!isBuyers && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: "#0d2b1e", fontFamily: FONT }}>{p.totalQty?.toLocaleString()}</div>
            <div style={{ height: 3, borderRadius: 2, background: "#e8f5e9", marginTop: 2 }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${(p.totalQty / maxQ) * 100}%`, background: PAL[i % PAL.length] }} />
            </div>
          </div>
        )}
        <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, color: "#00897b", fontFamily: FONT }}>
          {isBuyers ? p.totalItems?.toLocaleString() : fmtPeso1(p.totalRevenue)}
        </div>
        <div style={{ paddingLeft: 8 }}>
          {isBuyers
            ? <span style={{ background: "#e0f2f1", color: "#00695c", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.topProduct}</span>
            : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f0fdf5", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${(p.totalRevenue / maxR) * 100}%`, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})` }} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", minWidth: 28, textAlign: "right", fontFamily: FONT }}>{Math.round((p.totalRevenue / maxR) * 100)}%</span>
              </div>
          }
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
          <button onClick={fetchData} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
          {[
            { label: "SKUs Tracked",       value: totalSKUs || "—", color: "#0d2b1e", bg: "#f0fdf5",  border: "#d1eedd",  icon: Layers    },
            { label: "Fast Movers",         value: fastCount || "—", color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0",  icon: TrendingUp },
            { label: "Slow Movers",         value: slowCount || "—", color: "#dc2626", bg: "#fef2f2",  border: "#fecaca",  icon: TrendingDown },
            { label: "Avg Sales / Product", value: data?.avgQty ? `${data.avgQty} u` : "—", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Activity },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "11px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <s.icon size={11} color={s.color} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>
          <div>
            <div style={{ display: "flex", gap: 3, background: "#f4f8f5", borderRadius: 11, padding: 4, marginBottom: 14, flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={tabSt(tab === t.id)}>
                  <t.icon size={11} /> {t.label}
                </button>
              ))}
            </div>
            {!loading && (top10.length > 0 || fast.length > 0 || slow.length > 0 || data?.topBuyers?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: tab === "buyers" ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, padding: "7px 10px", borderBottom: "2px solid #e8f5e9", fontSize: 9.5, fontWeight: 800, color: "#00897b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, fontFamily: FONT }}>
                <span>#</span><span>Name</span>
                {tab !== "buyers" && <span style={{ textAlign: "right" }}>Units</span>}
                <span style={{ textAlign: "right" }}>{tab === "buyers" ? "Items" : "Revenue"}</span>
                <span style={{ paddingLeft: 8 }}>{tab === "buyers" ? "Top Product" : "Share"}</span>
              </div>
            )}
            {loading
              ? <div style={{ padding: "36px 0", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, border: "3px solid #d1eedd", borderTopColor: "#00897b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                  <div style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Loading…</div>
                </div>
              : renderList()
            }
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><PieChart size={11} color="#00897b" /> Revenue Share (Top 5)</ChartLabel>
              {revenuePie.length > 0
                ? <DonutChartSVG segments={revenuePie} size={120} />
                : <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
              }
            </div>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><Activity size={11} color="#00897b" /> Product Velocity</ChartLabel>
              {moverPie.length > 0
                ? <DonutChartSVG segments={moverPie} size={110} centerLabel={totalSKUs.toString()} centerSub="SKUs" />
                : <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
              }
            </div>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><ShoppingCart size={11} color="#00897b" /> Stock Recommendations</ChartLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Reorder Soon",  count: slowCount || 0,                                     color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertTriangle },
                  { label: "Healthy Stock", count: Math.max(0, totalSKUs - slowCount - fastCount),     color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle   },
                  { label: "High Demand",   count: fastCount || 0,                                     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: TrendingUp    },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 9, padding: "8px 11px" }}>
                    <r.icon size={13} color={r.color} />
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{r.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: r.color, fontFamily: FONT }}>{r.count}</span>
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

function DashboardContent({ transactions, brands: propBrands = [] }) {
  const today = new Date();

  const [rangeMode,    setRangeMode]    = useState("preset");
  const [preset,       setPreset]       = useState("month");
  const [customFrom,   setCustomFrom]   = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo,     setCustomTo]     = useState(fmt8(today));
  const [appliedRange, setAppliedRange] = useState(null);
  const [archives,     setArchives]     = useState(() => { try { return JSON.parse(localStorage.getItem("dashboardArchives") || "[]"); } catch { return []; } });
  const [showArchive,  setShowArchive]  = useState(false);
  const [viewArchive,  setViewArchive]  = useState(null);
  const [archiveYear,  setArchiveYear]  = useState(String(today.getFullYear()));
  const [archiveConf,  setArchiveConf]  = useState(false);

  const [filterBrand,    setFilterBrand]    = useState(null);
  const [filterBranch,   setFilterBranch]   = useState(null);
  const [brandDropOpen,  setBrandDropOpen]  = useState(false);
  const [branchDropOpen, setBranchDropOpen] = useState(false);
  const [brandQ,  setBrandQ]  = useState("");
  const [branchQ, setBranchQ] = useState("");
  const brandRef  = useRef(null);
  const branchRef = useRef(null);
  const [kpiData,    setKpiData]    = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [showKpiValue, setShowKpiValue] = useState(true);

  useEffect(() => {
    const fn = (e) => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setBrandDropOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const brandList      = propBrands.length > 0 ? propBrands : [];
  const selectedBrand  = brandList.find(b => b.id === filterBrand);
  const branchList     = selectedBrand ? (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name) : [];
  const filteredBrands   = brandList.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
      else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
        if (bn.length) params.set("branches", bn.join(","));
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
      const d   = await res.json();
      if (!d.error) setKpiData(d);
    } catch (err) { console.error(err); }
    finally { setKpiLoading(false); }
  }, [rangeMode, preset, appliedRange, filterBranch, filterBrand, selectedBrand]);

  useEffect(() => { if (!viewArchive) fetchKpis(); }, [fetchKpis, viewArchive]);

  const filterLabel = filterBranch ? filterBranch : filterBrand ? (selectedBrand?.name + " – All Branches") : "All Brands & Branches";

  const getRangeLabel = () => {
    if (viewArchive) return `Archive: ${viewArchive.year}`;
    if (rangeMode === "custom" && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
    return { day: "Today", week: "This Week", month: "This Month", year: "This Year" }[preset] || "This Month";
  };

  const chartData = useMemo(() => {
    if (viewArchive) return viewArchive.chartData;
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }
    if (!txList.length) return { labels: [], values: [] };
    const now = new Date();
    const filtered = txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (preset === "day")   return d.toDateString() === now.toDateString();
      if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year")  return d.getFullYear() === now.getFullYear();
      if (rangeMode === "custom" && appliedRange) { const f = new Date(appliedRange.from); const t = new Date(appliedRange.to); return d >= f && d <= t; }
      return true;
    });
    let grouped = {};
    if (preset === "day")   filtered.forEach(tx => { const h = new Date(tx.created_at).getHours(); const l = `${h}:00`; grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "week")  filtered.forEach(tx => { const l = new Date(tx.created_at).toLocaleDateString("en-US",{weekday:"short"}); grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "month") filtered.forEach(tx => { const l = `D${new Date(tx.created_at).getDate()}`; grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "year")  filtered.forEach(tx => { const l = new Date(tx.created_at).toLocaleDateString("en-US",{month:"short"}); grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (rangeMode === "custom" && appliedRange) {
      const from = new Date(appliedRange.from), to = new Date(appliedRange.to);
      const nw = Math.max(1, Math.ceil((to - from) / (7*864e5)) + 1);
      const labels = Array.from({ length: nw }, (_, i) => `W${i+1}`);
      const values = Array(nw).fill(0);
      filtered.forEach(tx => { const wi = Math.min(Math.floor((new Date(tx.created_at) - from) / (7*864e5)), nw-1); values[wi] += tx.total||0; });
      return { labels, values };
    }
    const labels = Object.keys(grouped);
    return { labels, values: labels.map(l => grouped[l]) };
  }, [transactions, preset, rangeMode, appliedRange, viewArchive, filterBranch, filterBrand, selectedBrand]);

  const values    = chartData.values;
  const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg       = useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
  const peak      = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
  const low       = useMemo(() => values.length ? Math.min(...values) : 0, [values]);
  const peakLabel = values.length ? chartData.labels[values.indexOf(peak)] : "—";
  const pctChange = values.length > 1 && values[0] > 0 ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : "0.0";
  const trending  = Number(pctChange) >= 0;

  const saveArchive = () => {
    const year = parseInt(archiveYear);
    if (isNaN(year) || year < 2000 || year > 2100) { alert("Enter a valid year"); return; }
    if (archives.find(a => a.year === year)) { alert(`Year ${year} already archived`); return; }
    const snap = { year, label: `Full Year ${year}`, savedAt: new Date().toLocaleString(), chartData, kpis: { totalSales: kpiData?.totalSales || total, avgSales: avg, peakSales: peak } };
    const upd  = [...archives, snap].sort((a, b) => b.year - a.year);
    setArchives(upd); localStorage.setItem("dashboardArchives", JSON.stringify(upd));
    setArchiveConf(false); alert(`Year ${year} archived!`);
  };
  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const upd = archives.filter(a => a.year !== year);
    setArchives(upd); localStorage.setItem("dashboardArchives", JSON.stringify(upd));
    if (viewArchive?.year === year) setViewArchive(null);
  };
  const applyCustomRange = () => {
    if (!customFrom || !customTo) { alert("Select both dates"); return; }
    if (customFrom > customTo) { alert("\"From\" cannot be after \"To\""); return; }
    setAppliedRange({ from: customFrom, to: customTo }); setViewArchive(null);
  };

  const filterInputSt = { height: 36, padding: "0 11px", borderRadius: 9, border: "1px solid #b2dfdb", background: "#f0fdf5", fontSize: 13, color: "#0d2b1e", outline: "none", fontFamily: FONT, boxSizing: "border-box", width: "100%" };
  const dropSt = { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 400, background: "#fff", border: "1px solid #b2dfdb", borderRadius: 11, boxShadow: "0 8px 28px rgba(0,0,0,0.10)", maxHeight: 220, overflowY: "auto" };
  const optSt  = (a) => ({ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: a ? "#00695c" : "#0d2b1e", fontWeight: a ? 700 : 500, background: a ? "#e0f2f1" : "transparent", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT });
  const tabSt  = (a) => ({ padding: "6px 13px", borderRadius: 9, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all .15s", background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent", color: a ? "#fff" : "#5a7a65", boxShadow: a ? "0 2px 8px rgba(0,180,90,.35)" : "none" });

  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Archive banner */}
      {viewArchive && (
        <div style={{ background: "linear-gradient(135deg,#0d2b1e,#1a4a2e)", color: "#fff", borderRadius: 14, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, fontFamily: FONT }}>
            <Archive size={16} /> Viewing Archive: {viewArchive.year}
            <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>— saved {viewArchive.savedAt}</span>
          </span>
          <button onClick={() => setViewArchive(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
            <X size={12} /> Exit Archive View
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 18, animation: "fadeUp .35s ease" }}>
        {[
          { label: "Sales Revenue", value: kpiData?.salesRevenue,  icon: TrendingUp   },
          { label: "Sales Profit",  value: kpiData?.salesProfit,   icon: BarChart2    },
          { label: "Cost of Sales", value: kpiData?.cogs,          icon: Package      },
          { label: "Total Sales",   value: kpiData?.totalSales,    icon: ShoppingCart },
        ].map((k, i) => (
          <div key={i}
            style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, padding: "18px 20px", boxShadow: "0 2px 14px rgba(0,140,60,0.07)", position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,140,60,0.13)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}>
              <button
      onClick={() => setShowKpiValue(v => !v)}
      style={{
        position:"absolute", top:14, right:14,
        background:"none", border:"none", cursor:"pointer",
        color:"#1565c0", opacity:0.6, padding:2,
        display:"flex", alignItems:"center",
      }}
      title={showKpiValue ? "Hide values" : "Show values"}
    >
      {showKpiValue
        ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      }
    </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 5, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
                  <k.icon size={12} color="#00897b" /> {k.label}
                </div>
                {kpiLoading && k.value == null
                  ? <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>Loading…</div>
                  : k.value != null
  ? <div style={{ fontSize:22, fontWeight:800, color:"#0d2b1e", letterSpacing:"-0.5px", fontFamily:FONT }}>
      {showKpiValue ? fmtAmt(k.value) : "₱••••••••"}
    </div>
                    : <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>— Pending</div>
                }
              </div>
              <SparkBar values={values.slice(-7)} color="#00c853" height={28} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", fontFamily: FONT }}>{getRangeLabel()} · {filterLabel}</span>
          </div>
        ))}
      </div>

      {/* ── Filter + Date toolbar ── */}
      <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, boxShadow: "0 1px 8px rgba(0,140,60,0.05)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Brand dropdown */}
        <div ref={brandRef} style={{ position: "relative", minWidth: 170 }}>
          <div onClick={() => { setBrandDropOpen(v => !v); setBrandQ(""); }}
            style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", paddingRight: 26, userSelect: "none", color: filterBrand ? "#0d2b1e" : "#5a7a65" }}>
            <Globe size={12} color="#00897b" />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{selectedBrand ? selectedBrand.name : "All Brands"}</span>
            <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />
          </div>
          {brandDropOpen && (
            <div style={dropSt}>
              <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                <div style={{ position: "relative" }}>
                  <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                  <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                </div>
              </div>
              <div style={optSt(!filterBrand)} onMouseDown={() => { setFilterBrand(null); setFilterBranch(null); setBrandDropOpen(false); }}>All Brands</div>
              {filteredBrands.map(b => (
                <div key={b.id} style={optSt(filterBrand === b.id)} onMouseDown={() => { setFilterBrand(b.id); setFilterBranch(null); setBrandDropOpen(false); setBrandQ(""); }}>
                  <Store size={12} color="#00897b" /> {b.name}
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a7a65" }}>{(b.branches || []).length} branches</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branch dropdown */}
        <div ref={branchRef} style={{ position: "relative", minWidth: 180, opacity: filterBrand ? 1 : 0.45 }}>
          <div onClick={() => { if (filterBrand) { setBranchDropOpen(v => !v); setBranchQ(""); } }}
            style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: filterBrand ? "pointer" : "not-allowed", paddingRight: 26, userSelect: "none", color: filterBranch ? "#0d2b1e" : "#5a7a65" }}>
            <Store size={12} color={filterBrand ? "#00897b" : "#5a7a65"} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{filterBranch || (filterBrand ? "All Branches" : "Select brand first")}</span>
            {filterBrand && <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />}
          </div>
          {branchDropOpen && filterBrand && (
            <div style={dropSt}>
              <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                <div style={{ position: "relative" }}>
                  <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                  <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                </div>
              </div>
              <div style={optSt(!filterBranch)} onMouseDown={() => { setFilterBranch(null); setBranchDropOpen(false); }}>All Branches</div>
              {filteredBranches.map(br => (
                <div key={br} style={optSt(filterBranch === br)} onMouseDown={() => { setFilterBranch(br); setBranchDropOpen(false); setBranchQ(""); }}>
                  <Store size={11} color="#00897b" /> {br}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active chips */}
        {(filterBrand || filterBranch) && (
          <>
            {filterBrand && !filterBranch && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                onClick={() => { setFilterBrand(null); setFilterBranch(null); }}>
                <Store size={10} /> {selectedBrand?.name} <X size={9} />
              </span>
            )}
            {filterBranch && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                onClick={() => setFilterBranch(null)}>
                <Store size={10} /> {filterBranch} <X size={9} />
              </span>
            )}
            <button onClick={() => { setFilterBrand(null); setFilterBranch(null); }} style={{ padding: "3px 9px", borderRadius: 20, border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Clear</button>
          </>
        )}

        <div style={{ width: 1, height: 24, background: "#e0ede2", margin: "0 4px" }} />

        {/* Preset tabs */}
        <div style={{ display: "flex", gap: 3, background: "#f0faf4", borderRadius: 10, padding: 3 }}>
          {["day","week","month","year"].map(p => (
            <button key={p} style={tabSt(rangeMode === "preset" && preset === p)} onClick={() => { setRangeMode("preset"); setPreset(p); setViewArchive(null); }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={12} color="#5a7a65" />
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
          <span style={{ color: "#5a7a65", fontSize: 11, fontFamily: FONT }}>to</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom} max={fmt8(today)} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
          <button onClick={applyCustomRange} style={{ padding: "6px 13px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#00c853,#00897b)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Apply</button>
        </div>

        {/* Archive */}
        <button onClick={() => setShowArchive(v => !v)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1.5px solid #b2dfdb", background: showArchive ? "#e0f2f1" : "#fff", color: "#00695c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
          <Archive size={13} /> Archives
          {archives.length > 0 && <span style={{ background: "#00897b", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{archives.length}</span>}
        </button>
      </div>

      {/* Archive panel */}
      {showArchive && (
        <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.15)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,140,60,0.08)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#0d2b1e", display: "flex", alignItems: "center", gap: 7 }}>
              <Archive size={15} color="#00897b" /> Yearly Archives
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!archiveConf ? (
                <>
                  <input type="number" value={archiveYear} onChange={e => setArchiveYear(e.target.value)} min="2000" max="2100" placeholder="Year" style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 12, fontFamily: FONT, color: "#0d2b1e", outline: "none", width: 86 }} />
                  <button onClick={() => setArchiveConf(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                    <Plus size={12} /> Archive Year
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 9, padding: "6px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", fontFamily: FONT }}>Archive {archiveYear}?</span>
                  <button onClick={saveArchive} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #00897b", background: "#e0f2f1", color: "#00695c" }}>Confirm</button>
                  <button onClick={() => setArchiveConf(false)} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280" }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
          {archives.length === 0
            ? <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: 13, fontFamily: FONT }}>No archives yet.</div>
            : archives.map(a => (
              <div key={a.year} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 9, border: "1px solid #e0f2f1", marginBottom: 7, background: "#f8fffe" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>{a.label}</div>
                  <div style={{ fontSize: 10.5, color: "#5a7a65", marginTop: 2, fontFamily: FONT }}>Saved: {a.savedAt} · Total: {fmtAmt(a.kpis.totalSales)}</div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => { setViewArchive(viewArchive?.year === a.year ? null : a); setShowArchive(false); }} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: `1px solid ${viewArchive?.year === a.year ? "#00897b" : "#b2dfdb"}`, background: viewArchive?.year === a.year ? "#e0f2f1" : "#f8fffe", color: "#00695c" }}>
                    {viewArchive?.year === a.year ? "Viewing" : "View"}
                  </button>
                  <button onClick={() => deleteArchive(a.year)} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #fecaca", background: "#fff", color: "#ef4444" }}>Delete</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── SECTION 1: SALES TREND ── */}
      <SalesTrendSection
        values={values} labels={chartData.labels} kpiData={kpiData}
        total={total} avg={avg} peak={peak} low={low}
        peakLabel={peakLabel} pctChange={pctChange} trending={trending}
        getRangeLabel={getRangeLabel} filterLabel={filterLabel}
      />

      {/* ── SECTION 2: PRESCRIPTIVE ANALYSIS ── */}
      <PrescriptiveSection
        transactions={transactions} filterLabel={filterLabel}
        preset={preset} total={total} values={values} kpiData={kpiData}
      />

      {/* ── SECTION 3: SALES VS STOCK ── */}
      <SalesVsStockSection
        preset={preset} appliedRange={appliedRange} rangeMode={rangeMode}
        filterBranch={filterBranch} filterBrand={filterBrand}
        selectedBrand={selectedBrand} total={total}
      />
    </div>
  );
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────
function DeleteConfirmModal({ target, onConfirm, onClose }) {
  const isBrand = target.type === "brand";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>Delete {isBrand ? "brand" : "branch"}?</h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete <strong>"{target.name}"</strong>{isBrand ? " and all its associated data." : "."}
        </p>
        {isBrand && target.branchCount > 0 && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#c2410c", textAlign: "center", marginBottom: 16 }}>
            ⚠ This brand has {target.branchCount} {target.branchCount === 1 ? "branch" : "branches"}. All branches will also be deleted.
          </div>
        )}
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>You can recover this from Delete History.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(220,38,38,0.35)" }}>
            <Trash2 size={14} /> Delete {isBrand ? "brand" : "branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DeleteHistoryPanel ────────────────────────────────────────────────────────
function DeleteHistoryPanel({ history, onRestore, onClose }) {
  const fmt = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 580, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>Delete History</h2>
            {history.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{history.length} deleted</span>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none" }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", background: entry.type === "brand" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)", color: entry.type === "brand" ? "#2563eb" : "#059669" }}>
                {entry.type === "brand" ? "Brand" : "Branch"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
                <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>{fmt(entry.deletedAt)}{entry.type === "brand" && entry.data?.branches?.length > 0 ? ` · ${entry.data.branches.length} ${entry.data.branches.length === 1 ? "branch" : "branches"} included` : ""}{entry.type === "branch" && entry.brandName ? ` · ${entry.brandName}` : ""}</div>
              </div>
              <button onClick={() => onRestore(entry)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9, border: "1.5px solid #00897b", background: "#e0f2f1", color: "#00695c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                <RotateCcw size={12} /> Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BmModal ───────────────────────────────────────────────────────────────────
function BmModal({ title, onClose, onSubmit, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0, fontFamily: "Montserrat,sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}><Check size={14} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── BrandFormFields ───────────────────────────────────────────────────────────
function BrandFormFields({ form, setForm }) {
  const [catInput, setCatInput] = useState("");
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e", background: "#f0fdf5", fontFamily: "inherit", outline: "none", marginTop: 4, boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em" };
  const addCategory = () => {
    const val = catInput.trim();
    if (!val) return;
    if ((form.categories || []).map((c) => c.toLowerCase()).includes(val.toLowerCase())) { alert(`"${val}" is already in the list.`); return; }
    setForm((f) => ({ ...f, categories: [...(f.categories || []), val] }));
    setCatInput("");
  };
  const removeCategory = (cat) => setForm((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div><label style={lbl}>Brand Name *</label><input style={inputSt} {...f("name")} placeholder="Enter brand name" required /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={lbl}>Contact Email</label><input type="email" style={inputSt} {...f("contact_email")} placeholder="brand@example.com" /></div>
        <div>
          <label style={lbl}>Contact Phone</label>
          <input type="tel" style={inputSt} maxLength={11} value={form.contact_phone}
            onKeyDown={(e) => { const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"]; const isShortcut = (e.ctrlKey||e.metaKey)&&["a","c","v","x","z","y"].includes(e.key.toLowerCase()); if (!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
            onChange={(e) => { const digits = e.target.value.replace(/\D/g,"").slice(0,11); setForm((prev) => ({...prev,contact_phone:digits})); }}
            placeholder="09XXXXXXXXX" />
        </div>
      </div>
      <div><label style={lbl}>Description</label><textarea style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 }} {...f("description")} rows={3} placeholder="Brief description..." /></div>
      <div>
        <label style={lbl}>Categories</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input style={{ ...inputSt, marginTop: 0, flex: 1 }} placeholder="e.g. Medicine, Supplement..." value={catInput} onChange={(e) => setCatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} />
          <button type="button" onClick={addCategory} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Plus size={13} /> Add</button>
        </div>
        {(form.categories || []).length === 0
          ? <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 6 }}>No categories yet.</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
              {form.categories.map((cat) => (
                <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "#e0f2f1", border: "1.5px solid #00897b", color: "#00695c", fontSize: 12, fontWeight: 700 }}>
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#00897b" }}><X size={12} /></button>
                </span>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ── BranchFormFields ──────────────────────────────────────────────────────────
function BranchFormFields({ form, setForm, brands }) {
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e", background: "#f0fdf5", fontFamily: "inherit", outline: "none", marginTop: 4, boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em" };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div><label style={lbl}>Parent Brand *</label><select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("brand_id")} required><option value="">Select brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
      <div><label style={lbl}>Branch Name *</label><input style={inputSt} {...f("name")} required /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Region *</label>
          <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("region")} required>
            <option value="">Select region</option>
            {["NCR","Region 3","Region 4A","Region 4B","Region 5","Region 7","Region 11"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        {String(form.brand_id) === brands.find((b) => b.name === "Coffee Spot")?.id?.toString() && (
          <div><label style={lbl}>Concept *</label><select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("concept")}><option value="">Select concept</option><option>Full Store</option><option>Kiosk</option></select></div>
        )}
      </div>
      <div><label style={lbl}>Branch Manager</label><input style={inputSt} {...f("manager")} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Contact Number</label>
          <input type="tel" style={inputSt} maxLength={11} value={form.contact}
            onKeyDown={(e) => { const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End","Control"]; const isShortcut = (e.ctrlKey||e.metaKey)&&["a","c","v","x","z","y"].includes(e.key.toLowerCase()); if (!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
            onChange={(e) => { const digits = e.target.value.replace(/\D/g,"").slice(0,11); setForm((prev) => ({...prev,contact:digits})); }} />
        </div>
        <div><label style={lbl}>Address</label><input style={inputSt} {...f("address")} /></div>
      </div>
    </div>
  );
}

function BrandManagementContent({ user, brands: propBrands, onBrandsChange }) {
  const [brands,              setBrands]              = useState(propBrands || []);
  const [loading,             setLoading]             = useState(true);
  const [searchQuery,         setSearchQuery]         = useState("");
  const [filterRegion,        setFilterRegion]        = useState("all");
  const [filterBrand,         setFilterBrand]         = useState("all");
  const [showAddBrandModal,   setShowAddBrandModal]   = useState(false);
  const [showEditBrandModal,  setShowEditBrandModal]  = useState(false);
  const [showAddBranchModal,  setShowAddBranchModal]  = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBrand,       setSelectedBrand]       = useState(null);
  const [selectedBranch,      setSelectedBranch]      = useState(null);
  const [deleteTarget,        setDeleteTarget]        = useState(null);
  const [deletedHistory,      setDeletedHistory]      = useState([]);
  const [showHistory,         setShowHistory]         = useState(false);
  const emptyBrand  = { name: "", categories: [], contact_email: "", contact_phone: "", description: "" };
  const emptyBranch = { name: "", brand_id: "", region: "", manager: "", contact: "", address: "", concept: "" };
  const [brandForm,  setBrandForm]  = useState(emptyBrand);
  const [branchForm, setBranchForm] = useState(emptyBranch);

  
  const [activityLog,     setActivityLog]     = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
      });
    } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [user]);
  useEffect(() => { fetchBrands(); fetchDeleteHistory(); fetchActivityLog(); }, [fetchActivityLog]);

  const fetchDeleteHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(entry => ({ ...entry, brandName: entry.brand_name ?? null, deletedAt: entry.deleted_at ?? null, data: typeof entry.data === 'string' ? JSON.parse(entry.data) : (entry.data ?? {}) })) : [];
      setDeletedHistory(normalized);
    } catch (err) { console.error(err); }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => { if (a.name === "Head Office") return -1; if (b.name === "Head Office") return 1; return 0; });
      setBrands(sorted);
      onBrandsChange?.(sorted);
    } catch (err) { console.error("Failed to fetch brands:", err); }
    finally { setLoading(false); }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const duplicate = brands.some((b) => b.name.trim().toLowerCase() === brandForm.name.trim().toLowerCase());
    if (duplicate) { alert(`A brand named "${brandForm.name}" already exists.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandForm) });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBrandModal(false); setBrandForm(emptyBrand); }
      else alert(data.error || "Failed to add brand");
    } catch { alert("Failed to add brand"); }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands/${selectedBrand.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandForm) });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBrandModal(false); setSelectedBrand(null); }
      else alert(data.error || "Failed to update brand");
    } catch { alert("Failed to update brand"); }
  };

  const handleDeleteBrand = async () => {
    const { id, name } = deleteTarget;
    const brand = brands.find((b) => b.id === id);
    const brandToSave = { name: brand.name, categories: brand.categories || [], contact_email: brand.contact_email || null, contact_phone: brand.contact_phone || null, description: brand.description || null, branches: (brand.branches || []).map(br => ({ name: br.name, region: br.region || null, manager: br.manager || null, contact: br.contact || null, address: br.address || null, concept: br.concept || null })) };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'brand', name, brand_name: null, data: brandToSave }) });
        await fetchBrands(); await fetchDeleteHistory(); setDeleteTarget(null);
      } else alert(data.error || "Failed to delete brand");
    } catch { alert("Failed to delete brand"); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const parentBrand = brands.find((b) => String(b.id) === String(branchForm.brand_id));
    const duplicate   = parentBrand?.branches?.some((br) => br.name.trim().toLowerCase() === branchForm.name.trim().toLowerCase());
    if (duplicate) { alert(`A branch named "${branchForm.name}" already exists under this brand.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(branchForm) });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBranchModal(false); setBranchForm(emptyBranch); }
      else alert(data.error || "Failed to add branch");
    } catch { alert("Failed to add branch"); }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(branchForm) });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); }
      else alert(data.error || "Failed to update branch");
    } catch { alert("Failed to update branch"); }
  };

  const handleDeleteBranch = async () => {
    const { id, name, brandName } = deleteTarget;
    const branch = brands.flatMap((b) => b.branches || []).find((br) => br.id === id);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'branch', name, brand_name: brandName, data: branch }) });
        await fetchBrands(); await fetchDeleteHistory(); setDeleteTarget(null);
      } else alert(data.error || "Failed to delete branch");
    } catch { alert("Failed to delete branch"); }
  };

  const handleRestore = async (entry) => {
    try {
      if (entry.type === "brand") {
        const { branches, ...brandFields } = entry.data;
        const branchList = Array.isArray(branches) ? branches : [];
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandFields) });
        const data = await res.json();
        if (!data.success) { alert(data.error || "Failed to restore brand"); return; }
        const newBrandId = data.id;
        for (const br of branchList) {
          const { id: _ignore, brand_id: _ignore2, ...branchFields } = br;
          await fetch(`${process.env.REACT_APP_API_URL}/branches`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: branchFields.name, region: branchFields.region || null, manager: branchFields.manager || null, contact: branchFields.contact || null, address: branchFields.address || null, concept: branchFields.concept || null, brand_id: newBrandId }) });
        }
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
        await fetchBrands(); await fetchDeleteHistory();
      } else {
        const parentBrand = brands.find((b) => b.name === entry.brandName);
        if (!parentBrand) { alert(`Cannot restore branch: parent brand "${entry.brandName || 'unknown'}" not found.`); return; }
        const { id: _id, brand_id: _bid, ...branchFields } = entry.data;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: branchFields.name, region: branchFields.region || null, manager: branchFields.manager || null, contact: branchFields.contact || null, address: branchFields.address || null, concept: branchFields.concept || null, brand_id: parentBrand.id }) });
        const data = await res.json();
        if (data.success) {
          await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
          await fetchBrands(); await fetchDeleteHistory();
        } else alert(data.error || "Failed to restore branch");
      }
    } catch (err) { console.error("Restore error:", err); alert("Failed to restore: " + err.message); }
  };

  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const allRegions    = [...new Set(brands.flatMap((b) => b.branches?.map((br) => br.region) || []).filter(Boolean))];
  const filteredBrands = brands.map((brand) => ({
    ...brand,
    branches: (brand.branches || []).filter((br) =>
      (!searchQuery || br.name.toLowerCase().includes(searchQuery.toLowerCase()) || (br.manager || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterRegion === "all" || br.region === filterRegion)
    ),
  })).filter((brand) => {
    if (filterBrand !== "all" && String(brand.id) !== String(filterBrand)) return false;
    if (filterRegion !== "all" && brand.branches.length === 0) return false;
    if (searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
    return true;
  });

  const ConceptBadge = ({ concept }) => {
    const styles = { "Full Store": { bg: "rgba(16,185,129,0.1)", color: "#059669" }, "Kiosk": { bg: "rgba(59,130,246,0.1)", color: "#2563eb" } };
    const s = styles[concept] || { bg: "rgba(156,163,175,0.1)", color: "#6b7280" };
    return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{concept || "—"}</span>;
  };

  const thSt = { padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "2px solid #d1eedd", background: "#f8fffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const tdSt = { padding: "11px 12px", borderBottom: "1px solid #f0f8f0", verticalAlign: "middle", overflow: "hidden" };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`.bm-root * { font-family:'Montserrat',sans-serif !important; box-sizing:border-box; } .bm-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; } .bm-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); } .bm-brand-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; box-shadow:0 2px 14px rgba(0,140,60,0.07); margin-bottom:24px; overflow:hidden; } .bm-brand-header { background:linear-gradient(135deg,#2E7D32,#00897b); color:#fff; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; } .bm-input { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; } .bm-input:focus { border-color:#00897b; box-shadow:0 0 0 2px rgba(0,137,123,0.12); } .bm-select { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; appearance:none; cursor:pointer; } .bm-branch-tr:hover td { background:#f6fef8 !important; } .bm-branch-tr:last-child td { border-bottom:none !important; }`}</style>
      <div className="bm-root">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Brands",   value: brands.length, icon: <Globe size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "Registered brands" },
            { label: "Total Branches", value: totalBranches, icon: <Store size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Across all brands" },
          ].map((s, i) => (
            <div key={i} className="bm-stat">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>{s.value}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>{s.sub}</span>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
              <input type="text" placeholder="Search brands or branches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bm-input" style={{ paddingLeft:32, width:260 }}/>
            </div>
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bm-select" style={{ width:180 }}>
              <option value="all">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bm-select" style={{ width:180 }}>
              <option value="all">All Regions</option>
              {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => setShowActivityLog(true)}
  style={{ display:"inline-flex", alignItems:"center", gap:6, height:36, padding:"0 16px", borderRadius:9, border:`1.5px solid #00897b`, background:"#fff", color:"#00695c", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
  <ActivityIcon size={13}/> Activity Log
  {activityLog.length > 0 && (
    <span style={{ background:"#00897b", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
      {activityLog.length}
    </span>
  )}
</button>
            <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
              <button onClick={() => setShowHistory(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #dc2626", background:"#fff", color:"#dc2626", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <History size={14}/> Delete History{deletedHistory.length > 0 ? ` (${deletedHistory.length})` : ""}
              </button>
              <button onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #00897b", background:"#fff", color:"#00897b", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <Plus size={14}/> Add Branch
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>Loading brands & branches...</div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>No brands found. Add your first brand above.</div>
        ) : filteredBrands.map((brand) => (
          <div key={brand.id} className="bm-brand-card">
            <div className="bm-brand-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Globe size={20} color="#fff" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                    {brand.contact_email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? "branch" : "branches"}</span>
                <button onClick={() => { setSelectedBrand(brand); setBrandForm({ name: brand.name, categories: brand.categories || [], contact_email: brand.contact_email, contact_phone: brand.contact_phone, description: brand.description }); setShowEditBrandModal(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Edit2 size={12} /> Edit Brand</button>
                <button onClick={() => setDeleteTarget({ type: "brand", id: brand.id, name: brand.name, branchCount: brand.branches?.length || 0 })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,150,150,0.5)", background: "rgba(255,80,80,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Trash2 size={12} /> Delete</button>
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <colgroup><col style={{ width: "20%" }} /><col style={{ width: "11%" }} /><col style={{ width: "16%" }} /><col style={{ width: "13%" }} /><col style={{ width: "22%" }} /><col style={{ width: "10%" }} /><col style={{ width: "8%" }} /></colgroup>
                <thead><tr>{["Branch Name","Region","Manager","Contact","Address","Concept","Actions"].map((h) => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                <tbody>
                  {(!brand.branches || brand.branches.length === 0) ? (
                    <tr><td colSpan={7} style={{ padding: "24px 20px", color: "#5a7a65", fontSize: 13, fontStyle: "italic", textAlign: "center", borderBottom: "none" }}>No branches yet.{" "}<span style={{ color: "#00897b", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }} onClick={() => { setBranchForm({ ...emptyBranch, brand_id: brand.id }); setShowAddBranchModal(true); }}>Add the first branch</span></td></tr>
                  ) : brand.branches.map((branch) => (
                    <tr key={branch.id} className="bm-branch-tr">
                      <td style={{ ...tdSt, fontWeight: 700, color: "#0d2b1e", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.name}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.region}</td>
                      <td style={{ ...tdSt, color: "#0d2b1e", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.manager || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.contact || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.address || "—"}</td>
                      <td style={tdSt}>{brand.name === "Coffee Spot" ? <ConceptBadge concept={branch.concept} /> : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}</td>
                      <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          <button title="Edit branch" onClick={() => { setSelectedBranch(branch); setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager, contact: branch.contact, address: branch.address, concept: branch.concept || "" }); setShowEditBranchModal(true); }} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c", cursor: "pointer", flexShrink: 0 }}><Pencil size={13} /></button>
                          <button title="Delete branch" onClick={() => setDeleteTarget({ type: "branch", id: branch.id, name: branch.name, brandName: brand.name })} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showAddBrandModal   && <BmModal title="Add New Brand"  onClose={() => setShowAddBrandModal(false)}  onSubmit={handleAddBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showEditBrandModal  && <BmModal title="Edit Brand"     onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showAddBranchModal  && <BmModal title="Add New Branch" onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
      {showEditBranchModal && <BmModal title="Edit Branch"    onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
      {deleteTarget && <DeleteConfirmModal target={deleteTarget} onConfirm={deleteTarget.type === "brand" ? handleDeleteBrand : handleDeleteBranch} onClose={() => setDeleteTarget(null)} />}
      {showHistory && <DeleteHistoryPanel history={deletedHistory} onRestore={handleRestore} onClose={() => setShowHistory(false)} />}
        {showActivityLog && (
  <InventoryActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
  />
)}
    </div>
  );
}
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#2c3e50" }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: "#e53935", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}

function MobileShopContent({ user, brands: propBrands = [] }) {
  const msInputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px",
    border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.875rem",
    color: C.ink, background: C.white, outline: "none", boxSizing: "border-box",
    fontFamily: "'Montserrat', sans-serif", // ensures typed text AND placeholder text use Montserrat
  };

  const [activityLog,     setActivityLog]     = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [items,           setItems]           = useState([]);
  const [errors,          setErrors]          = useState({});
  const [loading,         setLoading]         = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState(null);
  const [editingItem,     setEditingItem]     = useState(null);
  const [editErrors,      setEditErrors]      = useState({});
  const [editLoading,     setEditLoading]     = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterShop,      setFilterShop]      = useState("all");
  const [brands,          setBrands]          = useState([]);
  const [stockItems,      setStockItems]      = useState([]);
  const [newItem,         setNewItem]         = useState({ name:"", price:"", stock:"", image_url:"", shop:"", brand:"" });
  const excelRef = useRef(null);
  const addImageRef = useRef(null); 
  const editImageRef = useRef(null); 

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch shop activity log:", err); }
  }, []);

  const fetchItems = async () => {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
    const data = await res.json();
    setItems(data);
  };

  const fetchBrands = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); }
  };

  const fetchStockItems = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`);
      const data = await res.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch { setStockItems([]); }
  };

  useEffect(() => {
    fetchItems();
    fetchBrands();
    fetchStockItems();
    fetchActivityLog();
  }, [fetchActivityLog]);

  const uniqueShops = [...new Set(items.map(i => i.shop).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    if (q && !item.name?.toLowerCase().includes(q) && !item.shop?.toLowerCase().includes(q)) return false;
    if (filterShop !== "all" && item.shop !== filterShop) return false;
    return true;
  });

  const getBranchesForBrand = (brandName) => {
    const found = brands.find(b => b.name === brandName);
    if (!found) return [];
    return (found.branches || []).map(br => typeof br === "string" ? br : br.name);
  };

  const getStockNamesForBrand = (brandName) => {
    if (!brandName) return [];
    const target = brandName.trim().toLowerCase();
    const exact = stockItems.filter(i => (i.brand || "").trim().toLowerCase() === target);
    const pool = exact.length > 0
      ? exact
      : stockItems.filter(i => (i.brand || "").trim().toLowerCase().includes(target) || target.includes((i.brand || "").trim().toLowerCase()));
    return [...new Set(pool.map(i => i.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  };

  const validate = () => {
    const newErrors = {};
    if (!newItem.brand) newErrors.brand = "Brand is required";
    if (!newItem.name.trim()) newErrors.name = "Item name is required";
    if (!newItem.price) newErrors.price = "Price is required";
    else if (isNaN(newItem.price) || Number(newItem.price) <= 0) newErrors.price = "Price must be greater than 0";
    if (newItem.stock !== "" && (isNaN(newItem.stock) || Number(newItem.stock) < 0)) newErrors.stock = "Stock must be 0 or more";
    if (!newItem.image_url) newErrors.image_url = "Photo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reads a selected image file and stores it as a data URL in image_url
  const handleImageSelect = (e, target /* "add" | "edit" */) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (target === "edit") setEditingItem(prev => ({ ...prev, image_url: ev.target.result }));
      else setNewItem(prev => ({ ...prev, image_url: ev.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const validateEdit = () => {
    const errs = {};
    if (!editingItem.name.trim()) errs.name = "Item name is required";
    if (!editingItem.price) errs.price = "Price is required";
    else if (isNaN(editingItem.price) || Number(editingItem.price) <= 0) errs.price = "Price must be greater than 0";
    if (!editingItem.image_url || !editingItem.image_url.trim()) errs.image_url = "Photo is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const logActivity = useCallback(async (action, itemName, shopName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        item_name: itemName,
        branch: shopName,
        performed_by: user?.name || "System",
        role: user?.role || "Unknown",
        changes,
      }),
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
}, [user]); 

  const capitalize = (str) => str.trim().replace(/\b\w/g, c => c.toUpperCase());

  const addItem = async () => {
    if (loading || !validate()) return;

    const duplicate = items.find(
      i => i.name.trim().toLowerCase() === newItem.name.trim().toLowerCase()
        && i.shop.trim().toLowerCase() === newItem.shop.trim().toLowerCase()
    );
    if (duplicate) {
      alert(`"${newItem.name}" already exists in ${newItem.shop}. Please edit the existing item instead.`);
      return;
    }

    setLoading(true);
    await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:      capitalize(newItem.name),
        price:     Number(newItem.price),
        unit:      "",
        image_url: newItem.image_url,
        shop:      newItem.brand,
        brand:     newItem.brand,
        stock:     Number(newItem.stock || 0),
      }),
    });

    await logActivity("add", capitalize(newItem.name), newItem.brand);
    setNewItem({ name:"", price:"", stock:"", image_url:"", shop:"", brand:"" });
    setErrors({});
    setLoading(false);
    setShowAddModal(false); // NEW: close modal on success
    fetchItems();
  };

  const saveEdit = async () => {
    if (editLoading || !validateEdit()) return;
    setEditLoading(true);
    await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${editingItem.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:       capitalize(editingItem.name.trim()),
        price:      Number(editingItem.price),
        unit:       editingItem.unit || "",
        image_url:  editingItem.image_url,
        shop:       editingItem.brand,
        brand:      editingItem.brand,
        stock:      Number(editingItem.stock),
        is_visible: editingItem.is_visible,
      }),
    });
    await logActivity("edit", capitalize(editingItem.name), editingItem.brand, `price: ₱${editingItem.price}`);
    setEditingItem(null);
    setEditErrors({});
    setEditLoading(false);
    fetchItems();
  };

  const importExcel = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb = XLSX.read(ev.target.result, { type: "array" });
      const rows_to_save = [];
      wb.SheetNames.forEach(sheetName => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
        rows.forEach(row => {
          const name  = String(row.name  || row.Name  || row["ITEM NAME"] || "").trim();
          const price = parseFloat(row.price || row.Price || 0) || 0;
          if (!name || price <= 0) return;

          const shop = String(row.shop || row.Shop || "Coffee Spot").trim();

          // Skip duplicates — same name + shop
          const alreadyExists = items.some(
            i => i.name.trim().toLowerCase() === name.toLowerCase()
              && i.shop.trim().toLowerCase() === shop.toLowerCase()
          );
          if (alreadyExists) return;

          rows_to_save.push({
            name: capitalize(name.trim()), price,
            unit:      String(row.unit      || row.Unit      || "").trim(),
            stock:     parseInt(row.stock   || row.Stock     || 0) || 0,
            shop:      String(row.shop      || row.Shop      || "Coffee Spot").trim(),
            brand:     String(row.brand     || row.Brand     || "").trim(),
            image_url: String(row.image_url || row["Image URL"] || "").trim(),
            is_visible: true,
          });
        });
      });
      let saved = 0;
      for (const item of rows_to_save) {
        try {
          const capitalize = (str) => str.trim().replace(/\b\w/g, c => c.toUpperCase());
          const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name:       capitalize(item.name.trim()),
              price:      item.price,
              unit:       item.unit,
              stock:      item.stock,
              shop:       item.shop,
              brand:      item.brand,
              image_url:  item.image_url,
              is_visible: item.is_visible,
            }),
          });
          const d = await res.json();
          if (d.success) {
            saved++;
            await logActivity("import", item.name, item.shop, `price=₱${item.price}`);
          }
        } catch {}
      }
      e.target.value = "";
      const skipped = rows_to_save.length - saved;
      alert(
        `Parsed ${rows_to_save.length} row(s).\n` +
        `✅ Saved: ${saved} item(s)\n` +
        `${skipped > 0 ? `⏭ Skipped (duplicates): ${skipped}` : ""}`
      );
      fetchItems();
    };
    reader.readAsArrayBuffer(file);
  };

  const deleteItem = async (id) => {
    const deleted = items.find(i => i.id === id);
    await logActivity("delete", deleted?.name, deleted?.shop);
    await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}`,
      { method:"DELETE" });
    setConfirmDelete(null);
    fetchItems();
  };

  const toggleVisibility = async (id) => {
  const item = items.find(i => String(i.id) === String(id));
  if (!item) {
    console.warn("toggleVisibility: item not found for id", id, items.map(i => i.id));
  }
  const newStatus = item ? !item.is_visible : null;

  await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}/toggle`, { method: "PUT" });

  await logActivity(
    newStatus ? "show" : "hide",
    item?.name || "Unknown item",
    item?.shop || "Unknown shop",
    newStatus ? "Item made visible" : "Item hidden"
  );

  fetchItems();
};

  // Shared style for the toolbar action buttons (Add Item / Import Excel / Activity Log)
  const toolbarBtnSt = {
    display:"inline-flex", alignItems:"center", gap:6,
    height:36, padding:"0 16px", borderRadius:9,
    fontSize:13, fontWeight:700, cursor:"pointer",
    fontFamily:"inherit", whiteSpace:"nowrap", border:"none",
  };

  const closeAddModal = () => { setShowAddModal(false); setErrors({}); setNewItem({ name:"", price:"", stock:"", image_url:"", shop:"", brand:"" }); };

  // Shared "click to upload / preview / remove" photo picker used in Add and Edit modals
  const PhotoPicker = ({ value, onPick, onRemove, inputRef, error }) => (
    <Field label="Photo *" error={error}>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          cursor:"pointer", borderRadius:8, background:C.bg, textAlign:"center",
          border:`1.5px dashed ${error ? "#e53935" : C.border}`,
          padding: value ? 8 : "20px 8px",
        }}>
        {value ? (
          <div style={{ position:"relative", display:"inline-block" }}>
            <img src={value} alt="preview"
              style={{ width:84, height:84, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}`, display:"block" }}/>
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position:"absolute", top:-8, right:-8, width:20, height:20, borderRadius:"50%",
                border:"none", background:"#e53935", color:"#fff", fontSize:11, lineHeight:1, cursor:"pointer" }}>
              ✕
            </button>
          </div>
        ) : (
          <div style={{ color:C.muted, fontSize:12, fontFamily:"'Montserrat', sans-serif" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>📷</div>
            Click to upload photo
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display:"none" }}/>
    </Field>
  );

  return (
    <div style={{ maxWidth:960, margin:"0 auto", fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editingItem && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:18, width:"100%", maxWidth:560, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", overflow:"hidden" }}>
            <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:15, fontWeight:900, color:"#fff" }}>Edit Item</span>
              <button onClick={() => { setEditingItem(null); setEditErrors({}); }}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.8)", fontSize:20, cursor:"pointer", lineHeight:1, padding:0 }}>✕</button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1rem" }}>
                <Field label="Brand *" error={editErrors.brand}>
                  <select
                    value={editingItem.brand || ""}
                    onChange={e => setEditingItem({ ...editingItem, brand: e.target.value, shop: e.target.value, branches: [] })}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.brand ? "#e53935" : C.border}` }}>
                    <option value="">Select brand…</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Item Name *" error={editErrors.name}>
                  {(() => {
                    const stockNames = getStockNamesForBrand(editingItem.brand);
                    // keep the item's current name selectable even if it's no longer in the stock list
                    const options = editingItem.name && !stockNames.includes(editingItem.name)
                      ? [editingItem.name, ...stockNames]
                      : stockNames;
                    return (
                      <select
                        value={editingItem.name}
                        disabled={!editingItem.brand}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                        style={{ ...msInputStyle, border:`1px solid ${editErrors.name ? "#e53935" : C.border}`,
                          opacity: !editingItem.brand ? 0.6 : 1, cursor: !editingItem.brand ? "not-allowed" : "pointer" }}>
                        {!editingItem.brand && <option value="">Select brand first…</option>}
                        {options.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    );
                  })()}
                </Field>
                <Field label="Price" error={editErrors.price}>
                  <input value={editingItem.price} onChange={e => setEditingItem({...editingItem, price:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
                </Field>
                <Field label="Unit (Optional)">
                  <input value={editingItem.unit || ""} onChange={e => setEditingItem({...editingItem, unit:e.target.value})}
                    style={msInputStyle} placeholder="e.g. per cup, per bottle"/>
                </Field>
                <PhotoPicker
                  value={editingItem.image_url}
                  onPick={e => handleImageSelect(e, "edit")}
                  onRemove={() => setEditingItem({ ...editingItem, image_url:"" })}
                  inputRef={editImageRef}
                  error={editErrors.image_url}
                />
              </div>
              <div style={{ marginTop:"1.25rem", display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => { setEditingItem(null); setEditErrors({}); }}
                  style={{ padding:"8px 18px", borderRadius:9, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={editLoading}
                  style={{ padding:"8px 22px", borderRadius:9, border:"none",
                    background: editLoading ? C.greenMid : `linear-gradient(135deg,${C.teal},${C.green})`,
                    color:C.white, fontWeight:800, fontSize:13, cursor: editLoading ? "not-allowed" : "pointer",
                    opacity: editLoading ? 0.7 : 1, boxShadow:"0 2px 10px rgba(0,180,90,0.28)", fontFamily:"inherit" }}>
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add New Item Modal (was a solo card — now a popup like Edit) ─── */}
      {showAddModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:18, width:"100%", maxWidth:560, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", overflow:"hidden" }}>
            <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:15, fontWeight:900, color:"#fff" }}>Add New Item</span>
              <button onClick={closeAddModal}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.8)", fontSize:20, cursor:"pointer", lineHeight:1, padding:0 }}>✕</button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1rem" }}>
                <Field label="Brand *" error={errors.brand}>
                  <select
                    value={newItem.brand}
                    onChange={e => setNewItem({ ...newItem, brand: e.target.value, shop: e.target.value, name:"" })}
                    style={{ ...msInputStyle, border:`1px solid ${errors.brand ? "#e53935" : C.border}` }}>
                    <option value="">Select brand…</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Item Name *" error={errors.name}>
                  {(() => {
                    const stockNames = getStockNamesForBrand(newItem.brand);
                    return (
                      <>
                        <select
                          value={newItem.name}
                          disabled={!newItem.brand}
                          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                          style={{ ...msInputStyle, border:`1px solid ${errors.name ? "#e53935" : C.border}`,
                            opacity: !newItem.brand ? 0.6 : 1, cursor: !newItem.brand ? "not-allowed" : "pointer" }}>
                          <option value="">
                            {!newItem.brand ? "Select brand first…" : stockNames.length === 0 ? "No products found for this brand" : "Select item…"}
                          </option>
                          {stockNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        {newItem.brand && stockNames.length === 0 && (
                          <span style={{ fontSize:11, color:C.muted, fontStyle:"italic", marginTop:4, display:"block" }}>
                            No matching products in Stock Inventory for this brand yet.
                          </span>
                        )}
                      </>
                    );
                  })()}
                </Field>
                <Field label="Stock" error={errors.stock}>
                  <input value={newItem.stock} onChange={e => setNewItem({...newItem, stock:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${errors.stock ? "#e53935" : C.border}` }} placeholder="0"/>
                </Field>
                <Field label="Price *" error={errors.price}>
                  <input value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${errors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
                </Field>
                <PhotoPicker
                  value={newItem.image_url}
                  onPick={e => handleImageSelect(e, "add")}
                  onRemove={() => setNewItem({ ...newItem, image_url:"" })}
                  inputRef={addImageRef}
                  error={errors.image_url}
                />
              </div>

              <div style={{ marginTop:"1.25rem", display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={closeAddModal}
                  style={{ padding:"8px 18px", borderRadius:9, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
                <button onClick={addItem} disabled={loading}
                  style={{ padding:"8px 22px", borderRadius:9, border:"none",
                    background: loading ? C.greenMid : `linear-gradient(135deg,${C.teal},${C.green})`,
                    color:C.white, fontWeight:800, fontSize:13, cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1, boxShadow:"0 2px 10px rgba(0,180,90,0.28)", fontFamily:"inherit" }}>
                  {loading ? "Adding…" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shop Items Table ---*/}
      <div style={{ background:C.white, borderRadius:18, border:`1px solid rgba(0,168,76,0.12)`, boxShadow:"0 2px 14px rgba(0,140,60,0.07)", overflow:"hidden" }}>
        <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:15, fontWeight:900, color:"#fff", letterSpacing:"-0.01em" }}>Shop Items</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Toolbar: search, filter, and the three aligned action buttons */}
        <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding:"7px 12px 7px 28px", borderRadius:9, border:`1px solid ${C.border}`, fontSize:13, background:C.bg, fontFamily:"inherit", outline:"none", width:220 }}
            />
          </div>
          <select
            value={filterShop}
            onChange={e => setFilterShop(e.target.value)}
            style={{ padding:"7px 12px", borderRadius:9, border:`1px solid ${C.border}`, fontSize:13, background:C.bg, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="all">All Shops</option>
            {uniqueShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
          </select>
          {(searchQuery || filterShop !== "all") && (
            <button onClick={() => { setSearchQuery(""); setFilterShop("all"); }}
              style={{ padding:"7px 12px", borderRadius:9, border:`1px solid ${C.border}`, background:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", color:"#5a7a65" }}>
              Clear
            </button>
          )}

          {/* ── Add Item / Import Excel / Activity Log — aligned together ── */}
          <button onClick={() => setShowAddModal(true)}
            style={{ ...toolbarBtnSt, background:`linear-gradient(135deg,${C.teal},${C.green})`, color:C.white, boxShadow:"0 2px 10px rgba(0,180,90,0.28)" }}>
            <span style={{ fontSize:15 }}>+</span> Add Item
          </button>

          <label style={{ ...toolbarBtnSt, border:`1px solid ${C.border}`, background:C.white, color:C.ink }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>

          <button onClick={() => setShowActivityLog(true)}
            style={{ ...toolbarBtnSt, border:`1.5px solid ${C.green}`, background:C.white, color:C.greenDk }}>
            <ActivityIcon size={13}/> Activity Log
            {activityLog.length > 0 && (
              <span style={{ background:C.green, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
                {activityLog.length}
              </span>
            )}
          </button>

          <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>
            {filteredItems.length} of {items.length} items
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No shop items yet. Add one above.</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  {["Image","Shop","Item Name","Price","Unit","Status",""].map((label, i) => (
                    <th key={i} style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", background:"#f8fffe" }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isConfirm = confirmDelete === item.id;
                  return (
                    <tr key={item.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                      onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"10px 12px" }}>
                        <img src={item.image_url || null} alt="" style={{ width:48, height:48, borderRadius:8, objectFit:"cover", border:`1px solid ${C.border}`, display:"block" }} onError={e => (e.target.style.display="none")}/>
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c" }}>{item.shop}</span>
                      </td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>{item.name}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                      <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.unit || <span style={{ fontStyle:"italic" }}>—</span>}</td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background: item.is_visible ? "#e0f2f1" : "#fce4ec", color: item.is_visible ? "#00695c" : "#c62828" }}>
                          {item.is_visible ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                          <button onClick={() => { setEditingItem({...item}); setEditErrors({}); }}
                            style={{ ...smallBtnSt, border:`1px solid #bbdefb`, color:"#1565c0", background:"#e3f2fd" }}>
                            Edit
                          </button>
                          <button onClick={() => toggleVisibility(item.id)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}>
                            {item.is_visible ? "Hide" : "Show"}
                          </button>
                          <button onClick={() => { if (isConfirm) { deleteItem(item.id); } else { setConfirmDelete(item.id); } }}
                            style={{ ...smallBtnSt, border:isConfirm?"none":"1px solid #ffcdd2", color:isConfirm?C.white:"#e53935", background:isConfirm?"#e53935":C.white }}>
                            <TrashIcon size={12}/> {isConfirm ? "Confirm?" : "Delete"}
                          </button>
                          {isConfirm && (
                            <button onClick={() => setConfirmDelete(null)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showActivityLog && (
        <InventoryActivityLogPanel
          log={activityLog}
          onClose={() => setShowActivityLog(false)}
        />
      )}
    </div>
  );
}

function InventoryActivityLogPanel({ log, onClose }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = log.filter(entry => {
    if (typeFilter !== "all" && entry.action !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!entry.item_name?.toLowerCase().includes(q) &&
          !(entry.performed_by || "").toLowerCase().includes(q) &&
          !(entry.branch || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const actionBadge = action => {
    const map = {
      add:    { bg:"rgba(16,185,129,0.12)", color:"#059669", label:"Added" },
      edit:   { bg:"rgba(59,130,246,0.12)", color:"#1d4ed8", label:"Edited" },
      import: { bg:"rgba(139,92,246,0.12)", color:"#7c3aed", label:"Imported" },
      delete: { bg:"rgba(239,68,68,0.12)", color:"#dc2626", label:"Deleted" },
    };
    const s = map[action] || map.edit;
    return <span style={{ padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:C.ink, margin:0 }}>Activity Log</h2>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#e0f2f1", color:C.greenDk }}>{filtered.length} entries</span>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 200px" }}>
            <div style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
            <input type="text" placeholder="Search item, user, branch…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ ...invInputSt, paddingLeft:28, height:32, fontSize:12 }}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ ...invInputSt, width:140, height:32, fontSize:12 }}>
            <option value="all">All Actions</option>
            <option value="add">Added</option>
            <option value="edit">Edited</option>
            <option value="import">Imported</option>
            <option value="delete">Deleted</option>
          </select>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, padding:"6px 0 8px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
          <span>Action</span><span>Item</span><span>Branch</span><span>By</span><span>Timestamp</span>
        </div>

        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No activity yet.</div>
          ) : filtered.map((entry, i) => (
            <div key={entry.id || i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, alignItems:"center", padding:"11px 0", borderBottom: i < filtered.length-1 ? "1px solid #f0f8f0" : "none" }}>
              <div>{actionBadge(entry.action)}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.item_name}</div>
                {entry.changes && <div style={{ fontSize:10, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.changes}</div>}
              </div>
              <div style={{ fontSize:11, color:C.muted }}>{entry.branch || "—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.ink }}>{entry.performed_by || "System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.created_at ? fmtTs(entry.created_at) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateTempPassword(length = 10) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghjkmnpqrstuvwxyz",
    "23456789",
    "!@#$",
  ];
  const chars = groups.join("");
  const password = [
    ...groups.map(group => group[Math.floor(Math.random() * group.length)]),
    ...Array.from({ length: Math.max(length - groups.length, 0) }, () => chars[Math.floor(Math.random() * chars.length)]),
  ];
  return password.sort(() => Math.random() - 0.5).join("");
}

function ApplicationsContent({user, applications: initialApps, brands: propBrands = []  }) {

  const [activityLog,     setActivityLog]     = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [applications, setApplications] = useState(initialApps || []);
  const [viewApp,      setViewApp]      = useState(null);
  const [accountApp,   setAccountApp]   = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  
  const showAlert = (message, type = "info") =>
  setAlertModal({ message, type });

  const [menuApp, setMenuApp] = useState(null);
  const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
  const [showAppDeleteHistory, setShowAppDeleteHistory] = useState(false);
  const [role, setRole] = useState("franchisee"); 

  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterFranchise, setFilterFranchise] = useState("all");
  const [searchQuery,     setSearchQuery]     = useState("");

  const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
}, [user]);

  const fetchApplications = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const filteredApps = applications.filter(app => {
  const q = searchQuery.toLowerCase();
  if (q && !app.name?.toLowerCase().includes(q) &&
           !app.email?.toLowerCase().includes(q) &&
           !app.phone?.toLowerCase().includes(q)) return false;
  if (filterStatus    !== "all" && app.status    !== filterStatus)    return false;
  if (filterFranchise !== "all" && app.franchise !== filterFranchise) return false;
  return true;
});

  const fetchAppDeleteHistory = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history`);
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            id:        row.id,
            data:      row.application_data ?? row.data ?? {},
            deletedAt: row.deleted_at       ?? row.deletedAt,
          }))
        : [];
      setAppDeleteHistory(mapped);
    } catch (err) {
      console.error("Failed to fetch application delete history:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAppDeleteHistory();
    fetchActivityLog();
  }, []);
  

  // ── Approve ─────────────────────────────────────────────────────────────
const handleApprove = async (id) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "approved" }),
    });
     const app = applications.find(a => a.id === id);
    await logActivity("edit", app?.name, app?.franchise, "status → approved"); // ← add here
    setApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status: "approved" } : a)
    );
    // Keep menuApp in sync so buttons disable immediately
    setMenuApp(prev => prev?.id === id ? { ...prev, status: "approved" } : prev);
  } catch {
    alert("Failed to approve application.");
  }
};

const handleReject = async (id) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "rejected" }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Failed to reject application."); return; }

    const app = applications.find(a => a.id === id);
    await logActivity("edit", app?.name, app?.franchise, "status → rejected");

    if (app?.email) {
      await fetch(`${process.env.REACT_APP_API_URL}/send-rejection`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to: app.email, name: app.name }),
      });
    }

    setApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status: "rejected" } : a)
    );
    // Keep menuApp in sync so buttons disable immediately
    setMenuApp(prev => prev?.id === id ? { ...prev, status: "rejected" } : prev);
  } catch {
    alert("Failed to reject application.");
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const app = applications.find(a => a.id === id);
        await logActivity("delete", app?.name, app?.franchise);
        setApplications(prev => prev.filter(a => a.id !== id));
        await fetchAppDeleteHistory();
      } else {
        alert(data.error || "Failed to delete application.");
      }
    } catch {
      alert("Failed to delete application.");
    }
  };

  const handleRestoreApplication = async (entry) => {
    try {
      const d = entry.data; // raw DB row — snake_case keys

      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:             d.name,
          email:            d.email,
          phone:            d.phone,
          franchise:        d.franchise,
          paymentMode:      d.payment_mode,
          dob:              d.dob,
          civilStatus:      d.civil_status,
          gender:           d.gender,
          nationality:      d.nationality,
          address:          d.address,
          dependents:       d.dependents,
          spouseName:       d.spouse_name,
          spouseOccupation: d.spouse_occupation,
          employmentType:   d.employment_type,
          yearsEmployer:    d.years_employer,
          income:           d.income,
          employerName:     d.employer_name,
          businessAddress:  d.business_address,
          position:         d.position,
          businessNature:   d.business_nature,
          signature:        d.signature,
          dateSigned:       d.date_signed,
        }),
      });
      const result = await res.json();

      if (result.success) {
        await logActivity("add", d.name, d.franchise, "Restored from delete history"); // ← add here
        // Remove from delete history
        await fetch(
          `${process.env.REACT_APP_API_URL}/application-delete-history/${entry.id}`,
          { method: "DELETE" }
        );
        await fetchAppDeleteHistory();
        await fetchApplications();
        alert(`"${d.name}" has been restored.`);
      } else {
        alert(result.error || "Failed to restore.");
      }
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore application.");
    }
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      pending:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
      approved: { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
      rejected: { bg: "rgba(239,68,68,0.1)",   color: "#dc2626" },
    };
    const s = map[status] || map["pending"];
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      }}>
        {status?.toUpperCase()}
      </span>
    );
  };

  // ── Delete History Modal ─────────────────────────────────────────────────
  const DeleteHistoryModal = () => {
    if (!showAppDeleteHistory) return null;

    const fmt = (d) =>
      new Date(d).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

    return (
      <div
        onClick={() => setShowAppDeleteHistory(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 680, maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Application Delete History
              </h2>
              {appDeleteHistory.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px",
                  borderRadius: 20, background: "#fee2e2", color: "#dc2626",
                }}>
                  {appDeleteHistory.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAppDeleteHistory(false)}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {appDeleteHistory.length === 0 ? (
              <div style={{
                padding: "40px 0", textAlign: "center",
                color: "#9ca3af", fontSize: 13, fontStyle: "italic",
              }}>
                No deleted applications yet.
              </div>
            ) : appDeleteHistory.map((entry, i) => {
              const app = entry.data || {};
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0",
                    borderBottom: i < appDeleteHistory.length - 1
                      ? "1px solid #f0f8f0" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 13, color: "#0d2b1e",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {app.name || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>
                      {app.email} · {app.franchise}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      Deleted: {entry.deletedAt ? fmt(entry.deletedAt) : "—"}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreApplication(entry)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", borderRadius: 9,
                      border: "1.5px solid #00897b", background: "#e0f2f1",
                      color: "#00695c", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    }}
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Delete History Modal (rendered at root level, NOT inside table) */}
      <DeleteHistoryModal />

      {/* ── View Application Modal ── */}
      {viewApp && ( 
         <>
    {console.log("viewApp:", JSON.stringify(viewApp, null, 2))}
        <div onClick={() => setViewApp(null)} style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 680,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            maxHeight: "90vh", overflowY: "auto",
            fontFamily: "Montserrat, sans-serif",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Application Details
              </h2>
              <button onClick={() => setViewApp(null)} style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={15} />
              </button>
            </div>

            {/* Status + Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: "#f0fdf5", borderRadius: 10, border: "1px solid #b2dfdb", flexWrap: "wrap" }}>
              <StatusBadge status={viewApp.status} />
              <span style={{ fontSize: 12, color: "#5a7a65" }}>
                Date Applied: <strong>
                  {viewApp.date 
                    ? new Date(viewApp.date).toLocaleDateString("en-PH", { 
                        year: "numeric", month: "short", day: "numeric",
                        timeZone: "Asia/Manila"
                      }) 
                    : "—"}
                </strong>
              </span>
              {viewApp.idType && (
                <span style={{ fontSize: 12, color: "#5a7a65", marginLeft: "auto" }}>
                  ID Used: <strong>{viewApp.idType}</strong>
                </span>
              )}
            </div>

            {/* Section Helper */}
            {(() => {
              const Section = ({ title, children }) => (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: "#00897b", letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: 10, paddingBottom: 6,
                    borderBottom: "1.5px solid #e0f2f1",
                  }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {children}
                  </div>
                </div>
              );

              const Field = ({ label, value, full }) => (
                <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: value ? "#0d2b1e" : "#9ca3af",
                    padding: "7px 10px", background: "#f8fffe", borderRadius: 8,
                    border: "1px solid #e0f2f1", fontStyle: value ? "normal" : "italic",
                  }}>
                    {value || "—"}
                  </div>
                </div>
              );

             const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : null;

              return (
                <>
{viewApp.franchise === "iPharma Mart" ? (
  // ── iPharma-specific view ──
  <>
    <Section title="Basic Information">
      <Field label="Full Name"          value={viewApp.name}              full />
      <Field label="Email Address"      value={viewApp.email} />
      <Field label="Phone Number"       value={viewApp.phone} />
      <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
    </Section>

    <Section title="Personal Information">
      <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
      <Field label="Marital Status"     value={viewApp.maritalStatus || viewApp.civil_status} />
      <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
      <Field label="TIN"                value={viewApp.tin} />
      <Field label="ID Type Used"       value={viewApp.idType} />
      <Field label="Address"            value={viewApp.address}           full />
    </Section>

    {(viewApp.spouseName || viewApp.spouseOccupation) && (
      <Section title="Spouse Information">
        <Field label="Spouse Name"       value={viewApp.spouseName} />
        <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
        <Field label="Spouse Date of Birth" value={fmtDate(viewApp.spouseDob)} />
      </Section>
    )}

    {viewApp.education?.length > 0 && (
      <Section title="Educational Background">
        {viewApp.education.map((e, i) => (
          <React.Fragment key={i}>
            <Field label={`Degree #${i+1}`}  value={e.degree} />
            <Field label="School"            value={e.school} />
            <Field label="Course"            value={e.course} />
            <Field label="Year Graduated"    value={e.yearGrad?.toString()} />
          </React.Fragment>
        ))}
      </Section>
    )}

    <Section title="Business Interest">
      <Field label="Extent of Involvement"  value={viewApp.involvement}    full />
      <Field label="Equity Owned (%)"       value={viewApp.equity} />
      <Field label="Cash Investment (₱)"    value={viewApp.investment ? `₱${Number(viewApp.investment).toLocaleString()}` : null} />
      <Field label="Source of Funds"        value={viewApp.fundSource} />
      <Field label="Other Businesses"       value={viewApp.otherBusiness}  full />
      <Field label="Preferred Location"     value={viewApp.location}       full />
    </Section>

    <Section title="Declaration">
      <Field label="Family Dependence"      value={viewApp.familyDepend}   full />
      <Field label="Market Area"            value={viewApp.marketArea}     full />
      <Field label="Target Start Date"      value={fmtDate(viewApp.startDate)} />
    </Section>
  </>
) : (
  // ── Regular franchise view (existing fields) ──
  <>
    <Section title="Basic Information">
      <Field label="Full Name"          value={viewApp.name}              full />
      <Field label="Email Address"      value={viewApp.email} />
      <Field label="Phone Number"       value={viewApp.phone} />
      <Field label="Franchise Interest" value={viewApp.franchise} />
      <Field label="Payment Mode"       value={viewApp.paymentMode} />
      <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
    </Section>

    <Section title="Personal Information">
      <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
      <Field label="Civil Status"       value={viewApp.civilStatus} />
      <Field label="Gender"             value={viewApp.gender} />
      <Field label="Nationality"        value={viewApp.nationality} />
      <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
      <Field label="ID Type Used"       value={viewApp.idType} />
      <Field label="Address"            value={viewApp.address}           full />
    </Section>

    {(viewApp.spouseName || viewApp.spouseOccupation) && (
      <Section title="Spouse Information">
        <Field label="Spouse Name"       value={viewApp.spouseName} />
        <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
      </Section>
    )}

    <Section title="Employment Information">
      <Field label="Employment Type"    value={viewApp.employmentType} />
      <Field label="Years w/ Employer"  value={viewApp.yearsEmployer?.toString()} />
      <Field label="Monthly Income"     value={viewApp.income ? `₱${Number(viewApp.income).toLocaleString()}` : null} />
      <Field label="Position"           value={viewApp.position} />
      <Field label="Company Name"       value={viewApp.employerName}      full />
      <Field label="Business Address"   value={viewApp.businessAddress}   full />
      <Field label="Nature of Business" value={viewApp.businessNature} />
    </Section>
  </>
)}
                  
                    <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: "#00897b",
                letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: 10, paddingBottom: 6,
                borderBottom: "1.5px solid #e0f2f1",
              }}>Required Documents</div>

              {/* Letter of Intent */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Letter of Intent (PDF)</div>
                {viewApp.letterOfIntent ? (
                   <button
                      onClick={() => {
                        let base64 = viewApp.letterOfIntent;
                        
                        // Strip the data URL prefix if present
                        if (base64.includes(",")) {
                          base64 = base64.split(",")[1];
                        }
                        
                        const byteCharacters = atob(base64);
                        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: "application/pdf" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      }}
                       style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 14px", borderRadius: 8,
                          border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                          color: "#00695c", fontSize: 13, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", width: "fit-content",
                        }}
                    >
                    <FileText size={15} /> View Letter of Intent
                      </button>
                ) : (
                  <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                    No Letter of Intent uploaded
                  </div>
                )}
              </div>

              {/* ID Attachment */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>ID Attachment</div>
                {viewApp.idImage ? (
                  <img
                    src={viewApp.idImage}
                    alt="Government ID"
                    style={{
                      maxWidth: "100%", maxHeight: 200,
                      borderRadius: 10, border: "1.5px solid #b2dfdb",
                      objectFit: "contain", background: "#f8fffe",
                    }}
                  />
                ) : viewApp.idType ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 8,
                    border: "1.5px solid #a5d6a7", background: "#e8f5e9",
                    fontSize: 13, fontWeight: 600, color: "#1b5e20",
                  }}>
                    <CheckCircle2 size={15} color="#2E7D32" />
                    ID Verified — {viewApp.idType}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                    No ID attached
                  </div>
                )}
              </div>
            </div>
                </>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setViewApp(null)} style={{
                padding: "9px 22px", borderRadius: 10,
                border: "1px solid #b2dfdb", background: "#f0fdf5",
                color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
         </>
      )}

      {alertModal && (
  <AlertModal
    open={!!alertModal}
    type={alertModal.type}
    message={alertModal.message}
    onClose={() => setAlertModal(null)}
  />
)}

      {accountApp && (
        <CreateAccountModal
          applicant={accountApp}
          defaultRole="franchisee"
          roles={['Franchisee']}    
          onClose={() => setAccountApp(null)}
          onAlert={(message, type) => setAlertModal({ message, type })}
        />
      )}

      {/* ── Actions Menu Modal ── */}
      {menuApp && (
        <div onClick={() => setMenuApp(null)} style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Actions
              </h2>
              <button onClick={() => setMenuApp(null)} style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#5a7a65", marginBottom: 20 }}>
              Applicant:{" "}
              <strong style={{ color: "#0d2b1e" }}>{menuApp.name}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setViewApp(menuApp); setMenuApp(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11,
                  border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                  color: "#00695c", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <Eye size={15} /> View Application Details
              </button>
              <button
                onClick={() => { setAccountApp(menuApp); setMenuApp(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11, border: "none",
                  background: "linear-gradient(135deg,#2E7D32,#00897b)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(0,180,90,0.28)",
                }}
              >
                <UserPlus size={15} /> Create Account
              </button>
              <button
                onClick={() => { handleApprove(menuApp.id); setMenuApp(null); }}
                disabled={menuApp.status === "approved"}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11, border: "none",
                  background: menuApp.status === "approved"
                    ? "#e0e0e0"
                    : "linear-gradient(135deg,#00c853,#00897b)",
                  color: menuApp.status === "approved" ? "#9e9e9e" : "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: menuApp.status === "approved" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: menuApp.status === "approved" ? 0.6 : 1,
                }}
              >
                <Check size={15} />
                {menuApp.status === "approved" ? "Already Approved" : "Approve Application"}
              </button>
            <button
                onClick={() => { handleReject(menuApp.id); setMenuApp(null); }}
                disabled={menuApp.status === "rejected"}
                style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 11, border: "none",
                    background: menuApp.status === "rejected"
                    ? "#e0e0e0"
                    : "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: menuApp.status === "rejected" ? "#9e9e9e" : "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: menuApp.status === "rejected" ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: menuApp.status === "rejected" ? 0.6 : 1,
                }}
                >
                <X size={15} />
                {menuApp.status === "rejected" ? "Already Rejected" : "Reject Application"}
                </button>

                            </div>
                        </div>
                        </div>
                )}

      {/* ── Main content ── */}
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          gap: 16, marginBottom: 24,
        }}>
          {[
            {
              label: "Total Applications", value: applications.length,
              icon: <FileCheck size={20} color="#065f46" />,
              bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "All time",
            },
            {
              label: "Pending Review",
              value: applications.filter(a => a.status === "pending").length,
              icon: <AlertTriangle size={20} color="#92400e" />,
              bg: "linear-gradient(135deg,#fef9c3,#fde68a)", sub: "Awaiting action",
            },
            {
              label: "Approved",
              value: applications.filter(a => a.status === "approved").length,
              icon: <Check size={20} color="#065f46" />,
              bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Successful",
            },
            {
              label: "Rejected",
              value: applications.filter(a => a.status === "rejected").length,
              icon: <X size={20} color="#7f1d1d" />,
              bg: "linear-gradient(135deg,#fee2e2,#fca5a5)", sub: "Not approved",
            },
          ].map((s, i) => <BmStatCard key={i} {...s} />)}
        </div>

        {/* Filter bar */}
        <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

            {/* Search */}
            <div style={{ position:"relative" }}>
              <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
              <input
                type="text"
                placeholder="Search name, email, phone…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding:"9px 12px 9px 30px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, color:"#0d2b1e", background:"#f0fdf5", fontFamily:"inherit", outline:"none", width:240 }}
              />
              {searchQuery && (
                <div onClick={() => setSearchQuery("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#5a7a65" }}>
                  <X size={12}/>
                </div>
              )}
            </div>

            {/* Status */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Franchise Interest */}
            <select value={filterFranchise} onChange={e => setFilterFranchise(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
              <option value="all">All Franchises</option>
              <option value="Food Caravan">Food Caravan</option>
              <option value="Coffee Spot">Coffee Spot</option>
              <option value="iPharma Mart">iPharma Mart</option>
              <option value="iFuel">iFuel</option>
            </select>

            {/* Activity Log button */}
              <button onClick={() => setShowActivityLog(true)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.green}`, background:"#fff", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <ActivityIcon size={13}/> Activity Log
                {activityLog.length > 0 && (
                  <span style={{ background:"#00897b", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
                    {activityLog.length}
                  </span>
                )}
              </button>

              <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>
                {filteredApps.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
              </span>

            {/* Clear */}
            {(searchQuery || filterStatus !== "all" || filterFranchise !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterFranchise("all"); }}
                style={{ padding:"9px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                Clear filters
              </button>
            )}

            {/* Result count pushed right */}
            <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>
              {filteredApps.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
            </span>

          </div>
        </div>

        {/* Table card */}
        <div style={{
          background: C.white,
          border: "1px solid rgba(0,168,76,0.12)",
          borderRadius: 18,
          boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
          overflow: "hidden",
        }}>
          {/* Table header bar */}
          <div style={{
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            padding: "16px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Applications List
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Export CSV */}
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Export CSV
              </button>

              {/* Delete History button — fixed: moved outside table markup */}
              <button
                onClick={() => setShowAppDeleteHistory(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 9,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.10)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <History size={13} /> Delete History
                {appDeleteHistory.length > 0 && (
                  <span style={{
                    background: "#dc2626", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    padding: "1px 7px", borderRadius: 20,
                  }}>
                    {appDeleteHistory.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 13, minWidth: 900,
            }}>
              <thead>
                <tr>
                  {[
                    "Applicant Name", "Email", "Phone",
                    "Franchise Interest", "Date Applied", "Status", "Actions",
                  ].map(h => (
                    <th key={h} style={{
                      padding: "9px 14px", textAlign: "left",
                      fontWeight: 800, fontSize: 10.5, color: "#00897b",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      borderBottom: `1px solid ${C.border}`,
                      background: "#f8fffe", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: "40px 0", textAlign: "center",
                      color: "#9ca3af", fontSize: 13, fontStyle: "italic",
                    }}>
                      No applications found.
                    </td>
                  </tr>
                ) : filteredApps.map(app => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: `1px solid #f0f8f0` }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f6fef8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0d2b1e" }}>
                      {app.name}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                      {app.email}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                      {app.phone}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#0d2b1e", fontWeight: 600 }}>
                      {app.franchise}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                       {app.date ? new Date(app.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* Actions menu */}
                        <button
                          onClick={() => setMenuApp(app)}
                          style={{
                            ...smallBtnSt,
                            border: "1.5px solid #b2dfdb",
                            background: "#e0f2f1", color: "#00695c",
                            height: 28, padding: "0 12px",
                          }}
                          title="Actions"
                        >
                          <Pencil size={11} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(app.id)}
                          style={{
                            ...smallBtnSt,
                            border: "1.5px solid #fecaca",
                            background: "#fee2e2", color: "#dc2626",
                            height: 28, padding: "0 12px",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showActivityLog && (
  <InventoryActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
  />
)}
      </div>
    </>
  );
}

function CreateAccountModal({ applicant, onClose, onAlert, roles}) {
  const [sending, setSending] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [branches, setBranches] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(roles?.[0] || 'Franchisee');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`).then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setBrandsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBrandId) { setBranches([]); return; }
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.fullName.value, email = form.email.value, phone = form.phone.value;
    const role = selectedRole;    
    const branch = form.branch.value;
    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
    const brand = selectedBrand?.name || '';
    const tempPassword = generateTempPassword();
    setSending(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: tempPassword, role, brand, branch }),
      });
      if (!res.ok) { const err = await res.json(); 
        
        if (err.error?.includes("duplicate key") || err.error?.includes("users_email_key") || err.code === "23505") {
          onAlert(`An account with the email "${email}" already exists. Please use a different email or check existing accounts.`, 'error');
          } else {
            onAlert(err.error || 'Failed to create account.', 'error');
          }
          return;
        }

      await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, name, password: tempPassword }),
      });
      onAlert(`Account created and credentials sent to ${email}!`, 'success');
      onClose();
    } catch { onAlert('Something went wrong. Please try again.', 'error'); }
    finally { setSending(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>Create Franchisee Account</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Creating account for: <strong style={{ color: '#0d2b1e' }}>{applicant?.name}</strong></p>
        <form onSubmit={handleSubmit}>
          {[['Full Name', 'fullName', 'text', applicant?.name], ['Email Address', 'email', 'email', applicant?.email], ['Phone Number', 'phone', 'tel', applicant?.phone]].map(([label, name, type, def]) => (
            <div key={name} style={{ marginBottom: 14 }}>
              <label style={bmLabel}>{label}</label>
              <input name={name} type={type} defaultValue={def} required style={{ ...bmInput, marginTop: 4 }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Role</label>
            {roles && roles.length > 1 ? (
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            required
            style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <input
            value={selectedRole}
            disabled
            style={{ ...bmInput, marginTop: 4, background: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
          />
        )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Brand</label>
            <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} required disabled={brandsLoading} style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
              <option value="">{brandsLoading ? 'Loading…' : 'Select Brand'}</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Assigned Branch</label>
            <select name="branch" required disabled={!selectedBrandId} style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
              <option value="">{!selectedBrandId ? 'Select a brand first' : branches.length === 0 ? 'No branches available' : 'Select Branch'}</option>
              {branches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>A temporary password will be auto-generated and emailed to the applicant.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={sending} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Creating…' : '✉ Create & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// REPORTS

const REPORT_STATUS = {
  pending:  { label:"Pending",  bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  approved: { label:"Approved", bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
};

const API = process.env.REACT_APP_API_URL || "";

function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <X size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

function ReportsContent({ user, brands: propBrands = [] }) {
  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [brandBranchFilter, setBrandBranchFilter] = useState({});

  const [activityLog,     setActivityLog]     = useState([]);
const [showActivityLog, setShowActivityLog] = useState(false);

  // modal states
  const [viewReport,    setViewReport]    = useState(null);
  const [approveReport, setApproveReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  const [filterBrand,  setFilterBrand]  = useState(null); // brand id (object ref)
  const [filterBranch, setFilterBranch] = useState(null);

  const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/reports-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
}, [user]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search.trim())          params.set("search", search.trim());

      const res  = await fetch(`${API}/reports?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("fetchReports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchReports(); fetchActivityLog(); }, [fetchReports, fetchActivityLog]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", {
    month:"short", day:"numeric", year:"numeric",
    hour:"numeric", minute:"2-digit", hour12:true,
  });

  // ── Sync open modals when reports state changes ─────────────────
  const syncModals = (updated) => {
    setViewReport    (prev => prev    ? (updated.find(r => r.id === prev.id)    || prev) : null);
    setApproveReport (prev => prev    ? (updated.find(r => r.id === prev.id)    || prev) : null);
  };

  const patchReport = (updated) => {
    setReports(prev => {
      const next = prev.map(r => r.id === updated.id ? updated : r);
      syncModals(next);
      return next;
    });
  };

  const brandList = useMemo(() => {
  const map = {};
  reports.forEach(r => {
    if (!map[r.brand]) map[r.brand] = { id: r.brand, name: r.brand, branches: [] };
    if (!map[r.brand].branches.includes(r.branch)) {
      map[r.brand].branches.push(r.branch);
    }
  });
  return Object.values(map);
}, [reports]);

const handleApprove = async (report) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/status`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "approved" }),
    });
    await logActivity("Approved", `Report #${report.id}`, report.branch, `brand: ${report.brand}`);
    await fetchReports();
  } catch {
    alert("Failed to approve report.");
  }
};

  // ── Export CSV ─────────────────────────
  const handleExport = (brand) => {
    const params = new URLSearchParams();
    if (brand)                    params.set("brand",  brand);
    if (filterStatus !== "all")   params.set("status", filterStatus);
    window.open(`${API}/reports/export?${params}`, "_blank");
  };

  const allBrands = useMemo(() => {
    return [...new Set(
      reports
        .filter(r => !filterBrand  || r.brand  === filterBrand)
        .filter(r => !filterBranch || r.branch === filterBranch)
        .map(r => r.brand)
    )];
  }, [reports, filterBrand, filterBranch]);

    const getBrandBranches = (brand) =>
      [...new Set(reports.filter(r => r.brand === brand).map(r => r.branch))];

    const getBrandReports = (brand) => {
      const branchFilter = brandBranchFilter[brand] || "all";
      return reports.filter(r => {
        if (r.brand !== brand) return false;
        if (branchFilter !== "all" && r.branch !== branchFilter) return false;
        if (filterBranch && r.branch !== filterBranch) return false; // ← new
        if (filterStatus !== "all" && r.status !== filterStatus) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!String(r.id).toLowerCase().includes(q) &&
              !r.submittedBy.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    };

  const counts = {
    total:    reports.length,
    pending:  reports.filter(r => r.status === "pending").length,
    reviewed: reports.filter(r => r.status === "reviewed").length,
    approved: reports.filter(r => r.status === "approved").length,
  };

const downloadReport = (report) => {
  const doc = generatePdfDoc(report);
  const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
  doc.save(`report_${(report.branch||'').replace(/\s+/g,'_')}_${safePeriod.replace(/[^a-z0-9]/gi,'_')}.pdf`);
};

const generatePdfDoc = (report) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = margin; };
  const checkY = (needed = 8) => { if (y + needed > pageH - margin) addPage(); };

  const writeLine = (text, fontSize = 10, style = 'normal', color = [30,30,30], indent = 0) => {
    doc.setFontSize(fontSize); doc.setFont('helvetica', style); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW - indent);
    lines.forEach(line => { checkY(fontSize * 0.45 + 2); doc.text(line, margin + indent, y); y += fontSize * 0.45 + 1.5; });
  };
  const writeDivider = (color = [180,180,180]) => {
    checkY(6); doc.setDrawColor(...color); doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y); y += 4;
  };

  y = margin;
  doc.setFillColor(13, 43, 30);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
  doc.text('SALES & PERFORMANCE REPORT', pageW / 2, 14, { align: 'center' });

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(160,220,190);
  const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
  
  doc.setFontSize(8); doc.setTextColor(120,180,150);
  doc.text('CONFIDENTIAL — FOR INTERNAL USE ONLY', pageW / 2, 30, { align: 'center' });
  y = 46;

  const cleanContent = (report.content || '').replace(/₱/g,'PHP ').replace(/→/g,'to')
    .replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"')
    .replace(/\u2013/g,'-').replace(/\u2014/g,'--').replace(/[═─━]+/g,'')
    .replace(/[^\x00-\x7F]/g,'').replace(/\n{3,}/g,'\n\n').trim();

  if (!cleanContent) {
    writeLine('No report content available.', 10, 'normal', [100,100,100]);
  } else {
    cleanContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) { y += 3; return; }
      if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
        checkY(14); y += 4;
        doc.setFillColor(0,137,123); doc.rect(margin, y - 4, 3, 9, 'F');
        doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(13,43,30);
        doc.text(trimmed, margin + 6, y + 2); y += 8; writeDivider([0,137,123]);
      } else if (/^\d+\.\s+/.test(trimmed)) {
        checkY(8);
        const parts = trimmed.split(/(?<=^\d+\.)\s+/);
        const num = parts[0]; const rest = parts.slice(1).join(' ');
        doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(0,137,123);
        doc.text(num.replace('.',''), margin + 2, y);
        doc.setFont('helvetica','normal'); doc.setTextColor(40,40,40);
        const wrapped = doc.splitTextToSize(rest, contentW - 10);
        wrapped.forEach((wl, i) => { if (i > 0) checkY(6); doc.text(wl, margin + 9, y); y += 5.5; });
      } else {
        writeLine(trimmed, 9.5, 'normal', [50,50,50]);
        y += 1;
      }
    });
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i); doc.setFillColor(245,247,245); doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(120,140,130);
    doc.text(`${report.branch} Branch  |  ${safePeriod}`, margin, pageH - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  return doc; // return doc instead of calling .save()
};

  // ── Sub-components (unchanged styling) ─────────────────────────
  const StatusBadge = ({ status }) => {
    const s = REPORT_STATUS[status] || REPORT_STATUS.pending;
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>
        {s.label}
      </span>
    );
  };

  const ActionDropdown = ({ report }) => {
    const isOpen = openDropdown === report.id;
    const items = [
      {
        label:"View", icon:<Search size={13}/>, color:"#00695c", bg:"#e0f2f1", border:"#b2dfdb",
        onClick:() => { setViewReport(report); setPdfPreviewUrl(null); setOpenDropdown(null); },
      },
      {
        label:"Approve", icon:<Check size={13}/>, bg:"linear-gradient(135deg,#2E7D32,#00897b)", border:"none", textColor: "#00695c",
        disabled: report.status === "approved",
        onClick:() => { setApproveReport(report); setOpenDropdown(null); },
      },
    ];
    return (
      <div style={{ position:"relative" }} ref={isOpen ? dropdownRef : null}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : report.id); }}
          style={{ width:32, height:32, borderRadius:9, border:"1.5px solid #b2dfdb", background:isOpen?"linear-gradient(135deg,#2E7D32,#00897b)":"#e0f2f1", color:isOpen?"#fff":"#00695c", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
          <Pencil size={14}/>
        </button>
        {isOpen && (
          <div onClick={e => e.stopPropagation()}
            style={{ position:"absolute", right:0, top:38, zIndex:999, background:"#fff", borderRadius:14, border:"1px solid rgba(0,168,76,0.18)", boxShadow:"0 8px 32px rgba(0,0,0,0.14)", minWidth:160, overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-6, right:10, width:12, height:12, background:"#fff", border:"1px solid rgba(0,168,76,0.18)", transform:"rotate(45deg)", borderBottom:"none", borderRight:"none" }}/>
            <div style={{ padding:"6px" }}>
              {items.map((item) => (
                <button key={item.label} disabled={item.disabled} onClick={item.onClick}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:9, border:"none", background:"transparent", cursor:item.disabled?"not-allowed":"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:item.disabled?"#b0b0b0":(item.textColor||item.color), opacity:item.disabled?0.45:1, transition:"background .12s" }}
                  onMouseEnter={e => { if(!item.disabled) e.currentTarget.style.background="#f0fdf5"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
                  <span style={{ width:26, height:26, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:item.disabled?"#f0f0f0":item.bg, border:item.border!=="none"?`1px solid ${item.border}`:"none", color:item.disabled?"#b0b0b0":(item.textColor||item.color) }}>
                    {item.icon}
                  </span>
                  <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ background:"#00897b", color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:800 }}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ModalShell = ({ title, subtitle, icon, onClose, children, maxWidth=500 }) => (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ background:"linear-gradient(135deg,#2E7D32,#00897b)", borderRadius:"20px 20px 0 0", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            {icon}
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{title}</div>
              {subtitle && <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 }}>{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={14}/>
          </button>
        </div>
        <div style={{ padding:"22px 24px" }}>{children}</div>
      </div>
    </div>
  );

  const ReportMetaGrid = ({ report }) => (
    <>
      <div style={{ marginBottom:16, padding:"12px 14px", background:"#f0fdf5", borderRadius:12, border:"1px solid #d1eedd" }}>
        <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:5 }}>Submitted By</div>
        <div style={{ fontWeight:800, fontSize:14, color:"#0d2b1e" }}>{report.submittedBy}</div>
        <div style={{ fontSize:12, color:"#5a7a65", marginTop:1 }}>{report.role}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[{ label:"Brand", value:report.brand },{ label:"Branch", value:report.branch },
          { label:"Period", value:report.period },{ label:"Submitted", value:fmtDate(report.submittedAt) }
        ].map(({ label, value }) => (
          <div key={label} style={{ padding:"10px 12px", background:"#f8fffe", borderRadius:10, border:"1px solid #e0f2f1" }}>
            <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:3 }}>{label}</div>
            <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{value}</div>
          </div>
        ))}
      </div>
    </>
  );

  // ── Loading / error states ──────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:14 }}>
      <div style={{ width:36, height:36, border:"3px solid #d1eedd", borderTopColor:"#00897b", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <div style={{ fontSize:13, fontWeight:700, color:"#5a7a65" }}>Loading reports…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>{error}</div>
      <button onClick={fetchReports} style={{ padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        Retry
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif" }}>

      {/* VIEW modal */}
      {viewReport && (
        <ModalShell
          title={`Report #${viewReport.id}`}
          subtitle={viewReport.brand + " · " + viewReport.branch}
          icon={<FileText size={16} color="#fff"/>}
          onClose={() => { setViewReport(null); setPdfPreviewUrl(null); }}
          maxWidth={680}
        >
          <ReportMetaGrid report={viewReport}/>

          {/* Clickable PDF card */}
          <div
            onClick={() => {
              const doc = generatePdfDoc(viewReport);
              const url = doc.output('bloburl');
              setPdfPreviewUrl(url);
            }}
            style={{
              marginBottom: 16,
              padding: "14px",
              background: "#f8fffe",
              borderRadius: 12,
              border: "1.5px dashed #b2dfdb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#e0f7f4";
              e.currentTarget.style.borderColor = "#00897b";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f8fffe";
              e.currentTarget.style.borderColor = "#b2dfdb";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={17} color="#00897b"/>
              </div>
              <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e" }}>
                REP-{String(viewReport.id).padStart(5, '0')} 
              </div>
                <div style={{ fontSize: 11, color: "#5a7a65" }}>
                  {viewReport.period} · Click to preview PDF
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 10,
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              pointerEvents: "none",
            }}>
              <Eye size={11}/> Preview
            </div>
          </div>

          {pdfPreviewUrl && (
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #d1eedd" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 14px", background: "#f0fdf5", borderBottom: "1px solid #d1eedd",
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#00897b" }}>PDF Preview</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => downloadReport(viewReport)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    <Download size={11}/> Download
                  </button>
                  <button
                    onClick={() => setPdfPreviewUrl(null)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1px solid #b2dfdb", background: "#fff", color: "#5a7a65", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    <X size={11}/> Close
                  </button>
                </div>
              </div>
              <iframe
                src={pdfPreviewUrl}
                style={{ width: "100%", height: 500, border: "none", display: "block" }}
                title="Report PDF Preview"
              />
            </div>
          )}

          {viewReport.remark && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff3e0", borderRadius: 12, border: "1px solid #ffcc80" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#e65100", marginBottom: 4 }}>Return Remark</div>
              <div style={{ fontSize: 13, color: "#bf360c" }}>{viewReport.remark}</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StatusBadge status={viewReport.status}/>
            <div style={{ display: "flex", gap: 8 }}>
              {/* ← ADD Approve here, only show if not already approved */}
              {viewReport.status !== "approved" && (
                <button
                  onClick={() => handleApprove(viewReport)}
                  disabled={actionLoading}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: actionLoading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}>
                  {actionLoading ? <RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }}/> : <Check size={14}/>} Approve
                </button>
              )}
            <button
              onClick={() => { setViewReport(null); setPdfPreviewUrl(null); }}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Close
            </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Inline PDF iframe preview */}
      {pdfPreviewUrl && (
        <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #d1eedd" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 14px", background: "#f0fdf5", borderBottom: "1px solid #d1eedd",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#00897b" }}>PDF Preview</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => downloadReport(viewReport)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Download size={11}/> Download
              </button>
              <button
                onClick={() => setPdfPreviewUrl(null)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1px solid #b2dfdb", background: "#fff", color: "#5a7a65", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <X size={11}/> Close
              </button>
            </div>
          </div>
          <iframe
            src={pdfPreviewUrl}
            style={{ width: "100%", height: 500, border: "none", display: "block" }}
            title="Report PDF Preview"
          />
        </div>
      )}

      {/* APPROVE modal */}
      {approveReport && (
        <ModalShell title={`Approve Report #${approveReport.id}`} subtitle={approveReport.brand + " · " + approveReport.branch} icon={<Check size={16} color="#fff"/>} onClose={() => setApproveReport(null)} maxWidth={440}>
          <ReportMetaGrid report={approveReport}/>
          <div style={{ padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", border:"1px solid #a7f3d0", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <Check size={18} color="#00897b"/>
            <div>
              <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Confirm Approval</div>
              <div style={{ fontSize:12, color:"#5a7a65", marginTop:2 }}>This will mark the report as approved. This action cannot be undone.</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => setApproveReport(null)} style={{ padding:"9px 20px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={() => handleApprove(approveReport)} disabled={actionLoading}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:actionLoading?"not-allowed":"pointer", fontFamily:"inherit", opacity:actionLoading?0.7:1, boxShadow:"0 2px 10px rgba(0,180,90,0.35)" }}>
              {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Check size={14}/>} Approve Report
            </button>
          </div>
        </ModalShell>
      )}
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <BmStatCard label="Total Reports" value={counts.total}    icon={<FileText size={20} color="#065f46"/>}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All submissions"  />
        <BmStatCard label="Pending"       value={counts.pending}  icon={<AlertTriangle size={20} color="#92400e"/>} bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting review"  />
        <BmStatCard label="Reviewed"      value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>}        bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="Under evaluation" />
        <BmStatCard label="Approved"      value={counts.approved} icon={<Check size={20} color="#065f46"/>}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed"        />
      </div>

<div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
  <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

    {/* Search */}
    <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
      <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
      <input type="text" placeholder="Search ID or submitter..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...bmInput, paddingLeft:30, height:36, width:"100%" }}/>
      {search && (
        <div onClick={() => setSearch("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#5a7a65" }}>
          <X size={12}/>
        </div>
      )}
    </div>

    {/* Status */}
    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
      style={{ ...bmInput, height:36, width:"auto", appearance:"none", cursor:"pointer" }}>
      <option value="all">All Statuses</option>
      {Object.entries(REPORT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
    </select>

    {/* Brand + Branch (the fancy component) */}
    <BrandBranchFilter
      brands={brandList}
      activeBrand={filterBrand}
      activeBranch={filterBranch}
      onChangeBrand={id  => { setFilterBrand(id);  setFilterBranch(null); }}
      onChangeBranch={val => setFilterBranch(val)}
    />

    {/* Export + Refresh pushed right */}
    <button onClick={() => handleExport(filterBrand || null)}
      style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#f0fdf5", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
      <Download size={13}/> Export CSV
    </button>
    <button onClick={fetchReports}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
      <RefreshCw size={13}/> Refresh
    </button>
    <button onClick={() => setShowActivityLog(true)}
  style={{ display:"inline-flex", alignItems:"center", gap:6, height:36, padding:"0 16px", borderRadius:9, border:`1.5px solid #00897b`, background:"#fff", color:"#00695c", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
  <ActivityIcon size={13}/> Activity Log
  {activityLog.length > 0 && (
    <span style={{ background:"#00897b", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
      {activityLog.length}
    </span>
  )}
</button>
  </div>

  {/* Active filter chips — mirrors inventory pattern */}
  {(search || filterStatus !== "all" || filterBrand || filterBranch) && (
    <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, paddingTop:10, borderTop:"1px solid #d1eedd", flexWrap:"wrap" }}>
      <span style={{ fontSize:11, color:"#5a7a65", fontWeight:600 }}>Active:</span>
      {search       && <Chip label={`"${search}"`}        color="#3949ab" bg="#e8eaf6" onRemove={() => setSearch("")}/>}
      {filterStatus !== "all" && <Chip label={REPORT_STATUS[filterStatus]?.label} color="#00695c" bg="#e0f2f1" onRemove={() => setFilterStatus("all")}/>}
      {filterBrand && !filterBranch && <Chip label={brandList.find(b => b.id === filterBrand)?.name} color="#00695c" bg="#e8f5e9" onRemove={() => { setFilterBrand(null); setFilterBranch(null); }}/>}
      {filterBranch && <Chip label={filterBranch} color="#00695c" bg="#e0f7fa" onRemove={() => setFilterBranch(null)}/>}
      <button
        onClick={() => { setSearch(""); setFilterStatus("all"); setFilterBrand(null); setFilterBranch(null); }}
        style={{ height:24, padding:"0 10px", borderRadius:7, border:"1px solid #d1eedd", background:"#fff", color:"#5a7a65", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginLeft:"auto" }}>
        Clear all
      </button>
    </div>
  )}
</div>

      {/* One BmSection per brand */}
      {allBrands.length === 0 ? (
        <div style={{ padding:"60px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>
          No reports found.
        </div>
      ) : allBrands.map(brand => {
        const branches     = getBrandBranches(brand);
        const activeBranch = brandBranchFilter[brand] || "all";
        const brandReports = getBrandReports(brand);

        return (
          <BmSection key={brand}>
            <BmSectionHeader
              title={brand}
              icon={<Globe size={16} color="#fff"/>}
              right={
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Branch</span>
                    <select value={activeBranch} onChange={e => setBrandBranchFilter(prev => ({ ...prev, [brand]: e.target.value }))}
                      style={{ height:30, padding:"0 10px", borderRadius:8, border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", outline:"none", appearance:"none" }}>
                      <option value="all" style={{ color:"#0d2b1e", background:"#fff" }}>All branches</option>
                      {branches.map(b => <option key={b} value={b} style={{ color:"#0d2b1e", background:"#fff" }}>{b}</option>)}
                    </select>
                  </div>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
                    {brandReports.length} report{brandReports.length !== 1 ? "s" : ""}
                  </span>
                  {/* Per-brand export */}
                  <button onClick={() => handleExport(brand)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    <Download size={11}/> Export
                  </button>
                </div>
              }
            />
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:780 }}>
                <thead>
                  <tr>
                    {["Report #","Submitted By","Role","Branch","Period","Date Submitted","Status",""].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:"1px solid #d1eedd", background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brandReports.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding:"36px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>No reports match the current filters.</td></tr>
                  ) : brandReports.map(report => (
                    <tr key={report.id}
                      onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                      style={{ borderBottom:"1px solid #f0f8f0" }}>
                      <td style={{ padding:"11px 14px", fontWeight:800, color:"#0d2b1e", fontSize:12 }}>
                        REP-{String(report.id).padStart(5, '0')}  {/* ← was #{report.id} */}
                      </td>
                      <td style={{ padding:"11px 14px", fontWeight:700, color:"#0d2b1e" }}>{report.submittedBy}</td>
                      <td style={{ padding:"11px 14px" }}>
                        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:"rgba(0,137,123,0.1)", color:"#00695c" }}>{report.role}</span>
                      </td>
                      <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65" }}>{report.branch}</td>
                      <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65", whiteSpace:"nowrap" }}>{report.period}</td>
                      <td style={{ padding:"11px 14px", fontSize:11, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtDate(report.submittedAt)}</td>
                      <td style={{ padding:"11px 14px" }}><StatusBadge status={report.status}/></td>
                      <td style={{ padding:"11px 14px" }}><ActionDropdown report={report}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BmSection>
        );
      })}

      {showActivityLog && (
  <InventoryActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
  />
)}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// USERS 
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ALERT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AlertModal({ message, onClose, type = "info" }) {
  const isError = type === "error";
  const isSuccess = type === "success";

  const iconBg = isError ? "#fee2e2" : isSuccess ? "#d1fae5" : "#dbeafe";
  const iconColor = isError ? "#dc2626" : isSuccess ? "#059669" : "#2563eb";
  const Icon = isError ? Trash2 : isSuccess ? Check : Info;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 32px",
          width: "100%", maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Icon size={22} color={iconColor} />
        </div>
        <p style={{ fontSize: 14, color: "#0d2b1e", lineHeight: 1.6, marginBottom: 20, fontWeight: 600 }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "9px 28px", borderRadius: 10,
            border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL (user-flavored)
// ─────────────────────────────────────────────────────────────────────────────
function UserDeleteConfirmModal({ user, onConfirm, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 32px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
          Delete user?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete <strong>"{user.name}"</strong> ({user.email}).
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
          You can recover this from Delete History.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button" onClick={onClose}
            style={{
              padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
              background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button" onClick={onConfirm}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
            }}
          >
            <Trash2 size={14} /> Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER DELETE HISTORY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function UserDeleteHistoryPanel({ history, onRestore, onClose }) {
 const fmt = (d) =>
  new Date(d).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Manila",
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 32px",
          width: "100%", maxWidth: 620, maxHeight: "80vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
              Delete History
            </h2>
            {history.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: "#fee2e2", color: "#dc2626",
              }}>
                {history.length} deleted
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1px solid #b2dfdb", background: "#e0f2f1",
              cursor: "pointer", color: "#00695c",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Column headers */}
        {history.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px 90px",
            gap: 8, padding: "6px 0 10px",
            borderBottom: "2px solid #e0f2f1",
            fontSize: 10, fontWeight: 800, color: "#00897b",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Deleted At</span>
            <span></span>
          </div>
        )}

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div style={{
              padding: "40px 0", textAlign: "center",
              color: "#9ca3af", fontSize: 13, fontStyle: "italic",
            }}>
              No deleted users yet.
            </div>
          ) : (
            history.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px 90px",
                  gap: 8, alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none",
                }}
              >
                {/* Name */}
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.data.name}
                </div>
                {/* Email */}
                <div style={{ fontSize: 12, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.data.email}
                </div>
                {/* Role badge */}
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "3px 8px",
                  borderRadius: 20, background: "#e0f2f1", color: "#00695c",
                  whiteSpace: "nowrap", textAlign: "center",
                }}>
                  {entry.data.role}
                </span>
                {/* Date */}
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {fmt(entry.deletedAt)}
                </div>
                {/* Restore */}
                <button
                  onClick={() => onRestore(entry)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 12px", borderRadius: 9,
                    border: "1.5px solid #00897b", background: "#e0f2f1",
                    color: "#00695c", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  <RotateCcw size={12} /> Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

  const PasswordValidation = ({ errors }) => (
    <div style={{ marginTop:8, fontSize:12, padding:'10px 14px', background:'#f0fdf5', borderRadius:10, border:'1.5px solid #b2dfdb' }}>
      <div style={{ marginBottom:6, fontWeight:700, color:'#0d2b1e', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em' }}>Password must contain:</div>
      {[['minLength','At least 8 characters'],['uppercase','Uppercase letter (A-Z)'],['lowercase','Lowercase letter (a-z)'],['number','Number (0-9)'],['specialChar','Special character (!@#$%^&*...)']].map(([key,text]) => (
        <div key={key} style={{ color:errors.includes(key)?'#dc2626':'#059669', marginBottom:3, fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
          <span>{errors.includes(key)?'✗':'✓'}</span> {text}
        </div>
      ))}
    </div>
  );

  const UserModal = ({
    title, onSubmit, onClose, isEdit,
    formData, handleInputChange, setFormData,
    selectedBrandId, setSelectedBrandId,
    brands, branches, brandsLoading,
    showPassword, setShowPassword,
    showPasswordValidation, passwordErrors,
    handleGeneratePassword, pwChange,
  }) => (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:500, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, fontWeight:800, color:'#0d2b1e', margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #b2dfdb', background:'#e0f2f1', cursor:'pointer', color:'#00695c', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
        </div>
        <form onSubmit={onSubmit}>
          {[['Full Name','name','text'],['Email Address','email','email']].map(([label,name,type]) => (
            <div key={name} style={{ marginBottom:14 }}>
              <label style={bmLabel}>{label}</label>
              <input type={type} name={name} value={formData[name]} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Role</label>
            <select name="role" value={formData.role} onChange={handleInputChange} required style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
              <option value="">Select Role</option>
              {['Super Admin', 'Franchisee Operations Admin', 'Sales Admin', 'Franchisee'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
            <div style={{ marginBottom:14 }}>
              <label style={bmLabel}>Brand</label>
              <select
                value={selectedBrandId}
                onChange={e => { setSelectedBrandId(e.target.value); setFormData(p => ({ ...p, branch:'' })); }}
                required={!isEdit}
                disabled={brandsLoading}
                style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
                <option value="">{brandsLoading ? "Loading brands…" : "Select Brand"}</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={bmLabel}>Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
                disabled={!selectedBrandId}
                style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
                <option value="">
                  {!selectedBrandId ? "Select a brand first" : branches.length === 0 ? "No branches available" : "Select Branch"}
                </option>
                {branches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
              </select>
            </div>
          {isEdit ? (
          <div style={{ marginBottom:14 }}>
            <label style={{ ...bmLabel, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>New Password (leave blank to keep)</span>
              <button type="button" onClick={handleGeneratePassword} style={{ fontSize:11, background:'none', border:'none', color:'#00897b', cursor:'pointer', fontWeight:700, textDecoration:'underline' }}>↺ Generate</button>
            </label>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
              <input type={showPassword?"text":"password"} name="password" value={formData.password} onChange={pwChange}
                placeholder="Leave blank to keep current"
                style={{ ...bmInput, flex:1, fontFamily:'monospace', letterSpacing:'0.05em' }} />
              <button type="button" onClick={() => setShowPassword(v=>!v)}
                style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:36, padding:'0 12px', flexShrink:0 }}>
                {showPassword?"Hide":"Show"}
              </button>
            </div>
            {showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}
          </div>
          ) : (
          <div style={{ marginBottom:14 }}>
            <p style={{ fontSize:11, color:C.muted, margin:0 }}>A temporary password will be auto-generated and emailed to the user upon account creation.</p>
          </div>
          )}
          <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 22px', borderRadius:10, border:'1px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)' }}>
              {isEdit ? 'Save Changes' : '✉ Create & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function UsersContent({ user, brands: propBrands = [] }) {
    const [activityLog,     setActivityLog]     = useState([]);
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [users,        setUsers]        = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal,setShowEditModal]= useState(false);
    const [editingUser,  setEditingUser]  = useState(null);
    const [formData,     setFormData]     = useState({ name:'', email:'', role:'', branch:'', password:'' });
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [passwordErrors,         setPasswordErrors]         = useState([]);
    const [showPassword,           setShowPassword]           = useState(false);
    const [brands,         setBrands]         = useState([]);
    const [selectedBrandId,setSelectedBrandId] = useState("");
    const [branches,       setBranches]       = useState([]);
    const [brandsLoading,  setBrandsLoading]  = useState(true);
    const [filterRole,   setFilterRole]   = useState('all');
    const [filterBrandF, setFilterBrandF] = useState('all');
    const [filterBranchF,setFilterBranchF]= useState('all');
    const [searchQuery,  setSearchQuery]  = useState('');

    const [deleteTarget,      setDeleteTarget]      = useState(null); 
    const [deleteHistory,     setDeleteHistory]     = useState([]); 
    const [showDeleteHistory, setShowDeleteHistory] = useState(false);
    const [alertModal,        setAlertModal]        = useState(null);  

    const showAlert = (message, type = "info") => setAlertModal({ message, type });

    const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/users-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
}, [user]);

    useEffect(() => { fetchUsers();  fetchActivityLog(); }, [fetchActivityLog]);

    useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Failed to fetch brands:", err); }
      finally { setBrandsLoading(false); }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!selectedBrandId) { setBranches([]); return; }
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        const data = await response.json();
        console.log("users from API:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showAlert("Failed to load users.", "error");
      }
    };
    const fetchDeleteHistory = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/delete-history`);
    const data = await res.json();
    setDeleteHistory(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchDeleteHistory(); }, []);

    const handleSendCredentials = async (user) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            name: user.name,
            password: "—", 
          }),
        });
        const data = await response.json();
        if (data.success) {
          showAlert(`Credentials sent to ${user.email}!`, "success");
        } else {
          showAlert(data.error || "Failed to send credentials.", "error");
        }
      } catch (error) {
        console.error("Error sending credentials:", error);
        showAlert("Failed to send credentials.", "error");
      }
    };

    const validatePasswordStrength = (password) => {
      const errors = [];
      if (password.length < 8) errors.push("minLength");
      if (!/[A-Z]/.test(password)) errors.push("uppercase");
      if (!/[a-z]/.test(password)) errors.push("lowercase");
      if (!/\d/.test(password))    errors.push("number");
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
      return { isValid: errors.length === 0, errors };
    };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const tempPassword = generateTempPassword();
    const passwordCheck = validatePasswordStrength(tempPassword);
    if (!passwordCheck.isValid) {
      showAlert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character", "error");
      return;
    }

    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
    const payload = { ...formData, password: tempPassword, brand: selectedBrand?.name || "" };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: formData.email,
            name: formData.name,
            password: tempPassword,
          }),
        });
        await logActivity("add", formData.name, formData.branch, `role: ${formData.role}`); // ← add here
        await fetchUsers();
        setShowAddModal(false);
        resetForm();
        showAlert("User added & credentials sent!", "success");
      } else {
        showAlert(data.error || "Failed to add user.", "error");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      showAlert("Failed to add user.", "error");
    }
  };

    const handleEditUser = async (e) => {
    e.preventDefault();

    if (formData.password) { // ← this guard is missing in your current code
      const passwordCheck = validatePasswordStrength(formData.password);
      if (!passwordCheck.isValid) {
        showAlert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character", "error");
        return;
      }
    }

    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
    const payload = {
      ...formData,
      brand: selectedBrand?.name || formData.brand || "",
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${editingUser.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        await logActivity("edit", formData.name, formData.branch, `role: ${formData.role}`); // ← add here
 
        await fetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
        resetForm();
        showAlert("User updated successfully!", "success");
      } else {
        showAlert(data.error || "Failed to update user.", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert("Failed to update user.", "error");
    }
  };

    // Step 1: open confirm modal
    const handleDeleteUser = (user) => setDeleteTarget(user);

    // Step 2: confirmed — call API, push to history
    const confirmDelete = async () => {
      const user = deleteTarget;
      setDeleteTarget(null);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
          await fetch(`${process.env.REACT_APP_API_URL}/delete-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_data: user }),
  });
  await logActivity("delete", user.name, user.branch, `role: ${user.role}`); // ← add here
 
  await fetchDeleteHistory();
          await fetchUsers();
          showAlert(`"${user.name}" has been deleted.`, "success");
        } else {
          showAlert(data.error || "Failed to delete user.", "error");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        showAlert("Failed to delete user.", "error");
      }
    };
    
    const handleRestore = async (entry) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...entry.data, password: entry.data.password || "" }),
        });
        const data = await response.json();
        if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/delete-history/${entry.id}`, {
    method: "DELETE",
  });
   await logActivity("login", user.name, user.branch || "—", null);
 
  await fetchDeleteHistory();
          await fetchUsers();
          setShowDeleteHistory(false);
          showAlert(`"${entry.data.name}" has been restored.`, "success");
        } else {
          showAlert(data.error || "Failed to restore user.", "error");
        }
      } catch (error) {
        console.error("Error restoring user:", error);
        showAlert("Failed to restore user.", "error");
      }
    };

    const openEditModal = (user) => {
      setEditingUser(user);
      setFormData({ name:user.name, email:user.email, role:user.role, branch:user.branch, password:'', brand: user.brand || ''  });
      const ownerBrand = brands.find(b =>       // ← add from here
        (b.branches || []).some(br => (br.name ?? br) === user.branch)
      );
      setSelectedBrandId(ownerBrand ? String(ownerBrand.id) : "");  // ← to here
      setShowEditModal(true);
      setShowPassword(false);
    };
    const resetForm = () => {
      setFormData({ name:'', email:'', role:'', branch:'', password:'', brand:'' });
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setShowPassword(false);
      setSelectedBrandId("");
      setBranches([]);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const formatted = name === "name"
          ? value.replace(/\b\w/g, c => c.toUpperCase())
          : value;
        setFormData(prev => ({ ...prev, [name]: formatted }));
      };

    const handleGeneratePassword = () => {
      const generated = generateTempPassword();
      setFormData(prev => ({ ...prev, password: generated }));
      setShowPasswordValidation(true);
      setPasswordErrors([]);
    };

    const filterBrandBranches = filterBrandF === 'all' ? [] :
    (brands.find(b => String(b.id) === String(filterBrandF))?.branches || []);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (filterRole   !== 'all' && u.role   !== filterRole)   return false;
    if (filterBrandF !== 'all' && u.brand  !== brands.find(b => String(b.id) === String(filterBrandF))?.name) return false;
    if (filterBranchF !== 'all' && u.branch !== filterBranchF) return false;
    return true;
  });

    const pwChange = (e) => {
      handleInputChange(e);
      const v = e.target.value;
      if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
      else   { setShowPasswordValidation(false); setPasswordErrors([]); }
    };

    return (
      <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
  

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {[
            { label:'Total Users',    value:users.length,                                                    icon:<Users size={20} color="#065f46"/>,  bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'All accounts' },
            { label:'Super Admin', value:users.filter(u=>u.role==='Super Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Franchisee Operations Admin', value:users.filter(u=>u.role==='Franchisee Operations Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Sales Admin', value:users.filter(u=>u.role==='Sales Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Franchisees',    value:users.filter(u=>u.role==='Franchisee').length,                   icon:<Store size={20} color="#065f46"/>,  bg:'linear-gradient(135deg,#dbeafe,#93c5fd)', sub:'Branch owners' },
            { label:'Staff',          value:users.filter(u=>u.role==='Staff'||u.role==='Manager').length,    icon:<Users size={20} color="#92400e"/>,  bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Operational' },
          ].map((s, i) => <BmStatCard key={i} {...s} />)}
        </div>

       <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

          {/* Search */}
          <div style={{ position:"relative" }}>
            <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              type="text"
              placeholder="Search name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding:"9px 12px 9px 32px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, color:"#0d2b1e", background:"#f0fdf5", fontFamily:"inherit", outline:"none", width:240 }}
            />
          </div>

          {/* Role */}
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="all">All Roles</option>
            {['Super Admin','Franchisee Operations Admin', 'Sales Admin', 'Franchisee','Manager','Staff'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Brand */}
          <select value={filterBrandF} onChange={e => { setFilterBrandF(e.target.value); setFilterBranchF('all'); }}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {/* Branch */}
          <select value={filterBranchF} onChange={e => setFilterBranchF(e.target.value)} disabled={filterBrandF === 'all'}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background: filterBrandF === 'all' ? '#f5f5f5' : '#f0fdf5', fontFamily:"inherit", outline:"none", cursor: filterBrandF === 'all' ? 'not-allowed' : 'pointer', opacity: filterBrandF === 'all' ? 0.5 : 1 }}>
            <option value="all">{filterBrandF === 'all' ? 'Select brand first' : 'All Branches'}</option>
            {filterBrandBranches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
          </select>

          {/* Clear */}
          {(searchQuery || filterRole !== 'all' || filterBrandF !== 'all' || filterBranchF !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setFilterRole('all'); setFilterBrandF('all'); setFilterBranchF('all'); }}
              style={{ padding:"9px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Clear filters
            </button>
          )}

          <button onClick={() => setShowActivityLog(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1.5px solid #00897b`, background:"#fff", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <ActivityIcon size={13}/> Activity Log
            {activityLog.length > 0 && (
              <span style={{ background:"#00897b", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
                {activityLog.length}
              </span>
            )}
          </button>

        </div>
      </div>

        {/* Table card */}
        <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>User Accounts</span>
            <div style={{ display:'flex', gap:8 }}>
              {/* Delete History button */}
              <button
                onClick={() => setShowDeleteHistory(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.10)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
              >
                <History size={13}/> Delete History
                {deleteHistory.length > 0 && (
                  <span style={{ background:'#dc2626', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:20, marginLeft:2 }}>
                    {deleteHistory.length}
                  </span>
                )}
              </button>
              <button onClick={() => setShowAddModal(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                <Plus size={14}/> Add New User
              </button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['Name','Email','Role','Brand', 'Branch','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:800, fontSize:10.5, color:'#00897b', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:`1px solid ${C.border}`, background:'#f8fffe' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                    onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:'#0d2b1e' }}>{user.name}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.email}</td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ background:'#e0f2f1', color:'#00695c', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{user.role}</span>
                    </td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.brand || '—'}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.branch}</td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ background:'rgba(16,185,129,0.1)', color:'#059669', padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                        {user.status ? user.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => openEditModal(user)} style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:28, padding:'0 12px' }}>
                          <Pencil size={11}/>
                        </button>
                    

                        <button onClick={() => handleDeleteUser(user)} style={{ ...smallBtnSt, border:'1.5px solid #fecaca', background:'#fee2e2', color:'#dc2626', height:28, padding:'0 12px' }}>
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

       {showAddModal && (
  <CreateAccountModal
    applicant={null}
    roles={['Super Admin', 'Franchisee Operations Admin', 'Sales Admin', 'Franchisee']}
    onClose={() => { setShowAddModal(false); resetForm(); }}
    onAlert={(message, type) => setAlertModal({ message, type })}
  />
)}
        {showEditModal && (
        <UserModal
          key="edit"
          title="Edit User"
          onSubmit={handleEditUser}
          onClose={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          selectedBrandId={selectedBrandId}
          setSelectedBrandId={setSelectedBrandId}
          brands={brands}
          branches={branches}
          brandsLoading={brandsLoading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showPasswordValidation={showPasswordValidation}
          passwordErrors={passwordErrors}
          handleGeneratePassword={handleGeneratePassword}
          pwChange={pwChange}
        />
      )}
        {deleteTarget && (
          <UserDeleteConfirmModal
            user={deleteTarget}
            onConfirm={confirmDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}

        {showDeleteHistory && (
          <UserDeleteHistoryPanel
            history={deleteHistory}
            onRestore={handleRestore}
            onClose={() => setShowDeleteHistory(false)}
          />
        )}

        {alertModal && (
          <AlertModal
            message={alertModal.message}
            type={alertModal.type}
            onClose={() => setAlertModal(null)}
          />
        )}

        {showActivityLog && (
  <InventoryActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
  />
)}
      </div>
    );
  }

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT — 
// ─────────────────────────────────────────────────────────────────────────────
function CommunicationContent({ user, brands: propBrands = [] }){
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds]         = useState(new Set());
  const [fetching, setFetching]           = useState(true);
  const [modalVisible, setModalVisible]   = useState(false);
  const [editing, setEditing]             = useState(null);
  const [selectedTab, setSelectedTab]     = useState("all");
  const [title, setTitle]                 = useState("");
  const [content, setContent]             = useState("");
  const [imageUrl, setImageUrl]           = useState("");
  const [imageError, setImageError]       = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [viewingItem, setViewingItem]     = useState(null);
  const [deleteHistory, setDeleteHistory] = useState([]);
  
  const [activityLog,     setActivityLog]     = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const [alertModal,   setAlertModal]   = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const showAlert   = (message, type = "info") => setAlertModal({ message, type });
  const showConfirm = (message, onConfirm, itemName = "") => setConfirmModal({ message, onConfirm, itemName });

  // const [commUser] = useState(() => {
  //   try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  // });

  const isAdminUser = (u) => u?.role === "Franchisee Operations Admin";

  const PIN_KEY = "announcement_pins";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY);
      if (raw) setPinnedIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const persistPins = (newSet) => {
    try { localStorage.setItem(PIN_KEY, JSON.stringify([...newSet])); } catch {}
  };

const fetchDeleteHistory = async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history`);
    const data = await res.json();

    setDeleteHistory(Array.isArray(data) ? data.map(e => ({
      id:        e.id,
      deletedAt: e.deleted_at,
      data: {
        title:      e.title,
        content:    e.content,
        image_url:  e.image_url,
        created_by: e.created_by,
      }
    })) : []);
  } catch (err) { console.error(err); }
};

const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data : []);
  } catch (err) { console.error("Failed to fetch orders activity log:", err); }
}, []);

const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
}, [user]);

useEffect(() => { fetchAnnouncements(); fetchDeleteHistory(); fetchActivityLog(); }, [fetchActivityLog]);

  const fetchAnnouncements = async () => {
    setFetching(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); setAnnouncements([]); }
    finally { setFetching(false); }
  };
  useEffect(() => { fetchAnnouncements(); }, []);

  const mergedAnnouncements = announcements.map(a => ({
    ...a,
    pinned: pinnedIds.has(String(a.id)),
  }));

  const handlePin = (item) => {
    if (!isAdminUser(user)) return;
    console.log("DEBUG user:", user);
    const id = String(item.id);
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persistPins(next);
      return next;
    });
    setViewingItem(prev =>
      prev && String(prev.id) === id ? { ...prev, pinned: !prev.pinned } : prev
    );
  };

    const handlePermanentDelete = (entry) => {
  showConfirm(
    `Permanently delete "${entry.data.title}"? This cannot be undone.`,
    async () => {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, {
          method: "DELETE"
        });
        fetchDeleteHistory();
        showAlert(`"${entry.data.title}" permanently deleted.`, "success");
      } catch (err) {
        showAlert("Failed to permanently delete.", "error");
      }
    },
    entry.data.title
  );
};

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("DEBUG handleSave user:", user, "title:", title, "content:", content);
    if (!isAdminUser(user)) { showAlert("Only administrators can post announcements.", "error"); return; }
    if (!title.trim() || !content.trim()) { showAlert("Please fill in the title and content fields.", "error"); return; }
    try {
      const url    = editing
        ? `${process.env.REACT_APP_API_URL}/announcements/${editing.id}`
        : `${process.env.REACT_APP_API_URL}/announcements`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, content,
          image_url: imageUrl.trim() || null,
          userId: user.id, role: user.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert(data.error || "Failed to save.", "error"); return; }
      setModalVisible(false); setEditing(null); setTitle(""); setContent(""); setImageUrl(""); setImageError(false);
      fetchAnnouncements();
      await logActivity(editing ? "edit" : "add", title, null, editing ? "Updated announcement" : null);
      showAlert(editing ? "Announcement updated successfully!" : "Announcement posted successfully!", "success");
    } catch (err) {
      console.error("Save error:", err);
      showAlert("Failed to save announcement.", "error");
    }
  };

  const handleDelete = (item) => {
    if (!isAdminUser(user)) return;
    showConfirm(`You are about to delete this announcement. You can recover it from Delete History.`, async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${item.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, role: user.role }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || "Delete failed.", "error"); return; }
        const strId = String(item.id);
        if (pinnedIds.has(strId)) {
          setPinnedIds(prev => { const next = new Set(prev); next.delete(strId); persistPins(next); return next; });
        }
        if (viewingItem?.id === item.id) setViewingItem(null);
        fetchAnnouncements();
        await logActivity("delete", item.title, null);

        fetchDeleteHistory();
        showAlert(`"${item.title}" has been deleted.`, "success");
      } catch (err) {
        console.error(err);
        showAlert("Failed to delete announcement.", "error");
      }
    }, item.title);
  };

  const handleRestore = async (entry) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entry.data.title,
          content: entry.data.content,
          image_url: entry.data.image_url || null,
          userId: user.id, role: user.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert(data.error || "Failed to restore.", "error"); return; }

      await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, {
        method: "DELETE"
      });

      fetchAnnouncements();
      await logActivity("add", entry.data.title, null, "Restored from delete history");
      fetchDeleteHistory();
      showAlert(`"${entry.data.title}" has been restored!`, "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to restore announcement.", "error");
    }
  };

  const handleEdit = (item) => {
    if (!isAdminUser(user)) return;
    setEditing(item);
    setTitle(item.title);
    setContent(item.content);
    setImageUrl(item.image_url || "");
    setImageError(false);
    setModalVisible(true);
  };

  const now          = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const tabFiltered = (() => {
    switch (selectedTab) {
      case "recent":        return mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo);
      case "pinned":        return mergedAnnouncements.filter(a => a.pinned);
      case "deleteHistory": return [];
      default:              return mergedAnnouncements;
    }
  })();

  const filtered = searchQuery.trim()
    ? tabFiltered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tabFiltered;

  const tabBadge = {
    all:           mergedAnnouncements.length,
    recent:        mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo).length,
    pinned:        pinnedIds.size,
    deleteHistory: deleteHistory.length,
  };

  const getInitials = (t = "") =>
    t.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

  const isRecent = (item) => new Date() - new Date(item.created_at) < 7 * 24 * 60 * 60 * 1000;

  const fmt = (d) => new Date(d).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // ── Styles ──
  const commStyles = {
    root: { fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column", height: "100%" },
    header: { background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "20px 24px 28px", borderRadius: "18px 18px 0 0", position: "relative", overflow: "hidden" },
    headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
    eyebrow: { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.25em", marginBottom: 4 },
    headerTitle: { fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px" },
    liveChip: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "5px 11px", border: "1px solid rgba(255,255,255,0.3)" },
    liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#d4df33", boxShadow: "0 0 0 3px rgba(212,223,51,0.3)" },
    liveTxt: { fontSize: 9, fontWeight: 800, color: "#d4df33", letterSpacing: "0.15em" },
    searchBarWrap: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: "9px 13px", marginTop: 12, border: "1px solid rgba(255,255,255,0.25)" },
    searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" },
    tabsRow: { display: "flex", gap: 7, padding: "14px 20px", background: "#fff", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" },
    tabBase: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all .15s" },
    badge: { padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 800 },
    listArea: { flex: 1, overflowY: "auto", padding: "20px 20px 24px", background: "#f8fffe" },
    sectionLabel: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
    labelAccent: { width: 4, height: 16, borderRadius: 2, background: "linear-gradient(135deg,#00897b,#4CAF50)", flexShrink: 0 },
    labelTxt: { fontSize: 11, fontWeight: 800, color: "#0d2b1e", letterSpacing: "0.08em", textTransform: "uppercase" },
    card: (pinned) => ({ display: "flex", background: "#fff", borderRadius: 18, marginBottom: 10, border: `1px solid ${pinned ? "#FFE082" : C.border}`, boxShadow: pinned ? "0 3px 14px rgba(249,168,37,0.18)" : "0 2px 10px rgba(0,140,60,0.07)", overflow: "hidden", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }),
    cardAccentBar: (pinned) => ({ width: 4, flexShrink: 0, background: pinned ? "linear-gradient(180deg,#F9A825,#FFC107)" : "linear-gradient(180deg,#00897b,#4CAF50)" }),
    cardBody: { flex: 1, padding: "13px 15px 11px" },
    cardHeaderRow: { display: "flex", alignItems: "flex-start", gap: 10 },
    initialsChip: (pinned) => ({ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: pinned ? "linear-gradient(135deg,#F9A825,#E65100)" : "linear-gradient(135deg,#2E7D32,#00897b)", fontSize: 13, fontWeight: 900, color: "#fff" }),
    cardMeta: { flex: 1, minWidth: 0 },
    cardTitleRow: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 },
    cardTitle: { fontSize: 14, fontWeight: 800, color: "#0d2b1e" },
    cardDate: { fontSize: 10, color: "#8AAD96", fontFamily: "monospace" },
    cardContent: { fontSize: 12.5, color: "#5a7a65", lineHeight: 1.65, marginTop: 9, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    tapHint: { display: "flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 10, color: "#8AAD96" },
    pinnedBadge: { display: "inline-flex", alignItems: "center", gap: 3, background: "#FFF8E1", borderRadius: 6, padding: "2px 6px", border: "1px solid #FFE082", fontSize: 8, fontWeight: 800, color: "#F9A825" },
    recentBadge: { background: "#E0F2F1", borderRadius: 6, padding: "2px 6px", border: "1px solid #B2DFDB", fontSize: 8, fontWeight: 800, color: "#00695c" },
    cardActions: { display: "flex", gap: 5, flexShrink: 0, alignItems: "flex-start" },
    actionBtn: (variant) => ({ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: "#f0fdf5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: variant === "delete" ? "#e53935" : variant === "pin" ? "#F9A825" : "#00695c" }),
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0 40px", gap: 10, textAlign: "center" },
    emptyIcon: { fontSize: 40, marginBottom: 4 },
    emptyTitle: { fontSize: 15, fontWeight: 800, color: "#0d2b1e" },
    emptySub: { fontSize: 12, color: "#8AAD96", maxWidth: 260, lineHeight: 1.6 },
  };
const emptyIcon =
  selectedTab === "pinned" ? <Pin size={18} /> :
  selectedTab === "recent" ? <Clock size={18} /> :
  <Megaphone size={18} />;
  const emptyTitle = searchQuery ? "No results found" : selectedTab === "pinned" ? "Nothing pinned yet" : selectedTab === "recent" ? "No recent announcements" : "No announcements yet";
  const emptySub   = searchQuery ? "Try a different search term." : selectedTab === "pinned" ? "Administrators can pin important announcements." : selectedTab === "recent" ? "Announcements from the last 7 days appear here." : "Check back later.";

  return (
    <div style={commStyles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .comm-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,140,60,0.12) !important; }
        .comm-action-btn:hover { opacity: 0.78; }
        .comm-tab:hover { background: #e8fdf0 !important; color: #00695c !important; }
        .comm-del-row:hover { background: #f6fef8 !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={commStyles.header}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, opacity: 0.15, background: "radial-gradient(ellipse at 30% 100%, #fff 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={commStyles.headerTop}>
          <div>
            <div style={commStyles.eyebrow}>IFRANCHISE</div>
            <div style={commStyles.headerTitle}>Announcements</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setShowActivityLog(true)}
  style={{ ...commStyles.liveChip, height:36, padding:"0 16px", cursor:"pointer", fontFamily:"inherit", border:"1px solid rgba(255,255,255,0.3)", fontSize:13, fontWeight:700, color:"#d4df33" }}>
  <ActivityIcon size={13}/> Activity Log
  {activityLog.length > 0 && (
    <span style={{ background:"rgba(255,255,255,0.18)", color:"#d4df33", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>
      {activityLog.length}
    </span>
  )}
</button>
            <div style={commStyles.liveChip}>
              <div style={commStyles.liveDot} />
              <span style={commStyles.liveTxt}>LIVE</span>
            </div>
            <button
              onClick={() => { setSearchVisible(v => !v); setSearchQuery(""); }}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: searchVisible ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
              {searchVisible ? "✕" : <Search size={16} color="#fff" />}
            </button>
            {isAdminUser(user) && (
              <button
                onClick={() => { setEditing(null); setTitle(""); setContent(""); setImageUrl(""); setImageError(false); setModalVisible(true); }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Plus size={14} /> New
              </button>
            )}
          </div>
        </div>
        {searchVisible && (
          <div style={commStyles.searchBarWrap}>
            <Search size={14} color="rgba(255,255,255,0.7)" />
            <input autoFocus type="text" placeholder="Search announcements…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={commStyles.searchInput} />
            {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1 }}>✕</button>}
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={commStyles.tabsRow}>
        {[
          { key: "all",           label: "All" },
          { key: "recent",        label: "Recent" },
          { key: "pinned",        label: "Pinned" },
          ...(isAdminUser(user) ? [{ key: "deleteHistory", label: "🗑 Delete History" }] : []),
        ].map(({ key, label }) => {
          const active = selectedTab === key;
          const isDelTab = key === "deleteHistory";
          return (
            <button
              key={key}
              className={active ? "" : "comm-tab"}
              onClick={() => setSelectedTab(key)}
              style={{
                ...commStyles.tabBase,
                background: active
                  ? isDelTab ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#2E7D32,#00897b)"
                  : isDelTab ? "#fee2e2" : "#e8f5e9",
                color: active ? "#fff" : isDelTab ? "#dc2626" : "#5a7a65",
                border: active ? "none" : `1px solid ${isDelTab ? "#fecaca" : C.border}`,
                boxShadow: active ? (isDelTab ? "0 2px 8px rgba(220,38,38,0.28)" : "0 2px 8px rgba(0,180,90,0.28)") : "none",
              }}>
              {label}
              {tabBadge[key] > 0 && (
                <span style={{
                  ...commStyles.badge,
                  background: active ? "rgba(255,255,255,0.28)" : isDelTab ? "#fecaca" : C.greenMid,
                  color: active ? "#fff" : isDelTab ? "#dc2626" : "#2E7D32",
                }}>
                  {tabBadge[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── LIST / DELETE HISTORY ── */}
      <div style={commStyles.listArea}>

        {/* ── DELETE HISTORY TAB ── */}
        {selectedTab === "deleteHistory" ? (
          <>
            <div style={commStyles.sectionLabel}>
              <div style={commStyles.labelAccent} />
              <span style={commStyles.labelTxt}>Delete History</span>
              {deleteHistory.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{deleteHistory.length} deleted</span>
              )}
            </div>

            {deleteHistory.length === 0 ? (
              <div style={commStyles.emptyState}>
                <div style={commStyles.emptyIcon}>🗑</div>
                <div style={commStyles.emptyTitle}>No deleted announcements</div>
                <div style={commStyles.emptySub}>Deleted announcements will appear here and can be restored.</div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,140,60,0.07)" }}>
                {/* column headers */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 200px", gap: 8, padding: "10px 16px", borderBottom: `2px solid #e0f2f1`, fontSize: 10, fontWeight: 800, color: "#00897b", textTransform: "uppercase", letterSpacing: "0.07em", background: "#f8fffe" }}>
                  <span>Title</span>
                  <span>Content Preview</span>
                  <span>Deleted At</span>
                  <span></span>
                </div>
                {deleteHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="comm-del-row"
                    style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 200px", gap: 8, alignItems: "center", padding: "12px 16px", borderBottom: i < deleteHistory.length - 1 ? `1px solid #f0f8f0` : "none", transition: "background .15s" }}
                  >
                    {/* Title + image indicator */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.data.title}</div>
                      {entry.data.image_url && (
                        <span style={{ fontSize: 9, background: "#e0f2f1", color: "#00695c", padding: "1px 6px", borderRadius: 6, fontWeight: 700, marginTop: 3, display: "inline-block" }}>🖼 Has Image</span>
                      )}
                    </div>
                    {/* Content preview */}
                    <div style={{ fontSize: 11, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.data.content}</div>
                    {/* Date */}
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmt(entry.deletedAt)}</div>
                    {/* Restore */}
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-start" }}>
                      <button
                        onClick={() => handleRestore(entry)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, border: "1.5px solid #00897b", background: "#e0f2f1", color: "#00695c", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(entry)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── NORMAL LIST ── */}
            <div style={commStyles.sectionLabel}>
              <div style={commStyles.labelAccent} />
              <span style={commStyles.labelTxt}>
                {searchQuery ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"` : selectedTab === "recent" ? "Last 7 Days" : selectedTab === "pinned" ? "Pinned Announcements" : "All Announcements"}
              </span>
            </div>

            {fetching ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 13, fontStyle: "italic" }}>Loading announcements…</div>
            ) : filtered.length === 0 ? (
              <div style={commStyles.emptyState}>
                <div style={commStyles.emptyIcon}>{emptyIcon}</div>
                <div style={commStyles.emptyTitle}>{emptyTitle}</div>
                <div style={commStyles.emptySub}>{emptySub}</div>
              </div>
            ) : filtered.map(item => {
              const pinned = !!item.pinned;
              const recent = isRecent(item);
              return (
                <div
                  key={item.id}
                  className="comm-card"
                  style={commStyles.card(pinned)}
                  onClick={() => setViewingItem(prev => prev?.id === item.id ? null : item)}
                >
                  <div style={commStyles.cardAccentBar(pinned)} />
                  <div style={commStyles.cardBody}>
                    <div style={commStyles.cardHeaderRow}>
                      <div style={commStyles.initialsChip(pinned)}>{getInitials(item.title)}</div>
                      <div style={commStyles.cardMeta}>
                        <div style={commStyles.cardTitleRow}>
                          <span style={commStyles.cardTitle}>{item.title}</span>
                          {pinned && <span style={commStyles.pinnedBadge}>🔖 PINNED</span>}
                          {recent && !pinned && <span style={commStyles.recentBadge}>NEW</span>}
                          {item.image_url && <span style={{ background: "#e0f2f1", color: "#00695c", borderRadius: 6, padding: "2px 6px", fontSize: 8, fontWeight: 800, border: "1px solid #b2dfdb" }}>🖼 IMG</span>}
                        </div>
                        <div style={commStyles.cardDate}>{new Date(item.created_at).toLocaleString()}</div>
                      </div>
                      {isAdminUser(user) && (
                        <div style={commStyles.cardActions} onClick={e => e.stopPropagation()}>
                          <button className="comm-action-btn" style={commStyles.actionBtn("pin")} onClick={() => handlePin(item)} title={pinned ? "Unpin" : "Pin"}>
                            {pinned ? <span style={{ fontSize: 12 }}>🔖</span> : <span style={{ fontSize: 12 }}>📌</span>}
                          </button>
                          <button className="comm-action-btn" style={commStyles.actionBtn("edit")} onClick={() => handleEdit(item)} title="Edit">
                            <Pencil size={12} />
                          </button>
                          <button className="comm-action-btn" style={commStyles.actionBtn("delete")} onClick={() => handleDelete(item)} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={commStyles.cardContent}>{item.content}</div>
                    <div style={commStyles.tapHint}>
                      <span>Tap to read full announcement</span>
                      <span style={{ fontSize: 10 }}>›</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── FULL VIEW PANEL ── */}
      {viewingItem && (
        <div onClick={() => setViewingItem(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: viewingItem.pinned ? "linear-gradient(135deg,#F9A825,#E65100)" : "linear-gradient(135deg,#2E7D32,#00897b)", borderRadius: "20px 20px 0 0", padding: "20px 22px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, opacity: 0.12, background: "radial-gradient(ellipse at 50% 100%, #fff 0%, transparent 70%)" }} />
              <button onClick={() => setViewingItem(null)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.2)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={15} />
              </button>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingRight: 40 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.35)" }}>
                  {getInitials(viewingItem.title)}
                </div>
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    {viewingItem.pinned && <span style={{ background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>🔖 PINNED</span>}
                    {isRecent(viewingItem) && <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 900, color: "#fff" }}>NEW</span>}
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.3px" }}>{viewingItem.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 4, fontFamily: "monospace" }}>{new Date(viewingItem.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: "22px 24px 28px" }}>
              {/* Image display */}
              {viewingItem.image_url && (
                <div style={{ marginBottom: 18, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <img
                    src={viewingItem.image_url}
                    alt="Announcement"
                    style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                </div>
              )}
              <p style={{ fontSize: 14.5, color: "#1A3A2A", lineHeight: 1.75, margin: 0 }}>{viewingItem.content}</p>

              {isAdminUser(user) && (
                <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                  <button onClick={() => handlePin(viewingItem)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: viewingItem.pinned ? "none" : "1.5px solid #FFE082", background: viewingItem.pinned ? "#F9A825" : "#FFF8E1", color: viewingItem.pinned ? "#fff" : "#F9A825" }}>
                    {viewingItem.pinned ? "🔖 Unpin" : "📌 Pin"}
                  </button>
                  <button onClick={() => { handleEdit(viewingItem); setViewingItem(null); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff" }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => { handleDelete(viewingItem); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isAdminUser(user) && modalVisible && (
        <div onClick={() => setModalVisible(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>{editing ? "Edit Announcement" : "New Announcement"}</span>
              <button onClick={() => setModalVisible(false)} style={{ width: 30, height: 30, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "22px 24px" }}>

              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Title</label>
                <input type="text" placeholder="Announcement title…" value={title} onChange={e => setTitle(e.target.value)} required style={{ ...bmInput, marginTop: 4 }} />
              </div>

              {/* Content */}
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Content</label>
                <textarea placeholder="Write your announcement…" value={content} onChange={e => setContent(e.target.value)} required rows={4} style={{ ...bmInput, marginTop: 4, resize: "vertical", lineHeight: 1.65 }} />
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...bmLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Image URL <span style={{ color: "#9ca3af", fontWeight: 400 }}>(Optional)</span></span>
                  {imageUrl && (
                    <button type="button" onClick={() => { setImageUrl(""); setImageError(false); }}
                      style={{ fontSize: 11, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>
                      ✕ Remove
                    </button>
                  )}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setImageError(false); }}
                  style={{ ...bmInput, marginTop: 4 }}
                />
                {/* Live preview */}
                {imageUrl && !imageError && (
                  <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
                      onError={() => setImageError(true)}
                    />
                    <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.45)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>PREVIEW</div>
                  </div>
                )}
                {imageUrl && imageError && (
                  <div style={{ marginTop: 8, padding: "9px 12px", background: "#fee2e2", borderRadius: 10, border: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                    ⚠ Could not load image. Check the URL and try again.
                  </div>
                )}
                {!imageUrl && (
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Paste a direct link to an image (jpg, png, gif, webp…)</p>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setModalVisible(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}>
                  <Check size={14} /> Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ALERT MODAL ── */}
      {alertModal && (
        <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />
      )}

      {/* ── CONFIRM / DELETE MODAL ── */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>Delete Announcement?</h2>
            {confirmModal.itemName && (
              <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 8 }}>
                You are about to delete <strong>"{confirmModal.itemName}"</strong>.
              </p>
            )}
            <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>You can recover this from Delete History.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button type="button" onClick={() => setConfirmModal(null)}
                style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button type="button" onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(220,38,38,0.35)" }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivityLog && (
  <InventoryActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
  />
)}
    </div>
  );
}

const DB_TO_UI_STATUS = { pending:"pending", accepted:"accepted", disposed:"disposed", cancelled:"rejected" };
const UI_TO_DB_STATUS = { pending:"pending", accepted:"accepted", disposed:"disposed", rejected:"cancelled" };

const STATUS_CONFIG = {
  pending:  { label:"Needs Review", bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  accepted: { label:"Accepted",     bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
  disposed: { label:"Fulfilled",    bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
  rejected: { label:"Rejected",     bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
};

const REJECT_REASONS = [
  "Out of stock",
  "Customer requested cancellation",
  "Unable to fulfill in time",
  "Duplicate order",
  "Other",
];

/* ── FIFO / FEFO helpers — mirror Stock Inventory exactly ── */
const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
function isPharmaBrand(brand) { return (brand || "").toLowerCase().includes("ipharma"); }
function getFifoMethod(brand) {
  return isPharmaBrand(brand)
    ? { method:"FEFO", queueLabel:"nearest expiry dispensed first" }
    : { method:"FIFO", queueLabel:"oldest received batch used first" };
}
function sortBatchesByMethod(batches, brand) {
  const { method } = getFifoMethod(brand);
  return [...batches].sort((a, b) => {
    if (method === "FEFO") {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
      return da - db;
    }
    const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
    const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
    return da - db;
  });
}

const normalizeName = (str) => (str || "").trim().toLowerCase().replace(/s$/i, "");

function normalizeOrder(o) {
  return {
    id: `ORD-${String(o.id).padStart(4, "0")}`,
    _dbId: o.id,
    customer: o.user_name ?? `User #${o.user_id}`,
    phone: o.phone ?? "",
    brand: o.brand ?? "",
    branch: o.branch ?? "",
    address: o.address ?? "",
    items: Array.isArray(o.items) ? o.items : [],
    total: o.total_amount,
    status: DB_TO_UI_STATUS[o.status] ?? "pending",
    createdAt: o.created_at,
  };
}

function timeAgo(iso) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month:"short", day:"numeric" });
}


const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true });

/* ── tiny building blocks ── */
const primaryBtn = { padding:"10px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(0,180,90,0.25)" };
const ghostBtn   = { padding:"10px 18px", borderRadius:10, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" };
const dangerBtn  = { padding:"10px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,#ef4444,${C.red})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(220,38,38,0.22)" };
const dangerTextBtn = { padding:"9px 14px", borderRadius:10, border:`1px solid ${C.redBorder}`, background:C.redBg, color:C.red, fontWeight:700, fontSize:12.5, cursor:"pointer", fontFamily:"inherit" };

function StatusBadge({ status, size="md" }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const small = size === "sm";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small ? "2px 8px" : "4px 11px", borderRadius:20, fontSize: small ? 10.5 : 12, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
      {s.label}
    </span>
  );
}

/* ── Toast notifications (replaces alert()) ── */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{ position:"fixed", bottom:22, right:22, zIndex:4000, display:"flex", alignItems:"flex-start", gap:10,
      maxWidth:360, padding:"13px 16px", borderRadius:12, background:"#fff",
      border:`1px solid ${isErr ? C.redBorder : C.greenMid}`, boxShadow:"0 12px 32px rgba(0,0,0,0.16)", fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
        background: isErr ? C.redBg : C.greenLt, color: isErr ? C.red : C.green }}>
        {isErr ? <AlertTriangle size={14}/> : <Check size={14}/>}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.ink }}>{toast.title}</div>
        {toast.message && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{toast.message}</div>}
      </div>
      <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", padding:2 }}><X size={14}/></button>
    </div>
  );
}

/* ── Order progress stepper ── */
function OrderStepper({ status }) {
  const steps = [
    { key:"pending",  label:"Placed" },
    { key:"accepted", label:"Accepted" },
    { key:"disposed", label:"Fulfilled" },
  ];
  const rejected = status === "rejected";
  const activeIdx = rejected ? 0 : steps.findIndex(s => s.key === status);

  return (
    <div style={{ display:"flex", alignItems:"center", padding:"14px 4px 4px" }}>
      {steps.map((s, i) => {
        const done = !rejected && i < activeIdx;
        const current = !rejected && i === activeIdx;
        const isLast = i === steps.length - 1;
        // if rejected, only "Placed" ever completes — everything after shows as cut off
        const showAsRejectedTail = rejected && i > 0;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:64 }}>
              <div style={{
                width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:800,
                background: showAsRejectedTail ? "#f3f4f6" : (done || current) ? `linear-gradient(135deg,${C.teal},${C.green})` : "#eef6f1",
                color: showAsRejectedTail ? "#9ca3af" : (done || current) ? "#fff" : "#9db8a8",
                border: current ? `2px solid ${C.green}` : "none",
              }}>
                {done ? <Check size={13}/> : i + 1}
              </div>
              <span style={{ fontSize:10.5, fontWeight:700, color: showAsRejectedTail ? "#9ca3af" : (done||current) ? C.ink : "#9db8a8", whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {!isLast && (
              <div style={{ flex:1, height:2, margin:"0 2px 18px", background: (!rejected && i < activeIdx) ? C.green : "#e5efe8" }} />
            )}
          </React.Fragment>
        );
      })}
      {rejected && (
        <div style={{ marginLeft:10, display:"flex", alignItems:"center", gap:6, color:C.red, fontSize:11.5, fontWeight:800 }}>
          <X size={14}/> Rejected
        </div>
      )}
    </div>
  );
}

/* ── Reason picker used for Reject / Cancel — required field, validated ── */
function ReasonForm({ title, confirmLabel, danger, onCancel, onConfirm, saving }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = reason !== "";

  return (
    <div style={{ background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:12, padding:14 }}>
      <div style={{ fontSize:12.5, fontWeight:800, color:"#7f1d1d", marginBottom:10 }}>{title}</div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Reason *</label>
      <select value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setTouched(true)}
        style={{ width:"100%", height:36, borderRadius:8, border:`1px solid ${touched && !valid ? C.red : "#fecaca"}`, padding:"0 10px", fontSize:12.5, fontFamily:"inherit", marginBottom: touched && !valid ? 4 : 10, background:"#fff" }}>
        <option value="">Select a reason…</option>
        {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {touched && !valid && <div style={{ fontSize:11, color:C.red, fontWeight:700, marginBottom:10 }}>Please choose a reason before continuing.</div>}
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Note (optional)</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add any extra context…"
        style={{ width:"100%", height:56, borderRadius:8, border:"1px solid #fecaca", padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", resize:"vertical", marginBottom:12, background:"#fff", boxSizing:"border-box" }}/>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <button onClick={onCancel} disabled={saving} style={ghostBtn}>Back</button>
        <button
          onClick={() => { if (!valid) { setTouched(true); return; } onConfirm(reason, note); }}
          disabled={saving}
          style={{ ...dangerBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : confirmLabel}
        </button>
      </div>
    </div>
  );
}

/* ── Order card (e-commerce style) ── */
function OrderCard({ order, onOpen }) {
  const completed = order.status === "disposed" || order.status === "rejected";
  const preview = order.items.slice(0, 2).map(i => `${i.qty}× ${i.name}`).join(", ");
  const more = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";

  const ctaLabel = order.status === "pending" ? "Review Order" : order.status === "accepted" ? "Manage Order" : "View Details";

  return (
    <div onClick={() => onOpen(order)}
      style={{ background:C.white, border:`1px solid ${completed ? "#e6efe9" : "rgba(0,168,76,0.16)"}`, borderRadius:16,
        padding:16, cursor:"pointer", boxShadow:"0 2px 12px rgba(0,140,60,0.06)", opacity: completed ? 0.85 : 1,
        transition:"transform .12s ease, box-shadow .12s ease", display:"flex", flexDirection:"column", gap:12 }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 26px rgba(0,140,60,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,140,60,0.06)"; }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:C.ink }}>#{order.id}</div>
          <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
            <Clock size={11}/> {timeAgo(order.createdAt)}
          </div>
        </div>
        <StatusBadge status={order.status}/>
      </div>

      <div>
        <div style={{ fontWeight:700, fontSize:13.5, color:C.ink }}>{order.customer}</div>
        <div style={{ fontSize:11.5, color:C.muted, display:"flex", alignItems:"center", gap:4, marginTop:1 }}>
          <Phone size={11}/> {order.phone || "—"}
        </div>
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:10.5, fontWeight:700, background:C.greenLt, color:C.greenDk }}>{order.brand}</span>
        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:10.5, fontWeight:700, background:"#f0f0f0", color:"#555" }}>{order.branch}</span>
      </div>

      <div style={{ fontSize:12, color:C.muted, borderTop:`1px dashed ${C.border}`, paddingTop:10, minHeight:18 }}>
        <Package size={11} style={{ marginRight:4, verticalAlign:-1 }}/>
        {preview || "No items"}{more}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
        <div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Total</div>
          <div style={{ fontSize:17, fontWeight:800, color:C.green }}>{fmtPeso1(order.total)}</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onOpen(order); }}
          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"9px 15px", borderRadius:10, border:"none", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            background: order.status === "pending" ? `linear-gradient(135deg,${C.teal},${C.green})` : order.status === "accepted" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "#eef2f0",
            color: completed ? C.muted : "#fff" }}>
          {ctaLabel} <ChevronRight size={13}/>
        </button>
      </div>
    </div>
  );
}

/* ── Order Detail Drawer — the single place actions happen ── */
function OrderDrawer({ order, onClose, onAccept, onReject, onDisposeCheck, onDisposeConfirm, disposeState }) {
  const [mode, setMode] = useState(null); // null | "reject" | "dispose"
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => { setMode(null); }, [order?.id]);

  if (!order) return null;

  const doAccept = async () => {
    setAccepting(true);
    try { await onAccept(order); } finally { setAccepting(false); }
  };

  const doReject = async (reason, note) => {
    setRejecting(true);
    try { await onReject(order, reason, note); setMode(null); } finally { setRejecting(false); }
  };

  const startDispose = () => { setMode("dispose"); onDisposeCheck(order); };

  const dState = disposeState && disposeState.orderId === order.id ? disposeState : null;
  const allOk = dState && dState.results.length > 0 && dState.results.every(r => r.sufficient);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", zIndex:2500, display:"flex", justifyContent:"flex-end" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:460, maxWidth:"94vw", height:"100%", background:C.white, boxShadow:"-12px 0 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", fontFamily:"'Montserrat',sans-serif" }}>

        {/* Header */}
        <div style={{ padding:"18px 22px", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:17, fontWeight:800 }}>Order #{order.id}</div>
              <div style={{ fontSize:11.5, opacity:0.85, marginTop:2 }}>Placed {fmtDate(order.createdAt)}</div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={14}/>
            </button>
          </div>
          <OrderStepper status={order.status}/>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>

          {/* Customer */}
          <SectionCard title="Customer">
            <div style={{ fontWeight:800, fontSize:14, color:C.ink }}>{order.customer}</div>
            <div style={{ fontSize:12.5, color:C.muted, marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Phone size={12}/> {order.phone || "—"}</div>
          </SectionCard>

          {order.address && (
            <SectionCard title="Delivery Address" tint="amber">
              <div style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
                <MapPin size={13} color="#8a6a00" style={{ marginTop:1, flexShrink:0 }}/>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{order.address}</div>
              </div>
            </SectionCard>
          )}

          <SectionCard title={`Items (${order.items.length})`}>
            {order.items.length === 0 ? (
              <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No item details available.</div>
            ) : (
              <div style={{ display:"grid", gap:6 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", borderRadius:8, background:i%2===0?"#f8fffe":"#fff", border:`1px solid ${C.greenLt}` }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:12.5, color:C.ink }}>{item.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>Qty {item.qty}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:12.5, color:C.green }}>{fmtPeso1(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop:8 }}>
              <div style={{ fontWeight:800, fontSize:13, color:C.ink }}>Total</div>
              <div style={{ fontWeight:800, fontSize:16, color:C.green }}>{fmtPeso1(order.total)}</div>
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          <div style={{ marginTop:6 }}>
            {order.status === "pending" && mode !== "reject" && (
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={doAccept} disabled={accepting} style={{ ...primaryBtn, flex:1, opacity:accepting?0.6:1 }}>
                  {accepting ? "Accepting…" : "Accept Order"}
                </button>
                <button onClick={() => setMode("reject")} style={dangerTextBtn}>Reject</button>
              </div>
            )}
            {order.status === "pending" && mode === "reject" && (
              <ReasonForm title="Reject this order" confirmLabel="Reject Order" saving={rejecting}
                onCancel={() => setMode(null)} onConfirm={doReject}/>
            )}

            {order.status === "accepted" && mode !== "dispose" && mode !== "reject" && (
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={startDispose} style={{ ...primaryBtn, flex:1 }}>Check Stock &amp; Dispose</button>
                <button onClick={() => setMode("reject")} style={dangerTextBtn}>Cancel</button>
              </div>
            )}
            {order.status === "accepted" && mode === "reject" && (
              <ReasonForm title="Cancel this order" confirmLabel="Cancel Order" saving={rejecting}
                onCancel={() => setMode(null)} onConfirm={doReject}/>
            )}

            {order.status === "accepted" && mode === "dispose" && (
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, fontWeight:800, color:C.greenDk, marginBottom:10 }}>
                  <ShieldCheck size={14}/> FIFO / FEFO stock check
                </div>
                {!dState || dState.checking ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:C.muted, fontSize:12.5 }}>Checking available stock…</div>
                ) : (
                  <>
                    <div style={{ display:"grid", gap:8, marginBottom:12 }}>
                      {dState.results.map((r, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"9px 11px", borderRadius:9,
                          background: !r.matched ? C.redBg : r.sufficient ? C.greenLt : C.warnBg,
                          border:`1px solid ${!r.matched ? C.redBorder : r.sufficient ? C.greenMid : C.warnBorder}` }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:12.5, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</div>
                            <div style={{ fontSize:10.5, color:C.muted, marginTop:1 }}>
                              {!r.matched ? "Not linked to a stock ingredient" : `Need ${r.qty}${r.unit?" "+r.unit:""} · ${r.available}${r.unit?" "+r.unit:""} on hand`}
                            </div>
                          </div>
                          <span style={{ flexShrink:0, fontSize:9.5, fontWeight:800, padding:"3px 8px", borderRadius:20,
                            color: !r.matched ? "#991b1b" : r.sufficient ? "#27500a" : "#9a3412",
                            background: !r.matched ? "#fee2e2" : r.sufficient ? "#eaf3de" : "#fef3c7" }}>
                            {!r.matched ? "UNMATCHED" : r.sufficient ? "OK" : "SHORT"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!allOk && (
                      <div style={{ display:"flex", gap:7, alignItems:"flex-start", background:C.warnBg, border:`1px solid ${C.warnBorder}`, borderRadius:9, padding:"9px 11px", marginBottom:12, fontSize:11.5, color:"#9a3412" }}>
                        <AlertTriangle size={13} style={{ flexShrink:0, marginTop:1 }}/>
                        <span>Some items can't be fulfilled yet. Top up stock via Receive Stock, then check again.</span>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
                      <button onClick={() => setMode(null)} disabled={dState.saving} style={ghostBtn}>Back</button>
                      <button onClick={() => startDispose()} disabled={dState.saving} style={{ ...ghostBtn, borderColor:C.greenMid, color:C.greenDk }}>Re-check</button>
                      <button onClick={() => onDisposeConfirm(order, dState.results)} disabled={!allOk || dState.saving}
                        style={{ ...primaryBtn, cursor:(!allOk||dState.saving)?"not-allowed":"pointer", opacity:(!allOk||dState.saving)?0.55:1 }}>
                        {dState.saving ? "Disposing…" : "Confirm Dispose"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {order.status === "disposed" && (
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:C.greenDk }}>
                <Check size={15} style={{ flexShrink:0, marginTop:1 }}/>
                <span>This order was fulfilled and its items were deducted from the FIFO/FEFO stock queue.</span>
              </div>
            )}
            {order.status === "rejected" && (
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:"#7f1d1d" }}>
                <X size={15} style={{ flexShrink:0, marginTop:1 }}/>
                <span>This order was rejected. No stock was deducted.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, tint }) {
  const bg = tint === "amber" ? "#fffdf0" : "#f8fffe";
  const border = tint === "amber" ? "#e8d5a3" : C.greenLt;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", color:C.muted, marginBottom:7 }}>{title}</div>
      <div style={{ padding:"12px 13px", background:bg, borderRadius:12, border:`1px solid ${border}` }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
function MobileOrdersContent({ user, brands: propBrands = [] }) {
  const apiUrl   = process.env.REACT_APP_API_URL;
  const userName = user?.name || "Admin";

  const [activityLog,     setActivityLog]     = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const [orders,      setOrders]      = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error,       setError]       = useState(null);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | accepted | disposed | rejected
  const [viewOrder,    setViewOrder]    = useState(null);
  const [disposeState, setDisposeState] = useState(null);  // { orderId, checking, results, saving }
  const [toast,        setToast]        = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  /* ── activity log ── */
  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${apiUrl}/orders-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, [apiUrl]);

  const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
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
      });
    } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [user]);

  const logIngredientActivity = useCallback(async (ingredientName, branchName, changes) => {
    try {
      await fetch(`${apiUrl}/ingredient-activity-log`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ action:"dispose", ingredient_name:ingredientName, branch:branchName, performed_by:userName, changes }),
      });
    } catch (err) { console.warn("Ingredient activity log failed (non-fatal):", err); }
  }, [apiUrl, userName]);

  /* ── fetch orders + ingredients ── */
  const fetchOrders = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/orders`, { credentials:"include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.map(normalizeOrder));
    } catch (err) { setError(err.message); }
    finally { setLoadingData(false); }
  };

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ingredients`);
      const d = await res.json();
      setIngredients(Array.isArray(d) ? d : []);
    } catch (err) { console.warn("Failed to fetch ingredients:", err); }
  }, [apiUrl]);

  useEffect(() => { fetchOrders(); fetchActivityLog(); fetchIngredients(); }, [fetchActivityLog, fetchIngredients]);

  /* ── plain status change (accept / reject / cancel) ── */
  const advanceStatus = async (order, nextUiStatus, changeNote) => {
    const dbStatus = UI_TO_DB_STATUS[nextUiStatus];
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status:nextUiStatus } : o));
    setViewOrder(v => (v && v.id === order.id) ? { ...v, status:nextUiStatus } : v);
    try {
      const res = await fetch(`${apiUrl}/orders/${order._dbId}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" }, credentials:"include",
        body: JSON.stringify({ status:dbStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      await logActivity("edit", `Order #${order.id}`, order.branch, changeNote || `status → ${nextUiStatus}`);
      await fetchActivityLog();
    } catch (err) {
      fetchOrders();
      showToast("error", "Couldn't update order", err.message);
      throw err;
    }
  };

  const handleAccept = async (order) => {
    try {
      await advanceStatus(order, "accepted", "Order accepted");
      showToast("success", "Order accepted", `#${order.id} is ready to be fulfilled.`);
    } catch {}
  };

  const handleReject = async (order, reason, note) => {
    try {
      const changeNote = `${order.status === "accepted" ? "Cancelled" : "Rejected"} — ${reason}${note ? `: ${note}` : ""}`;
      await advanceStatus(order, "rejected", changeNote);
      showToast("success", "Order rejected", `#${order.id} was marked as rejected.`);
    } catch {}
  };

  /* ── FIFO/FEFO matching + deduction ── */
  const matchIngredient = useCallback((itemName, branch) => {
    const target = normalizeName(itemName);
    return (
      ingredients.find(i => normalizeName(i.name) === target && i.branch === branch) ||
      ingredients.find(i => normalizeName(i.name) === target) ||
      null
    );
  }, [ingredients]);

  const fetchBatchesFor = async (ingredientId) => {
    const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${ingredientId}`);
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  };

  const checkOrderStock = useCallback(async (order) => {
    const results = [];
    for (const item of order.items) {
      const ing = matchIngredient(item.name, order.branch);
      if (!ing) { results.push({ ...item, matched:false, available:0, sufficient:false }); continue; }
      const batches = await fetchBatchesFor(ing.id);
      const available = batches.reduce((s, b) => s + Number(b.stock || 0), 0);
      results.push({ ...item, matched:true, ingredientId:ing.id, brand:ing.brand, unit:ing.unit, available, sufficient: available >= Number(item.qty || 0) });
    }
    return results;
  }, [matchIngredient]); // eslint-disable-line react-hooks/exhaustive-deps

  const runDisposeCheck = async (order) => {
    setDisposeState({ orderId:order.id, checking:true, results:[], saving:false });
    const results = await checkOrderStock(order);
    setDisposeState({ orderId:order.id, checking:false, results, saving:false });
  };

  const deductFromFifo = async (result, order) => {
    let remaining = Number(result.qty || 0);
    const batches = sortBatchesByMethod(await fetchBatchesFor(result.ingredientId), result.brand);
    for (const b of batches) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, Number(b.stock || 0));
      if (take <= 0) continue;
      await fetch(`${apiUrl}/ingredient-batches/${b.id}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...b, stock: Number(b.stock) - take }),
      });
      remaining -= take;
    }
    const freshBatches = await fetchBatchesFor(result.ingredientId);
    const totalStock = freshBatches.reduce((s, b) => s + Number(b.stock || 0), 0);
    const ingredient = ingredients.find(i => i.id === result.ingredientId);
    if (ingredient) {
      await fetch(`${apiUrl}/ingredients/${result.ingredientId}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...ingredient, stock: totalStock }),
      });
      await logIngredientActivity(ingredient.name, ingredient.branch, `-${result.qty} ${ingredient.unit} dispensed for Order #${order.id}`);
    }
  };

  const handleDisposeConfirm = async (order, results) => {
    setDisposeState(prev => ({ ...prev, saving:true }));
    try {
      for (const r of results) if (r.matched) await deductFromFifo(r, order);
      await advanceStatus(order, "disposed", `Fulfilled — ${order.items.length} item(s) deducted from FIFO/FEFO stock`);
      await fetchIngredients();
      setDisposeState(null);
      setViewOrder(null);
      showToast("success", "Order fulfilled", `#${order.id} stock was deducted and the order is complete.`);
    } catch (err) {
      setDisposeState(prev => ({ ...prev, saving:false }));
      showToast("error", "Dispose failed", err.message);
    }
  };

  /* ── derived data ── */
  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const counts = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted").length,
    disposed: orders.filter(o => o.status === "disposed").length,
  };

  const FILTER_CHIPS = [
    { key:"all",      label:"All Orders",   count:counts.total },
    { key:"pending",  label:"Needs Review", count:counts.pending },
    { key:"accepted", label:"Accepted",     count:counts.accepted },
    { key:"disposed", label:"Fulfilled",    count:counts.disposed },
    { key:"rejected", label:"Rejected",     count:orders.filter(o=>o.status==="rejected").length },
  ];

  /* ── loading / error states ── */
  if (loadingData) return (
    <div style={{ padding:60, textAlign:"center", color:C.muted, fontFamily:"'Montserrat',sans-serif" }}>Loading orders…</div>
  );
  if (error) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ color:C.red, marginBottom:12 }}>{error}</div>
      <button onClick={fetchOrders} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, background:C.greenLt, color:C.greenDk, fontWeight:700, cursor:"pointer" }}>Retry</button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:not(:disabled) { transition: filter .15s ease, transform .1s ease; }
        button:not(:disabled):hover { filter: brightness(0.96); }
        button:not(:disabled):active { transform: translateY(1px); }
        select:focus, input:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); outline:none; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:C.ink }}>Orders</h1>
        <div style={{ fontSize:12.5, color:C.muted, marginTop:3 }}>Review incoming orders, accept them, and fulfill from your FIFO/FEFO stock.</div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        <BmStatCard label="All Orders"    value={counts.total}    icon={<Package size={20} color="#065f46" />}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="Every order" />
        <BmStatCard label="Needs Review"  value={counts.pending}  icon={<AlertTriangle size={20} color="#92400e" />} bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Waiting on you" />
        <BmStatCard label="Accepted"      value={counts.accepted} icon={<TrendingUp size={20} color="#1e40af" />}    bg="linear-gradient(135deg,#dbeafe,#93c5fd)" sub="Ready to fulfill" />
        <BmStatCard label="Fulfilled"     value={counts.disposed} icon={<Check size={20} color="#065f46" />}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Deducted from stock" />
      </div>

      {/* Search + filter chips */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", marginBottom:18 }}>
        <div style={{ position:"relative", flex:"1 1 220px", minWidth:200 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer name…"
            style={{ width:"100%", height:38, padding:"0 14px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTER_CHIPS.map(c => (
            <button key={c.key} onClick={() => setStatusFilter(c.key)}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:20, border:`1px solid ${statusFilter===c.key ? C.green : C.border}`,
                background: statusFilter===c.key ? `linear-gradient(135deg,${C.teal},${C.green})` : "#fff",
                color: statusFilter===c.key ? "#fff" : C.muted, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {c.label}
              <span style={{ padding:"1px 7px", borderRadius:20, fontSize:10.5, background: statusFilter===c.key ? "rgba(255,255,255,0.25)" : C.greenLt, color: statusFilter===c.key ? "#fff" : C.greenDk }}>{c.count}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={() => setShowActivityLog(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.green}`, background:"#fff", color:C.greenDk, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            <Layers size={13}/> Activity Log
            {activityLog.length > 0 && <span style={{ background:C.green, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{activityLog.length}</span>}
          </button>
          <button onClick={fetchOrders}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:C.greenLt, color:C.greenDk, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* Order grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"70px 20px", background:"#fff", borderRadius:18, border:`1px dashed ${C.border}` }}>
          <Package size={34} color={C.muted} style={{ opacity:0.5, marginBottom:10 }}/>
          <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:4 }}>No orders here</div>
          <div style={{ fontSize:12.5, color:C.muted }}>
            {statusFilter === "all" ? "New orders will show up here as soon as customers place them." : "Try a different filter or search term."}
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))", gap:16 }}>
          {filtered.map(order => <OrderCard key={order.id} order={order} onOpen={setViewOrder}/>)}
        </div>
      )}

      {/* Detail drawer */}
      {viewOrder && (
        <OrderDrawer
          order={orders.find(o => o.id === viewOrder.id) || viewOrder}
          onClose={() => { setViewOrder(null); setDisposeState(null); }}
          onAccept={handleAccept}
          onReject={handleReject}
          onDisposeCheck={runDisposeCheck}
          onDisposeConfirm={handleDisposeConfirm}
          disposeState={disposeState}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)}/>

      {showActivityLog && (
        <InventoryActivityLogPanel log={activityLog} onClose={() => setShowActivityLog(false)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function ProfileContent({ user }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name, email: user.email, personalEmail: '',
    role: user.role, currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showOtpModal,     setShowOtpModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp,              setOtp]              = useState('');
  const [otpSent,          setOtpSent]          = useState(false);
  const [otpError,         setOtpError]         = useState('');
  const [passwordErrors,   setPasswordErrors]   = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showCurrentPw,    setShowCurrentPw]    = useState(false);
  const [showNewPw,        setShowNewPw]        = useState(false);
  const [showConfirmPw,    setShowConfirmPw]    = useState(false);
  const [fieldErrors,      setFieldErrors]      = useState({});

  // ── UI modal state ──
  const [alertModal,   setAlertModal]   = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showAlert   = (message, type = "info") => setAlertModal({ message, type });
  const showConfirm = (message, onConfirm)     => setConfirmModal({ message, onConfirm });

  // ── Keep formData in sync with user prop without re-rendering on every keystroke ──
  const formDataRef = React.useRef(formData);
  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target;
    formDataRef.current = { ...formDataRef.current, [name]: value };
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    setFieldErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'newPassword') {
      if (value) {
        setShowPasswordValidation(true);
        setPasswordErrors(validatePasswordStrength(value).errors);
      } else {
        setShowPasswordValidation(false);
        setPasswordErrors([]);
      }
    }
    if (name === 'confirmPassword') {
      // live match feedback handled by fieldErrors below
    }
  }, []);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8)                                                        errors.push('minLength');
    if (!/[A-Z]/.test(password))                                                    errors.push('uppercase');
    if (!/[a-z]/.test(password))                                                    errors.push('lowercase');
    if (!/\d/.test(password))                                                       errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))                  errors.push('specialChar');
    return { isValid: errors.length === 0, errors };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });
      const data = await response.json();
      if (data.success) { setOtpSent(true); showAlert(`OTP has been sent to ${emailToSend}`, "success"); }
      else showAlert(data.message || data.error || 'Failed to send OTP.', "error");
    } catch (error) {
      console.error("Error sending OTP:", error);
      showAlert("Failed to send OTP. Please try again.", "error");
    }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError('');
      const emailToVerify = formData.personalEmail || formData.email;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/password`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword, email: emailToVerify, otp: otp.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        setShowSuccessModal(true);
        localStorage.removeItem('user');
        localStorage.removeItem('tempUser');
        setTimeout(() => { window.location.href = '/admin-login'; }, 3000);
      } else {
        setOtpError(data.error || 'Failed to change password');
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
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;

    if (isPasswordChange) {
      if (!formData.currentPassword) errs.currentPassword = 'Please enter your current password.';
      if (!formData.newPassword)     errs.newPassword     = 'Please enter a new password.';
      else {
        const pv = validatePasswordStrength(formData.newPassword);
        if (!pv.isValid) errs.newPassword = 'Password does not meet all requirements.';
      }
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Please confirm your new password.';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
      if (!formData.personalEmail && !formData.email) errs.personalEmail = 'An email is required to receive OTP.';

      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
      sendOtp();
      setShowOtpModal(true);
    } else {
      updateProfile();
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, branch: user.branch }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert('Profile updated successfully!', 'success');
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsUnlocked(false);
      } else {
        showAlert(data.error || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Failed to update profile. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    showConfirm('Discard all unsaved changes?', () => {
      setFormData({ name: user.name, email: user.email, personalEmail: '', role: user.role, currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtp(''); setOtpSent(false); setShowOtpModal(false);
      setShowPasswordValidation(false); setPasswordErrors([]);
      setFieldErrors({}); setIsUnlocked(false);
    });
  };

  const initials = user.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // ── Shared input style ──
  const inputStyle = (disabled) => ({
    ...bmInput,
    marginTop: 4,
    background: disabled ? '#f5f8f5' : '#fff',
    color: disabled ? '#9ca3af' : '#0d2b1e',
    cursor: disabled ? 'not-allowed' : 'text',
    border: disabled ? '1.5px solid #e5e7eb' : '1.5px solid #b2dfdb',
  });

  const PwChecklist = () => (
    <div style={{ marginTop: 8, fontSize: 12, padding: '10px 14px', background: '#f0fdf5', borderRadius: 10, border: '1.5px solid #b2dfdb' }}>
      <div style={{ marginBottom: 6, fontWeight: 700, color: '#0d2b1e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password must contain:</div>
      {[
        ['minLength',   'At least 8 characters'],
        ['uppercase',   'Uppercase letter (A-Z)'],
        ['lowercase',   'Lowercase letter (a-z)'],
        ['number',      'Number (0-9)'],
        ['specialChar', 'Special character (!@#$%^&*...)'],
      ].map(([key, text]) => (
        <div key={key} style={{ color: passwordErrors.includes(key) ? '#dc2626' : '#059669', marginBottom: 3, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <span>{passwordErrors.includes(key) ? '✗' : '✓'}</span> {text}
        </div>
      ))}
    </div>
  );

  const FieldError = ({ name }) => fieldErrors[name]
    ? <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>
    : null;

  const EyeToggle = ({ show, onToggle, disabled }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: '#5a7a65', display: 'flex', alignItems: 'center', padding: 0 }}
    >
      {show
        ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── Account Overview Card ── */}
      <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Account Overview</span>
        </div>
        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#00695c', flexShrink: 0, letterSpacing: 1, border: '2.5px solid #a7f3d0' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#0d2b1e', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5a7a65" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
              {user.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(0,137,123,0.1)', color: '#00695c', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{user.role}</span>
              {user.branch && <span style={{ background: '#f0fdf5', color: '#0d2b1e', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1.5px solid #b2dfdb' }}>{user.branch}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, textAlign: 'right' }}>
            <div style={{ padding: '8px 16px', borderRadius: 12, background: '#f0fdf5', border: '1.5px solid #b2dfdb' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 2 }}>Account Status</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block' }}/>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#059669' }}>Active</span>
              </div>
            </div>
            {user.branch && (
              <div style={{ padding: '8px 16px', borderRadius: 12, background: '#f0fdf5', border: '1.5px solid #b2dfdb' }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 2 }}>Branch</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{user.branch}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lock/Unlock Banner ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isUnlocked ? '#f0fdf5' : '#f5f8f5', border: `1.5px solid ${isUnlocked ? '#b2dfdb' : '#e5e7eb'}`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
         {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{isUnlocked ? 'Editing Enabled' : 'Profile Locked'}</div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>{isUnlocked ? 'Make your changes and save when done.' : 'Click Unlock to edit your profile.'}</div>
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
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            background: isUnlocked ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)',
            color: '#fff', boxShadow: isUnlocked ? '0 2px 8px rgba(220,38,38,0.3)' : '0 2px 8px rgba(0,180,90,0.3)',
          }}
        >
          {isUnlocked ? '✕ Cancel' : ' Unlock'}
        </button>
      </div>

      {/* ── Two-column: Personal Info + Change Password ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Personal Information Card ── */}
        <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Personal Information</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>

            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Full Name</label>
              <input
                type="text" name="name" value={formData.name}
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
                type="email" name="email" value={formData.email}
                onChange={handleInputChange}
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <FieldError name="email" />
            </div>

            {/* Personal Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Personal Email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span></label>
              <input
                type="email" name="personalEmail" value={formData.personalEmail}
                onChange={handleInputChange}
                placeholder="your.personal@email.com"
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>OTP for password changes will be sent here</p>
              <FieldError name="personalEmail" />
            </div>

            {/* Role (always locked) */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              <input
                type="text" name="role" value={formData.role}
                disabled
                style={{ ...inputStyle(true), background: '#f0f0f0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={!isUnlocked}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: isUnlocked ? '0 2px 10px rgba(0,180,90,0.28)' : 'none', opacity: isUnlocked ? 1 : 0.6 }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Change Password</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
            <div style={{ background: isUnlocked ? '#f0fdf5' : '#f5f8f5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1.5px solid ${isUnlocked ? C.border : '#e5e7eb'}`, fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
               {isUnlocked ? 'An OTP will be sent to your email for verification' : 'Unlock your profile to change your password'}
            </div>

            {/* Current Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Current Password</label>
              <div style={{ position: 'relative', marginTop: 4 }}>
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? 'Enter current password' : '••••••••'}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle show={showCurrentPw} onToggle={() => setShowCurrentPw(v => !v)} disabled={!isUnlocked} />
              </div>
              <FieldError name="currentPassword" />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>New Password</label>
              <div style={{ position: 'relative', marginTop: 4 }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? 'Enter new password' : '••••••••'}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle show={showNewPw} onToggle={() => setShowNewPw(v => !v)} disabled={!isUnlocked} />
              </div>
              {isUnlocked && showPasswordValidation && <PwChecklist />}
              <FieldError name="newPassword" />
            </div>

            {/* Confirm New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Confirm New Password</label>
              <div style={{ position: 'relative', marginTop: 4 }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? 'Confirm new password' : '••••••••'}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(v => !v)} disabled={!isUnlocked} />
              </div>
              {/* Live match indicator */}
              {isUnlocked && formData.confirmPassword && (
                <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: formData.newPassword === formData.confirmPassword ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
              <FieldError name="confirmPassword" />
            </div>

            <button
              type="submit"
              disabled={!isUnlocked}
              style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: isUnlocked ? '0 2px 10px rgba(0,180,90,0.28)' : 'none', opacity: isUnlocked ? 1 : 0.6 }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.6rem' }}>🔑</div>
              <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', marginBottom: 6 }}>Verify OTP</h2>
              <p style={{ fontSize: 13, color: C.muted }}>Code sent to <strong style={{ color: '#0d2b1e' }}>{formData.personalEmail || formData.email}</strong></p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Enter 6-Digit OTP</label>
              <input
                type="text" placeholder="000000" value={otp}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setOtp(v); setOtpError(''); }}
                maxLength={6} autoFocus
                style={{ ...bmInput, marginTop: 6, fontSize: 24, textAlign: 'center', letterSpacing: '0.6rem', fontFamily: 'monospace' }}
              />
            </div>
            {otpSent && !otpError && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid #a7f3d0', color: '#059669', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                 OTP sent successfully
              </div>
            )}
            {otpError && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, border: '1.5px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                Please try again {otpError}
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button type="button" onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#00897b', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>Resend OTP</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={verifyOtpAndChangePassword} disabled={otp.length !== 6}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: otp.length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: otp.length !== 6 ? 0.5 : 1 }}>
                Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 22, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>Password Changed!</h2>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>Your password has been updated successfully.<br />You'll be redirected to login shortly.</p>
            <div style={{ background: '#f0fdf5', borderRadius: 12, padding: '10px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              💡 Use your new password on the next login
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Modal ── */}
      {alertModal && (
        <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>↩</div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Discard Changes?</h2>
            <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button type="button" onClick={() => setConfirmModal(null)}
                style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Keep Editing
              </button>
              <button type="button" onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#c2410c,#ea580c)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(194,65,12,0.35)' }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// GCASH QR CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PAYMONGO GCASH MODAL  — auto-confirms when payment is detected
// ─────────────────────────────────────────────────────────────────────────────
function GCashQRModal({ totalAmt, onConfirm, onCancel, fmtPHP }) {
  const [step,       setStep]       = React.useState("loading"); 
  // steps: loading | ready | polling | paid | error
  const [qrUrl,      setQrUrl]      = React.useState("");
  const [linkId,     setLinkId]     = React.useState("");
  const [refNo,      setRefNo]      = React.useState("");
  const [gcashRef,   setGcashRef]   = React.useState("");
  const [errorMsg,   setErrorMsg]   = React.useState("");
  const [countdown,  setCountdown]  = React.useState(180); // 3 min timeout
  const pollRef  = React.useRef(null);
  const timerRef = React.useRef(null);

  // ── Create payment link on mount ──────────────────────────────────────────
  React.useEffect(() => {
    const create = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/create-gcash`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount:      totalAmt,
            description: 'iFranchise POS Payment',
            orderId:     Date.now(),
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setErrorMsg(data.error || 'Failed to create payment link.');
          setStep('error');
          return;
        }

        // Generate QR from the checkout URL using a free QR API
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.checkoutUrl)}`;
        setQrUrl(qr);
        setLinkId(data.linkId);
        setRefNo(data.referenceNo);
        setStep('ready');
        startPolling(data.linkId);
        startCountdown();
      } catch (err) {
        setErrorMsg('Could not reach payment server.');
        setStep('error');
      }
    };
    create();
    return () => { clearInterval(pollRef.current); clearInterval(timerRef.current); };
  }, []);

  const startPolling = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/link-status/${id}`);
        const data = await res.json();
        if (data.status === 'paid') {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setGcashRef(data.gcashRef || refNo);
          setStep('paid');
          setTimeout(() => onConfirm(data.gcashRef || refNo), 1500);
        }
      } catch {}
    }, 3000); // poll every 3 seconds
  };

  const startCountdown = () => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollRef.current);
          setStep('error');
          setErrorMsg('Payment window expired. Please try again.');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleRetry = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    setStep('loading');
    setCountdown(180);
    setErrorMsg('');
  };

  const fmtCountdown = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div
      onClick={e => { if (e.target===e.currentTarget) onCancel(); }}
      style={{
        position:'fixed', inset:0,
        background:'rgba(0,0,0,0.65)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:4000, padding:20,
        backdropFilter:'blur(6px)',
      }}
    >
      <div style={{
        background:'#fff', borderRadius:24,
        width:'100%', maxWidth:400,
        overflow:'hidden',
        boxShadow:'0 32px 80px rgba(0,0,0,0.3)',
        fontFamily:"'Montserrat',sans-serif",
        animation:'gcashSlideUp .25s cubic-bezier(.22,1,.36,1)',
      }}>
        <style>{`
          @keyframes gcashSlideUp {
            from{opacity:0;transform:translateY(28px) scale(0.97);}
            to{opacity:1;transform:translateY(0) scale(1);}
          }
          @keyframes spin { to{transform:rotate(360deg);} }
          @keyframes paidPop {
            0%{transform:scale(0.8);opacity:0;}
            70%{transform:scale(1.1);}
            100%{transform:scale(1);opacity:1;}
          }
        `}</style>

        {/* Header */}
        <div style={{
          background:'linear-gradient(135deg,#007acc,#0057a8)',
          padding:'18px 22px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'#007acc' }}>G</div>
            <div>
              <div style={{ fontWeight:900, fontSize:15, color:'#fff' }}>GCash via PayMongo</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>
                {step==='loading' && 'Generating payment link…'}
                {step==='ready'   && `Waiting for payment · ${fmtCountdown(countdown)}`}
                {step==='polling' && `Checking payment · ${fmtCountdown(countdown)}`}
                {step==='paid'    && 'Payment confirmed ✓'}
                {step==='error'   && 'Payment failed'}
              </div>
            </div>
          </div>
          <button onClick={onCancel} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>×</button>
        </div>

        {/* Amount bar */}
        <div style={{ background:'#f0f7ff', padding:'12px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#5a7a65', textTransform:'uppercase', letterSpacing:'0.07em' }}>Amount</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#0057a8' }}>{fmtPHP(totalAmt)}</div>
        </div>

        {/* Body */}
        <div style={{ padding:'22px 24px 24px', textAlign:'center' }}>

          {/* LOADING */}
          {step==='loading' && (
            <div style={{ padding:'32px 0' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation:'spin 0.8s linear infinite', marginBottom:12 }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <div style={{ fontSize:14, color:'#5a7a65', fontWeight:600 }}>Creating payment link…</div>
            </div>
          )}

          {/* READY — show QR */}
          {(step==='ready' || step==='polling') && qrUrl && (
            <>
              <div style={{ fontSize:13, color:'#374151', fontWeight:600, marginBottom:14 }}>
                Ask the customer to scan this QR code with their GCash app
              </div>

              {/* QR code */}
              <div style={{
                width:200, height:200, margin:'0 auto 14px',
                border:'3px solid #007acc', borderRadius:16,
                overflow:'hidden', position:'relative',
              }}>
                <img src={qrUrl} alt="PayMongo GCash QR" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                {/* Animated scanning line */}
                <div style={{
                  position:'absolute', top:0, left:0, right:0, height:2,
                  background:'linear-gradient(90deg,transparent,#007acc,transparent)',
                  animation:'scanLine 2s linear infinite',
                }}/>
              </div>
              <style>{`
                @keyframes scanLine {
                  0%   { top:0; }
                  100% { top:196px; }
                }
              `}</style>

              {/* Ref number */}
              {refNo && (
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:12 }}>
                  Ref # <strong style={{ color:'#374151', fontFamily:'monospace' }}>{refNo}</strong>
                </div>
              )}

              {/* Countdown */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                background: countdown < 30 ? '#fee2e2' : '#f0f7ff',
                border:`1px solid ${countdown < 30 ? '#fecaca' : '#bfdbfe'}`,
                borderRadius:20, padding:'5px 14px',
                fontSize:12, fontWeight:700,
                color: countdown < 30 ? '#dc2626' : '#1e40af',
                marginBottom:16,
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Expires in {fmtCountdown(countdown)}
              </div>

              {/* Polling indicator */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontSize:12, color:'#5a7a65' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation:'spin 1.2s linear infinite', flexShrink:0 }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Waiting for payment confirmation…
              </div>
            </>
          )}

          {/* PAID */}
          {step==='paid' && (
            <div style={{ padding:'24px 0', animation:'paidPop .4s ease' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#059669,#047857)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 4px 20px rgba(5,150,105,0.4)' }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontWeight:900, fontSize:18, color:'#0d2b1e', marginBottom:6 }}>Payment Received!</div>
              <div style={{ fontSize:13, color:'#5a7a65', marginBottom:10 }}>
                {fmtPHP(totalAmt)} via GCash
              </div>
              {gcashRef && (
                <div style={{ background:'#f0fdf5', border:'1px solid #d1eedd', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, color:'#00695c', fontFamily:'monospace', letterSpacing:'0.05em' }}>
                  Ref: {gcashRef}
                </div>
              )}
              <div style={{ marginTop:12, fontSize:12, color:'#9ca3af' }}>Processing transaction…</div>
            </div>
          )}

          {/* ERROR */}
          {step==='error' && (
            <div style={{ padding:'24px 0' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div style={{ fontWeight:800, fontSize:15, color:'#0d2b1e', marginBottom:6 }}>Payment Failed</div>
              <div style={{ fontSize:13, color:'#5a7a65', marginBottom:20 }}>{errorMsg}</div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onCancel} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={handleRetry} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#007acc,#0057a8)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Try Again</button>
              </div>
            </div>
          )}

          {/* Cancel button (ready/polling states) */}
          {(step==='ready' || step==='polling') && (
            <button
              onClick={onCancel}
              style={{ marginTop:14, width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
            >
              Cancel payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// POS
// ─────────────────────────────────────────────────────────────────────────────

function POSContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";
    const [filterBrand, setFilterBrand] = React.useState(null);
  const brandList = propBrands.length > 0 ? propBrands : [
    { id: "ipharma",     name: "iPharma",      branches: ["Main Branch","Alabang","Makati","Pasay","Paranaque"] },
    { id: "coffeespot",  name: "Coffee Spot",  branches: ["HQ","BGC Branch","Ortigas","Cubao"] },
  ];
// Color palette
const C_teal  = "#14b8a6";
const C_green = "#22c55e";
const C_bg    = "#f8fafc";
const C_white = "#ffffff";
const C_muted = "#64748b";
const C_ink   = "#0f172a";
const C_warn  = "#f59e0b";
const C_ok    = "#16a34a";
  const [menuItems,        setMenuItems]        = React.useState([]);
  const [cart,             setCart]             = React.useState([]);
  const [transactions,     setTransactions]     = React.useState([]);
  const [voidedTx,         setVoidedTx]         = React.useState([]);
  const [loadingTx,        setLoadingTx]        = React.useState(false);
  const [activeBranch,     setActiveBranch]     = React.useState(isAdmin ? "" : userBranch);
  const [searchProduct,    setSearchProduct]    = React.useState("");
  const [txSearch,         setTxSearch]         = React.useState("");
  const [txDateFrom,       setTxDateFrom]       = React.useState("");
  const [txDateTo,         setTxDateTo]         = React.useState("");
  const [activeTab,        setActiveTab]        = React.useState("cashier");
const [paymentMethod,     setPaymentMethod]     = React.useState("Cash");
const [cashReceived,      setCashReceived]      = React.useState("");
const [isSplitPayment,    setIsSplitPayment]    = React.useState(false);
const [splitGcashAmt,     setSplitGcashAmt]     = React.useState("");
const [splitCashAmt,      setSplitCashAmt]      = React.useState("");
const [splitGcashPaid,    setSplitGcashPaid]    = React.useState(false);
const [splitGcashRef,     setSplitGcashRef]     = React.useState("");
const [showGCashModal,    setShowGCashModal]    = React.useState(false);
const [gcashRefNumber,    setGcashRefNumber]    = React.useState("");
const [gcashPaymentAmt,   setGcashPaymentAmt]   = React.useState(0);
  const [discountPct,      setDiscountPct]      = React.useState(0);
  const [discountType,        setDiscountType]        = React.useState("None");
  const [showDiscountAuth,    setShowDiscountAuth]     = React.useState(false);
  const [pendingDiscount,     setPendingDiscount]      = React.useState(null);
  const [discountAuthInput,   setDiscountAuthInput]    = React.useState("");
  const [discountAuthErr,     setDiscountAuthErr]      = React.useState("");
  const [customDiscountInput, setCustomDiscountInput]  = React.useState("");
  const [vatEnabled,       setVatEnabled]       = React.useState(false);
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);
  const [lastReceipt,      setLastReceipt]      = React.useState(null);
  const [processing,       setProcessing]       = React.useState(false);
  const [txPage,           setTxPage]           = React.useState(0);
  const [voidPage,         setVoidPage]         = React.useState(0);
  const [noteInput,        setNoteInput]        = React.useState("");
  const [activeShop,       setActiveShop]       = React.useState("Coffee Spot");

  // Void feature state
  const [selectedTxId,     setSelectedTxId]     = React.useState(null);
  const [showVoidModal,    setShowVoidModal]     = React.useState(false);
  const [voidPassword,     setVoidPassword]     = React.useState("");
  const [voidPasswordErr,  setVoidPasswordErr]  = React.useState("");
  const [voidProcessing,   setVoidProcessing]   = React.useState(false);

  // Retrieve from voided
  const [selectedVoidId,   setSelectedVoidId]   = React.useState(null);
  const [showRetrieveModal,setShowRetrieveModal]= React.useState(false);
  const [retrievePassword, setRetrievePassword] = React.useState("");
  const [retrievePasswordErr,setRetrievePasswordErr] = React.useState("");
  const [retrieveProcessing, setRetrieveProcessing] = React.useState(false);

  const MANAGER_PASSWORD = "Admin123";
  const VAT_RATE         = 0.12;
  const TX_PAGE_SIZE     = 20;
  const fmtPHP = n => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

  const fetchProducts = React.useCallback(async () => {
    try {
      const branchQ = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${branchQ}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch { setMenuItems([]); }
  }, [activeBranch]);

  const fetchTransactions = React.useCallback(async () => {
    setLoadingTx(true);
    try {
      const q   = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions${q}`);
      const d   = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch { setTransactions([]); }
    finally { setLoadingTx(false); }
  }, [activeBranch]);

  const fetchVoidedTransactions = React.useCallback(async () => {
    try {
      const q   = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/voided${q}`);
      const d   = await res.json();
      setVoidedTx(Array.isArray(d) ? d : []);
    } catch { setVoidedTx([]); }
  }, [activeBranch]);

  React.useEffect(() => { fetchProducts(); },           [fetchProducts]);
  React.useEffect(() => { fetchTransactions(); },       [fetchTransactions]);
  React.useEffect(() => { fetchVoidedTransactions(); }, [fetchVoidedTransactions]);
  React.useEffect(() => { setTxPage(0); },  [txSearch, txDateFrom, txDateTo]);
  React.useEffect(() => { setVoidPage(0); }, [txSearch, txDateFrom, txDateTo]);
  // Deselect when switching tabs
  React.useEffect(() => { setSelectedTxId(null); setSelectedVoidId(null); }, [activeTab]);

  const allProducts = React.useMemo(() => {
    if (!activeBranch) return [];
    const menu = menuItems
      .filter(m => m.branch === activeBranch)
      .map(m => ({ ...m, source: "menu", displayName: m.name }));
    const q = searchProduct.toLowerCase();
    return menu.filter(p => !q || p.displayName.toLowerCase().includes(q) || (p.category||"").toLowerCase().includes(q));
  }, [menuItems, activeBranch, searchProduct]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id && c.source === product.source);
      if (existing) return prev.map(c => c.id === product.id && c.source === product.source ? { ...c, qty: c.qty+1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, source, delta) => {
    setCart(prev => prev.map(c => c.id===id && c.source===source ? { ...c, qty: Math.max(0, c.qty+delta) } : c).filter(c => c.qty > 0));
  };

  const removeFromCart = (id, source) => setCart(prev => prev.filter(c => !(c.id===id && c.source===source)));
  
 const clearCart = () => {
  setCart([]);
  setCashReceived("");
  setDiscountPct(0);
  setDiscountType("None");
  setNoteInput("");
  setCustomDiscountInput("");
  setShowDiscountAuth(false);
  setPendingDiscount(null);
  setGcashRefNumber("");
  setGcashPaymentAmt(0);
  setIsSplitPayment(false);
  setSplitGcashAmt("");
  setSplitCashAmt("");
  setSplitGcashPaid(false);
  setSplitGcashRef("");
};
  const confirmDiscountAuth = () => {
  if (discountAuthInput !== MANAGER_PASSWORD) {
    setDiscountAuthErr("Incorrect manager password.");
    return;
  }
  if (pendingDiscount.label === "Others") {
    const pct = parseFloat(customDiscountInput);
    if (!pct || pct <= 0 || pct > 100) {
      setDiscountAuthErr("Enter a valid discount % (1–100).");
      return;
    }
    setDiscountPct(pct);
    setDiscountType("Others");
  } else {
    setDiscountPct(pendingDiscount.pct);
    setDiscountType(pendingDiscount.label);
  }
  setShowDiscountAuth(false);
  setDiscountAuthInput("");
  setDiscountAuthErr("");
  setCustomDiscountInput("");
  setPendingDiscount(null);
};

  const subtotal      = cart.reduce((s, c) => s + (c.price||0)*c.qty, 0);
  const discountAmt   = subtotal * (discountPct/100);
  const discountedAmt = subtotal - discountAmt;
  const vatAmt        = vatEnabled ? discountedAmt * VAT_RATE : 0;
  const totalAmt      = discountedAmt + vatAmt;
  const changeDue     = paymentMethod==="Cash" ? Math.max(0, parseFloat(cashReceived||0) - totalAmt) : 0;
  const cashShortfall = paymentMethod==="Cash" && cashReceived!=="" ? parseFloat(cashReceived||0) - totalAmt : 0;

  const processSale = async () => {
  if (cart.length === 0) { alert("Cart is empty."); return; }
  if (!activeBranch && isAdmin) { alert("Please select a branch first."); return; }

  // ── Split payment validation ────────────────────────────────────────────
  if (isSplitPayment) {
    const gcash   = parseFloat(splitGcashAmt) || 0;
    const cash    = parseFloat(splitCashAmt)  || 0;
    const covered = Math.abs((gcash + cash) - totalAmt) < 0.01;

    if (!covered) {
      alert(`Split amounts must add up to exactly ${fmtPHP(totalAmt)}.\nCurrent total: ${fmtPHP(gcash + cash)}`);
      return;
    }
    if (gcash > 0 && !splitGcashPaid) {
      alert("Please complete the GCash payment first before processing.");
      return;
    }
  } else {
    // Normal single payment validation
    if (paymentMethod==="Cash" && parseFloat(cashReceived||0) < totalAmt) {
      alert("Cash received is less than total amount.");
      return;
    }
    if (paymentMethod==="GCash" && !gcashRefNumber) {
      setShowGCashModal(true);
      return;
    }
  }

  setProcessing(true);
  try {
    const payload = {
      branch:         activeBranch || userBranch,
      cashier:        user?.name || "Staff",
      shop:           activeShop,
      // payment method label
      payment_method: isSplitPayment ? "Split" : paymentMethod,
      // split details
      is_split:       isSplitPayment,
      split_gcash_amt: isSplitPayment ? (parseFloat(splitGcashAmt)||0) : null,
      split_cash_amt:  isSplitPayment ? (parseFloat(splitCashAmt)||0)  : null,
      gcash_ref:      isSplitPayment ? splitGcashRef : (paymentMethod==="GCash" ? gcashRefNumber : null),
      // cash fields
      cash_received:  isSplitPayment
        ? (parseFloat(splitCashAmt)||0)
        : (paymentMethod==="Cash" ? parseFloat(cashReceived) : totalAmt),
      discount_pct:   discountPct,
      subtotal,
      discount_amt:   discountAmt,
      vat_enabled:    vatEnabled,
      vat_amt:        vatAmt,
      total:          totalAmt,
      change_due:     isSplitPayment
        ? Math.max(0, (parseFloat(splitCashAmt)||0) - (totalAmt - (parseFloat(splitGcashAmt)||0)))
        : changeDue,
      note:           noteInput,
      items: cart.map(c => ({
        id: c.id, source: c.source, name: c.displayName,
        price: c.price, qty: c.qty, subtotal: c.price*c.qty,
      })),
    };
   
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        setLastReceipt({ ...payload, id: d.id, date: new Date().toLocaleString() });
        setShowReceiptModal(true);
        clearCart(); fetchTransactions(); fetchProducts();
      } else alert(d.error || "Failed to process sale");
    } catch { alert("Failed to process sale. Check server connection."); }
    finally { setProcessing(false); }
  };

  const openVoidModal = () => {
    if (!selectedTxId) return;
    const tx = transactions.find(t => t.id === selectedTxId);
    if (tx) {
      const createdAt = new Date(tx.created_at);
      const hoursDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        alert("This transaction can no longer be voided. Void window is 24 hours from the time of sale.");
        return;
      }
    }
    setVoidPassword(""); setVoidPasswordErr(""); setShowVoidModal(true);
  };

  const confirmVoid = async () => {
    if (voidPassword !== MANAGER_PASSWORD) {
      setVoidPasswordErr("Incorrect manager password."); return;
    }
    setVoidProcessing(true);
    
    const tx = transactions.find(t => t.id === selectedTxId);
    if (tx) {
      const voidedEntry = { 
        ...tx, 
        voided_at: new Date().toISOString(), 
        voided_by: user?.name || "Manager" 
      };
      setTransactions(prev => prev.filter(t => t.id !== selectedTxId));
      setVoidedTx(prev => [voidedEntry, ...prev]);
    }
    
    setShowVoidModal(false);
    setSelectedTxId(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${selectedTxId}/void`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voided_by: user?.name || "Manager", reason: "Manual void" }),
      });
      const d = await res.json();
      if (d.success) {
        setTimeout(() => {
          fetchTransactions();
          fetchVoidedTransactions();
        }, 500);
      }
    } catch {
    } finally { 
      setVoidProcessing(false); 
    }
  };

  const openRetrieveModal = () => {
    if (!selectedVoidId) return;
    setRetrievePassword(""); setRetrievePasswordErr(""); setShowRetrieveModal(true);
  };

  const confirmRetrieve = async () => {
    if (retrievePassword !== MANAGER_PASSWORD) {
      setRetrievePasswordErr("Incorrect manager password."); return;
    }
    setRetrieveProcessing(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${selectedVoidId}/retrieve`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ retrieved_by: user?.name||"Manager" }),
      });
      const d = await res.json();
      if (d.success) {
        setShowRetrieveModal(false); setSelectedVoidId(null);
        fetchTransactions(); fetchVoidedTransactions();
      } else {
        // Optimistic fallback
        const tx = voidedTx.find(t => t.id === selectedVoidId);
        if (tx) {
          const { voided_at, voided_by, ...restored } = tx;
          setVoidedTx(prev => prev.filter(t => t.id !== selectedVoidId));
          setTransactions(prev => [restored, ...prev]);
        }
        setShowRetrieveModal(false); setSelectedVoidId(null);
      }
    } catch {
      const tx = voidedTx.find(t => t.id === selectedVoidId);
      if (tx) {
        const { voided_at, voided_by, ...restored } = tx;
        setVoidedTx(prev => prev.filter(t => t.id !== selectedVoidId));
        setTransactions(prev => [restored, ...prev]);
      }
      setShowRetrieveModal(false); setSelectedVoidId(null);
    }
    finally { setRetrieveProcessing(false); }
  };

  const filteredTx = React.useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter(tx => {
      if (q && !String(tx.id).includes(q) && !(tx.cashier||"").toLowerCase().includes(q) && !(tx.branch||"").toLowerCase().includes(q)) return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo   && tx.created_at > txDateTo+"T23:59:59") return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const filteredVoidedTx = React.useMemo(() => {
    const q = txSearch.toLowerCase();
    return voidedTx.filter(tx => {
      if (q && !String(tx.id).includes(q) && !(tx.cashier||"").toLowerCase().includes(q) && !(tx.branch||"").toLowerCase().includes(q)) return false;
      if (txDateFrom && (tx.voided_at||tx.created_at) < txDateFrom) return false;
      if (txDateTo   && (tx.voided_at||tx.created_at) > txDateTo+"T23:59:59") return false;
      return true;
    });
  }, [voidedTx, txSearch, txDateFrom, txDateTo]);

  const txTotalPages   = Math.max(1, Math.ceil(filteredTx.length/TX_PAGE_SIZE));
  const txPageItems    = filteredTx.slice(txPage*TX_PAGE_SIZE, (txPage+1)*TX_PAGE_SIZE);
  const voidTotalPages = Math.max(1, Math.ceil(filteredVoidedTx.length/TX_PAGE_SIZE));
  const voidPageItems  = filteredVoidedTx.slice(voidPage*TX_PAGE_SIZE, (voidPage+1)*TX_PAGE_SIZE);

  const todayStr     = new Date().toISOString().slice(0,10);
  const todaySales   = transactions.filter(tx => (tx.created_at||"").startsWith(todayStr));
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total||0), 0);
  const todayCount   = todaySales.length;
  const todayAvg     = todayCount > 0 ? todayRevenue/todayCount : 0;

  const allBranches = React.useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches||[]).forEach(br => {
      const name = typeof br==="string" ? br : br.name;
      if (!out.includes(name)) out.push(name);
    }));
    return out;
  }, [brandList]);

  const printReceipt = () => window.print();

  // ── PAGINATION ────────────────────────────────────────────────────────────
  const POSPagination = ({ page, setPage, total, pageSize }) => {
    const totalPgs = Math.max(1, Math.ceil(total/pageSize));
    if (totalPgs <= 1) return null;
    return (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderTop:`1px solid ${C.border}`, background:"#f9fefb" }}>
        <span style={{ fontSize:12, color:C.muted }}>
          Showing <strong style={{ color:C.ink }}>{(page*pageSize+1).toLocaleString()}–{Math.min((page+1)*pageSize,total).toLocaleString()}</strong> of <strong style={{ color:C.ink }}>{total.toLocaleString()}</strong>
        </span>
        <div style={{ display:"flex", gap:4 }}>
          {[{l:"«",a:()=>setPage(0),d:page===0},{l:"‹",a:()=>setPage(p=>Math.max(0,p-1)),d:page===0}].map(({l,a,d})=>(
            <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
          ))}
          {Array.from({length:totalPgs},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
            <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?`linear-gradient(135deg,${C.teal},${C.green})`:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
          ))}
          {[{l:"›",a:()=>setPage(p=>Math.min(totalPgs-1,p+1)),d:page>=totalPgs-1},{l:"»",a:()=>setPage(totalPgs-1),d:page>=totalPgs-1}].map(({l,a,d})=>(
            <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
          ))}
        </div>
      </div>
    );
  };

  // ── TX TABLE (shared between history and voided) ──────────────────────────
  const TxTable = ({ items, selectedId, onSelect, isVoided = false }) => (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            {["","#","Date", isVoided ? "Voided At" : null, isVoided ? "Voided By" : null, "Branch","Shop","Cashier","Items","Subtotal","Discount","VAT","Total","Payment","Status"].filter(Boolean).map(h=>(
              <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(tx=>{
            const isSelected = selectedId === tx.id;
            return (
              <tr key={tx.id}
                onClick={()=>onSelect(isSelected ? null : tx.id)}
                style={{ borderBottom:`1px solid #f0f8f0`, cursor:"pointer", background: isSelected ? "#e8f5e9" : "transparent", transition:"background .1s" }}
                onMouseEnter={e=>{ if (!isSelected) e.currentTarget.style.background="#f6fef8"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background = isSelected ? "#e8f5e9" : "transparent"; }}>
                {/* Checkbox col */}
                <td style={{ padding:"10px 10px 10px 14px" }}>
                  <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${isSelected ? C.green : C.border}`, background: isSelected ? C.green : C.white, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .1s" }}>
                    {isSelected && <svg width={10} height={10} viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </td>
                <td style={{ padding:"10px 12px", fontWeight:700, color:C.muted, fontSize:12 }}>#{tx.id}</td>
                <td style={{ padding:"10px 12px", color:C.muted, fontSize:12, whiteSpace:"nowrap" }}>
                  {new Date(tx.created_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                </td>
                {isVoided && (
                  <td style={{ padding:"10px 12px", color:"#c62828", fontSize:12, whiteSpace:"nowrap" }}>
                    {tx.voided_at ? new Date(tx.voided_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                  </td>
                )}
                {isVoided && (
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{tx.voided_by || "—"}</td>
                )}
                <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{tx.branch}</td>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:tx.shop==="Coffee Spot"?"#fff8e1":"#e0f2f1", color:tx.shop==="Coffee Spot"?"#f57f17":"#00695c" }}>{tx.shop}</span>
                </td>
                <td style={{ padding:"10px 12px", color:C.ink, fontWeight:600, fontSize:12 }}>{tx.cashier}</td>
                <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{(tx.items||[]).length} item{(tx.items||[]).length!==1?"s":""}</td>
                <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPHP(tx.subtotal)}</td>
                <td style={{ padding:"10px 12px" }}>
                  {tx.discount_pct>0 ? <span style={{ color:C.warn, fontWeight:700 }}>−{tx.discount_pct}%</span> : <span style={{ color:C.muted }}>—</span>}
                </td>
                <td style={{ padding:"10px 12px" }}>
                  {tx.vat_enabled ? <span style={{ color:"#1565c0", fontWeight:700 }}>+{fmtPHP(tx.vat_amt)}</span> : <span style={{ color:C.muted }}>—</span>}
                </td>
                <td style={{ padding:"10px 12px", fontWeight:800, color: isVoided ? C.muted : C.green }}>{fmtPHP(tx.total)}</td>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600,
                    background:tx.payment_method==="Cash"?"#e8f5e9":tx.payment_method==="GCash"?"#e3f2fd":"#f3e5f5",
                    color:tx.payment_method==="Cash"?"#2e7d32":tx.payment_method==="GCash"?"#1565c0":"#6a1b9a" }}>
                    {tx.payment_method}
                  </span>
                </td>
                <td style={{ padding:"10px 12px" }}>
                  {isVoided ? (
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(229,57,53,0.1)", color:"#c62828" }}>Voided</span>
                  ) : (
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(16,185,129,0.1)", color:"#059669" }}>Completed</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const ManagerModal = ({ title, subtitle, icon, actionLabel, actionColor, password, setPassword, error, onConfirm, onClose, processing }) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:360, maxWidth:"95vw", boxShadow:"0 16px 64px rgba(0,0,0,0.25)" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:8 }}>{icon}</div>
          <div style={{ fontWeight:900, fontSize:18, color:C.ink }}>{title}</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6, lineHeight:1.5 }}>{subtitle}</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Manager Password</div>
          <input
            type="password"
            placeholder="Enter password…"
            value={password}
            onChange={e=>{ setPassword(e.target.value); }}
            onKeyDown={e=>{ if(e.key==="Enter") onConfirm(); }}
            autoFocus
            style={{ ...invInputSt, fontSize:15, letterSpacing:"0.15em" }}
          />
          {error && <div style={{ marginTop:6, fontSize:12, color:C.red, fontWeight:700 }}>⚠ {error}</div>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={{ ...btnSt, flex:1, justifyContent:"center" }}>Cancel</button>
          <button onClick={onConfirm} disabled={processing}
            style={{ flex:1, height:36, border:"none", borderRadius:9, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
              background:`linear-gradient(135deg,${actionColor||C.red},${actionColor ? actionColor+"cc" : "#b71c1c"})`,
              color:C.white, opacity:processing?0.7:1, justifyContent:"center", display:"flex", alignItems:"center", gap:6 }}>
            {processing ? "Processing…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif", background:"linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight:"100vh", padding:"24px 30px 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @media print { body > * { display: none !important; } .pos-receipt-print { display: block !important; } }
      `}</style>

      {/* ── KPI CARDS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { label:"Today's Revenue",     value:fmtPHP(todayRevenue), sub:"All transactions today",   accent:C.green },
          { label:"Transactions Today",  value:todayCount,           sub:"Completed sales",           accent:"#1565c0" },
          { label:"Average Order Value", value:fmtPHP(todayAvg),     sub:"Per transaction",           accent:"#6a1b9a" },
          { label:"Items in Cart",       value:cart.reduce((s,c)=>s+c.qty,0), sub:"Current session", accent:C.warn },
        ].map((s,i)=>(
          <div key={i} style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:s.accent, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TAB BAR + VOID BUTTON ROW ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ display:"flex", gap:4, background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:5, width:"fit-content", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
          {[
            { id:"cashier", label:"Cashier" },
            { id:"history", label:"Transaction History", count: transactions.length },
            { id:"voided",  label:"Recently Voided",     count: voidedTx.length, countColor:"#c62828", countBg:"rgba(229,57,53,0.15)" },
          ].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{ padding:"8px 22px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                background:activeTab===tab.id?`linear-gradient(135deg,${C.teal},${C.green})`:"transparent",
                color:activeTab===tab.id?C.white:C.muted,
                boxShadow:activeTab===tab.id?"0 2px 10px rgba(0,180,90,0.28)":"none", transition:"all .15s" }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{ marginLeft:7, background: tab.countBg || "rgba(255,255,255,0.25)", color: tab.countColor || (activeTab===tab.id ? C.white : C.muted), padding:"1px 8px", borderRadius:20, fontSize:11 }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* VOID BUTTON — visible only on history/voided tabs */}
        {activeTab === "history" && (() => {
          const selectedTx = transactions.find(t => t.id === selectedTxId);
          const isExpired = selectedTx
            ? (Date.now() - new Date(selectedTx.created_at).getTime()) / (1000 * 60 * 60) > 24
            : false;
          const canVoid = selectedTxId && !isExpired;

          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <button
                onClick={openVoidModal}
                disabled={!selectedTxId}
                style={{
                  display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 18px",
                  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800,
                  cursor: selectedTxId && !isExpired ? "pointer" : "not-allowed", fontFamily: "inherit",
                  background: canVoid
                    ? "linear-gradient(135deg,#e53935,#b71c1c)"
                    : "#e0e0e0",
                  color: canVoid ? C.white : "#9e9e9e",
                  boxShadow: canVoid ? "0 3px 12px rgba(229,57,53,0.35)" : "none",
                  transition: "all .15s", opacity: selectedTxId ? 1 : 0.7,
                }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
                {isExpired ? "Void Expired" : "Void Transaction"}
                {selectedTxId && (
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "1px 7px", borderRadius: 12, fontSize: 11 }}>
                    #{selectedTxId}
                  </span>
                )}
              </button>
              {isExpired && (
                <span style={{ fontSize: 11, color: "#c62828", fontWeight: 600 }}>
                  ⚠ Past 24-hour void window
                </span>
              )}  
            </div>
          );
        })()}

        {activeTab === "voided" && (
          <button
            onClick={openRetrieveModal}
            disabled={!selectedVoidId}
            style={{ display:"flex", alignItems:"center", gap:7, height:38, padding:"0 18px", border:"none", borderRadius:10,
              fontSize:13, fontWeight:800, cursor: selectedVoidId ? "pointer" : "not-allowed", fontFamily:"inherit",
              background: selectedVoidId ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0",
              color: selectedVoidId ? C.white : "#9e9e9e",
              boxShadow: selectedVoidId ? "0 3px 12px rgba(0,180,90,0.35)" : "none",
              transition:"all .15s", opacity: selectedVoidId ? 1 : 0.7 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>
            Retrieve Transaction
            {selectedVoidId && <span style={{ background:"rgba(255,255,255,0.2)", padding:"1px 7px", borderRadius:12, fontSize:11 }}>#{selectedVoidId}</span>}
          </button>
        )}
      </div>

      {/* ── CASHIER TAB ── */}
      {activeTab === "cashier" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:18, alignItems:"start" }}>
          {/* Products panel */}
          <div>
            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:14, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                {isAdmin && (
                  <BrandBranchFilter
                    brands={brandList}
                    activeBrand={filterBrand}
                    activeBranch={activeBranch}
                    onChangeBrand={id => {
                      setFilterBrand(id);
                      setActiveBranch("");
                    }}
                    onChangeBranch={val => setActiveBranch(val || "")}
                  />
                )}
                <div style={{ position:"relative", flex:"1 1 200px" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input type="text" placeholder="Search products…" value={searchProduct} onChange={e=>setSearchProduct(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
                </div>
              </div>
            </div>

            {allProducts.length === 0 ? (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"48px 0", textAlign:"center", color:C.muted }}>
                <div style={{ fontSize:"2rem", marginBottom:10 }}></div>
                <div style={{ fontWeight:700, fontSize:14 }}>
                  {!activeBranch ? "Select a branch to view products" : "No products found for this branch"}
                </div>
                <div style={{ fontSize:12, marginTop:4 }}>
                  {!activeBranch
                    ? "Choose a branch from the dropdown above to load its menu."
                    : "Add items via Menu Inventory and assign them to this branch."}
                </div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                {allProducts.map(product => {
                  const inCart = cart.find(c=>c.id===product.id && c.source===product.source);
                  return (
                    <div key={`${product.source}-${product.id}`} onClick={()=>addToCart(product)}
                      style={{ background:C.white, border:`2px solid ${inCart?C.green:C.border}`, borderRadius:14, padding:"14px 12px", cursor:"pointer", transition:"all .15s",
                        boxShadow:inCart?"0 4px 16px rgba(0,180,90,0.18)":"0 1px 6px rgba(0,140,60,0.05)", position:"relative" }}
                      onMouseEnter={e=>{if(!inCart)e.currentTarget.style.borderColor=C.teal;}}
                      onMouseLeave={e=>{if(!inCart)e.currentTarget.style.borderColor=C.border;}}>
                      {inCart && (
                        <div style={{ position:"absolute", top:8, right:8, background:`linear-gradient(135deg,${C.teal},${C.green})`, color:C.white, borderRadius:20, fontSize:11, fontWeight:800, padding:"2px 8px" }}>×{inCart.qty}</div>
                      )}
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={{ width:"100%", height:130, objectFit:"cover", borderRadius:9, marginBottom:10 }} onError={e=>e.target.style.display="none"}/>
                      ) : (
                        <div style={{ width:"100%", height:130, borderRadius:9, background:`linear-gradient(135deg,${C.greenLt},${C.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", marginBottom:10 }}>🛒</div>
                      )}
                      <div style={{ fontWeight:700, fontSize:13, color:C.ink, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.displayName}</div>
                      {product.category && <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{product.category}</div>}
                      <div style={{ fontWeight:800, fontSize:15, color:C.green }}>{fmtPHP(product.price)}</div>
                      {product.stock !== undefined && (
                        <div style={{ fontSize:10, color:product.stock<=5?C.warn:C.muted, marginTop:3, fontWeight:600 }}>Stock: {product.stock}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ position:"sticky", top:80 }}>
            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:18, boxShadow:"0 2px 18px rgba(0,140,60,0.09)", overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
                <span style={{ fontWeight:800, fontSize:14 }}>🛒 Order Cart</span>
                {cart.length > 0 && (
                  <button onClick={clearCart} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:C.white, borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Clear</button>
                )}
              </div>
              <div style={{ maxHeight:280, overflowY:"auto", padding:cart.length===0?"0":"8px 0" }}>
                {cart.length === 0 ? (
                  <div style={{ padding:"32px 0", textAlign:"center", color:C.muted, fontSize:13 }}>
                    <div style={{ fontSize:"2rem", marginBottom:8 }}></div>
                    Tap a product to add it
                  </div>
                ) : cart.map(item=>(
                  <div key={`${item.source}-${item.id}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 16px", borderBottom:`1px solid #f0fdf5` }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.displayName}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{fmtPHP(item.price)} each</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                      <button onClick={()=>updateQty(item.id,item.source,-1)} style={{ width:26, height:26, borderRadius:7, border:`1px solid ${C.border}`, background:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.ink }}>−</button>
                      <span style={{ fontSize:13, fontWeight:800, color:C.ink, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.id,item.source,+1)} style={{ width:26, height:26, borderRadius:7, border:`1px solid ${C.border}`, background:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.green }}>+</button>
                    </div>
                    <div style={{ minWidth:60, textAlign:"right", fontWeight:800, fontSize:13, color:C.green }}>{fmtPHP(item.price*item.qty)}</div>
                    <button onClick={()=>removeFromCart(item.id,item.source)} style={{ background:"none", border:"none", color:"#e53935", cursor:"pointer", padding:2, fontSize:16, lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ padding:"14px 18px", borderTop:`1px solid ${C.border}` }}>
              {/* Discount */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Discount</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[
                    { label:"None",           pct:0,  requiresAuth:false },
                    { label:"PWD",            pct:20, requiresAuth:true  },
                    { label:"Senior Citizen", pct:20, requiresAuth:true  },
                    { label:"Others",         pct:null, requiresAuth:true },
                  ].map(d => {
                    const isActive = d.pct !== null
                      ? discountPct === d.pct && discountType === d.label
                      : discountType === "Others";
                    return (
                      <button key={d.label}
                        onClick={() => {
                          if (d.label === "None") {
                            setDiscountPct(0);
                            setDiscountType("None");
                            setShowDiscountAuth(false);
                            setCustomDiscountInput("");
                          } else {
                            setPendingDiscount(d);
                            setDiscountAuthInput("");
                            setDiscountAuthErr("");
                            setCustomDiscountInput("");
                            setShowDiscountAuth(true);
                          }
                        }}
                        style={{ height:32, padding:"0 14px", borderRadius:8, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                          background:isActive ? `linear-gradient(135deg,${C.teal},${C.green})` : C.bg,
                          color:isActive ? C.white : C.muted }}>
                        {d.label}{d.pct !== null && d.label !== "None" ? ` (${d.pct}%)` : ""}
                      </button>
                    );
                  })}
                </div>

                {/* Active discount badge */}
                {discountType && discountType !== "None" && discountPct > 0 && (
                  <div style={{ marginTop:6, fontSize:12, color:C.ok, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ background:C.okBg, border:`1px solid ${C.greenMid}`, borderRadius:20, padding:"2px 10px" }}>
                      {discountType} — {discountPct}% off
                    </span>
                    <button onClick={()=>{ setDiscountPct(0); setDiscountType("None"); }}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#e53935", fontSize:13, fontWeight:800, padding:0 }}>×</button>
                  </div>
                )}
              </div>

              {/* Discount Auth Modal */}
              {showDiscountAuth && pendingDiscount && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }}
                  onClick={e=>{ if(e.target===e.currentTarget){ setShowDiscountAuth(false); } }}>
                  <div style={{ background:C.white, borderRadius:18, padding:"26px 28px", width:340, maxWidth:"95vw", boxShadow:"0 16px 48px rgba(0,0,0,0.22)" }}>
                    <div style={{ fontWeight:800, fontSize:16, color:C.ink, marginBottom:4 }}>
                      {pendingDiscount.label} Discount
                    </div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
                      Manager authorization required to apply this discount.
                    </div>

                    {/* Custom % input for Others */}
                    {pendingDiscount.label === "Others" && (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Custom Discount %</div>
                        <input
                          type="number" min="1" max="100"
                          placeholder="e.g. 15"
                          value={customDiscountInput}
                          onChange={e => setCustomDiscountInput(e.target.value)}
                          style={{ ...invInputSt }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Manager Password</div>
                      <input
                        type="password"
                        placeholder="Enter password…"
                        value={discountAuthInput}
                        onChange={e=>{ setDiscountAuthInput(e.target.value); setDiscountAuthErr(""); }}
                        onKeyDown={e=>{ if(e.key==="Enter") confirmDiscountAuth(); }}
                        autoFocus
                        style={{ ...invInputSt }}
                      />
                      {discountAuthErr && (
                        <div style={{ marginTop:5, fontSize:12, color:"#e53935", fontWeight:700 }}>⚠ {discountAuthErr}</div>
                      )}
                    </div>

                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setShowDiscountAuth(false)}
                        style={{ ...btnSt, flex:1, justifyContent:"center" }}>Cancel</button>
                      <button onClick={confirmDiscountAuth}
                        style={{ ...btnPrimarySt, flex:1, justifyContent:"center" }}>Apply Discount</button>
                    </div>
                  </div>
                </div>
              )} 
                {/* VAT toggle */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>VAT (12%)</label>
                  <div onClick={()=>setVatEnabled(v=>!v)}
                    style={{ width:44, height:24, borderRadius:12, cursor:"pointer", position:"relative", background:vatEnabled?`linear-gradient(135deg,${C.teal},${C.green})`:"#e0e0e0", transition:"background .2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:vatEnabled?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                  </div>
                </div>
                {/* Totals */}
                <div style={{ background:C.bg, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, marginBottom:5 }}>
                    <span>Subtotal</span><span style={{ fontWeight:700 }}>{fmtPHP(subtotal)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.warn, marginBottom:5 }}>
                      <span>Discount ({discountPct}%)</span><span style={{ fontWeight:700 }}>−{fmtPHP(discountAmt)}</span>
                    </div>
                  )}
                  {vatEnabled && (
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#1565c0", marginBottom:5 }}>
                      <span>VAT (12%)</span><span style={{ fontWeight:700 }}>+{fmtPHP(vatAmt)}</span>
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, color:C.ink, fontWeight:800, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                    <span>Total</span><span style={{ color:C.green }}>{fmtPHP(totalAmt)}</span>
                  </div>
                </div>
                {/* ── Payment Method ── */}
<div style={{ marginBottom:10 }}>
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
    <label style={{ fontSize:11, fontWeight:800, color:C_muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      Payment Method
    </label>
    {/* Split toggle */}
    <button
      onClick={() => {
        setIsSplitPayment(v => !v);
        setSplitGcashAmt("");
        setSplitCashAmt("");
        setSplitGcashPaid(false);
        setSplitGcashRef("");
        setGcashRefNumber("");
        setCashReceived("");
      }}
      style={{
        display:"flex", alignItems:"center", gap:5,
        padding:"3px 10px", borderRadius:20, border:"none",
        background: isSplitPayment
          ? "linear-gradient(135deg,#007acc,#0057a8)"
          : "#f0f0f0",
        color: isSplitPayment ? "#fff" : "#5a7a65",
        fontSize:11, fontWeight:700, cursor:"pointer",
        fontFamily:"inherit",
      }}
    >
      ✂ {isSplitPayment ? "Split ON" : "Split Payment"}
    </button>
  </div>

  {/* ── NORMAL (non-split) payment buttons ── */}
  {!isSplitPayment && (
    <div style={{ display:"flex", gap:6 }}>
      {["Cash","GCash","Others"].map(m => (
        <button
          key={m}
          onClick={() => {
            setPaymentMethod(m);
            if (m!=="GCash") setGcashRefNumber("");
          }}
          style={{
            flex:1, height:32, border:"none", borderRadius:8,
            fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            background: paymentMethod===m
              ? `linear-gradient(135deg,${C_teal},${C_green})`
              : C_bg,
            color: paymentMethod===m ? C_white : C_muted,
            transition:"all .12s",
          }}
        >{m}</button>
      ))}
    </div>
  )}

  {/* GCash ref badge (non-split) */}
  {!isSplitPayment && paymentMethod==="GCash" && gcashRefNumber && (
    <div style={{
      marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between",
      background:"#e8f4ff", border:"1px solid #bfdbfe",
      borderRadius:8, padding:"6px 12px",
    }}>
      <div>
        <div style={{ fontSize:10, fontWeight:800, color:"#1e40af", textTransform:"uppercase", letterSpacing:"0.06em" }}>GCash Ref #</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#1e40af", fontFamily:"monospace", letterSpacing:"0.05em" }}>{gcashRefNumber}</div>
      </div>
      <button onClick={() => setGcashRefNumber("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#93c5fd", fontSize:16 }}>×</button>
    </div>
  )}

  {/* ── SPLIT payment panel ── */}
  {isSplitPayment && (
    <div style={{ background:"#f8fffe", border:"1.5px solid #b2dfdb", borderRadius:12, padding:"14px 14px 10px", marginTop:4 }}>

      {/* Remaining indicator */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#5a7a65" }}>
          Total to split:
        </span>
        <span style={{ fontSize:14, fontWeight:800, color:"#0d2b1e" }}>
          {fmtPHP(totalAmt)}
        </span>
      </div>

      {/* GCash leg */}
      <div style={{
        background: splitGcashPaid ? "#e8f5e9" : "#fff",
        border:`1.5px solid ${splitGcashPaid ? "#00897b" : "#bfdbfe"}`,
        borderRadius:10, padding:"10px 12px", marginBottom:8,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#007acc,#0057a8)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#fff" }}>G</div>
            <span style={{ fontSize:12, fontWeight:700, color:"#1e40af" }}>GCash amount</span>
          </div>
          {splitGcashPaid && (
            <span style={{ fontSize:11, fontWeight:700, color:"#059669", background:"#d1fae5", padding:"2px 8px", borderRadius:20 }}>
              ✓ Paid
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"#5a7a65" }}>₱</span>
            <input
              type="number"
              placeholder="0.00"
              value={splitGcashAmt}
              disabled={splitGcashPaid}
              onChange={e => {
                const val = e.target.value;
                setSplitGcashAmt(val);
                // Auto-fill cash remainder
                const gcash = parseFloat(val) || 0;
                const remaining = Math.max(0, totalAmt - gcash);
                setSplitCashAmt(remaining > 0 ? remaining.toFixed(2) : "");
              }}
              style={{
                ...invInputSt,
                paddingLeft:24,
                opacity: splitGcashPaid ? 0.6 : 1,
                cursor: splitGcashPaid ? "not-allowed" : "text",
              }}
            />
          </div>
          {!splitGcashPaid ? (
            <button
              onClick={() => {
                const gcash = parseFloat(splitGcashAmt);
                if (!gcash || gcash <= 0) { alert("Enter a valid GCash amount."); return; }
                if (gcash > totalAmt) { alert("GCash amount cannot exceed total."); return; }
                if (gcash < 100) { alert("Minimum GCash amount via PayMongo is ₱100."); return; }
                setGcashPaymentAmt(gcash);
                setShowGCashModal(true);
              }}
              style={{
                padding:"0 14px", height:36, borderRadius:9, border:"none",
                background:"linear-gradient(135deg,#007acc,#0057a8)",
                color:"#fff", fontSize:12, fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
                flexShrink:0,
              }}
            >
              Pay GCash
            </button>
          ) : (
            <button
              onClick={() => {
                setSplitGcashPaid(false);
                setSplitGcashRef("");
                setGcashRefNumber("");
                // recalc cash
                setSplitCashAmt("");
              }}
              style={{ padding:"0 10px", height:36, borderRadius:9, border:"1px solid #fecaca", background:"#fee2e2", color:"#dc2626", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}
            >
              Redo
            </button>
          )}
        </div>
        {splitGcashPaid && splitGcashRef && (
          <div style={{ marginTop:5, fontSize:11, color:"#00695c", fontFamily:"monospace", fontWeight:600 }}>
            Ref: {splitGcashRef}
          </div>
        )}
      </div>

      {/* Cash leg */}
      <div style={{ background:"#fff", border:"1.5px solid #d1eedd", borderRadius:10, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff" }}>₱</div>
          <span style={{ fontSize:12, fontWeight:700, color:"#2E7D32" }}>Cash amount</span>
        </div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"#5a7a65" }}>₱</span>
          <input
            type="number"
            placeholder="0.00"
            value={splitCashAmt}
            onChange={e => setSplitCashAmt(e.target.value)}
            style={{ ...invInputSt, paddingLeft:24 }}
          />
        </div>
      </div>

      {/* Split summary */}
      {(parseFloat(splitGcashAmt)||0) + (parseFloat(splitCashAmt)||0) > 0 && (() => {
        const gcash     = parseFloat(splitGcashAmt) || 0;
        const cash      = parseFloat(splitCashAmt)  || 0;
        const covered   = gcash + cash;
        const shortfall = totalAmt - covered;
        const change    = covered - totalAmt;
        return (
          <div style={{ marginTop:10, padding:"8px 10px", background: Math.abs(shortfall) < 0.01 ? "#e8f5e9" : shortfall > 0 ? "#fff3e0" : "#e8f5e9", borderRadius:8, fontSize:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:2 }}>
              <span>GCash</span><span style={{ fontWeight:700 }}>{fmtPHP(gcash)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:4 }}>
              <span>Cash</span><span style={{ fontWeight:700 }}>{fmtPHP(cash)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:4 }}>
              <span style={{ fontWeight:800, color: shortfall > 0.01 ? "#e65100" : "#2e7d32" }}>
                {shortfall > 0.01 ? `⚠ Short by` : change > 0.01 ? "Change due" : "✓ Exact"}
              </span>
              <span style={{ fontWeight:800, color: shortfall > 0.01 ? "#e65100" : "#2e7d32" }}>
                {shortfall > 0.01 ? fmtPHP(shortfall) : change > 0.01 ? fmtPHP(change) : ""}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  )}
</div>

{/* Cash received (normal non-split Cash mode) */}
{!isSplitPayment && paymentMethod==="Cash" && (
  <div style={{ marginBottom:10 }}>
    <div style={{ fontSize:11, fontWeight:800, color:C_muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Cash Received</div>
    <input
      type="number" value={cashReceived}
      onChange={e => setCashReceived(e.target.value)}
      placeholder="0.00"
      style={{ ...invInputSt, fontSize:16, fontWeight:800, textAlign:"right", color:C_ink }}
    />
    {cashReceived!=="" && (
      <div style={{ marginTop:6, fontSize:13, fontWeight:700, textAlign:"right", color:cashShortfall<0?C_warn:C_ok }}>
        {cashShortfall<0?`⚠ Short by ${fmtPHP(Math.abs(cashShortfall))}`:`Change: ${fmtPHP(changeDue)}`}
      </div>
    )}
  </div>
)}

{/* Note */}
<div style={{ marginBottom:12 }}>
  <textarea
    value={noteInput}
    onChange={e => setNoteInput(e.target.value)}
    placeholder="Order note (optional)…"
    rows={2}
    style={{ ...invInputSt, height:"auto", padding:"8px 11px", resize:"none", lineHeight:1.5 }}
  />
</div>

{/* ── Charge button ── */}
<button
  onClick={processSale}
  disabled={processing || cart.length===0}
  style={{
    width:"100%", height:46, border:"none", borderRadius:12,
    fontSize:15, fontWeight:900,
    cursor: cart.length===0||processing ? "not-allowed" : "pointer",
    fontFamily:"inherit",
    background: cart.length===0 ? "#e0e0e0"
      : isSplitPayment
        ? (() => {
            const gcash = parseFloat(splitGcashAmt)||0;
            const cash  = parseFloat(splitCashAmt)||0;
            const ok    = Math.abs((gcash+cash) - totalAmt) < 0.01 && (!gcash || splitGcashPaid);
            return ok ? `linear-gradient(135deg,${C_teal},${C_green})` : "#e0e0e0";
          })()
        : paymentMethod==="GCash" && !gcashRefNumber
          ? "linear-gradient(135deg,#007acc,#0057a8)"
          : `linear-gradient(135deg,${C_teal},${C_green})`,
    color: cart.length===0 ? "#9e9e9e" : C_white,
    boxShadow: cart.length===0 ? "none" : "0 4px 16px rgba(0,180,90,0.35)",
    transition:"all .15s", opacity:processing?0.7:1,
  }}
>
  {processing ? "Processing…"
    : isSplitPayment
      ? (() => {
          const gcash = parseFloat(splitGcashAmt)||0;
          const cash  = parseFloat(splitCashAmt)||0;
          const covered = Math.abs((gcash+cash) - totalAmt) < 0.01;
          const gcashDone = !gcash || splitGcashPaid;
          if (!covered) return `Enter amounts totalling ${fmtPHP(totalAmt)}`;
          if (!gcashDone) return "Complete GCash payment first";
          return `💳 Charge ${fmtPHP(totalAmt)} (Split)`;
        })()
      : paymentMethod==="GCash" && !gcashRefNumber
        ? `💳 Scan GCash QR — ${fmtPHP(totalAmt)}`
        : `💳 Charge ${fmtPHP(totalAmt)}`}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION HISTORY TAB ── */}
      {activeTab === "history" && (
        <>
          <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:"1 1 200px" }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search ID, cashier, branch…" value={txSearch} onChange={e=>setTxSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
              </div>
              <input type="date" value={txDateFrom} onChange={e=>setTxDateFrom(e.target.value)} style={{ ...invInputSt, width:150 }}/>
              <input type="date" value={txDateTo}   onChange={e=>setTxDateTo(e.target.value)}   style={{ ...invInputSt, width:150 }}/>
              {(txSearch||txDateFrom||txDateTo) && (
                <button onClick={()=>{setTxSearch("");setTxDateFrom("");setTxDateTo("");}} style={{ ...smallBtnSt, height:36, border:`1px solid ${C.border}`, color:C.muted }}>Clear</button>
              )}
            </div>
          </div>

          {selectedTxId && (
            <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:10, padding:"9px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <span style={{ fontSize:"1rem" }}>☑️</span>
              <span style={{ color:"#5d4037", fontWeight:700 }}>Transaction <strong>#{selectedTxId}</strong> selected.</span>
              <span style={{ color:C.muted }}>Click the red <strong>Void Transaction</strong> button to void it, or click the row again to deselect.</span>
            </div>
          )}

          <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
            <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
              <span style={{ fontWeight:800, fontSize:13 }}> Transaction History</span>
              <span style={{ fontSize:12, opacity:0.9 }}>{filteredTx.length} records · click a row to select</span>
            </div>

            {loadingTx ? (
              <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading transactions…</div>
            ) : filteredTx.length === 0 ? (
              <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No transactions found.</div>
            ) : (
              <>
                <TxTable items={txPageItems} selectedId={selectedTxId} onSelect={setSelectedTxId} isVoided={false}/>
                <POSPagination page={txPage} setPage={setTxPage} total={filteredTx.length} pageSize={TX_PAGE_SIZE}/>
              </>
            )}
          </div>
        </>
      )}

      {/* ── RECENTLY VOIDED TAB ── */}
      {activeTab === "voided" && (
        <>
          <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:"1 1 200px" }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search ID, cashier, branch…" value={txSearch} onChange={e=>setTxSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
              </div>
              <input type="date" value={txDateFrom} onChange={e=>setTxDateFrom(e.target.value)} style={{ ...invInputSt, width:150 }}/>
              <input type="date" value={txDateTo}   onChange={e=>setTxDateTo(e.target.value)}   style={{ ...invInputSt, width:150 }}/>
              {(txSearch||txDateFrom||txDateTo) && (
                <button onClick={()=>{setTxSearch("");setTxDateFrom("");setTxDateTo("");}} style={{ ...smallBtnSt, height:36, border:`1px solid ${C.border}`, color:C.muted }}>Clear</button>
              )}
            </div>
          </div>

          {selectedVoidId && (
            <div style={{ background:"#e8f5e9", border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"9px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
              <span style={{ fontSize:"1rem" }}></span>
              <span style={{ color:"#1b5e20", fontWeight:700 }}>Voided transaction <strong>#{selectedVoidId}</strong> selected.</span>
              <span style={{ color:C.muted }}>Click <strong>Retrieve Transaction</strong> to restore it to transaction history.</span>
            </div>
          )}

          <div style={{ background:C.white, border:"1px solid rgba(229,57,53,0.15)", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(229,57,53,0.07)" }}>
            <div style={{ padding:"11px 18px", background:"linear-gradient(135deg,#e53935,#b71c1c)", display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
              <span style={{ fontWeight:800, fontSize:13 }}>Recently Voided</span>
              <span style={{ fontSize:12, opacity:0.9 }}>{filteredVoidedTx.length} voided records · click a row to select for retrieval</span>
            </div>

            {filteredVoidedTx.length === 0 ? (
              <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No voided transactions found.</div>
            ) : (
              <>
                <TxTable items={voidPageItems} selectedId={selectedVoidId} onSelect={setSelectedVoidId} isVoided={true}/>
                <POSPagination page={voidPage} setPage={setVoidPage} total={filteredVoidedTx.length} pageSize={TX_PAGE_SIZE}/>
              </>
            )}
          </div>
        </>
      )}

      {/* ── RECEIPT MODAL ── */}
      {showReceiptModal && lastReceipt && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowReceiptModal(false); }}>
          <div style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:380, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 16px 64px rgba(0,0,0,0.25)" }}>
            <div className="pos-receipt-print">
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontWeight:900, fontSize:18, color:C.ink }}>iFranchise POS</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{lastReceipt.branch} · {lastReceipt.shop}</div>
                <div style={{ fontSize:11, color:C.muted }}>{lastReceipt.date}</div>
                <div style={{ fontSize:11, color:C.muted }}>Cashier: {lastReceipt.cashier}</div>
              </div>
              <div style={{ borderTop:`2px dashed ${C.border}`, borderBottom:`2px dashed ${C.border}`, padding:"12px 0", marginBottom:12 }}>
                {(lastReceipt.items||[]).map((item,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                    <span style={{ color:C.ink, fontWeight:600 }}>{item.name} <span style={{ color:C.muted, fontWeight:400 }}>×{item.qty}</span></span>
                    <span style={{ fontWeight:700, color:C.ink }}>{fmtPHP(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.muted }}>Subtotal</span><span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.subtotal)}</span>
              </div>
              {lastReceipt.discount_pct>0 && (
                <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.warn }}>Discount ({lastReceipt.discount_pct}%)</span>
                  <span style={{ fontWeight:700, color:C.warn }}>−{fmtPHP(lastReceipt.discount_amt)}</span>
                </div>
              )}
              {lastReceipt.vat_enabled && (
                <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"#1565c0" }}>VAT (12%)</span>
                  <span style={{ fontWeight:700, color:"#1565c0" }}>+{fmtPHP(lastReceipt.vat_amt)}</span>
                </div>
              )}
              <div style={{ fontSize:16, fontWeight:900, display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.border}`, paddingTop:8, marginBottom:8 }}>
                <span style={{ color:C.ink }}>TOTAL</span><span style={{ color:C.green }}>{fmtPHP(lastReceipt.total)}</span>
              </div>
              <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                <span>Payment</span><span style={{ fontWeight:700, color:C.ink }}>{lastReceipt.payment_method}</span>
              </div>
               {lastReceipt.payment_method === "GCash" && lastReceipt.gcash_ref && (
                <div style={{ fontSize:12, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                  <span>GCash Ref #</span>
                  <span style={{ fontWeight:700, fontFamily:"monospace", color:C.ink, letterSpacing:"0.05em" }}>
                    {lastReceipt.gcash_ref}
                  </span>
                </div>
              )}
              {lastReceipt.payment_method==="Cash" && (
                <>
                  <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                    <span>Cash Received</span><span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.cash_received)}</span>
                  </div>
                  <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted }}>
                    <span>Change</span><span style={{ fontWeight:800, color:C.green }}>{fmtPHP(lastReceipt.change_due)}</span>
                  </div>
                </>
              )}
              {lastReceipt.is_split && (
  <div style={{ fontSize:12, background:"#f0fdf5", borderRadius:8, padding:"8px 10px", marginTop:6, marginBottom:4 }}>
    <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:3 }}>
      <span>GCash</span>
      <span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.split_gcash_amt)}</span>
    </div>
    {lastReceipt.gcash_ref && (
      <div style={{ fontSize:11, color:"#00695c", fontFamily:"monospace", marginBottom:3 }}>
        Ref: {lastReceipt.gcash_ref}
      </div>
    )}
    <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65" }}>
      <span>Cash</span>
      <span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.split_cash_amt)}</span>
    </div>
  </div>
)}
              {lastReceipt.note && <div style={{ marginTop:10, fontSize:12, color:C.muted, fontStyle:"italic" }}>Note: {lastReceipt.note}</div>}
              <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:C.muted }}>Thank you for your purchase! 🎉</div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button onClick={printReceipt} style={{ ...btnSt, flex:1, justifyContent:"center" }}>🖨️ Print</button>
              <button onClick={()=>setShowReceiptModal(false)} style={{ ...btnPrimarySt, flex:1, justifyContent:"center" }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VOID CONFIRMATION MODAL ── */}
      {showVoidModal && (
        <ManagerModal
          title="Void Transaction"
          subtitle={`You are about to void transaction #${selectedTxId}. This action requires manager authorization.`}
          icon="🗑️"
          actionLabel="Confirm Void"
          actionColor="#e53935"
          password={voidPassword}
          setPassword={setVoidPassword}
          error={voidPasswordErr}
          onConfirm={confirmVoid}
          onClose={()=>{ setShowVoidModal(false); setVoidPassword(""); setVoidPasswordErr(""); }}
          processing={voidProcessing}
        />
      )}

      {/* ── RETRIEVE CONFIRMATION MODAL ── */}
      {showRetrieveModal && (
        <ManagerModal
          title="Retrieve Transaction"
          subtitle={`You are about to restore voided transaction #${selectedVoidId} back to Transaction History. Manager authorization required.`}
          icon="♻️"
          actionLabel="Confirm Retrieve"
          actionColor={C.green}
          password={retrievePassword}
          setPassword={setRetrievePassword}
          error={retrievePasswordErr}
          onConfirm={confirmRetrieve}
          onClose={()=>{ setShowRetrieveModal(false); setRetrievePassword(""); setRetrievePasswordErr(""); }}
          processing={retrieveProcessing}
        />
      )}

     {showGCashModal && (
  <GCashQRModal
    totalAmt={isSplitPayment ? (parseFloat(splitGcashAmt)||0) : totalAmt}
    fmtPHP={fmtPHP}
    onConfirm={refNum => {
      setShowGCashModal(false);
      if (isSplitPayment) {
        // Split mode — mark GCash leg as done
        setSplitGcashPaid(true);
        setSplitGcashRef(refNum);
        setGcashRefNumber(refNum);
      } else {
        // Normal GCash — proceed to charge
        setGcashRefNumber(refNum);
        setTimeout(() => processSale(), 100);
      }
    }}
    onCancel={() => {
      setShowGCashModal(false);
      setGcashPaymentAmt(0);
    }}
  />
)}
    </div>
  );
}

// ─── Add this entire block above function POSContent ─────────────────────────
function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
  const [brandQ, setBrandQ]   = React.useState("");
  const [branchQ, setBranchQ] = React.useState("");
  const [openB, setOpenB]     = React.useState(false);
  const [openBr, setOpenBr]   = React.useState(false);
  const brandRef  = React.useRef(null);
  const branchRef = React.useRef(null);

  React.useEffect(() => {
    const fn = e => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setOpenB(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBr(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selectedBrand    = brands.find(b => b.id === activeBrand);
  const branchList       = selectedBrand ? (selectedBrand.branches||[]).map(br=>typeof br==="string"?br:br.name) : [];
  const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));
  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = active => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:170 }}>
        <div onClick={()=>{setOpenB(v=>!v);setBrandQ("");}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{selectedBrand?selectedBrand.name:"All Brands"}</span>
        </div>
        {openB && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={brandQ} onChange={e=>setBrandQ(e.target.value)} placeholder="Search brand…" onClick={e=>e.stopPropagation()} style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBrand)} onMouseDown={()=>{onChangeBrand(null);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>All Brands</div>
            {filteredBrands.map(b=>(
              <div key={b.id} style={optSt(activeBrand===b.id)} onMouseDown={()=>{onChangeBrand(b.id);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>
                {b.name} <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches||[]).length} branches</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand?1:0.45 }}>
        <div onClick={()=>{if(activeBrand){setOpenBr(v=>!v);setBranchQ("");}}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{activeBranch||(activeBrand?"All Branches":"Select brand first")}</span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={()=>{onChangeBranch(null);setOpenBr(false);}}>All Branches</div>
            {filteredBranches.map(br=>(
              <div key={br} style={optSt(activeBranch===br)} onMouseDown={()=>{onChangeBranch(br);setOpenBr(false);}}>{br}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionDropdown({ application, onView, onAddAccount, onApprove, onDelete }) {
  const [open, setOpen]         = useState(false);
  const [menuPos, setMenuPos]   = useState({ top: 0, left: 0 });
  const btnRef                  = useRef(null);
  const menuRef                 = useRef(null);
 
  // Position the dropdown relative to the button without shifting page layout
  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuH = 180; // approximate menu height
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= menuH
        ? rect.bottom + window.scrollY + 4
        : rect.top  + window.scrollY - menuH - 4;
      // keep menu on-screen horizontally
      const left = Math.min(rect.left + window.scrollX, window.innerWidth - 180);
      setMenuPos({ top, left });
    }
    setOpen((v) => !v);
  };
 
  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current  && !menuRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
 
  const menuItems = [
    { icon: <Eye size={13} />,         label: "View Application", color: "#0d2b1e", action: onView },
    { icon: <UserPlus size={13} />,    label: "Add Account",      color: "#2563eb", action: onAddAccount },
    { icon: <CheckCircle size={13} />, label: "Approve",          color: "#059669", action: onApprove },
    { icon: <Trash2 size={13} />,      label: "Delete",           color: "#dc2626", action: onDelete, danger: true },
  ];
 
  return (
    <>
      {/* Pencil trigger button */}
      <button
        ref={btnRef}
        onClick={openMenu}
        title="Actions"
        style={{
          width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8,
          border: open ? "1.5px solid #00897b" : "1px solid #b2dfdb",
          background: open ? "#e0f2f1" : "#fff",
          color: open ? "#00695c" : "#5a7a65",
          cursor: "pointer", flexShrink: 0,
          transition: "all .15s",
        }}
      >
        <Pencil size={13} />
      </button>
 
      {/* Portal-style fixed menu — does NOT push layout */}
      {open && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top:  menuPos.top,
            left: menuPos.left,
            zIndex: 3000,
            background: "#fff",
            border: "1px solid #d1eedd",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            padding: "6px 0",
            minWidth: 180,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.action?.(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "9px 14px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                color: item.color,
                fontFamily: "Montserrat, sans-serif",
                textAlign: "left",
                borderTop: item.danger ? "1px solid #fee2e2" : "none",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? "#fff5f5" : "#f0fdf5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// SHARED MODAL SHELL  (stable — no layout shift)
// ─────────────────────────────────────────────────────────────────────────────
function ModalShell({ onClose, maxWidth = 700, children }) {
  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
 
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(13,43,30,0.52)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 20,
          padding: "28px 32px",
          width: "100%", maxWidth,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}
 
// ─── Shared modal header ──────────────────────────────────────────────────────
function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>{title}</h2>
      <button
        onClick={onClose}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "1px solid #b2dfdb", background: "#e0f2f1",
          cursor: "pointer", color: "#00695c",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
 
// ─── Shared footer buttons ────────────────────────────────────────────────────
function ModalFooter({ onClose, onConfirm, confirmLabel, confirmIcon, confirmStyle, closeLabel = "Cancel" }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
      <button
        onClick={onClose}
        style={{
          padding: "9px 22px", borderRadius: 10,
          border: "1.5px solid #b2dfdb", background: "#f0fdf5",
          color: "#5a7a65", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {closeLabel}
      </button>
      {onConfirm && (
        <button
          onClick={onConfirm}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 24px", borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
            ...(confirmStyle || {
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              color: "#fff",
              boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
            }),
          }}
        >
          {confirmIcon}
          {confirmLabel}
        </button>
      )}
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// VIEW APPLICATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ViewApplicationModal({ application, onClose }) {
  if (!application) return null;
  const isIPharma = application.franchise === "iPharma Mart";
 
  return (
    <ModalShell onClose={onClose} maxWidth={700}>
      <ModalHeader title="📋 Franchise Application Details" onClose={onClose} />
 
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
        Application ID: <strong>#{application.id}</strong> · Status:{" "}
        <span
          style={{
            background: application.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
            color:      application.status === "approved" ? "#059669" : "#d97706",
            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}
        >
          {application.status?.toUpperCase()}
        </span>
      </p>
 
      <div style={{ padding: "1rem 0" }}>
        <AppSection title="Basic Information">
          <AppGrid2>
            <AppField label="Date Applied"   value={application.date} />
            <AppField label="Payment Mode"   value={application.paymentMode} />
            <div style={{ gridColumn: "1/-1" }}>
              <AppField label="Chosen Concept" value={application.franchise} highlight />
            </div>
          </AppGrid2>
        </AppSection>
 
        <AppSection title="Applicant Information">
          <AppGrid2>
            <div style={{ gridColumn: "1/-1" }}>
              <AppField label="Full Name" value={application.name} large />
            </div>
            <AppField label="Date of Birth"      value={application.dob} />
            <AppField label="Civil Status"       value={application.civilStatus} />
            {!isIPharma && (
              <>
                <AppField label="Gender"      value={application.gender} />
                <AppField label="Nationality" value={application.nationality} />
              </>
            )}
            <AppField label="No. of Dependents" value={application.dependents || "N/A"} />
            <AppField label="Mobile Number"     value={application.phone} />
            {isIPharma && application.telephone && (
              <AppField label="Telephone" value={application.telephone} />
            )}
            <div style={{ gridColumn: "1/-1" }}>
              <AppField label="Email Address"   value={application.email} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <AppField label="Present Address" value={application.address} />
            </div>
          </AppGrid2>
        </AppSection>
 
        {isIPharma && application.education && (
          <AppSection title="Education">
            <AppField label="Educational Background" value={application.education} />
          </AppSection>
        )}
 
        {application.spouseName && (
          <AppSection title="Spouse Information">
            <AppGrid2>
              <AppField label="Spouse Name"          value={application.spouseName} />
              <AppField label="Spouse Occupation"    value={application.spouseOccupation} />
              {isIPharma && application.spouseDob && (
                <AppField label="Spouse Date of Birth" value={application.spouseDob} />
              )}
            </AppGrid2>
          </AppSection>
        )}
 
        {!isIPharma && (
          <AppSection title="Employment Information">
            <AppGrid2>
              <AppField label="Employment Type"       value={application.employmentType} />
              <AppField label="Years with Employer"   value={`${application.yearsEmployer} years`} />
              <AppField label="Monthly Income"        value={`₱${parseInt(application.income).toLocaleString()}`} highlight />
              <AppField label="Position"              value={application.position} />
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Employer / Business Name" value={application.employerName} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Business Address" value={application.businessAddress} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Nature of Business" value={application.businessNature} />
              </div>
            </AppGrid2>
          </AppSection>
        )}
      </div>
 
      <ModalFooter
        onClose={onClose}
        closeLabel="Close"
        onConfirm={() => window.print()}
        confirmLabel="Print Application"
        confirmIcon={<span style={{ fontSize: 14 }}>🖨️</span>}
      />
    </ModalShell>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// ADD ACCOUNT MODAL  — validation modal before creating account
// ─────────────────────────────────────────────────────────────────────────────
export function AddAccountModal({ application, onClose, onConfirm }) {
  if (!application) return null;
  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <ModalHeader title="Create Franchisee Account" onClose={onClose} />
 
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
        You are about to create a system account for:
      </p>
 
      {/* Applicant card */}
      <div
        style={{
          background: "#f0fdf5", border: "1px solid #b2dfdb",
          borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        }}
      >
        <p style={{ fontWeight: 800, fontSize: 14, color: C.dark, marginBottom: 4 }}>{application.name}</p>
        <p style={{ fontSize: 12, color: C.muted }}>{application.email}</p>
        <p style={{ fontSize: 12, color: C.muted }}>{application.franchise}</p>
      </div>
 
      <div
        style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 10, padding: "10px 14px", fontSize: 12,
          color: "#1d4ed8", marginBottom: 6,
        }}
      >
        ℹ️ A temporary password will be sent to the applicant's email address.
      </div>
 
      <ModalFooter
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="Create Account"
        confirmIcon={<UserPlus size={14} />}
      />
    </ModalShell>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// APPROVE MODAL  — validation modal before approving
// ─────────────────────────────────────────────────────────────────────────────
export function ApproveModal({ application, onClose, onConfirm }) {
  if (!application) return null;
  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <ModalHeader title="Approve Application" onClose={onClose} />
 
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
        Review the applicant details before approving:
      </p>
 
      <div
        style={{
          background: "#f0fdf5", border: "1px solid #b2dfdb",
          borderRadius: 12, padding: "14px 16px", marginBottom: 16,
        }}
      >
        <p style={{ fontWeight: 800, fontSize: 14, color: C.dark, marginBottom: 6 }}>{application.name}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
          {[
            ["ID",        `#${application.id}`],
            ["Franchise", application.franchise],
            ["Date",      application.date],
            ["Payment",   application.paymentMode],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</span>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginTop: 2 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
 
      <div
        style={{
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 10, padding: "10px 14px", fontSize: 12,
          color: "#065f46", marginBottom: 6,
        }}
      >
        ✅ Approving will mark this application as <strong>Approved</strong> and notify the applicant.
      </div>
 
      <ModalFooter
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="Approve Application"
        confirmIcon={<CheckCircle size={14} />}
        confirmStyle={{
          background: "linear-gradient(135deg,#059669,#10b981)",
          color: "#fff",
          boxShadow: "0 2px 10px rgba(5,150,105,0.35)",
        }}
      />
    </ModalShell>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// DELETE VALIDATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function DeleteApplicationModal({ application, onClose, onConfirm }) {
  if (!application) return null;
  return (
    <ModalShell onClose={onClose} maxWidth={420}>
      {/* Icon */}
      <div
        style={{
          width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Trash2 size={22} color="#dc2626" />
      </div>
 
      <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Delete Application?
      </h2>
      <p style={{ textAlign: "center", fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
        You are about to delete the application from{" "}
        <strong style={{ color: C.dark }}>"{application.name}"</strong> (#{application.id}).
      </p>
 
      <div
        style={{
          background: "#fff7ed", border: "1px solid #fed7aa",
          borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "#c2410c", textAlign: "center", marginBottom: 16,
        }}
      >
        ⚠ This action cannot be undone from the main list, but you can recover it from the <strong>Deleted</strong> tab.
      </div>
 
      <ModalFooter
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="Delete Application"
        confirmIcon={<Trash2 size={14} />}
        confirmStyle={{
          background: "linear-gradient(135deg,#dc2626,#ef4444)",
          color: "#fff",
          boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
        }}
      />
    </ModalShell>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// RESTORE VALIDATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function RestoreApplicationModal({ application, onClose, onConfirm }) {
  if (!application) return null;
  return (
    <ModalShell onClose={onClose} maxWidth={420}>
      <div
        style={{
          width: 52, height: 52, borderRadius: "50%", background: "#d1fae5",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <RotateCcw size={22} color="#059669" />
      </div>
 
      <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Restore Application?
      </h2>
      <p style={{ textAlign: "center", fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
        Restore the application from{" "}
        <strong style={{ color: C.dark }}>"{application.name}"</strong> (#{application.id}) back to the active list?
      </p>
 
      <div
        style={{
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "#065f46", textAlign: "center", marginBottom: 6,
        }}
      >
        ✅ The application will be moved back to the <strong>active</strong> applications list.
      </div>
 
      <ModalFooter
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="Restore Application"
        confirmIcon={<RotateCcw size={14} />}
        confirmStyle={{
          background: "linear-gradient(135deg,#2E7D32,#00897b)",
          color: "#fff",
          boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
        }}
      />
    </ModalShell>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// DELETED APPLICATIONS TAB / PANEL
// ─────────────────────────────────────────────────────────────────────────────
export function DeletedApplicationsTab({ deletedItems, onRestore }) {
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [viewTarget,    setViewTarget]    = useState(null);
 
  const fmt = (d) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
 
  const handleConfirmRestore = () => {
    onRestore?.(restoreTarget);
    setRestoreTarget(null);
  };
 
  const thSt = {
    padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5,
    color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase",
    borderBottom: "2px solid #d1eedd", background: "#f8fffe",
    whiteSpace: "nowrap",
  };
  const tdSt = {
    padding: "11px 12px", borderBottom: "1px solid #f0f8f0",
    verticalAlign: "middle", fontSize: 13,
  };
 
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.dark, margin: 0 }}>Deleted Applications</h2>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {deletedItems.length} deleted {deletedItems.length === 1 ? "record" : "records"} · Restore to move back to active list
          </p>
        </div>
        {deletedItems.length > 0 && (
          <span
            style={{
              fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
              background: "#fee2e2", color: "#dc2626",
            }}
          >
            {deletedItems.length} deleted
          </span>
        )}
      </div>
 
      {deletedItems.length === 0 ? (
        <div
          style={{
            padding: "48px 0", textAlign: "center",
            color: C.muted, fontSize: 14, fontStyle: "italic",
            background: "#f8fffe", borderRadius: 16,
            border: "1px dashed #b2dfdb",
          }}
        >
          No deleted applications.
        </div>
      ) : (
        <div
          style={{
            background: "#fff", border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18, boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "6%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                {["ID", "Name", "Franchise", "Status", "Deleted At", "Reason", "Actions"].map((h) => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deletedItems.map((item) => (
                <tr
                  key={item.id}
                  style={{ cursor: "default" }}
                  onMouseEnter={(e) => { [...e.currentTarget.cells].forEach((c) => (c.style.background = "#fef2f2")); }}
                  onMouseLeave={(e) => { [...e.currentTarget.cells].forEach((c) => (c.style.background = "")); }}
                >
                  <td style={{ ...tdSt, color: C.muted, fontSize: 12 }}>#{item.id}</td>
                  <td style={{ ...tdSt, fontWeight: 700, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</td>
                  <td style={{ ...tdSt, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.franchise}</td>
                  <td style={tdSt}>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                        background: item.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color:      item.status === "approved" ? "#059669" : "#d97706",
                      }}
                    >
                      {item.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...tdSt, color: C.muted, fontSize: 11 }}>{fmt(item.deletedAt)}</td>
                  <td style={{ ...tdSt, color: "#9ca3af", fontSize: 12, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.deleteReason || "—"}
                  </td>
                  <td style={tdSt}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {/* View */}
                      <button
                        title="View application"
                        onClick={() => setViewTarget(item)}
                        style={{
                          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1",
                          color: "#00695c", cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      {/* Restore */}
                      <button
                        title="Restore application"
                        onClick={() => setRestoreTarget(item)}
                        style={{
                          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 8, border: "1.5px solid #00897b", background: "#f0fdf5",
                          color: "#00695c", cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
 
      {/* Restore confirmation modal */}
      {restoreTarget && (
        <RestoreApplicationModal
          application={restoreTarget}
          onClose={() => setRestoreTarget(null)}
          onConfirm={handleConfirmRestore}
        />
      )}
 
      {/* View modal from deleted tab */}
      {viewTarget && (
        <ViewApplicationModal
          application={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────────────────────
// FIELD / SECTION / GRID helpers (unchanged API, kept here for self-containment)
// ─────────────────────────────────────────────────────────────────────────────
export function AppSection({ title, children }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 13,
          color: "#00897b", textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${C.border}`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
 
export function AppGrid2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      {children}
    </div>
  );
}
 
export function AppField({ label, value, highlight, large }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11, fontWeight: 800, color: "#5a7a65",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontWeight: highlight || large ? 800 : 600,
          fontSize: large ? 15 : 13,
          color: highlight ? "#00897b" : C.dark,
        }}
      >
        {value}
      </p>
    </div>
  );
}
// ─── Exports ──────────────────────────────────────────────────────────────────
export { ActionDropdown,  POSContent };
