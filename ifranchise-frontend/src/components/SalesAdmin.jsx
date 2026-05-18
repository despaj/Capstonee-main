import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import MenuInventoryContent from './MenuInventoryContent';
import StockInventoryContent from './StockInventoryContent';

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

const bmLabel = {
  display: "block", fontSize: 11, fontWeight: 800, color: "#2e6725",
  marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em",
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
              AI Prescriptive Analysis
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

function SalesMobileShopContent() {
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