import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import jsPDF from 'jspdf';
import {
  Home, Box, Layers, DollarSign, FileText, MessageCircle,
  User, LogOut, Search, Package, AlertTriangle, BarChart2,
  Store, Globe, MapPin, Phone, Mail, ChevronDown, X, Check,
  RefreshCw, Calendar, BarChart, Archive, TrendingUp, TrendingDown,
  Eye, ShoppingCart, Lock, ChevronRight, Plus, Pencil, Trash2,
  Send, Download, Receipt, Zap, Activity, Sparkles, Shield, Save,
  Edit2, Bell, Users, FileCheck, Star,
} from 'lucide-react';
import StockInventoryContent from './StockInventoryContent';
import MenuInventoryContent from './MenuInventoryContent';



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
  const [activeModule, setActiveModule] = useState(() => {
    return sessionStorage.getItem('fr_activeModule') || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [brands, setBrands] = useState([]);

  const getUserFromStorage = () => {
    const userString =
    localStorage.getItem('user') ||
    localStorage.getItem('rememberedUser') ||
    sessionStorage.getItem('user'); 
    
    if (userString) return JSON.parse(userString);
    return null;
  };
  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    sessionStorage.setItem('fr_activeModule', activeModule);
  }, [activeModule]);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) navigate('/admin-login');
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
  const navigation = [
    { id: 'dashboard',      label: 'Dashboard',       icon: <Home size={20} /> },
   { id: 'menuInventory',  label: 'Menu Inventory',  icon: <Box size={20} /> },
{ id: 'stockInventory', label: 'Stock Inventory', icon: <Layers size={20} /> },
    { id: 'pos',            label: 'POS',             icon: <DollarSign size={20} /> },
    // { id: 'receipts',       label: 'Liquidation',     icon: <FileText size={20} /> },
    { id: 'reports',        label: 'Sales & Reports', icon: <BarChart2 size={20} /> },
    { id: 'communication',  label: 'Announcement',   icon: <MessageCircle size={20} /> },
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
              <div className="fr-user-role">Manager — {user?.branch}</div>
            </div>
            <div className="fr-avatar">{(user?.name || 'F')[0]}</div>
          </div>
        </div>

        <div className="fr-content">
          {activeModule === 'dashboard'      && <FrDashboardContent transactions={transactions} brands={brands} user={user} />}
         {activeModule === 'menuInventory'  && <MenuInventoryContent  user={user} brands={brands} />}
{activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'pos'            && <FrPOSContent user={user} brands={brands} />}
          {activeModule === 'receipts'       && <Receipts />}
          {activeModule === 'reports'        && <FrReportsContent user={user} transactions={transactions} />}
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

const fmtShort = (n) => { if (n >= 1_000_000) return '₱' + (n / 1_000_000).toFixed(1) + 'M'; if (n >= 1_000) return '₱' + (n / 1_000).toFixed(0) + 'k'; return '₱' + n; };
 
function FrDashboardContent({ transactions, brands, user }) {
  const userBranch = (user?.branch || '').trim();
  const today      = new Date();
  const fmt8       = (d) => d.toISOString().slice(0, 10);
 
  // ── date-range state ──────────────────────────────────────────────────────
  const [rangeMode,    setRangeMode]    = useState('preset');
  const [preset,       setPreset]       = useState('month');
  const [customFrom,   setCustomFrom]   = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo,     setCustomTo]     = useState(fmt8(today));
  const [appliedRange, setAppliedRange] = useState(null);
 
  // ── archive state ─────────────────────────────────────────────────────────
  const [archives,          setArchives]          = useState(() => {
    try { return JSON.parse(localStorage.getItem(`frArchives_${userBranch}`) || '[]'); } catch { return []; }
  });
  const [showArchivePanel,  setShowArchivePanel]  = useState(false);
  const [viewingArchive,    setViewingArchive]    = useState(null);
  const [archiveYearInput,  setArchiveYearInput]  = useState(String(today.getFullYear()));
  const [archiveConfirm,    setArchiveConfirm]    = useState(false);
 
  // ── chart tooltip ─────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);
 
  // ── KPI (server-side) ─────────────────────────────────────────────────────
  const [kpiData,    setKpiData]    = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);
 
  const fetchKpis = useCallback(async () => {
    if (!userBranch) return;
    setKpiLoading(true);
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
      params.set('branch', userBranch);
 
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
      const data = await res.json();
      if (!data.error) setKpiData(data);
    } catch (e) {
      console.error('KPI fetch error:', e);
    } finally {
      setKpiLoading(false);
    }
  }, [rangeMode, preset, appliedRange, userBranch]);
 
  useEffect(() => { if (!viewingArchive) fetchKpis(); }, [fetchKpis, viewingArchive]);
 
  // ── filter transactions to this branch ───────────────────────────────────
  const myTransactions = useMemo(() =>
    transactions.filter(tx =>
      (tx.branch || '').trim().toLowerCase() === userBranch.toLowerCase()
    ),
    [transactions, userBranch]
  );
 
  // ── chart data ────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (viewingArchive) return viewingArchive.chartData;
 
    const txList = myTransactions;
    if (!txList.length) return { labels: [], values: [] };
 
    const now = new Date();
 
    const filtered = txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (preset === 'day')   return d.toDateString() === now.toDateString();
      if (preset === 'week') {
        const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
        const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
        return d >= start && d <= end;
      }
      if (preset === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === 'year')  return d.getFullYear() === now.getFullYear();
      if (rangeMode === 'custom' && appliedRange) {
        return d >= new Date(appliedRange.from) && d <= new Date(appliedRange.to);
      }
      return true;
    });
 
    if (rangeMode === 'custom' && appliedRange) {
      const from     = new Date(appliedRange.from);
      const to       = new Date(appliedRange.to);
      const diffDays = Math.ceil((to - from) / (1000*60*60*24)) + 1;
      const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
      const labels   = Array.from({ length: numWeeks }, (_, i) => `Week ${i + 1}`);
      const values   = Array(numWeeks).fill(0);
      filtered.forEach(tx => {
        const d       = new Date(tx.created_at);
        const weekIdx = Math.min(Math.floor((d - from) / (7*24*60*60*1000)), numWeeks - 1);
        values[weekIdx] += tx.total || 0;
      });
      return { labels, values };
    }
 
    let grouped = {};
    filtered.forEach(tx => {
      const d = new Date(tx.created_at);
      let label;
      if (preset === 'day')   label = `${d.getHours()}:00`;
      if (preset === 'week')  label = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (preset === 'month') label = `Day ${d.getDate()}`;
      if (preset === 'year')  label = d.toLocaleDateString('en-US', { month: 'short' });
      grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
    });
 
    const labels = Object.keys(grouped);
    const values = labels.map(l => grouped[l]);
    return { labels, values };
  }, [myTransactions, preset, rangeMode, appliedRange, viewingArchive]);
 
  // ── chart derived values ──────────────────────────────────────────────────
  const values    = chartData.values;
  const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg       = useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
  const peak      = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
  const peakLabel = values.length ? chartData.labels[values.indexOf(peak)] : '—';
  const pctChange = values.length > 1 && values[0] > 0
    ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : '0.0';
  const trending  = Number(pctChange) >= 0;
 
  // ── SVG chart geometry ────────────────────────────────────────────────────
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
    if (!pts.length) return { linePath: '', areaPath: '' };
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return { linePath: d, areaPath: d + ` L ${pts[pts.length-1].x} ${PAD_T+plotH} L ${pts[0].x} ${PAD_T+plotH} Z` };
  }, [pts, PAD_T, plotH]);
 
  const yTicks = useMemo(() =>
    [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PAD_T + plotH - t * plotH, label: fmtShort(t * maxV) })),
    [maxV, PAD_T, plotH]
  );
 
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !pts.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * SVG_W;
    let best = pts[0], bestDist = Infinity;
    for (const p of pts) { const dist = Math.abs(p.x - mx); if (dist < bestDist) { bestDist = dist; best = p; } }
    setTooltip({ x: best.x, y: best.y, label: best.label, value: best.v });
  }, [pts]);
 
  // ── archive helpers ───────────────────────────────────────────────────────
  const getRangeLabel = () => {
    if (viewingArchive) return `Archive: ${viewingArchive.year}`;
    if (rangeMode === 'custom' && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
    return { day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' }[preset] || 'This Month';
  };
 
  const saveArchive = () => {
    const year = parseInt(archiveYearInput);
    if (isNaN(year) || year < 2000 || year > 2100) { alert('Enter a valid year (2000–2100)'); return; }
    if (archives.find(a => a.year === year))        { alert(`Year ${year} already archived.`); return; }
    const snapshot = {
      year, label: `Full Year ${year}`,
      savedAt:   new Date().toLocaleString(),
      chartData,
      kpis: { totalSales: kpiData?.totalSales || total, avgSales: avg, peakSales: peak },
    };
    const updated = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(updated);
    localStorage.setItem(`frArchives_${userBranch}`, JSON.stringify(updated));
    setArchiveConfirm(false);
    alert(`Year ${year} archived!`);
  };
 
  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const updated = archives.filter(a => a.year !== year);
    setArchives(updated);
    localStorage.setItem(`frArchives_${userBranch}`, JSON.stringify(updated));
    if (viewingArchive?.year === year) setViewingArchive(null);
  };
 
  const applyCustomRange = () => {
    if (!customFrom || !customTo)   { alert('Select both dates.'); return; }
    if (customFrom > customTo)      { alert('"From" cannot be after "To".'); return; }
    setAppliedRange({ from: customFrom, to: customTo });
    setViewingArchive(null);
  };
 
  // ── today's quick stats ───────────────────────────────────────────────────
  const todayStr     = today.toISOString().slice(0, 10);
  const todaySales   = myTransactions.filter(tx => (tx.created_at || '').startsWith(todayStr));
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total || 0), 0);
  const avgOrder     = todaySales.length ? todayRevenue / todaySales.length : 0;
 
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fr-db-kpi-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        .fr-db-ins-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .fr-db-bot-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:960px){ .fr-db-kpi-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:720px){ .fr-db-ins-grid,.fr-db-bot-grid{ grid-template-columns:1fr; } }
        .fr-db-kpi  { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; }
        .fr-db-kpi:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); }
        .fr-db-chart { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:22px; padding:22px 24px 16px; box-shadow:0 2px 20px rgba(0,140,60,0.07); margin-bottom:18px; }
        .fr-db-ins  { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:18px 20px; box-shadow:0 2px 12px rgba(0,140,60,0.06); }
        .fr-db-tab-group { display:flex; gap:3px; background:#f0faf4; border-radius:12px; padding:4px; }
        .fr-db-tab { padding:6px 14px; border-radius:9px; border:none; background:transparent; font-size:12px; font-weight:600; color:#5a7a65; cursor:pointer; transition:all .15s; font-family:inherit; }
        .fr-db-tab.active { background:linear-gradient(135deg,#00c853,#00897b); color:#fff; box-shadow:0 2px 8px rgba(0,180,90,.35); }
        .fr-db-tab:hover:not(.active) { color:#0d2b1e; background:#ddf5e6; }
        .fr-db-date { padding:7px 11px; border-radius:9px; border:1.5px solid #b2dfdb; background:#f0fdf5; font-size:12px; font-family:inherit; color:#0d2b1e; outline:none; }
        .fr-db-date:focus { border-color:#00897b; }
        .fr-db-apply { padding:7px 16px; border-radius:9px; border:none; background:linear-gradient(135deg,#00c853,#00897b); color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
        .fr-db-tooltip { position:absolute; background:linear-gradient(135deg,#0d2b1e,#1a4a2e); color:#fff; border-radius:12px; padding:9px 14px; pointer-events:none; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.22); transform:translate(-50%,-100%) translateY(-12px); z-index:10; }
        .fr-db-tooltip::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#1a4a2e; border-bottom:none; }
        .fr-db-arc-panel { background:#fff; border:1px solid rgba(0,168,76,0.15); border-radius:18px; padding:22px 24px; box-shadow:0 2px 16px rgba(0,140,60,0.08); margin-bottom:18px; }
        .fr-db-arc-row   { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:10px; border:1px solid #e0f2f1; margin-bottom:8px; background:#f8fffe; }
        .fr-db-arc-row:hover { background:#e8fdf0; }
        .fr-db-arc-btn   { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; border:1px solid; }
        .fr-db-view-banner { background:linear-gradient(135deg,#0d2b1e,#1a4a2e); color:#fff; border-radius:14px; padding:12px 20px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
      `}</style>
 
      {/* ── Welcome header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00897b', marginBottom: 4, fontFamily: 'Montserrat,sans-serif' }}>Welcome back</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0d2b1e', margin: 0, fontFamily: 'Montserrat,sans-serif' }}>{user?.name}</h1>
        <div style={{ fontSize: 13, color: '#5a7a65', marginTop: 4 }}>Branch: <strong style={{ color: '#0d2b1e' }}>{userBranch || '—'}</strong></div>
      </div>
 
      {/* ── Archive viewing banner ── */}
      {viewingArchive && (
        <div className="fr-db-view-banner">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <Archive size={16} /> Viewing Archive: {viewingArchive.year}
            <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>— saved {viewingArchive.savedAt}</span>
          </span>
          <button onClick={() => setViewingArchive(null)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={12} /> Exit Archive View
          </button>
        </div>
      )}
 
      {/* ── KPI cards (today quick stats + server KPIs) ── */}
      <div className="fr-db-kpi-grid">
        {[
          { label: "Today's Revenue",  value: fmtPeso(todayRevenue),  sub: `${todaySales.length} transactions today`,      icon: <DollarSign size={18} />, color: '#00897b', bg: 'rgba(0,200,83,0.08)' },
          { label: 'Monthly Revenue',  value: kpiLoading ? '…' : fmtPeso(kpiData?.salesRevenue ?? 0), sub: getRangeLabel(), icon: <BarChart size={18} />,    color: '#00897b', bg: 'rgba(0,200,83,0.08)' },
          { label: 'Monthly Profit',   value: kpiLoading ? '…' : fmtPeso(kpiData?.salesProfit ?? 0),  sub: 'After cost of sales',                             icon: <TrendingUp size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Avg Order Value',  value: fmtPeso(isNaN(avgOrder) ? 0 : avgOrder),                sub: 'Today per transaction',                           icon: <ShoppingCart size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map((k, i) => (
          <div key={i} className="fr-db-kpi">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 5, fontFamily: 'Montserrat,sans-serif' }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{k.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, flexShrink: 0 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{k.sub}</div>
          </div>
        ))}
      </div>
 
      {/* ── Date range toolbar ── */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 16, padding: '12px 18px', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,140,60,0.05)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="fr-db-tab-group">
          <button className={`fr-db-tab${rangeMode === 'preset' ? ' active' : ''}`} onClick={() => { setRangeMode('preset'); setViewingArchive(null); }}>Preset</button>
          <button className={`fr-db-tab${rangeMode === 'custom' ? ' active' : ''}`} onClick={() => { setRangeMode('custom'); setViewingArchive(null); }}>Custom Range</button>
        </div>
 
        {rangeMode === 'preset' ? (
          <div className="fr-db-tab-group">
            {['day', 'week', 'month', 'year'].map(p => (
              <button key={p} className={`fr-db-tab${preset === p ? ' active' : ''}`} onClick={() => { setPreset(p); setViewingArchive(null); }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={13} color="#5a7a65" />
            <input type="date" className="fr-db-date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo} />
            <span style={{ color: '#5a7a65', fontSize: 12, fontWeight: 600 }}>to</span>
            <input type="date" className="fr-db-date" value={customTo}   onChange={e => setCustomTo(e.target.value)}   min={customFrom} max={fmt8(today)} />
            <button className="fr-db-apply" onClick={applyCustomRange}>Apply</button>
          </div>
        )}
 
        {kpiLoading && (
          <span style={{ fontSize: 11, color: '#5a7a65', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
          </span>
        )}
 
        <button onClick={() => setShowArchivePanel(v => !v)}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 10, border: '1.5px solid #b2dfdb', background: showArchivePanel ? '#e0f2f1' : '#fff', color: '#00695c', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Archive size={13} /> Archives
          {archives.length > 0 && (
            <span style={{ background: '#00897b', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>{archives.length}</span>
          )}
        </button>
      </div>
 
      {/* ── Archive panel ── */}
      {showArchivePanel && (
        <div className="fr-db-arc-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#0d2b1e', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Archive size={16} color="#00897b" /> Yearly Archives — {userBranch}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!archiveConfirm ? (
                <>
                  <input type="number" className="fr-db-date" style={{ width: 90 }} value={archiveYearInput} onChange={e => setArchiveYearInput(e.target.value)} min="2000" max="2100" placeholder="Year" />
                  <button onClick={() => setArchiveConfirm(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Plus size={13} /> Archive Year
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: 10, padding: '7px 14px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Archive {archiveYearInput}?</span>
                  <button className="fr-db-arc-btn" style={{ borderColor: '#00897b', background: '#e0f2f1', color: '#00695c' }} onClick={saveArchive}>Confirm</button>
                  <button className="fr-db-arc-btn" style={{ borderColor: '#d1d5db', background: '#f9fafb', color: '#6b7280' }} onClick={() => setArchiveConfirm(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
 
          {archives.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No archives yet. Snapshot a full year of data above.</div>
          ) : archives.map(a => (
            <div key={a.year} className="fr-db-arc-row">
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0d2b1e' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: '#5a7a65', marginTop: 2 }}>Saved: {a.savedAt} · Total: {fmtPeso(a.kpis.totalSales)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="fr-db-arc-btn"
                  style={{ borderColor: viewingArchive?.year === a.year ? '#00897b' : '#b2dfdb', background: viewingArchive?.year === a.year ? '#e0f2f1' : '#f8fffe', color: '#00695c' }}
                  onClick={() => { setViewingArchive(viewingArchive?.year === a.year ? null : a); setShowArchivePanel(false); }}>
                  {viewingArchive?.year === a.year ? 'Viewing' : 'View'}
                </button>
                <button className="fr-db-arc-btn" style={{ borderColor: '#fecaca', background: '#fff', color: '#ef4444' }} onClick={() => deleteArchive(a.year)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* ── Revenue chart ── */}
      <div className="fr-db-chart">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 15, color: '#0d2b1e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart size={16} color="#00897b" /> Revenue Overview
            <span style={{ fontSize: 11, fontWeight: 600, color: '#5a7a65', background: '#f0fdf5', padding: '3px 10px', borderRadius: 8, border: '1px solid #d1eedd' }}>{getRangeLabel()}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00695c', background: '#e0f2f1', padding: '3px 10px', borderRadius: 8, border: '1px solid #b2dfdb', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Store size={10} /> {userBranch}
            </span>
          </div>
          {kpiData && (
            <div style={{ fontSize: 12, color: '#00897b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={11} color="#10B981" /> Live: {fmtPeso(kpiData.totalSales)} · {kpiData.txCount} txns
            </div>
          )}
        </div>
 
        {values.length === 0 || (total === 0 && !kpiLoading) ? (
          <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fffe', borderRadius: 12, border: '1px dashed #b2dfdb', color: '#5a7a65' }}>
            <BarChart2 size={32} color="#b2dfdb" />
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 10 }}>No sales data for this period</div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#94a3b8' }}>Try a different date range</div>
          </div>
        ) : (
          <div style={{ position: 'relative', cursor: 'crosshair', userSelect: 'none' }} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
            <svg ref={svgRef} style={{ width: '100%', display: 'block', overflow: 'visible' }} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="frLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e9cd30" /><stop offset="100%" stopColor="#ffa875" />
                </linearGradient>
                <linearGradient id="frArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c853" stopOpacity="0.20" /><stop offset="100%" stopColor="#00c853" stopOpacity="0.01" />
                </linearGradient>
                <filter id="frGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {yTicks.map((t, i) => (
                <g key={i}>
                  <line x1={PAD_L} y1={t.y} x2={SVG_W - PAD_R} y2={t.y} stroke="#e2ede6" strokeWidth="1" strokeDasharray="5 4" />
                  <text x={PAD_L - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily="Poppins,sans-serif">{t.label}</text>
                </g>
              ))}
              <path d={areaPath} fill="url(#frArea)" />
              <path d={linePath} fill="none" stroke="url(#frLine)" strokeWidth="3" strokeLinecap="round" filter="url(#frGlow)" />
              {pts.map((p, i) => (
                <text key={i} x={p.x} y={SVG_H - 6} textAnchor="middle" fontSize="10.5" fill="#6b9070" fontFamily="Poppins,sans-serif">{p.label}</text>
              ))}
              {tooltip && (
                <>
                  <line x1={tooltip.x} y1={tooltip.y + 7} x2={tooltip.x} y2={PAD_T + plotH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
                  <circle cx={tooltip.x} cy={tooltip.y} r="6" fill="#00c853" stroke="#fff" strokeWidth="2.5" filter="url(#frGlow)" />
                </>
              )}
            </svg>
            {tooltip && (
              <div className="fr-db-tooltip" style={{ left: `${(tooltip.x / SVG_W) * 100}%`, top: `${(tooltip.y / SVG_H) * 100}%` }}>
                <div style={{ fontSize: 10.5, opacity: 0.6, marginBottom: 2 }}>{tooltip.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#a7f3d0' }}>{fmtPeso(tooltip.value)}</div>
              </div>
            )}
          </div>
        )}
      </div>
 
      {/* ── Insight cards ── */}
      <div className="fr-db-ins-grid">
        <div className="fr-db-ins">
          <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 13, marginBottom: 6 }}>Peak Performance</div>
          <p style={{ fontSize: 12, color: '#5a7a65', lineHeight: 1.65 }}>
            {total > 0
              ? <>{kpiData ? <>Transactions: <strong>{kpiData.txCount}</strong> · </> : ''}Highest revenue on <strong>{peakLabel}</strong>. Outperformed avg by <strong>{fmtPeso(peak - avg)}</strong>.</>
              : 'No data available for this range.'}
          </p>
          <div style={{ marginTop: 10, fontSize: 19, fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{total > 0 ? fmtPeso(peak) : '—'}</div>
        </div>
        <div className="fr-db-ins">
          <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 13, marginBottom: 6 }}>Trend Direction</div>
          <p style={{ fontSize: 12, color: '#5a7a65', lineHeight: 1.65 }}>
            {total > 0
              ? <>Sales are <strong>{trending ? 'trending upward ↑' : 'trending downward ↓'}</strong> with a <strong>{Math.abs(pctChange)}% change</strong> from start to end.</>
              : 'No transactions to analyze.'}
          </p>
          <div style={{ marginTop: 10, fontSize: 19, fontWeight: 800, color: trending ? '#00897b' : '#d97706', fontFamily: 'Montserrat,sans-serif' }}>
            {total > 0 ? `${trending ? '+' : '-'}${Math.abs(pctChange)}%` : '—'}
          </div>
        </div>
        <div className="fr-db-ins">
          <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 13, marginBottom: 6 }}>Revenue Summary</div>
          <p style={{ fontSize: 12, color: '#5a7a65', lineHeight: 1.65 }}>
            {kpiData
              ? <>Transactions: <strong>{kpiData.txCount}</strong> · Avg order: <strong>{fmtPeso(kpiData.avgOrder)}</strong><br />Total: <strong>{fmtPeso(kpiData.totalSales)}</strong> · Branch: <strong>{userBranch}</strong></>
              : total > 0
                ? <>Average: <strong>{fmtPeso(avg)}</strong> · Total: <strong>{fmtPeso(total)}</strong> · Branch: <strong>{userBranch}</strong></>
                : <>No sales for <strong>{userBranch}</strong> in this period.</>}
          </p>
          <div style={{ marginTop: 10, fontSize: 19, fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{total > 0 ? fmtPeso(kpiData?.totalSales ?? avg) : '—'}</div>
        </div>
      </div>
 
      {/* ── Bottom KPI breakdown ── */}
      <div className="fr-db-bot-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Sales Revenue', key: 'salesRevenue', desc: 'Total income from POS sales.',          icon: '💰' },
          { label: 'Sales Profit',  key: 'salesProfit',  desc: 'Revenue minus cost of goods.',          icon: '📈' },
          { label: 'Cost of Sales', key: 'cogs',         desc: 'Total cost of goods sold.',             icon: '🧾' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: kpiData?.[k.key] != null ? '1.5px solid #b2dfdb' : '1.5px dashed #a7f3d0', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>{k.label}</span>
            </div>
            <p style={{ fontSize: 11.5, color: '#5a7a65', lineHeight: 1.6, marginBottom: 12 }}>{k.desc}</p>
            {kpiLoading
              ? <div style={{ background: '#f0fdf5', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Loading…</div>
              : kpiData?.[k.key] != null
                ? <div style={{ background: '#e0f2f1', borderRadius: 10, padding: '8px 12px', fontSize: 16, fontWeight: 800, color: '#00695c', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(kpiData[k.key])}</div>
                : <div style={{ background: '#f0fdf5', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={11} color="#b2dfdb" /> Awaiting POS / Inventory data
                  </div>}
          </div>
        ))}
      </div>
 
      {/* ── Recent transactions table ── */}
      <div className="v-card">
        <div style={{ background: 'var(--grad-dark)', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', fontFamily: 'Montserrat,sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={14} color="#fff" /> Recent Transactions — {userBranch}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{myTransactions.length} total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="v-table">
            <thead>
              <tr>{['#', 'Date', 'Cashier', 'Items', 'Total', 'Payment'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {myTransactions.slice(0, 10).map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 12 }}>#{tx.id}</td>
                  <td style={{ color: '#5a7a65', fontSize: 12 }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                  <td style={{ color: '#5a7a65' }}>{(tx.items || []).length} item(s)</td>
                  <td style={{ fontWeight: 800, color: '#00897b', fontFamily: 'Montserrat,sans-serif' }}>{fmtPeso(tx.total)}</td>
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

function FrReportsContent({ user, transactions = [] }) {
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

  const [kpiStats, setKpiStats] = useState({ salesRevenue: 0, cogs: 0, salesProfit: 0, txCount: 0 });
  const [kpiLoading, setKpiLoading] = useState(false);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [deletedReports, setDeletedReports] = useState([]);
  const [retrieving, setRetrieving] = useState(null);
  const [viewSubmittedId, setViewSubmittedId] = useState(null);

  const fmtReportId = id => `REP-${String(id).padStart(5, '0')}`;

  // ── Load saved/generated reports ────────────────────────────────
  useEffect(() => {
    const fetchSavedReports = async () => {
      try {
        const [savedRes, liveRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/generated-reports`),
          fetch(`${process.env.REACT_APP_API_URL}/reports?branch=${branch}`),
        ]);

        const savedData = await savedRes.json();
        const liveData = await liveRes.json();

        const liveStatusMap = {};
        liveData.forEach(r => { liveStatusMap[r.id] = r.status; });

        const loaded = savedData.map(item => {
          const snapshot = typeof item.snapshot === 'string'
            ? JSON.parse(item.snapshot)
            : item.snapshot;
          return {
            id: item.reportId,
            localId: `saved-${item.id}`,
            generatedDate: item.savedAt
              ? new Date(item.savedAt).toLocaleString('en-PH')
              : snapshot.submittedAt
                ? new Date(snapshot.submittedAt).toLocaleString('en-PH')
                : '—',
            period: snapshot.period || '—',
            content: snapshot.content || '',
            saved: true,
            status: liveStatusMap[item.reportId] ?? snapshot.status,
          };
        }).filter(r => r.status !== 'submitted' && r.status !== 'deleted');

        setReports(loaded);
      } catch (err) {
        console.error('Failed to load saved reports:', err);
      }
    };

    if (branch) fetchSavedReports();
  }, [branch]);

  // ── Load submitted reports history ──────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/history?branch=${branch}`);
        const data = await res.json();

        setSubmittedReports(data.map(h => ({
          id: h.id,
          content: h.content || '',
          generatedDate: h.generatedDate
            ? new Date(h.generatedDate).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—',
          period: h.period,
          submittedAt: new Date(h.submittedAt).toLocaleString('en-PH'),
          expiresAt: h.expiresAt,
          comments: h.comments || [],
          remark: h.remark || '',
          status: h.status,
        })));
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    if (branch) fetchHistory();
  }, [branch]);

  // ── Load deleted reports ─────────────────────────────────────────
  useEffect(() => {
    const fetchDeletedReports = async () => {
      if (!branch) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/deleted?branch=${branch}`);
        const data = await res.json();
        setDeletedReports(data.map(r => ({
          id: r.id,
          localId: `deleted-${r.id}`,
          period: r.period,
          generatedDate: r.generatedDate
            ? new Date(r.generatedDate).toLocaleString('en-PH')
            : '—',
          deletedAt: r.deletedAt
            ? new Date(r.deletedAt).toLocaleString('en-PH')
            : '—',
          expiresAt: r.expiresAt,
          content: r.content,
        })));
      } catch (err) {
        console.error('Failed to load deleted reports:', err);
      }
    };
    fetchDeletedReports();
  }, [branch]);

  // ── KPI stats ────────────────────────────────────────────────────
  const fetchKpiStats = async (from, to) => {
    if (!from || !to || !branch) return;
    setKpiLoading(true);
    try {
      const params = new URLSearchParams({ from, to, branch });
      const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
      const data = await res.json();
      setKpiStats(data);
    } catch (err) {
      console.error('Failed to fetch KPI stats:', err);
    }
    setKpiLoading(false);
  };

  useEffect(() => {
    fetchKpiStats(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  // ── Generate report ──────────────────────────────────────────────
  const generateReport = async () => {
    if (!dateFrom || !dateTo) { alert('Please select a date range first.'); return; }
    setGenerating(true);
    setAiReport('');
    try {
      const from = new Date(dateFrom);
      const to   = new Date(dateTo + 'T23:59:59');

      const filtered = (transactions || []).filter(tx => {
        const d = new Date(tx.created_at);
        return (tx.branch || '').trim().toLowerCase() === branch.toLowerCase()
          && d >= from && d <= to;
      });

      const totalRevenue  = filtered.reduce((s, tx) => s + Number(tx.total || 0), 0);
      const totalTx       = filtered.length;
      const avgOrder      = totalTx ? (totalRevenue / totalTx) : 0;
      const totalCost     = filtered.reduce((s, tx) => s + Number(tx.cogs || 0), 0);
      const totalProfit   = totalRevenue - totalCost;

      const paymentBreakdown = filtered.reduce((acc, tx) => {
        const m = tx.payment_method || 'Unknown';
        acc[m] = (acc[m] || 0) + Number(tx.total || 0);
        return acc;
      }, {});

      const itemMap = {};
      filtered.forEach(tx => {
        (tx.items || []).forEach(item => {
          if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 };
          itemMap[item.name].qty     += item.qty || 1;
          itemMap[item.name].revenue += item.subtotal || 0;
        });
      });
      const topItems = Object.entries(itemMap)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([name, d]) => `${name} (qty: ${d.qty}, revenue: ₱${d.revenue.toFixed(2)})`)
        .join(', ');

      const dailyMap = {};
      filtered.forEach(tx => {
        const day = tx.created_at?.slice(0, 10);
        if (day) dailyMap[day] = (dailyMap[day] || 0) + Number(tx.total || 0);
      });
      const peakDay   = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
      const lowestDay = Object.entries(dailyMap).sort((a, b) => a[1] - b[1])[0];

      const fmtP = n => 'PHP ' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

      const prompt = `
      CRITICAL FORMATTING RULE: Use only standard ASCII characters. 
      - Write currency as "PHP" followed by the amount (e.g. PHP 2,406.20) — never use the peso sign symbol.
      - Use "to" instead of arrows (e.g. "2026-04-30 to 2026-05-03").
      - Use only straight apostrophes and quotes. No smart/curly quotes.
      - No special unicode symbols of any kind.

      You are a senior business analyst preparing an official franchise performance report for executive review. Generate a comprehensive, formally structured sales report using ONLY the data provided below. Do not fabricate or estimate any figures not listed.

      REPORT METADATA
      ---------------
      Branch:   ${branch}
      Period:   ${dateFrom} to ${dateTo}
      Prepared: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}

      VERIFIED DATA INPUTS
      --------------------
      Total Transactions  : ${totalTx}
      Total Revenue       : ${fmtP(totalRevenue)}
      Average Order Value : ${fmtP(avgOrder)}
      Cost of Sales       : ${totalCost > 0 ? fmtP(totalCost) : 'Not provided'}
      Gross Profit        : ${totalCost > 0 ? fmtP(totalProfit) : 'Not provided'}
      Peak Sales Day      : ${peakDay ? `${peakDay[0]} — ${fmtP(peakDay[1])}` : 'N/A'}
      Lowest Sales Day    : ${lowestDay ? `${lowestDay[0]} — ${fmtP(lowestDay[1])}` : 'N/A'}
      Top-Selling Items   : ${topItems || 'No item-level data available'}
      Payment Breakdown   : ${Object.entries(paymentBreakdown).map(([k, v]) => `${k}: ${fmtP(v)}`).join(' | ') || 'N/A'}

      FORMAT REQUIREMENTS
      -------------------
      Use the exact structure below. Maintain formal business language throughout. Use proper headers, aligned spacing, and numbered sections. Do not use markdown symbols like ** or ##. Write in plain text suitable for a PDF document.

      ═══════════════════════════════════════════════════════════════
              FRANCHISE SALES & PERFORMANCE REPORT
              Branch: ${branch}
              Period: ${dateFrom} to ${dateTo}
              Date Prepared: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
      ═══════════════════════════════════════════════════════════════

      I. EXECUTIVE SUMMARY
      ────────────────────
      [2–3 paragraph formal overview of overall performance. Mention total revenue, transaction volume, and general assessment. Use complete professional sentences. Do NOT use bullet points here.]

      II. SALES PERFORMANCE OVERVIEW
      ───────────────────────────────
      [Discuss transaction volume, average order value, peak and lowest sales days. Analyze trends and what they indicate about customer behavior. Formal paragraph format.]

      III. REVENUE & PROFITABILITY ANALYSIS
      ──────────────────────────────────────
      [Present revenue figures formally. If cost data is available, analyze gross profit margin. If not, note the limitation professionally. Include observations about revenue distribution across the period.]

      IV. TOP-SELLING PRODUCTS
      ─────────────────────────
      [Discuss the top items by revenue and quantity. Identify patterns, bestsellers, and any notable gaps. Use formal analytical language.]

      V. PAYMENT METHOD ANALYSIS
      ───────────────────────────
      [Break down revenue by payment method. Note the dominant method, compare proportions, and recommend any adjustments to payment infrastructure or promotions.]

      VI. STRATEGIC RECOMMENDATIONS
      ──────────────────────────────
      [Provide 4–6 numbered, specific, actionable recommendations based strictly on the data above. Each recommendation should cite the data point that supports it. Written in formal directive language.]

      VII. CONCLUSION
      ───────────────
      [One formal closing paragraph summarizing key takeaways and affirming the branch's performance outlook.]

      ═══════════════════════════════════════════════════════════════
        This report was automatically generated based on verified
        transaction data for the stated period. Figures are accurate
        as of the report generation date.
      ═══════════════════════════════════════════════════════════════
      `.trim();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      });

      const data = await res.json();
      const reportText = data.content?.[0]?.text || 'Failed to generate report.';

      const sanitizeReport = text => text
        .replace(/₱/g, 'PHP ')
        .replace(/±/g, 'PHP ')
        .replace(/→/g, 'to')
        .replace(/!'/g, 'to')
        .replace(/[^\x00-\x7F]/g, c => {
          const map = {
            '\u2019': "'", '\u2018': "'",
            '\u201C': '"', '\u201D': '"',
            '\u2013': '-', '\u2014': '--',
            '\u2026': '...',
            '\u00b1': '+/-',
            '\u00b2': '2', '\u00b3': '3',
          };
          return map[c] || '';
        });

      const cleanReportText = sanitizeReport(reportText);
      setAiReport(cleanReportText);

      const submitRes = await fetch(`${process.env.REACT_APP_API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: user?.brand || '',
          branch,
          period: `${dateFrom} → ${dateTo}`,
          submittedBy: user?.name || user?.email || 'Branch Manager',
          role: user?.role || 'Branch Manager',
          content: reportText,
        }),
      });
      const submitData = await submitRes.json();
      const realId = submitData.report?.id;

      const newReport = {
        id: realId,
        localId: `new-${Date.now()}`,
        generatedDate: new Date().toLocaleString('en-PH'),
        period: `${dateFrom} → ${dateTo}`,
        content: reportText,
      };

      setReports(prev => {
        const exists = prev.some(r => r.id === realId);
        if (exists) return prev.map(r => r.id === realId ? { ...r, ...newReport } : r);
        return [newReport, ...prev];
      });
    } catch {
      setAiReport('Failed to generate report. Please try again.');
    }
    setGenerating(false);
  };

  // ── Delete report (soft delete) ──────────────────────────────────
  const deleteReport = async report => {
    if (!window.confirm(`Delete report for ${report.period}? It will be recoverable for 30 days.`)) return;

    if (!report.id) {
      setDeletedReports(prev => [{
        ...report,
        deletedAt: new Date().toLocaleString('en-PH'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, ...prev]);
      setReports(prev => prev.filter(r => r.localId !== report.localId));
      if (viewReportId === report.id) setViewReportId(null);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/soft-delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();

      setDeletedReports(prev => [{
        ...report,
        deletedAt: new Date().toLocaleString('en-PH'),
        expiresAt: data.expiresAt,
      }, ...prev]);
      setReports(prev => prev.filter(r => r.id !== report.id));
      if (viewReportId === report.id) setViewReportId(null);
    } catch {
      alert('Failed to delete report. Please try again.');
    }
  };

  // ── Retrieve deleted report ──────────────────────────────────────
  const retrieveReport = async report => {
    if (!report.id) {
      setReports(prev => [{ ...report, deletedAt: undefined, expiresAt: undefined }, ...prev]);
      setDeletedReports(prev => prev.filter(r => r.localId !== report.localId));
      return;
    }

    setRetrieving(report.id);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/retrieve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Retrieve failed');
      const data = await res.json();

      setReports(prev => [{
        id: data.report.id,
        localId: `retrieved-${Date.now()}`,
        generatedDate: data.report.generatedDate
          ? new Date(data.report.generatedDate).toLocaleString('en-PH')
          : new Date().toLocaleString('en-PH'),
        period: data.report.period,
        content: data.report.content,
        saved: false,
      }, ...prev]);
      setDeletedReports(prev => prev.filter(r => r.id !== report.id));
    } catch {
      alert('Failed to retrieve report. Please try again.');
    }
    setRetrieving(null);
  };

  // ── Download PDF ─────────────────────────────────────────────────
  const downloadReport = report => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => { doc.addPage(); y = margin; };
    const checkY = (needed = 8) => { if (y + needed > pageH - margin) addPage(); };

    const writeLine = (text, fontSize = 10, style = 'normal', color = [30, 30, 30], indent = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach(line => {
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
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('SALES & PERFORMANCE REPORT', pageW / 2, 14, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 220, 190);
    const safePeriod = report.period.replace(/→/g, 'to').replace(/!'/g, 'to').replace(/[^\x00-\x7F]/g, '');
    doc.text(`REP-${String(report.id).padStart(5, '0')}   |   Branch: ${branch}   |   Period: ${safePeriod}`, pageW / 2, 22, { align: 'center' });
    doc.text(`Generated: ${report.generatedDate}`, pageW / 2, 28, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(120, 180, 150);
    doc.text('CONFIDENTIAL — FOR INTERNAL USE ONLY', pageW / 2, 33.5, { align: 'center' });

    y = 46;

    const cleanContent = report.content
      .replace(/₱/g, 'PHP ').replace(/±/g, 'PHP ').replace(/→/g, 'to').replace(/!'/g, 'to')
      .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, '-').replace(/\u2014/g, '--').replace(/\u2026/g, '...')
      .replace(/[═─━]+/g, '')
      .replace(/^.*FRANCHISE SALES.*$/gm, '')
      .replace(/^.*Branch:.*Period:.*$/gm, '')
      .replace(/^.*Date Prepared:.*$/gm, '')
      .replace(/^.*This report was automatically.*$/gm, '')
      .replace(/^.*transaction data for.*$/gm, '')
      .replace(/^.*report generation date.*$/gm, '')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    cleanContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) { y += 3; return; }

      if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
        checkY(14); y += 4;
        doc.setFillColor(0, 137, 123);
        doc.rect(margin, y - 4, 3, 9, 'F');
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 43, 30);
        doc.text(trimmed, margin + 6, y + 2);
        y += 8;
        writeDivider([0, 137, 123]);
      } else if (/^\d+\.\s+/.test(trimmed)) {
        checkY(8);
        const [num, ...rest] = trimmed.split(/(?<=^\d+\.)\s+/);
        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 137, 123);
        doc.text(num.replace('.', ''), margin + 2, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
        const wrapped = doc.splitTextToSize(rest.join(' '), contentW - 10);
        wrapped.forEach((wl, i) => { if (i > 0) checkY(6); doc.text(wl, margin + 9, y); y += 5.5; });
      } else {
        writeLine(trimmed, 9.5, 'normal', [50, 50, 50]); y += 1;
      }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 247, 245);
      doc.rect(0, pageH - 12, pageW, 12, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 140, 130);
      const sp = report.period.replace(/→/g, 'to').replace(/!'/g, 'to').replace(/[^\x00-\x7F]/g, '');
      doc.text(`${branch} Branch  |  ${sp}`, margin, pageH - 5);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
    }

    doc.save(`report_${branch.replace(/\s+/g, '_')}_${report.period.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  // ── Save report ──────────────────────────────────────────────────
  const saveReport = async report => {
    if (!report.id) { alert('No report ID found. Try regenerating.'); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const responseData = await res.json();
      if (res.status === 409) { alert('Report already saved.'); return; }
      if (!res.ok) throw new Error(responseData.error || 'Unknown error');
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, saved: true } : r));
      alert('Report saved successfully!');
    } catch {
      alert('Failed to save report.');
    }
  };

  // ── Submit report to admin ───────────────────────────────────────
  const submitReport = async report => {
    setSubmitting(report.id);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          reportNumber: fmtReportId(report.id),
          branch,
          period: report.period,
          generatedDate: report.generatedDate,
          content: report.content,
          submittedBy: user?.name || user?.email || 'Branch Manager',
          brand: user?.brand || '',
        }),
      });

      if (!res.ok) throw new Error('Submit failed');
      const data = await res.json();

      setSubmittedReports(prev => [{
        id: report.id,
        localId: report.localId,
        generatedDate: report.generatedDate
          ? new Date(report.generatedDate).toLocaleString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : '—',
        period: report.period,
        content: report.content,
        submittedAt: new Date().toLocaleString('en-PH'),
        expiresAt: data.expiresAt,
      }, ...prev]);

      setReports(prev => prev.filter(r => r.id !== report.id));
    } catch {
      alert('Failed to submit report. Please try again.');
    }
    setSubmitting(null);
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* KPI Stats */}
      <div className="v-stat-grid">
        <VKpi
          label="Cost of Sales"
          value={kpiLoading ? '...' : `₱${Number(kpiStats.cogs).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          icon={<TrendingDown size={20} />}
          color="orange"
          sub={`${dateFrom} to ${dateTo}`}
        />
        <VKpi
          label="Sales Revenue"
          value={kpiLoading ? '...' : `₱${Number(kpiStats.salesRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} />}
          color="green"
          sub={`${kpiStats.txCount} transactions`}
        />
        <VKpi
          label="Gross Profit"
          value={kpiLoading ? '...' : `₱${Number(kpiStats.salesProfit).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} />}
          color="blue"
          sub="Revenue minus Cost of Sales"
        />
        <VKpi
          label="Reports Generated"
          value={reports.length + history.length}
          sub="This session"
          icon={<FileText size={20} />}
          color="purple"
        />
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
            { label: 'This Week',    from: fmt8(new Date(today.getTime() - 7*24*60*60*1000)), to: fmt8(today) },
            { label: 'This Month',   from: fmt8(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmt8(today) },
            { label: 'Last Month',   from: fmt8(new Date(today.getFullYear(), today.getMonth()-1, 1)), to: fmt8(new Date(today.getFullYear(), today.getMonth(), 0)) },
            { label: 'This Quarter', from: fmt8(new Date(today.getFullYear(), Math.floor(today.getMonth()/3)*3, 1)), to: fmt8(today) },
            { label: 'This Year',    from: fmt8(new Date(today.getFullYear(), 0, 1)), to: fmt8(today) },
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
                <tr><th>Report #</th><th>Generated</th><th>Period</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <React.Fragment key={r.localId}>
                    <tr>
                      <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                        {r.id ? fmtReportId(r.id) : '—'}
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 400, color: '#5a7a65', fontFamily: 'Poppins,sans-serif' }}>
                        {r.generatedDate}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="v-badge v-badge-blue">{r.period}</span>
                          {r.saved && <span className="v-badge v-badge-green"><Archive size={10} /> Saved</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="v-btn v-btn-ghost v-btn-sm" onClick={() => setViewReportId(viewReportId === r.id ? null : r.id)}>
                            <Eye size={12} /> {viewReportId === r.id ? 'Hide' : 'View'}
                          </button>
                          <button
                            className="v-btn v-btn-sm v-btn-blue"
                            onClick={() => saveReport(r)}
                            disabled={r.saved}
                            style={{ opacity: r.saved ? 0.6 : 1 }}
                          >
                            <Save size={12} /> {r.saved ? 'Saved' : 'Save'}
                          </button>
                          <button
                            className="v-btn v-btn-primary v-btn-sm"
                            onClick={() => submitReport(r)}
                            disabled={submitting === r.id || !r.saved}
                            style={{ opacity: (submitting === r.id || !r.saved) ? 0.5 : 1 }}
                            title={!r.saved ? 'Save the report first before submitting' : ''}
                          >
                            {submitting === r.id
                              ? <><div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Sending…</>
                              : <><Send size={12} /> Submit to Admin</>}
                          </button>
                          <button
                            className="v-btn v-btn-sm"
                            onClick={() => deleteReport(r)}
                            style={{ background: '#fff0f0', color: '#dc2626', border: '1px solid #fecaca' }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {viewReportId === r.id && (
                      <tr>
                        <td colSpan={4} style={{ padding: 0, border: 'none' }}>
                          <div style={{ margin: '8px 0 12px', background: 'linear-gradient(135deg,rgba(0,168,76,0.04),rgba(0,137,123,0.03))', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>
                                {r.id ? fmtReportId(r.id) : '—'} — {r.period}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="v-btn v-btn-sm v-btn-blue" onClick={() => downloadReport(r)}>
                                  <Download size={12} /> Download PDF
                                </button>
                                <button className="v-btn v-btn-secondary v-btn-sm" onClick={() => setViewReportId(null)}>
                                  <X size={12} /> Close
                                </button>
                              </div>
                            </div>
                            <pre style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12.5, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{r.content}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submitted Reports */}
      <div className="v-card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Send size={16} />}>Submitted Reports</VSectionTitle>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>
            {submittedReports.length} submitted to admin
          </span>
        </div>
        {submittedReports.length === 0 ? (
          <VEmptyState icon="📤" title="No submitted reports yet" sub="Reports submitted to admin will appear here." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr>
                  <th>Report #</th>
                  <th>Submitted At</th>
                  <th>Period</th>
                  <th>Generated</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedReports.map(h => (
                  <React.Fragment key={h.id}>
                    <tr>
                      <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                        {fmtReportId(h.id)}
                      </td>
                      <td style={{ fontSize: 12, color: '#5a7a65', fontFamily: 'Poppins,sans-serif' }}>
                        {h.submittedAt}
                      </td>
                      <td>
                        <span className="v-badge v-badge-blue">{h.period}</span>
                      </td>
                      <td style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>
                        {h.generatedDate || '—'}
                      </td>
                      <td>
                        {h.status === 'approved' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: '#dcfce7', color: '#15803d',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                            Approved
                          </span>
                        ) : h.status === 'rejected' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: '#fee2e2', color: '#dc2626',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                            Rejected
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: '#dbeafe', color: '#1e40af',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                            Submitted
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#5a7a65', fontFamily: 'Poppins,sans-serif', maxWidth: 200 }}>
                        {h.remark ? (
                          <span title={h.remark} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {h.remark}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="v-btn v-btn-ghost v-btn-sm"
                          onClick={() => setViewSubmittedId(viewSubmittedId === h.id ? null : h.id)}
                        >
                          <Eye size={12} /> {viewSubmittedId === h.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {viewSubmittedId === h.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                          <div style={{ margin: '8px 0 12px', background: 'linear-gradient(135deg,rgba(0,168,76,0.04),rgba(0,137,123,0.03))', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>
                                {fmtReportId(h.id)} — {h.period}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="v-btn v-btn-sm v-btn-blue" onClick={() => downloadReport(h)}>
                                  <Download size={12} /> Download PDF
                                </button>
                                <button className="v-btn v-btn-secondary v-btn-sm" onClick={() => setViewSubmittedId(null)}>
                                  <X size={12} /> Close
                                </button>
                              </div>
                            </div>
                            {h.remark && (
                              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: h.status === 'rejected' ? '#fee2e2' : h.status === 'approved' ? '#dcfce7' : '#dbeafe', border: `1px solid ${h.status === 'rejected' ? '#fecaca' : h.status === 'approved' ? '#bbf7d0' : '#bfdbfe'}` }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: h.status === 'rejected' ? '#dc2626' : h.status === 'approved' ? '#15803d' : '#1e40af', fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                  Admin Remark:
                                </span>
                                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#374151', fontFamily: 'Poppins,sans-serif' }}>{h.remark}</p>
                              </div>
                            )}
                            {h.content ? (
                              <pre style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12.5, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                {h.content}
                              </pre>
                            ) : (
                              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
                                Report content not available.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report History (deleted / recoverable) */}
      <div className="v-card" style={{ padding: '20px 22px' }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Archive size={16} />}>Report History</VSectionTitle>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>
            {deletedReports.length} deleted · recoverable for 30 days
          </span>
        </div>
        {deletedReports.length === 0 ? (
          <VEmptyState icon="🗑️" title="No deleted reports" sub="Deleted reports will appear here and are recoverable for 30 days." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="v-table">
              <thead>
                <tr>
                  <th>Report #</th>
                  <th>Deleted At</th>
                  <th>Period</th>
                  <th>Generated</th>
                  <th>Expires In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedReports.map((r, i) => {
                  const daysLeft = r.expiresAt
                    ? Math.ceil((new Date(r.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

                  return (
                    <tr key={r.id || r.localId || i}>
                      <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                        {r.id ? fmtReportId(r.id) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#ef4444', fontFamily: 'Poppins,sans-serif' }}>
                        {r.deletedAt}
                      </td>
                      <td><span className="v-badge v-badge-blue">{r.period}</span></td>
                      <td style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Poppins,sans-serif' }}>
                        {r.generatedDate}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif',
                          color: isExpiringSoon ? '#ef4444' : '#94a3b8',
                        }}>
                          {daysLeft !== null
                            ? (isExpiringSoon ? `⚠ ${daysLeft}d left` : `${daysLeft}d left`)
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="v-btn v-btn-sm"
                          onClick={() => retrieveReport(r)}
                          disabled={retrieving === r.id}
                          style={{ background: '#f0fdf5', color: '#00897b', border: '1px solid #b2dfdb', opacity: retrieving === r.id ? 0.6 : 1 }}
                        >
                          {retrieving === r.id
                            ? <><div style={{ width: 10, height: 10, border: '2px solid rgba(0,137,123,0.3)', borderTopColor: '#00897b', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Retrieving…</>
                            : <><RefreshCw size={12} /> Retrieve</>}
                        </button>
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

function FrCommunicationContent() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds]         = useState(new Set());
  const [fetching, setFetching]           = useState(true);
  const [modalVisible, setModalVisible]   = useState(false);
  const [editing, setEditing]             = useState(null);
  const [selectedTab, setSelectedTab]     = useState("all");
  const [title, setTitle]                 = useState("");
  const [content, setContent]             = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [viewingItem, setViewingItem]     = useState(null);

  // Load user from localStorage (mirrors AsyncStorage.getItem("user"))
  const [commUser, setCommUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

   const C = {
    border:   'rgba(0,168,76,0.12)',
    greenMid: 'rgba(0,168,76,0.1)',
  };

  const bmLabel = {
    display: 'block',
    fontSize: 11.5,
    fontWeight: 700,
    color: '#5a7a65',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: 'Montserrat,sans-serif',
    marginBottom: 4,
  };

  const bmInput = {
    width: '100%',
    padding: '10px 13px',
    border: '1.5px solid rgba(0,168,76,0.18)',
    borderRadius: 11,
    fontSize: 13.5,
    fontFamily: 'Poppins,sans-serif',
    color: '#0d2b1e',
    background: '#fafffc',
    outline: 'none',
    display: 'block',
  };

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

  // ── Fetch announcements ──
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

  // Merge server list with local pin state
  const mergedAnnouncements = announcements.map(a => ({
    ...a,
    pinned: pinnedIds.has(String(a.id)),
  }));

  // ── Toggle pin — ADMIN ONLY ──
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

  // ── Save (create / update) — ADMIN ONLY ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdminUser(commUser)) { alert("Only administrators can post announcements."); return; }
    if (!title.trim() || !content.trim()) { alert("Please fill in all fields."); return; }
    try {
      const url    = editing ? `${process.env.REACT_APP_API_URL}/announcements/${editing.id}` : `${process.env.REACT_APP_API_URL}/announcements`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, userId: commUser.id, role: commUser.role }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to save."); return; }
      setModalVisible(false); setEditing(null); setTitle(""); setContent("");
      fetchAnnouncements();
    } catch (err) { console.error("Save error:", err); }
  };

  // ── Delete — ADMIN ONLY ──
  const handleDelete = async (id) => {
    if (!isAdminUser(commUser)) return;
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: commUser.id, role: commUser.role }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Delete failed."); return; }
      const strId = String(id);
      if (pinnedIds.has(strId)) {
        setPinnedIds(prev => { const next = new Set(prev); next.delete(strId); persistPins(next); return next; });
      }
      if (viewingItem?.id === id) setViewingItem(null);
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  // ── Edit — ADMIN ONLY ──
  const handleEdit = (item) => {
    if (!isAdminUser(commUser)) return;
    setEditing(item); setTitle(item.title); setContent(item.content); setModalVisible(true);
  };

  // ── Tab filtering ──
  const now         = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const tabFiltered = (() => {
    switch (selectedTab) {
      case "recent": return mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo);
      case "pinned": return mergedAnnouncements.filter(a => a.pinned);
      default:       return mergedAnnouncements;
    }
  })();

  const filtered = searchQuery.trim()
    ? tabFiltered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tabFiltered;

  const tabBadge = {
    all:    mergedAnnouncements.length,
    recent: mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo).length,
    pinned: pinnedIds.size,
  };

  // ── Helpers ──
  const getInitials = (t = "") =>
    t.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

  const isRecent = (item) => new Date() - new Date(item.created_at) < 7 * 24 * 60 * 60 * 1000;

  // ── Styles (inline, consistent with dashboard tokens) ──
  const commStyles = {
    root: {
      fontFamily: "'Montserrat', sans-serif",
      display: "flex", flexDirection: "column", height: "100%",
    },
    header: {
      background: "linear-gradient(135deg,#2E7D32,#00897b)",
      padding: "20px 24px 28px",
      borderRadius: "18px 18px 0 0",
      position: "relative",
      overflow: "hidden",
    },
    headerTop: {
      display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4,
    },
    eyebrow: {
      fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)",
      letterSpacing: "0.25em", marginBottom: 4,
    },
    headerTitle: {
      fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px",
    },
    liveChip: {
      display: "inline-flex", alignItems: "center", gap: 7,
      background: "rgba(255,255,255,0.18)", borderRadius: 20,
      padding: "5px 11px", border: "1px solid rgba(255,255,255,0.3)",
    },
    liveDot: {
      width: 7, height: 7, borderRadius: "50%",
      background: "#d4df33", boxShadow: "0 0 0 3px rgba(212,223,51,0.3)",
    },
    liveTxt: { fontSize: 9, fontWeight: 800, color: "#d4df33", letterSpacing: "0.15em" },
    searchBarWrap: {
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(255,255,255,0.18)", borderRadius: 12,
      padding: "9px 13px", marginTop: 12,
      border: "1px solid rgba(255,255,255,0.25)",
    },
    searchInput: {
      flex: 1, background: "none", border: "none", outline: "none",
      color: "#fff", fontSize: 13, fontFamily: "inherit",
    },
    tabsRow: {
      display: "flex", gap: 7, padding: "14px 20px",
      background: "#fff", borderBottom: `1px solid ${C.border}`,
      flexWrap: "wrap",
    },
    tabBase: {
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 13px", borderRadius: 20, fontSize: 11.5,
      fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      border: "none", transition: "all .15s",
    },
    badge: {
      padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 800,
    },
    listArea: {
      flex: 1, overflowY: "auto", padding: "20px 20px 24px",
      background: "#f8fffe",
    },
    sectionLabel: {
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
    },
    labelAccent: {
      width: 4, height: 16, borderRadius: 2,
      background: "linear-gradient(135deg,#00897b,#4CAF50)", flexShrink: 0,
    },
    labelTxt: {
      fontSize: 11, fontWeight: 800, color: "#0d2b1e",
      letterSpacing: "0.08em", textTransform: "uppercase",
    },
    card: (pinned) => ({
      display: "flex", background: "#fff",
      borderRadius: 18, marginBottom: 10,
      border: `1px solid ${pinned ? "#FFE082" : C.border}`,
      boxShadow: pinned
        ? "0 3px 14px rgba(249,168,37,0.18)"
        : "0 2px 10px rgba(0,140,60,0.07)",
      overflow: "hidden", cursor: "pointer",
      transition: "transform .15s, box-shadow .15s",
    }),
    cardAccentBar: (pinned) => ({
      width: 4, flexShrink: 0,
      background: pinned
        ? "linear-gradient(180deg,#F9A825,#FFC107)"
        : "linear-gradient(180deg,#00897b,#4CAF50)",
    }),
    cardBody: { flex: 1, padding: "13px 15px 11px" },
    cardHeaderRow: { display: "flex", alignItems: "flex-start", gap: 10 },
    initialsChip: (pinned) => ({
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: pinned
        ? "linear-gradient(135deg,#F9A825,#E65100)"
        : "linear-gradient(135deg,#2E7D32,#00897b)",
      fontSize: 13, fontWeight: 900, color: "#fff",
    }),
    cardMeta: { flex: 1, minWidth: 0 },
    cardTitleRow: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 },
    cardTitle: { fontSize: 14, fontWeight: 800, color: "#0d2b1e" },
    cardDate:  { fontSize: 10, color: "#8AAD96", fontFamily: "monospace" },
    cardContent: {
      fontSize: 12.5, color: "#5a7a65", lineHeight: 1.65, marginTop: 9,
      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    tapHint: {
      display: "flex", alignItems: "center", gap: 3,
      marginTop: 7, fontSize: 10, color: "#8AAD96",
    },
    pinnedBadge: {
      display: "inline-flex", alignItems: "center", gap: 3,
      background: "#FFF8E1", borderRadius: 6, padding: "2px 6px",
      border: "1px solid #FFE082", fontSize: 8, fontWeight: 800, color: "#F9A825",
    },
    recentBadge: {
      background: "#E0F2F1", borderRadius: 6, padding: "2px 6px",
      border: "1px solid #B2DFDB", fontSize: 8, fontWeight: 800, color: "#00695c",
    },
    cardActions: { display: "flex", gap: 5, flexShrink: 0, alignItems: "flex-start" },
    actionBtn: (variant) => ({
      width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`,
      background: "#f0fdf5", cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
      color: variant === "delete" ? "#e53935" : variant === "pin" ? "#F9A825" : "#00695c",
    }),
    emptyState: {
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "60px 0 40px", gap: 10, textAlign: "center",
    },
    emptyIcon: { fontSize: 40, marginBottom: 4 },
    emptyTitle: { fontSize: 15, fontWeight: 800, color: "#0d2b1e" },
    emptySub:   { fontSize: 12, color: "#8AAD96", maxWidth: 260, lineHeight: 1.6 },
  };

  const emptyIcon = selectedTab === "pinned" ? "🔖" : selectedTab === "recent" ? "🕐" : "📢";
  const emptyTitle =
    searchQuery ? "No results found"
    : selectedTab === "pinned" ? "Nothing pinned yet"
    : selectedTab === "recent" ? "No recent announcements"
    : "No announcements yet";
  const emptySub =
    searchQuery ? "Try a different search term."
    : selectedTab === "pinned" ? "Administrators can pin important announcements."
    : selectedTab === "recent" ? "Announcements from the last 7 days appear here."
    : "Check back later.";

  return (
    <div style={commStyles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .comm-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,140,60,0.12) !important; }
        .comm-action-btn:hover { opacity: 0.78; }
        .comm-tab:hover { background: #e8fdf0 !important; color: #00695c !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={commStyles.header}>
        {/* subtle wave decoration */}
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
                onClick={() => { setEditing(null); setTitle(""); setContent(""); setModalVisible(true); }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Plus size={14} /> New
              </button>
            )}
          </div>
        </div>

        {searchVisible && (
          <div style={commStyles.searchBarWrap}>
            <Search size={14} color="rgba(255,255,255,0.7)" />
            <input
              autoFocus
              type="text"
              placeholder="Search announcements…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={commStyles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1 }}>✕</button>
            )}
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={commStyles.tabsRow}>
        {["all", "recent", "pinned"].map(tab => {
          const active = selectedTab === tab;
          return (
            <button
              key={tab}
              className={active ? "" : "comm-tab"}
              onClick={() => setSelectedTab(tab)}
              style={{
                ...commStyles.tabBase,
                background: active ? "linear-gradient(135deg,#2E7D32,#00897b)" : "#e8f5e9",
                color: active ? "#fff" : "#5a7a65",
                border: active ? "none" : `1px solid ${C.border}`,
                boxShadow: active ? "0 2px 8px rgba(0,180,90,0.28)" : "none",
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabBadge[tab] > 0 && (
                <span style={{
                  ...commStyles.badge,
                  background: active ? "rgba(255,255,255,0.28)" : C.greenMid,
                  color: active ? "#fff" : "#2E7D32",
                }}>
                  {tabBadge[tab]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── LIST ── */}
      <div style={commStyles.listArea}>
        <div style={commStyles.sectionLabel}>
          <div style={commStyles.labelAccent} />
          <span style={commStyles.labelTxt}>
            {searchQuery
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : selectedTab === "recent" ? "Last 7 Days"
              : selectedTab === "pinned" ? "Pinned Announcements"
              : "All Announcements"}
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
                      {pinned  && <span style={commStyles.pinnedBadge}>🔖 PINNED</span>}
                      {recent && !pinned && <span style={commStyles.recentBadge}>NEW</span>}
                    </div>
                    <div style={commStyles.cardDate}>{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  {isAdminUser(commUser) && (
                    <div style={commStyles.cardActions} onClick={e => e.stopPropagation()}>
                      <button className="comm-action-btn" style={commStyles.actionBtn("pin")} onClick={() => handlePin(item)} title={pinned ? "Unpin" : "Pin"}>
                        {pinned ? <span style={{ fontSize: 12 }}>🔖</span> : <span style={{ fontSize: 12 }}>📌</span>}
                      </button>
                      <button className="comm-action-btn" style={commStyles.actionBtn("edit")} onClick={() => { handleEdit(item); }} title="Edit">
                        <Pencil size={12} />
                      </button>
                      <button className="comm-action-btn" style={commStyles.actionBtn("delete")} onClick={() => handleDelete(item.id)} title="Delete">
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
      </div>

      {/* ── FULL VIEW PANEL ── */}
      {viewingItem && (
        <div onClick={() => setViewingItem(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            {/* gradient header */}
            <div style={{
              background: viewingItem.pinned
                ? "linear-gradient(135deg,#F9A825,#E65100)"
                : "linear-gradient(135deg,#2E7D32,#00897b)",
              borderRadius: "20px 20px 0 0", padding: "20px 22px 28px",
              position: "relative", overflow: "hidden",
            }}>
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

            {/* body */}
            <div style={{ padding: "22px 24px 28px" }}>
              <p style={{ fontSize: 14.5, color: "#1A3A2A", lineHeight: 1.75, margin: 0 }}>{viewingItem.content}</p>

              {/* Admin actions */}
              {isAdminUser(commUser) && (
                <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                  <button
                    onClick={() => handlePin(viewingItem)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: viewingItem.pinned ? "none" : "1.5px solid #FFE082", background: viewingItem.pinned ? "#F9A825" : "#FFF8E1", color: viewingItem.pinned ? "#fff" : "#F9A825" }}>
                    {viewingItem.pinned ? "🔖 Unpin" : "📌 Pin"}
                  </button>
                  <button
                    onClick={() => { handleEdit(viewingItem); setViewingItem(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff" }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => { handleDelete(viewingItem.id); setViewingItem(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL — Admin only ── */}
      {isAdminUser(commUser) && modalVisible && (
        <div onClick={() => setModalVisible(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>{editing ? "Edit Announcement" : "New Announcement"}</span>
              <button onClick={() => setModalVisible(false)} style={{ width: 30, height: 30, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Title</label>
                <input
                  type="text"
                  placeholder="Announcement title…"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ ...bmInput, marginTop: 4 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={bmLabel}>Content</label>
                <textarea
                  placeholder="Write your announcement…"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={5}
                  style={{ ...bmInput, marginTop: 4, resize: "vertical", lineHeight: 1.65 }}
                />
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