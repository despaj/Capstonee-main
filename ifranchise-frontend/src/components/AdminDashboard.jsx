// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — Logic unchanged, UI updated to match FranchiseeDashboard
// ─────────────────────────────────────────────────────────────────────────────
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
  Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar,Pin,  Megaphone, BarChart, RefreshCw, Eye, Clock, Info, Download,History, RotateCcw, UserPlus, CheckCircle,
  ChevronRight, Lock, Unlock 
} from 'lucide-react';

// ─── Design tokens (kept from original + Franchisee palette) ─────────────────
const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

// ─── Shared CSS (Franchisee-style) ───────────────────────────────────────────
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

// ─── Original style helpers (unchanged) ──────────────────────────────────────
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

const fmtPeso = (n) => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

const TrashIcon = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

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
// ADMIN DASHBOARD — Shell with Franchisee UI
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(() => {
      return localStorage.getItem('fr_activeModule') || 'dashboard';
    });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [preset, setPreset] = useState("month");
  const [stats, setStats] = useState(null);
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedUser');
    window.location.href = '/admin-login';
  };
  const [transactions, setTransactions] = useState([]);

  const getUserFromStorage = () => {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString);
    return null;
  };

    useEffect(() => {
    localStorage.setItem('fr_activeModule', activeModule);
  }, [activeModule]);

  useEffect(() => {
    fetch(`http://localhost:5001/dashboard/stats?preset=${preset}`)
      .then(res => res.json()).then(data => setStats(data)).catch(err => console.error(err));
  }, [preset]);

  useEffect(() => {
    fetch("http://localhost:5001/transactions")
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
  useEffect(() => { fetchApplications(); }, []);

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
    { id: 'dashboard',      label: 'Dashboard',            icon: <Home size={20} />,        section: 'main' },
    { id: 'inventory',      label: 'Menu Inventory',        icon: <Box size={20} />,         section: 'main' },
    { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} />,      section: 'main' },
    { id: 'pos',            label: 'POS',                   icon: <DollarSign size={20} />,  section: 'main' },
    { id: 'mobileShop',     label: 'Mobile Shop Supplies',  icon: <ShoppingCart size={20} />,section: 'main' },
    { id: 'mobileOrders',   label: 'View Mobile Orders',    icon: <Package size={20} />,     section: 'main' },
    { id: 'receipts',       label: 'View Liquidation',      icon: <FileText size={20} />,    section: 'main' },
    { id: 'applications',   label: 'View Applications',     icon: <FileCheck size={20} />,   section: 'main' },
    { id: 'users',          label: 'User Management',       icon: <Users size={20} />,       section: 'main' },
    { id: 'reports',        label: 'Sales & Reports',       icon: <BarChart2 size={20} />,   section: 'main' },
    { id: 'communication',  label: 'Announcements',         icon: <MessageCircle size={20} />,section:'main' },
    { id: 'brandBranch',    label: 'Brand & Branch',        icon: <GitBranch size={20} />,   section: 'main' },
    { id: 'profile',        label: 'Edit Profile',          icon: <User size={20} />,        section: 'account' },
    { id: 'logout',         label: 'Logout',                icon: <LogOut size={20} />,      section: 'account', action: handleLogout },
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

        /* ── Sidebar (Franchisee style) ── */
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
        .ad-nav-icon {
          flex-shrink:0; display:flex;
          justify-content:center; width:22px;
        }
        .ad-nav-label {
          display:${sidebarCollapsed ? 'none' : 'block'};
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .ad-nav-bar {
          position:absolute; right:0; top:20%; height:60%;
          width:3px; border-radius:2px; background:var(--grad-main);
        }

        /* ── Main content ── */
        .ad-main {
          flex:1;
          margin-left:${sidebarCollapsed ? '76px' : '272px'};
          transition:margin-left 0.3s ease;
        }

        /* ── Topbar (Franchisee style) ── */
        .ad-topbar {
          background:rgba(255,255,255,0.9);
          backdrop-filter:blur(12px);
          padding:1rem 2rem;
          box-shadow:0 2px 16px rgba(0,140,60,0.08);
          display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100;
          border-bottom:1px solid rgba(0,168,76,0.08);
        }
        .ad-topbar-breadcrumb {
          font-size:12px; color:#94a3b8;
          font-weight:600; font-family:'Poppins',sans-serif;
        }
        .ad-topbar-title {
          font-family:'Montserrat',sans-serif;
          font-size:1.5rem; font-weight:800; color:#0d2b1e;
        }
        .ad-user-name {
          font-weight:700; color:#0d2b1e;
          font-size:14px; font-family:'Montserrat',sans-serif;
        }
        .ad-user-role {
          font-size:11px; color:#94a3b8;
          font-weight:600; font-family:'Poppins',sans-serif;
        }
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

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
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

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main className="ad-main">

        {/* Topbar */}
        <div className="ad-topbar">
          <div>
            <div className="ad-topbar-breadcrumb">iFranchise Admin → {moduleLabel}</div>
            <h1 className="ad-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="ad-user-name">{user?.name}</div>
              <div className="ad-user-role">Admin — {user?.branch}</div>
            </div>
            <div className="ad-avatar">
              {user?.name ? user.name.trim()[0].toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ad-content">
          {activeModule === 'dashboard'      && <DashboardContent transactions={transactions} brands={brands} />}
          {activeModule === 'inventory'      && <MenuInventoryContent user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'pos'            && <POSContent user={user} brands={brands} />}
          {activeModule === 'mobileShop'     && <MobileShopContent />}
          {activeModule === 'mobileOrders'   && <MobileOrdersContent />}
          {activeModule === 'receipts'       && <Receipts />}
          {activeModule === 'applications'   && (
            <ApplicationsContent
              applications={applications}
              onRefresh={fetchApplications}
              onView={handleViewApplication}
              onDelete={handleDeleteApplication}
              onApprove={handleApproveApplication}
              onCreateAccount={handleCreateAccount}
            />
          )}
          {activeModule === 'users'         && <UsersContent />}
          {activeModule === 'reports'       && <ReportsContent />}
          {activeModule === 'communication' && <CommunicationContent />}
          {activeModule === 'brandBranch'   && <BrandManagementContent brands={brands} onBrandsChange={setBrands} />}
          {activeModule === 'profile'       && <ProfileContent user={user} />}
        </div>
      </main>

      {/* ── CREATE ACCOUNT MODAL ── */}
      {showCreateAccountModal && (
        <CreateAccountModal
          applicant={selectedApplicant}
          onClose={() => { setShowCreateAccountModal(false); setSelectedApplicant(null); }}
        />
      )}

      {/* ── LOGOUT MODAL (Franchisee style) ── */}
      {showLogoutModal && (
        <div
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,0.55)',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:3000,
            backdropFilter:'blur(4px)',
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              background:C.white, borderRadius:22, padding:'32px 36px',
              maxWidth:400, width:'90%', textAlign:'center',
              boxShadow:'0 24px 80px rgba(0,0,0,0.25)',
              border:'1px solid rgba(0,168,76,0.15)',
              animation:'slideUp .25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width:68, height:68, borderRadius:20,
              background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px', fontSize:'2rem',
              border:'1.5px solid rgba(239,68,68,0.15)',
            }}>🚪</div>
            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:800, color:'#0d2b1e', marginBottom:8 }}>
              Log out?
            </h2>
            <p style={{ color:'#94a3b8', fontSize:13, marginBottom:28, lineHeight:1.6, fontFamily:'Poppins,sans-serif' }}>
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex:1, padding:'11px 0', borderRadius:12,
                  border:'1.5px solid #b2dfdb', background:'#f0fdf5',
                  color:'#5a7a65', fontSize:13, fontWeight:700,
                  cursor:'pointer', fontFamily:'Montserrat,sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex:1, padding:'11px 0', borderRadius:12, border:'none',
                  background:'linear-gradient(135deg,#ef4444,#dc2626)',
                  color:'#fff', fontSize:13, fontWeight:800,
                  cursor:'pointer', fontFamily:'Montserrat,sans-serif',
                  boxShadow:'0 4px 14px rgba(239,68,68,.25)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW APPLICATION MODAL ── */}
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


// ─────────────────────────────────────────────────────────────────────────────
// ALL CONTENT COMPONENTS BELOW ARE UNCHANGED FROM ORIGINAL
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({ target, onConfirm, onClose }) {
  const isBrand = target.type === "brand";
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

        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
          Delete {isBrand ? "brand" : "branch"}?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete <strong>"{target.name}"</strong>
          {isBrand ? " and all its associated data." : "."}
        </p>

        {isBrand && target.branchCount > 0 && (
          <div
            style={{
              background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
              padding: "10px 14px", fontSize: 12, color: "#c2410c",
              textAlign: "center", marginBottom: 16,
            }}
          >
            ⚠ This brand has {target.branchCount}{" "}
            {target.branchCount === 1 ? "branch" : "branches"}. All branches will also be deleted.
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
          You can recover this from Delete History.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
              background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
            }}
          >
            <Trash2 size={14} /> Delete {isBrand ? "brand" : "branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE HISTORY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteHistoryPanel({ history, onRestore, onClose }) {
  const fmt = (d) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
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
          width: "100%", maxWidth: 580, maxHeight: "80vh",
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
              <span
                style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "#fee2e2", color: "#dc2626",
                }}
              >
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

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div
              style={{
                padding: "40px 0", textAlign: "center",
                color: "#9ca3af", fontSize: 13, fontStyle: "italic",
              }}
            >
              No deleted items yet.
            </div>
          ) : (
            history.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none",
                }}
              >
                {/* Type badge */}
                <span
                  style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 10px",
                    borderRadius: 20, whiteSpace: "nowrap",
                    background: entry.type === "brand" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)",
                    color: entry.type === "brand" ? "#2563eb" : "#059669",
                  }}
                >
                  {entry.type === "brand" ? "Brand" : "Branch"}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700, fontSize: 13, color: "#0d2b1e",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}
                  >
                    {entry.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>
                    {fmt(entry.deletedAt)}
                    {entry.type === "brand" && entry.data?.branches?.length > 0
                      ? ` · ${entry.data.branches.length} ${entry.data.branches.length === 1 ? "branch" : "branches"} included`
                      : ""}
                    {entry.type === "branch" && entry.brandName ? ` · ${entry.brandName}` : ""}
                    {entry.type === "branch" && entry.data?.region ? ` · ${entry.data.region}` : ""}
                    {entry.type === "branch" && entry.data?.concept ? ` · ${entry.data.concept}` : ""}
                  </div>
                </div>

                {/* Restore button */}
                <button
                  onClick={() => onRestore(entry)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 9,
                    border: "1.5px solid #00897b", background: "#e0f2f1",
                    color: "#00695c", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    whiteSpace: "nowrap", flexShrink: 0,
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
// BM MODAL (shared add/edit wrapper)
// ─────────────────────────────────────────────────────────────────────────────
function BmModal({ title, onClose, onSubmit, children }) {
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
          width: "100%", maxWidth: 520,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0, fontFamily: "Montserrat,sans-serif" }}>
            {title}
          </h2>
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
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
                background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
              }}
            >
              <Check size={14} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND FORM FIELDS
// ─────────────────────────────────────────────────────────────────────────────
function BrandFormFields({ form, setForm }) {
  const [catInput, setCatInput] = useState("");
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
    background: "#f0fdf5", fontFamily: "inherit", outline: "none",
    marginTop: 4, boxSizing: "border-box",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65",
    marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  const addCategory = () => {
    const val = catInput.trim();
    if (!val) return;
    if ((form.categories || []).map((c) => c.toLowerCase()).includes(val.toLowerCase())) {
      alert(`"${val}" is already in the list.`);
      return;
    }
    setForm((f) => ({ ...f, categories: [...(f.categories || []), val] }));
    setCatInput("");
  };
  const removeCategory = (cat) =>
    setForm((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={lbl}>Brand Name *</label>
        <input style={inputSt} {...f("name")} placeholder="Enter brand name" required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Contact Email</label>
          <input type="email" style={inputSt} {...f("contact_email")} placeholder="brand@example.com" />
        </div>
        <div>
          <label style={lbl}>Contact Phone</label>
          <input
            type="tel"
            style={inputSt}
            maxLength={11}
            value={form.contact_phone}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
              const isShortcut = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(e.key.toLowerCase());
              if (!/^\d$/.test(e.key) && !allowed.includes(e.key) && !isShortcut) e.preventDefault();
            }}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setForm((prev) => ({ ...prev, contact_phone: digits }));
            }}
            placeholder="09XXXXXXXXX"
          />
        </div>
      </div>
      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 }} {...f("description")} rows={3} placeholder="Brief description..." />
      </div>
      <div>
        <label style={lbl}>Categories</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            style={{ ...inputSt, marginTop: 0, flex: 1 }}
            placeholder="e.g. Medicine, Supplement..."
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
          />
          <button
            type="button"
            onClick={addCategory}
            style={{
              padding: "9px 16px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {(form.categories || []).length === 0 ? (
          <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 6 }}>No categories yet.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
            {form.categories.map((cat) => (
              <span
                key={cat}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 20,
                  background: "#e0f2f1", border: "1.5px solid #00897b",
                  color: "#00695c", fontSize: 12, fontWeight: 700,
                }}
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#00897b" }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANCH FORM FIELDS
// ─────────────────────────────────────────────────────────────────────────────
function BranchFormFields({ form, setForm, brands }) {
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
    background: "#f0fdf5", fontFamily: "inherit", outline: "none",
    marginTop: 4, boxSizing: "border-box",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65",
    marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em",
  };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={lbl}>Parent Brand *</label>
        <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("brand_id")} required>
          <option value="">Select brand</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Branch Name *</label>
        <input style={inputSt} {...f("name")} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Region *</label>
          <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("region")} required>
            <option value="">Select region</option>
            {["NCR", "Region 3", "Region 4A", "Region 4B", "Region 5", "Region 7", "Region 11"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        {String(form.brand_id) === brands.find((b) => b.name === "Coffee Spot")?.id?.toString() && (
          <div>
            <label style={lbl}>Concept *</label>
            <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("concept")}>
              <option value="">Select concept</option>
              <option>Full Store</option>
              <option>Kiosk</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label style={lbl}>Branch Manager</label>
        <input style={inputSt} {...f("manager")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Contact Number</label>
          <input
            type="tel"
            style={inputSt}
            maxLength={11}
            value={form.contact}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", "Control"];
              const isShortcut = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(e.key.toLowerCase());
              if (!/^\d$/.test(e.key) && !allowed.includes(e.key) && !isShortcut) e.preventDefault();
            }}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setForm((prev) => ({ ...prev, contact: digits }));
            }}
          />
        </div>
        <div>
          <label style={lbl}>Address</label>
          <input style={inputSt} {...f("address")} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function BrandManagementContent({ brands: propBrands, onBrandsChange }) {
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

  // ── Delete modal & history ──────────────────────────────────────────────
  const [deleteTarget,   setDeleteTarget]   = useState(null);  // { type, id, name, branchCount?, brandName? }
  const [deletedHistory, setDeletedHistory] = useState([]);

const fetchDeleteHistory = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`);
    const data = await res.json();
    const normalized = Array.isArray(data) ? data.map(entry => ({
      ...entry,
      brandName: entry.brand_name ?? null,          // ← map snake_case → camelCase
      deletedAt: entry.deleted_at ?? null,           // ← map snake_case → camelCase
      data: typeof entry.data === 'string' 
        ? JSON.parse(entry.data) 
        : (entry.data ?? {}),
    })) : [];
    setDeletedHistory(normalized);
  } catch (err) { 
    console.error(err); 
  }
};
  const [showHistory,    setShowHistory]    = useState(false);

  const emptyBrand  = { name: "", categories: [], contact_email: "", contact_phone: "", description: "" };
  const emptyBranch = { name: "", brand_id: "", region: "", manager: "", contact: "", address: "", concept: "" };

  const [brandForm,  setBrandForm]  = useState(emptyBrand);
  const [branchForm, setBranchForm] = useState(emptyBranch);

  useEffect(() => { fetchBrands(); fetchDeleteHistory(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

          const sorted = [...list].sort((a, b) => {
      if (a.name === "Head Office") return -1;
      if (b.name === "Head Office") return 1;
      return 0;
    });

      setBrands(sorted);
      onBrandsChange?.(sorted);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Add / Edit Brand ───────────────────────────────────────────────────
  const handleAddBrand = async (e) => {
    e.preventDefault();
    const duplicate = brands.some(
      (b) => b.name.trim().toLowerCase() === brandForm.name.trim().toLowerCase()
    );
    if (duplicate) { alert(`A brand named "${brandForm.name}" already exists.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBrandModal(false); setBrandForm(emptyBrand); }
      else alert(data.error || "Failed to add brand");
    } catch { alert("Failed to add brand"); }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands/${selectedBrand.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBrandModal(false); setSelectedBrand(null); }
      else alert(data.error || "Failed to update brand");
    } catch { alert("Failed to update brand"); }
  };

  // ── Delete Brand (modal-driven) ────────────────────────────────────────
