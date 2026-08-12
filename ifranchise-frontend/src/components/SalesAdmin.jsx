import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ifranchisejpg from '../assets/ifranchisejpg.jpg';
import franchisync from '../assets/franchisyncjpg.jpg';
import jsPDF from 'jspdf';
import MenuInventoryContent from './MenuInventoryContent';
import StockInventoryContent from './StockInventoryContent';

import {
  FileText, Download, Eye
} from 'lucide-react';

import {
  Home, Box, Layers, ShoppingCart, Package,
  User, LogOut, X, ChevronRight, BarChart2, AlertTriangle,
  Globe, Store, ChevronDown, Search, RefreshCw, TrendingUp, Unlock, Lock,
  Calendar, Archive, Plus, BarChart, Check, MapPin,
} from 'lucide-react';

const C = {
  green: "#00897b", greenDk: "#00695c", greenLt: "#e8f5e9", greenMid: "#c8e6c9",
  teal: "#00c853", ink: "#0d2b1e", muted: "#5a7a65", border: "#d1eedd",
  bg: "#f0fdf5", white: "#ffffff",
};

const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --g1:#00c853; --g2:#00897b; --g3:#1a4a2e; --g4:#0d2b1e;
    --green-primary:#2E7D32; --white:#ffffff;
    --grad-main:linear-gradient(135deg,#00c853,#00897b);
    --grad-bg:linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%);
  }
