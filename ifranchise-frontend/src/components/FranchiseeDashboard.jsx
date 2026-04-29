import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import {
  Home, Box, Layers, DollarSign, FileText, MessageCircle,
  User, LogOut, Search, Package, AlertTriangle, BarChart2,
  Store, Globe, MapPin, Phone, Mail, ChevronDown, X, Check,
  RefreshCw, Calendar, BarChart, Archive, TrendingUp, TrendingDown,
  Eye, ShoppingCart, Lock, ChevronRight, Plus, Pencil, Trash2,
  Send, Download, Receipt, Zap, Activity, Sparkles, Shield,
  Edit2, Bell, Users, FileCheck, Star
} from 'lucide-react';


const VIBE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --g1:#00c853; --g2:#00897b; --g3:#1a4a2e; --g4:#0d2b1e;
    --green-primary:#2E7D32; --green-dark:#1B5E20; --green-light:#4CAF50;
    --green-accent:#d4df33; --green-bg:#ccfcc7; --white:#ffffff;
    --off-white:#F0EFE7; --gray-100:#F3F4F6; --gray-200:#E5E7EB;
    --gray-300:#D1D5DB; --gray-400:#9CA3AF; --gray-500:#6B7280;
    --gray-600:#4B5563; --gray-700:#374151; --gray-800:#1F2937;
    --text-dark:#1A1A1A; --text-gray:#004d00;
    --shadow:rgba(46,125,50,0.1); --shadow-strong:rgba(46,125,50,0.2);
    --blue:#3B82F6; --red:#EF4444; --orange:#F59E0B; --success:#10B981;
    --card-border:rgba(0,168,76,0.12);
    --grad-main:linear-gradient(135deg,#00c853,#00897b);
    --grad-dark:linear-gradient(135deg,#0d2b1e,#1a4a2e);
    --grad-gold:linear-gradient(135deg,#e9cd30,#ffa875);
    --grad-bg:linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%);
    --grad-blue:linear-gradient(135deg,#3b82f6,#1d4ed8);
    --grad-orange:linear-gradient(135deg,#f59e0b,#d97706);
    --grad-red:linear-gradient(135deg,#ef4444,#dc2626);
    --grad-purple:linear-gradient(135deg,#8b5cf6,#7c3aed);
  }
  .v-card {
    background:#fff; border:1px solid var(--card-border);
    border-radius:20px; box-shadow:0 2px 20px rgba(0,140,60,0.07);
    transition:transform .2s,box-shadow .2s; overflow:hidden;
  }
  .v-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,140,60,0.14); }
  .v-kpi {
    background:#fff; border:1px solid var(--card-border);
    border-radius:20px; padding:22px 24px;
    box-shadow:0 2px 16px rgba(0,140,60,0.07);
    transition:transform .2s,box-shadow .2s;
    position:relative; overflow:hidden;
  }
  .v-kpi::before {
    content:''; position:absolute; top:-30px; right:-30px;
    width:100px; height:100px; border-radius:50%;
    background:linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,137,123,0.06));
    pointer-events:none;
  }
  .v-kpi:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(0,140,60,0.15); }
  .v-kpi-label { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; color:#5a7a65; margin-bottom:8px; font-family:'Montserrat',sans-serif; }
  .v-kpi-value { font-family:'Montserrat',sans-serif; font-size:26px; font-weight:800; color:#0d2b1e; }
  .v-kpi-sub { font-size:11px; font-weight:600; color:#94a3b8; margin-top:4px; font-family:'Poppins',sans-serif; }
  .v-kpi-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .v-kpi-icon.green { background:rgba(0,200,83,0.1); color:#00897b; }
  .v-kpi-icon.blue  { background:rgba(59,130,246,0.1); color:#3b82f6; }
  .v-kpi-icon.orange{ background:rgba(245,158,11,0.1); color:#f59e0b; }
  .v-kpi-icon.red   { background:rgba(239,68,68,0.1); color:#ef4444; }
  .v-kpi-icon.purple{ background:rgba(139,92,246,0.1); color:#8b5cf6; }
  .v-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid rgba(0,168,76,0.1); }
  .v-section-title { font-family:'Montserrat',sans-serif; font-size:1.3rem; font-weight:800; color:#0d2b1e; display:flex; align-items:center; gap:10px; }
  .v-section-title-accent { width:6px; height:24px; border-radius:3px; background:var(--grad-main); }
  .v-btn { padding:9px 20px; border-radius:12px; border:none; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Montserrat',sans-serif; font-size:13px; display:inline-flex; align-items:center; gap:7px; letter-spacing:.02em; }
  .v-btn-primary { background:var(--grad-main); color:#fff; box-shadow:0 4px 14px rgba(0,180,90,.3); }
  .v-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,180,90,.4); }
  .v-btn-secondary { background:var(--gray-100); color:var(--gray-700); border:1px solid var(--gray-200); }
  .v-btn-secondary:hover { background:var(--gray-200); }
  .v-btn-danger { background:var(--grad-red); color:#fff; box-shadow:0 4px 14px rgba(239,68,68,.25); }
  .v-btn-danger:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(239,68,68,.35); }
  .v-btn-ghost { background:transparent; color:#00897b; border:1.5px solid rgba(0,137,123,0.3); }
  .v-btn-ghost:hover { background:rgba(0,137,123,0.08); }
  .v-btn-blue { background:var(--grad-blue); color:#fff; box-shadow:0 4px 14px rgba(59,130,246,.3); }
  .v-btn-blue:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(59,130,246,.4); }
  .v-btn-sm { padding:6px 14px; font-size:12px; border-radius:9px; }
  .v-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-family:'Montserrat',sans-serif; }
  .v-badge::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }
  .v-badge-green { background:rgba(0,200,83,0.12); color:#00897b; }
  .v-badge-orange { background:rgba(245,158,11,0.12); color:#d97706; }
  .v-badge-red { background:rgba(239,68,68,0.12); color:#dc2626; }
  .v-badge-blue { background:rgba(59,130,246,0.12); color:#2563eb; }
  .v-badge-purple { background:rgba(139,92,246,0.12); color:#7c3aed; }
  .v-table { width:100%; border-collapse:collapse; }
  .v-table th { text-align:left; padding:12px 16px; font-family:'Montserrat',sans-serif; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#5a7a65; background:rgba(0,168,76,0.05); border-bottom:2px solid rgba(0,168,76,0.1); }
  .v-table th:first-child { border-radius:12px 0 0 0; }
  .v-table th:last-child { border-radius:0 12px 0 0; }
  .v-table td { padding:14px 16px; border-bottom:1px solid rgba(0,168,76,0.07); color:#374151; font-size:13.5px; transition:background .15s; font-family:'Poppins',sans-serif; }
  .v-table tr:hover td { background:rgba(0,200,83,0.03); }
  .v-table tr:last-child td { border-bottom:none; }
  .v-search-wrap { position:relative; }
  .v-search-wrap svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
  .v-search { width:100%; padding:10px 14px 10px 38px; border:2px solid rgba(0,168,76,0.15); border-radius:12px; font-family:'Poppins',sans-serif; font-size:13px; color:#0d2b1e; background:#fafffc; transition:all .2s; outline:none; }
  .v-search::placeholder { color:#94a3b8; }
  .v-search:focus { border-color:#00897b; box-shadow:0 0 0 3px rgba(0,137,123,0.1); background:#fff; }
  .v-form-group { margin-bottom:18px; }
  .v-form-label { display:block; font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:.07em; color:#5a7a65; margin-bottom:7px; font-family:'Montserrat',sans-serif; }
  .v-form-input, .v-form-select { width:100%; padding:11px 14px; border:2px solid rgba(0,168,76,0.15); border-radius:12px; font-family:'Poppins',sans-serif; font-size:14px; color:#0d2b1e; background:#fafffc; outline:none; transition:all .2s; }
  .v-form-input:focus, .v-form-select:focus { border-color:#00897b; box-shadow:0 0 0 3px rgba(0,137,123,0.1); background:#fff; }
  .v-form-input:disabled { background:var(--gray-100); color:var(--gray-500); cursor:not-allowed; }
  .v-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:2000; animation:vFadeIn .2s ease; backdrop-filter:blur(4px); }
  .v-modal { background:#fff; padding:2rem; border-radius:22px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.25); animation:vSlideUp .25s ease; border:1px solid rgba(0,168,76,0.15); }
  .v-modal-title { font-family:'Montserrat',sans-serif; font-size:1.4rem; font-weight:800; color:#0d2b1e; margin-bottom:6px; }
  .v-tabs { display:flex; gap:3px; background:rgba(0,168,76,0.06); border-radius:14px; padding:4px; width:fit-content; margin-bottom:22px; }
  .v-tab { padding:8px 20px; border-radius:10px; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; font-family:'Montserrat',sans-serif; color:#5a7a65; background:transparent; }
  .v-tab.active { background:var(--grad-main); color:#fff; box-shadow:0 3px 10px rgba(0,180,90,.3); }
  .v-tab:hover:not(.active) { background:rgba(0,168,76,0.1); color:#0d2b1e; }
  .v-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:22px; }
  .v-empty { text-align:center; padding:60px 20px; color:#94a3b8; }
  .v-empty-icon { font-size:3.5rem; margin-bottom:16px; }
  .v-empty-title { font-family:'Montserrat',sans-serif; font-size:1.1rem; font-weight:800; color:#5a7a65; margin-bottom:8px; }
  .v-empty-sub { font-size:13px; line-height:1.6; font-family:'Poppins',sans-serif; }
  .v-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .v-dot-green { background:#00c853; box-shadow:0 0 6px #00c853; }
  .v-dot-red { background:#ef4444; box-shadow:0 0 6px #ef4444; }
  .v-dot-orange { background:#f59e0b; box-shadow:0 0 6px #f59e0b; }
  .v-dot-blue { background:#3b82f6; box-shadow:0 0 6px #3b82f6; }
  .placeholder-pill { display:inline-block; padding:5px 12px; border-radius:8px; background:linear-gradient(90deg,rgba(0,168,76,0.06) 25%,rgba(0,168,76,0.12) 50%,rgba(0,168,76,0.06) 75%); background-size:200% 100%; animation:shimmer 2s infinite; border:1.5px dashed rgba(0,168,76,0.25); color:#5a7a65; font-size:12px; font-weight:700; font-family:'Montserrat',sans-serif; margin-top:4px; }
  .v-pw-box { margin-top:10px; padding:12px 14px; background:rgba(0,168,76,0.04); border:1.5px solid rgba(0,168,76,0.15); border-radius:12px; font-size:12px; }
  .v-pw-rule { display:flex; align-items:center; gap:7px; padding:3px 0; font-weight:600; font-family:'Poppins',sans-serif; }
  .v-pw-rule.pass { color:#00897b; }
  .v-pw-rule.fail { color:#ef4444; }
  @keyframes vFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes vSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
`;


const fmtPeso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const UNITS = ['pcs','kg','g','liters','ml','tbsp','tsp','cups','bottles','packs','bags','boxes','cans'];

const validatePw = pw => {
  const errs = [];
  if (pw.length < 8) errs.push('minLength');
  if (!/[A-Z]/.test(pw)) errs.push('uppercase');
  if (!/[a-z]/.test(pw)) errs.push('lowercase');
  if (!/\d/.test(pw)) errs.push('number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push('special');
  return { valid: errs.length === 0, errs };
};

const VKpi = ({ label, value, sub, icon, color = 'green', placeholder }) => (
  <div className="v-kpi">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <div className="v-kpi-label">{label}</div>
        {placeholder
          ? <div className="placeholder-pill">— Pending connection</div>
          : <div className="v-kpi-value">{value}</div>}
      </div>
      <div className={`v-kpi-icon ${color}`}>{icon}</div>
    </div>
    {sub && <div className="v-kpi-sub">{sub}</div>}
  </div>
);

const VSectionTitle = ({ children, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div className="v-section-title-accent" />
    <span className="v-section-title">
      {icon && <span style={{ color: '#00897b' }}>{icon}</span>}
      {children}
    </span>
  </div>
);

const VEmptyState = ({ icon, title, sub }) => (
  <div className="v-empty">
    <div className="v-empty-icon">{icon}</div>
    <div className="v-empty-title">{title}</div>
    <div className="v-empty-sub">{sub}</div>
  </div>
);

const VPwBox = ({ errors }) => (
  <div className="v-pw-box">
    <div style={{ fontWeight: 800, fontSize: 11.5, color: '#5a7a65', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'Montserrat,sans-serif' }}>Password requirements</div>
    {[['minLength','At least 8 characters'],['uppercase','One uppercase letter (A-Z)'],['lowercase','One lowercase letter (a-z)'],['number','One number (0-9)'],['special','One special character']].map(([k,t]) => (
      <div key={k} className={`v-pw-rule ${errors.includes(k) ? 'fail' : 'pass'}`}>
        <span style={{ fontSize: 14 }}>{errors.includes(k) ? '✗' : '✓'}</span> {t}
      </div>
    ))}
  </div>
);

const ReadOnlyBanner = ({ message = 'View only — contact your admin to make changes.' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', borderRadius: 12, marginBottom: 18,
    background: 'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(29,78,216,0.04))',
    border: '1.5px solid rgba(59,130,246,0.15)',
    fontSize: 12, fontWeight: 600, color: '#2563eb', fontFamily: 'Poppins,sans-serif',
  }}>
    <Lock size={14} color="#3b82f6" />
    {message}
  </div>
);

export default function FranchiseeDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [brands, setBrands] = useState([]);

  const getUserFromStorage = () => {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString);
    navigate('/login');
    return null;
  };
  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) navigate('/login');
    else setUser(currentUser);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/transactions`)
      .then(r => r.json()).then(d => setTransactions(d)).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem('user'); window.location.reload(); };

  const navigation = [
    { id: 'dashboard',      label: 'Dashboard',       icon: <Home size={20} /> },
    { id: 'menuInventory',  label: 'Menu Inventory',  icon: <Box size={20} /> },
    { id: 'stockInventory', label: 'Stock Inventory', icon: <Layers size={20} /> },
    { id: 'pos',            label: 'POS',             icon: <DollarSign size={20} /> },
    { id: 'receipts',       label: 'Liquidation',     icon: <FileText size={20} /> },
    { id: 'reports',        label: 'Sales & Reports', icon: <BarChart2 size={20} /> },
    { id: 'staff',          label: 'Staff Management',icon: <Users size={20} /> },
    { id: 'communication',  label: 'Communication',   icon: <MessageCircle size={20} /> },
    { id: 'profile',        label: 'Edit Profile',    icon: <User size={20} /> },
    { id: 'logout',         label: 'Logout',          icon: <LogOut size={20} />, action: handleLogout },
  ];

  const moduleLabel = navigation.find(n => n.id === activeModule)?.label || 'Dashboard';

  return (
    <div className="franchisee-root">
      <style>{VIBE_CSS}{`
        .franchisee-root { font-family:'Poppins',sans-serif; display:flex; min-height:100vh; background:var(--grad-bg); }
        .fr-sidebar {
          width:${sidebarCollapsed ? '76px' : '272px'};
          background:#fff; box-shadow:2px 0 20px rgba(0,140,60,0.08);
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease; z-index:1000; overflow-y:auto; overflow-x:hidden;
        }
        .fr-sidebar-header {
          padding:1.4rem 1rem; border-bottom:1px solid rgba(0,168,76,0.1);
          display:flex; align-items:center; justify-content:space-between; min-height:72px;
        }
        .fr-logo-mark {
          width:34px; height:34px; border-radius:10px;
          background:var(--grad-main); display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:16px; color:#fff; font-family:'Montserrat',sans-serif;
          flex-shrink:0; box-shadow:0 4px 12px rgba(0,180,90,.3);
        }
        .fr-brand { font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.15rem; color:#0d2b1e; white-space:nowrap; }
        .fr-toggle { background:none; border:none; cursor:pointer; padding:6px; color:#94a3b8; border-radius:8px; transition:all .2s; flex-shrink:0; }
        .fr-toggle:hover { color:#00897b; background:rgba(0,168,76,0.08); }
        .fr-nav { padding:1rem 0.5rem; }
        .fr-nav-section { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#94a3b8; padding:12px 14px 6px; display:${sidebarCollapsed ? 'none' : 'block'}; font-family:'Montserrat',sans-serif; }
        .fr-nav-item {
          display:flex; align-items:center; gap:12px; padding:10px 12px;
          color:#5a7a65; cursor:pointer; transition:all .2s;
          border-radius:12px; position:relative; margin:2px 0;
          font-weight:600; font-size:14px; font-family:'Montserrat',sans-serif;
        }
        .fr-nav-item:hover { background:rgba(0,168,76,0.08); color:#0d2b1e; }
        .fr-nav-item.active { background:linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,137,123,0.1)); color:#00695c; box-shadow:inset 0 0 0 1.5px rgba(0,137,123,0.2); }
        .fr-nav-item.active .fr-nav-icon { color:#00897b; }
        .fr-nav-item.logout { color:#ef4444; margin-top:8px; }
        .fr-nav-item.logout:hover { background:rgba(239,68,68,0.08); }
        .fr-nav-icon { flex-shrink:0; display:flex; justify-content:center; width:22px; }
        .fr-nav-label { display:${sidebarCollapsed ? 'none' : 'block'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-nav-bar { position:absolute; right:0; top:20%; height:60%; width:3px; border-radius:2px; background:var(--grad-main); }
        .fr-main { flex:1; margin-left:${sidebarCollapsed ? '76px' : '272px'}; transition:margin-left 0.3s ease; }
        .fr-topbar {
          background:rgba(255,255,255,0.9); backdrop-filter:blur(12px);
          padding:1rem 2rem; box-shadow:0 2px 16px rgba(0,140,60,0.08);
          display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100;
          border-bottom:1px solid rgba(0,168,76,0.08);
        }
        .fr-topbar-breadcrumb { font-size:12px; color:#94a3b8; font-weight:600; font-family:'Poppins',sans-serif; }
        .fr-topbar-title { font-family:'Montserrat',sans-serif; font-size:1.5rem; font-weight:800; color:#0d2b1e; }
        .fr-user-name { font-weight:700; color:#0d2b1e; font-size:14px; font-family:'Montserrat',sans-serif; }
        .fr-user-role { font-size:11px; color:#94a3b8; font-weight:600; font-family:'Poppins',sans-serif; }
        .fr-avatar {
          width:42px; height:42px; border-radius:14px;
          background:var(--grad-main); display:flex; align-items:center; justify-content:center;
          font-size:1rem; font-weight:800; color:#fff; cursor:pointer;
          transition:all .2s; box-shadow:0 4px 12px rgba(0,180,90,.3);
          font-family:'Montserrat',sans-serif;
        }
        .fr-avatar:hover { transform:scale(1.08); box-shadow:0 6px 18px rgba(0,180,90,.4); }
        .fr-content { padding:1.8rem 2rem; }
        @media(max-width:768px){
          .fr-sidebar{width:${sidebarCollapsed ? '0' : '272px'};transform:translateX(${sidebarCollapsed ? '-100%' : '0'});}
          .fr-main{margin-left:0;}
          .fr-topbar,.fr-content{padding:1rem;}
        }
      `}</style>

      {/* Sidebar */}
      <aside className="fr-sidebar">
        <div className="fr-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="fr-logo-mark">iF</div>
              <span className="fr-brand">iFranchise</span>
            </div>
          )}
          {sidebarCollapsed && <div className="fr-logo-mark" style={{ margin: '0 auto' }}>iF</div>}
          {!sidebarCollapsed && (
            <button className="fr-toggle" onClick={() => setSidebarCollapsed(true)}><X size={16} /></button>
          )}
        </div>
        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button className="fr-toggle" onClick={() => setSidebarCollapsed(false)}><ChevronRight size={16} /></button>
          </div>
        )}
        <nav className="fr-nav">
          {!sidebarCollapsed && <div className="fr-nav-section">Main Menu</div>}
          {navigation.slice(0, 8).map(item => (
            <div
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="fr-nav-bar" />}
            </div>
          ))}
          {!sidebarCollapsed && <div className="fr-nav-section" style={{ marginTop: 8 }}>Account</div>}
          {navigation.slice(8).map(item => (
            <div
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? 'active' : ''} ${item.id === 'logout' ? 'logout' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="fr-main">
        <div className="fr-topbar">
          <div>
            <div className="fr-topbar-breadcrumb">iFranchise → {moduleLabel}</div>
            <h1 className="fr-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="fr-user-name">{user?.name}</div>
              <div className="fr-user-role">Franchisee — {user?.branch}</div>
            </div>
            <div className="fr-avatar">{(user?.name || 'F')[0]}</div>
          </div>
        </div>

        <div className="fr-content">
          {activeModule === 'dashboard'      && <FrDashboardContent transactions={transactions} brands={brands} user={user} />}
          {activeModule === 'menuInventory'  && <FrMenuInventoryContent user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <FrStockInventoryContent user={user} brands={brands} />}
          {activeModule === 'pos'            && <FrPOSContent user={user} brands={brands} />}
          {activeModule === 'receipts'       && <FrReceiptsContent user={user} />}
          {activeModule === 'reports'        && <FrReportsContent user={user} />}
          {activeModule === 'staff'          && <FrStaffManagementContent user={user} />}
          {activeModule === 'communication'  && <FrCommunicationContent />}
          {activeModule === 'profile'        && <FrProfileContent user={user} />}
        </div>
      </main>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="v-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowLogoutModal(false)}>
          <div className="v-modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', border: '1.5px solid rgba(239,68,68,0.15)' }}>🚪</div>
            <h2 className="v-modal-title" style={{ textAlign: 'center' }}>Log out?</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 24px', lineHeight: 1.6, fontFamily: 'Poppins,sans-serif' }}>You'll need to sign in again to access your account.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="v-btn v-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="v-btn v-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmLogout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FrDashboardContent({ transactions, brands, user }) {
  const userBranch = (user?.branch || '').trim();
  const fmtAmt = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const todayStr = new Date().toISOString().slice(0, 10);

  const myTransactions = useMemo(() =>
    transactions.filter(tx =>
      !userBranch ||
      (tx.branch || '').trim().toLowerCase() === userBranch.trim().toLowerCase()
    ),
    [transactions, userBranch]
  );

  const todaySales   = myTransactions.filter(tx => (tx.created_at || '').startsWith(todayStr));
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total || 0), 0);

  const monthSales = useMemo(() => {
    const now = new Date();
    return myTransactions.filter(tx => {
      const d = new Date(tx.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [myTransactions]);

  const monthRevenue = monthSales.reduce((s, tx) => s + Number(tx.total || 0), 0);
  const avgOrder     = monthSales.length ? monthRevenue / monthSales.length : 0;

  const [kpiData,    setKpiData]    = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  useEffect(() => {
    if (!userBranch) return;
    setKpiLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?preset=month&branch=${encodeURIComponent(userBranch)}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setKpiData(d); })
      .catch(() => {})
      .finally(() => setKpiLoading(false));
  }, [userBranch]);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00897b', marginBottom: 4, fontFamily: 'Montserrat,sans-serif' }}>Welcome back</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0d2b1e', margin: 0, fontFamily: 'Montserrat,sans-serif' }}>{user?.name}</h1>
        <div style={{ fontSize: 13, color: '#5a7a65', marginTop: 4, fontFamily: 'Poppins,sans-serif' }}>Branch: <strong style={{ color: '#0d2b1e' }}>{userBranch || '—'}</strong></div>
      </div>

      {/* KPI row */}
      <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <VKpi
          label="Today's Revenue"
          value={fmtAmt(todayRevenue)}
          icon={<DollarSign size={20} />}
          color="green"
          sub={`${todaySales.length} transactions today`}
        />
        <VKpi
          label="Monthly Revenue"
          value={fmtAmt(kpiData?.salesRevenue ?? monthRevenue)}
          icon={<BarChart size={20} />}
          color="green"
          sub="This month"
        />
        <VKpi
          label="Monthly Profit"
          value={kpiLoading ? '…' : fmtAmt(kpiData?.salesProfit ?? 0)}
          icon={<TrendingUp size={20} />}
          color="blue"
          sub="After cost of sales"
        />
        <VKpi
          label="Avg Order Value"
          value={fmtAmt(isNaN(avgOrder) ? 0 : avgOrder)}
          icon={<ShoppingCart size={20} />}
          color="orange"
          sub="Per transaction"
        />
      </div>

      {/* Sales breakdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Sales Revenue', key: 'salesRevenue', desc: 'Total income from POS sales.',  icon: '💰' },
          { label: 'Sales Profit',  key: 'salesProfit',  desc: 'Revenue minus cost of goods.',  icon: '📈' },
          { label: 'Cost of Sales', key: 'cogs',         desc: 'Total cost of goods sold.',     icon: '🧾' },
        ].map((k, i) => (
          <div key={i} className="v-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{k.label}</span>
            </div>
            <p style={{ fontSize: 11.5, color: '#5a7a65', lineHeight: 1.6, marginBottom: 12, fontFamily: 'Poppins,sans-serif' }}>{k.desc}</p>
            {kpiLoading
              ? <div style={{ background: '#f0fdf5', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Loading…</div>
              : kpiData?.[k.key] !== undefined
                ? <div style={{ background: '#e0f2f1', borderRadius: 10, padding: '8px 12px', fontSize: 16, fontWeight: 800, color: '#00695c', fontFamily: 'Montserrat,sans-serif' }}>{fmtAmt(kpiData[k.key])}</div>
                : <div style={{ background: '#f0fdf5', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>No data</div>
            }
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="v-card">
        <div style={{ background: 'var(--grad-dark)', padding: '16px 22px' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', fontFamily: 'Montserrat,sans-serif' }}>Recent Transactions — {userBranch}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="v-table">
            <thead>
              <tr>
                {['#', 'Date', 'Cashier', 'Items', 'Total', 'Payment'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myTransactions.slice(0, 10).map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 12 }}>#{tx.id}</td>
                  <td style={{ color: '#5a7a65', fontSize: 12 }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                  <td style={{ color: '#5a7a65' }}>{(tx.items || []).length} item(s)</td>
                  <td style={{ fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtAmt(tx.total)}</td>
                  <td>
                    <span className={`v-badge ${tx.payment_method === 'Cash' ? 'v-badge-green' : tx.payment_method === 'GCash' ? 'v-badge-blue' : 'v-badge-purple'}`}>
                      {tx.payment_method}
                    </span>
                  </td>
                </tr>
              ))}
              {myTransactions.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '36px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>No transactions for this branch yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FrMenuInventoryContent({ user, brands }) {
  const userBranch = (user?.branch || '').trim();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchInventory = useCallback(async () => {
    if (!userBranch) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`);
      const d = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch { setInventory([]); }
    finally { setLoading(false); }
  }, [userBranch]);

  useEffect(() => { if (userBranch) fetchInventory(); }, [fetchInventory, userBranch]);
  useEffect(() => { setPage(0); }, [search, filterCategory, filterStatus]);

  const categories = useMemo(() => [...new Set(inventory.map(i => i.category).filter(Boolean))], [inventory]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !(i.category || '').toLowerCase().includes(q)) return false;
      if (filterCategory && i.category !== filterCategory) return false;
      if (filterStatus === 'low' && i.stock >= i.min_stock) return false;
      if (filterStatus === 'ok'  && i.stock <  i.min_stock) return false;
      return true;
    });
  }, [inventory, search, filterCategory, filterStatus]);

  const lowCount   = inventory.filter(i => i.stock < i.min_stock).length;
  const totalValue = inventory.reduce((s, i) => s + (i.price || 0) * (i.stock || 0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <ReadOnlyBanner message="Menu inventory is read-only. Contact your admin to add, edit, or delete items." />

      <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <VKpi label="Total Items"  value={inventory.length}       icon={<Box size={20} />}           color="green"  sub="Menu items" />
        <VKpi label="Low Stock"    value={lowCount}               icon={<AlertTriangle size={20} />} color="red"    sub="Needs attention" />
        <VKpi label="Est. Value"   value={fmtPeso(totalValue)}    icon={<DollarSign size={20} />}    color="blue"   sub="Inventory value" />
        <VKpi label="Categories"   value={categories.length}      icon={<Package size={20} />}       color="orange" sub="Product types" />
      </div>

      <div className="v-card" style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="v-search-wrap" style={{ flex: '1 1 220px' }}>
            <Search size={13} />
            <input type="text" className="v-search" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="v-form-select" style={{ width: 150 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="v-form-select" style={{ width: 130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <button onClick={fetchInventory} className="v-btn v-btn-ghost v-btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="v-card">
        <div style={{ padding: '11px 18px', background: 'var(--grad-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <span style={{ fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Montserrat,sans-serif' }}>
            <Store size={14} color="#fff" /> Menu Inventory — {userBranch}
          </span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>{filtered.length} items · {lowCount} low stock</span>
        </div>

        {loading ? (
          <div style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 14, fontWeight: 700 }}>Loading inventory…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr>
                  {['Item Name', 'Category', 'Stock', 'Min Stock', 'Cost', 'Price', 'Ingredients', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(item => {
                  const low         = item.stock < item.min_stock;
                  const ingredients = item.ingredients || [];
                  const isExpanded  = expandedRows[item.id];
                  return (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{item.name}</td>
                        <td><span className="v-badge v-badge-green">{item.category}</span></td>
                        <td>
                          <span style={{ color: low ? '#ef4444' : '#0d2b1e', fontWeight: low ? 700 : 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {item.stock}
                            {low && <span className="v-badge v-badge-red" style={{ fontSize: 10 }}>LOW</span>}
                          </span>
                        </td>
                        <td style={{ color: '#5a7a65' }}>{item.min_stock}</td>
                        <td style={{ color: '#5a7a65' }}>{fmtPeso(item.cost || 0)}</td>
                        <td style={{ fontWeight: 700, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(item.price)}</td>
                        <td>
                          {ingredients.length === 0 ? (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                          ) : (
                            <button
                              onClick={() => setExpandedRows(p => ({ ...p, [item.id]: !p[item.id] }))}
                              className="v-btn v-btn-ghost v-btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              🧪 {ingredients.length}
                              <ChevronDown size={10} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                            </button>
                          )}
                        </td>
                        <td>
                          {low
                            ? <span className="v-badge v-badge-red">Low Stock</span>
                            : <span className="v-badge v-badge-green">In Stock</span>}
                        </td>
                      </tr>
                      {isExpanded && ingredients.length > 0 && (
                        <tr>
                          <td colSpan={8} style={{ padding: '0 16px 12px', background: 'rgba(0,168,76,0.03)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px', background: 'rgba(0,168,76,0.06)', borderRadius: 10, border: '1px solid rgba(0,168,76,0.15)' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', width: '100%', marginBottom: 4, fontFamily: 'Montserrat,sans-serif' }}>Ingredients per unit:</span>
                              {ingredients.map((ing, idx) => (
                                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fff', color: '#0d2b1e', border: '1px solid rgba(0,168,76,0.2)' }}>
                                  <span style={{ color: '#00897b', fontWeight: 700 }}>{ing.name}</span>
                                  <span style={{ color: '#94a3b8' }}>×</span>
                                  <span style={{ fontWeight: 800, color: '#00695c' }}>{ing.qty_required}</span>
                                  {ing.unit && <span style={{ fontSize: 11, color: '#94a3b8' }}>{ing.unit}</span>}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={8} style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>No items found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderTop: '1px solid rgba(0,168,76,0.1)', background: '#f9fefb' }}>
            <span style={{ fontSize: 12, color: '#5a7a65' }}>
              Showing <strong>{(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, filtered.length).toLocaleString()}</strong> of <strong>{filtered.length.toLocaleString()}</strong>
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page === 0 ? 0.35 : 1 }}>‹</button>
              <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE) - 1, p + 1))} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE) - 1} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page >= Math.ceil(filtered.length / PAGE_SIZE) - 1 ? 0.35 : 1 }}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FrStockInventoryContent({ user, brands }) {
  const userBranch = (user?.branch || '').trim();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [unitFilter, setUnitFilter]   = useState('');
  const [statusFilt, setStatusFilt]   = useState('');
  const [page, setPage]           = useState(0);
  const PAGE_SIZE = 50;

  const fetchItems = useCallback(async () => {
    if (!userBranch) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients?branch=${encodeURIComponent(userBranch)}`);
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [userBranch]);

  useEffect(() => { if (userBranch) fetchItems(); }, [fetchItems, userBranch]);
  useEffect(() => { setPage(0); }, [search, unitFilter, statusFilt]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => {
      if (q && !i.name.toLowerCase().includes(q)) return false;
      if (unitFilter && i.unit !== unitFilter) return false;
      if (statusFilt === 'low' && i.stock >= i.min_stock) return false;
      if (statusFilt === 'ok'  && i.stock <  i.min_stock) return false;
      return true;
    });
  }, [items, search, unitFilter, statusFilt]);

  const lowCount   = items.filter(i => i.stock < i.min_stock).length;
  const totalValue = items.reduce((s, i) => s + (i.cost_per_unit || 0) * (i.stock || 0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <ReadOnlyBanner message="Stock inventory is read-only. Contact your admin to add, edit, or delete ingredients." />

      <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <VKpi label="Total Ingredients" value={items.length}        icon={<Package size={20} />}       color="green"  sub="Registered" />
        <VKpi label="Low Stock Alerts"  value={lowCount}            icon={<AlertTriangle size={20} />} color="red"    sub="Needs reorder" />
        <VKpi label="Total Stock Value" value={fmtPeso(totalValue)} icon={<DollarSign size={20} />}    color="blue"   sub="Cost basis" />
      </div>

      <div className="v-card" style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="v-search-wrap" style={{ flex: '1 1 220px' }}>
            <Search size={13} />
            <input type="text" className="v-search" placeholder="Search ingredient…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="v-form-select" style={{ width: 130 }}>
            <option value="">All Units</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)} className="v-form-select" style={{ width: 130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <button onClick={fetchItems} className="v-btn v-btn-ghost v-btn-sm"><RefreshCw size={13} /> Refresh</button>
        </div>
      </div>

      <div className="v-card">
        <div style={{ padding: '11px 18px', background: 'var(--grad-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Montserrat,sans-serif' }}>🧪 Stock Ingredients — {userBranch}</span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>{filtered.length} items · {lowCount} low</span>
        </div>
        {loading ? (
          <div style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 14, fontWeight: 700 }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr>
                  {['Ingredient', 'Unit', 'Stock', 'Min Stock', 'Cost/Unit', 'Total Value', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(item => {
                  const low = item.stock < item.min_stock;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>🧪 {item.name}</td>
                      <td><span className="v-badge v-badge-purple">{item.unit}</span></td>
                      <td style={{ fontWeight: low ? 700 : 500, color: low ? '#ef4444' : '#0d2b1e', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {item.stock}
                        {low && <span className="v-badge v-badge-red" style={{ fontSize: 10 }}>LOW</span>}
                      </td>
                      <td style={{ color: '#5a7a65' }}>{item.min_stock}</td>
                      <td style={{ fontWeight: 700, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(item.cost_per_unit || 0)}</td>
                      <td style={{ color: '#5a7a65' }}>{fmtPeso((item.cost_per_unit || 0) * (item.stock || 0))}</td>
                      <td>
                        {low
                          ? <span className="v-badge v-badge-red">Low Stock</span>
                          : <span className="v-badge v-badge-green">In Stock</span>}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>No ingredients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FrPOSContent({ user, brands: propBrands = [] }) {
  const userBranch = (user?.branch || '').trim();

  const [menuItems,        setMenuItems]        = useState([]);
  const [cart,             setCart]             = useState([]);
  const [transactions,     setTransactions]     = useState([]);
  const [loadingTx,        setLoadingTx]        = useState(false);
  const [searchProduct,    setSearchProduct]    = useState('');
  const [txSearch,         setTxSearch]         = useState('');
  const [txDateFrom,       setTxDateFrom]       = useState('');
  const [txDateTo,         setTxDateTo]         = useState('');
  const [activeTab,        setActiveTab]        = useState('cashier');
  const [paymentMethod,    setPaymentMethod]    = useState('Cash');
  const [cashReceived,     setCashReceived]     = useState('');
  const [discountPct,      setDiscountPct]      = useState(0);
  const [vatEnabled,       setVatEnabled]       = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt,      setLastReceipt]      = useState(null);
  const [processing,       setProcessing]       = useState(false);
  const [txPage,           setTxPage]           = useState(0);
  const [noteInput,        setNoteInput]        = useState('');

  const VAT_RATE    = 0.12;
  const TX_PAGE_SIZE = 20;

  const fetchProducts = useCallback(async () => {
    if (!userBranch) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`);
      const d = await res.json();
      setMenuItems(Array.isArray(d) ? d : []);
    } catch { setMenuItems([]); }
  }, [userBranch]);

  const fetchTransactions = useCallback(async () => {
    if (!userBranch) return;
    setLoadingTx(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`);
      const d = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch { setTransactions([]); }
    finally { setLoadingTx(false); }
  }, [userBranch]);

  useEffect(() => { if (userBranch) fetchProducts(); }, [fetchProducts, userBranch]);
  useEffect(() => { if (userBranch) fetchTransactions(); }, [fetchTransactions, userBranch]);
  useEffect(() => { setTxPage(0); }, [txSearch, txDateFrom, txDateTo]);

  const allProducts = useMemo(() => {
    const q = searchProduct.toLowerCase();
    return menuItems
      .map(m => ({ ...m, source: 'menu', displayName: m.name }))
      .filter(p => !q || p.displayName.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }, [menuItems, searchProduct]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id && c.source === product.source);
      if (existing) return prev.map(c => c.id === product.id && c.source === product.source ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateQty = (id, source, delta) => setCart(prev =>
    prev.map(c => c.id === id && c.source === source ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0)
  );
  const removeFromCart = (id, source) => setCart(prev => prev.filter(c => !(c.id === id && c.source === source)));
  const clearCart = () => { setCart([]); setCashReceived(''); setDiscountPct(0); setNoteInput(''); };

  const subtotal    = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const discounted  = subtotal - discountAmt;
  const vatAmt      = vatEnabled ? discounted * VAT_RATE : 0;
  const totalAmt    = discounted + vatAmt;
  const changeDue   = paymentMethod === 'Cash' ? Math.max(0, parseFloat(cashReceived || 0) - totalAmt) : 0;
  const cashShortfall = paymentMethod === 'Cash' && cashReceived !== '' ? parseFloat(cashReceived || 0) - totalAmt : 0;

  const processSale = async () => {
    if (cart.length === 0) { alert('Cart is empty.'); return; }
    if (paymentMethod === 'Cash' && parseFloat(cashReceived || 0) < totalAmt) { alert('Cash received is less than total amount.'); return; }
    setProcessing(true);
    try {
      const payload = {
        branch: userBranch, cashier: user?.name || 'Staff', shop: '',
        payment_method: paymentMethod, cash_received: paymentMethod === 'Cash' ? parseFloat(cashReceived) : totalAmt,
        discount_pct: discountPct, subtotal, discount_amt: discountAmt, vat_enabled: vatEnabled,
        vat_amt: vatAmt, total: totalAmt, change_due: changeDue, note: noteInput,
        items: cart.map(c => ({ id: c.id, source: c.source, name: c.displayName, price: c.price, qty: c.qty, subtotal: c.price * c.qty })),
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) {
        setLastReceipt({ ...payload, id: d.id, date: new Date().toLocaleString() });
        setShowReceiptModal(true);
        clearCart(); fetchTransactions(); fetchProducts();
      } else alert(d.error || 'Failed to process sale');
    } catch { alert('Failed to process sale.'); }
    finally { setProcessing(false); }
  };

  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter(tx => {
      if (q && !String(tx.id).includes(q) && !(tx.cashier || '').toLowerCase().includes(q)) return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo   && tx.created_at > txDateTo + 'T23:59:59') return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const txPageItems  = filteredTx.slice(txPage * TX_PAGE_SIZE, (txPage + 1) * TX_PAGE_SIZE);
  const todayStr     = new Date().toISOString().slice(0, 10);
  const todaySales   = transactions.filter(tx => (tx.created_at || '').startsWith(todayStr));
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total || 0), 0);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", paddingBottom: 48 }}>
      <style>{`@media print{body>*{display:none!important;}.pos-receipt-print{display:block!important;}}`}</style>

      <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <VKpi label="Today's Revenue"    value={fmtPeso(todayRevenue)}                                                       icon={<DollarSign size={20} />}  color="green"  sub="All transactions today" />
        <VKpi label="Transactions Today" value={todaySales.length}                                                            icon={<Receipt size={20} />}     color="blue"   sub="Completed sales" />
        <VKpi label="Avg Order Value"    value={fmtPeso(todaySales.length ? todayRevenue / todaySales.length : 0)}            icon={<BarChart2 size={20} />}   color="orange" sub="Per transaction" />
        <VKpi label="Items in Cart"      value={cart.reduce((s, c) => s + c.qty, 0)}                                          icon={<ShoppingCart size={20} />} color="purple" sub="Current session" />
      </div>

      <div className="v-tabs">
        {[['cashier', 'Cashier'], ['history', 'Transaction History']].map(([id, label]) => (
          <button key={id} className={`v-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {activeTab === 'cashier' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, alignItems: 'start' }}>
          <div>
            <div className="v-card" style={{ padding: '14px 18px', marginBottom: 14 }}>
              <div className="v-search-wrap">
                <Search size={13} />
                <input type="text" className="v-search" placeholder="Search products…" value={searchProduct} onChange={e => setSearchProduct(e.target.value)} />
              </div>
            </div>

            {!userBranch ? (
              <div className="v-card" style={{ padding: '48px 0', textAlign: 'center' }}>
                <VEmptyState icon="⚠️" title="No branch assigned to your account" sub="Contact your admin to assign a branch." />
              </div>
            ) : allProducts.length === 0 ? (
              <div className="v-card" style={{ padding: '48px 0', textAlign: 'center' }}>
                <VEmptyState icon="🏪" title={`No products found for ${userBranch}`} sub="Menu items will appear here once added by admin." />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
                {allProducts.map(product => {
                  const inCart = cart.find(c => c.id === product.id && c.source === product.source);
                  return (
                    <div
                      key={`${product.source}-${product.id}`}
                      onClick={() => addToCart(product)}
                      style={{
                        background: '#fff', border: `2px solid ${inCart ? '#00897b' : 'rgba(0,168,76,0.12)'}`,
                        borderRadius: 14, padding: '14px 12px', cursor: 'pointer', transition: 'all .15s',
                        boxShadow: inCart ? '0 4px 16px rgba(0,137,123,0.18)' : '0 1px 6px rgba(0,140,60,0.05)',
                        position: 'relative', transform: inCart ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {inCart && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--grad-main)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>×{inCart.qty}</div>
                      )}
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 9, marginBottom: 10 }} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <div style={{ width: '100%', height: 90, borderRadius: 9, background: 'linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,137,123,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 10 }}>🛒</div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Montserrat,sans-serif' }}>{product.displayName}</div>
                      {product.category && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{product.category}</div>}
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(product.price)}</div>
                      {product.stock !== undefined && <div style={{ fontSize: 10, color: product.stock <= 5 ? '#ef4444' : '#94a3b8', marginTop: 3, fontWeight: 600 }}>Stock: {product.stock}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <div className="v-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: 'var(--grad-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: 800, fontSize: 14, fontFamily: 'Montserrat,sans-serif' }}>🛒 Order Cart</span>
                {cart.length > 0 && (
                  <button onClick={clearCart} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                )}
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto', padding: cart.length === 0 ? 0 : '8px 0' }}>
                {cart.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛒</div>Tap a product to add it
                  </div>
                ) : cart.map(item => (
                  <div key={`${item.source}-${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(0,168,76,0.08)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Montserrat,sans-serif' }}>{item.displayName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtPeso(item.price)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, item.source, -1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0d2b1e' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0d2b1e', minWidth: 20, textAlign: 'center', fontFamily: 'Montserrat,sans-serif' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.source, +1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00897b' }}>+</button>
                    </div>
                    <div style={{ minWidth: 60, textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(item.price * item.qty)}</div>
                    <button onClick={() => removeFromCart(item.id, item.source)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2, fontSize: 16 }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(0,168,76,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', whiteSpace: 'nowrap', fontFamily: 'Montserrat,sans-serif' }}>Discount %</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 5, 10, 15, 20].map(d => (
                      <button key={d} onClick={() => setDiscountPct(d)} style={{ height: 28, padding: '0 10px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', background: discountPct === d ? 'var(--grad-main)' : 'rgba(0,168,76,0.07)', color: discountPct === d ? '#fff' : '#5a7a65' }}>{d}%</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'Montserrat,sans-serif' }}>VAT (12%)</label>
                  <div onClick={() => setVatEnabled(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', background: vatEnabled ? 'var(--grad-main)' : '#e0e0e0', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: vatEnabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(0,168,76,0.05)', border: '1.5px solid rgba(0,168,76,0.12)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 5 }}>
                    <span>Subtotal</span><span style={{ fontWeight: 700 }}>{fmtPeso(subtotal)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#f59e0b', marginBottom: 5 }}>
                      <span>Discount ({discountPct}%)</span><span style={{ fontWeight: 700 }}>−{fmtPeso(discountAmt)}</span>
                    </div>
                  )}
                  {vatEnabled && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#3b82f6', marginBottom: 5 }}>
                      <span>VAT (12%)</span><span style={{ fontWeight: 700 }}>+{fmtPeso(vatAmt)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#0d2b1e', fontWeight: 800, paddingTop: 8, borderTop: '1.5px dashed rgba(0,168,76,0.2)', fontFamily: 'Montserrat,sans-serif' }}>
                    <span>Total</span><span style={{ color: '#00897b' }}>{fmtPeso(totalAmt)}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, fontFamily: 'Montserrat,sans-serif' }}>Payment Method</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Cash', 'GCash', 'Card', 'Others'].map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, height: 32, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', background: paymentMethod === m ? 'var(--grad-main)' : 'rgba(0,168,76,0.06)', color: paymentMethod === m ? '#fff' : '#5a7a65' }}>{m}</button>
                    ))}
                  </div>
                </div>
                {paymentMethod === 'Cash' && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, fontFamily: 'Montserrat,sans-serif' }}>Cash Received</div>
                    <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" className="v-form-input" style={{ fontSize: 16, fontWeight: 800, textAlign: 'right' }} />
                    {cashReceived !== '' && (
                      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, textAlign: 'right', color: cashShortfall < 0 ? '#ef4444' : '#00897b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                        {cashShortfall < 0
                          ? <><AlertTriangle size={12} /> Short by {fmtPeso(Math.abs(cashShortfall))}</>
                          : <><Check size={12} /> Change: {fmtPeso(changeDue)}</>}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Order note (optional)…" rows={2} className="v-form-input" style={{ height: 'auto', padding: '8px 11px', resize: 'none', lineHeight: 1.5 }} />
                </div>
                <button onClick={processSale} disabled={processing || cart.length === 0} className="v-btn v-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 15, fontWeight: 900, opacity: cart.length === 0 || processing ? 0.6 : 1, cursor: cart.length === 0 || processing ? 'not-allowed' : 'pointer', borderRadius: 13 }}>
                  {processing
                    ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Processing…</>
                    : <><Zap size={14} /> Charge {fmtPeso(totalAmt)}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <>
          <div className="v-card" style={{ padding: '14px 18px', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="v-search-wrap" style={{ flex: '1 1 200px' }}>
                <Search size={13} />
                <input type="text" className="v-search" placeholder="Search ID or cashier…" value={txSearch} onChange={e => setTxSearch(e.target.value)} />
              </div>
              <input type="date" value={txDateFrom} onChange={e => setTxDateFrom(e.target.value)} className="v-form-input" style={{ width: 150 }} />
              <input type="date" value={txDateTo}   onChange={e => setTxDateTo(e.target.value)}   className="v-form-input" style={{ width: 150 }} />
              {(txSearch || txDateFrom || txDateTo) && (
                <button onClick={() => { setTxSearch(''); setTxDateFrom(''); setTxDateTo(''); }} className="v-btn v-btn-ghost v-btn-sm">Clear</button>
              )}
            </div>
          </div>

          <div className="v-card">
            <div style={{ padding: '11px 18px', background: 'var(--grad-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Montserrat,sans-serif' }}>📋 Transaction History</span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>{filteredTx.length} records</span>
            </div>
            {loadingTx ? (
              <div style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65' }}>Loading…</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="v-table">
                  <thead>
                    <tr>
                      {['#', 'Date', 'Cashier', 'Items', 'Subtotal', 'Discount', 'VAT', 'Total', 'Payment'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {txPageItems.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>No transactions found.</td></tr>
                    ) : txPageItems.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ color: '#94a3b8', fontSize: 12 }}>#{tx.id}</td>
                        <td style={{ color: '#5a7a65', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                        <td style={{ color: '#5a7a65' }}>{(tx.items || []).length}</td>
                        <td style={{ color: '#5a7a65' }}>{fmtPeso(tx.subtotal)}</td>
                        <td>{tx.discount_pct > 0 ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>−{tx.discount_pct}%</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td>{tx.vat_enabled ? <span style={{ color: '#3b82f6', fontWeight: 700 }}>+{fmtPeso(tx.vat_amt)}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(tx.total)}</td>
                        <td>
                          <span className={`v-badge ${tx.payment_method === 'Cash' ? 'v-badge-green' : tx.payment_method === 'GCash' ? 'v-badge-blue' : 'v-badge-purple'}`}>
                            {tx.payment_method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showReceiptModal && lastReceipt && (
        <div className="v-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReceiptModal(false); }}>
          <div className="v-modal" style={{ width: 380, maxWidth: '95vw' }}>
            <div className="pos-receipt-print">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>iFranchise POS</div>
                <div style={{ fontSize: 12, color: '#5a7a65', marginTop: 2 }}>{lastReceipt.branch}</div>
                <div style={{ fontSize: 11, color: '#5a7a65' }}>{lastReceipt.date}</div>
                <div style={{ fontSize: 11, color: '#5a7a65' }}>Cashier: {lastReceipt.cashier}</div>
              </div>
              <div style={{ borderTop: '2px dashed rgba(0,168,76,0.2)', borderBottom: '2px dashed rgba(0,168,76,0.2)', padding: '12px 0', marginBottom: 12 }}>
                {(lastReceipt.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{item.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>×{item.qty}</span></span>
                    <span style={{ fontWeight: 700, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, marginBottom: 4, display: 'flex', justifyContent: 'space-between', color: '#5a7a65' }}>
                <span>Subtotal</span><span style={{ fontWeight: 700 }}>{fmtPeso(lastReceipt.subtotal)}</span>
              </div>
              {lastReceipt.discount_pct > 0 && (
                <div style={{ fontSize: 13, marginBottom: 4, display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                  <span>Discount ({lastReceipt.discount_pct}%)</span><span style={{ fontWeight: 700 }}>−{fmtPeso(lastReceipt.discount_amt)}</span>
                </div>
              )}
              {lastReceipt.vat_enabled && (
                <div style={{ fontSize: 13, marginBottom: 4, display: 'flex', justifyContent: 'space-between', color: '#3b82f6' }}>
                  <span>VAT (12%)</span><span style={{ fontWeight: 700 }}>+{fmtPeso(lastReceipt.vat_amt)}</span>
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 900, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,168,76,0.15)', paddingTop: 8, marginBottom: 8, fontFamily: 'Montserrat,sans-serif' }}>
                <span style={{ color: '#0d2b1e' }}>TOTAL</span><span style={{ color: '#00897b' }}>{fmtPeso(lastReceipt.total)}</span>
              </div>
              <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 2 }}>
                <span>Payment</span><span style={{ fontWeight: 700, color: '#0d2b1e' }}>{lastReceipt.payment_method}</span>
              </div>
              {lastReceipt.payment_method === 'Cash' && (
                <>
                  <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 2 }}>
                    <span>Cash Received</span><span style={{ fontWeight: 700 }}>{fmtPeso(lastReceipt.cash_received)}</span>
                  </div>
                  <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', color: '#5a7a65' }}>
                    <span>Change</span><span style={{ fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(lastReceipt.change_due)}</span>
                  </div>
                </>
              )}
              {lastReceipt.note && <div style={{ marginTop: 10, fontSize: 12, color: '#5a7a65', fontStyle: 'italic' }}>Note: {lastReceipt.note}</div>}
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#5a7a65' }}>Thank you for your purchase! 🎉</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => window.print()} className="v-btn v-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}><Receipt size={13} /> Print</button>
              <button onClick={() => setShowReceiptModal(false)} className="v-btn v-btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Check size={13} /> Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FrReceiptsContent({ user }) {
  return (
    <div>
      <ReadOnlyBanner message="Liquidation records for your branch. Contact admin for modifications." />
      <div className="v-card" style={{ padding: '48px 0', textAlign: 'center' }}>
        <VEmptyState icon="📄" title="Liquidation Records" sub="Your branch liquidation reports will appear here." />
      </div>
    </div>
  );
}

function FrReportsContent({ user }) {
  const branch = (user?.branch || '').trim();
  const today = new Date();
  const fmt8 = d => d.toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [dateTo, setDateTo] = useState(fmt8(today));
  const [aiReport, setAiReport] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewReportId, setViewReportId] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) { alert('Please select a date range first.'); return; }
    setGenerating(true);
    setAiReport('');
    try {
      const prompt = `Generate a concise franchise sales performance report for branch "${branch}" from ${dateFrom} to ${dateTo}. Include sections for: Executive Summary, Sales Performance, Revenue Analysis, Cost of Sales, Profit Summary, and Recommendations. Format it clearly with headers.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || '').join('') || 'Report generation failed.';
      setAiReport(text);
      const newReport = { id: Date.now(), generatedDate: new Date().toLocaleString('en-PH'), period: `${dateFrom} → ${dateTo}`, content: text };
      setReports(prev => [newReport, ...prev]);
    } catch { setAiReport('Failed to generate report. Please try again.'); }
    setGenerating(false);
  };

  const downloadReport = report => {
    const content = `FRANCHISE SALES & PERFORMANCE REPORT\n${'='.repeat(50)}\nBranch: ${branch}\nPeriod: ${report.period}\nGenerated: ${report.generatedDate}\n${'='.repeat(50)}\n\n${report.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${branch.replace(/\s+/g,'_')}_${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitReport = async report => {
    setSubmitting(report.id);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, period: report.period, generatedDate: report.generatedDate, content: report.content }),
      });
    } catch {}
    setHistory(prev => [{ id: report.id, generatedDate: report.generatedDate, period: report.period, submittedAt: new Date().toLocaleString('en-PH') }, ...prev]);
    setReports(prev => prev.filter(r => r.id !== report.id));
    setSubmitting(null);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="v-stat-grid">
        <VKpi label="Cost of Sales" placeholder icon={<TrendingDown size={20} />} color="orange" sub="Connect POS & Inventory" />
        <VKpi label="Sales Revenue" placeholder icon={<TrendingUp size={20} />} color="green" sub="Connect POS & Inventory" />
        <VKpi label="Gross Profit" placeholder icon={<DollarSign size={20} />} color="blue" sub="Revenue − Cost of Sales" />
        <VKpi label="Reports Generated" value={reports.length + history.length} sub="This session" icon={<FileText size={20} />} color="purple" />
      </div>

      {/* Generate Report Card */}
      <div className="v-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Sparkles size={16} />}>Generate AI Sales Report</VSectionTitle>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'end', marginBottom: 20 }}>
          <div className="v-form-group" style={{ marginBottom: 0 }}>
            <label className="v-form-label">From Date</label>
            <input type="date" className="v-form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} max={dateTo} />
          </div>
          <div className="v-form-group" style={{ marginBottom: 0 }}>
            <label className="v-form-label">To Date</label>
            <input type="date" className="v-form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom} max={fmt8(today)} />
          </div>
          <button
            className="v-btn v-btn-primary"
            onClick={generateReport}
            disabled={generating || !dateFrom || !dateTo}
            style={{ height: 46, paddingLeft: 24, paddingRight: 24, opacity: generating ? 0.7 : 1 }}
          >
            {generating
              ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Generating…</>
              : <><Sparkles size={14} /> Generate Report</>}
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', alignSelf: 'center', fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase', letterSpacing: '.06em' }}>Quick:</span>
          {[
            { label: 'This Week', from: fmt8(new Date(today.getTime() - 7*24*60*60*1000)), to: fmt8(today) },
            { label: 'This Month', from: fmt8(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmt8(today) },
            { label: 'Last Month', from: fmt8(new Date(today.getFullYear(), today.getMonth()-1, 1)), to: fmt8(new Date(today.getFullYear(), today.getMonth(), 0)) },
            { label: 'This Quarter', from: fmt8(new Date(today.getFullYear(), Math.floor(today.getMonth()/3)*3, 1)), to: fmt8(today) },
            { label: 'This Year', from: fmt8(new Date(today.getFullYear(), 0, 1)), to: fmt8(today) },
          ].map(p => (
            <button key={p.label} className="v-btn v-btn-ghost v-btn-sm" onClick={() => { setDateFrom(p.from); setDateTo(p.to); }}>{p.label}</button>
          ))}
        </div>

        {aiReport && (
          <div style={{ marginTop: 20, background: 'linear-gradient(135deg,rgba(0,168,76,0.04),rgba(0,137,123,0.03))', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles size={14} color="#00897b" /> AI Report Preview
              </div>
              <span style={{ fontSize: 11, color: '#5a7a65', fontFamily: 'Poppins,sans-serif' }}>Period: {dateFrom} → {dateTo}</span>
            </div>
            <pre style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12.5, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.8, maxHeight: 320, overflowY: 'auto' }}>{aiReport}</pre>
          </div>
        )}
      </div>

      {/* Generated Reports Table */}
      <div className="v-card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div className="v-section-head">
          <VSectionTitle icon={<FileCheck size={16} />}>Generated Reports</VSectionTitle>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>{reports.length} pending submission</span>
        </div>
        {reports.length === 0 ? (
          <VEmptyState icon="📊" title="No reports generated yet" sub="Select a date range and click Generate Report to create an AI-powered sales report." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr><th>Generated</th><th>Period</th><th>Preview</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: '#5a7a65', fontFamily: 'Poppins,sans-serif' }}>{r.generatedDate}</td>
                    <td><span className="v-badge v-badge-blue">{r.period}</span></td>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Poppins,sans-serif' }}>
                        {r.content.slice(0, 80)}…
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="v-btn v-btn-ghost v-btn-sm" onClick={() => setViewReportId(viewReportId === r.id ? null : r.id)}>
                          <Eye size={12} /> {viewReportId === r.id ? 'Hide' : 'View'}
                        </button>
                        <button className="v-btn v-btn-sm v-btn-blue" onClick={() => downloadReport(r)}>
                          <Download size={12} /> Download
                        </button>
                        <button
                          className="v-btn v-btn-primary v-btn-sm"
                          onClick={() => submitReport(r)}
                          disabled={submitting === r.id}
                          style={{ opacity: submitting === r.id ? 0.7 : 1 }}
                        >
                          {submitting === r.id
                            ? <><div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Sending…</>
                            : <><Send size={12} /> Submit to Admin</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {viewReportId && reports.find(r => r.id === viewReportId) && (
              <div style={{ margin: '16px 0', background: 'linear-gradient(135deg,rgba(0,168,76,0.04),rgba(0,137,123,0.03))', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>Report Details — {reports.find(r => r.id === viewReportId)?.period}</div>
                  <button className="v-btn v-btn-secondary v-btn-sm" onClick={() => setViewReportId(null)}><X size={12} /> Close</button>
                </div>
                <pre style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12.5, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{reports.find(r => r.id === viewReportId)?.content}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report History */}
      <div className="v-card" style={{ padding: '20px 22px' }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Archive size={16} />}>Report History</VSectionTitle>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>{history.length} submitted</span>
        </div>
        {history.length === 0 ? (
          <VEmptyState icon="📁" title="No submitted reports yet" sub="Reports submitted to admin will appear here for reference." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr><th>Submitted At</th><th>Period</th><th>Generated</th><th>Status</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontSize: 12, color: '#5a7a65', fontFamily: 'Poppins,sans-serif' }}>{h.submittedAt}</td>
                    <td><span className="v-badge v-badge-green">{h.period}</span></td>
                    <td style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>{h.generatedDate}</td>
                    <td><span className="v-badge v-badge-blue"><Send size={10} /> Submitted</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FrStaffManagementContent({ user }) {
  const franchiseeBranch = (user?.branch || '').trim();
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [pwErrors, setPwErrors] = useState([]);
  const [showPwRules, setShowPwRules] = useState(false);

  const emptyForm = { name: '', email: '', role: 'Staff', branch: franchiseeBranch, password: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users?branch=${encodeURIComponent(franchiseeBranch)}`);
      const d = await res.json();
      setStaff((Array.isArray(d) ? d : []).filter(u => ['Staff', 'Manager'].includes(u.role)));
    } catch { setStaff([]); }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'password') {
      if (value) { setShowPwRules(true); setPwErrors(validatePw(value).errs); }
      else { setShowPwRules(false); setPwErrors([]); }
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    if (!validatePw(form.password).valid) { alert('Password does not meet requirements.'); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, branch: franchiseeBranch }) });
      const d = await res.json();
      if (d.success) { await fetchStaff(); setShowAddModal(false); setForm(emptyForm); setShowPwRules(false); }
      else alert(d.error || 'Failed to add staff');
    } catch { alert('Failed to add staff'); }
  };

  const handleEdit = async e => {
    e.preventDefault();
    if (form.password && !validatePw(form.password).valid) { alert('Password does not meet requirements.'); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${editingStaff.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, role: form.role, branch: franchiseeBranch, ...(form.password && { password: form.password }) }) });
      const d = await res.json();
      if (d.success) { await fetchStaff(); setShowEditModal(false); setEditingStaff(null); setForm(emptyForm); setShowPwRules(false); }
      else alert(d.error || 'Failed to update');
    } catch { alert('Failed to update'); }
  };

  const handleDelete = async id => {
    if (confirmDel !== id) { setConfirmDel(id); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) { await fetchStaff(); setConfirmDel(null); }
      else alert(d.error || 'Failed to delete');
    } catch { alert('Failed to delete'); }
  };

  const closeModal = () => { setShowAddModal(false); setShowEditModal(false); setForm(emptyForm); setShowPwRules(false); setPwErrors([]); };

  const StaffForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit}>
      <div className="v-form-group">
        <label className="v-form-label">Full Name</label>
        <input type="text" name="name" className="v-form-input" value={form.name} onChange={handleInputChange} required />
      </div>
      <div className="v-form-group">
        <label className="v-form-label">Email Address</label>
        <input type="email" name="email" className="v-form-input" value={form.email} onChange={handleInputChange} required />
      </div>
      <div className="v-form-group">
        <label className="v-form-label">Role</label>
        <select name="role" className="v-form-select" value={form.role} onChange={handleInputChange}>
          <option value="Staff">Staff</option>
          <option value="Manager">Manager</option>
        </select>
      </div>
      <div className="v-form-group">
        <label className="v-form-label">Branch</label>
        <input type="text" className="v-form-input" value={franchiseeBranch} disabled />
      </div>
      <div className="v-form-group">
        <label className="v-form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
        <input type="password" name="password" className="v-form-input" value={form.password} onChange={handleInputChange} required={!isEdit} placeholder={isEdit ? 'Leave blank to keep current' : 'Enter secure password'} />
        {showPwRules && <VPwBox errors={pwErrors} />}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button type="button" className="v-btn v-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>Cancel</button>
        <button type="submit" className="v-btn v-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{isEdit ? 'Save Changes' : 'Create Account'}</button>
      </div>
    </form>
  );

  return (
    <>
      <div className="v-stat-grid">
        <VKpi label="Total Staff" value={staff.length} sub={`Branch: ${franchiseeBranch}`} icon={<Users size={20} />} color="green" />
        <VKpi label="Active Staff" value={staff.filter(s => (s.status || 'active') === 'active').length} sub="Active accounts" icon={<Check size={20} />} color="blue" />
        <VKpi label="Managers" value={staff.filter(s => s.role === 'Manager').length} sub="Manager accounts" icon={<Shield size={20} />} color="orange" />
      </div>

      <div className="v-card" style={{ padding: '20px 22px' }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Users size={16} />}>Staff Accounts — {franchiseeBranch}</VSectionTitle>
          <button className="v-btn v-btn-primary" onClick={() => { setForm(emptyForm); setShowPwRules(false); setPwErrors([]); setShowAddModal(true); }}>
            <Plus size={14} /> Create Staff Account
          </button>
        </div>

        {staff.length === 0 ? (
          <VEmptyState icon="👥" title="No staff accounts yet" sub="Create the first staff account for your branch." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--grad-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13, fontFamily: 'Montserrat,sans-serif', flexShrink: 0 }}>
                          {(s.name || 'S')[0]}
                        </div>
                        <strong style={{ color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{s.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#5a7a65', fontSize: 13 }}>{s.email}</td>
                    <td>{s.role === 'Manager' ? <span className="v-badge v-badge-orange"><Shield size={10} /> Manager</span> : <span className="v-badge v-badge-blue">Staff</span>}</td>
                    <td><span className="v-badge v-badge-green"><div className="v-dot v-dot-green" style={{ width: 6, height: 6 }} /> {(s.status || 'active').toUpperCase()}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="v-btn v-btn-ghost v-btn-sm" onClick={() => { setEditingStaff(s); setForm({ name: s.name, email: s.email, role: s.role, branch: franchiseeBranch, password: '' }); setShowPwRules(false); setPwErrors([]); setShowEditModal(true); }}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="v-btn v-btn-sm" style={{ color: confirmDel === s.id ? '#fff' : '#ef4444', background: confirmDel === s.id ? 'var(--grad-red)' : 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 9, boxShadow: confirmDel === s.id ? '0 3px 10px rgba(239,68,68,.3)' : 'none' }}>
                          <Trash2 size={12} /> {confirmDel === s.id ? 'Confirm?' : 'Delete'}
                        </button>
                        {confirmDel === s.id && (
                          <button className="v-btn v-btn-secondary v-btn-sm" onClick={() => setConfirmDel(null)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="v-modal-overlay" onClick={closeModal}>
          <div className="v-modal" onClick={e => e.stopPropagation()}>
            <h2 className="v-modal-title" style={{ marginBottom: 6 }}>Create Staff Account</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22, fontFamily: 'Poppins,sans-serif' }}>Add a new staff or manager to your branch.</p>
            <StaffForm onSubmit={handleAdd} isEdit={false} />
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="v-modal-overlay" onClick={closeModal}>
          <div className="v-modal" onClick={e => e.stopPropagation()}>
            <h2 className="v-modal-title" style={{ marginBottom: 6 }}>Edit Staff Account</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22, fontFamily: 'Poppins,sans-serif' }}>Update details for {editingStaff?.name}.</p>
            <StaffForm onSubmit={handleEdit} isEdit={true} />
          </div>
        </div>
      )}
    </>
  );
}

function FrCommunicationContent() {
  return (
    <div>
      <div className="v-card" style={{ overflow: 'hidden' }}>
        <div style={{ background: 'var(--grad-dark)', padding: '16px 22px' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', fontFamily: 'Montserrat,sans-serif' }}>Messages</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 480 }}>
          <div style={{ borderRight: '1.5px solid rgba(0,168,76,0.1)', background: 'rgba(0,168,76,0.02)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,168,76,0.1)' }}>
              <div className="v-search-wrap">
                <Search size={13} />
                <input type="text" className="v-search" placeholder="Search…" style={{ height: 34, fontSize: 12 }} />
              </div>
            </div>
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>No conversations yet.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'rgba(0,168,76,0.02)' }}>
            <MessageCircle size={48} color="rgba(0,168,76,0.15)" style={{ marginBottom: 16 }} />
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0d2b1e', marginBottom: 6, fontFamily: 'Montserrat,sans-serif' }}>Message Thread</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Select a conversation to view messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FrProfileContent({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '', personalEmail: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showOtpModal,     setShowOtpModal]     = useState(false);
  const [otp,              setOtp]              = useState('');
  const [otpSent,          setOtpSent]          = useState(false);
  const [otpError,         setOtpError]         = useState('');

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const sendOtp = async () => {
    try {
      const email = formData.personalEmail || formData.email;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const d = await res.json();
      if (d.success) { setOtpSent(true); alert(`OTP sent to ${email}`); }
      else alert(d.error || 'Failed to send OTP');
    } catch { alert('Failed to send OTP.'); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.currentPassword || formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) { alert("Passwords don't match!"); return; }
      sendOtp(); setShowOtpModal(true);
    } else {
      alert('Profile updated successfully!');
    }
  };

  return (
    <div>
      <div style={{ background: 'var(--grad-dark)', borderRadius: 20, padding: '28px 28px 20px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--grad-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, color: '#fff', fontFamily: 'Montserrat,sans-serif', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 20, color: '#fff' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontFamily: 'Poppins,sans-serif' }}>Franchisee · {user?.branch}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <span className="v-badge v-badge-green" style={{ background: 'rgba(0,200,83,0.2)', color: '#a7f3d0' }}>Franchisee</span>
            {user?.branch && <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#fff', fontFamily: 'Montserrat,sans-serif' }}>{user.branch}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="v-card" style={{ padding: '22px 24px' }}>
          <div className="v-section-head">
            <VSectionTitle icon={<User size={16} />}>Personal Information</VSectionTitle>
          </div>
          <form onSubmit={handleSubmit}>
            {[['Full Name', 'name', 'text'], ['Work Email', 'email', 'email']].map(([label, name, type]) => (
              <div key={name} className="v-form-group">
                <label className="v-form-label">{label}</label>
                <input type={type} value={formData[name]} onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))} className="v-form-input" />
              </div>
            ))}
            <div className="v-form-group">
              <label className="v-form-label">Personal Email <span style={{ textTransform: 'none', fontWeight: 500, color: '#94a3b8' }}>(for OTP)</span></label>
              <input type="email" value={formData.personalEmail} onChange={e => setFormData(p => ({ ...p, personalEmail: e.target.value }))} placeholder="your.personal@email.com" className="v-form-input" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="v-btn v-btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Check size={14} /> Save Changes</button>
            </div>
          </form>
        </div>

        <div className="v-card" style={{ padding: '22px 24px' }}>
          <div className="v-section-head">
            <VSectionTitle icon={<Lock size={16} />}>Change Password</VSectionTitle>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,168,76,0.06)', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 12, marginBottom: 20 }}>
            <Shield size={14} color="#00897b" />
            <span style={{ fontSize: 12, color: '#5a7a65', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>OTP will be sent to your email for verification</span>
          </div>
          <form onSubmit={handleSubmit}>
            {[['Current Password', 'currentPassword'], ['New Password', 'newPassword'], ['Confirm Password', 'confirmPassword']].map(([label, name]) => (
              <div key={name} className="v-form-group">
                <label className="v-form-label">{label}</label>
                <input type="password" value={formData[name]} onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))} className="v-form-input" />
              </div>
            ))}
            <button type="submit" className="v-btn v-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Lock size={14} /> Update Password
            </button>
          </form>
        </div>
      </div>

      {showOtpModal && (
        <div className="v-modal-overlay">
          <div className="v-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--grad-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem', boxShadow: '0 6px 20px rgba(0,180,90,.3)' }}>🔐</div>
            <h2 className="v-modal-title" style={{ textAlign: 'center' }}>Verify OTP</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', margin: '8px 0 20px', fontFamily: 'Poppins,sans-serif' }}>
              Code sent to <strong style={{ color: '#00897b' }}>{formData.personalEmail || formData.email}</strong>
            </p>
            <input
              type="text" placeholder="000000" value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
              maxLength={6} autoFocus
              className="v-form-input"
              style={{ fontSize: '1.8rem', textAlign: 'center', letterSpacing: '0.6rem', fontFamily: 'monospace', marginBottom: 12 }}
            />
            {otpError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <X size={14} color="#ef4444" /><span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>{otpError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="v-btn v-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}>Cancel</button>
              <button className="v-btn v-btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: otp.length !== 6 ? 0.5 : 1 }} disabled={otp.length !== 6}>
                <Check size={14} /> Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}