const handleDeleteBrand = async () => {
  const { id, name } = deleteTarget;
  
  // Get full brand with branches from local state
  const brand = brands.find((b) => b.id === id);
  const brandToSave = {
    name: brand.name,
    categories: brand.categories || [],
    contact_email: brand.contact_email || null,
    contact_phone: brand.contact_phone || null,
    description: brand.description || null,
    branches: (brand.branches || []).map(br => ({
      name: br.name,
      region: br.region || null,
      manager: br.manager || null,
      contact: br.contact || null,
      address: br.address || null,
      concept: br.concept || null,
    })),
  };

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${id}`, { 
      method: "DELETE" 
    });
    const data = await res.json();
    if (data.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'brand', 
          name, 
          brand_name: null,
          data: brandToSave,  // ← clean object, no old IDs
        }),
      });
      await fetchBrands();
      await fetchDeleteHistory();
      setDeleteTarget(null);
    } else alert(data.error || "Failed to delete brand");
  } catch { alert("Failed to delete brand"); }
};

  // ── Add / Edit Branch ──────────────────────────────────────────────────
  const handleAddBranch = async (e) => {
    e.preventDefault();
    const parentBrand = brands.find((b) => String(b.id) === String(branchForm.brand_id));
    const duplicate   = parentBrand?.branches?.some(
      (br) => br.name.trim().toLowerCase() === branchForm.name.trim().toLowerCase()
    );
    if (duplicate) { alert(`A branch named "${branchForm.name}" already exists under this brand.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBranchModal(false); setBranchForm(emptyBranch); }
      else alert(data.error || "Failed to add branch");
    } catch { alert("Failed to add branch"); }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); }
      else alert(data.error || "Failed to update branch");
    } catch { alert("Failed to update branch"); }
  };

  // ── Delete Branch (modal-driven) ───────────────────────────────────────
  const handleDeleteBranch = async () => {
  const { id, name, brandName } = deleteTarget;
  const branch = brands.flatMap((b) => b.branches || []).find((br) => br.id === id);
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    type: 'branch', 
    name, 
    brand_name: brandName,  // ← was: brandName as key name (JS shorthand sent it fine but backend destructures brand_name)
    data: branch 
  }),
});
      await fetchBrands();          // ← was missing
      await fetchDeleteHistory();
      setDeleteTarget(null);
    } else alert(data.error || "Failed to delete branch");
  } catch { alert("Failed to delete branch"); }
};
  // ── Restore ────────────────────────────────────────────────────────────