`;

const smallBtnSt = {
  display:"inline-flex", alignItems:"center", gap:4,
  height:28, padding:"0 10px", borderRadius:7,
  fontSize:12, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", background:C.white,
};

const bmInput = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
  background: "#f0fdf5", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};

const invInputSt = {
  height:36, padding:"0 11px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.bg,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};

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

const bmLabel = {
  display: "block", fontSize: 11, fontWeight: 800, color: "#2e6725",
  marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em",
};

const fmtPeriod = (period) => {
  if (!period) return "—";

  const parts = period.split("→").map(p => p.trim());

  const formatPart = (p) => {
    const d = new Date(p);
    if (isNaN(d.getTime())) return p; 
    return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  };

  return parts.map(formatPart).join(" → ");
};

const fmtPeso = (n) => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

const TrashIcon = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// ─── Shared stat card ─────────────────────────────────────────────────────────
function BmStatCard({ label, value, sub, icon, bg }) {
  return (
    <div
      style={{
        background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
        borderRadius: 18, padding: "20px 22px",
        boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,140,60,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}
    >
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
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SalesAdmin() {
  const navigate = useNavigate();

  const getUserFromStorage = () => {
    const s = localStorage.getItem('user') || localStorage.getItem('rememberedUser') || sessionStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  };

  const [user, setUser]               = useState(getUserFromStorage);
  const [activeModule, setActiveModule] = useState(() => sessionStorage.getItem('sa_activeModule') || 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [brands, setBrands]           = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [preset, setPreset]           = useState("month");

  useEffect(() => {
    const current = getUserFromStorage();
    if (!current) navigate('/admin-login');
    else setUser(current);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('sa_activeModule', activeModule);
  }, [activeModule]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/transactions`)
      .then(r => r.json()).then(d => setTransactions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const confirmLogout = async () => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), credentials: "include",
      });
    } catch {}
    finally {
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("sa_activeModule");
      window.location.href = "/admin-login";
    }
  };

  const navigation = [
    { id: 'dashboard',      label: 'Dashboard',           icon: <Home size={20} />,         section: 'main' },
    { id: 'inventory',      label: 'Menu Inventory',       icon: <Box size={20} />,          section: 'main' },
    { id: 'stockInventory', label: 'Stock Inventory',      icon: <Layers size={20} />,       section: 'main' },
    { id: 'mobileShop',     label: 'Shop Supplies',        icon: <ShoppingCart size={20} />, section: 'main' },
    { id: 'reports',        label: 'Sales & Reports',       icon: <BarChart2 size={20} />,    section: 'main' },
    { id: 'profile',        label: 'Edit Profile',         icon: <User size={20} />,         section: 'account' },
    { id: 'logout',         label: 'Logout',               icon: <LogOut size={20} />,       section: 'account', action: () => setShowLogoutModal(true) },
  ];

  const mainNav    = navigation.filter(n => n.section === 'main');
  const accountNav = navigation.filter(n => n.section === 'account');
  
  const moduleLabel = navigation.find(n => n.id === activeModule)?.label || 'Dashboard';

  return (
    <div className="sa-root">
      <style>{ADMIN_CSS}{`
        .sa-root {
          font-family:'Poppins',sans-serif;
          display:flex; min-height:100vh;
          background:var(--grad-bg);
        }
        .sa-sidebar {
          width:${sidebarCollapsed ? '76px' : '272px'};
          background:#fff;
          box-shadow:2px 0 20px rgba(0,140,60,0.08);
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease; z-index:1000;
          overflow-y:auto; overflow-x:hidden;
        }
        .sa-sidebar-header {
          padding:1.4rem 1rem;
          border-bottom:1px solid rgba(0,168,76,0.1);
          display:flex; align-items:center; justify-content:space-between;
          min-height:72px;
        }
        .sa-logo-mark {
          width:34px; height:34px; border-radius:10px;
          background:var(--grad-main);
          display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:16px; color:#fff;
          font-family:'Montserrat',sans-serif; flex-shrink:0;
          box-shadow:0 4px 12px rgba(0,180,90,.3);
        }
        .sa-brand {
          font-family:'Montserrat',sans-serif;
          font-weight:800; font-size:1.15rem; color:#0d2b1e;
          white-space:nowrap;
        }
        .sa-toggle {
          background:none; border:none; cursor:pointer;
          padding:6px; color:#94a3b8; border-radius:8px; transition:all .2s; flex-shrink:0;
        }
        .sa-toggle:hover { color:#00897b; background:rgba(0,168,76,0.08); }
        .sa-nav { padding:1rem 0.5rem; }
        .sa-nav-section {
          font-size:10px; font-weight:800; text-transform:uppercase;
          letter-spacing:.1em; color:#94a3b8; padding:12px 14px 6px;
          display:${sidebarCollapsed ? 'none' : 'block'};
          font-family:'Montserrat',sans-serif;
        }
        .sa-nav-item {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; color:#5a7a65; cursor:pointer;
          transition:all .2s; border-radius:12px;
          position:relative; margin:2px 0;
          font-weight:600; font-size:14px;
          font-family:'Montserrat',sans-serif;
        }
        .sa-nav-item:hover { background:rgba(0,168,76,0.08); color:#0d2b1e; }
        .sa-nav-item.active {
          background:linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,137,123,0.1));
          color:#00695c;
          box-shadow:inset 0 0 0 1.5px rgba(0,137,123,0.2);
        }
        .sa-nav-item.logout { color:#ef4444; margin-top:8px; }
        .sa-nav-item.logout:hover { background:rgba(239,68,68,0.08); }
        .sa-nav-icon { flex-shrink:0; display:flex; justify-content:center; width:22px; }
        .sa-nav-label { display:${sidebarCollapsed ? 'none' : 'block'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sa-nav-bar { position:absolute; right:0; top:20%; height:60%; width:3px; border-radius:2px; background:var(--grad-main); }
        .sa-main { flex:1; margin-left:${sidebarCollapsed ? '76px' : '272px'}; transition:margin-left 0.3s ease; }
        .sa-topbar {
          background:rgba(255,255,255,0.9); backdrop-filter:blur(12px);
          padding:1rem 2rem; box-shadow:0 2px 16px rgba(0,140,60,0.08);
          display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100;
          border-bottom:1px solid rgba(0,168,76,0.08);
        }
        .sa-topbar-title { font-family:'Montserrat',sans-serif; font-size:1.5rem; font-weight:800; color:#0d2b1e; }
        .sa-topbar-breadcrumb { font-size:12px; color:#94a3b8; font-weight:600; }
        .sa-avatar {
          width:42px; height:42px; border-radius:14px;
          background:var(--grad-main);
          display:flex; align-items:center; justify-content:center;
          font-size:1rem; font-weight:800; color:#fff; cursor:pointer;
          transition:all .2s; box-shadow:0 4px 12px rgba(0,180,90,.3);
          font-family:'Montserrat',sans-serif;
        }
        .sa-avatar:hover { transform:scale(1.08); }
        .sa-content { padding:1.8rem 2rem; }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media(max-width:768px){
          .sa-sidebar{width:${sidebarCollapsed ? '0' : '272px'};transform:translateX(${sidebarCollapsed ? '-100%' : '0'});}
          .sa-main{margin-left:0;}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="sa-logo-mark">iF</div>
              <span className="sa-brand">iFranchise</span>
            </div>
          )}
          {sidebarCollapsed && <div className="sa-logo-mark" style={{ margin: '0 auto' }}>iF</div>}
          {!sidebarCollapsed && (
            <button className="sa-toggle" onClick={() => setSidebarCollapsed(true)}><X size={16} /></button>
          )}
        </div>

        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button className="sa-toggle" onClick={() => setSidebarCollapsed(false)}><ChevronRight size={16} /></button>
          </div>
        )}

        <nav className="sa-nav">
          {!sidebarCollapsed && <div className="sa-nav-section">Sales Operations</div>}
          {mainNav.map(item => (
            <div
              key={item.id}
              className={`sa-nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span className="sa-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="sa-nav-bar" />}
            </div>
          ))}

          {!sidebarCollapsed && <div className="sa-nav-section" style={{ marginTop: 8 }}>Account</div>}
          {accountNav.map(item => (
            <div
              key={item.id}
              className={`sa-nav-item ${activeModule === item.id ? 'active' : ''} ${item.id === 'logout' ? 'logout' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span className="sa-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="sa-main">
        <div className="sa-topbar">
          <div>
            <div className="sa-topbar-breadcrumb">iFranchise Sales Admin → {moduleLabel}</div>
            <h1 className="sa-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 14, fontFamily: 'Montserrat,sans-serif' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Sales Admin — {user?.branch}</div>
            </div>
            <div className="sa-avatar">
              {user?.name ? user.name.trim()[0].toUpperCase() : 'S'}
            </div>
          </div>
        </div>

        <div className="sa-content">
          {activeModule === 'dashboard'      && <SalesDashboardContent transactions={transactions} brands={brands} preset={preset} setPreset={setPreset} />}
          {activeModule === 'inventory'      && <MenuInventoryContent user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'mobileShop'     && <SalesMobileShopContent />}
          {activeModule === 'reports'       && <SalesReportsContent user={user} brands={brands} />}
          {activeModule === 'profile'        && <SalesProfileContent user={user} />}
        </div>
      </main>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{ background: C.white, borderRadius: 22, padding: '32px 36px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', border: '1px solid rgba(0,168,76,0.15)', animation: 'slideUp .25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem', border: '1.5px solid rgba(239,68,68,0.15)' }}>🚪</div>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Log out?</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>You'll need to sign in again to access your account.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif' }}>Cancel</button>
              <button onClick={confirmLogout} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductAnalyticsPanel({ preset, appliedRange, rangeMode, filterBranch, filterBrand, selectedBrand }) {
  const [data,    setData]    = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [tab,     setTab]     = React.useState('top10'); // top10 | fast | slow | buyers | region

  const fetch_ = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === 'preset') {
        params.set('preset', preset);
      } else if (appliedRange) {
        params.set('from', appliedRange.from);
        params.set('to',   appliedRange.to);
      } else {
        params.set('preset', 'month');
      }
      if (filterBranch) {
        params.set('branch', filterBranch);
      } else if (filterBrand && selectedBrand) {
        const names = (selectedBrand.branches || []).map(br => typeof br === 'string' ? br : br.name);
        if (names.length) params.set('branches', names.join(','));
      }
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [preset, rangeMode, appliedRange, filterBranch, filterBrand, selectedBrand]);

  React.useEffect(() => { fetch_(); }, [fetch_]);

  const fmtPeso = n => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const TABS = [
    { id: 'top10',   label: 'Top 10 Products' },
    { id: 'fast',    label: 'Fast Moving' },
    { id: 'slow',    label: 'Slow Moving' },
    { id: 'buyers',  label: 'Top Performers' },
    { id: 'region',  label: 'By Region' },
  ];

  const BAR_COLORS = ['#00c853','#00897b','#26a69a','#43a047','#66bb6a','#80cbc4','#a5d6a7','#b2dfdb','#c8e6c9','#e0f2f1'];

  const maxQty = data
    ? Math.max(1, ...(tab === 'top10' ? data.top10 : tab === 'fast' ? data.fastMoving : data.slowMoving || []).map(p => p.totalQty))
    : 1;

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 22, padding: '22px 24px', boxShadow: '0 2px 20px rgba(0,140,60,0.07)', marginTop: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2E7D32,#00897b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#0d2b1e' }}>Product Analytics</div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>Fast/slow movers · Top sellers · Regional breakdown</div>
          </div>
        </div>
        <button onClick={fetch_} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#00695c', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Summary chips */}
      {data && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Products', value: data.totalProducts },
            { label: 'Fast Movers',    value: data.fastMoving?.length || 0,  color: '#059669', bg: '#d1fae5' },
            { label: 'Slow Movers',    value: data.slowMoving?.length || 0,  color: '#dc2626', bg: '#fee2e2' },
            { label: 'Avg Sales/Product', value: data.avgQty + ' units', color: '#1e40af', bg: '#dbeafe' },
          ].map((c, i) => (
            <div key={i} style={{ padding: '6px 14px', borderRadius: 20, background: c.bg || '#f0fdf5', border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: c.color || '#00695c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}: </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: c.color || '#0d2b1e' }}>{c.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#f0faf4', borderRadius: 12, padding: 4, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              background: tab === t.id ? 'linear-gradient(135deg,#00c853,#00897b)' : 'transparent',
              color:      tab === t.id ? '#fff' : '#5a7a65',
              boxShadow:  tab === t.id ? '0 2px 8px rgba(0,180,90,.28)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>
          <RefreshCw size={20} color="#00897b" style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div style={{ marginTop: 8 }}>Loading product analytics…</div>
        </div>
      )}

      {/* TOP 10 / FAST / SLOW */}
      {!loading && data && (tab === 'top10' || tab === 'fast' || tab === 'slow') && (() => {
        const list = tab === 'top10' ? data.top10 : tab === 'fast' ? data.fastMoving : data.slowMoving;
        if (!list?.length) return <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No data for this filter.</div>;
        const maxR = Math.max(1, ...list.map(p => p.totalRevenue));
        return (
          <div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 90px 90px 180px', gap: 8, padding: '6px 10px', borderBottom: '2px solid #e0f2f1', fontSize: 10, fontWeight: 800, color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              <span>#</span><span>Product</span><span style={{ textAlign: 'right' }}>Units</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ paddingLeft: 8 }}>Sales Bar</span>
            </div>
            {list.map((p, i) => (
              <div key={p.name}
                style={{ display: 'grid', gridTemplateColumns: '24px 1fr 90px 90px 180px', gap: 8, alignItems: 'center', padding: '9px 10px', borderBottom: '1px solid #f0f8f0', borderRadius: 8, marginBottom: 2 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6fef8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 11, fontWeight: 800, color: i < 3 ? ['#f59e0b','#94a3b8','#cd7c2e'][i] : '#9ca3af' }}>
                  {i < 3 ? ['1','2','3'][i] : `${i+1}`}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#5a7a65', marginTop: 1 }}>
                    {Object.entries(p.branchBreakdown).slice(0, 2).map(([br, q]) => `${br}: ${q}`).join(' · ')}
                    {Object.keys(p.branchBreakdown).length > 2 ? ` +${Object.keys(p.branchBreakdown).length - 2} more` : ''}
                  </div>
                </div>
                <span style={{ textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{p.totalQty.toLocaleString()}</span>
                <span style={{ textAlign: 'right', fontWeight: 700, fontSize: 12, color: '#00897b' }}>{fmtPeso(p.totalRevenue)}</span>
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ height: 10, borderRadius: 5, background: '#f0fdf5', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 5, width: `${(p.totalRevenue / maxR) * 100}%`, background: `${BAR_COLORS[i % BAR_COLORS.length]}`, transition: 'width .4s ease' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* TOP PERFORMERS (buyers/cashiers) */}
      {!loading && data && tab === 'buyers' && (() => {
        const list = data.topBuyers || [];
        if (!list.length) return <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No buyer data available.</div>;
        return (
          <div>
            <div style={{ fontSize: 11, color: '#5a7a65', marginBottom: 12, fontStyle: 'italic' }}>
              Based on cashier/staff who processed the most items — proxy for top performers.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 100px 1fr', gap: 8, padding: '6px 10px', borderBottom: '2px solid #e0f2f1', fontSize: 10, fontWeight: 800, color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              <span>#</span><span>Name</span><span style={{ textAlign: 'right' }}>Items Sold</span><span style={{ paddingLeft: 8 }}>Top Product</span>
            </div>
            {list.map((b, i) => (
              <div key={b.name}
                style={{ display: 'grid', gridTemplateColumns: '24px 1fr 100px 1fr', gap: 8, alignItems: 'center', padding: '9px 10px', borderBottom: '1px solid #f0f8f0', borderRadius: 8, marginBottom: 2 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6fef8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 11, fontWeight: 800, color: i < 3 ? ['#f59e0b','#94a3b8','#cd7c2e'][i] : '#9ca3af' }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                </span>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: '#00897b' }}>{b.totalItems.toLocaleString()}</div>
                <div style={{ paddingLeft: 8, fontSize: 12, color: '#5a7a65', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ background: '#e0f2f1', color: '#00695c', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{b.topProduct}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* REGION */}
      {!loading && data && tab === 'region' && (() => {
        const regions = ['Luzon', 'Visayas', 'Mindanao', 'Other'];
        const hasAny  = regions.some(r => data.regionTop5?.[r]?.length > 0);
        if (!hasAny) return <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No regional data — make sure your branches have regions assigned in Brand & Branch settings.</div>;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {regions.map(region => {
              const items = data.regionTop5?.[region] || [];
              const regionColors = { Luzon: { bg: '#e0f2f1', border: '#00897b', accent: '#00897b' }, Visayas: { bg: '#dbeafe', border: '#1d4ed8', accent: '#1d4ed8' }, Mindanao: { bg: '#fef9c3', border: '#ca8a04', accent: '#ca8a04' }, Other: { bg: '#f3f4f6', border: '#6b7280', accent: '#6b7280' } };
              const rc = regionColors[region];
              const maxQ = Math.max(1, ...items.map(p => p.qty));
              return (
                <div key={region} style={{ background: '#fff', border: `1.5px solid ${rc.border}20`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ background: rc.bg, padding: '10px 14px', borderBottom: `1px solid ${rc.border}30` }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: rc.accent }}>
                      {region === 'Luzon' ? '🏝️' : region === 'Visayas' ? '🌊' : region === 'Mindanao' ? '🌿' : '📍'} {region}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a7a65', marginTop: 2 }}>Top 5 products</div>
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    {items.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', padding: '8px 0' }}>No sales data</div>
                    ) : items.map((p, i) => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: rc.accent, minWidth: 16 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ height: 5, borderRadius: 3, background: '#f0f0f0', marginTop: 3 }}>
                            <div style={{ height: '100%', borderRadius: 3, width: `${(p.qty / maxQ) * 100}%`, background: rc.accent }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: rc.accent, flexShrink: 0 }}>{p.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

    </div>
  );
}

// SALES DASHBOARD
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
  }[type] || { borderColor: '#888780', bg: '#F1EFE8', color: '#5F5E5A' });

  const anomalyConfig = anomalyType => ({
    ghost_sales:          { label: 'Ghost sales',    dot: '#A32D2D', badgeBg: '#FCEBEB', badgeColor: '#791F1F' },
    low_stock_no_reorder: { label: 'Not reordering', dot: '#BA7517', badgeBg: '#FAEEDA', badgeColor: '#633806' },
    dead_stock:           { label: 'Dead stock',     dot: '#185FA5', badgeBg: '#E6F1FB', badgeColor: '#0C447C' },
  }[anomalyType] || {   label: 'Anomaly',        dot: '#888780', badgeBg: '#F1EFE8', badgeColor: '#5F5E5A' });

  const kpiAccent = (index, analysis) => {
    if (index === 0) return analysis.projectedChange >= 0 ? '#3B6D11' : '#A32D2D';
    if (index === 2) return '#BA7517';
    if (index === 3) return analysis.confidence >= 80 ? '#3B6D11' : analysis.confidence >= 60 ? '#BA7517' : '#A32D2D';
    return '#888780';
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,168,76,0.12)',
      borderRadius: 18,
      padding: '14px 18px',
      boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
      marginTop: 16,
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#185FA5', flexShrink: 0,
          }}/>
          <div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 14, color: '#0d2b1e' }}>
              AI Prescriptive Analysis
            </div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>
              Groq · llama-3.3-70b{lastRun && ` · Last run ${lastRun}`}
            </div>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9,
            border: '1px solid #185FA5',
            background: loading ? '#f0f0f0' : '#E6F1FB',
            color: loading ? '#9e9e9e' : '#0C447C',
            fontSize: 12, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? (
            <>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2}
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {analysis ? 'Re-run analysis' : 'Run AI analysis'}
            </>
          )}
        </button>
      </div>

      {/* ── Empty state ── */}
      {!analysis && !loading && !error && (
        <div style={{
          padding: '28px 0', textAlign: 'center',
          border: '1px dashed #b2dfdb', borderRadius: 12,
          color: '#5a7a65',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            Ready to analyze your data
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {transactions?.length
              ? `${transactions.length} transactions loaded · ${filterLabel}`
              : 'Select a date range and branch filter, then run the analysis'}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: '#FCEBEB', border: '1px solid #F7C1C1',
          color: '#791F1F', fontSize: 12, fontWeight: 600,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '28px 0', color: '#5a7a65', fontSize: 13,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="#185FA5" strokeWidth={2}
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Sending {transactions?.length} transactions to Groq…
        </div>
      )}

      {/* ── Results ── */}
      {analysis && !loading && (
        <>

          {/* KPI row — colored left-border accent */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 8, marginBottom: 14,
          }}>
            {[
              {
                label: 'Projected 7-day',
                value: fmtPeso(analysis.projectedRevenue),
                sub: `${analysis.projectedChange >= 0 ? '↑' : '↓'} ${Math.abs(analysis.projectedChange || 0).toFixed(1)}% vs prior`,
              },
              {
                label: 'Peak day',
                value: analysis.peakDay || '—',
                sub: 'Highest revenue expected',
              },
              {
                label: 'Slowest day',
                value: analysis.slowestDay || '—',
                sub: `↓ ${Math.abs(analysis.slowestDayDropPct || 0).toFixed(0)}% below avg`,
              },
              {
                label: 'Confidence',
                value: `${analysis.confidence || 0}%`,
                sub: analysis.confidence >= 80 ? 'High — strong data'
                  : analysis.confidence >= 60 ? 'Medium — limited data'
                  : 'Low — need more data',
              },
            ].map((card, i) => {
              const accent = kpiAccent(i, analysis);
              return (
                <div key={i} style={{
                  background: '#f8fffe',
                  border: '1px solid #e0f2f1',
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 10,
                  padding: '9px 12px',
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: '#5a7a65', marginBottom: 4,
                  }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0d2b1e', marginBottom: 3 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>
                    {card.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Anomalies as a table */}
          {analysis.stockAnomalies?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#A32D2D',
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                  stroke="#A32D2D" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Stock vs sales anomalies — {analysis.stockAnomalies.length} detected
              </div>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                fontSize: 12, tableLayout: 'fixed',
              }}>
                <colgroup>
                  <col style={{ width: '16px' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '24%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['', 'Type', 'Branch', 'Finding', 'Action'].map(h => (
                      <th key={h} style={{
                        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: '#5a7a65',
                        padding: '0 8px 7px', textAlign: 'left',
                        borderBottom: '1px solid #e0f2f1',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.stockAnomalies.map((anomaly, i) => {
                    const cfg = anomalyConfig(anomaly.anomalyType);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f8f0' }}
                        onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f6fef8')}
                        onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '')}>
                        <td style={{ padding: '8px 8px 8px 4px' }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: cfg.dot, display: 'inline-block',
                          }}/>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px',
                            borderRadius: 20, background: cfg.badgeBg,
                            color: cfg.badgeColor, whiteSpace: 'nowrap',
                          }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={{
                          padding: '8px', fontWeight: 700,
                          color: '#0d2b1e', fontSize: 12,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {anomaly.branch}
                        </td>
                        <td style={{
                          padding: '8px', color: '#5a7a65', fontSize: 12,
                          lineHeight: 1.45,
                        }}>
                          {anomaly.finding}
                        </td>
                        <td style={{
                          padding: '8px', color: '#0C447C',
                          fontSize: 12, lineHeight: 1.45,
                        }}>
                          {anomaly.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* No anomalies */}
          {analysis.stockAnomalies?.length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 9,
              background: '#f0fdf5', border: '1px solid #d1eedd',
              marginBottom: 12, fontSize: 12, fontWeight: 700, color: '#3B6D11',
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                stroke="#3B6D11" strokeWidth={2.5} strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              No stock vs sales anomalies detected for this period.
            </div>
          )}

          {/* Summary — inline callout */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#f8fffe', border: '1px solid #e0f2f1',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="#185FA5" strokeWidth={2.5} strokeLinecap="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65, margin: 0 }}>
              {analysis.summary}
            </p>
          </div>

          {/* Recommendations — 2-column grid */}
          {analysis.recommendations?.length > 0 && (
            <>
              <div style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#5a7a65', marginBottom: 8,
              }}>
                Recommendations
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: analysis.recommendations.length > 2 ? '1fr 1fr' : '1fr',
                gap: 6,
              }}>
                {analysis.recommendations.map((rec, i) => {
                  const s = typeStyle(rec.type);
                  return (
                    <div key={i} style={{
                      borderLeft: `2px solid ${s.borderColor}`,
                      background: s.bg,
                      borderRadius: '0 8px 8px 0',
                      padding: '8px 12px',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: s.color, marginBottom: 3,
                      }}>
                        {rec.branch}
                      </div>
                      <div style={{ fontSize: 12, color: '#0d2b1e', lineHeight: 1.55 }}>
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

function SalesDashboardContent({ transactions, brands: propBrands = [] }) {
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
<ProductAnalyticsPanel
  preset={preset}
  appliedRange={appliedRange}
  rangeMode={rangeMode}
  filterBranch={filterBranch}
  filterBrand={filterBrand}
  selectedBrand={selectedBrand}
/>
    </div>
    
  );
}

// MOBILE SHOP CONTENT
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
    <div style={{
      position:"fixed", top:22, right:22, zIndex:4000, display:"flex", alignItems:"flex-start", gap:12,
      maxWidth:380, padding:"16px 18px", borderRadius:14,
      background: isErr ? "#fef2f2" : "#f0fdf5",
      borderLeft: `5px solid ${isErr ? "#dc2626" : "#00897b"}`,
      border: `1px solid ${isErr ? "#fecaca" : "#b2dfdb"}`,
      borderLeftWidth: 5,
      boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
      fontFamily:"'Montserrat',sans-serif",
      animation:"toastIn .22s ease",
    }}>
      <div style={{
        flexShrink:0, width:32, height:32, borderRadius:"50%", display:"flex",
        alignItems:"center", justifyContent:"center",
        background: isErr ? "#dc2626" : "#00897b", color:"#fff",
        boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(0,137,123,0.4)"}`,
      }}>
        {isErr
          ? <AlertTriangle size={16}/>
          : isLoading
            ? <RefreshCw size={16} style={{ animation:"spin 0.8s linear infinite" }}/>
            : <Check size={16}/>}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color: isErr ? "#7f1d1d" : "#0d2b1e" }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize:12.5, color: isErr ? "#991b1b" : "#3f5f4f", marginTop:3, lineHeight:1.4 }}>
            {toast.message}
          </div>
        )}
      </div>

      {!isLoading && (
        <button onClick={onClose} style={{
          background:"none", border:"none",
          color: isErr ? "#991b1b" : "#3f5f4f",
          cursor:"pointer", padding:2, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

function ShopDeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:680, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#e53935" }}>{history.length} deleted</span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            ✕
          </button>
        </div>
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 90px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:700, color:"#5a7a65", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            <span>Item</span><span>Shop</span><span>Price</span><span>Deleted At</span><span></span>
          </div>
        )}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => {
            const d = entry.data || {};
            return (
              <div key={entry.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 90px 110px 100px", gap:8, alignItems:"center", padding:"12px 0", borderBottom: i < history.length-1 ? "1px solid #f0f8f0" : "none" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                  <div style={{ fontSize:11, color:"#5a7a65", marginTop:2 }}>{d.brand || "—"}</div>
                </div>
                <div style={{ fontSize:12, color:"#5a7a65" }}>{d.shop}</div>
                <div style={{ fontSize:12, color:C.green, fontWeight:700 }}>{fmtPeso(d.price || 0)}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deletedAt ? new Date(entry.deletedAt).toLocaleString("en-PH", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Manila" }) : "—"}</div>
                <button onClick={() => onRestore(entry)} disabled={restoringId !== null}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:"1.5px solid #00897b", background:"#e0f2f1", color:"#00695c", fontSize:12, fontWeight:700, cursor: restoringId !== null ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity: restoringId !== null ? (restoringId === entry.id ? 0.85 : 0.4) : 1 }}>
                  {restoringId === entry.id ? "Restoring…" : "Restore"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ShopDeleteConfirmModal({ item, deleting, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:"#fef2f2", padding:"20px 24px 16px", borderBottom:"1px solid #fecaca" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Item</div>
          <div style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>
            Are you sure you want to delete <strong>"{item.name}"</strong>?
          </div>
          <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
            This will move the item to Delete History where it can be restored.
          </div>
        </div>
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:20 }}>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Shop</div>
            <div style={{ fontWeight:700, color:C.ink }}>{item.shop}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Price</div>
            <div style={{ fontWeight:700, color:C.ink }}>{fmtPeso(item.price)}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Stock</div>
            <div style={{ fontWeight:700, color:C.ink }}>{item.stock ?? 0}</div>
          </div>
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} disabled={deleting} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor: deleting ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: deleting ? 0.5 : 1 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#e53935", color:"#fff", fontWeight:700, fontSize:13, cursor: deleting ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: deleting ? 0.7 : 1 }}>
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
    <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.white, borderRadius:18, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:"1px solid #c8e6c9", fontFamily:"Montserrat,sans-serif", textAlign:"center" }}>
        <div style={{ fontSize:16, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>
        <div style={{ background:"#e8f5e9", borderRadius:999, height:6, overflow:"hidden", marginBottom:12 }}>
          <div style={{ background:`linear-gradient(90deg,${C.teal},${C.green})`, borderRadius:999, height:"100%", width:`${progress.percent}%`, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:6 }}>{progress.label}</div>
        {progress.current > 0 && (
          <div style={{ fontSize:11, color:C.muted, opacity:0.7 }}>{progress.current} / {progress.total} rows processed</div>
        )}
        <div style={{ marginTop:18, fontSize:12, fontWeight:700, color:C.green }}>Do not close this window</div>
      </div>
    </div>
  );
}

function UIModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type, title, message, confirmLabel, cancelLabel } = modal;
  const hc = {
    error:   { bg:"#fef2f2", border:"#fecaca", titleColor:"#991b1b" },
    success: { bg:"#e8f5e9", border:"#c8e6c9", titleColor:"#00695c" },
    info:    { bg:"#eff6ff", border:"#bfdbfe", titleColor:"#1e3a8a" },
    confirm: { bg:"#fef2f2", border:"#fecaca", titleColor:"#991b1b" },
  }[type] || { bg:"#eff6ff", border:"#bfdbfe", titleColor:"#1e3a8a" };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:`1px solid ${hc.border}`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:hc.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${hc.border}` }}>
          <div style={{ fontSize:15, fontWeight:800, color:hc.titleColor, marginBottom:4 }}>{title}</div>
          {message && <div style={{ fontSize:13, color:C.ink, lineHeight:1.6, opacity:0.85 }}>{message}</div>}
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          {type === "confirm" && (
            <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            onClick={type === "confirm" ? onConfirm : onClose}
            style={{
              padding:"8px 18px", borderRadius:8, border:"none",
              background: type === "confirm" ? "#e53935" : `linear-gradient(135deg,${C.teal},${C.green})`,
              color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
        <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff3e0", color: "#e65100", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <AlertIcon />
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, marginBottom: 6 }}>Can't Unlist This Item</div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            <strong style={{ color: C.ink }}>{item.name}</strong> is linked to past orders and can't be removed from the Mobile Shop. Hide it instead — that keeps order history intact while taking it off the customer-facing shop.
          </div>
        </div>
        <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
          <button onClick={onClose} className="msc-btn"
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Close
          </button>
          <button onClick={() => onHideInstead(item)} className="msc-btn"
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.teal},${C.green})`, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,180,90,0.3)" }}>
            Hide Instead
          </button>
        </div>
      </div>
    </div>
  );
}

