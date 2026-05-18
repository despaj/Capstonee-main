import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import ReceiptPrintTemplate from "./ReceiptPrintTemplate";
import {
  Home, FileCheck, Users, BarChart2, MessageCircle, User,
  LogOut, Search, AlertTriangle, DollarSign, GitBranch,
  Globe, MapPin, Phone, Mail, Edit2, Trash2, X, Check,
  Plus, Pencil, Store, TrendingUp, Layers, History,
  RotateCcw, UserPlus, CheckCircle, ChevronRight, Lock, Box,
  Unlock, CheckCircle2, FileText, Eye, Download, RefreshCw,
  BarChart, Calendar, Archive, Package, Info, Clock, Pin,
  Megaphone, ChevronDown,
} from 'lucide-react';

const C = {
  green: '#00897b', greenDk: '#00695c', greenLt: '#e8f5e9', greenMid: '#c8e6c9',
  teal: '#00c853', ink: '#0d2b1e', muted: '#5a7a65', border: '#d1eedd',
  bg: '#f0fdf5', white: '#ffffff', warn: '#e65100', warnBg: '#fff3e0',
  ok: '#2e7d32', okBg: '#e8f5e9',
};

const ROLE_LABEL = 'Franchisee Operations Admin';

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const FA_CSS = `
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
const invLabelSt = {
  display:"block", fontSize:11, fontWeight:800,
  color:C.muted, marginBottom:5,
  textTransform:"uppercase", letterSpacing:"0.07em",
};
const invInputSt = {
  height:36, padding:"0 11px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.bg,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};
// ─── Reusable style helpers ───────────────────────────────────────────────────
const bmInput = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #b2dfdb', fontSize: 13, color: '#0d2b1e',
  background: '#f0fdf5', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const bmLabel = {
  display: 'block', fontSize: 11, fontWeight: 800, color: '#2e6725',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em',
};
const smallBtnSt = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 28, padding: '0 10px', borderRadius: 7,
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', background: C.white,
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

const DEFAULT_PROFIT_MARGIN = 40;
const PAGE_SIZE = 15;
const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];

const fmtPeso = n => "₱" + Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtTs   = d  => new Date(d).toLocaleString("en-PH",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

// ─── Shared card/section components ──────────────────────────────────────────
const BmStatCard = ({ label, value, sub, icon, bg }) => (
  <div style={{
    background: C.white, border: '1px solid rgba(0,168,76,0.12)',
    borderRadius: 18, padding: '20px 22px',
    boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
    transition: 'transform .2s, box-shadow .2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,140,60,0.13)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,140,60,0.07)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0d2b1e' }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#5a7a65' }}>{sub}</span>
  </div>
);

const BmSection = ({ children, style = {} }) => (
  <div style={{
    background: C.white, border: '1px solid rgba(0,168,76,0.12)',
    borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
    overflow: 'hidden', marginBottom: 24, ...style,
  }}>
    {children}
  </div>
);

const BmSectionHeader = ({ title, subtitle, action }) => (
  <div style={{
    background: 'linear-gradient(135deg,#2E7D32,#00897b)',
    color: C.white, padding: '16px 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{subtitle}</div>}
    </div>
    {action && <div style={{ display: 'flex', gap: 8 }}>{action}</div>}
  </div>
);

// ─── Alert Modal ─────────
function AlertModal({ message, onClose, type = 'info' }) {
  const isError = type === 'error';
  const isSuccess = type === 'success';
  const iconBg = isError ? '#fee2e2' : isSuccess ? '#d1fae5' : '#dbeafe';
  const iconColor = isError ? '#dc2626' : isSuccess ? '#059669' : '#2563eb';
  const Icon = isError ? Trash2 : isSuccess ? Check : Info;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon size={22} color={iconColor} />
        </div>
        <p style={{ fontSize: 14, color: '#0d2b1e', lineHeight: 1.6, marginBottom: 20, fontWeight: 600 }}>{message}</p>
        <button onClick={onClose} style={{ padding: '9px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)' }}>OK</button>
      </div>
    </div>
  );
}

export default function FranchiseAdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(
    () => sessionStorage.getItem('fa_activeModule') || 'applications'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alertModal, setAlertModal] = useState(null);

  const getUserFromStorage = () => {
    const s = localStorage.getItem('user') || localStorage.getItem('rememberedUser') || sessionStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  };
  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const u = getUserFromStorage();
    if (!u) navigate('/admin-login');
    else setUser(u);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('fa_activeModule', activeModule);
  }, [activeModule]);

  const confirmLogout = async () => {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      const userId = stored ? JSON.parse(stored)?.id : null;
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }), credentials: 'include',
      });
    } catch {}
    finally {
      localStorage.removeItem('user');
      localStorage.removeItem('rememberedUser');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('tempUser');
      sessionStorage.removeItem('fa_activeModule');
      setShowLogoutModal(false);
      window.location.href = '/admin-login';
    }
  };

  // ── Fetch brands for sub-modules that need them ──
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const navigation = [
    { id: 'inventory',      label: 'Menu Inventory',        icon: <Box size={20} />,         section: 'main' },
    { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} />,      section: 'main' },
    { id: 'mobileOrders',   label: 'Mobile Orders',    icon: <Package size={20} />,     section: 'main' },
    { id: 'applications',  label: 'Applications',  icon: <FileCheck size={20} />,     section: 'main' },
    { id: 'communication', label: 'Announcements',       icon: <MessageCircle size={20} />, section: 'main' },
    { id: 'brandBranch',   label: 'Brand & Branch',      icon: <GitBranch size={20} />,     section: 'main' },
    { id: 'profile',       label: 'Edit Profile',        icon: <User size={20} />,          section: 'account' },
    { id: 'logout',        label: 'Logout',              icon: <LogOut size={20} />,        section: 'account', action: () => setShowLogoutModal(true) },
  ];

  const mainNav    = navigation.filter(n => n.section === 'main');
  const accountNav = navigation.filter(n => n.section === 'account');
  const moduleLabel = navigation.find(n => n.id === activeModule)?.label || '';

  return (
    <div className="fa-root">
      <style>{FA_CSS}{`
        .fa-root {
          font-family: 'Poppins', sans-serif;
          display: flex; min-height: 100vh;
          background: var(--grad-bg);
        }
        .fa-sidebar {
          width: ${sidebarCollapsed ? '76px' : '272px'};
          background: #fff;
          box-shadow: 2px 0 20px rgba(0,140,60,0.08);
          position: fixed; left: 0; top: 0; height: 100vh;
          transition: width 0.3s ease; z-index: 1000;
          overflow-y: auto; overflow-x: hidden;
        }
        .fa-sidebar-header {
          padding: 1.4rem 1rem;
          border-bottom: 1px solid rgba(0,168,76,0.1);
          display: flex; align-items: center; justify-content: space-between;
          min-height: 72px;
        }
        .fa-logo-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--grad-main);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 16px; color: #fff;
          font-family: 'Montserrat', sans-serif; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,180,90,.3);
        }
        .fa-brand { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.05rem; color: #0d2b1e; white-space: nowrap; }
        .fa-role-chip {
          font-size: 9px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .06em; padding: 2px 7px; border-radius: 20px;
          background: linear-gradient(135deg,#e9cd30,#ffa875);
          color: #3d2000; margin-top: 2px; display: inline-block;
        }
        .fa-toggle { background: none; border: none; cursor: pointer; padding: 6px; color: #94a3b8; border-radius: 8px; transition: all .2s; flex-shrink: 0; }
        .fa-toggle:hover { color: #00897b; background: rgba(0,168,76,0.08); }
        .fa-nav { padding: 1rem 0.5rem; }
        .fa-nav-section {
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .1em; color: #94a3b8;
          padding: 12px 14px 6px;
          display: ${sidebarCollapsed ? 'none' : 'block'};
          font-family: 'Montserrat', sans-serif;
        }
        .fa-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; color: #5a7a65; cursor: pointer;
          transition: all .2s; border-radius: 12px;
          position: relative; margin: 2px 0;
          font-weight: 600; font-size: 14px;
          font-family: 'Montserrat', sans-serif;
        }
        .fa-nav-item:hover { background: rgba(0,168,76,0.08); color: #0d2b1e; }
        .fa-nav-item.active {
          background: linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,137,123,0.1));
          color: #00695c; box-shadow: inset 0 0 0 1.5px rgba(0,137,123,0.2);
        }
        .fa-nav-item.logout { color: #ef4444; margin-top: 8px; }
        .fa-nav-item.logout:hover { background: rgba(239,68,68,0.08); }
        .fa-nav-icon { flex-shrink: 0; display: flex; justify-content: center; width: 22px; }
        .fa-nav-label { display: ${sidebarCollapsed ? 'none' : 'block'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fa-nav-bar { position: absolute; right: 0; top: 20%; height: 60%; width: 3px; border-radius: 2px; background: var(--grad-main); }
        .fa-main { flex: 1; margin-left: ${sidebarCollapsed ? '76px' : '272px'}; transition: margin-left 0.3s ease; }
        .fa-topbar {
          background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
          padding: 1rem 2rem; box-shadow: 0 2px 16px rgba(0,140,60,0.08);
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 100;
          border-bottom: 1px solid rgba(0,168,76,0.08);
        }
        .fa-topbar-breadcrumb { font-size: 12px; color: #94a3b8; font-weight: 600; }
        .fa-topbar-title { font-family: 'Montserrat', sans-serif; font-size: 1.4rem; font-weight: 800; color: #0d2b1e; }
        .fa-avatar {
          width: 42px; height: 42px; border-radius: 14px;
          background: linear-gradient(135deg,#e9cd30,#ffa875);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 800; color: #3d2000; cursor: pointer;
          transition: all .2s; box-shadow: 0 4px 12px rgba(233,205,48,.3);
          font-family: 'Montserrat', sans-serif;
        }
        .fa-avatar:hover { transform: scale(1.08); }
        .fa-content { padding: 1.8rem 2rem; }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="fa-sidebar">
        <div className="fa-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <div className="fa-logo-mark">iF</div>
              <div style={{ minWidth: 0 }}>
                <div className="fa-brand">iFranchise</div>
                {/* <span className="fa-role-chip">{ROLE_LABEL}</span> */}
              </div>
            </div>
          )}
          {sidebarCollapsed && <div className="fa-logo-mark" style={{ margin: '0 auto' }}>iF</div>}
          {!sidebarCollapsed && (
            <button className="fa-toggle" onClick={() => setSidebarCollapsed(true)}><X size={16} /></button>
          )}
        </div>

        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button className="fa-toggle" onClick={() => setSidebarCollapsed(false)}><ChevronRight size={16} /></button>
          </div>
        )}

        <nav className="fa-nav">
          {!sidebarCollapsed && <div className="fa-nav-section">Main Menu</div>}
          {mainNav.map(item => (
            <div key={item.id}
              className={`fa-nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}>
              <span className="fa-nav-icon">{item.icon}</span>
              <span className="fa-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="fa-nav-bar" />}
            </div>
          ))}
          {!sidebarCollapsed && <div className="fa-nav-section" style={{ marginTop: 8 }}>Account</div>}
          {accountNav.map(item => (
            <div key={item.id}
              className={`fa-nav-item ${activeModule === item.id ? 'active' : ''} ${item.id === 'logout' ? 'logout' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}>
              <span className="fa-nav-icon">{item.icon}</span>
              <span className="fa-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="fa-main">
        <div className="fa-topbar">
          <div>
            <div className="fa-topbar-breadcrumb">iFranchise → {ROLE_LABEL} → {moduleLabel}</div>
            <h1 className="fa-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 14, fontFamily: 'Montserrat,sans-serif' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{ROLE_LABEL} — {user?.branch}</div>
            </div>
            <div className="fa-avatar">{user?.name ? user.name.trim()[0].toUpperCase() : 'F'}</div>
          </div>
        </div>

        <div className="fa-content">
            {activeModule === 'inventory'      && <FAMenuInventoryContent user={user} brands={brands} />}
            {activeModule === 'stockInventory' && <FAStockInventoryContent user={user} brands={brands} />}
            {activeModule === 'mobileOrders'   && <FAMobileOrdersContent />}
            {activeModule === 'applications'  && <FAApplicationsContent alertModal={alertModal} setAlertModal={setAlertModal} />}
            {activeModule === 'communication' && <FACommunicationContent user={user} />}
            {activeModule === 'brandBranch'   && <FABrandBranchContent brands={brands} onBrandsChange={setBrands} />}
            {activeModule === 'profile'       && <FAProfileContent user={user} />}
        </div>
      </main>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLogoutModal(false)}>
          <div style={{ background: C.white, borderRadius: 22, padding: '32px 36px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', border: '1px solid rgba(0,168,76,0.15)', animation: 'slideUp .25s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem', border: '1.5px solid rgba(239,68,68,0.15)' }}>🚪</div>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Log out?</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>You'll need to sign in again to access your account.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif' }}>Cancel</button>
              <button onClick={confirmLogout} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', boxShadow: '0 4px 14px rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}
    </div>
  );
}

const capitalizeName = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const normalizeName = str => {
  if (!str) return "";
  return str.toLowerCase().trim().replace(/\s+/g," ").replace(/[''']/g,"").replace(/s$/,"");
};
const findDuplicate = (name, branch, existingItems) => {
  const normalizedNew = normalizeName(name);
  if (!normalizedNew) return null;
  return existingItems.find(item => {
    if (item.branch !== branch) return false;
    return normalizeName(item.name) === normalizedNew;
  }) || null;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon   = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon     = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon    = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon        = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon     = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon    = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon     = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TagIcon      = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const FilterIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon  = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const SortAscIcon  = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const HistoryIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>;
const RestoreIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>;
const ActivityIcon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const AlertCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const InfoIcon        = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const LoaderIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.9s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const UploadIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;


// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

// ─── BrandBranchFilter ────────────────────────────────────────────────────────
function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
  const [brandQ, setBrandQ]   = useState("");
  const [branchQ, setBranchQ] = useState("");
  const [openB, setOpenB]     = useState(false);
  const [openBr, setOpenBr]   = useState(false);
  const brandRef  = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
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
      <div ref={brandRef} style={{ position:"relative", minWidth:180 }}>
        <div onClick={()=>{setOpenB(v=>!v);setBrandQ("");}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <FilterIcon/> <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{selectedBrand?selectedBrand.name:"All Brands"}</span>
          <ChevronIcon dir={openB?"up":"down"} style={{ position:"absolute", right:10 }}/>
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
          <StoreIcon size={12} color={activeBrand?C.green:C.muted}/> <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{activeBranch||(activeBrand?"All Branches":"Select brand first")}</span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={()=>{onChangeBranch(null);setOpenBr(false);}}>All Branches</div>
            {filteredBranches.map(br=>(
              <div key={br} style={optSt(activeBranch===br)} onMouseDown={()=>{onChangeBranch(br);setOpenBr(false);}}>
                <StoreIcon size={11} color={C.green}/> {br}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BranchSearchSelect ───────────────────────────────────────────────────────
function BranchSearchSelect({ value, onChange, allBranches }) {
  const [query, setQuery] = useState(value||"");
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ setQuery(value||""); },[value]);
  useEffect(()=>{
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);
  const filtered = allBranches.filter(({branch,brand})=>!query||branch.toLowerCase().includes(query.toLowerCase())||brand.toLowerCase().includes(query.toLowerCase()));
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
        <input type="text" value={query} placeholder="Search branch…"
          onChange={e=>{setQuery(e.target.value);setOpen(true);onChange("");}} onFocus={()=>setOpen(true)}
          style={{ ...invInputSt, paddingLeft:30 }}/>
      </div>
      {open && filtered.length>0 && (
        <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:400, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.1)", maxHeight:190, overflowY:"auto" }}>
          {filtered.map(({branch,brand})=>(
            <div key={branch} onMouseDown={e=>{e.preventDefault();onChange(branch);setQuery(branch);setOpen(false);}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              style={{ padding:"9px 13px", cursor:"pointer", fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:600, color:C.ink }}>{branch}</span>
              <span style={{ fontSize:11, color:C.muted, background:C.greenLt, padding:"2px 8px", borderRadius:20 }}>{brand}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CategorySelect ───────────────────────────────────────────────────────────
function CategorySelect({ value, onChange, categories, onAddCategory }) {
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const handleAdd = () => {
    const t = newCat.trim();
    if (!t) return;
    onAddCategory(t); onChange(t);
    setNewCat(""); setAdding(false);
  };
  return (
    <div>
      <div style={{ display:"flex", gap:6 }}>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...invInputSt, flex:1 }}>
          <option value="">Select category…</option>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={()=>setAdding(v=>!v)} style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:`1px solid ${C.border}`, color:adding?C.green:C.muted }}>
          <TagIcon size={14}/>
        </button>
      </div>
      {adding && (
        <div style={{ display:"flex", gap:6, marginTop:6 }}>
          <input autoFocus type="text" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();handleAdd();}}} placeholder="New category…" style={{ ...invInputSt, flex:1 }}/>
          <button type="button" onClick={handleAdd} style={{ ...btnPrimarySt, padding:"0 14px" }}>Add</button>
          <button type="button" onClick={()=>{setAdding(false);setNewCat("");}} style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:"1px solid #ffcdd2", color:"#e53935" }}><XIcon size={13}/></button>
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, setPage, total, pageSize }) {
  const totalPgs = Math.max(1, Math.ceil(total / pageSize));
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
}

// ─── Delete History Panel ─────────────────────────────────────────────────────
function DeleteHistoryPanel({ history, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#dc2626" }}>
                {history.length} deleted
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>

        {/* Column headers */}
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            <span>Item</span><span>Branch</span><span>Stock</span><span>Price</span><span>Deleted At</span><span></span>
          </div>
        )}

        {/* Rows */}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => {
            const d    = entry.inventory_data   || {};
            const ings = entry.ingredients_data || [];
            return (
              <div key={entry.id} style={{ padding:"14px 0", borderBottom: i < history.length-1 ? "1px solid #f0f8f0" : "none" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.category}</div>
                  </div>
                  <div style={{ fontSize:12, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.branch}</div>
                  <div style={{ fontSize:12, color:C.ink, fontWeight:600 }}>{d.stock}</div>
                  <div style={{ fontSize:12, color:C.green, fontWeight:700 }}>{fmtPeso(d.price||0)}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deleted_at ? fmtTs(entry.deleted_at) : "—"}</div>
                  <button onClick={() => onRestore(entry)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:`1.5px solid ${C.green}`, background:"#e0f2f1", color:C.greenDk, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    <RestoreIcon/> Restore
                  </button>
                </div>
                {/* Ingredient chips */}
                {ings.length > 0 && (
                  <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:5, paddingLeft:4 }}>
                    <span style={{ fontSize:10, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", alignSelf:"center" }}>Ingredients:</span>
                    {ings.map((ing, idx) => (
                      <span key={idx} style={{ fontSize:11, padding:"2px 9px", borderRadius:20, background:C.greenLt, color:C.greenDk, fontWeight:600, border:`1px solid ${C.greenMid}` }}>
                        {ing.name} × {ing.qty_required} {ing.unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log Panel ───────────────────────────────────────────────────────
function ActivityLogPanel({ log, onClose }) {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = log.filter(entry => {
    if (typeFilter !== "all" && entry.action !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!entry.item_name?.toLowerCase().includes(q) &&
          !(entry.performed_by||"").toLowerCase().includes(q) &&
          !(entry.branch||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const actionBadge = action => {
    const map = {
      add:    { bg:"rgba(16,185,129,0.12)",  color:"#059669", label:"Added"   },
      edit:   { bg:"rgba(59,130,246,0.12)",  color:"#1d4ed8", label:"Edited"  },
      import: { bg:"rgba(139,92,246,0.12)",  color:"#7c3aed", label:"Imported"},
      delete: { bg:"rgba(239,68,68,0.12)",   color:"#dc2626", label:"Deleted" },
    };
    const s = map[action] || map.edit;
    return <span style={{ padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:C.ink, margin:0 }}>Activity Log</h2>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#e0f2f1", color:C.greenDk }}>{filtered.length} entries</span>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>

        {/* Filters */}
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

        {/* Column headers */}
        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, padding:"6px 0 8px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
          <span>Action</span><span>Item</span><span>Branch</span><span>By</span><span>Timestamp</span>
        </div>

        {/* Rows */}
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
              <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.branch || "—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.performed_by || "System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.created_at ? fmtTs(entry.created_at) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── InventoryTable ───────────────────────────────────────────────────────────
function InventoryTable({ items, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, page, setPage }) {
  const [sort, setSort]             = useState({ col:"name", asc:true });
  const [expandedRows, setExpanded] = useState({});

  const sorted = useMemo(() => {
    return [...items].sort((a,b) => {
      let va=a[sort.col]??"", vb=b[sort.col]??"";
      if(typeof va==="string") va=va.toLowerCase();
      if(typeof vb==="string") vb=vb.toLowerCase();
      return sort.asc?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);
    });
  }, [items, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems  = sorted.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);

  const Th = ({ col, label, style:s }) => {
    const active = sort.col === col;
    return (
      <th onClick={()=>{setSort(st=>({col,asc:st.col===col?!st.asc:true}));setPage(0);}}
        style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#f0fdf5", ...s }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label} {active?(sort.asc?<SortAscIcon/>:<SortDescIcon/>):<span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };
  const ThStatic = ({ label, style:s }) => (
    <th style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", background:"#f0fdf5", ...s }}>{label}</th>
  );

  if (!items.length) return <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No items match your filters.</div>;

  return (
    <div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <Th col="name"      label="Item Name"   style={{ minWidth:160 }}/>
              <Th col="category"  label="Category"    style={{ minWidth:110 }}/>
              <Th col="branch"    label="Branch"      style={{ minWidth:130 }}/>
              <Th col="stock"     label="Stock"       style={{ minWidth:72  }}/>
              <Th col="min_stock" label="Min Stock"   style={{ minWidth:80  }}/>
              <Th col="cost"      label="Cost"        style={{ minWidth:90  }}/>
              <Th col="price"     label="Price"       style={{ minWidth:90  }}/>
              <ThStatic           label="Ingredients" style={{ minWidth:140 }}/>
              <th style={{ padding:"9px 12px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}`, minWidth:150 }}/>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(item => {
              const low        = Number(item.stock) <= Number(item.min_stock);
              const isConfirm  = confirmDeleteId === item.id;
              const ingredients= item.ingredients || [];
              const isExpanded = expandedRows[item.id];
              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isExpanded?"none":`1px solid #f2faf5` }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafffe"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>{item.name}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c" }}>{item.category}</span>
                    </td>
                    <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><StoreIcon size={11} color={C.green}/> {item.branch}</span>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ color:low?C.warn:C.ink, fontWeight:low?700:500, display:"inline-flex", alignItems:"center", gap:5 }}>
                        {item.stock}
                        {low && <span style={{ background:"#fff3e0", color:C.warn, fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>⚠️ LOW</span>}
                      </span>
                    </td>
                    <td style={{ padding:"10px 12px", color:C.muted }}>{item.min_stock}</td>
                    <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPeso(item.cost||0)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                    <td style={{ padding:"10px 12px" }}>
                      {ingredients.length === 0 ? (
                        <span style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>—</span>
                      ) : (
                        <button onClick={()=>setExpanded(p=>({...p,[item.id]:!p[item.id]}))}
                          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:isExpanded?C.greenMid:C.greenLt, color:C.greenDk, border:`1px solid ${C.greenMid}`, cursor:"pointer" }}>
                          {ingredients.length} ingredient{ingredients.length!==1?"s":""}
                          <ChevronIcon size={10} dir={isExpanded?"up":"down"}/>
                        </button>
                      )}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                        <button onClick={()=>onEdit(item)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}><EditIcon/> Edit</button>
                        <button onClick={()=>{ if(isConfirm){onDelete(item.id);setConfirmDeleteId(null);}else setConfirmDeleteId(item.id); }}
                          style={{ ...smallBtnSt, border:isConfirm?"none":"1px solid #ffcdd2", color:isConfirm?C.white:"#e53935", background:isConfirm?"#e53935":C.white }}>
                          <TrashIcon/> {isConfirm?"Confirm?":"Delete"}
                        </button>
                        {isConfirm && <button onClick={()=>setConfirmDeleteId(null)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && ingredients.length > 0 && (
                    <tr style={{ borderBottom:`1px solid #f2faf5` }}>
                      <td colSpan={9} style={{ padding:"0 12px 12px 12px", background:"#f9fefb" }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, padding:"10px 14px", background:C.greenLt, borderRadius:10, border:`1px solid ${C.greenMid}` }}>
                          <span style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", width:"100%", marginBottom:4 }}>
                            Ingredients required per unit:
                          </span>
                          {ingredients.map((ing, idx) => (
                            <span key={idx} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:C.white, color:C.ink, border:`1px solid ${C.border}` }}>
                              <span style={{ color:C.green, fontWeight:700 }}>{ing.name}</span>
                              <span style={{ color:C.muted }}>×</span>
                              <span style={{ fontWeight:800, color:C.greenDk }}>{ing.qty_required}</span>
                              {ing.unit && <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:"1px 6px", borderRadius:20 }}>{ing.unit}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} setPage={setPage} total={sorted.length} pageSize={PAGE_SIZE}/>}
    </div>
  );
}

///MENU INVENTORY
function FAMenuInventoryContent({ user, brands: propBrands = [] }) {
  const userBranch = user?.branch || "";

  const brandList   = propBrands.length > 0 ? propBrands : [];
  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches || []).forEach(br => {
      const name = typeof br === "string" ? br : br.name;
      if (!out.find(x => x.branch === name)) out.push({ brand: b.name, branch: name });
    }));
    return out;
  }, [brandList]);

  const [inventory,      setInventory]      = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [filterBrand,    setFilterBrand]    = useState(null);
  const [filterBranch,   setFilterBranch]   = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [page,           setPage]           = useState(0);
  const [expandedRows,   setExpanded]       = useState({});
  const [sort,           setSort]           = useState({ col: "name", asc: true });

  const fetchInventory = useCallback(async (branch) => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${q}`);
      const d   = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch { setInventory([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchInventory(filterBranch || undefined);
  }, [filterBranch, fetchInventory]);

  useEffect(() => { setPage(0); }, [searchQuery, filterBrand, filterBranch, filterCategory, filterStatus]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q) && !i.branch.toLowerCase().includes(q)) return false;
      if (filterBranch) { if (i.branch !== filterBranch) return false; }
      else if (filterBrand) {
        const b = brandList.find(x => x.id === filterBrand);
        if (b) { const names = (b.branches || []).map(br => typeof br === "string" ? br : br.name); if (!names.includes(i.branch)) return false; }
      }
      if (filterCategory && i.category !== filterCategory) return false;
      if (filterStatus === "low" && Number(i.stock) >  Number(i.min_stock)) return false;
      if (filterStatus === "ok"  && Number(i.stock) <= Number(i.min_stock)) return false;
      return true;
    });
  }, [inventory, searchQuery, filterBrand, filterBranch, filterCategory, filterStatus, brandList]);

  const filteredCategories = useMemo(() => {
    if (filterBrand) {
      const brand = brandList.find(b => b.id === filterBrand);
      return brand?.categories || [];
    }
    if (filterBranch) {
      const brand = brandList.find(b =>
        (b.branches || []).some(br => (typeof br === "string" ? br : br.name) === filterBranch)
      );
      return brand?.categories || [];
    }
    return [...new Set(brandList.flatMap(b => b.categories || []).filter(Boolean))].sort();
  }, [filterBrand, filterBranch, brandList]);

  const lowCount   = filteredItems.filter(i => Number(i.stock) <= Number(i.min_stock)).length;
  const totalValue = filteredItems.reduce((s, i) => s + (i.price || 0) * (i.stock || 0), 0);

  const sorted = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sort.asc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });
  }, [filteredItems, sort]);

  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const anyFilter = filterBrand || filterBranch || filterCategory || filterStatus || searchQuery;
  const clearAll  = () => { setFilterBrand(null); setFilterBranch(null); setFilterCategory(""); setFilterStatus(""); setSearchQuery(""); };

  const Th = ({ col, label, style: s }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => { setSort(st => ({ col, asc: st.col === col ? !st.asc : true })); setPage(0); }}
        style={{ padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11, color: active ? C.green : C.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", background: "#f0fdf5", ...s }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label} {active ? (sort.asc ? <SortAscIcon /> : <SortDescIcon />) : <span style={{ opacity: 0.25 }}><SortDescIcon /></span>}
        </span>
      </th>
    );
  };

  const ThStatic = ({ label, style: s }) => (
    <th style={{ padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", background: "#f0fdf5", ...s }}>{label}</th>
  );

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* View-only notice */}
      <div style={{ background: "linear-gradient(135deg,rgba(233,205,48,0.12),rgba(255,168,117,0.08))", border: "1.5px solid rgba(233,205,48,0.3)", borderRadius: 12, padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <Info size={16} color="#8a6a00" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#5d4400" }}>
          View-only access — You can browse and filter inventory but cannot add, edit, or delete items.
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Showing",    value: filteredItems.length.toLocaleString(), sub: `of ${inventory.length.toLocaleString()} total`, accent: C.green },
          { label: "Low Stock",  value: lowCount,                              sub: "Needs reorder",      accent: C.warn },
          { label: "Est. Value", value: fmtPeso(totalValue),                  sub: "Filtered selection", accent: C.green },
          { label: "Categories", value: filteredCategories.length,            sub: "Product types",      accent: "#1565c0" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: s.accent, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: C.white, border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 16, padding: "14px 18px", marginBottom: 18, boxShadow: "0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted }}><SearchIcon size={13} /></div>
            <input type="text" placeholder="Search name, category, branch…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...invInputSt, paddingLeft: 30 }} />
            {searchQuery && <div onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted }}><XIcon size={12} /></div>}
          </div>

          <BrandBranchFilter
            brands={brandList}
            activeBrand={filterBrand}
            activeBranch={filterBranch}
            onChangeBrand={id => { setFilterBrand(id); setFilterBranch(null); setFilterCategory(""); }}
            onChangeBranch={val => { setFilterBranch(val); setFilterCategory(""); }}
          />

          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...invInputSt, width: 150 }}>
            <option value="">All Categories</option>
            {filteredCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...invInputSt, width: 130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
        </div>

        {/* Active filter chips */}
        {anyFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Active:</span>
            {searchQuery     && <Chip label={`"${searchQuery}"`}                                           color="#3949ab" bg="#e8eaf6" onRemove={() => setSearchQuery("")} />}
            {filterBrand && !filterBranch && <Chip label={brandList.find(b => b.id === filterBrand)?.name} color={C.greenDk} bg={C.greenLt} onRemove={() => { setFilterBrand(null); setFilterBranch(null); }} />}
            {filterBranch    && <Chip label={filterBranch}                                                  color="#00695c" bg="#e0f7fa" onRemove={() => setFilterBranch(null)} />}
            {filterCategory  && <Chip label={filterCategory}                                               color="#00695c" bg="#e0f2f1" onRemove={() => setFilterCategory("")} />}
            {filterStatus    && <Chip label={filterStatus === "low" ? "Low Stock" : "In Stock"} color={filterStatus === "low" ? C.warn : C.ok} bg={filterStatus === "low" ? C.warnBg : C.okBg} onRemove={() => setFilterStatus("")} />}
            <button onClick={clearAll} style={{ ...smallBtnSt, height: 24, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginLeft: "auto" }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table card */}
      <div style={{ background: C.white, border: `1px solid rgba(0,168,76,0.12)`, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding: "11px 18px", background: `linear-gradient(135deg,${C.teal},${C.green})`, display: "flex", justifyContent: "space-between", alignItems: "center", color: C.white }}>
          <span style={{ fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
            <StoreIcon size={14} color="#fff" /> Menu Inventory
          </span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>{filteredItems.length.toLocaleString()} items · {lowCount} low stock · View-only</span>
        </div>

        {loading ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading inventory…</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 13, fontStyle: "italic" }}>No items match your filters.</div>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <Th col="name"      label="Item Name"  style={{ minWidth: 160 }} />
                    <Th col="category"  label="Category"   style={{ minWidth: 110 }} />
                    <Th col="branch"    label="Branch"     style={{ minWidth: 130 }} />
                    <Th col="stock"     label="Stock"      style={{ minWidth: 80 }} />
                    <Th col="min_stock" label="Min Stock"  style={{ minWidth: 80 }} />
                    <Th col="cost"      label="Cost"       style={{ minWidth: 90 }} />
                    <Th col="price"     label="Price"      style={{ minWidth: 90 }} />
                    <ThStatic           label="Ingredients" style={{ minWidth: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(item => {
                    const low        = Number(item.stock) <= Number(item.min_stock);
                    const ingredients = item.ingredients || [];
                    const isExpanded  = expandedRows[item.id];
                    return (
                      <React.Fragment key={item.id}>
                        <tr style={{ borderBottom: isExpanded ? "none" : `1px solid #f2faf5` }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafffe"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: C.ink }}>{item.name}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#e0f2f1", color: "#00695c" }}>{item.category}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><StoreIcon size={11} color={C.green} /> {item.branch}</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ color: low ? C.warn : C.ink, fontWeight: low ? 700 : 500, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              {item.stock}
                              {low && <span style={{ background: "#fff3e0", color: C.warn, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>⚠️ LOW</span>}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: C.muted }}>{item.min_stock}</td>
                          <td style={{ padding: "10px 12px", color: C.muted }}>{fmtPeso(item.cost || 0)}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: C.green }}>{fmtPeso(item.price)}</td>
                          <td style={{ padding: "10px 12px" }}>
                            {ingredients.length === 0 ? (
                              <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>—</span>
                            ) : (
                              <button onClick={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))}
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: isExpanded ? C.greenMid : C.greenLt, color: C.greenDk, border: `1px solid ${C.greenMid}`, cursor: "pointer" }}>
                                {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}
                                <ChevronIcon size={10} dir={isExpanded ? "up" : "down"} />
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && ingredients.length > 0 && (
                          <tr style={{ borderBottom: `1px solid #f2faf5` }}>
                            <td colSpan={8} style={{ padding: "0 12px 12px 12px", background: "#f9fefb" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 14px", background: C.greenLt, borderRadius: 10, border: `1px solid ${C.greenMid}` }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", width: "100%", marginBottom: 4 }}>
                                  Ingredients required per unit:
                                </span>
                                {ingredients.map((ing, idx) => (
                                  <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: C.white, color: C.ink, border: `1px solid ${C.border}` }}>
                                    <span style={{ color: C.green, fontWeight: 700 }}>{ing.name}</span>
                                    <span style={{ color: C.muted }}>×</span>
                                    <span style={{ fontWeight: 800, color: C.greenDk }}>{ing.qty_required}</span>
                                    {ing.unit && <span style={{ fontSize: 11, color: C.muted, background: C.bg, padding: "1px 6px", borderRadius: 20 }}>{ing.unit}</span>}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} total={sorted.length} pageSize={PAGE_SIZE} />
          </div>
        )}
      </div>
    </div>
  );
}


function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:"#fef2f2", padding:"20px 24px 16px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}>
            <AlertCircleIcon size={26} color="#dc2626"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Ingredient</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.55 }}>
              Are you sure you want to delete <strong style={{ color:C.ink }}>"{item.name}"</strong>?
            </div>
            <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:9, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
              This will move the ingredient to Delete History where it can be restored.
            </div>
          </div>
          <button onClick={onCancel} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:"1px solid #fecaca", background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", marginTop:-2 }}>
            <XIcon size={13}/>
          </button>
        </div>
        {/* Item summary */}
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:16 }}>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Branch</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.branch || "—"}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Unit</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.unit}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Stock</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.stock}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Cost/Unit</div>
            <div style={{ fontWeight:700, color:C.green }}>₱{Number(item.cost_per_unit||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} style={{ ...btnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnSt, background:"#dc2626", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.3)", display:"inline-flex", alignItems:"center", gap:6 }}>
            <TrashIcon size={13}/> Delete Ingredient
          </button>
        </div>
      </div>
    </div>
  );
}

//STOCK INVENTORY
function FAStockInventoryContent({ user, brands: propBrands = [] }) {
  const userBranch = user?.branch || "";

  const brandList = propBrands.length > 0 ? propBrands : [];

  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b =>
      (b.branches || []).forEach(br => {
        const name = typeof br === "string" ? br : br.name;
        if (!out.find(x => x.branch === name)) out.push({ brand: b.name, branch: name });
      })
    );
    return out;
  }, [brandList]);

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [brand,      setBrand]      = useState(null);
  const [branch,     setBranch]     = useState(null);
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilt, setStatusFilt] = useState("");
  const [page,       setPage]       = useState(0);
  const [sort,       setSort]       = useState({ col: "name", asc: true });

  /* ── fetch ingredients ── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
      const d   = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [branch]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(0); }, [search, brand, branch, unitFilter, statusFilt]);

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...items]
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q) && !(i.branch || "").toLowerCase().includes(q)) return false;
        if (branch && i.branch !== branch) return false;
        else if (brand && !branch) {
          const b = brandList.find(x => x.id === brand);
          if (b) {
            const names = (b.branches || []).map(br => typeof br === "string" ? br : br.name);
            if (!names.includes(i.branch)) return false;
          }
        }
        if (unitFilter && i.unit !== unitFilter) return false;
        if (statusFilt === "low" && Number(i.stock) >= Number(i.min_stock)) return false;
        if (statusFilt === "ok"  && Number(i.stock) <  Number(i.min_stock)) return false;
        return true;
      })
      .sort((a, b) => {
        let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        return sort.asc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
      });
  }, [items, search, brand, branch, unitFilter, statusFilt, sort, brandList]);

  const lowCount   = filtered.filter(i => Number(i.stock) < Number(i.min_stock)).length;
  const totalValue = filtered.reduce((s, i) => s + (i.cost_per_unit || 0) * (i.stock || 0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const anyFilter = brand || branch || unitFilter || statusFilt || search;
  const clearAll  = () => { setBrand(null); setBranch(null); setUnitFilter(""); setStatusFilt(""); setSearch(""); };

  /* ── sortable table header ── */
  const SortTh = ({ col, label, minW }) => {
    const active = sort.col === col;
    return (
      <th
        onClick={() => { setSort(s => ({ col, asc: s.col === col ? !s.asc : true })); setPage(0); }}
        style={{
          padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11,
          color: active ? C.green : C.muted, letterSpacing: "0.07em", textTransform: "uppercase",
          borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none",
          whiteSpace: "nowrap", background: "#f0fdf5", minWidth: minW,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          {active ? (sort.asc ? <SortAscIcon /> : <SortDescIcon />) : <span style={{ opacity: 0.25 }}><SortDescIcon /></span>}
        </span>
      </th>
    );
  };

  /* ── render ── */
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* View-only notice */}
      <div style={{
        background: "linear-gradient(135deg,rgba(233,205,48,0.12),rgba(255,168,117,0.08))",
        border: "1.5px solid rgba(233,205,48,0.3)", borderRadius: 12,
        padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10,
      }}>
        <Info size={16} color="#8a6a00" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#5d4400" }}>
          View-only access — You can browse and filter stock inventory but cannot add, edit, import, or delete items.
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Ingredients", value: items.length.toLocaleString(),                                                                              sub: "Registered",    accent: C.green    },
          { label: "Low Stock Alerts",  value: lowCount,                                                                                                   sub: "Needs reorder", accent: "#e65100" },
          { label: "Total Stock Value", value: "₱" + Number(totalValue).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sub: "Cost basis",     accent: "#1565c0" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.white, border: "1px solid rgba(0,168,76,0.13)",
            borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: s.accent, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        background: C.white, border: "1px solid rgba(0,168,76,0.13)", borderRadius: 16,
        padding: "14px 18px", marginBottom: 18, boxShadow: "0 1px 8px rgba(0,140,60,0.05)",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted }}><SearchIcon size={13} /></div>
            <input
              type="text"
              placeholder="Search ingredient or branch…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...invInputSt, paddingLeft: 30 }}
            />
            {search && (
              <div onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted }}>
                <XIcon size={12} />
              </div>
            )}
          </div>

          <BrandBranchFilter
            brands={brandList}
            activeBrand={brand}
            activeBranch={branch}
            onChangeBrand={id => { setBrand(id); setBranch(null); }}
            onChangeBranch={setBranch}
          />

          <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} style={{ ...invInputSt, width: 120 }}>
            <option value="">All Units</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)} style={{ ...invInputSt, width: 130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
        </div>

        {/* Active filter chips */}
        {anyFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Active:</span>
            {search      && <Chip label={`"${search}"`}                                              color="#3949ab" bg="#e8eaf6" onRemove={() => setSearch("")} />}
            {brand && !branch && <Chip label={brandList.find(b => b.id === brand)?.name}             color={C.greenDk} bg={C.greenLt} onRemove={() => { setBrand(null); setBranch(null); }} />}
            {branch      && <Chip label={branch}                                                      color="#00695c" bg="#e0f7fa" onRemove={() => setBranch(null)} />}
            {unitFilter  && <Chip label={unitFilter}                                                  color="#6a1b9a" bg="#f3e8ff" onRemove={() => setUnitFilter("")} />}
            {statusFilt  && <Chip label={statusFilt === "low" ? "Low Stock" : "In Stock"} color={statusFilt === "low" ? C.warn : C.ok} bg={statusFilt === "low" ? C.warnBg : C.okBg} onRemove={() => setStatusFilt("")} />}
            <button onClick={clearAll} style={{ ...smallBtnSt, height: 24, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginLeft: "auto" }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table card */}
      <div style={{
        background: C.white, border: "1px solid rgba(0,168,76,0.12)",
        borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 18px rgba(0,140,60,0.07)",
      }}>
        <div style={{
          padding: "11px 18px", background: `linear-gradient(135deg,${C.teal},${C.green})`,
          display: "flex", justifyContent: "space-between", alignItems: "center", color: C.white,
        }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Stock Ingredients</span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>{filtered.length} items · {lowCount} low stock · View-only</span>
        </div>

        {loading ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 13, fontStyle: "italic" }}>
            No ingredients match your filters.
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <SortTh col="name"         label="Ingredient" minW={150} />
                    <SortTh col="branch"        label="Branch"     minW={120} />
                    <SortTh col="brand"         label="Brand"      minW={100} />
                    <SortTh col="unit"          label="Unit"       minW={70}  />
                    <SortTh col="stock"         label="Stock"      minW={80}  />
                    <SortTh col="min_stock"     label="Min Stock"  minW={80}  />
                    <SortTh col="cost_per_unit" label="Cost/Unit"  minW={90}  />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(item => {
                    const low = Number(item.stock) < Number(item.min_stock);
                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #f2faf5" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafffe"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: C.ink }}>{item.name}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <StoreIcon size={11} color={C.green} /> {item.branch}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {item.brand
                            ? <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#e0f2f1", color: "#00695c" }}>{item.brand}</span>
                            : <span style={{ color: C.muted }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f3e8ff", color: "#6a1b9a" }}>{item.unit}</span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ color: low ? C.warn : C.ink, fontWeight: low ? 700 : 500, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            {item.stock}
                            {low && <span style={{ background: "#fff3e0", color: C.warn, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>⚠️ LOW</span>}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: C.muted }}>{item.min_stock}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: C.green }}>
                          ₱{Number(item.cost_per_unit || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
    </div>
  );
}

function ImportLoadingModal({ visible, progress }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:22, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:`1px solid ${C.greenMid}`, fontFamily:"Montserrat,sans-serif", textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <UploadIcon size={30} color={C.green}/>
        </div>
        <div style={{ fontSize:17, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>

        {/* Progress bar */}
        <div style={{ background:C.greenLt, borderRadius:999, height:8, overflow:"hidden", marginBottom:12 }}>
          <div style={{ background:`linear-gradient(90deg,${C.teal},${C.green})`, borderRadius:999, height:"100%", width:`${progress.percent}%`, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:6 }}>{progress.label}</div>
        {progress.current > 0 && (
          <div style={{ fontSize:11, color:C.muted, opacity:0.7 }}>{progress.current} / {progress.total} rows processed</div>
        )}

        <div style={{ marginTop:18, display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:C.green }}>
          <LoaderIcon size={16} color={C.green}/>
          <span style={{ fontSize:12, fontWeight:700 }}>Do not close this window</span>
        </div>
      </div>
    </div>
  );
}

function UIModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type, title, message, lines, confirmLabel, cancelLabel } = modal;

  const iconMap = {
    error:   <AlertCircleIcon size={26} color="#dc2626"/>,
    success: <CheckCircleIcon size={26} color={C.green}/>,
    info:    <InfoIcon size={26} color="#1d4ed8"/>,
    confirm: <AlertCircleIcon size={26} color={C.warn}/>,
  };
  const headerColorMap = {
    error:   { bg:"#fef2f2",  border:"#fecaca",      titleColor:"#991b1b"  },
    success: { bg:C.greenLt,  border:C.greenMid,     titleColor:C.greenDk  },
    info:    { bg:"#eff6ff",  border:"#bfdbfe",      titleColor:"#1e3a8a"  },
    confirm: { bg:C.warnBg,   border:"#fed7aa",      titleColor:"#9a3412"  },
  };
  const hc = headerColorMap[type] || headerColorMap.info;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${hc.border}`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:hc.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${hc.border}`, display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}>{iconMap[type]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:hc.titleColor, marginBottom:4 }}>{title}</div>
            {message && <div style={{ fontSize:13, color:C.ink, lineHeight:1.55, opacity:0.85 }}>{message}</div>}
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:`1px solid ${hc.border}`, background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", marginTop:-2 }}>
            <XIcon size={13}/>
          </button>
        </div>

        {/* Lines (for import summary) */}
        {lines && lines.length > 0 && (
          <div style={{ maxHeight:180, overflowY:"auto", padding:"12px 24px", borderBottom:`1px solid ${C.border}` }}>
            {lines.map((l, i) => (
              <div key={i} style={{ fontSize:12, color:l.warn ? C.warn : C.muted, padding:"3px 0", display:"flex", alignItems:"flex-start", gap:7 }}>
                <span style={{ marginTop:1, flexShrink:0, color:l.warn?"#e65100":C.green }}>{l.warn ? "–" : "+"}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          {type === "confirm" && (
            <button onClick={onClose} style={{ ...btnSt, border:`1px solid ${C.border}`, color:C.muted }}>{cancelLabel || "Cancel"}</button>
          )}
          {type === "confirm" ? (
            <button onClick={onConfirm} style={{ ...btnSt, background:"#dc2626", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.3)" }}>{confirmLabel || "Confirm"}</button>
          ) : (
            <button onClick={onClose} style={{ ...btnPrimarySt }}>{confirmLabel || "OK"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// MOBILE ORDERS
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

function FAMobileOrdersContent() {
  const [orders,       setOrders]       = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [error,        setError]        = useState(null);
  const [filterBrand,  setFilterBrand]  = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [viewOrder,    setViewOrder]    = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeTab,    setActiveTab]    = useState("active");

  const [printReceipts, setPrintReceipts] = useState([]);
  const printRef = useRef(null);

  const [itemsModal, setItemsModal] = useState(null); 

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

  useEffect(() => {
    localStorage.setItem("bm_active_tab", "mobile_orders");
  }, []);

  // ── Convert order → receipt shape for ReceiptPrintTemplate ───────────────
  const orderToReceipt = (order) => ({
    merchant:     order.customer,
    date:         order.createdAt ? order.createdAt.slice(0, 10) : "",
    currency:     "PHP",
    total_amount: order.total,
    brand:        order.brand,
    branch:       order.branch,
    address:      order.address,
    phone:        order.phone,
    reference_no: order.id,
    lineItems: (order.items || []).map(item => ({
      description: item.name,
      quantity:    item.qty ?? item.quantity ?? 1,
      unit_price:  item.price ?? 0,
      total_price: (item.price ?? 0) * (item.qty ?? item.quantity ?? 1),
    })),
  });

  // ── Print handler (mirrors Receipts.jsx handlePrint) ──────────────────────
  const handlePrint = (order) => {
    const receipt = orderToReceipt(order);
    setPrintReceipts([receipt]);
    setTimeout(() => {
      const el = printRef.current;
      if (!el) return;
      el.setAttribute("data-print", "true");
      el.style.display = "block";
      document.body.appendChild(el);
      const img = el.querySelector("img");
      if (img && !img.complete) {
        img.onload = () => {
          window.print();
          el.style.display = "none";
          el.removeAttribute("data-print");
        };
      } else {
        window.print();
        el.style.display = "none";
        el.removeAttribute("data-print");
      }
    }, 300);
  };

  // ── Status advance ────────────────────────────────────────────────────────
  const advanceStatus = async (id, nextUiStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const dbStatus = UI_TO_DB_STATUS[nextUiStatus];

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextUiStatus } : o));
    if (viewOrder?.id === id) setViewOrder(v => ({ ...v, status: nextUiStatus }));
    if (itemsModal?.id === id) setItemsModal(v => ({ ...v, status: nextUiStatus }));

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
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: isDanger ? "#dc2626" : "#00897b", marginBottom: 6 }}>
            Confirm Action
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0d2b1e", marginBottom: 6 }}>{confirmModal.label}</div>
          <div style={{ fontSize: 13, color: "#5a7a65", marginBottom: 24 }}>
            Order <strong style={{ color: "#0d2b1e" }}>#{confirmModal.id}</strong>
            {order ? <span> · {order.customer}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmModal(null)} style={{ padding: "9px 22px", borderRadius: 9, border: "1px solid #d1eedd", background: "#f8fffe", color: "#5a7a65", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button onClick={confirmAdvance} style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: isDanger ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Action Dropdown ───────────────────────────────────────────────────────
  const [dropdownRect, setDropdownRect] = useState(null);

  const ActionButtons = ({ order }) => {
    const flow  = STATUS_FLOW[order.status];
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
        <button ref={btnRef} onClick={handleToggle}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c" }}>
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
          <div style={{ position: "fixed", top: dropdownRect.top, right: dropdownRect.right, zIndex: 9999, background: "#fff", border: "1px solid #d1eedd", borderRadius: 10, boxShadow: "0 8px 28px rgba(0,0,0,0.13)", minWidth: 180, overflow: "hidden" }}>
            {actions.map(({ label, nextStatus, danger }) => (
              <button key={nextStatus} onClick={() => requestAdvance(order.id, nextStatus, label)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderTop: danger ? "1px solid #fecaca" : "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, textAlign: "left", color: danger ? "#dc2626" : "#0d2b1e" }}
                onMouseEnter={e => e.currentTarget.style.background = danger ? "#fff5f5" : "#f0fdf5"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
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

  // ── Order Items Modal (with Print button) ─────────────────────────────────
  const OrderItemsModal = () => {
    if (!itemsModal) return null;
    const order = itemsModal;
    return (
      <div
        onClick={() => setItemsModal(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 20 }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Modal header */}
          <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", borderRadius: "20px 20px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Order #{order.id}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{fmtDate(order.createdAt)}</div>
              </div>
            </div>
            <button onClick={() => setItemsModal(null)}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: "22px 24px" }}>
            {/* Customer */}
            <div style={{ marginBottom: 14, padding: "12px 14px", background: "#f0fdf5", borderRadius: 12, border: "1px solid #d1eedd" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 5 }}>Customer</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0d2b1e" }}>{order.customer}</div>
              {order.phone && <div style={{ fontSize: 12, color: "#5a7a65", marginTop: 2 }}>{order.phone}</div>}
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div style={{ marginBottom: 14, padding: "12px 14px", background: "#fffdf0", borderRadius: 12, border: "1px solid #e8d5a3", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8a6a00", marginBottom: 4 }}>Delivery Address</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0d2b1e" }}>{order.address}</div>
                </div>
              </div>
            )}

            {/* Brand / Branch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ label: "Brand", value: order.brand }, { label: "Branch", value: order.branch }].map(({ label, value }, i) => (
                <div key={label} style={{ padding: "10px 12px", background: i === 0 ? "#e0f2f1" : "#f8fffe", borderRadius: 10, border: i === 0 ? "1px solid #b2dfdb" : "1px solid #e0f2f1" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e" }}>{value || "—"}</div>
                </div>
              ))}
            </div>

            {/* Items table */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 8 }}>Order Items</div>
              {order.items.length === 0 ? (
                <div style={{ fontSize: 12, color: "#5a7a65", fontStyle: "italic", padding: "10px 12px" }}>No item details available.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Item", "Qty", "Price", "Total"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#ffffff", background: "linear-gradient(135deg,#2E7D32,#00897b)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f8fffe" : "#fff", borderBottom: "1px solid #e0f2f1" }}>
                        <td style={{ padding: "9px 10px", fontWeight: 700, color: "#0d2b1e" }}>{item.name}</td>
                        <td style={{ padding: "9px 10px", color: "#5a7a65", textAlign: "center" }}>{item.qty ?? item.quantity ?? 1}</td>
                        <td style={{ padding: "9px 10px", color: "#5a7a65" }}>{fmtPeso(item.price)}</td>
                        <td style={{ padding: "9px 10px", fontWeight: 700, color: "#00897b" }}>{fmtPeso((item.price ?? 0) * (item.qty ?? item.quantity ?? 1))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid #d1eedd" }}>
                      <td colSpan={3} style={{ padding: "10px 10px", fontWeight: 800, textAlign: "right", color: "#00695c", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total</td>
                      <td style={{ padding: "10px 10px", fontWeight: 800, fontSize: 15, color: "#00897b" }}>{fmtPeso(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Status + Print */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid #e0f2f1" }}>
              <StatusBadge status={order.status} />
              <button
                onClick={() => { setItemsModal(null); handlePrint(order); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,140,60,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Order
              </button>
            </div>
          </div>
        </div>
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
      <button onClick={fetchOrders} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #d1eedd", background: "#e0f2f1", color: "#00695c", fontWeight: 700, cursor: "pointer" }}>
        Retry
      </button>
    </div>
  );

  // ── Derived tab lists ─────────────────────────────────────────────────────
  const activeOrders    = filtered.filter(o => o.status !== "received" && o.status !== "rejected");
  const completedOrders = filtered.filter(o => o.status === "received" || o.status === "rejected");

  // ── Items cell button (shared between both tables) ────────────────────────
  const ItemsButton = ({ order, completed = false }) => (
    <button
      onClick={(e) => { e.stopPropagation(); setItemsModal(order); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        border: "1px solid #b2dfdb",
        background: completed ? "#f0fdf5" : "#FFF7ED",
        color: "#00695c",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {order.items.length}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Montserrat',sans-serif" }}>

      {/* ── Modals ── */}
      <ConfirmModal />
      <OrderItemsModal />

      {/* ── View Order Modal ── */}
      {viewOrder && (
        <div onClick={() => setViewOrder(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "92vh", overflowY: "auto" }}>

            <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", borderRadius: "20px 20px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Order #{viewOrder.id}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{fmtDate(viewOrder.createdAt)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Print button in view modal header */}
                <button
                  onClick={() => { setViewOrder(null); handlePrint(viewOrder); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print
                </button>
                <button onClick={() => setViewOrder(null)}
                  style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 18, padding: "12px 14px", background: "#f0fdf5", borderRadius: 12, border: "1px solid #d1eedd" }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 6 }}>Customer</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0d2b1e" }}>{viewOrder.customer}</div>
                <div style={{ fontSize: 12, color: "#5a7a65", marginTop: 2 }}>{viewOrder.phone}</div>
              </div>

              <div style={{ marginBottom: 18, padding: "12px 14px", background: "#fffdf0", borderRadius: 12, border: "1px solid #e8d5a3", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8a6a00", marginBottom: 4 }}>Delivery Address</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0d2b1e" }}>{viewOrder.address || "—"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[{ label: "Brand", value: viewOrder.brand }, { label: "Branch", value: viewOrder.branch }].map(({ label, value }, i) => (
                  <div key={label} style={{ padding: "10px 12px", background: i === 0 ? "#e0f2f1" : "#f8fffe", borderRadius: 10, border: i === 0 ? "1px solid #b2dfdb" : "1px solid #e0f2f1" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5a7a65", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e" }}>{value}</div>
                  </div>
                ))}
              </div>

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

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusBadge status={viewOrder.status} />
                <ActionButtons order={viewOrder} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <BmStatCard label="Total Orders"  value={counts.total}      icon={<Package size={20} color="#065f46" />}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All time" />
        <BmStatCard label="Processing"    value={counts.pending}    icon={<AlertTriangle size={20} color="#92400e" />} bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting action" />
        <BmStatCard label="In Transit"    value={counts.in_transit} icon={<TrendingUp size={20} color="#1e40af" />}    bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="On the way" />
        <BmStatCard label="Received"      value={counts.received}   icon={<Check size={20} color="#065f46" />}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed" />
      </div>

      {/* ── Tab bar + Refresh ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #d1eedd", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" }}>
          {[
            { key: "active",    label: "Active Orders", count: activeOrders.length },
            { key: "completed", label: "Completed",     count: completedOrders.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: "8px 22px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, transition: "all .15s", background: activeTab === tab.key ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent", color: activeTab === tab.key ? "#fff" : "#5a7a65", boxShadow: activeTab === tab.key ? "0 2px 10px rgba(0,180,90,0.28)" : "none" }}>
              {tab.label}
              <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 11, background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "rgba(0,168,76,0.12)", color: activeTab === tab.key ? "#fff" : "#00695c" }}>
                {tab.count}
              </span>
            </button>
          ))}
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
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
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
                      <ItemsButton order={order} />
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
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid #f0f8f0", overflow: "hidden" }}>
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
                      <ItemsButton order={order} completed />
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

      {/* ── Print template (hidden, mirrors Receipts.jsx pattern) ── */}
      <ReceiptPrintTemplate ref={printRef} receipts={printReceipts} />
    </div>
  );
}

// APPLICATIONS 
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

function FAApplicationsContent({ applications: initialApps }) {
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
      </div>
    </>
  );
}

function CreateAccountModal({ applicant, onClose, onAlert }) {
  const [sending, setSending] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [branches, setBranches] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

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
    const role = 'Franchisee';
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
      if (!res.ok) { const err = await res.json(); onAlert(err.error || 'Failed to create account.', 'error'); return; }
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
            <input value="Franchisee" disabled style={{ ...bmInput, marginTop: 4, background: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }} />
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



// ═════════════════════════════════════════════════════════════════════════════
// MODULE 4 — ANNOUNCEMENTS (re-exported from AdminDashboard logic)
// ═════════════════════════════════════════════════════════════════════════════
function FACommunicationContent({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [fetching, setFetching] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteHistory, setDeleteHistory] = useState([]);
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const PIN_KEY = 'fa_announcement_pins';

  useEffect(() => {
    try { const raw = localStorage.getItem(PIN_KEY); if (raw) setPinnedIds(new Set(JSON.parse(raw))); } catch {}
    fetchAnnouncements(); fetchDeleteHistory();
  }, []);

  const fetchAnnouncements = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch { setAnnouncements([]); }
    finally { setFetching(false); }
  };

  const fetchDeleteHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history`);
      const data = await res.json();
      setDeleteHistory(Array.isArray(data) ? data.map(e => ({ id: e.id, deletedAt: e.deleted_at, data: { title: e.title, content: e.content, image_url: e.image_url } })) : []);
    } catch {}
  };

  const persistPins = (newSet) => { try { localStorage.setItem(PIN_KEY, JSON.stringify([...newSet])); } catch {} };

  const handlePin = (item) => {
    const id = String(item.id);
    setPinnedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); persistPins(next); return next; });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setAlertModal({ message: 'Please fill in title and content.', type: 'error' }); return; }
    try {
      const url = editing ? `${process.env.REACT_APP_API_URL}/announcements/${editing.id}` : `${process.env.REACT_APP_API_URL}/announcements`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, image_url: imageUrl.trim() || null, userId: user?.id, role: user?.role }) });
      const data = await res.json();
      if (!res.ok) { setAlertModal({ message: data.error || 'Failed to save.', type: 'error' }); return; }
      setModalVisible(false); setEditing(null); setTitle(''); setContent(''); setImageUrl(''); setImageError(false);
      fetchAnnouncements();
      setAlertModal({ message: editing ? 'Announcement updated!' : 'Announcement posted!', type: 'success' });
    } catch { setAlertModal({ message: 'Failed to save announcement.', type: 'error' }); }
  };

  const handleDelete = (item) => {
    setConfirmModal({ message: `Delete "${item.title}"?`, onConfirm: async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${item.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id, role: user?.role }) });
        if (res.ok) { if (viewingItem?.id === item.id) setViewingItem(null); fetchAnnouncements(); fetchDeleteHistory(); setAlertModal({ message: 'Announcement deleted.', type: 'success' }); }
      } catch {}
    }, itemName: item.title });
  };

  const handleRestore = async (entry) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: entry.data.title, content: entry.data.content, image_url: entry.data.image_url || null, userId: user?.id, role: user?.role }) });
      const data = await res.json();
      if (res.ok) {
        await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, { method: 'DELETE' });
        fetchAnnouncements(); fetchDeleteHistory();
        setAlertModal({ message: `"${entry.data.title}" restored!`, type: 'success' });
      }
    } catch {}
  };

  const merged = announcements.map(a => ({ ...a, pinned: pinnedIds.has(String(a.id)) }));
  const now = new Date(), sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const tabFiltered = selectedTab === 'recent' ? merged.filter(a => new Date(a.created_at) >= sevenDaysAgo)
    : selectedTab === 'pinned' ? merged.filter(a => a.pinned)
    : selectedTab === 'deleteHistory' ? [] : merged;

  const fmt = (d) => new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getInitials = (t = '') => t.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

  const tabs = [
    { key: 'all', label: 'All', count: merged.length },
    { key: 'recent', label: 'Recent', count: merged.filter(a => new Date(a.created_at) >= sevenDaysAgo).length },
    { key: 'pinned', label: 'Pinned', count: pinnedIds.size },
    { key: 'deleteHistory', label: '🗑 Delete History', count: deleteHistory.length },
  ];

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Modals */}
      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#dc2626" /></div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Delete Announcement?</h2>
            {confirmModal.itemName && <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>You are about to delete <strong>"{confirmModal.itemName}"</strong>.</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(220,38,38,0.35)' }}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '20px 24px 22px', borderRadius: '18px 18px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.25em', marginBottom: 4 }}>IFRANCHISE</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px' }}>Announcements</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '5px 11px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d4df33', boxShadow: '0 0 0 3px rgba(212,223,51,0.3)' }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: '#d4df33', letterSpacing: '0.15em' }}>LIVE</span>
          </div>
          <button onClick={() => { setEditing(null); setTitle(''); setContent(''); setImageUrl(''); setImageError(false); setModalVisible(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 7, padding: '14px 20px', background: '#fff', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {tabs.map(({ key, label, count }) => {
          const active = selectedTab === key;
          const isDel = key === 'deleteHistory';
          return (
            <button key={key} onClick={() => setSelectedTab(key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: active ? 'none' : `1px solid ${isDel ? '#fecaca' : C.border}`, transition: 'all .15s', background: active ? (isDel ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)') : isDel ? '#fee2e2' : '#e8f5e9', color: active ? '#fff' : isDel ? '#dc2626' : '#5a7a65', boxShadow: active ? '0 2px 8px rgba(0,180,90,0.28)' : 'none' }}>
              {label}
              {count > 0 && <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 800, background: active ? 'rgba(255,255,255,0.28)' : isDel ? '#fecaca' : C.greenMid, color: active ? '#fff' : isDel ? '#dc2626' : '#2E7D32' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ background: '#f8fffe', padding: '20px 20px 24px', borderRadius: '0 0 18px 18px', minHeight: 300 }}>
        {selectedTab === 'deleteHistory' ? (
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,140,60,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 200px', gap: 8, padding: '10px 16px', borderBottom: `2px solid #e0f2f1`, fontSize: 10, fontWeight: 800, color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#f8fffe' }}>
              <span>Title</span><span>Preview</span><span>Deleted At</span><span></span>
            </div>
            {deleteHistory.length === 0
              ? <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>No deleted announcements.</div>
              : deleteHistory.map((entry, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 200px', gap: 8, alignItems: 'center', padding: '12px 16px', borderBottom: i < deleteHistory.length - 1 ? '1px solid #f0f8f0' : 'none' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.data.title}</div>
                  <div style={{ fontSize: 11, color: '#5a7a65', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.data.content}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{fmt(entry.deletedAt)}</div>
                  <button onClick={() => handleRestore(entry)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 9, border: '1.5px solid #00897b', background: '#e0f2f1', color: '#00695c', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    <RotateCcw size={11} /> Restore
                  </button>
                </div>
              ))}
          </div>
        ) : (
          fetching ? <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>Loading…</div>
            : tabFiltered.length === 0 ? <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>No announcements yet.</div>
            : tabFiltered.map(item => (
              <div key={item.id} onClick={() => setViewingItem(prev => prev?.id === item.id ? null : item)}
                style={{ display: 'flex', background: '#fff', borderRadius: 18, marginBottom: 10, border: `1px solid ${item.pinned ? '#FFE082' : C.border}`, boxShadow: item.pinned ? '0 3px 14px rgba(249,168,37,0.18)' : '0 2px 10px rgba(0,140,60,0.07)', overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,140,60,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = item.pinned ? '0 3px 14px rgba(249,168,37,0.18)' : '0 2px 10px rgba(0,140,60,0.07)'; }}>
                <div style={{ width: 4, flexShrink: 0, background: item.pinned ? 'linear-gradient(180deg,#F9A825,#FFC107)' : 'linear-gradient(180deg,#00897b,#4CAF50)' }} />
                <div style={{ flex: 1, padding: '13px 15px 11px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.pinned ? 'linear-gradient(135deg,#F9A825,#E65100)' : 'linear-gradient(135deg,#2E7D32,#00897b)', fontSize: 13, fontWeight: 900, color: '#fff' }}>{getInitials(item.title)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0d2b1e' }}>{item.title}</span>
                        {item.pinned && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FFF8E1', borderRadius: 6, padding: '2px 6px', border: '1px solid #FFE082', fontSize: 8, fontWeight: 800, color: '#F9A825' }}>🔖 PINNED</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#8AAD96', fontFamily: 'monospace' }}>{new Date(item.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: 12.5, color: '#5a7a65', lineHeight: 1.65, marginTop: 9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'flex-start' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handlePin(item)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f0fdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F9A825' }}>{item.pinned ? '🔖' : '📌'}</button>
                      <button onClick={() => { setEditing(item); setTitle(item.title); setContent(item.content); setImageUrl(item.image_url || ''); setImageError(false); setModalVisible(true); }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f0fdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00695c' }}><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(item)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f0fdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53935' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* View full modal */}
      {viewingItem && (
        <div onClick={() => setViewingItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', borderRadius: '20px 20px 0 0', padding: '20px 22px 28px' }}>
              <button onClick={() => setViewingItem(null)} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>{viewingItem.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontFamily: 'monospace' }}>{new Date(viewingItem.created_at).toLocaleString()}</div>
            </div>
            <div style={{ padding: '22px 24px 28px' }}>
              {viewingItem.image_url && <div style={{ marginBottom: 18, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={viewingItem.image_url} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} /></div>}
              <p style={{ fontSize: 14.5, color: '#1A3A2A', lineHeight: 1.75, margin: 0 }}>{viewingItem.content}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                <button onClick={() => handlePin(viewingItem)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: viewingItem.pinned ? 'none' : '1.5px solid #FFE082', background: viewingItem.pinned ? '#F9A825' : '#FFF8E1', color: viewingItem.pinned ? '#fff' : '#F9A825' }}>{viewingItem.pinned ? '🔖 Unpin' : '📌 Pin'}</button>
                <button onClick={() => { setEditing(viewingItem); setTitle(viewingItem.title); setContent(viewingItem.content); setImageUrl(viewingItem.image_url || ''); setModalVisible(true); setViewingItem(null); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff' }}><Pencil size={13} /> Edit</button>
                <button onClick={() => { handleDelete(viewingItem); setViewingItem(null); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid #fecaca', background: '#fee2e2', color: '#dc2626' }}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalVisible && (
        <div onClick={() => setModalVisible(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>{editing ? 'Edit Announcement' : 'New Announcement'}</span>
              <button onClick={() => setModalVisible(false)} style={{ width: 30, height: 30, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.18)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '22px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Title</label>
                <input type="text" placeholder="Announcement title…" value={title} onChange={e => setTitle(e.target.value)} required style={{ ...bmInput, marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Content</label>
                <textarea placeholder="Write your announcement…" value={content} onChange={e => setContent(e.target.value)} required rows={4} style={{ ...bmInput, marginTop: 4, resize: 'vertical', lineHeight: 1.65 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={bmLabel}>Image URL (optional)</label>
                <input type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImageError(false); }} style={{ ...bmInput, marginTop: 4 }} />
                {imageUrl && !imageError && <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} onError={() => setImageError(true)} /></div>}
                {imageUrl && imageError && <div style={{ marginTop: 8, padding: '9px 12px', background: '#fee2e2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>⚠ Could not load image.</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModalVisible(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)' }}><Check size={14} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 5 — BRAND & BRANCH (view-only + ability to edit branch details)
// ═════════════════════════════════════════════════════════════════════════════
function FABrandBranchContent({ brands: propBrands, onBrandsChange }) {
  const [brands, setBrands] = useState(propBrands || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: '', brand_id: '', region: '', manager: '', contact: '', address: '', concept: '' });
  const [alertModal, setAlertModal] = useState(null);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => a.name === 'Head Office' ? -1 : b.name === 'Head Office' ? 1 : 0);
      setBrands(sorted); onBrandsChange?.(sorted);
    } catch { console.error('Failed to fetch brands'); }
    finally { setLoading(false); }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); setAlertModal({ message: 'Branch updated!', type: 'success' }); }
      else setAlertModal({ message: data.error || 'Failed to update.', type: 'error' });
    } catch { setAlertModal({ message: 'Failed to update.', type: 'error' }); }
  };

  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const allRegions = [...new Set(brands.flatMap(b => (b.branches || []).map(br => br.region).filter(Boolean)))];

  const filteredBrands = brands.map(brand => ({
    ...brand,
    branches: (brand.branches || []).filter(br =>
      (!searchQuery || br.name.toLowerCase().includes(searchQuery.toLowerCase()) || (br.manager || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      true
    ),
  })).filter(brand => {
    if (filterBrand !== 'all' && String(brand.id) !== String(filterBrand)) return false;
    if (searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
    return true;
  });

  const thSt = { padding: '9px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5, color: '#00897b', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '2px solid #d1eedd', background: '#f8fffe', whiteSpace: 'nowrap' };
  const tdSt = { padding: '11px 12px', borderBottom: '1px solid #f0f8f0', verticalAlign: 'middle' };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}

      {/* Edit Branch Modal */}
      {showEditBranchModal && (
        <div onClick={() => setShowEditBranchModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>Edit Branch</h2>
              <button onClick={() => setShowEditBranchModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleEditBranch}>
              {[['Branch Name', 'name', 'text', true], ['Branch Manager', 'manager', 'text', false], ['Address', 'address', 'text', false]].map(([label, field, type, req]) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={bmLabel}>{label}{req ? ' *' : ''}</label>
                  <input type={type} value={branchForm[field]} onChange={e => setBranchForm(p => ({ ...p, [field]: e.target.value }))} required={req} style={{ ...bmInput, marginTop: 4 }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Region *</label>
                <select value={branchForm.region} onChange={e => setBranchForm(p => ({ ...p, region: e.target.value }))} required style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select region</option>
                  {['NCR', 'Region 3', 'Region 4A', 'Region 4B', 'Region 5', 'Region 7', 'Region 11'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Contact Number</label>
                <input type="tel" maxLength={11} value={branchForm.contact}
                  onChange={e => setBranchForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                  style={{ ...bmInput, marginTop: 4 }} placeholder="09XXXXXXXXX" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditBranchModal(false)} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)' }}><Check size={14} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Notice banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(233,205,48,0.12),rgba(255,168,117,0.08))', border: '1.5px solid rgba(233,205,48,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Info size={16} color="#8a6a00" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#5d4400' }}>View-only access — You can view all brands & branches and edit branch details. Branch creation/deletion is restricted to Super Admins.</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 28 }}>
        <BmStatCard label="Total Brands" value={brands.length} icon={<Globe size={20} color="#065f46" />} bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="Registered brands" />
        <BmStatCard label="Total Branches" value={totalBranches} icon={<Store size={20} color="#065f46" />} bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Across all brands" />
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.13)', borderRadius: 16, padding: '14px 18px', marginBottom: 18, boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#5a7a65" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search brands or branches…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...bmInput, paddingLeft: 32, width: 260, height: 36 }} />
          </div>
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{ ...bmInput, height: 36, width: 180, appearance: 'none', cursor: 'pointer' }}>
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: '#5a7a65', fontWeight: 600 }}>
              👁 View-only · Edit branch details via the pencil icon
            </span>
          </div>
        </div>
      </div>

      {/* Brand list */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 14, fontWeight: 600 }}>Loading brands & branches…</div>
      ) : filteredBrands.map(brand => (
        <div key={brand.id} style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={20} color="#fff" /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  {brand.contact_email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                  {brand.contact_phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? 'branch' : 'branches'}</span>
          </div>

          <div style={{ width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '20%' }} /><col style={{ width: '12%' }} /><col style={{ width: '17%' }} />
                <col style={{ width: '14%' }} /><col style={{ width: '22%' }} /><col style={{ width: '8%' }} /><col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr>{['Branch Name', 'Region', 'Manager', 'Contact', 'Address', 'Concept', 'Edit'].map(h => <th key={h} style={thSt}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(!brand.branches || brand.branches.length === 0) ? (
                  <tr><td colSpan={7} style={{ padding: '24px 20px', color: '#5a7a65', fontSize: 13, fontStyle: 'italic', textAlign: 'center', borderBottom: 'none' }}>No branches yet.</td></tr>
                ) : brand.branches.map(branch => (
                  <tr key={branch.id}
                    onMouseEnter={e => { [...e.currentTarget.querySelectorAll('td')].forEach(td => td.style.background = '#f6fef8'); }}
                    onMouseLeave={e => { [...e.currentTarget.querySelectorAll('td')].forEach(td => td.style.background = ''); }}>
                    <td style={{ ...tdSt, fontWeight: 700, color: '#0d2b1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{branch.name}</td>
                    <td style={{ ...tdSt, color: '#5a7a65', fontSize: 12 }}>{branch.region}</td>
                    <td style={{ ...tdSt, color: '#0d2b1e', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{branch.manager || '—'}</td>
                    <td style={{ ...tdSt, color: '#5a7a65', fontSize: 12 }}>{branch.contact || '—'}</td>
                    <td style={{ ...tdSt, color: '#5a7a65', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{branch.address || '—'}</td>
                    <td style={tdSt}>
                      {branch.concept ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{branch.concept}</span> : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ ...tdSt, whiteSpace: 'nowrap' }}>
                      <button title="Edit branch" onClick={() => { setSelectedBranch(branch); setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager || '', contact: branch.contact || '', address: branch.address || '', concept: branch.concept || '' }); setShowEditBranchModal(true); }}
                        style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #b2dfdb', background: '#e0f2f1', color: '#00695c', cursor: 'pointer', flexShrink: 0 }}>
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 6 — PROFILE (identical logic to admin's ProfileContent)
// ═════════════════════════════════════════════════════════════════════════════
function FAProfileContent({ user }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', personalEmail: '', role: user?.role || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('minLength');
    if (!/[A-Z]/.test(password)) errors.push('uppercase');
    if (!/[a-z]/.test(password)) errors.push('lowercase');
    if (!/\d/.test(password)) errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('specialChar');
    return { isValid: errors.length === 0, errors };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'newPassword') {
      if (value) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(value).errors); }
      else { setShowPasswordValidation(false); setPasswordErrors([]); }
    }
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      const data = await res.json();
      if (data.success) { setOtpSent(true); setAlertModal({ message: `OTP sent to ${emailToSend}`, type: 'success' }); }
      else setAlertModal({ message: data.message || 'Failed to send OTP.', type: 'error' });
    } catch { setAlertModal({ message: 'Failed to send OTP.', type: 'error' }); }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError('');
      const emailToVerify = formData.personalEmail || formData.email;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword, email: emailToVerify, otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpModal(false); setShowSuccessModal(true);
        localStorage.removeItem('user'); localStorage.removeItem('tempUser');
        setTimeout(() => { window.location.href = '/admin-login'; }, 3000);
      } else setOtpError(data.error || 'Failed to change password');
    } catch { setOtpError('Failed to change password. Please try again.'); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isUnlocked) return;
    const errs = {};
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (isPasswordChange) {
      if (!formData.currentPassword) errs.currentPassword = 'Enter your current password.';
      if (!formData.newPassword) errs.newPassword = 'Enter a new password.';
      else { const pv = validatePasswordStrength(formData.newPassword); if (!pv.isValid) errs.newPassword = 'Password does not meet requirements.'; }
      if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your new password.';
      else if (formData.newPassword !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
      sendOtp(); setShowOtpModal(true);
    } else updateProfile();
  };

  const updateProfile = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, branch: user.branch }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertModal({ message: 'Profile updated!', type: 'success' });
        localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name, email: formData.email }));
        setIsUnlocked(false);
      } else setAlertModal({ message: data.error || 'Failed to update.', type: 'error' });
    } catch { setAlertModal({ message: 'Failed to update.', type: 'error' }); }
  };

  const initials = user?.name ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'F';

  const inputStyle = (disabled) => ({ ...bmInput, marginTop: 4, background: disabled ? '#f5f8f5' : '#fff', color: disabled ? '#9ca3af' : '#0d2b1e', cursor: disabled ? 'not-allowed' : 'text', border: disabled ? '1.5px solid #e5e7eb' : '1.5px solid #b2dfdb' });

  const EyeToggle = ({ show, onToggle, disabled }) => (
    <button type="button" onClick={onToggle} disabled={disabled} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: '#5a7a65', display: 'flex', alignItems: 'center', padding: 0 }}>
      {show ? <Eye size={16} /> : <Lock size={16} />}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}

      {/* Account overview */}
      <BmSection style={{ marginBottom: 24 }}>
        <BmSectionHeader title="Account Overview" />
        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#e9cd30,#ffa875)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#3d2000', flexShrink: 0, letterSpacing: 1, border: '2.5px solid rgba(233,205,48,0.4)' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#0d2b1e', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'linear-gradient(135deg,rgba(233,205,48,0.2),rgba(255,168,117,0.15))', color: '#3d2000', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, border: '1px solid rgba(233,205,48,0.3)' }}>{ROLE_LABEL}</span>
              {user?.branch && <span style={{ background: '#f0fdf5', color: '#0d2b1e', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1.5px solid #b2dfdb' }}>{user.branch}</span>}
            </div>
          </div>
        </div>
      </BmSection>

      {/* Lock/Unlock banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isUnlocked ? '#f0fdf5' : '#f5f8f5', border: `1.5px solid ${isUnlocked ? '#b2dfdb' : '#e5e7eb'}`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUnlocked ? <Unlock size={18} color="#00897b" /> : <Lock size={18} color="#94a3b8" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{isUnlocked ? 'Editing Enabled' : 'Profile Locked'}</div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>{isUnlocked ? 'Make your changes and save when done.' : 'Click Unlock to edit your profile.'}</div>
          </div>
        </div>
        <button type="button" onClick={() => { if (isUnlocked) { setConfirmModal({ message: 'Discard all unsaved changes?', onConfirm: () => { setFormData({ name: user?.name || '', email: user?.email || '', personalEmail: '', role: user?.role || '', currentPassword: '', newPassword: '', confirmPassword: '' }); setIsUnlocked(false); } }); } else setIsUnlocked(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: isUnlocked ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff' }}>
          {isUnlocked ? '✕ Cancel' : ' Unlock'}
        </button>
      </div>

      {/* Two-column form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Personal Info */}
        <BmSection>
          <BmSectionHeader title="Personal Information" />
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
            {[['Full Name', 'name', 'text'], ['Work Email', 'email', 'email']].map(([label, name, type]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <label style={bmLabel}>{label}</label>
                <input type={type} name={name} value={formData[name]} onChange={handleInputChange} disabled={!isUnlocked} style={inputStyle(!isUnlocked)} />
                {fieldErrors[name] && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>}
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              <input value={formData.role} disabled style={{ ...inputStyle(true), background: '#f0f0f0' }} />
            </div>
            <button type="submit" disabled={!isUnlocked} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: isUnlocked ? 1 : 0.6 }}>Save Changes</button>
          </form>
        </BmSection>

        {/* Change Password */}
        <BmSection>
          <BmSectionHeader title="Change Password" />
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
            <div style={{ background: isUnlocked ? '#f0fdf5' : '#f5f8f5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1.5px solid ${isUnlocked ? C.border : '#e5e7eb'}`, fontSize: 12, color: C.muted }}>
              {isUnlocked ? 'An OTP will be sent to your email for verification' : 'Unlock your profile to change your password'}
            </div>
            {[['currentPassword', 'Current Password', showCurrentPw, () => setShowCurrentPw(v => !v)],
              ['newPassword', 'New Password', showNewPw, () => setShowNewPw(v => !v)],
              ['confirmPassword', 'Confirm New Password', showConfirmPw, () => setShowConfirmPw(v => !v)]].map(([name, label, show, toggle]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <label style={bmLabel}>{label}</label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input type={show ? 'text' : 'password'} name={name} value={formData[name]} onChange={handleInputChange} placeholder={isUnlocked ? `Enter ${label.toLowerCase()}` : '••••••••'} disabled={!isUnlocked} style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }} />
                  <EyeToggle show={show} onToggle={toggle} disabled={!isUnlocked} />
                </div>
                {name === 'newPassword' && isUnlocked && showPasswordValidation && (
                  <div style={{ marginTop: 8, fontSize: 12, padding: '10px 14px', background: '#f0fdf5', borderRadius: 10, border: '1.5px solid #b2dfdb' }}>
                    {[['minLength', 'At least 8 characters'], ['uppercase', 'Uppercase letter'], ['lowercase', 'Lowercase letter'], ['number', 'Number (0-9)'], ['specialChar', 'Special character']].map(([k, t]) => (
                      <div key={k} style={{ color: passwordErrors.includes(k) ? '#dc2626' : '#059669', marginBottom: 2, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{passwordErrors.includes(k) ? '✗' : '✓'} {t}</div>
                    ))}
                  </div>
                )}
                {name === 'confirmPassword' && isUnlocked && formData.confirmPassword && (
                  <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: formData.newPassword === formData.confirmPassword ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
                {fieldErrors[name] && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>}
              </div>
            ))}
            <button type="submit" disabled={!isUnlocked} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: isUnlocked ? 1 : 0.6 }}>Update Password</button>
          </form>
        </BmSection>
      </div>

      {/* OTP Modal */}
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
              <input type="text" placeholder="000000" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }} maxLength={6} autoFocus
                style={{ ...bmInput, marginTop: 6, fontSize: 24, textAlign: 'center', letterSpacing: '0.6rem', fontFamily: 'monospace' }} />
            </div>
            {otpError && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, border: '1.5px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>{otpError}</div>}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button type="button" onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#00897b', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>Resend OTP</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button type="button" onClick={verifyOtpAndChangePassword} disabled={otp.length !== 6} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: otp.length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: otp.length !== 6 ? 0.5 : 1 }}>Verify & Change</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 22, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>Password Changed!</h2>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>Your password has been updated successfully. Redirecting to login…</p>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>↩</div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Discard Changes?</h2>
            <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Keep Editing</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#c2410c,#ea580c)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}