const handleRestore = async (entry) => {
  try {
    if (entry.type === "brand") {
      const { branches, ...brandFields } = entry.data;
      const branchList = Array.isArray(branches) ? branches : [];

      console.log("Restoring brand:", brandFields);
      console.log("With branches:", branchList);

      // Step 1: re-create the brand
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandFields),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to restore brand");
        return;
      }

      const newBrandId = data.id;
      console.log("New brand ID:", newBrandId);

      // Step 2: re-create each branch under the new brand
      for (const br of branchList) {
        const { id: _ignore, brand_id: _ignore2, ...branchFields } = br;
        console.log("Restoring branch:", branchFields, "under brand_id:", newBrandId);

        const brRes = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: branchFields.name,
            region: branchFields.region || null,
            manager: branchFields.manager || null,
            contact: branchFields.contact || null,
            address: branchFields.address || null,
            concept: branchFields.concept || null,
            brand_id: newBrandId,
          }),
        });
        const brData = await brRes.json();
        console.log("Branch restore result:", brData);
        if (!brData.success) {
          console.error("Failed to restore branch:", branchFields.name, brData.error);
        }
      }

      // Step 3: remove from delete history
      await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, {
        method: 'DELETE',
      });

      await fetchBrands();
      await fetchDeleteHistory();

    } else {
      // Branch restore
      const parentBrand = brands.find((b) => b.name === entry.brandName);

      if (!parentBrand) {
        alert(
          `Cannot restore branch: parent brand "${entry.brandName || 'unknown'}" not found.\n` +
          `Restore the brand first if it was also deleted.`
        );
        return;
      }

      const { id: _id, brand_id: _bid, ...branchFields } = entry.data;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: branchFields.name,
          region: branchFields.region || null,
          manager: branchFields.manager || null,
          contact: branchFields.contact || null,
          address: branchFields.address || null,
          concept: branchFields.concept || null,
          brand_id: parentBrand.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, {
          method: 'DELETE',
        });
        await fetchBrands();
        await fetchDeleteHistory();
      } else {
        alert(data.error || "Failed to restore branch");
      }
    }
  } catch (err) {
    console.error("Restore error:", err);
    alert("Failed to restore: " + err.message);
  }
};
  // ── Derived data ───────────────────────────────────────────────────────
  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const allRegions    = [
    ...new Set(brands.flatMap((b) => b.branches?.map((br) => br.region) || []).filter(Boolean)),
  ];

  const filteredBrands = brands
    .map((brand) => ({
      ...brand,
      branches: (brand.branches || []).filter(
        (br) =>
          (!searchQuery ||
            br.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (br.manager || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterRegion === "all" || br.region === filterRegion)
      ),
    }))
    .filter((brand) => {
      if (filterBrand !== "all" && String(brand.id) !== String(filterBrand)) return false;
      if (filterRegion !== "all" && brand.branches.length === 0) return false;
      if (searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
      return true;
    });

  // ── Sub-components ─────────────────────────────────────────────────────
  const ConceptBadge = ({ concept }) => {
    const styles = {
      "Full Store": { bg: "rgba(16,185,129,0.1)", color: "#059669" },
      "Kiosk":      { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
    };
    const s = styles[concept] || { bg: "rgba(156,163,175,0.1)", color: "#6b7280" };
    return (
      <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
        {concept || "—"}
      </span>
    );
  };

  // ── Shared table styles ────────────────────────────────────────────────
  const thSt = {
    padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5,
    color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase",
    borderBottom: "2px solid #d1eedd", background: "#f8fffe",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };
  const tdSt = {
    padding: "11px 12px", borderBottom: "1px solid #f0f8f0",
    verticalAlign: "middle", overflow: "hidden",
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        .bm-root * { font-family:'Montserrat',sans-serif !important; box-sizing:border-box; }
        .bm-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; }
        .bm-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); }
        .bm-brand-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; box-shadow:0 2px 14px rgba(0,140,60,0.07); margin-bottom:24px; overflow:hidden; }
        .bm-brand-header { background:linear-gradient(135deg,#2E7D32,#00897b); color:#fff; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; }
        .bm-input { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; }
        .bm-input:focus { border-color:#00897b; box-shadow:0 0 0 2px rgba(0,137,123,0.12); }
        .bm-select { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; appearance:none; cursor:pointer; }
        .bm-branch-tr:hover td { background:#f6fef8 !important; }
        .bm-branch-tr:last-child td { border-bottom:none !important; }
      `}</style>

      <div className="bm-root">
        {/* ── Stat cards ── */}
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

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#5a7a65" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search brands or branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bm-input"
              style={{ paddingLeft: 32, width: 260 }}
            />
          </div>
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="bm-select" style={{ width: 180 }}>
            <option value="all">All Brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="bm-select" style={{ width: 180 }}>
            <option value="all">All Regions</option>
            {allRegions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {/* Delete History button */}
            <button
              onClick={() => setShowHistory(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", borderRadius: 11,
                border: "1.5px solid #dc2626", background: "#fff",
                color: "#dc2626", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <History size={14} />
              Delete History{deletedHistory.length > 0 ? ` (${deletedHistory.length})` : ""}
            </button>

            <button
              onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", borderRadius: 11,
                border: "1.5px solid #00897b", background: "#fff",
                color: "#00897b", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Plus size={14} /> Add Branch
            </button>
            <button
              onClick={() => { setBrandForm(emptyBrand); setShowAddBrandModal(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 22px", borderRadius: 11, border: "none",
                background: "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff", fontSize: 13, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
              }}
            >
              <Plus size={15} /> Add Brand
            </button>
          </div>
        </div>

        {/* ── Brand list ── */}
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>
            Loading brands & branches...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>
            No brands found. Add your first brand above.
          </div>
        ) : filteredBrands.map((brand) => (
          <div key={brand.id} className="bm-brand-card">
            {/* Brand header */}
            <div className="bm-brand-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                    {brand.contact_email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>
                  {brand.branches?.length || 0} {brand.branches?.length === 1 ? "branch" : "branches"}
                </span>
                <button
                  onClick={() => {
                    setSelectedBrand(brand);
                    setBrandForm({ name: brand.name, categories: brand.categories || [], contact_email: brand.contact_email, contact_phone: brand.contact_phone, description: brand.description });
                    setShowEditBrandModal(true);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <Edit2 size={12} /> Edit Brand
                </button>
                <button
                  onClick={() => setDeleteTarget({ type: "brand", id: brand.id, name: brand.name, branchCount: brand.branches?.length || 0 })}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,150,150,0.5)", background: "rgba(255,80,80,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            {/* Branches table */}
            <div style={{ width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead>
                  <tr>
                    {["Branch Name", "Region", "Manager", "Contact", "Address", "Concept", "Actions"].map((h) => (
                      <th key={h} style={thSt}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!brand.branches || brand.branches.length === 0) ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "24px 20px", color: "#5a7a65", fontSize: 13, fontStyle: "italic", textAlign: "center", borderBottom: "none" }}>
                        No branches yet.{" "}
                        <span
                          style={{ color: "#00897b", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}
                          onClick={() => { setBranchForm({ ...emptyBranch, brand_id: brand.id }); setShowAddBranchModal(true); }}
                        >
                          Add the first branch
                        </span>
                      </td>
                    </tr>
                  ) : brand.branches.map((branch) => (
                    <tr key={branch.id} className="bm-branch-tr">
                      <td style={{ ...tdSt, fontWeight: 700, color: "#0d2b1e", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.name}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.region}</td>
                      <td style={{ ...tdSt, color: "#0d2b1e", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.manager || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.contact || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.address || "—"}</td>
                      <td style={tdSt}>
                        {brand.name === "Coffee Spot"
                          ? <ConceptBadge concept={branch.concept} />
                          : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {/* Edit */}
                          <button
                            title="Edit branch"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager, contact: branch.contact, address: branch.address, concept: branch.concept || "" });
                              setShowEditBranchModal(true);
                            }}
                            style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c", cursor: "pointer", flexShrink: 0 }}
                          >
                            <Pencil size={13} />
                          </button>
                          {/* Delete */}
                          <button
                            title="Delete branch"
                            onClick={() => setDeleteTarget({ type: "branch", id: branch.id, name: branch.name, brandName: brand.name })}
                            style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* ── Modals ── */}
      {showAddBrandModal   && <BmModal title="Add New Brand"  onClose={() => setShowAddBrandModal(false)}  onSubmit={handleAddBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showEditBrandModal  && <BmModal title="Edit Brand"     onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showAddBranchModal  && <BmModal title="Add New Branch" onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
      {showEditBranchModal && <BmModal title="Edit Branch"    onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onConfirm={deleteTarget.type === "brand" ? handleDeleteBrand : handleDeleteBranch}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {showHistory && (
        <DeleteHistoryPanel
          history={deletedHistory}
          onRestore={handleRestore}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

// ─── AI PREDICTIVE PANEL ──────────────────────────────────────────────────────
function AIPredictivePanel({ transactions, filterLabel, preset }) {
  const [analysis,  setAnalysis]  = React.useState(null);
  const [loading,   setLoading]   = React.useState(false);
  const [error,     setError]     = React.useState(null);
  const [lastRun,   setLastRun]   = React.useState(null);

  const fmtPeso = n =>
    '₱' + Number(n || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    });

  const runAnalysis = async () => {
    if (!transactions?.length) {
      setError('No transaction data available for the current filter and date range.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, preset, filterLabel }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(new Date().toLocaleTimeString('en-PH', {
          hour: '2-digit', minute: '2-digit',
        }));
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch (err) {
      setError('Could not reach the AI service. Check your server connection.');
    } finally {
      setLoading(false);
    }
  };

  const typeStyle = type => ({
    success: { borderColor: '#3B6D11', bg: '#EAF3DE', color: '#27500A' },
    warning: { borderColor: '#BA7517', bg: '#FAEEDA', color: '#633806' },
    info:    { borderColor: '#185FA5', bg: '#E6F1FB', color: '#0C447C' },
  }[type] || { borderColor: '#888780', bg: '#F1EFE8', color: '#2C2C2A' });

  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(0,168,76,0.12)',
      borderRadius: 22, padding: '22px 24px',
      boxShadow: '0 2px 20px rgba(0,140,60,0.07)', marginTop: 24,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#185FA5,#0C447C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12l3 3-3 3v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1l-3-3 3-3V9.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: 'Montserrat,sans-serif', fontWeight: 800,
              fontSize: 15, color: '#0d2b1e',
            }}>
              AI Predictive Analysis
            </div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>
              Powered by Groq · llama-3.3-70b
              {lastRun && ` · Last run ${lastRun}`}
            </div>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 11, border: 'none',
            background: loading
              ? '#e0e0e0'
              : 'linear-gradient(135deg,#185FA5,#0C447C)',
            color: loading ? '#9e9e9e' : '#fff',
            fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 2px 10px rgba(24,95,165,0.35)',
          }}
        >
          {loading ? (
            <>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2}
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {analysis ? 'Re-run analysis' : 'Run AI analysis'}
            </>
          )}
        </button>
      </div>

      {/* Empty / error / prompt states */}
      {!analysis && !loading && !error && (
        <div style={{
          padding: '32px 0', textAlign: 'center',
          color: '#5a7a65', fontSize: 13,
          border: '1.5px dashed #b2dfdb', borderRadius: 14,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🤖</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Ready to analyze your data
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {transactions?.length
              ? `${transactions.length} transactions loaded · ${filterLabel}`
              : 'Select a date range and branch filter, then run the analysis'}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 16px', borderRadius: 12,
          background: '#fee2e2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 13, fontWeight: 600,
        }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '32px 0', color: '#5a7a65', fontSize: 13,
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
            stroke="#185FA5" strokeWidth={2}
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Sending {transactions?.length} transactions to Groq for analysis…
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <>
          {/* KPI forecast cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 12, marginBottom: 20,
          }}>
            {[
              {
                label: 'Projected 7-day revenue',
                value: fmtPeso(analysis.projectedRevenue),
                sub: `${analysis.projectedChange >= 0 ? '↑' : '↓'} ${Math.abs(analysis.projectedChange || 0).toFixed(1)}% vs prior period`,
                subColor: analysis.projectedChange >= 0 ? '#3B6D11' : '#dc2626',
              },
              {
                label: 'Peak day forecast',
                value: analysis.peakDay || '—',
                sub: 'Expected highest revenue',
                subColor: '#5a7a65',
              },
              {
                label: 'Slowest day forecast',
                value: analysis.slowestDay || '—',
                sub: `↓ ${Math.abs(analysis.slowestDayDropPct || 0).toFixed(0)}% below average`,
                subColor: '#BA7517',
              },
              {
                label: 'Confidence score',
                value: `${analysis.confidence || 0}%`,
                sub: analysis.confidence >= 80
                  ? 'High — strong data'
                  : analysis.confidence >= 60
                    ? 'Medium — limited data'
                    : 'Low — need more data',
                subColor: analysis.confidence >= 80
                  ? '#3B6D11'
                  : analysis.confidence >= 60
                    ? '#BA7517'
                    : '#dc2626',
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: '#f8fffe',
                border: '1px solid #e0f2f1',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 6,
                }}>
                  {card.label}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#0d2b1e', marginBottom: 4,
                }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: card.subColor }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Summary narrative */}
          <div style={{
            background: '#f0fdf5', border: '1px solid #d1eedd',
            borderRadius: 14, padding: '16px 18px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: '#00897b', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="#00897b" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              AI summary · {filterLabel}
            </div>
            <p style={{
              fontSize: 13.5, color: '#0d2b1e', lineHeight: 1.7, margin: 0,
            }}>
              {analysis.summary}
            </p>
          </div>

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <>
              <div style={{
                fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 10,
              }}>
                Recommendations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.recommendations.map((rec, i) => {
                  const s = typeStyle(rec.type);
                  return (
                    <div key={i} style={{
                      borderLeft: `3px solid ${s.borderColor}`,
                      background: s.bg, borderRadius: '0 10px 10px 0',
                      padding: '10px 14px',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.07em', color: s.color, marginBottom: 3,
                      }}>
                        {rec.branch}
                      </div>
                      <div style={{
                        fontSize: 13, color: '#0d2b1e', lineHeight: 1.6,
                      }}>
                        {rec.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------DASHBOARD------------------
function DashboardContent({ transactions, brands: propBrands = [] }) {
  const today   = new Date();
  const fmt8    = (d) => d.toISOString().slice(0, 10);
  const fmtAmt  = (n) => '₱' + Number(n||0).toLocaleString('en-PH', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtShort= (n) => { if(n>=1_000_000) return '₱'+(n/1_000_000).toFixed(1)+'M'; if(n>=1_000) return '₱'+(n/1_000).toFixed(0)+'k'; return '₱'+Number(n).toFixed(0); };
  const [rangeMode,    setRangeMode]    = useState('preset');
  const [preset,       setPreset]       = useState('month');
  const [customFrom,   setCustomFrom]   = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo,     setCustomTo]     = useState(fmt8(today));
  const [appliedRange, setAppliedRange] = useState(null);
  const [archives,     setArchives]     = useState(() => { try { return JSON.parse(localStorage.getItem('dashboardArchives')||'[]'); } catch { return []; } });
  const [showArchivePanel,  setShowArchivePanel]  = useState(false);
  const [viewingArchive,    setViewingArchive]    = useState(null);
  const [archiveYearInput,  setArchiveYearInput]  = useState(String(today.getFullYear()));
  const [archiveConfirm,    setArchiveConfirm]    = useState(false);
  const [tooltip,           setTooltip]           = useState(null);
  const svgRef = useRef(null);

  const [filterBrand,    setFilterBrand]    = useState(null);
  const [filterBranch,   setFilterBranch]   = useState(null);
  const [brandDropOpen,  setBrandDropOpen]  = useState(false);
  const [branchDropOpen, setBranchDropOpen] = useState(false);
  const [brandQ,  setBrandQ]  = useState('');
  const [branchQ, setBranchQ] = useState('');
  const brandRef  = useRef(null);
  const branchRef = useRef(null);

    const [kpiData,    setKpiData]    = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  useEffect(() => {
    const fn = (e) => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setBrandDropOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const brandList      = propBrands.length > 0 ? propBrands : [];
  const selectedBrand  = brandList.find(b => b.id === filterBrand);
  const branchList     = selectedBrand ? (selectedBrand.branches||[]).map(br => typeof br==='string'?br:br.name) : [];
  const filteredBrands   = brandList.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));


const fetchKpis = useCallback(async () => {
  setKpiLoading(true);
  try {
    const params = new URLSearchParams();
    if (rangeMode === 'preset') {
      params.set('preset', preset);
    } else if (appliedRange) {
      params.set('from', appliedRange.from);
      params.set('to', appliedRange.to);
    } else {
      params.set('preset', 'month');
    }

    if (filterBranch) {
      params.set('branch', filterBranch);
    } else if (filterBrand && selectedBrand) {
      const branchNames = (selectedBrand.branches || [])
        .map(br => (typeof br === 'string' ? br : br.name));
      if (branchNames.length > 0) params.set('branches', branchNames.join(','));
    }

    const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
    const data = await res.json();
    if (!data.error) setKpiData(data);
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err);
  } finally {
    setKpiLoading(false);
  }
}, [rangeMode, preset, appliedRange, filterBranch, filterBrand, selectedBrand]);

  useEffect(() => {
    if (!viewingArchive) fetchKpis();
  }, [fetchKpis, viewingArchive]);

  
  const filterLabel = (() => {
    if (filterBranch) return filterBranch;
    if (filterBrand)  return selectedBrand?.name + ' – All Branches';
    return 'All Brands & Branches';
  })();

  const getRangeLabel = () => {
    if (viewingArchive) return `Archive: ${viewingArchive.year}`;
    if (rangeMode === 'custom' && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
    const map = { day:'Today', week:'This Week', month:'This Month', year:'This Year' };
    return map[preset] || 'This Month';
  };

    const chartData = useMemo(() => {
    if (viewingArchive) return viewingArchive.chartData;

    // Apply brand/branch filter
    let txList = transactions;
    if (filterBranch) {
      txList = transactions.filter(tx => tx.branch === filterBranch);
    } else if (filterBrand && selectedBrand) {
      const branchNames = (selectedBrand.branches||[]).map(br => typeof br==='string'?br:br.name);
      txList = transactions.filter(tx => branchNames.includes(tx.branch));
    }

    if (!txList.length) return { labels: [], values: [] };

    const now = new Date();

    const filtered = txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return d >= start && d <= end;
      }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year")  return d.getFullYear() === now.getFullYear();
      if (rangeMode === 'custom' && appliedRange) {
        const from = new Date(appliedRange.from);
        const to   = new Date(appliedRange.to);
        return d >= from && d <= to;
      }
      return true;
    });

    let grouped = {};

    if (preset === "day") {
      filtered.forEach(tx => {
        const hour  = new Date(tx.created_at).getHours();
        const label = `${hour}:00`;
        grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
      });
    } else if (preset === "week") {
      filtered.forEach(tx => {
        const label = new Date(tx.created_at).toLocaleDateString("en-US", { weekday: "short" });
        grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
      });
    } else if (preset === "month") {
      filtered.forEach(tx => {
        const day   = new Date(tx.created_at).getDate();
        const label = `Day ${day}`;
        grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
      });
    } else if (preset === "year") {
      filtered.forEach(tx => {
        const label = new Date(tx.created_at).toLocaleDateString("en-US", { month: "short" });
        grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
      });
    } else if (rangeMode === 'custom' && appliedRange) {
      const from     = new Date(appliedRange.from);
      const to       = new Date(appliedRange.to);
      const diffDays = Math.ceil((to - from) / (1000*60*60*24)) + 1;
      const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
      const labels   = Array.from({length: numWeeks}, (_, i) => `Week ${i+1}`);
      const values   = Array(numWeeks).fill(0);
      filtered.forEach(tx => {
        const d       = new Date(tx.created_at);
        const weekIdx = Math.min(Math.floor((d - from) / (7*24*60*60*1000)), numWeeks-1);
        values[weekIdx] += tx.total || 0;
      });
      return { labels, values };
    }

    const labels = Object.keys(grouped);
    const values = labels.map(l => grouped[l]);
    return { labels, values };
  }, [transactions, preset, rangeMode, appliedRange, viewingArchive, filterBranch, filterBrand, selectedBrand]);

  const values    = chartData.values;
  const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg       = useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
  const peak      = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
  const low       = useMemo(() => values.length ? Math.min(...values) : 0, [values]);
  const peakLabel = values.length ? chartData.labels[values.indexOf(peak)] : '—';
  const pctChange = values.length > 1 && values[0] > 0 ? (((values[values.length-1] - values[0]) / values[0]) * 100).toFixed(1) : '0.0';
  const trending  = Number(pctChange) >= 0;

  const SVG_W = 820, SVG_H = 260, PAD_L = 64, PAD_R = 16, PAD_T = 18, PAD_B = 36;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const maxV  = peak > 0 ? peak * 1.18 : 1;

  const pts = useMemo(() => values.map((v, i) => ({
    x: PAD_L + (i / Math.max(values.length - 1, 1)) * plotW,
    y: PAD_T + plotH - (v / maxV) * plotH,
    v, label: chartData.labels[i],
  })), [values, chartData.labels, maxV, plotH, plotW]);

  const { linePath, areaPath } = useMemo(() => {
    if (!pts.length) return { linePath:'', areaPath:'' };
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i+1].x) / 2;
      d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i+1].y}, ${pts[i+1].x} ${pts[i+1].y}`;
    }
    return { linePath:d, areaPath:d + ` L ${pts[pts.length-1].x} ${PAD_T+plotH} L ${pts[0].x} ${PAD_T+plotH} Z` };
  }, [pts, PAD_T, plotH]);

  const yTicks = useMemo(() =>
    [0, 0.25, 0.5, 0.75, 1].map(t => ({ y:PAD_T + plotH - t * plotH, label:fmtShort(t * maxV) })),
    [maxV, PAD_T, plotH]
  );

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !pts.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * SVG_W;
    let best = pts[0], bestDist = Infinity;
    for (const p of pts) { const d = Math.abs(p.x - mx); if (d < bestDist) { bestDist = d; best = p; } }
    setTooltip({ x:best.x, y:best.y, label:best.label, value:best.v });
  }, [pts]);

  const saveArchive = () => {
    const year = parseInt(archiveYearInput);
    if (isNaN(year) || year < 2000 || year > 2100) { alert('Please enter a valid year (2000–2100)'); return; }
    if (archives.find(a => a.year === year)) { alert(`Year ${year} is already archived.`); return; }
    const snapshot = { year, label:`Full Year ${year}`, savedAt:new Date().toLocaleString(), chartData, kpis:{ totalSales:kpiData?.totalSales||total, avgSales:avg, peakSales:peak, lowSales:low } };
    const updated  = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(updated);
    localStorage.setItem('dashboardArchives', JSON.stringify(updated));
    setArchiveConfirm(false);
    alert(`Year ${year} archived successfully!`);
  };

  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const updated = archives.filter(a => a.year !== year);
    setArchives(updated);
    localStorage.setItem('dashboardArchives', JSON.stringify(updated));
    if (viewingArchive?.year === year) setViewingArchive(null);
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) { alert('Please select both From and To dates'); return; }
    if (customFrom > customTo) { alert('"From" date cannot be after "To" date'); return; }
    setAppliedRange({ from:customFrom, to:customTo });
    setViewingArchive(null);
  };

    const kpiCards = [
    { label:'Sales Revenue',  value: kpiData ? kpiData.salesRevenue : null, note: kpiLoading ? 'Loading…' : `${getRangeLabel()} · ${filterLabel}` },
    { label:'Sales Profit',   value: kpiData ? kpiData.salesProfit  : null, note: kpiLoading ? 'Loading…' : `${getRangeLabel()} · ${filterLabel}` },
    { label:'Cost of Sales',  value: kpiData ? kpiData.cogs         : null, note: kpiLoading ? 'Loading…' : `${getRangeLabel()} · ${filterLabel}` },
    { label:'Total Sales',    value: kpiData ? kpiData.totalSales   : null, note: kpiLoading ? 'Loading…' : `${getRangeLabel()} · ${filterLabel}` },
  ];

   const dropSt = {
    position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:400,
    background:'#fff', border:'1px solid #b2dfdb', borderRadius:11,
    boxShadow:'0 8px 28px rgba(0,0,0,0.10)', maxHeight:220, overflowY:'auto',
  };
  const optSt = (active) => ({
    padding:'9px 14px', cursor:'pointer', fontSize:13,
    color: active ? '#00695c' : '#0d2b1e', fontWeight: active ? 700 : 500,
    background: active ? '#e0f2f1' : 'transparent',
    display:'flex', alignItems:'center', gap:8,
  });
  const filterInputSt = {
    height:36, padding:'0 11px', borderRadius:9,
    border:'1px solid #b2dfdb', background:'#f0fdf5',
    fontSize:13, color:'#0d2b1e', outline:'none',
    fontFamily:'inherit', boxSizing:'border-box', width:'100%',
  };

  return (
    <div style={{ fontFamily:"'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        .db-root * { box-sizing:border-box; }
        .db-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:900px){ .db-kpi-grid{ grid-template-columns:repeat(2,1fr); } }
        .db-kpi-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; }
        .db-kpi-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); }
        .db-placeholder-val { font-size:13px; font-weight:700; padding:6px 14px; border-radius:10px; background:#f0fdf5; border:1.5px dashed #a7f3d0; color:#5a7a65; display:inline-block; margin-top:4px; }
        .db-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
        .db-tab-group { display:flex; gap:3px; background:#f0faf4; border-radius:12px; padding:4px; }
        .db-tab { padding:6px 14px; border-radius:9px; border:none; background:transparent; font-size:12px; font-weight:600; color:#5a7a65; cursor:pointer; transition:all .15s; font-family:inherit; }
        .db-tab.active { background:linear-gradient(135deg,#00c853,#00897b); color:#fff; box-shadow:0 2px 8px rgba(0,180,90,.35); }
        .db-tab:hover:not(.active) { color:#0d2b1e; background:#ddf5e6; }
        .db-date-input { padding:7px 11px; border-radius:9px; border:1.5px solid #b2dfdb; background:#f0fdf5; font-size:12px; font-family:inherit; color:#0d2b1e; outline:none; }
        .db-date-input:focus { border-color:#00897b; }
        .db-apply-btn { padding:7px 16px; border-radius:9px; border:none; background:linear-gradient(135deg,#00c853,#00897b); color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
        .db-chart-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:22px; padding:22px 24px 16px; box-shadow:0 2px 20px rgba(0,140,60,0.07); margin-bottom:18px; }
        .db-chart-wrap { position:relative; cursor:crosshair; user-select:none; }
        .db-tooltip { position:absolute; background:linear-gradient(135deg,#0d2b1e,#1a4a2e); color:#fff; border-radius:12px; padding:9px 14px; pointer-events:none; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.22); transform:translate(-50%,-100%) translateY(-12px); z-index:10; }
        .db-tooltip::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#1a4a2e; border-bottom:none; }
        .db-ins-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:800px){ .db-ins-grid{ grid-template-columns:1fr; } }
        .db-ins-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:18px 20px; box-shadow:0 2px 12px rgba(0,140,60,0.06); }
        .db-archive-panel { background:#fff; border:1px solid rgba(0,168,76,0.15); border-radius:18px; padding:22px 24px; box-shadow:0 2px 16px rgba(0,140,60,0.08); margin-bottom:18px; }
        .db-archive-row { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:10px; border:1px solid #e0f2f1; margin-bottom:8px; background:#f8fffe; }
        .db-archive-row:hover { background:#e8fdf0; }
        .db-archive-btn { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; border:1px solid; }
        .db-viewing-banner { background:linear-gradient(135deg,#0d2b1e,#1a4a2e); color:#fff; border-radius:14px; padding:12px 20px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
        .db-filter-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#e0f2f1; color:#00695c; border:1px solid #b2dfdb; cursor:pointer; }
        .db-filter-chip:hover { background:#b2dfdb; }
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

      <div className="db-root">

        {viewingArchive && (
          <div className="db-viewing-banner">
            <span style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:14 }}>
              <Archive size={16}/> Viewing Archive: {viewingArchive.year}
              <span style={{ opacity:0.6, fontSize:12, fontWeight:400 }}>— saved {viewingArchive.savedAt}</span>
            </span>
            <button onClick={() => setViewingArchive(null)}
              style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:8, padding:'5px 14px', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <X size={12}/> Exit Archive View
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="db-kpi-grid">
          {kpiCards.map((k, i) => (
            <div key={i} className="db-kpi-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a7a65', marginBottom:5 }}>{k.label}</div>
                  {kpiLoading && k.value === null
                    ? <div className="db-placeholder-val">Loading…</div>
                    : k.value !== null && k.value !== undefined
                      ? <div style={{ fontSize:22, fontWeight:800, color:'#0d2b1e' }}>{fmtAmt(k.value)}</div>
                      : <div className="db-placeholder-val">— Pending connection</div>
                  }
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{k.note}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', border:'1px solid rgba(0,168,76,0.12)', borderRadius:16, padding:'14px 18px', marginBottom:18, boxShadow:'0 1px 8px rgba(0,140,60,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a7a65', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
              <Globe size={12} color="#00897b"/> Filter by
            </span>

          
            <div ref={brandRef} style={{ position:'relative', minWidth:190 }}>
              <div onClick={() => { setBrandDropOpen(v=>!v); setBrandQ(''); }}
                style={{ ...filterInputSt, display:'flex', alignItems:'center', gap:7, cursor:'pointer', paddingRight:28, userSelect:'none', color: filterBrand ? '#0d2b1e' : '#5a7a65' }}>
                <Globe size={12} color="#00897b"/>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }}>
                  {selectedBrand ? selectedBrand.name : 'All Brands'}
                </span>
                <ChevronDown size={11} style={{ position:'absolute', right:9, color:'#5a7a65', flexShrink:0 }}/>
              </div>
              {brandDropOpen && (
                <div style={dropSt}>
                  <div style={{ padding:'7px 9px', borderBottom:'1px solid #b2dfdb', position:'sticky', top:0, background:'#fff' }}>
                    <div style={{ position:'relative' }}>
                      <Search size={11} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'#5a7a65' }}/>
                      <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)}
                        placeholder="Search brand…" onClick={e => e.stopPropagation()}
                        style={{ ...filterInputSt, height:30, fontSize:12, paddingLeft:26 }}/>
                    </div>
                  </div>
                  <div style={optSt(!filterBrand)} onMouseDown={() => { setFilterBrand(null); setFilterBranch(null); setBrandDropOpen(false); }}>
                    All Brands
                  </div>
                  {filteredBrands.map(b => (
                    <div key={b.id} style={optSt(filterBrand === b.id)}
                      onMouseDown={() => { setFilterBrand(b.id); setFilterBranch(null); setBrandDropOpen(false); setBrandQ(''); }}>
                      <span style={{ fontSize:16 }}>{b.emoji||''}</span> {b.name}
                      <span style={{ marginLeft:'auto', fontSize:11, color:'#5a7a65' }}>{(b.branches||[]).length} branches</span>
                    </div>
                  ))}
                  {filteredBrands.length === 0 && <div style={{ padding:'12px 14px', fontSize:13, color:'#5a7a65', fontStyle:'italic' }}>No brands found</div>}
                </div>
              )}
            </div>

          
            <div ref={branchRef} style={{ position:'relative', minWidth:200, opacity: filterBrand ? 1 : 0.45, transition:'opacity .15s' }}>
              <div onClick={() => { if(filterBrand){ setBranchDropOpen(v=>!v); setBranchQ(''); } }}
                style={{ ...filterInputSt, display:'flex', alignItems:'center', gap:7, cursor: filterBrand ? 'pointer' : 'not-allowed', paddingRight:28, userSelect:'none', color: filterBranch ? '#0d2b1e' : '#5a7a65' }}>
                <Store size={12} color={filterBrand ? '#00897b' : '#5a7a65'}/>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }}>
                  {filterBranch || (filterBrand ? 'All Branches' : 'Select brand first')}
                </span>
                {filterBrand && <ChevronDown size={11} style={{ position:'absolute', right:9, color:'#5a7a65', flexShrink:0 }}/>}
              </div>
              {branchDropOpen && filterBrand && (
                <div style={dropSt}>
                  <div style={{ padding:'7px 9px', borderBottom:'1px solid #b2dfdb', position:'sticky', top:0, background:'#fff' }}>
                    <div style={{ position:'relative' }}>
                      <Search size={11} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'#5a7a65' }}/>
                      <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)}
                        placeholder="Search branch…" onClick={e => e.stopPropagation()}
                        style={{ ...filterInputSt, height:30, fontSize:12, paddingLeft:26 }}/>
                    </div>
                  </div>
                  <div style={optSt(!filterBranch)} onMouseDown={() => { setFilterBranch(null); setBranchDropOpen(false); }}>
                    All Branches
                  </div>
                  {filteredBranches.map(br => (
                    <div key={br} style={optSt(filterBranch === br)}
                      onMouseDown={() => { setFilterBranch(br); setBranchDropOpen(false); setBranchQ(''); }}>
                      <Store size={11} color="#00897b"/> {br}
                    </div>
                  ))}
                  {filteredBranches.length === 0 && <div style={{ padding:'12px 14px', fontSize:13, color:'#5a7a65', fontStyle:'italic' }}>No branches found</div>}
                </div>
              )}
            </div>

         
            {(filterBrand || filterBranch) && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                {filterBrand && !filterBranch && (
                  <span className="db-filter-chip" onClick={() => { setFilterBrand(null); setFilterBranch(null); }}>
                    {selectedBrand?.emoji} {selectedBrand?.name} <X size={10}/>
                  </span>
                )}
                {filterBranch && (
                  <span className="db-filter-chip" onClick={() => setFilterBranch(null)}>
                    <Store size={10}/> {filterBranch} <X size={10}/>
                  </span>
                )}
                <button onClick={() => { setFilterBrand(null); setFilterBranch(null); }}
                  style={{ padding:'3px 10px', borderRadius:20, border:'1px solid #d1d5db', background:'#f9fafb', color:'#6b7280', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  Clear
                </button>
              </div>
            )}

            {kpiLoading && (
              <span style={{ fontSize:11, color:'#5a7a65', display:'flex', alignItems:'center', gap:5 }}>
                <RefreshCw size={11} style={{ animation:'spin 1s linear infinite' }}/> Loading…
              </span>
            )}

            <div style={{ marginLeft:'auto', fontSize:12, color:'#94a3b8', fontWeight:600 }}>
              {transactions.length.toLocaleString()} transactions · {filterLabel}
            </div>
          </div>
        </div>


        <div className="db-toolbar">
          <div className="db-tab-group">
            <button className={`db-tab${rangeMode==='preset'?' active':''}`} onClick={() => { setRangeMode('preset'); setViewingArchive(null); }}>Preset</button>
            <button className={`db-tab${rangeMode==='custom'?' active':''}`} onClick={() => { setRangeMode('custom'); setViewingArchive(null); }}>Custom Range</button>
          </div>
          {rangeMode === 'preset' ? (
            <div className="db-tab-group">
              {['day','week','month','year'].map(p => (
                <button key={p} className={`db-tab${preset===p?' active':''}`} onClick={() => { setPreset(p); setViewingArchive(null); }}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Calendar size={13} color="#5a7a65"/>
              <input type="date" className="db-date-input" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo}/>
              <span style={{ color:'#5a7a65', fontSize:12, fontWeight:600 }}>to</span>
              <input type="date" className="db-date-input" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom} max={fmt8(today)}/>
              <button className="db-apply-btn" onClick={applyCustomRange}>Apply</button>
            </div>
          )}
          <button onClick={() => setShowArchivePanel(v => !v)}
            style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7, padding:'7px 16px', borderRadius:10, border:'1.5px solid #b2dfdb', background:showArchivePanel?'#e0f2f1':'#fff', color:'#00695c', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            <Archive size={13}/> Archives
            {archives.length > 0 && <span style={{ background:'#00897b', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:800 }}>{archives.length}</span>}
          </button>
        </div>

        {/* Archive panel */}
        {showArchivePanel && (
          <div className="db-archive-panel">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:15, color:'#0d2b1e', display:'flex', alignItems:'center', gap:8 }}>
                <Archive size={16} color="#00897b"/> Yearly Archives
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {!archiveConfirm ? (
                  <>
                    <input type="number" className="db-date-input" style={{ width:90 }} value={archiveYearInput} onChange={e => setArchiveYearInput(e.target.value)} min="2000" max="2100" placeholder="Year"/>
                    <button onClick={() => setArchiveConfirm(true)}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      <Plus size={13}/> Archive Year
                    </button>
                  </>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef9c3', border:'1.5px solid #fde68a', borderRadius:10, padding:'7px 14px' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>Archive {archiveYearInput}?</span>
                    <button className="db-archive-btn" style={{ borderColor:'#00897b', background:'#e0f2f1', color:'#00695c' }} onClick={saveArchive}>Confirm</button>
                    <button className="db-archive-btn" style={{ borderColor:'#d1d5db', background:'#f9fafb', color:'#6b7280' }} onClick={() => setArchiveConfirm(false)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
            {archives.length === 0 ? (
              <div style={{ padding:'24px 0', textAlign:'center', color:'#94a3b8', fontSize:13 }}>No archives yet.</div>
            ) : archives.map(a => (
              <div key={a.year} className="db-archive-row">
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#0d2b1e' }}>{a.label}</div>
                  <div style={{ fontSize:11, color:'#5a7a65', marginTop:2 }}>Saved: {a.savedAt} · Total: {fmtAmt(a.kpis.totalSales)}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="db-archive-btn"
                    style={{ borderColor:viewingArchive?.year===a.year?'#00897b':'#b2dfdb', background:viewingArchive?.year===a.year?'#e0f2f1':'#f8fffe', color:'#00695c' }}
                    onClick={() => { setViewingArchive(viewingArchive?.year===a.year?null:a); setShowArchivePanel(false); }}>
                    {viewingArchive?.year===a.year?'Viewing':'View'}
                  </button>
                  <button className="db-archive-btn" style={{ borderColor:'#fecaca', background:'#fff', color:'#ef4444' }} onClick={() => deleteArchive(a.year)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        
        <div className="db-chart-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:15, color:'#0d2b1e', display:'flex', alignItems:'center', gap:8 }}>
              <BarChart size={16} color="#00897b"/> Revenue Overview
              <span style={{ fontSize:11, fontWeight:600, color:'#5a7a65', background:'#f0fdf5', padding:'3px 10px', borderRadius:8, border:'1px solid #d1eedd' }}>{getRangeLabel()}</span>
              {(filterBrand || filterBranch) && (
                <span style={{ fontSize:11, fontWeight:700, color:'#00695c', background:'#e0f2f1', padding:'3px 10px', borderRadius:8, border:'1px solid #b2dfdb', display:'flex', alignItems:'center', gap:5 }}>
                  {filterBranch
                    ? <><Store size={10}/> {filterBranch}</>
                    : <><Globe size={10}/> {selectedBrand?.name}</>}
                </span>
              )}
            </div>
            {kpiData && (
              <div style={{ fontSize:12, color:'#00897b', fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
                <Check size={11} color="#10B981"/> Live: {fmtAmt(kpiData.totalSales)} · {kpiData.txCount} txns
              </div>
            )}
          </div>

          {values.length === 0 || (total === 0 && !kpiLoading) ? (
            <div style={{ height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fffe', borderRadius:12, border:'1px dashed #b2dfdb', color:'#5a7a65' }}>
              <BarChart2 size={32} color="#b2dfdb"/>
              <div style={{ fontWeight:700, fontSize:14, marginTop:10 }}>No sales data for this selection</div>
              <div style={{ fontSize:12, marginTop:4, color:'#94a3b8' }}>Try a different range, brand, or branch</div>
            </div>
          ) : (
            <div className="db-chart-wrap" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
              <svg ref={svgRef} style={{ width:'100%', display:'block', overflow:'visible' }} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gLine2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e9cd30"/><stop offset="100%" stopColor="#ffa875"/>
                  </linearGradient>
                  <linearGradient id="gArea2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c853" stopOpacity="0.20"/><stop offset="100%" stopColor="#00c853" stopOpacity="0.01"/>
                  </linearGradient>
                  <filter id="glow2"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {yTicks.map((t, i) => (
                  <g key={i}>
                    <line x1={PAD_L} y1={t.y} x2={SVG_W-PAD_R} y2={t.y} stroke="#e2ede6" strokeWidth="1" strokeDasharray="5 4"/>
                    <text x={PAD_L-8} y={t.y+4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily="Poppins,sans-serif">{t.label}</text>
                  </g>
                ))}
                <path d={areaPath} fill="url(#gArea2)"/>
                <path d={linePath} fill="none" stroke="url(#gLine2)" strokeWidth="3" strokeLinecap="round" filter="url(#glow2)"/>
                {pts.map((p, i) => (
                  <text key={i} x={p.x} y={SVG_H-6} textAnchor="middle" fontSize="10.5" fill="#6b9070" fontFamily="Poppins,sans-serif">{p.label}</text>
                ))}
                {tooltip && (
                  <>
                    <line x1={tooltip.x} y1={tooltip.y+7} x2={tooltip.x} y2={PAD_T+plotH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55"/>
                    <circle cx={tooltip.x} cy={tooltip.y} r="6" fill="#00c853" stroke="#fff" strokeWidth="2.5" filter="url(#glow2)"/>
                  </>
                )}
              </svg>
              {tooltip && (
                <div className="db-tooltip" style={{ left:`${(tooltip.x/SVG_W)*100}%`, top:`${(tooltip.y/SVG_H)*100}%` }}>
                  <div style={{ fontSize:10.5, opacity:0.6, marginBottom:2 }}>{tooltip.label}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#a7f3d0' }}>{fmtAmt(tooltip.value)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="db-ins-grid">
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Peak Performance</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              {total > 0
                ? <>{kpiData ? <>Transactions: <strong>{kpiData.txCount}</strong> · </> : ''}Highest revenue on <strong>{peakLabel}</strong> ({getRangeLabel()}). Outperformed average by <strong>{fmtAmt(peak - avg)}</strong>.</>
                : 'No data available for the selected filters and range.'}
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:'#00897b' }}>{total > 0 ? fmtAmt(peak) : '—'}</div>
          </div>
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Trend Direction</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              {total > 0
                ? <>Sales are <strong>{trending ? 'trending upward ↑' : 'trending downward ↓'}</strong> with a <strong>{Math.abs(pctChange)}% change</strong> from start to end of selected range.</>
                : 'No transactions to analyze trends.'}
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:trending?'#00897b':'#d97706' }}>
              {total > 0 ? `${trending?'+':'-'}${Math.abs(pctChange)}%` : '—'}
            </div>
          </div>
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Revenue Summary</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              {kpiData
                ? <>Transactions: <strong>{kpiData.txCount}</strong> · Avg order: <strong>{fmtAmt(kpiData.avgOrder)}</strong><br/>Total revenue: <strong>{fmtAmt(kpiData.totalSales)}</strong> · Scope: <strong>{filterLabel}</strong></>
                : total > 0
                  ? <>Average: <strong>{fmtAmt(avg)}</strong> · Total: <strong>{fmtAmt(total)}</strong> · Scope: <strong>{filterLabel}</strong></>
                  : <>No sales recorded for <strong>{filterLabel}</strong> in this period.</>}
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:'#00897b' }}>{total > 0 ? fmtAmt(kpiData?.totalSales ?? avg) : '—'}</div>
          </div>
        </div>

        {/* Bottom KPI cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { label:'Sales Revenue',  value: kpiData ? kpiData.salesRevenue : null, desc:'Total income from sales pulled from POS transactions.', icon:'' },
            { label:'Sales Profit',   value: kpiData ? kpiData.salesProfit  : null, desc:'Net profit after deducting cost of sales from revenue.', icon:'' },
            { label:'Cost of Sales',  value: kpiData ? kpiData.cogs         : null, desc:'Total cost of goods sold from Inventory movements.', icon:'' },
          ].map((k, i) => (
            <div key={i} style={{ background:'#fff', border: k.value !== null ? '1.5px solid #b2dfdb' : '1.5px dashed #a7f3d0', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 8px rgba(0,140,60,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{k.icon}</span>
                <span style={{ fontWeight:800, fontSize:13, color:'#0d2b1e' }}>{k.label}</span>
              </div>
              <p style={{ fontSize:11.5, color:'#5a7a65', lineHeight:1.6, marginBottom:12 }}>{k.desc}</p>
              {k.value !== null
                ? <div style={{ background:'#e0f2f1', borderRadius:10, padding:'8px 12px', fontSize:16, fontWeight:800, color:'#00695c' }}>{fmtAmt(k.value)}</div>
                : <div style={{ background:'#f0fdf5', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700, color:'#94a3b8', display:'flex', alignItems:'center', gap:6 }}>
                    <RefreshCw size={11} color="#b2dfdb"/> Awaiting POS / Inventory connection
                  </div>}
            </div>
          ))}
        </div>

      </div>
      <AIPredictivePanel
  transactionCount={transactions.length}
  transactions={transactions}
  filterLabel={filterLabel}
  preset={preset}
/>
    </div>
    
  );
}

// MOBILE SHOP
const Field = ({ label, error, children }) => (
    <div>
      <label style={{ fontSize:"0.8rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
      {children}
      {error && <p style={{ color:"#e53935", fontSize:"0.72rem", marginTop:3, fontWeight:600 }}>{error}</p>}
    </div>
  );

function MultiSelectBranchDropdown({ branches, selected, onChange, disabled, error, msInputStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggle = (br) => {
    const updated = selected.includes(br)
      ? selected.filter(b => b !== br)
      : [...selected, br];
    onChange(updated);
  };

  const selectAll = () => onChange([...branches]);
  const clearAll  = () => onChange([]);

  const label = disabled
    ? "Select a brand first"
    : selected.length === 0
      ? "Select branches…"
      : selected.length === branches.length
        ? "All branches"
        : selected.join(", ");

  return (
    <div ref={ref} style={{ position:"relative", marginTop:"0.3rem" }}>
      <div
        onClick={() => { if (!disabled) setOpen(v => !v); }}
        style={{
          ...msInputStyle,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          border: `1px solid ${error ? "#e53935" : "#d1eedd"}`,
          userSelect:"none", paddingRight:10,
          minHeight:36, height:"auto", flexWrap:"wrap", gap:4,
        }}>
        {selected.length > 0 && !disabled ? (
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, flex:1 }}>
            {selected.map(br => (
              <span key={br} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c", border:"1px solid #b2dfdb" }}>
                {br}
                <span
                  onMouseDown={e => { e.stopPropagation(); toggle(br); }}
                  style={{ cursor:"pointer", fontSize:12, lineHeight:1, color:"#5a7a65" }}>×</span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: C.muted, fontSize:13 }}>{label}</span>
        )}
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .15s" }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {open && !disabled && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:500,
          background:C.white, border:`1px solid ${C.border}`, borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.10)", overflow:"hidden",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 12px", borderBottom:`1px solid ${C.border}`, background:"#f8fffe" }}>
            <span onMouseDown={e => { e.preventDefault(); selectAll(); }}
              style={{ fontSize:11, fontWeight:700, color:"#00897b", cursor:"pointer" }}>
              Select All
            </span>
            <span onMouseDown={e => { e.preventDefault(); clearAll(); }}
              style={{ fontSize:11, fontWeight:700, color:C.muted, cursor:"pointer" }}>
              Clear
            </span>
          </div>
          <div style={{ maxHeight:180, overflowY:"auto" }}>
            {branches.length === 0 ? (
              <div style={{ padding:"12px", fontSize:12, color:C.muted, fontStyle:"italic", textAlign:"center" }}>No branches available</div>
            ) : branches.map(br => (
              <div key={br} onMouseDown={e => { e.preventDefault(); toggle(br); }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"9px 12px", cursor:"pointer", fontSize:13,
                  background: selected.includes(br) ? "#f0fdf5" : C.white,
                  borderBottom:`1px solid #f5fdf7`,
                }}>
                <div style={{
                  width:16, height:16, borderRadius:4, flexShrink:0,
                  border: `2px solid ${selected.includes(br) ? "#00897b" : "#b2dfdb"}`,
                  background: selected.includes(br) ? "#00897b" : C.white,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {selected.includes(br) && (
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontWeight: selected.includes(br) ? 700 : 500, color: selected.includes(br) ? "#00695c" : C.ink }}>
                  {br}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileShopContent() {
  const msInputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px",
    border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.875rem",
    color: C.ink, background: C.white, outline: "none", boxSizing: "border-box",
  };

  const [items,         setItems]         = useState([]);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingItem,   setEditingItem]   = useState(null); // holds the item being edited
  const [editErrors,    setEditErrors]    = useState({});
  const [editLoading,   setEditLoading]   = useState(false);
  const [newItem, setNewItem] = useState({ name:"", price:"", unit:"", image_url:"", shop:"", brand:"",  });

  const excelRef = useRef(null);
const [brands, setBrands] = useState([]);

useEffect(() => { fetchItems(); fetchBrands(); }, []);

const fetchBrands = async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
    const data = await res.json();
    setBrands(Array.isArray(data) ? data : []);
  } catch { setBrands([]); }
};

// Derive flat branch list from selected brand
const getBranchesForBrand = (brandName) => {
  const found = brands.find(b => b.name === brandName);
  if (!found) return [];
  return (found.branches || []).map(br => typeof br === "string" ? br : br.name);
};
  const fetchItems = async () => {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
    const data = await res.json();
    setItems(data);
  };

  const validate = () => {
  const newErrors = {};
  if (!newItem.brand) newErrors.brand = "Brand is required";
  if (!newItem.name.trim()) newErrors.name = "Item name is required";
  if (!newItem.price) newErrors.price = "Price is required";
  else if (isNaN(newItem.price) || Number(newItem.price) <= 0) newErrors.price = "Price must be greater than 0";
  if (!newItem.image_url.trim()) newErrors.image_url = "Image URL is required";
  else { try { new URL(newItem.image_url); } catch { newErrors.image_url = "Invalid URL"; } }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const validateEdit = () => {
    const errs = {};
    if (!editingItem.name.trim()) errs.name = "Item name is required";
    if (!editingItem.price) errs.price = "Price is required";
    else if (isNaN(editingItem.price) || Number(editingItem.price) <= 0) errs.price = "Price must be greater than 0";
    if (!editingItem.image_url.trim()) errs.image_url = "Image URL is required";
    else { try { new URL(editingItem.image_url); } catch { errs.image_url = "Invalid URL"; } }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };
const capitalize = (str) => str.trim().replace(/\b\w/g, c => c.toUpperCase());
  const addItem = async () => {
  console.log("addItem called", newItem);  // ADD THIS
  if (loading || !validate()) return;
  console.log("passed validation");  // ADD THIS

  // Duplicate check — same name + shop
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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  name:      capitalize(newItem.name),
  price:     Number(newItem.price),
  unit:      newItem.unit,
  image_url: newItem.image_url,
  shop:      newItem.brand,
  brand:     newItem.brand,
  stock:     0,
}),
    });
    setNewItem({ name:"", price:"", unit:"", image_url:"", shop:"", brand:"", stock:"", branches:[] });
    setErrors({});
    setLoading(false);
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
              name:      capitalize(item.name.trim()),
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
          if (d.success) saved++;
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

  const deleteItem       = async (id) => { await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}`, { method:"DELETE" }); setConfirmDelete(null); fetchItems(); };
  const toggleVisibility = async (id) => { await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}/toggle`, { method:"PUT" }); fetchItems(); };

  return (
    <div style={{ maxWidth:960, margin:"0 auto", fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editingItem && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.white, borderRadius:18, width:"100%", maxWidth:560, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", overflow:"hidden" }}>
            {/* Header */}
            <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:15, fontWeight:900, color:"#fff" }}>Edit Item</span>
              <button onClick={() => { setEditingItem(null); setEditErrors({}); }}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.8)", fontSize:20, cursor:"pointer", lineHeight:1, padding:0 }}>✕</button>
            </div>
            {/* Body */}
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
    <input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name:e.target.value})}
      style={{ ...msInputStyle, border:`1px solid ${editErrors.name ? "#e53935" : C.border}` }} placeholder="e.g. Espresso"/>
  </Field>
  
  <Field label="Price" error={editErrors.price}>
                  <input value={editingItem.price} onChange={e => setEditingItem({...editingItem, price:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
                </Field>
                <Field label="Unit (Optional)">
                  <input value={editingItem.unit || ""} onChange={e => setEditingItem({...editingItem, unit:e.target.value})}
                    style={msInputStyle} placeholder="e.g. per cup, per bottle"/>
                </Field>
                <Field label="Image URL" error={editErrors.image_url}>
                  <input value={editingItem.image_url || ""} onChange={e => setEditingItem({...editingItem, image_url:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.image_url ? "#e53935" : C.border}` }} placeholder="https://..."/>
                  {editingItem.image_url && !editErrors.image_url && (
                    <img src={editingItem.image_url} alt="preview"
                      style={{ marginTop:8, width:72, height:72, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}` }}
                      onError={e => (e.target.style.display="none")}/>
                  )}
                </Field>
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

      {/* ── Add New Item ────────────────────────────────────────────────── */}
      <div style={{ background:C.white, borderRadius:18, border:`1px solid rgba(0,168,76,0.12)`, boxShadow:"0 2px 14px rgba(0,140,60,0.07)", marginBottom:24, overflow:"hidden" }}>
        <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:15, fontWeight:900, color:"#fff", letterSpacing:"-0.01em" }}>Add New Item</span>
        </div>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1rem" }}>
            <Field label="Brand *" error={errors.brand}>
  <select
    value={newItem.brand}
    onChange={e => setNewItem({ ...newItem, brand: e.target.value, shop: e.target.value})}
    style={{ ...msInputStyle, border:`1px solid ${errors.brand ? "#e53935" : C.border}` }}>
    <option value="">Select brand…</option>
    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
  </select>
</Field>
<Field label="Item Name *" error={errors.name}>
  <input value={newItem.name} onChange={e => setNewItem({...newItem, name:e.target.value})}
    style={{ ...msInputStyle, border:`1px solid ${errors.name ? "#e53935" : C.border}` }} placeholder="e.g. Espresso"/>
</Field>
<Field label="Price *" error={errors.price}>
  <input value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})}
    style={{ ...msInputStyle, border:`1px solid ${errors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
</Field>
<Field label="Unit (Optional)">
  <input value={newItem.unit} onChange={e => setNewItem({...newItem, unit:e.target.value})}
    style={msInputStyle} placeholder="e.g. per cup, per bottle"/>
</Field>
<Field label="Image URL *" error={errors.image_url}>
  <input value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url:e.target.value})}
    style={{ ...msInputStyle, border:`1px solid ${errors.image_url ? "#e53935" : C.border}` }} placeholder="https://..."/>
  {newItem.image_url && !errors.image_url && (
    <img src={newItem.image_url} alt="preview"
      style={{ marginTop:8, width:72, height:72, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}` }}
      onError={e => (e.target.style.display="none")}/>
  )}
</Field>
          </div>

          <div style={{ marginTop:"1.25rem", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <label style={{
              display:"inline-flex", alignItems:"center", gap:6,
              height:36, padding:"0 16px", borderRadius:9,
              border:`1px solid ${C.border}`, background:C.white,
              fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", whiteSpace:"nowrap",
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Import Excel
              <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
            </label>

            <button onClick={addItem} disabled={loading}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 20px", borderRadius:9, border:"none",
                background: loading ? C.greenMid : `linear-gradient(135deg,${C.teal},${C.green})`,
                color: C.white, fontWeight:800, fontSize:13, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, boxShadow:"0 2px 10px rgba(0,180,90,0.28)", fontFamily:"inherit" }}>
              {loading ? "Adding…" : <><span style={{ fontSize:15 }}>+</span> Add Item</>}
            </button>
          </div>

          <p style={{ marginTop:10, fontSize:11, color:C.muted, fontStyle:"italic" }}>
            Excel columns: <strong>name</strong>, <strong>price</strong> — <em>shop</em>, <em>brand</em>, <em>unit</em>, <em>stock</em>, <em>image_url</em> optional.
          </p>
        </div>
      </div>

      {/* ── Shop Items Table ---*/}
      <div style={{ background:C.white, borderRadius:18, border:`1px solid rgba(0,168,76,0.12)`, boxShadow:"0 2px 14px rgba(0,140,60,0.07)", overflow:"hidden" }}>
        <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:15, fontWeight:900, color:"#fff", letterSpacing:"-0.01em" }}>Shop Items</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>
        {items.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No shop items yet. Add one above.</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  {["Image","Shop","Item Name","Brand","Price","Unit","Status",""].map((label, i) => (
                    <th key={i} style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", background:"#f8fffe" }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
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
                      <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.brand || <span style={{ fontStyle:"italic" }}>—</span>}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                      <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.unit || <span style={{ fontStyle:"italic" }}>—</span>}</td>

<td style={{ padding:"10px 12px" }}>
  <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background: item.is_visible ? "#e0f2f1" : "#fce4ec", color: item.is_visible ? "#00695c" : "#c62828" }}>
    {item.is_visible ? "Visible" : "Hidden"}
  </span>
</td>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                          {/* Edit */}
                          <button onClick={() => { setEditingItem({...item}); setEditErrors({}); }}
                            style={{ ...smallBtnSt, border:`1px solid #bbdefb`, color:"#1565c0", background:"#e3f2fd" }}>
                            Edit
                          </button>
                          {/* Hide/Show */}
                          <button onClick={() => toggleVisibility(item.id)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}>
                            {item.is_visible ? "Hide" : "Show"}
                          </button>
                          {/* Delete */}
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
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS — 
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS CONTENT — Fixed delete history & restore
// ─────────────────────────────────────────────────────────────────────────────

function ApplicationsContent({ applications: initialApps }) {
  const [applications, setApplications] = useState(initialApps || []);
  const [viewApp,      setViewApp]      = useState(null);
  const [accountApp,   setAccountApp]   = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  
   const showAlert = (message, type = "info") =>
    setAlertModal({ message, type });
  {alertModal && (
    <AlertModal
      message={alertModal.message}
      type={alertModal.type}
      onClose={() => setAlertModal(null)}
    />
  )}
  const [menuApp,      setMenuApp]      = useState(null);
  const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
  const [showAppDeleteHistory, setShowAppDeleteHistory] = useState(false);

  // ── Fetch applications ──────────────────────────────────────────────────
  const fetchApplications = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  // ── Fetch delete history ────────────────────────────────────────────────
  // Backend GET /application-delete-history returns rows shaped:
  //   { id, application_data: {...}, deleted_at }
  // We map them to: { id, data: {...}, deletedAt }
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
  }, []);

  // ── Approve ─────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "approved" }),
      });
      setApplications(prev =>
        prev.map(a => a.id === id ? { ...a, status: "approved" } : a)
      );
    } catch {
      alert("Failed to approve application.");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  // The backend DELETE /applications/:id already saves to application_delete_history
  // automatically (see server.js). We just call DELETE and then re-fetch history.
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.id !== id));
        // Re-fetch history — the backend saved it automatically on DELETE
        await fetchAppDeleteHistory();
      } else {
        alert(data.error || "Failed to delete application.");
      }
    } catch {
      alert("Failed to delete application.");
    }
  };

  // ── Restore ─────────────────────────────────────────────────────────────
  // Backend POST /applications expects camelCase fields (rowToApplication maps them).
  // The stored application_data is the raw DB row (snake_case).
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
        <div onClick={() => setViewApp(null)} style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 500,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 22,
            }}>
              <h2 style={{
                fontFamily: "Montserrat,sans-serif", fontSize: 18,
                fontWeight: 800, color: "#0d2b1e", margin: 0,
              }}>
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
            <p style={{ fontSize: 13, color: "#5a7a65", marginBottom: 20 }}>
              Viewing details for:{" "}
              <strong style={{ color: "#0d2b1e" }}>{viewApp.name}</strong>
            </p>
            {[
              ["Full Name",          viewApp.name],
              ["Email Address",      viewApp.email],
              ["Phone Number",       viewApp.phone],
              ["Franchise Interest", viewApp.franchise],
              ["Date Applied",       viewApp.date],
              ["Status",             viewApp.status?.toUpperCase()],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={bmLabel}>{label}</label>
                <div style={{
                  ...bmInput, background: "#f8fffe",
                  cursor: "default", color: "#0d2b1e",
                  display: "flex", alignItems: "center",
                }}>
                  {val}
                </div>
              </div>
            ))}
            {viewApp.message && (
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Message</label>
                <div style={{
                  ...bmInput, background: "#f8fffe",
                  minHeight: 70, whiteSpace: "pre-wrap", lineHeight: 1.6,
                }}>
                  {viewApp.message}
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
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
      )}

      {/* ── Create Account Modal ── */}
      {accountApp && (
        <CreateAccountModal
          applicant={accountApp}
          onClose={() => setAccountApp(null)}
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
                ) : applications.map(app => (
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
                      {app.date}
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
      </div>
    </>
  );
}

// REPORTS

const REPORT_STATUS = {
  pending:  { label:"Pending",  bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  reviewed: { label:"Reviewed", bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
  approved: { label:"Approved", bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
};

const API = process.env.REACT_APP_API_URL || "";

function ReportsContent() {
  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [brandBranchFilter, setBrandBranchFilter] = useState({});

  // modal states
  const [viewReport,    setViewReport]    = useState(null);
  const [approveReport, setApproveReport] = useState(null);
  const [commentReport, setCommentReport] = useState(null); 
  const [commentText,   setCommentText]   = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);


  // ── Fetch reports from API ──────────────────────────────────────
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

  useEffect(() => { fetchReports(); }, [fetchReports]);

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
    setCommentReport (prev => prev    ? (updated.find(r => r.id === prev.id)    || prev) : null);
  };

  const patchReport = (updated) => {
    setReports(prev => {
      const next = prev.map(r => r.id === updated.id ? updated : r);
      syncModals(next);
      return next;
    });
  };

  // ── Approve ───────────────────────
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/reports/${id}/approve`, { method:"PATCH" });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      patchReport(updated);
      setApproveReport(null);
    } catch {
      alert("Failed to approve report. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Add comment ─────────────────────────────────────────────────
  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/reports/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ text: commentText.trim(), author:"Admin" }),
      });
      if (!res.ok) throw new Error();
      const newComment = await res.json();
      // Append comment locally without re-fetching entire list
      setReports(prev => {
        const next = prev.map(r =>
          r.id === id ? { ...r, comments:[...(r.comments||[]), newComment] } : r
        );
        syncModals(next);
        return next;
      });
      setCommentText("");
    } catch {
      alert("Failed to add comment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete comment ──────────────────────────────────────────────
  const handleDeleteComment = async (reportId, commentId) => {
    try {
      const res = await fetch(`${API}/reports/${reportId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setReports(prev => {
        const next = prev.map(r =>
          r.id === reportId
            ? { ...r, comments: (r.comments||[]).filter(c => c.id !== commentId) }
            : r
        );
        syncModals(next);
        return next;
      });
    } catch {
      alert("Failed to delete comment.");
    }
  };

  // ── Export CSV ──────────────────────────────────────────────────
  const handleExport = (brand) => {
    const params = new URLSearchParams();
    if (brand)                    params.set("brand",  brand);
    if (filterStatus !== "all")   params.set("status", filterStatus);
    window.open(`${API}/reports/export?${params}`, "_blank");
  };

  // ── Derived data ────────────────────────────────────────────────
  const allBrands = [...new Set(reports.map(r => r.brand))];

  const getBrandBranches = (brand) =>
    [...new Set(reports.filter(r => r.brand === brand).map(r => r.branch))];

  const getBrandReports = (brand) => {
    const branchFilter = brandBranchFilter[brand] || "all";
    return reports.filter(r => {
      if (r.brand !== brand) return false;
      if (branchFilter !== "all" && r.branch !== branchFilter) return false;
      // status + search are already filtered server-side, but keep client guard:
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
      {
        label:"Comment", icon:<MessageCircle size={13}/>, color:"#1e40af", bg:"#dbeafe", border:"#93c5fd",
        badge: report.comments?.length || 0,
        onClick:() => { setCommentReport(report); setOpenDropdown(null); },
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

          {viewReport.remark && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff3e0", borderRadius: 12, border: "1px solid #ffcc80" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#e65100", marginBottom: 4 }}>Return Remark</div>
              <div style={{ fontSize: 13, color: "#bf360c" }}>{viewReport.remark}</div>
            </div>
          )}

          {viewReport.comments?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 8 }}>
                Comments ({viewReport.comments.length})
              </div>
              {viewReport.comments.slice(-2).map((c, i) => (
                <div key={c.id || i} style={{ padding: "9px 12px", background: "#f0fdf5", borderRadius: 10, border: "1px solid #d1eedd", marginBottom: 6, fontSize: 12, color: "#0d2b1e" }}>
                  <span style={{ fontWeight: 700, color: "#00897b" }}>{c.author}</span>
                  <span style={{ color: "#5a7a65", marginLeft: 8, fontSize: 11 }}>{fmtDate(c.postedAt)}</span>
                  <div style={{ marginTop: 4 }}>{c.text}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StatusBadge status={viewReport.status}/>
            <button
              onClick={() => { setViewReport(null); setPdfPreviewUrl(null); }}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Close
            </button>
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
            <button onClick={() => handleApprove(approveReport.id)} disabled={actionLoading}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:actionLoading?"not-allowed":"pointer", fontFamily:"inherit", opacity:actionLoading?0.7:1, boxShadow:"0 2px 10px rgba(0,180,90,0.35)" }}>
              {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Check size={14}/>} Approve Report
            </button>
          </div>
        </ModalShell>
      )}

      {/* COMMENT modal */}
      {commentReport && (
        <ModalShell title={`Comments — #${commentReport.id}`} subtitle={commentReport.brand + " · " + commentReport.branch} icon={<MessageCircle size={16} color="#fff"/>} onClose={() => setCommentReport(null)} maxWidth={480}>
          <div style={{ minHeight:180, maxHeight:260, overflowY:"auto", marginBottom:16, display:"flex", flexDirection:"column", gap:8 }}>
            {!commentReport.comments?.length ? (
              <div style={{ padding:"32px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>No comments yet.</div>
            ) : commentReport.comments.map((c, i) => (
              <div key={c.id || i} style={{ padding:"10px 13px", background:c.author==="Admin"?"#f0fdf5":"#f8fffe", borderRadius:11, border:`1px solid ${c.author==="Admin"?"#d1eedd":"#e0f2f1"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:800, fontSize:12, color:"#00897b" }}>{c.author}</span>
                    <span style={{ fontSize:10.5, color:"#5a7a65" }}>{fmtDate(c.postedAt)}</span>
                  </div>
                  {c.id && (
                    <button onClick={() => handleDeleteComment(commentReport.id, c.id)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#d1d5db", padding:2, display:"flex", alignItems:"center" }}
                      onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color="#d1d5db"}>
                      <Trash2 size={11}/>
                    </button>
                  )}
                </div>
                <div style={{ fontSize:13, color:"#0d2b1e" }}>{c.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." rows={2}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAddComment(commentReport.id);} }}
              style={{ ...bmInput, flex:1, resize:"none", lineHeight:1.6 }}/>
            <button onClick={() => handleAddComment(commentReport.id)} disabled={!commentText.trim() || actionLoading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:40, height:40, borderRadius:10, border:"none", background:commentText.trim()?"linear-gradient(135deg,#2E7D32,#00897b)":"#e0e0e0", color:commentText.trim()?"#fff":"#9e9e9e", cursor:commentText.trim()?"pointer":"not-allowed", flexShrink:0 }}>
              {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Check size={16}/>}
            </button>
          </div>
          <div style={{ fontSize:11, color:"#5a7a65", marginTop:6 }}>Enter to send · Shift+Enter for new line</div>
        </ModalShell>
      )}

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <BmStatCard label="Total Reports" value={counts.total}    icon={<FileText size={20} color="#065f46"/>}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All submissions"  />
        <BmStatCard label="Pending"       value={counts.pending}  icon={<AlertTriangle size={20} color="#92400e"/>} bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting review"  />
        <BmStatCard label="Reviewed"      value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>}        bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="Under evaluation" />
        <BmStatCard label="Approved"      value={counts.approved} icon={<Check size={20} color="#065f46"/>}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed"        />
      </div>

      {/* Global filters */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
          <input type="text" placeholder="Search ID or submitter..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...bmInput, paddingLeft:30, width:220, height:34 }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65" }}>Status</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...bmInput, width:"auto", height:34, paddingRight:12, appearance:"none", cursor:"pointer" }}>
            <option value="all">All</option>
            {Object.entries(REPORT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {/* Global export button */}
        <button onClick={() => handleExport(null)}
          style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#f0fdf5", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          <Download size={13}/> Export CSV
        </button>
        <button onClick={fetchReports}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          <RefreshCw size={13}/> Refresh
        </button>
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
              {['Administrator','Franchisee','Manager','Staff'].map(r => <option key={r}>{r}</option>)}
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
          <div style={{ marginBottom:14 }}>
            <label style={{ ...bmLabel, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</span>
              <button type="button" onClick={handleGeneratePassword} style={{ fontSize:11, background:'none', border:'none', color:'#00897b', cursor:'pointer', fontWeight:700, textDecoration:'underline' }}>↺ Generate</button>
            </label>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
              <input type={showPassword?"text":"password"} name="password" value={formData.password} onChange={pwChange}
                placeholder={isEdit?"Leave blank to keep current":""} required={!isEdit}
                style={{ ...bmInput, flex:1, fontFamily:'monospace', letterSpacing:'0.05em' }} />
              <button type="button" onClick={() => setShowPassword(v=>!v)}
                style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:36, padding:'0 12px', flexShrink:0 }}>
                {showPassword?"Hide":"Show"}
              </button>
            </div>
            {showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}
          </div>
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

function UsersContent() {
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

  useEffect(() => { fetchUsers(); }, []);

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
          password: "—",  // placeholder; see note below
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
  const passwordCheck = validatePasswordStrength(formData.password);
  if (!passwordCheck.isValid) {
    showAlert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character", "error");
    return;
  }

  const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
  const payload = { ...formData, brand: selectedBrand?.name || "" };

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
          password: formData.password,  // still plaintext before resetForm() clears it
        }),
      });

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
          { label:'Administrators', value:users.filter(u=>u.role==='Administrator').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
          { label:'Franchisees',    value:users.filter(u=>u.role==='Franchisee').length,                   icon:<Store size={20} color="#065f46"/>,  bg:'linear-gradient(135deg,#dbeafe,#93c5fd)', sub:'Branch owners' },
          { label:'Staff',          value:users.filter(u=>u.role==='Staff'||u.role==='Manager').length,    icon:<Users size={20} color="#92400e"/>,  bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Operational' },
        ].map((s, i) => <BmStatCard key={i} {...s} />)}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
  <div style={{ position:'relative' }}>
    <Search size={14} color="#5a7a65" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
    <input type="text" placeholder="Search name or email…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
      style={{ padding:'9px 12px 9px 32px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, color:'#0d2b1e', background:'#f0fdf5', fontFamily:'inherit', outline:'none', width:240 }}/>
  </div>
  <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
    style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, background:'#f0fdf5', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
    <option value="all">All Roles</option>
    {['Administrator','Franchisor','Franchisee','Manager','Staff'].map(r => <option key={r} value={r}>{r}</option>)}
  </select>
  <select value={filterBrandF} onChange={e => { setFilterBrandF(e.target.value); setFilterBranchF('all'); }}
    style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, background:'#f0fdf5', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
    <option value="all">All Brands</option>
    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
  </select>
  <select value={filterBranchF} onChange={e => setFilterBranchF(e.target.value)} disabled={filterBrandF === 'all'}
    style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, background: filterBrandF === 'all' ? '#f5f5f5' : '#f0fdf5', fontFamily:'inherit', outline:'none', cursor: filterBrandF === 'all' ? 'not-allowed' : 'pointer', opacity: filterBrandF === 'all' ? 0.5 : 1 }}>
    <option value="all">{filterBrandF === 'all' ? 'Select brand first' : 'All Branches'}</option>
    {filterBrandBranches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
  </select>
  {(searchQuery || filterRole !== 'all' || filterBrandF !== 'all' || filterBranchF !== 'all') && (
    <button onClick={() => { setSearchQuery(''); setFilterRole('all'); setFilterBrandF('all'); setFilterBranchF('all'); }}
      style={{ padding:'9px 14px', borderRadius:10, border:'1.5px solid #b2dfdb', background:'#fff', color:'#5a7a65', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
      Clear filters
    </button>
  )}
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

      {/* Modals */}
      {showAddModal  && <UserModal 
      key="add" title="Add New User" 
      onSubmit={handleAddUser}  
      onClose={() => {setShowAddModal(false); resetForm(); }}  
      isEdit={false} formData={formData}
      handleInputChange={handleInputChange}
      selectedBrandId={selectedBrandId}
      setSelectedBrandId={setSelectedBrandId}
      setFormData={setFormData} 
      brands={brands}
      branches={branches}
      brandsLoading={brandsLoading}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showPasswordValidation={showPasswordValidation}
      passwordErrors={passwordErrors}
      handleGeneratePassword={handleGeneratePassword}
      pwChange={pwChange}
    />}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT — 
// ─────────────────────────────────────────────────────────────────────────────
function CommunicationContent() {
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

  const [alertModal,   setAlertModal]   = useState(null); // { message, type }
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm, itemName }

  const showAlert   = (message, type = "info") => setAlertModal({ message, type });
  const showConfirm = (message, onConfirm, itemName = "") => setConfirmModal({ message, onConfirm, itemName });

  const [commUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const isAdminUser = (u) => u?.role?.toLowerCase() === "administrator";

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
    
    console.log("Delete history raw:", data); // 👈 add this temporarily

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

useEffect(() => { fetchAnnouncements(); fetchDeleteHistory(); }, []);

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
    if (!isAdminUser(commUser)) return;
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
    if (!isAdminUser(commUser)) { showAlert("Only administrators can post announcements.", "error"); return; }
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
          userId: commUser.id, role: commUser.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert(data.error || "Failed to save.", "error"); return; }
      setModalVisible(false); setEditing(null); setTitle(""); setContent(""); setImageUrl(""); setImageError(false);
      fetchAnnouncements();
      showAlert(editing ? "Announcement updated successfully!" : "Announcement posted successfully!", "success");
    } catch (err) {
      console.error("Save error:", err);
      showAlert("Failed to save announcement.", "error");
    }
  };

  const handleDelete = (item) => {
    if (!isAdminUser(commUser)) return;
    showConfirm(`You are about to delete this announcement. You can recover it from Delete History.`, async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${item.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: commUser.id, role: commUser.role }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || "Delete failed.", "error"); return; }
        const strId = String(item.id);
        if (pinnedIds.has(strId)) {
          setPinnedIds(prev => { const next = new Set(prev); next.delete(strId); persistPins(next); return next; });
        }
        if (viewingItem?.id === item.id) setViewingItem(null);
        fetchAnnouncements();
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
          userId: commUser.id, role: commUser.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert(data.error || "Failed to restore.", "error"); return; }

      await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, {
        method: "DELETE"
      });

      fetchAnnouncements();
      fetchDeleteHistory();
      showAlert(`"${entry.data.title}" has been restored!`, "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to restore announcement.", "error");
    }
  };

  const handleEdit = (item) => {
    if (!isAdminUser(commUser)) return;
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
            <div style={commStyles.liveChip}>
              <div style={commStyles.liveDot} />
              <span style={commStyles.liveTxt}>LIVE</span>
            </div>
            <button
              onClick={() => { setSearchVisible(v => !v); setSearchQuery(""); }}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: searchVisible ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
              {searchVisible ? "✕" : <Search size={16} color="#fff" />}
            </button>
            {isAdminUser(commUser) && (
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
          ...(isAdminUser(commUser) ? [{ key: "deleteHistory", label: "🗑 Delete History" }] : []),
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
                      {isAdminUser(commUser) && (
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

              {isAdminUser(commUser) && (
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
      {isAdminUser(commUser) && modalVisible && (
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
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MOBILE ORDERS
// ── Status maps ───────────────────────────────────────────────────────────────
const DB_TO_UI_STATUS = {
  pending:   "pending",
  shipping:  "in_transit",
  received:  "received",
  cancelled: "rejected",
};
const UI_TO_DB_STATUS = {
  pending:    "pending",
  accepted:   "pending",
  in_transit: "shipping",
  received:   "received",
  rejected:   "cancelled",
};

const STATUS_CONFIG = {
  pending:    { label:"Processing",    bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  accepted:   { label:"Accepted",   bg:"#e1f5ee", color:"#085041", dot:"#0F6E56" },
  in_transit: { label:"In Transit", bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
  received:   { label:"Received",   bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
  rejected:   { label:"Rejected",   bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
};

const STATUS_FLOW = {
  pending:    { nextAction:"Accept",        nextStatus:"accepted",   secondAction:"Reject", secondStatus:"rejected" },
  accepted:   { nextAction:"Ship",          nextStatus:"in_transit" },
  in_transit: { nextAction:"Mark Received", nextStatus:"received" },
};

function normalizeOrder(o) {
  return {
    id:        `ORD-${String(o.id).padStart(4, "0")}`,
    _dbId:     o.id,
    customer:  o.user_name ?? `User #${o.user_id}`,
    phone:     o.phone  ?? "",
    brand:     o.brand  ?? "",
    branch:    o.branch ?? "",
    address:   o.address ?? "",  
    items:     Array.isArray(o.items) ? o.items : [],
    total:     o.total_amount,
    status:    DB_TO_UI_STATUS[o.status] ?? "pending",
    createdAt: o.created_at,
  };
}
function MobileOrdersContent() {
  const [orders,       setOrders]       = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [error,        setError]        = useState(null);
  const [filterBrand,  setFilterBrand]  = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [viewOrder,    setViewOrder]    = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { id, nextUiStatus, label }
  const [openDropdown, setOpenDropdown] = useState(null); // order.id with open dropdown
  const [activeTab,    setActiveTab]    = useState("active"); // "active" | "completed"
  const printRef = useRef(null);
const [printReceipts, setPrintReceipts] = useState([]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!openDropdown) return;
    const close = () => { setOpenDropdown(null); setDropdownRect(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdown]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.map(normalizeOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Persist active tab so browser refresh stays on this view ──────────────
  useEffect(() => {
    localStorage.setItem("bm_active_tab", "mobile_orders");
  }, []);

  // ── Status advance (actual API call) ──────────────────────────────────────
  const advanceStatus = async (id, nextUiStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const dbStatus = UI_TO_DB_STATUS[nextUiStatus];

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextUiStatus } : o));
    if (viewOrder?.id === id) setViewOrder(v => ({ ...v, status: nextUiStatus }));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/${order._dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: dbStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      fetchOrders();
      alert(`Could not update order: ${err.message}`);
    }
  };

  // ── Request action → open confirm modal ───────────────────────────────────
  const requestAdvance = (id, nextUiStatus, label) => {
    setOpenDropdown(null);
    setConfirmModal({ id, nextUiStatus, label });
  };

  const confirmAdvance = () => {
    if (!confirmModal) return;
    advanceStatus(confirmModal.id, confirmModal.nextUiStatus);
    setConfirmModal(null);
  };

  const allBrands   = [...new Set(orders.map(o => o.brand))];
  const allBranches = [...new Set(orders.map(o => o.branch))];

  const fmtPeso = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

  const filtered = orders.filter(o => {
    if (filterBrand  !== "all" && o.brand  !== filterBrand)  return false;
    if (filterBranch !== "all" && o.branch !== filterBranch) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === "processing").length,
    in_transit: orders.filter(o => o.status === "in_transit").length,
    received:   orders.filter(o => o.status === "received").length,
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  const StatusBadge = ({ status }) => {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
        {s.label}
      </span>
    );
  };

  // ── Confirmation Modal ────────────────────────────────────────────────────
  const ConfirmModal = () => {
    if (!confirmModal) return null;
    const order = orders.find(o => o.id === confirmModal.id);
    const isDanger = confirmModal.nextUiStatus === "rejected";
    return (
      <div
        onClick={() => setConfirmModal(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 18, padding: "28px 30px", maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.22)", border: "1px solid rgba(0,168,76,0.15)" }}
        >
          {/* Icon */}
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: isDanger ? "#fef2f2" : "#f0fdf5", border: `1.5px solid ${isDanger ? "#fecaca" : "#d1eedd"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            {isDanger ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00897b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6"/>
                <path d="M12 10V2"/><path d="M12 2l-3 3"/><path d="M12 2l3 3"/>
              </svg>
            )}
          </div>

          {/* Text */}
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: isDanger ? "#dc2626" : "#00897b", marginBottom: 6 }}>
            Confirm Action
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0d2b1e", marginBottom: 6 }}>
            {confirmModal.label}
          </div>
          <div style={{ fontSize: 13, color: "#5a7a65", marginBottom: 24 }}>
            Order <strong style={{ color: "#0d2b1e" }}>#{confirmModal.id}</strong>
            {order ? <span> · {order.customer}</span> : null}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setConfirmModal(null)}
              style={{ padding: "9px 22px", borderRadius: 9, border: "1px solid #d1eedd", background: "#f8fffe", color: "#5a7a65", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >
              Cancel
            </button>
            <button
              onClick={confirmAdvance}
              style={{
                padding: "9px 22px", borderRadius: 9, border: "none",
                background: isDanger ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Action Dropdown (position:fixed so it never clips or shifts layout) ────
  const [dropdownRect, setDropdownRect] = useState(null);

  const ActionButtons = ({ order }) => {
    const flow = STATUS_FLOW[order.status];
    const isOpen = openDropdown === order.id;
    const btnRef = useRef(null);

    if (!flow) return <span style={{ fontSize: 11, color: "#5a7a65", fontWeight: 600 }}>—</span>;

    const actions = [
      { label: flow.nextAction, nextStatus: flow.nextStatus, danger: false },
      ...(flow.secondAction ? [{ label: flow.secondAction, nextStatus: flow.secondStatus, danger: true }] : []),
    ];

    const handleToggle = (e) => {
      e.stopPropagation();
      if (isOpen) {
        setOpenDropdown(null);
        setDropdownRect(null);
      } else {
        const rect = btnRef.current.getBoundingClientRect();
        setDropdownRect({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenDropdown(order.id);
      }
    };

    return (
      <div style={{ display: "inline-block" }} onClick={e => e.stopPropagation()}>
        <button
          ref={btnRef}
          onClick={handleToggle}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/>
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6"/>
            <path d="M12 10V2"/><path d="M12 2l-3 3"/><path d="M12 2l3 3"/>
          </svg>
          Action
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {isOpen && dropdownRect && (
          <div
            style={{
              position: "fixed",
              top: dropdownRect.top,
              right: dropdownRect.right,
              zIndex: 9999,
              background: "#fff", border: "1px solid #d1eedd", borderRadius: 10,
              boxShadow: "0 8px 28px rgba(0,0,0,0.13)", minWidth: 180, overflow: "hidden",
            }}
          >
            {actions.map(({ label, nextStatus, danger }) => (
              <button
                key={nextStatus}
                onClick={() => requestAdvance(order.id, nextStatus, label)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "10px 14px",
                  background: "transparent", border: "none",
                  borderTop: danger ? "1px solid #fecaca" : "none",
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: 700, textAlign: "left",
                  color: danger ? "#dc2626" : "#0d2b1e",
                }}
                onMouseEnter={e => e.currentTarget.style.background = danger ? "#fff5f5" : "#f0fdf5"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {danger ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loadingData) return (
    <div style={{ padding: 60, textAlign: "center", color: "#5a7a65", fontFamily: "'Montserrat',sans-serif" }}>
      Loading orders…
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "'Montserrat',sans-serif" }}>
      <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>
      <button onClick={fetchOrders}
        style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #d1eedd", background: "#e0f2f1", color: "#00695c", fontWeight: 700, cursor: "pointer" }}>
        Retry
      </button>
    </div>
  );

  // ── Derived tab lists ─────────────────────────────────────────────────────
  const activeOrders    = filtered.filter(o => o.status !== "received" && o.status !== "rejected");
  const completedOrders = filtered.filter(o => o.status === "received" || o.status === "rejected");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Montserrat',sans-serif" }}>

      {/* ── Confirmation Modal ── */}
      <ConfirmModal />

      {/* ── View Order Modal ── */}
      {viewOrder && (
        <div onClick={() => setViewOrder(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "92vh", overflowY: "auto" }}>

            {/* Modal header */}
            <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", borderRadius: "20px 20px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Package size={16} color="#fff" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Order #{viewOrder.id}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{fmtDate(viewOrder.createdAt)}</div>
                </div>
              </div>
              <button onClick={() => setViewOrder(null)}
                style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: "22px 24px" }}>
              {/* Customer */}
              <div style={{ marginBottom: 18, padding: "12px 14px", background: "#f0fdf5", borderRadius: 12, border: "1px solid #d1eedd" }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 6 }}>Customer</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0d2b1e" }}>{viewOrder.customer}</div>
                <div style={{ fontSize: 12, color: "#5a7a65", marginTop: 2 }}>{viewOrder.phone}</div>
              </div>

              {/* Delivery Address */}
              <div style={{ marginBottom: 18, padding: "12px 14px", background: "#fffdf0", borderRadius: 12, border: "1px solid #e8d5a3", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <MapPin size={14} color="#8a6a00" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8a6a00", marginBottom: 4 }}>Delivery Address</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0d2b1e" }}>{viewOrder.address || "—"}</div>
                </div>
              </div>

              {/* Brand / Branch */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[{ label: "Brand", value: viewOrder.brand }, { label: "Branch", value: viewOrder.branch }].map(({ label, value }, i) => (
                  <div key={label} style={{ padding: "10px 12px", background: i === 0 ? "#e0f2f1" : "#f8fffe", borderRadius: 10, border: i === 0 ? "1px solid #b2dfdb" : "1px solid #e0f2f1" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 8 }}>Order Items</div>
                {viewOrder.items.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#5a7a65", fontStyle: "italic", padding: "10px 12px" }}>No item details available.</div>
                ) : viewOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: i % 2 === 0 ? "#f8fffe" : "#fff", border: "1px solid #e0f2f1", marginBottom: 4 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#5a7a65" }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#00897b" }}>{fmtPeso(item.price * item.qty)}</div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e" }}>Total</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#00897b" }}>{fmtPeso(viewOrder.total)}</div>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusBadge status={viewOrder.status} />
                <ActionButtons order={viewOrder} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
 
      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <BmStatCard label="Total Orders"  value={counts.total}      icon={<Package size={20} color="#065f46" />}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All time" />
        <BmStatCard label="Processing"       value={counts.pending}    icon={<AlertTriangle size={20} color="#92400e" />} bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting action" />
        <BmStatCard label="In Transit"    value={counts.in_transit} icon={<TrendingUp size={20} color="#1e40af" />}    bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="On the way" />
        <BmStatCard label="Received"      value={counts.received}   icon={<Check size={20} color="#065f46" />}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed" />
      </div>

      {/* ── Tab bar + Refresh ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #d1eedd", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" }}>
          <button
            onClick={() => setActiveTab("active")}
            style={{
              padding: "8px 22px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7,
              transition: "all .15s",
              background: activeTab === "active" ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
              color: activeTab === "active" ? "#fff" : "#5a7a65",
              boxShadow: activeTab === "active" ? "0 2px 10px rgba(0,180,90,0.28)" : "none",
            }}
          >
            Active Orders
            <span style={{
              padding: "1px 8px", borderRadius: 20, fontSize: 11,
              background: activeTab === "active" ? "rgba(255,255,255,0.25)" : "rgba(0,168,76,0.12)",
              color: activeTab === "active" ? "#fff" : "#00695c",
            }}>
              {activeOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              padding: "8px 22px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7,
              transition: "all .15s",
              background: activeTab === "completed" ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
              color: activeTab === "completed" ? "#fff" : "#5a7a65",
              boxShadow: activeTab === "completed" ? "0 2px 10px rgba(0,180,90,0.28)" : "none",
            }}
          >
            Completed
            <span style={{
              padding: "1px 8px", borderRadius: 20, fontSize: 11,
              background: activeTab === "completed" ? "rgba(255,255,255,0.25)" : "rgba(0,200,83,0.15)",
              color: activeTab === "completed" ? "#fff" : "#00695c",
            }}>
              {completedOrders.length}
            </span>
          </button>
        </div>
        <button onClick={fetchOrders}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #d1eedd", background: "#e0f2f1", color: "#00695c", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          ⟳ Refresh
        </button>
      </div>

      {/* ── Active Orders Panel ── */}
      {activeTab === "active" && (
        <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,140,60,0.07)" }}>
          <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}> Active Orders</span>
            <small style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{activeOrders.length} order{activeOrders.length !== 1 ? "s" : ""}</small>
          </div>
          <div style={{ width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "9%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  {["Order #","Customer","Brand","Branch","Items","Total","Date Placed","Status","Actions"].map(h => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid #d1eedd", background: "#f8fffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "52px 0", textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}></div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#5a7a65", marginBottom: 6 }}>No active orders</div>
                    </td>
                  </tr>
                ) : activeOrders.map(order => (
                  <tr key={order.id}
                    onMouseEnter={e => { Array.from(e.currentTarget.querySelectorAll("td")).forEach(td => td.style.background = "#f6fef8"); }}
                    onMouseLeave={e => { Array.from(e.currentTarget.querySelectorAll("td")).forEach(td => td.style.background = ""); }}
                  >
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontWeight: 800, color: "#0d2b1e", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>#{order.id}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", color: "#374151", overflow: "hidden" }}>
                      <div style={{ fontWeight: 700, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.customer}</div>
                      <div style={{ fontSize: 11, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", maxWidth: "100%", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.brand}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", maxWidth: "100%", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.branch}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0" }}>
                      <button
                        onClick={() => setViewOrder(order)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                          border: "1px solid #b2dfdb", background: "#FFF7ED", color: "#00695c",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        {order.items.length}
                      </button>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontWeight: 800, color: "#00897b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtPeso(order.total)}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontSize: 11, color: "#5a7a65", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtDate(order.createdAt)}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0" }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0" }}><ActionButtons order={order} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Completed Orders Panel ── */}
      {activeTab === "completed" && (
        <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,140,60,0.07)" }}>
          <div style={{ background: "linear-gradient(135deg,#309920,#3B6D11)", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>✓ Completed Orders</span>
            <small style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{completedOrders.length} order{completedOrders.length !== 1 ? "s" : ""}</small>
          </div>
          <div style={{ width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "11%" }} />
              </colgroup>
              <thead>
                <tr>
                  {["Order #","Customer","Brand","Branch","Items","Total","Date Placed","Status"].map(h => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid #d1eedd", background: "#f8fffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "52px 0", textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}></div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#5a7a65", marginBottom: 6 }}>No completed orders</div>
                    </td>
                  </tr>
                ) : completedOrders.map(order => (
                  <tr key={order.id}
                    onMouseEnter={e => { Array.from(e.currentTarget.querySelectorAll("td")).forEach(td => td.style.background = "#f6fef8"); }}
                    onMouseLeave={e => { Array.from(e.currentTarget.querySelectorAll("td")).forEach(td => td.style.background = ""); }}
                  >
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontWeight: 800, color: "#0d2b1e", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>#{order.id}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", color: "#374151", overflow: "hidden" }}>
                      <div style={{ fontWeight: 700, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.customer}</div>
                      <div style={{ fontSize: 11, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", maxWidth: "100%", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.brand}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", maxWidth: "100%", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.branch}</span>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0" }}>
                      <button
                        onClick={() => setViewOrder(order)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                          border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        {order.items.length}
                      </button>
                    </td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontWeight: 800, color: "#00897b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtPeso(order.total)}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", fontSize: 11, color: "#5a7a65", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtDate(order.createdAt)}</td>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0" }}><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function CreateAccountModal({ applicant, onClose, onAlert }) {
  const [tempPassword, setTempPassword] = useState(generateTempPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [branches, setBranches] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
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
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password))    errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
    return errors;
  };

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

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setTempPassword(v);
    setPasswordErrors(validatePasswordStrength(v));
  };

  const handleRegenerate = () => {
    const generated = generateTempPassword();
    setTempPassword(generated);
    setPasswordErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name   = form.fullName.value;
    const email  = form.email.value;
    const phone  = form.phone.value;
    const role   = form.role.value;
    const branch = form.branch.value;
    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
    const brand = selectedBrand?.name || "";

    setSending(true);
    try {
      const userRes = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: tempPassword, role, brand, branch }),
      });
      if (!userRes.ok) {
        const err = await userRes.json();
        onAlert(err.error || "Failed to create account.", "error");
        setSending(false);
        return;
      }
      await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name, password: tempPassword }),
      });
     onAlert(`Account created and credentials sent to ${email}!`, "success");
      onClose();
    } catch (err) {
      onAlert("Something went wrong. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:500, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, fontWeight:800, color:'#0d2b1e', margin:0 }}>Create Account</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #b2dfdb', background:'#e0f2f1', cursor:'pointer', color:'#00695c', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
        </div>
        <p style={{ fontSize:13, color:C.muted, marginBottom:22 }}>Creating account for: <strong style={{ color:'#0d2b1e' }}>{applicant?.name}</strong></p>
        <form onSubmit={handleSubmit}>
          {[['Full Name','fullName','text',applicant?.name],['Email Address','email','email',applicant?.email],['Phone Number','phone','tel',applicant?.phone]].map(([label,name,type,def]) => (
            <div key={name} style={{ marginBottom:14 }}>
              <label style={bmLabel}>{label}</label>
              <input name={name} type={type} defaultValue={def} required style={{ ...bmInput, marginTop:4 }}/>
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Role</label>
            <select name="role" required style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
              <option value="">Select Role</option>
              {['Administrator','Franchisee','Manager','Staff'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Brand</label>
            <select
              name="brand"
              required
              value={selectedBrandId}
              onChange={e => setSelectedBrandId(e.target.value)}
              style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}
              disabled={brandsLoading}>
              <option value="">{brandsLoading ? "Loading brands..." : "Select Brand"}</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Assigned Branch</label>
            <select
              name="branch"
              required
              style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}
              disabled={!selectedBrandId}
            >
              <option value="">
                {!selectedBrandId
                  ? "Select a brand first"
                  : branches.length === 0
                    ? "No branches available"
                    : "Select Branch"}
              </option>
              {branches.map(br => (
                <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option> 
              ))}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ ...bmLabel, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Temporary Password</span>
              <button type="button" onClick={handleRegenerate}
                style={{ fontSize:11, background:'none', border:'none', color:'#00897b', cursor:'pointer', fontWeight:700, textDecoration:'underline' }}>↺ Regenerate</button>
            </label>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
              <input type={showPassword?"text":"password"} value={tempPassword} onChange={handlePasswordChange} required
                style={{ ...bmInput, flex:1, fontFamily:'monospace', letterSpacing:'0.05em' }}/>
              <button type="button" onClick={() => setShowPassword(v=>!v)}
                style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:36, padding:'0 12px', flexShrink:0 }}>
                {showPassword?"Hide":"Show"}
              </button>
            </div>
            <PasswordValidation errors={passwordErrors}/>
            <p style={{ fontSize:11, color:C.muted, marginTop:6 }}>This password will be emailed to the applicant automatically.</p>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:22 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={sending}
              style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:800, cursor:sending?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.28)', opacity:sending?0.7:1 }}>
              {sending ? "Creating..." : "✉ Create & Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
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
        setActiveBranch("");   // reset branch when brand changes
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