const normalize = (str) => (str || "").trim().toLowerCase();
const MARKUP = 1.10; // shop price = stock cost + 10%

/* ── tiny inline icons (no external deps beyond lucide's core set) ── */

const EditIcon   = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const EyeIcon    = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EyeOffIcon = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44" /><path d="M1 1l22 22" /><path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" /></svg>;
const BoxIcon    = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const CheckCircleIcon = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const AlertIcon  = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const TagIcon    = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2.41 12.42A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" /><circle cx="7" cy="7" r="1" /></svg>;
const ListIcon   = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const LayersIcon = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;

/* ── shared style atoms (mirrors Stock Inventory's system) ── */
const msInputStyle = {
  width: "100%", height: 38, padding: "0 12px", borderRadius: 9,
  border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.85rem",
  color: C.ink, background: C.white, outline: "none", boxSizing: "border-box",
  fontFamily: "'Montserrat', sans-serif", transition: "border-color .15s, box-shadow .15s",
};
const readOnlyFieldStyle = {
  width: "100%", minHeight: 38, padding: "9px 12px", borderRadius: 9,
  border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.85rem",
  color: C.muted, background: "#f5f5f5", boxSizing: "border-box",
  fontFamily: "'Montserrat', sans-serif", fontWeight: 700, display: "flex", alignItems: "center",
};
const toolbarBtnSt = {
  display: "inline-flex", alignItems: "center", gap: 6,
  height: 38, padding: "0 16px", borderRadius: 9,
  fontSize: 13, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", whiteSpace: "nowrap", border: "none",
};

const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  });
};

const computePrice = (cost) => (cost > 0 ? Math.round(cost * MARKUP * 100) / 100 : 0);
const keyFor = (item) => (item.id != null ? `id-${item.id}` : `new-${normalize(item.brand)}-${normalize(item.name)}`);

const placeholderImageFor = (name) =>
  `https://placehold.co/150x150/e8f5e9/2e7d32?text=${encodeURIComponent((name || "").slice(0, 8))}`;

function SalesMobileShopContent({ user, brands: propBrands = [] }) {
  const [activityLog,     setActivityLog]     = useState([]);
  const [shopItems,       setShopItems]       = useState([]);
  const [itemsLoading,    setItemsLoading]    = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [editingItem,     setEditingItem]     = useState(null);
  const [editErrors,      setEditErrors]      = useState({});
  const [editLoading,     setEditLoading]     = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterShop,      setFilterShop]      = useState("all");
  const [stockItems,      setStockItems]      = useState([]);
  const [toast,           setToast]           = useState(null);
  const [selectedKeys,    setSelectedKeys]    = useState(() => new Set());
  const [bulkListing,     setBulkListing]     = useState(false);
  const [filterListed,    setFilterListed]    = useState("all");

  const editImageRef = useRef(null);

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id: row.id, action: row.action,
        itemName: row.item_name ?? row.itemName,
        shop: row.shop,
        performedBy: row.performed_by ?? row.performedBy,
        role: row.role,
        changes: row.changes,
        timestamp: row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch shop activity log:", err); }
  }, []);

  const fetchShopItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
      const data = await res.json();
      setShopItems(Array.isArray(data) ? data : []);
    } catch {
      setShopItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const fetchStockItems = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`);
      const data = await res.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch { setStockItems([]); }
  }, []);

  useEffect(() => {
    fetchShopItems();
    fetchStockItems();
    fetchActivityLog();
  }, [fetchShopItems, fetchStockItems, fetchActivityLog]);

  const getCostFor = useCallback((brandName, itemName) => {
    const b = normalize(brandName), n = normalize(itemName);
    const match = stockItems.find((i) => normalize(i.brand) === b && normalize(i.name) === n);
    return match ? Number(match.cost_per_unit || 0) : 0;
  }, [stockItems]);

  const uniqueStockProducts = useMemo(() => {
    const seen = new Map();
    stockItems.forEach((si) => {
      if (!si.brand || !si.name) return;
      const key = `${normalize(si.brand)}|${normalize(si.name)}`;
      if (!seen.has(key)) seen.set(key, { id: si.id, brand: si.brand, name: si.name });
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [stockItems]);

  const items = useMemo(() => {
    return uniqueStockProducts.map((sp) => {
      const match = shopItems.find(
        (i) => normalize(i.brand) === normalize(sp.brand) && normalize(i.name) === normalize(sp.name)
      );
      const liveCost = getCostFor(sp.brand, sp.name);
      return {
        id: match ? match.id : null,
        ingredient_id: sp.id,
        name: sp.name,
        brand: sp.brand,
        shop: match ? match.shop : sp.brand,
        cost: liveCost,
        price: computePrice(liveCost),
        unit: match ? match.unit : "",
        image_url: match ? match.image_url : "",
        is_visible: match ? !!match.is_visible : false,
        listed: !!match,
      };
    });
  }, [uniqueStockProducts, shopItems, getCostFor]);

  const uniqueShops = [...new Set(items.map((i) => i.shop).filter(Boolean))];

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.shop?.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (filterShop !== "all" && item.shop !== filterShop) return false;
    if (filterListed === "listed" && !item.listed) return false;
    if (filterListed === "unlisted" && item.listed) return false;
    return true;
  });

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

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedKeys.has(keyFor(i)));
  const toggleSelectAllFiltered = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredItems.forEach((i) => next.delete(keyFor(i)));
      } else {
        filteredItems.forEach((i) => next.add(keyFor(i)));
      }
      return next;
    });
  };

  const selectedItems = items.filter((i) => selectedKeys.has(keyFor(i)));
  const selectedUnlistedCount = selectedItems.filter((i) => !i.listed).length;
  const allUnlistedCount = filteredItems.filter((i) => !i.listed).length;

  const validateEdit = () => {
    const errs = {};
    if (!editingItem.cost || editingItem.cost <= 0) errs.cost = "Set a cost for this product in Stock Inventory first";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditingItem((prev) => ({ ...prev, image_url: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openEditor = (item) => {
    setEditingItem({ ...item });
    setEditErrors({});
  };

  const saveEdit = async () => {
    if (editLoading || !validateEdit()) return;
    setEditLoading(true);
    const coords = await getBrowserLocation();
    const liveCost = getCostFor(editingItem.brand, editingItem.name);
    const payload = {
      name: editingItem.name,
      price: computePrice(liveCost),
      unit: editingItem.unit || "",
      image_url: editingItem.image_url || placeholderImageFor(editingItem.name),
      shop: editingItem.brand,
      brand: editingItem.brand,
      ingredient_id: editingItem.ingredient_id || null,
      is_visible: editingItem.is_visible !== false,
      performed_by: user?.name || "System",
      performed_by_role: user?.role || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
    try {
      const url    = editingItem.id ? `${process.env.REACT_APP_API_URL}/shop-items/${editingItem.id}` : `${process.env.REACT_APP_API_URL}/shop-items`;
      const method = editingItem.id ? "PUT" : "POST";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
      setToast({ type: "error", title: "Connection Error", message: "Failed to save changes." });
    } finally {
      setEditLoading(false);
    }
  };

  const bulkListItems = async (candidateItems) => {
    const toList = candidateItems.filter((i) => !i.listed);
    if (toList.length === 0) {
      setToast({ type: "error", title: "Nothing to List", message: "All selected items are already listed." });
      return;
    }
    setBulkListing(true);
    const coords = await getBrowserLocation();
    let success = 0, failed = 0;
    for (const it of toList) {
      const liveCost = getCostFor(it.brand, it.name);
      const payload = {
        name: it.name,
        price: computePrice(liveCost),
        unit: it.unit || "",
        image_url: it.image_url || placeholderImageFor(it.name),
        shop: it.brand,
        brand: it.brand,
        ingredient_id: it.ingredient_id || null,
        is_visible: true,
        performed_by: user?.name || "System",
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setBulkListing(false);
    setSelectedKeys(new Set());
    fetchShopItems();
    fetchActivityLog();
    setToast({
      type: failed > 0 ? "error" : "success",
      title: "Bulk Listing Complete",
      message: `${success} item${success === 1 ? "" : "s"} listed${failed > 0 ? `, ${failed} failed` : ""}. Add photos anytime via Edit.`,
    });
  };

  const bulkUnlistItems = async (candidateItems) => {
    const toUnlist = candidateItems.filter((i) => i.listed);
    if (toUnlist.length === 0) {
      setToast({ type: "error", title: "Nothing to Unlist", message: "None of the selected items are listed." });
      return;
    }
    setBulkListing(true);
    const coords = await getBrowserLocation();
    let success = 0, failed = 0;
    for (const it of toUnlist) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${it.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deleted_by: user?.name || "System",
            performed_by_role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setBulkListing(false);
    setSelectedKeys(new Set());
    fetchShopItems();
    fetchActivityLog();
    setToast({
      type: failed > 0 ? "error" : "success",
      title: "Bulk Unlisting Complete",
      message: `${success} item${success === 1 ? "" : "s"} unlisted${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
  };

const deleteItem = async (item) => {
  if (!item.id) { setConfirmDeleteItem(null); return; }
  setDeleteLoading(true);
  const coords = await getBrowserLocation();
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${item.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted_by: user?.name || "System", performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setConfirmDeleteItem(null);
        setBlockedUnlistItem(item);
      } else {
        setToast({ type: "error", title: "Failed to Unlist", message: data.error || "An unexpected error occurred." });
        setConfirmDeleteItem(null);
      }
      return;
    }

    setToast({ type: "success", title: "Listing Removed", message: `"${item.name}" is no longer listed in the Mobile Shop.` });
    setConfirmDeleteItem(null);
  } catch {
    setToast({ type: "error", title: "Connection Error", message: "Failed to remove the listing." });
    setConfirmDeleteItem(null);
  } finally {
    setDeleteLoading(false);
    fetchShopItems();
    fetchActivityLog();
  }
};

  const toggleVisibility = async (item) => {
    if (!item.id) return;
    const coords = await getBrowserLocation();
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${item.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performed_by: user?.name || "System", performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
      });
      fetchShopItems();
      fetchActivityLog();
    } catch {
      setToast({ type: "error", title: "Connection Error", message: "Failed to update visibility." });
    }
  };

  const [blockedUnlistItem, setBlockedUnlistItem] = useState(null);

  const forceHide = async (item) => {
    if (!item.id || item.is_visible === false) { setBlockedUnlistItem(null); return; }
    await toggleVisibility(item);
    setBlockedUnlistItem(null);
  };

  const PhotoPicker = ({ value, onPick, onRemove, inputRef, error }) => (
    <Field label="Photo (optional)" error={error}>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          cursor: "pointer", borderRadius: 12, background: C.bg, textAlign: "center", marginTop: 6,
          border: `1.5px dashed ${error ? C.red : C.border}`,
          padding: value ? 8 : "22px 8px", transition: "border-color .15s, background .15s",
        }}
      >
        {value ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={value} alt="preview" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}`, display: "block", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", border: "2px solid #fff", background: C.red, color: "#fff", fontSize: 11, lineHeight: 1, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
              ✕
            </button>
          </div>
        ) : (
          <div style={{ color: C.muted, fontSize: 12, fontFamily: "'Montserrat', sans-serif" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}></div>
            Click to upload photo
            <div style={{ fontSize: 10.5, marginTop: 4, opacity: 0.75 }}>optional</div>
          </div>
        )}
      </div>
    </Field>
  );

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
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

      {editingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
          <div className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 560, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${C.teal},${C.green})`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <TagIcon size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{editingItem.id ? "Edit Listing" : "List Item"}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{editingItem.brand} · {editingItem.name}</div>
                </div>
              </div>
              <button onClick={() => { setEditingItem(null); setEditErrors({}); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 6, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 11.5, color: "#00695c", background: C.greenLt, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: "10px 13px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14 }}>ℹ️</span>
                <span>This product comes from <strong style={{ color: C.ink }}>Stock Inventory</strong>. Its name, brand, and price can't be edited here — the shop price is always the Stock Inventory cost <strong style={{ color: C.ink }}>+ 10%</strong>. Just set the photo.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                <Field label="Brand">
                  <div style={readOnlyFieldStyle}>{editingItem.brand}</div>
                </Field>
                <Field label="Item Name">
                  <div style={readOnlyFieldStyle}>{editingItem.name}</div>
                </Field>
                <Field label="Shop Price" error={editErrors.cost}>
                  <div style={{ ...readOnlyFieldStyle, background: editErrors.cost ? "#fdeeee" : C.greenLt, border: `1px solid ${editErrors.cost ? C.red : C.greenMid}`, color: editErrors.cost ? C.red : C.green, justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, fontWeight: 900 }}>{editingItem.cost > 0 ? fmtPeso(computePrice(editingItem.cost)) : "—"}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: editErrors.cost ? C.red : "#00897b" }}>
                      {editingItem.cost > 0 ? `cost ${fmtPeso(editingItem.cost)} + 10%` : "no cost set"}
                    </span>
                  </div>
                </Field>
                <Field label="Unit (Optional)">
                  <input value={editingItem.unit || ""} onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    style={msInputStyle} placeholder="e.g. per cup, per bottle" />
                </Field>
                <PhotoPicker value={editingItem.image_url} onPick={handleImageSelect} onRemove={() => setEditingItem({ ...editingItem, image_url: "" })} inputRef={editImageRef} error={editErrors.image_url} />
              </div>
              <input ref={editImageRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />

              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 10, background: editingItem.is_visible !== false ? C.greenLt : "#f7f7f7", border: `1px solid ${editingItem.is_visible !== false ? C.greenMid : C.border}` }}>
                <div onClick={() => setEditingItem((f) => ({ ...f, is_visible: f.is_visible === false }))}
                  style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", position: "relative", background: editingItem.is_visible !== false ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: editingItem.is_visible !== false ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left .2s" }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, cursor: "pointer" }} onClick={() => setEditingItem((f) => ({ ...f, is_visible: f.is_visible === false }))}>
                  Visible in Mobile Shop
                </span>
              </div>

              <div style={{ marginTop: "1.4rem", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setEditingItem(null); setEditErrors({}); }} className="msc-btn"
                  style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={editLoading} className="msc-btn"
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: editLoading ? C.greenMid : `linear-gradient(135deg,${C.teal},${C.green})`, color: C.white, fontWeight: 800, fontSize: 13, cursor: editLoading ? "not-allowed" : "pointer", opacity: editLoading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(0,180,90,0.3)", fontFamily: "inherit" }}>
                  {editLoading ? "Saving…" : editingItem.id ? "Save Changes" : "List Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
          <div className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fdeeee", color: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <AlertIcon />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, marginBottom: 6 }}>Unlist this item?</div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                <strong style={{ color: C.ink }}>{confirmDeleteItem.name}</strong> will be removed from the Mobile Shop. It'll stay in Stock Inventory and can be relisted anytime.
              </div>
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDeleteItem(null)} disabled={deleteLoading} className="msc-btn"
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={() => deleteItem(confirmDeleteItem)} disabled={deleteLoading} className="msc-btn"
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: deleteLoading ? "#ef9a9a" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 13, cursor: deleteLoading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(229,57,53,0.3)" }}>
                {deleteLoading ? "Unlisting…" : "Yes, Unlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: C.white, borderRadius: 18, border: "1px solid rgba(0,168,76,0.12)", boxShadow: "0 4px 20px rgba(0,140,60,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${C.teal},${C.green})`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>Mobile Shop Supplies</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 2 }}>Prices auto-set at cost + 10% · click a row to select it for listing</div>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 700, background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: 20 }}>{items.length} product{items.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "#fafffe" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color="#5a7a65" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Search items…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px 12px 8px 30px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 13, background: C.white, fontFamily: "inherit", outline: "none", width: 220, height: 38, boxSizing: "border-box" }}
            />
          </div>
          <select value={filterShop} onChange={(e) => setFilterShop(e.target.value)}
            style={{ ...msInputStyle, marginTop: 0, width: 120}}>
            <option value="all">All Shops</option>
            {uniqueShops.map((shop) => <option key={shop} value={shop}>{shop}</option>)}
          </select>
          <select value={filterListed} onChange={(e) => setFilterListed(e.target.value)}
            style={{ ...msInputStyle, marginTop: 0, width: 130 }}>
            <option value="all">All Statuses</option>
            <option value="listed">Listed Only</option>
            <option value="unlisted">Not Listed</option>
          </select>
          {(searchQuery || filterShop !== "all" || filterListed !== "all") && (
            <button onClick={() => { setSearchQuery(""); setFilterShop("all"); setFilterListed("all"); }} className="msc-btn"
              style={{ height: 30, padding: "0 8px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#5a7a65" }}>
              Clear
            </button>
          )}

          <span style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
            <button
              onClick={() => bulkListItems(selectedItems)}
              disabled={bulkListing || selectedUnlistedCount === 0}
              className="msc-btn"
              title={selectedUnlistedCount === 0 ? "Select unlisted items in the table to enable this" : "List all selected items"}
              style={{ ...toolbarBtnSt, padding: "0 10px", height: 30, fontSize: 11.5, gap: 5, border: `1.5px solid ${C.green}`, background: C.greenLt, color: C.greenDk }}>
              <ListIcon size={12} /> List Items{selectedUnlistedCount > 0 ? ` (${selectedUnlistedCount})` : ""}
            </button>
            <button
              onClick={() => bulkUnlistItems(selectedItems)}
              disabled={bulkListing || selectedUnlistedCount === selectedItems.length}
              className="msc-btn"
              title={selectedItems.filter(i => i.listed).length === 0 ? "Select listed items in the table to enable this" : "Unlist all selected items"}
              style={{ ...toolbarBtnSt, padding: "0 10px", height: 30, fontSize: 11.5, gap: 5, border: "1.5px solid #ffcdd2", background: "#fdeeee", color: "#c62828" }}>
              <TrashIcon size={12} /> Unlist Items{selectedItems.filter(i => i.listed).length > 0 ? ` (${selectedItems.filter(i => i.listed).length})` : ""}
            </button>
            <button
              onClick={() => bulkListItems(filteredItems)}
              disabled={bulkListing || allUnlistedCount === 0}
              className="msc-btn"
              title="List every currently unlisted item shown below"
              style={{ ...toolbarBtnSt, padding: "0 10px", height: 30, fontSize: 11.5, gap: 5, background: `linear-gradient(135deg,${C.teal},${C.green})`, color: "#fff", boxShadow: "0 3px 12px rgba(0,180,90,0.28)" }}>
              <LayersIcon size={12} /> {bulkListing ? "Listing…" : `List All Items${allUnlistedCount > 0 ? ` (${allUnlistedCount})` : ""}`}
            </button>
          </span>

          <span style={{ fontSize: 12, color: "#5a7a65", fontWeight: 600, width: "100%" }}>
            {filteredItems.length} of {items.length} products{selectedKeys.size > 0 ? ` · ${selectedKeys.size} selected` : ""}
          </span>
        </div>

        {itemsLoading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>
            <RefreshCw size={20} style={{ animation: "spin 0.9s linear infinite", marginBottom: 10 }} />
            <div>Loading shop items…</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "56px 0", textAlign: "center", color: C.muted }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.4 }}><BoxIcon /></div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>No products found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add products in Stock Inventory first — they will then appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: "11px 0 11px 18px", textAlign: "left", borderBottom: `1px solid ${C.border}`, background: "#f8fffe", width: 34 }}>
                    <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered}
                      style={{ width: 15, height: 15, cursor: "pointer", accentColor: C.green }} title="Select all shown" />
                  </th>
                  {["", "Shop", "Item Name", "Price", "Unit", "Status", "Manage"].map((label, i) => (
                    <th key={i} style={{ padding: "11px 14px", textAlign: i === 6 ? "right" : "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", background: "#f8fffe" }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const rowKey = keyFor(item);
                  const isSelected = selectedKeys.has(rowKey);
                  return (
                    <tr
                      key={rowKey}
                      className={`msc-row${isSelected ? " selected" : ""}`}
                      onClick={() => toggleSelect(rowKey)}
                      style={{ borderBottom: "1px solid #f0f8f0", opacity: item.listed ? 1 : 0.82 }}
                    >
                      <td onClick={(e) => e.stopPropagation()} style={{ padding: "11px 0 11px 18px", borderLeft: `3px solid ${isSelected ? C.green : "transparent"}` }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(rowKey)}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: C.green }} />
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ position: "relative", width: 40, height: 40 }}>
                          <img src={item.image_url || null} alt="" style={{ width: 40, height: 40, borderRadius: 9, objectFit: "cover", border: `1px solid ${C.border}`, display: "block", background: C.bg, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }} onError={(e) => (e.target.style.visibility = "hidden")} />
                          {isSelected && (
                            <div style={{ position: "absolute", top: -5, right: -5, width: 15, height: 15, borderRadius: "50%", background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                              <CheckCircleIcon size={10} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c" }}>{item.shop}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontWeight: 700, color: C.ink }}>{item.name}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {item.cost > 0 ? (
                          <div>
                            <div style={{ fontWeight: 800, color: C.green }}>{fmtPeso(item.price)}</div>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>cost {fmtPeso(item.cost)} +10%</div>
                          </div>
                        ) : (
                          <span style={{ fontStyle: "italic", fontWeight: 500, color: C.muted, fontSize: 12 }}>no cost set</span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px", color: C.muted, fontSize: 12 }}>{item.unit || <span style={{ fontStyle: "italic" }}>—</span>}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {item.listed ? (
                          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: item.is_visible ? "#e0f2f1" : "#fce4ec", color: item.is_visible ? "#00695c" : "#c62828" }}>
                            {item.is_visible ? "Visible" : "Hidden"}
                          </span>
                        ) : (
                          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f1f1f1", color: "#8a8a8a" }}>
                            Not Listed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          <button onClick={() => openEditor(item)} className="msc-btn msc-icon-btn msc-edit" title={item.listed ? "Edit listing" : "List this item"}
                            style={{ ...smallBtnSt, border: "1px solid #bbdefb", color: "#1565c0", background: "#e3f2fd" }}>
                            <EditIcon /> {item.listed ? "Edit" : "List"}
                          </button>
                          {item.listed && (
                            <>
                              <button onClick={() => toggleVisibility(item)} className="msc-btn msc-icon-btn msc-hide" title={item.is_visible ? "Hide from shop" : "Show in shop"}
                                style={{ ...smallBtnSt, border: `1px solid ${C.border}`, color: C.green }}>
                                {item.is_visible ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                              <button onClick={() => setConfirmDeleteItem(item)} className="msc-btn msc-icon-btn msc-del" title="Unlist"
                                style={{ ...smallBtnSt, border: "1px solid #ffcdd2", color: "#e53935", background: C.white }}>
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
        )}
      </div>
      <UnlistBlockedModal
        item={blockedUnlistItem}
        onClose={() => setBlockedUnlistItem(null)}
        onHideInstead={forceHide}
      />
    </div>
  );
}

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

const REPORT_STATUS = {
  pending:   { label:"Pending",      bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  approved:  { label:"Acknowledged",     bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
};

const API = process.env.REACT_APP_API_URL || "";

function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <X size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

function SalesReportsContent({ user, brands: propBrands = [] }) {
  const [reports,      setReports]      = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);  
  const [error,        setError]        = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brandBranchFilter, setBrandBranchFilter] = useState({});

  const [activityLog,     setActivityLog]     = useState([]);

  const [viewReport,    setViewReport]    = useState(null);
  const [approveReport, setApproveReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [logoB64, setlogoB64] = useState(null);
  const [iFranchise_logoB64, setiFranchise_logoB64] = useState(null);

  const [filterBrand,  setFilterBrand]  = useState(null); 
  const [filterBranch, setFilterBranch] = useState(null);

  const [alertModal, setAlertModal] = useState(null);

  const showAlert = (title, message, type = "info") => setAlertModal({ title, message, type });

  const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  });
};

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

      const res  = await fetch(`${API}/reports?${params}`);
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

  useEffect(() => { fetchReports(); fetchActivityLog(); }, [fetchReports, fetchActivityLog]);

  useEffect(() => {
    loadImageAsBase64(franchisync).then(setlogoB64).catch(err => console.warn("Failed to load left logo:", err));
    loadImageAsBase64Circular(ifranchisejpg).then(setiFranchise_logoB64).catch(err => console.warn("Failed to load right logo:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

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
  setActionLoading(true);
  try {
    const coords = await getBrowserLocation();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/approve`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        performedBy: user?.name || "System",
        role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    await fetchReports();
    await fetchActivityLog();
    setViewReport(null);
    setApproveReport(null);
    setPdfPreviewUrl(null);
    showAlert("Report Acknowledged", `Report #${report.id} has been acknowledged.`, "success");
  } catch {
    showAlert("Acknowledgment Failed", "Something went wrong while approving this report.", "error");
  } finally {
    setActionLoading(false);
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
    total:     reports.length,
    pending:   reports.filter(r => r.status === "pending").length,
    reviewed:  reports.filter(r => r.status === "submitted").length, 
    approved:  reports.filter(r => r.status === "approved").length,
  };

const downloadReport = (report) => {
  const doc = generatePdfDoc(report);
  const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
  doc.save(`report_${(report.branch||'').replace(/\s+/g,'_')}_${safePeriod.replace(/[^a-z0-9]/gi,'_')}.pdf`);
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

  const circleLogoSize = 12;   // small circular iFranchise logo
  const wideLogoW = 34;        // wider main logo
  const wideLogoH = 12;
  const gap = 6;
  const logoY = 4;

  const totalWidth = circleLogoSize + gap + wideLogoW;
  const startX = (pageW - totalWidth) / 2;
  try {
  if (iFranchise_logoB64) {
    doc.addImage(iFranchise_logoB64, 'JPEG', startX, logoY, circleLogoSize, circleLogoSize);
  }
  if (logoB64) {
    doc.addImage(logoB64, 'JPEG', startX + circleLogoSize + gap, logoY, wideLogoW, wideLogoH);
  }
} catch (err) {
  console.warn('Failed to add logos to PDF:', err);
}

  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
  doc.text('SALES & PERFORMANCE REPORT', pageW / 2, 28, { align: 'center' });

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(160,220,190);
  const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
  
  doc.setFontSize(8); doc.setTextColor(120,180,150);
  doc.text('CONFIDENTIAL — FOR INTERNAL USE ONLY', pageW / 2, 34, { align: 'center' });
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

  const handleViewReport = (report) => {
    const doc = generatePdfDoc(report);
    const url = doc.output('bloburl');
    setViewReport(report);
    setPdfPreviewUrl(url);
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
          { label:"Period", value:fmtPeriod(report.period) },{ label:"Submitted", value:fmtDate(report.submittedAt) }
        ].map(({ label, value }) => (
          <div key={label} style={{ padding:"10px 12px", background:"#f8fffe", borderRadius:10, border:"1px solid #e0f2f1" }}>
            <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:3 }}>{label}</div>
            <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{value}</div>
          </div>
        ))}
      </div>
    </>
  );

  if (initialLoading) return (
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

      {viewReport && (
        <ModalShell
          title={`Report #${viewReport.id}`}
          subtitle={viewReport.brand + " · " + viewReport.branch}
          icon={<FileText size={16} color="#fff"/>}
          onClose={() => { setViewReport(null); setPdfPreviewUrl(null); }}
          maxWidth={680}
        >
          <ReportMetaGrid report={viewReport}/>

          {/* PDF shows immediately — no click needed */}
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #d1eedd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#f0fdf5", borderBottom: "1px solid #d1eedd" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#00897b" }}>
                REP-{String(viewReport.id).padStart(5, '0')} · {fmtPeriod(viewReport.period)}
              </span>
              <button
                onClick={() => downloadReport(viewReport)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Download size={11}/> Download
              </button>
            </div>
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                style={{ width: "100%", height: 500, border: "none", display: "block" }}
                title="Report PDF Preview"
              />
            )}
          </div>

          {viewReport.remark && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff3e0", borderRadius: 12, border: "1px solid #ffcc80" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#e65100", marginBottom: 4 }}>Return Remark</div>
              <div style={{ fontSize: 13, color: "#bf360c" }}>{viewReport.remark}</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StatusBadge status={viewReport.status}/>
            <div style={{ display: "flex", gap: 8 }}>
              {viewReport.status !== "approved" && (
                <button
                  onClick={() => setApproveReport(viewReport)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: actionLoading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}>
                  {actionLoading ? <RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }}/> : <Check size={14}/>} Acknowledge
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

      {/* APPROVE modal */}
      {approveReport && (
        <ModalShell title={`Acknowledge Report #${approveReport.id}`} subtitle={approveReport.brand + " · " + approveReport.branch} icon={<Check size={16} color="#fff"/>} onClose={() => setApproveReport(null)} maxWidth={440}>
          <ReportMetaGrid report={approveReport}/>
          <div style={{ padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", border:"1px solid #a7f3d0", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <Check size={18} color="#00897b"/>
            <div>
              <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Confirm Acknowledgment</div>
              <div style={{ fontSize:12, color:"#5a7a65", marginTop:2 }}>This will mark the report as acknowledged. This action cannot be undone.</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => setApproveReport(null)} style={{ padding:"9px 20px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={() => handleApprove(approveReport)} disabled={actionLoading}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:actionLoading?"not-allowed":"pointer", fontFamily:"inherit", opacity:actionLoading?0.7:1, boxShadow:"0 2px 10px rgba(0,180,90,0.35)" }}>
              {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Check size={14}/>} Acknowledge Report
            </button>
          </div>
        </ModalShell>
      )}
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <BmStatCard label="Total Reports" value={counts.total}    icon={<FileText size={20} color="#065f46"/>}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All submissions"  />
        <BmStatCard label="Under Review" value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>} bg="linear-gradient(135deg,#dbeafe,#93c5fd)" sub="Awaiting admin approval" />
        <BmStatCard label="Reviewed"      value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>}        bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="Under evaluation" />
        <BmStatCard label="Acknowledged"  value={counts.approved} icon={<Check size={20} color="#065f46"/>}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed"        />
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
                      <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtPeriod(report.period)}</td>
                      <td style={{ padding:"11px 14px", fontSize:11, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtDate(report.submittedAt)}</td>
                      <td style={{ padding:"11px 14px" }}><StatusBadge status={report.status}/></td>
                      <td style={{ padding:"11px 14px" }}>
                        <button
                          onClick={() => handleViewReport(report)}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:9, border:"1.5px solid #b2dfdb", background:"#e0f2f1", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                          <Eye size={13}/> View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BmSection>
        );
      })}

      <Toast toast={alertModal} onClose={() => setAlertModal(null)} />

    </div>
  );
}


//PROFIILEE
function AlertModal({ message, type = "info", onClose }) {
  const colors = {
    success: { bg: "#f0fdf5", border: "#a7f3d0", icon: "✅", text: "#059669" },
    error:   { bg: "#fee2e2", border: "#fecaca", icon: "❌", text: "#dc2626" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "ℹ️", text: "#2563eb" },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: `1px solid ${c.border}`, fontFamily: "Montserrat, sans-serif", textAlign: "center" }}
      >
        <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
        <p style={{ fontSize: 14, color: "#0d2b1e", fontWeight: 700, lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
        <button
          onClick={onClose}
          style={{ padding: "9px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,#2E7D32,#00897b)`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.28)" }}
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

function CreateAccountModal({ applicant, onClose, onAlert, defaultRole = "", roles = ['Administrator','Franchisee'] }){
  const [tempPassword] = useState(generateTempPassword());
  const [sending, setSending] = useState(false);

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
  <select
    name="role"
    required
    defaultValue={defaultRole}
    disabled={roles.length === 1}   // lock it if only one option
    style={{ ...bmInput, marginTop:4, appearance:'none', cursor: roles.length === 1 ? 'not-allowed' : 'pointer', opacity: roles.length === 1 ? 0.7 : 1 }}
  >
    {!defaultRole && <option value="">Select Role</option>}
    {roles.map(r => <option key={r} value={r}>{r}</option>)}
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
            <p style={{ fontSize:11, color:C.muted, margin:0 }}>A temporary password will be auto-generated and emailed to the applicant upon account creation.</p>
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