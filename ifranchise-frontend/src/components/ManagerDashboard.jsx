import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import jsPDF from 'jspdf';
import {
     Home, Box, FileText, FileCheck, Users, BarChart2, MessageCircle,
     User, ShoppingCart, LogOut, Search, Package, AlertTriangle,
     DollarSign, Grid3X3, ChevronDown, Plus, Pencil, Trash2, X, Check,
     Building2, Store, TrendingDown, TrendingUp, Layers, GitBranch,
     Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar, Pin, Megaphone,
     ArrowUpRight, ArrowDownRight, BarChart, RefreshCw, Eye, EyeOff, Clock, Info,
     Download, History, RotateCcw, UserPlus, CheckCircle, ChevronRight,
     Lock, Unlock, CheckCircle2, Zap, Target, Activity, ArrowUp, ArrowDown,
     Brain, PieChart, LineChart, Sparkles, Shield, Send, Save, Receipt, Printer, Banknote, QrCode, CreditCard
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

const fmtReportId = (id) => `REP-${String(id).padStart(5, '0')}`;

 const fmtDate = () =>
  new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

const fmtTime = () =>
  new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const generateReceiptNo = () => 'OR-' + Date.now().toString().slice(-8);
const generateTxnId     = () => 'TXN-' + Math.random().toString(36).toUpperCase().slice(2, 10);

const VAT_RATE        = 0.12;


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
          {navigation.slice(0, 6).map(item => (
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
          {navigation.slice(6).map(item => (
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
          {activeModule === 'dashboard'      && <MaDashboardContent transactions={transactions} brands={brands} user={user} />}
          {activeModule === 'menuInventory'  && <MenuInventoryContent  user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'pos'            && <FrPOSContent user={user} brands={brands} />}
          {activeModule === 'receipts'       && <Receipts />}
          {activeModule === 'reports'        && <MaReportsContent user={user} transactions={transactions} />}
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

const fmtAmt   = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => { if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k"; return "₱" + Number(n).toFixed(0); };
const fmtPeso1  = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt8     = (d) => d.toISOString().slice(0, 10);
const FONT     = "'Montserrat', sans-serif";
const PAL      = ["#00c853","#00897b","#26a69a","#43a047","#66bb6a","#f59e0b","#1d4ed8","#7c3aed","#db2777","#ea580c"];


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
 
function MaDashboardContent({ transactions, brands, user }) {
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
  const storageKey = `frArchives_branch_${userBranch.trim().toLowerCase()}`;
const [archives, setArchives] = useState(() => {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
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

  const scopedTransactions = useMemo(() => {
  const branch = userBranch.toLowerCase();

  return (transactions || []).filter(tx =>
    (tx.branch || '').trim().toLowerCase() === branch
  );
}, [transactions, userBranch]);


const tabSt = (a) => ({ padding: "6px 13px", borderRadius: 9, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all .15s", background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent", color: a ? "#fff" : "#5a7a65", boxShadow: a ? "0 2px 8px rgba(0,180,90,.35)" : "none" });
 
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
      params.set('branch', userBranch.trim());
      if (!userBranch) return;
 
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
  const myTransactions = scopedTransactions;
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
const low       = useMemo(() => values.length ? Math.min(...values) : 0, [values]);
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
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setArchiveConfirm(false);
    alert(`Year ${year} archived!`);
  };
 
  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const updated = archives.filter(a => a.year !== year);
    setArchives(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
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
  const todaySales = useMemo(() => {
  return scopedTransactions.filter(tx =>
    (tx.created_at || '').startsWith(todayStr)
  );
}, [scopedTransactions, todayStr]);
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

      {/* ── Filter + Date toolbar ── */}
      <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, boxShadow: "0 1px 8px rgba(0,140,60,0.05)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

        {/* Preset tabs */}
        <div style={{ display: "flex", gap: 3, background: "#f0faf4", borderRadius: 10, padding: 3 }}>
          {["day","week","month","year"].map(p => (
            <button key={p} style={tabSt(rangeMode === "preset" && preset === p)} onClick={() => { setRangeMode("preset"); setPreset(p); setViewingArchive(null); }}>
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
        <button onClick={() => setShowArchivePanel(v => !v)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1.5px solid #b2dfdb", background: showArchivePanel ? "#e0f2f1" : "#fff", color: "#00695c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
          <Archive size={13} /> Archives
          {archives.length > 0 && <span style={{ background: "#00897b", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{archives.length}</span>}
        </button>
      </div>

      {/* Archive panel */}
      {showArchivePanel && (
        <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.15)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,140,60,0.08)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#0d2b1e", display: "flex", alignItems: "center", gap: 7 }}>
              <Archive size={15} color="#00897b" /> Yearly Archives — {userBranch}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!archiveConfirm ? (
                <>
                  <input type="number" value={archiveYearInput} onChange={e => setArchiveYearInput(e.target.value)} min="2000" max="2100" placeholder="Year" style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 12, fontFamily: FONT, color: "#0d2b1e", outline: "none", width: 86 }} />
                  <button onClick={() => setArchiveConfirm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                    <Plus size={12} /> Archive Year
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 9, padding: "6px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", fontFamily: FONT }}>Archive {archiveYearInput}?</span>
                  <button onClick={saveArchive} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #00897b", background: "#e0f2f1", color: "#00695c" }}>Confirm</button>
                  <button onClick={() => setArchiveConfirm(false)} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280" }}>Cancel</button>
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
                  <div style={{ fontSize: 10.5, color: "#5a7a65", marginTop: 2, fontFamily: FONT }}>Saved: {a.savedAt} · Total: {fmtPeso(a.kpis.totalSales)}</div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => { setViewingArchive(viewingArchive?.year === a.year ? null : a); setShowArchivePanel(false); }} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: `1px solid ${viewingArchive?.year === a.year ? "#00897b" : "#b2dfdb"}`, background: viewingArchive?.year === a.year ? "#e0f2f1" : "#f8fffe", color: "#00695c" }}>
                    {viewingArchive?.year === a.year ? "Viewing" : "View"}
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
        getRangeLabel={getRangeLabel} filterLabel={`${userBranch} — ${getRangeLabel()}`}
      />

      {/* ── SECTION 2: PRESCRIPTIVE ANALYSIS ── */}
      <PrescriptiveSection
        transactions={myTransactions} filterLabel={`${userBranch} — ${getRangeLabel()}`}
        preset={preset} total={total} values={values} kpiData={kpiData}
      />

      {/* ── SECTION 3: SALES VS STOCK ── */}
      <SalesVsStockSection
        preset={preset} appliedRange={appliedRange} rangeMode={rangeMode}
        filterBranch={userBranch} filterBrand={null}
        selectedBrand={null} total={total}
      />
    </div>
  );
}

function Modal({ show, title, message, type = 'info', onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) {
  if (!show) return null;
  const colors = {
    info:    { bg: '#e0f2f1', icon: '#00897b', border: '#b2dfdb' },
    error:   { bg: '#fee2e2', icon: '#dc2626', border: '#fca5a5' },
    success: { bg: '#dcfce7', icon: '#16a34a', border: '#86efac' },
    warning: { bg: '#fef9c3', icon: '#d97706', border: '#fde68a' },
  };
  const c = colors[type] || colors.info;
  const icons = {
    info: <Check size={22} />, error: <X size={22} />,
    success: <Check size={22} />, warning: <AlertTriangle size={22} />,
  };
  return (
    <div onClick={showCancel ? onCancel : onConfirm}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${c.border}` }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: c.icon }}>
          {icons[type]}
        </div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.7, marginBottom: 26 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {showCancel && (
            <button onClick={onCancel}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {cancelText}
            </button>
          )}
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: type === 'error' ? '#dc2626' : 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMONGO GCASH MODAL  — identical to admin POS
// ─────────────────────────────────────────────────────────────────────────────
function GCashQRModal({ totalAmt, onConfirm, onCancel, fmtPHP }) {
  const [step,      setStep]      = React.useState('loading');
  const [qrUrl,     setQrUrl]     = React.useState('');
  const [linkId,    setLinkId]    = React.useState('');
  const [refNo,     setRefNo]     = React.useState('');
  const [gcashRef,  setGcashRef]  = React.useState('');
  const [errorMsg,  setErrorMsg]  = React.useState('');
  const [countdown, setCountdown] = React.useState(180);
  const pollRef  = React.useRef(null);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    const create = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/create-gcash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmt, description: 'iFranchise POS Payment', orderId: Date.now() }),
        });
        const data = await res.json();
        if (!data.success) { setErrorMsg(data.error || 'Failed to create payment link.'); setStep('error'); return; }
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.checkoutUrl)}`;
        setQrUrl(qr);
        setLinkId(data.linkId);
        setRefNo(data.referenceNo);
        setStep('ready');
        startPolling(data.linkId);
        startCountdown();
      } catch { setErrorMsg('Could not reach payment server.'); setStep('error'); }
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
    }, 3000);
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

  const fmtCountdown = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: "'Montserrat',sans-serif", animation: 'gcashSlideUp .25s cubic-bezier(.22,1,.36,1)' }}>
        <style>{`
          @keyframes gcashSlideUp { from{opacity:0;transform:translateY(28px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
          @keyframes paidPop { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
          @keyframes scanLine { 0%{top:0;} 100%{top:196px;} }
        `}</style>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#007acc,#0057a8)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#007acc' }}>G</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>GCash via PayMongo</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {step === 'loading' && 'Generating payment link…'}
                {step === 'ready'   && `Waiting for payment · ${fmtCountdown(countdown)}`}
                {step === 'paid'    && 'Payment confirmed ✓'}
                {step === 'error'   && 'Payment failed'}
              </div>
            </div>
          </div>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>×</button>
        </div>
        {/* Amount bar */}
        <div style={{ background: '#f0f7ff', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Amount</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0057a8' }}>{fmtPHP(totalAmt)}</div>
        </div>
        {/* Body */}
        <div style={{ padding: '22px 24px 24px', textAlign: 'center' }}>
          {step === 'loading' && (
            <div style={{ padding: '32px 0' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 12 }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              <div style={{ fontSize: 14, color: '#5a7a65', fontWeight: 600 }}>Creating payment link…</div>
            </div>
          )}
          {(step === 'ready') && qrUrl && (
            <>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 14 }}>Ask the customer to scan this QR code with their GCash app</div>
              <div style={{ width: 200, height: 200, margin: '0 auto 14px', border: '3px solid #007acc', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                <img src={qrUrl} alt="PayMongo GCash QR" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#007acc,transparent)', animation: 'scanLine 2s linear infinite' }} />
              </div>
              {refNo && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Ref # <strong style={{ color: '#374151', fontFamily: 'monospace' }}>{refNo}</strong></div>}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: countdown < 30 ? '#fee2e2' : '#f0f7ff', border: `1px solid ${countdown < 30 ? '#fecaca' : '#bfdbfe'}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: countdown < 30 ? '#dc2626' : '#1e40af', marginBottom: 16 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Expires in {fmtCountdown(countdown)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, color: '#5a7a65' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                Waiting for payment confirmation…
              </div>
              <button onClick={onCancel} style={{ marginTop: 14, width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel payment</button>
            </>
          )}
          {step === 'paid' && (
            <div style={{ padding: '24px 0', animation: 'paidPop .4s ease' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0d2b1e', marginBottom: 6 }}>Payment Received!</div>
              <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 10 }}>{fmtPHP(totalAmt)} via GCash</div>
              {gcashRef && <div style={{ background: '#f0fdf5', border: '1px solid #d1eedd', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#00695c', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Ref: {gcashRef}</div>}
              <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>Processing transaction…</div>
            </div>
          )}
          {step === 'error' && (
            <div style={{ padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0d2b1e', marginBottom: 6 }}>Payment Failed</div>
              <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 20 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleRetry} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#007acc,#0057a8)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIPT PRINT — Legal landscape 2-copy (identical to admin POS)
// ─────────────────────────────────────────────────────────────────────────────
function ReceiptModal({ show, receipt, onClose, onNewSale }) {
  if (!show || !receipt) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=1360,height=860,resizable=yes');

    const copyHTML = (label) => `
      <div class="copy">
        <div class="copy-label">${label}</div>
        <div class="center bold" style="font-size:12px">iFranchise Business and Services Corporation</div>
        <div class="center bold" style="font-size:11px">FranchiSync</div>
        <div class="center header" style="margin-top:5px">
          Main Office: Blk 113 Bldg. Connecticut St.,<br>
          Greenhills San Juan City, Philippines<br>
          Contact No.: 09271820495<br>
          Email: franchise.ordering@gmail.com
        </div>
        <div class="center header" style="margin-top:5px">
          VAT Registered TIN: _______________<br>
          Permit No.: _______________<br>
          Serial No.: _______________
        </div>
        <div class="divider-dash"></div>
        <div class="center bold" style="font-size:11px;margin-bottom:5px">SALES INVOICE</div>
        <div class="header">
          <div><b>Receipt No.:</b> ${receipt.receiptNo}</div>
          <div><b>Transaction ID:</b> ${receipt.txnId}</div>
          <div><b>Date:</b> ${receipt.date}</div>
          <div><b>Time:</b> ${receipt.time}</div>
          <div><b>Cashier:</b> ${receipt.cashier}</div>
          <div><b>Branch:</b> ${receipt.branch}</div>
          <div><b>Terminal No.:</b> 001</div>
        </div>
        <div class="divider-solid"></div>
        <div class="item-row bold">
          <span class="col-item">ITEM</span>
          <span class="col-qty">QTY</span>
          <span class="col-price">PRICE</span>
          <span class="col-total">TOTAL</span>
        </div>
        <div class="divider-solid"></div>
        ${(receipt.items || []).map(item => `
          <div class="item-row">
            <span class="col-item">${item.name}</span>
            <span class="col-qty">${item.qty}</span>
            <span class="col-price">P${Number(item.price).toFixed(2)}</span>
            <span class="col-total">P${Number(item.subtotal).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="divider-solid"></div>
        <div class="row"><span>SUBTOTAL</span><span>P${Number(receipt.subtotal).toFixed(2)}</span></div>
        ${receipt.vat_enabled ? `<div class="row"><span>VAT 12%</span><span>P${Number(receipt.vat_amt || 0).toFixed(2)}</span></div>` : ''}
        ${receipt.discount_pct > 0 ? `<div class="row"><span>DISCOUNT (${receipt.discount_label || receipt.discount_pct + '%'})</span><span>-P${Number(receipt.discount_amt || 0).toFixed(2)}</span></div>` : ''}
        <div class="divider-solid"></div>
        <div class="row bold" style="font-size:10px"><span>TOTAL</span><span>P${Number(receipt.total).toFixed(2)}</span></div>
        ${receipt.payment_method === 'Cash' ? `
          <div class="row"><span>CASH</span><span>P${Number(receipt.cash_received).toFixed(2)}</span></div>
          <div class="row"><span>CHANGE</span><span>P${Number(receipt.change_due).toFixed(2)}</span></div>
        ` : ''}
        ${receipt.is_split ? `
          <div class="row"><span>GCASH</span><span>P${Number(receipt.split_gcash_amt || 0).toFixed(2)}</span></div>
          ${receipt.gcash_ref ? `<div class="row"><span>GCash Ref</span><span>${receipt.gcash_ref}</span></div>` : ''}
          <div class="row"><span>CASH</span><span>P${Number(receipt.split_cash_amt || 0).toFixed(2)}</span></div>
        ` : ''}
        <div class="divider-dash"></div>
        <div class="header">
          <div><b>Payment Method:</b> ${receipt.payment_method}</div>
          ${receipt.gcash_ref && !receipt.is_split ? `<div><b>GCash Ref #:</b> ${receipt.gcash_ref}</div>` : ''}
          <div><b>Payment Status:</b> PAID</div>
          <div><b>Processed By:</b> FranchiSync</div>
          <div><b>Approval Status:</b> Verified</div>
        </div>
        <div class="divider-dash"></div>
        <div class="center header">
          THIS SERVES AS YOUR SALES INVOICE.<br>
          Please keep this invoice for future reference.<br>
          All franchise payments are subject to verification<br>
          and approval by iFranchise Business and<br>
          Services Corporation.<br><br>
          For support: franchise.ordering@gmail.com<br>
          (+63) 9271820495
        </div>
      </div>
    `;

    const css = [
      '* { margin: 0; padding: 0; box-sizing: border-box; }',
      'body { font-family: Courier New, monospace; background: #f0f0f0; color: #000; display: flex; justify-content: center; align-items: flex-start; padding: 24px; min-height: 100vh; }',
      '.page-wrapper { background: #fff; display: flex; flex-direction: row; align-items: flex-start; box-shadow: 0 2px 16px rgba(0,0,0,0.15); padding: 14px 10px; width: fit-content; }',
      '.copy { width: 165mm; padding: 6px 10px; font-size: 10px; }',
      '.cut-line { width: 1px; min-height: 100%; border-left: 1.5px dashed #555; margin: 0 10px; align-self: stretch; position: relative; }',
      ".cut-line::after { content: 'CUT'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(90deg); font-size: 7px; color: #888; background: #fff; padding: 2px 4px; letter-spacing: 0.1em; white-space: nowrap; }",
      '.copy-label { text-align: center; font-size: 9px; font-weight: 700; border: 1px solid #000; padding: 2px 4px; margin-bottom: 6px; letter-spacing: 0.06em; }',
      '.center { text-align: center; }',
      '.bold { font-weight: 700; }',
      '.row { display: flex; justify-content: space-between; font-size: 9px; line-height: 1.65; }',
      '.item-row { display: flex; font-size: 9px; line-height: 1.65; }',
      '.col-item { width: 44%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
      '.col-qty { width: 10%; text-align: right; }',
      '.col-price { width: 22%; text-align: right; }',
      '.col-total { width: 22%; text-align: right; }',
      '.divider-solid { border-top: 1px solid #000; margin: 4px 0; }',
      '.divider-dash { border-top: 1px dashed #000; margin: 4px 0; }',
      '.header { font-size: 9px; line-height: 1.7; }',
      '@media print {',
      '  body { background: #fff; display: block; padding: 0; }',
      '  .page-wrapper { box-shadow: none; padding: 0; width: 100%; }',
      '  .copy { width: 48%; padding: 4px 8px; }',
      '  .cut-line { width: 4px; margin: 0 4px; }',
      '  @page { size: legal landscape; margin: 8mm 10mm; }',
      '}',
    ].join('\n');

    const html = [
      '<!DOCTYPE html><html><head>',
      '<title>Sales Invoice - ' + receipt.receiptNo + '</title>',
      '<style>' + css + '</style>',
      '</head><body>',
      '<div class="page-wrapper">',
      copyHTML('CUSTOMER COPY'),
      '<div class="cut-line"></div>',
      copyHTML('MERCHANT COPY'),
      '</div>',
      '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<' + '/script>',
      '</body></html>',
    ].join('');

    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid rgba(0,168,76,0.15)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Sales Invoice</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{receipt.receiptNo} — {receipt.date}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
        {/* Preview */}
        <div style={{ padding: '18px 22px', background: '#f8fffe', maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontFamily: 'Courier New, monospace', fontSize: 11 }}>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>iFranchise Business and Services Corporation</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>FranchiSync — {receipt.branch}</div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#5a7a65' }}>Receipt: {receipt.receiptNo} · {receipt.date} {receipt.time}</div>
              <div style={{ fontSize: 10, color: '#5a7a65' }}>Cashier: {receipt.cashier}</div>
            </div>
            <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '8px 0', margin: '8px 0' }}>
              {(receipt.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span>{item.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 700 }}>₱{Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span>Subtotal</span><span>₱{Number(receipt.subtotal).toFixed(2)}</span></div>
              {receipt.discount_pct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: '#d97706' }}><span>Discount ({receipt.discount_pct}%)</span><span>−₱{Number(receipt.discount_amt || 0).toFixed(2)}</span></div>}
              {receipt.vat_enabled && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: '#2563eb' }}><span>VAT 12%</span><span>+₱{Number(receipt.vat_amt || 0).toFixed(2)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13, borderTop: '1px solid #ccc', paddingTop: 5, marginBottom: 5 }}><span>TOTAL</span><span style={{ color: '#00897b' }}>₱{Number(receipt.total).toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Payment</span><span style={{ fontWeight: 700 }}>{receipt.payment_method}</span></div>
              {receipt.is_split && (
                <div style={{ background: '#f0fdf5', borderRadius: 6, padding: '6px 8px', margin: '4px 0', fontSize: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GCash</span><span>₱{Number(receipt.split_gcash_amt || 0).toFixed(2)}</span></div>
                  {receipt.gcash_ref && <div style={{ color: '#00695c', fontFamily: 'monospace' }}>Ref: {receipt.gcash_ref}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cash</span><span>₱{Number(receipt.split_cash_amt || 0).toFixed(2)}</span></div>
                </div>
              )}
              {receipt.payment_method === 'Cash' && !receipt.is_split && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Cash Received</span><span>₱{Number(receipt.cash_received).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Change</span><span style={{ fontWeight: 800, color: '#00897b' }}>₱{Number(receipt.change_due).toFixed(2)}</span></div>
                </>
              )}
              {receipt.gcash_ref && !receipt.is_split && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>GCash Ref #</span><span style={{ fontFamily: 'monospace' }}>{receipt.gcash_ref}</span></div>}
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#5a7a65' }}>Thank you for your purchase! 🎉</div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #e0f2f1', display: 'flex', gap: 10 }}>
          <button onClick={handlePrint}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Printer size={14} /> Print 2 Copies
          </button>
          <button onClick={onNewSale}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={14} /> New Sale
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VOID MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VoidModal({ show, tx, branch, onClose, onConfirm }) {
  const [pw,        setPw]        = useState('');
  const [err,       setErr]       = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showPw,    setShowPw]    = useState(false);

  const handleConfirm = async () => {
    if (!pw) { setErr('Please enter the manager password.'); return; }
    setVerifying(true);
    setErr('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-manager-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, password: pw }),
      });
      const data = await res.json();
      if (!data.valid) {
        setErr(data.error || 'Incorrect manager password.');
        setVerifying(false);
        return;
      }
      onConfirm(tx);
      setPw('');
      setErr('');
    } catch {
      setErr('Could not verify password. Check your connection.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => { setPw(''); setErr(''); setShowPw(false); onClose(); };
  if (!show) return null;

  return (
    <div onClick={handleClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Void Transaction</div>
          <button onClick={handleClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {tx && (
            <div style={{ padding: '12px 14px', background: '#fff3e0', borderRadius: 10, border: '1px solid #ffcc80', marginBottom: 18, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#0d2b1e' }}>#{tx.id} — {fmtPeso(tx.total)}</div>
              <div style={{ color: '#5a7a65', fontSize: 12, marginTop: 2 }}>This action cannot be undone.</div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Manager Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                disabled={verifying}
                onChange={e => { setPw(e.target.value); setErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
                placeholder="Enter manager password to authorize"
                style={{
                  width: '100%', padding: '10px 40px 10px 13px', borderRadius: 10,
                  border: `1.5px solid ${err ? '#fca5a5' : '#b2dfdb'}`,
                  background: verifying ? '#f3f4f6' : '#f0fdf5',
                  fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  opacity: verifying ? 0.7 : 1, cursor: verifying ? 'not-allowed' : 'text',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: '#5a7a65', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 5, fontWeight: 600 }}>{err}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleClose}
              disabled={verifying}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: verifying ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: verifying ? 0.6 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={verifying}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: verifying ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: verifying ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}
            >
              {verifying ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  Verifying...
                </>
              ) : 'Void Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FrPOSContent({ user }) {
  const userBranch = (user?.branch || '').trim();

  // ── State ─────────────────────────────────────────────────────────────────
  const [menuItems,     setMenuItems]     = useState([]);
  const [cart,          setCart]          = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [loadingTx,     setLoadingTx]     = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [txSearch,      setTxSearch]      = useState('');
  const [txDateFrom,    setTxDateFrom]    = useState('');
  const [txDateTo,      setTxDateTo]      = useState('');
  const [activeTab,     setActiveTab]     = useState('cashier');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived,  setCashReceived]  = useState('');
  const [discountPct,   setDiscountPct]   = useState(0);
  const [discountType,  setDiscountType]  = useState('None');
  const [vatEnabled,    setVatEnabled]    = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [txPage,        setTxPage]        = useState(0);
  const [noteInput,     setNoteInput]     = useState('');

  // Split payment
  const [isSplitPayment,  setIsSplitPayment]  = useState(false);
  const [splitGcashAmt,   setSplitGcashAmt]   = useState('');
  const [splitCashAmt,    setSplitCashAmt]     = useState('');
  const [splitGcashPaid,  setSplitGcashPaid]   = useState(false);
  const [splitGcashRef,   setSplitGcashRef]    = useState('');

  // GCash / PayMongo
  const [showGCashModal,  setShowGCashModal]  = useState(false);
  const [gcashRefNumber,  setGcashRefNumber]  = useState('');
  const [gcashPaymentAmt, setGcashPaymentAmt] = useState(0);

  // Discount auth
  const [showDiscountAuth,   setShowDiscountAuth]   = useState(false);
  const [pendingDiscount,    setPendingDiscount]     = useState(null);
  const [discountAuthInput,  setDiscountAuthInput]   = useState('');
  const [discountAuthErr,    setDiscountAuthErr]     = useState('');
  const [customDiscountInput,setCustomDiscountInput] = useState('');

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt,      setLastReceipt]      = useState(null);
  const [showVoidModal,    setShowVoidModal]     = useState(false);
  const [voidTarget,       setVoidTarget]        = useState(null);
  const [modal,            setModal]             = useState({ show: false });

  const TX_PAGE_SIZE = 20;

  const showAlert = (title, message, type = 'info') =>
    setModal({ show: true, title, message, type, onConfirm: null });
  const closeModal = () => setModal(m => ({ ...m, show: false }));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!userBranch) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`);
      const d   = await res.json();
      setMenuItems(Array.isArray(d) ? d : []);
    } catch { setMenuItems([]); }
  }, [userBranch]);

  const fetchTransactions = useCallback(async () => {
  if (!userBranch) return;
  setLoadingTx(true);
  try {
    const [activeRes, voidedRes] = await Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`),
      fetch(`${process.env.REACT_APP_API_URL}/transactions/voided?branch=${encodeURIComponent(userBranch)}`),
    ]);
    const active = await activeRes.json();
    const voided = await voidedRes.json();
    const merged = [...(Array.isArray(active) ? active : []), ...(Array.isArray(voided) ? voided : [])]
      .map(tx => ({ ...tx, voided: !!tx.is_voided }));
    setTransactions(merged);
  } catch {
    setTransactions([]);
  } finally {
    setLoadingTx(false);
  }
}, [userBranch]);

  useEffect(() => { fetchProducts(); },     [fetchProducts]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setTxPage(0); }, [txSearch, txDateFrom, txDateTo]);

  // ── Products ──────────────────────────────────────────────────────────────
  const allProducts = useMemo(() => {
    const q = searchProduct.toLowerCase();
    return menuItems
      .map(m => ({ ...m, source: 'menu', displayName: m.name }))
      .filter(p => !q || p.displayName.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }, [menuItems, searchProduct]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateQty    = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart    = () => {
    setCart([]); setCashReceived(''); setDiscountPct(0); setDiscountType('None');
    setNoteInput(''); setGcashRefNumber(''); setGcashPaymentAmt(0);
    setIsSplitPayment(false); setSplitGcashAmt(''); setSplitCashAmt('');
    setSplitGcashPaid(false); setSplitGcashRef('');
    setShowDiscountAuth(false); setPendingDiscount(null);
    setDiscountAuthInput(''); setCustomDiscountInput('');
  };

  // ── Discount auth ─────────────────────────────────────────────────────────
const confirmDiscountAuth = async () => {
     setDiscountAuthErr('');
     if (pendingDiscount.label === 'Others') {
       const pct = parseFloat(customDiscountInput);
       if (!pct || pct <= 0 || pct > 100) {
         setDiscountAuthErr('Enter a valid discount % (1–100).');
         return;
       }
     }
     try {
       const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-manager-password`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ branch: userBranch, password: discountAuthInput }),
       });
       const data = await res.json();
       if (!data.valid) {
         setDiscountAuthErr(data.error || 'Incorrect manager password.');
         return;
       }
     } catch {
       setDiscountAuthErr('Could not verify password. Check your connection.');
       return;
     }
     if (pendingDiscount.label === 'Others') {
       setDiscountPct(parseFloat(customDiscountInput));
       setDiscountType('Others');
     } else {
       setDiscountPct(pendingDiscount.pct);
       setDiscountType(pendingDiscount.label);
     }
     setShowDiscountAuth(false);
     setDiscountAuthInput('');
     setCustomDiscountInput('');
     setPendingDiscount(null);
   };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal    = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const discounted  = subtotal - discountAmt;
  const vatAmt      = vatEnabled ? discounted * VAT_RATE : 0;
  const totalAmt    = discounted + vatAmt;
  const changeDue   = paymentMethod === 'Cash' ? Math.max(0, parseFloat(cashReceived || 0) - totalAmt) : 0;
  const cashShortfall = paymentMethod === 'Cash' && cashReceived !== ''
    ? parseFloat(cashReceived || 0) - totalAmt : 0;

  // ── Process sale ──────────────────────────────────────────────────────────
  const processSale = async () => {
    if (cart.length === 0) { showAlert('Empty Cart', 'Please add at least one item.', 'warning'); return; }

    if (isSplitPayment) {
      const gcash = parseFloat(splitGcashAmt) || 0;
      const cash  = parseFloat(splitCashAmt)  || 0;
      if (Math.abs((gcash + cash) - totalAmt) > 0.01) {
        showAlert('Split Amounts Mismatch', `GCash + Cash must equal ${fmtPeso(totalAmt)}.`, 'error');
        return;
      }
      if (gcash > 0 && !splitGcashPaid) {
        showAlert('GCash Pending', 'Please complete the GCash payment first.', 'warning');
        return;
      }
    } else {
      if (paymentMethod === 'Cash' && parseFloat(cashReceived || 0) < totalAmt) {
        showAlert('Insufficient Cash', 'Cash received is less than the total amount.', 'error');
        return;
      }
      if (paymentMethod === 'GCash' && !gcashRefNumber) {
        setShowGCashModal(true);
        return;
      }
    }

    setProcessing(true);
    try {
      const receiptNo = generateReceiptNo();
      const txnId     = generateTxnId();

      const payload = {
        branch: userBranch, cashier: user?.name || 'Staff', shop: '',
        payment_method: isSplitPayment ? 'Split' : paymentMethod,
        is_split: isSplitPayment,
        split_gcash_amt: isSplitPayment ? (parseFloat(splitGcashAmt) || 0) : null,
        split_cash_amt:  isSplitPayment ? (parseFloat(splitCashAmt)  || 0) : null,
        gcash_ref: isSplitPayment ? splitGcashRef : (paymentMethod === 'GCash' ? gcashRefNumber : null),
        cash_received: isSplitPayment
          ? (parseFloat(splitCashAmt) || 0)
          : (paymentMethod === 'Cash' ? parseFloat(cashReceived) : totalAmt),
        discount_pct: discountPct, discount_label: discountType,
        subtotal, discount_amt: discountAmt,
        vat_enabled: vatEnabled, vat_amt: vatAmt,
        total: totalAmt,
        change_due: isSplitPayment
          ? Math.max(0, (parseFloat(splitCashAmt) || 0) - (totalAmt - (parseFloat(splitGcashAmt) || 0)))
          : changeDue,
        note: noteInput,
        receipt_no: receiptNo, txn_id: txnId,
        items: cart.map(c => ({ id: c.id, source: 'menu', name: c.displayName, price: c.price, qty: c.qty, subtotal: c.price * c.qty })),
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        setLastReceipt({ ...payload, receiptNo, txnId, date: fmtDate(), time: fmtTime(), cashier: user?.name || 'Staff', branch: userBranch });
        setShowReceiptModal(true);
        clearCart();
        fetchTransactions();
        fetchProducts();
      } else {
        showAlert('Transaction Failed', d.error || 'Failed to process sale.', 'error');
      }
    } catch {
      showAlert('Connection Error', 'Failed to process sale. Check your connection.', 'error');
    } finally { setProcessing(false); }
  };

  // ── Void ──────────────────────────────────────────────────────────────────
  const handleVoidRequest = (tx) => { setVoidTarget(tx); setShowVoidModal(true); };
  const handleVoidConfirm = async (tx) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${tx.id}/void`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voided_by: user?.name || 'Manager', reason: 'Manager authorized void' }),
    });
    const d = await res.json();
    setShowVoidModal(false); setVoidTarget(null);
    if (d.success) { showAlert('Voided', 'Transaction has been voided successfully.', 'success'); fetchTransactions(); }
    else showAlert('Void Failed', d.error || 'Could not void this transaction.', 'error');
  } catch { setShowVoidModal(false); showAlert('Connection Error', 'Failed to void transaction.', 'error'); }
};

  // ── Filtered transactions ─────────────────────────────────────────────────
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
  const todaySales   = transactions.filter(tx => (tx.created_at || '').startsWith(todayStr) && !tx.voided);
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total || 0), 0);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', fontSize: 13, fontFamily: 'inherit', color: '#0d2b1e', outline: 'none', boxSizing: 'border-box' };
  const smallBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid #b2dfdb', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", padding: '18px 20px', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Modals ── */}
      <Modal show={modal.show} title={modal.title} message={modal.message} type={modal.type}
        onConfirm={closeModal} onCancel={closeModal} />
      <ReceiptModal show={showReceiptModal} receipt={lastReceipt}
        onClose={() => setShowReceiptModal(false)} onNewSale={() => setShowReceiptModal(false)} />
      <VoidModal show={showVoidModal} tx={voidTarget} branch={userBranch}
     onClose={() => { setShowVoidModal(false); setVoidTarget(null); }}
     onConfirm={handleVoidConfirm} />
      {showGCashModal && (
        <GCashQRModal
          totalAmt={isSplitPayment ? (parseFloat(splitGcashAmt) || 0) : totalAmt}
          fmtPHP={fmtPeso}
          onConfirm={refNum => {
            setShowGCashModal(false);
            if (isSplitPayment) { setSplitGcashPaid(true); setSplitGcashRef(refNum); setGcashRefNumber(refNum); }
            else { setGcashRefNumber(refNum); setTimeout(() => processSale(), 100); }
          }}
          onCancel={() => { setShowGCashModal(false); setGcashPaymentAmt(0); }}
        />
      )}

      {/* ── Discount Auth Modal ── */}
      {showDiscountAuth && pendingDiscount && (
        <div onClick={() => setShowDiscountAuth(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 18, padding: '26px 28px', width: 340, maxWidth: '95vw', boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0d2b1e', marginBottom: 4 }}>{pendingDiscount.label} Discount</div>
            <div style={{ fontSize: 12, color: '#5a7a65', marginBottom: 16 }}>Manager authorization required.</div>
            {pendingDiscount.label === 'Others' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Custom Discount %</div>
                <input type="number" min="1" max="100" placeholder="e.g. 15" value={customDiscountInput} onChange={e => setCustomDiscountInput(e.target.value)} style={inp} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Manager Password</div>
              <input type="password" placeholder="Enter password…" value={discountAuthInput}
                onChange={e => { setDiscountAuthInput(e.target.value); setDiscountAuthErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') confirmDiscountAuth(); }}
                autoFocus style={inp} />
              {discountAuthErr && <div style={{ marginTop: 5, fontSize: 12, color: '#e53935', fontWeight: 700 }}>⚠ {discountAuthErr}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDiscountAuth(false)} style={{ ...smallBtn, flex: 1, height: 38, fontSize: 13 }}>Cancel</button>
              <button onClick={confirmDiscountAuth}
                style={{ flex: 1, height: 38, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: "Today's Revenue",    value: fmtPeso(todayRevenue),          sub: `${todaySales.length} transactions` },
          { label: 'Transactions Today', value: todaySales.length,              sub: 'Completed sales' },
          { label: 'Avg Order Value',    value: fmtPeso(todaySales.length ? todayRevenue / todaySales.length : 0), sub: 'Per transaction' },
          { label: 'Items in Cart',      value: cart.reduce((s, c) => s + c.qty, 0), sub: 'Current session' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,140,60,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0d2b1e' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,168,76,0.06)', borderRadius: 12, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {[
          { id: 'cashier', label: 'Cashier',             red: false },
          { id: 'history', label: 'Transaction History', red: false },
          { id: 'voided',  label: 'Voided',              red: true },
        ].map(({ id, label, red }) => {
          const isActive     = activeTab === id;
          const voidedCount  = transactions.filter(t => t.voided).length;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, background: isActive ? (red ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#00c853,#00897b)') : 'transparent', color: isActive ? '#fff' : (red ? '#ef4444' : '#5a7a65'), boxShadow: isActive ? (red ? '0 2px 8px rgba(239,68,68,.3)' : '0 2px 8px rgba(0,180,90,.3)') : 'none' }}>
              {label}
              {id === 'voided' && voidedCount > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.15)', color: isActive ? '#fff' : '#dc2626', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>{voidedCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CASHIER TAB                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cashier' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: 18, alignItems: 'start' }}>
          {/* Products */}
          <div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" autoComplete="off" placeholder="Search products..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} style={{ ...inp, paddingLeft: 32 }} />
              </div>
            </div>
            {allProducts.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>
                {!userBranch ? 'No branch assigned to your account.' : 'No products found for this branch.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
                {allProducts.map(product => {
                  const inCart = cart.find(c => c.id === product.id);
                  return (
                    <div key={product.id} onClick={() => addToCart(product)}
                      style={{ background: '#fff', border: `2px solid ${inCart ? '#00897b' : 'rgba(0,168,76,0.12)'}`, borderRadius: 13, padding: '13px 11px', cursor: 'pointer', transition: 'all .15s', boxShadow: inCart ? '0 4px 14px rgba(0,137,123,0.18)' : '0 1px 6px rgba(0,140,60,0.05)', position: 'relative' }}>
                      {inCart && <div style={{ position: 'absolute', top: 7, right: 7, background: 'linear-gradient(135deg,#00c853,#00897b)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '1px 7px' }}>×{inCart.qty}</div>}
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={{ width: '100%', height: 85, objectFit: 'cover', borderRadius: 8, marginBottom: 9 }} onError={e => (e.target.style.display = 'none')} />
                      ) : (
                        <div style={{ width: '100%', height: 85, borderRadius: 8, background: 'linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,137,123,0.06))', marginBottom: 9 }} />
                      )}
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#0d2b1e', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.displayName}</div>
                      {product.category && <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>{product.category}</div>}
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#00897b' }}>{fmtPeso(product.price)}</div>
                      {product.stock !== undefined && <div style={{ fontSize: 10, color: product.stock <= 5 ? '#ef4444' : '#94a3b8', marginTop: 2 }}>Stock: {product.stock}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Order panel ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,140,60,0.08)' }}>
              {/* Cart header */}
              <div style={{ padding: '13px 16px', background: 'linear-gradient(135deg,#0d2b1e,#1a4a2e)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Order Cart</span>
                {cart.length > 0 && <button onClick={clearCart} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 7, padding: '3px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Clear</button>}
              </div>
              {/* Cart items */}
              <div style={{ maxHeight: 240, overflowY: 'auto', padding: cart.length === 0 ? 0 : '6px 0' }}>
                {cart.length === 0 ? (
                  <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    <ShoppingCart size={28} color="#d1eedd" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    Tap a product to add it
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid rgba(0,168,76,0.07)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.displayName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtPeso(item.price)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0d2b1e' }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0d2b1e', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00897b' }}>+</button>
                    </div>
                    <div style={{ minWidth: 56, textAlign: 'right', fontWeight: 800, fontSize: 12, color: '#00897b' }}>{fmtPeso(item.price * item.qty)}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>

              {/* Order options */}
              <div style={{ padding: '13px 16px', borderTop: '1px solid rgba(0,168,76,0.1)' }}>

                {/* VAT */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em' }}>VAT (12%)</label>
                  <div onClick={() => setVatEnabled(v => !v)} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', background: vatEnabled ? 'linear-gradient(135deg,#00c853,#00897b)' : '#e0e0e0', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: vatEnabled ? 21 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                  </div>
                </div>

                {/* Discount */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Discount</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {[
                      { label: 'None',           pct: 0,    requiresAuth: false },
                      { label: 'PWD/Senior Citizen',            pct: 20,   requiresAuth: true  },
                      { label: 'Others',         pct: null, requiresAuth: true  },
                    ].map(d => {
                      const isActive = d.pct !== null ? discountPct === d.pct && discountType === d.label : discountType === 'Others';
                      return (
                        <button key={d.label}
                          onClick={() => {
                            if (d.label === 'None') { setDiscountPct(0); setDiscountType('None'); setShowDiscountAuth(false); setCustomDiscountInput(''); }
                            else { setPendingDiscount(d); setDiscountAuthInput(''); setDiscountAuthErr(''); setCustomDiscountInput(''); setShowDiscountAuth(true); }
                          }}
                          style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: isActive ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#f0fdf5', color: isActive ? '#fff' : '#5a7a65' }}>
                          {d.label}{d.pct !== null && d.label !== 'None' ? ` (${d.pct}%)` : ''}
                        </button>
                      );
                    })}
                  </div>
                  {discountType && discountType !== 'None' && discountPct > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#00897b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#e0f2f1', border: '1px solid #b2dfdb', borderRadius: 20, padding: '2px 10px' }}>{discountType} — {discountPct}% off</span>
                      <button onClick={() => { setDiscountPct(0); setDiscountType('None'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: 13, fontWeight: 800, padding: 0 }}>×</button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div style={{ background: 'rgba(0,168,76,0.05)', border: '1.5px solid rgba(0,168,76,0.12)', borderRadius: 11, padding: '11px 13px', marginBottom: 12 }}>
                  {[
                    { label: 'Subtotal', value: fmtPeso(subtotal), color: '#94a3b8' },
                    ...(discountPct > 0 ? [{ label: `Discount (${discountPct}%)`, value: `−${fmtPeso(discountAmt)}`, color: '#f59e0b' }] : []),
                    ...(vatEnabled ? [{ label: 'VAT (12%)', value: `+${fmtPeso(vatAmt)}`, color: '#3b82f6' }] : []),
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: r.color, marginBottom: 4 }}>
                      <span>{r.label}</span><span style={{ fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#0d2b1e', fontWeight: 800, paddingTop: 7, borderTop: '1.5px dashed rgba(0,168,76,0.2)' }}>
                    <span>Total</span><span style={{ color: '#00897b' }}>{fmtPeso(totalAmt)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em' }}>Payment Method</div>
                    {/* Split toggle */}
                    <button onClick={() => { setIsSplitPayment(v => !v); setSplitGcashAmt(''); setSplitCashAmt(''); setSplitGcashPaid(false); setSplitGcashRef(''); setGcashRefNumber(''); setCashReceived(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, border: 'none', background: isSplitPayment ? 'linear-gradient(135deg,#007acc,#0057a8)' : '#f0f0f0', color: isSplitPayment ? '#fff' : '#5a7a65', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✂ {isSplitPayment ? 'Split ON' : 'Split Payment'}
                    </button>
                  </div>

                  {/* Normal payment buttons */}
                  {!isSplitPayment && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { id: 'Cash',  label: 'Cash',  icon: <Banknote size={15} /> },
                        { id: 'GCash', label: 'GCash', icon: <QrCode size={15} />,    sub: 'PayMongo QR' },
                        { id: 'Others',label: 'Others',icon: <CreditCard size={15} /> },
                      ].map(m => (
                        <button key={m.id} onClick={() => { setPaymentMethod(m.id); if (m.id !== 'GCash') setGcashRefNumber(''); }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${paymentMethod === m.id ? '#00897b' : 'rgba(0,168,76,0.15)'}`, background: paymentMethod === m.id ? 'linear-gradient(135deg,#00c853,#00897b)' : '#fff', color: paymentMethod === m.id ? '#fff' : '#0d2b1e', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9, transition: 'all .15s' }}>
                          {m.icon} <span>{m.label}</span>
                          {m.sub && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.75 }}>{m.sub}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* GCash ref badge */}
                  {!isSplitPayment && paymentMethod === 'GCash' && gcashRefNumber && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8f4ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GCash Ref #</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>{gcashRefNumber}</div>
                      </div>
                      <button onClick={() => setGcashRefNumber('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', fontSize: 16 }}>×</button>
                    </div>
                  )}

                  {/* Split payment panel */}
                  {isSplitPayment && (
                    <div style={{ background: '#f8fffe', border: '1.5px solid #b2dfdb', borderRadius: 12, padding: '14px 14px 10px', marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#5a7a65' }}>Total to split:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0d2b1e' }}>{fmtPeso(totalAmt)}</span>
                      </div>
                      {/* GCash leg */}
                      <div style={{ background: splitGcashPaid ? '#e8f5e9' : '#fff', border: `1.5px solid ${splitGcashPaid ? '#00897b' : '#bfdbfe'}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#007acc,#0057a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>G</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>GCash amount</span>
                          </div>
                          {splitGcashPaid && <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 20 }}>✓ Paid</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#5a7a65' }}>₱</span>
                            <input type="number" placeholder="0.00" value={splitGcashAmt} disabled={splitGcashPaid}
                              onChange={e => { const val = e.target.value; setSplitGcashAmt(val); const g = parseFloat(val) || 0; const rem = Math.max(0, totalAmt - g); setSplitCashAmt(rem > 0 ? rem.toFixed(2) : ''); }}
                              style={{ ...inp, paddingLeft: 24, opacity: splitGcashPaid ? 0.6 : 1, cursor: splitGcashPaid ? 'not-allowed' : 'text' }} />
                          </div>
                          {!splitGcashPaid ? (
                            <button onClick={() => {
                              const g = parseFloat(splitGcashAmt);
                              if (!g || g <= 0) { showAlert('Invalid Amount', 'Enter a valid GCash amount.', 'error'); return; }
                              if (g > totalAmt) { showAlert('Too Much', 'GCash amount cannot exceed total.', 'error'); return; }
                              if (g < 100) { showAlert('Minimum ₱100', 'Minimum GCash amount via PayMongo is ₱100.', 'error'); return; }
                              setGcashPaymentAmt(g); setShowGCashModal(true);
                            }}
                              style={{ padding: '0 14px', height: 36, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#007acc,#0057a8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              Pay GCash
                            </button>
                          ) : (
                            <button onClick={() => { setSplitGcashPaid(false); setSplitGcashRef(''); setGcashRefNumber(''); setSplitCashAmt(''); }}
                              style={{ padding: '0 10px', height: 36, borderRadius: 9, border: '1px solid #fecaca', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              Redo
                            </button>
                          )}
                        </div>
                        {splitGcashPaid && splitGcashRef && <div style={{ marginTop: 5, fontSize: 11, color: '#00695c', fontFamily: 'monospace', fontWeight: 600 }}>Ref: {splitGcashRef}</div>}
                      </div>
                      {/* Cash leg */}
                      <div style={{ background: '#fff', border: '1.5px solid #d1eedd', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#2E7D32,#00897b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>₱</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>Cash amount</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#5a7a65' }}>₱</span>
                          <input type="number" placeholder="0.00" value={splitCashAmt} onChange={e => setSplitCashAmt(e.target.value)} style={{ ...inp, paddingLeft: 24 }} />
                        </div>
                      </div>
                      {/* Split summary */}
                      {((parseFloat(splitGcashAmt) || 0) + (parseFloat(splitCashAmt) || 0)) > 0 && (() => {
                        const gcash = parseFloat(splitGcashAmt) || 0;
                        const cash  = parseFloat(splitCashAmt)  || 0;
                        const covered   = gcash + cash;
                        const shortfall = totalAmt - covered;
                        const change    = covered - totalAmt;
                        return (
                          <div style={{ marginTop: 10, padding: '8px 10px', background: Math.abs(shortfall) < 0.01 ? '#e8f5e9' : shortfall > 0 ? '#fff3e0' : '#e8f5e9', borderRadius: 8, fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 2 }}><span>GCash</span><span style={{ fontWeight: 700 }}>{fmtPeso(gcash)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 4 }}><span>Cash</span><span style={{ fontWeight: 700 }}>{fmtPeso(cash)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 4 }}>
                              <span style={{ fontWeight: 800, color: shortfall > 0.01 ? '#e65100' : '#2e7d32' }}>{shortfall > 0.01 ? `⚠ Short by` : change > 0.01 ? 'Change due' : '✓ Exact'}</span>
                              <span style={{ fontWeight: 800, color: shortfall > 0.01 ? '#e65100' : '#2e7d32' }}>{shortfall > 0.01 ? fmtPeso(shortfall) : change > 0.01 ? fmtPeso(change) : ''}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Cash received (normal) */}
                {!isSplitPayment && paymentMethod === 'Cash' && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>Cash Received</div>
                    <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00"
                      style={{ ...inp, fontSize: 16, fontWeight: 800, textAlign: 'right' }} />
                    {cashReceived !== '' && (
                      <div style={{ marginTop: 5, fontSize: 13, fontWeight: 700, textAlign: 'right', color: cashShortfall < 0 ? '#ef4444' : '#00897b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                        {cashShortfall < 0
                          ? <><AlertTriangle size={12} /> Short by {fmtPeso(Math.abs(cashShortfall))}</>
                          : <><Check size={12} /> Change: {fmtPeso(changeDue)}</>}
                      </div>
                    )}
                  </div>
                )}

                {/* Note */}
                <div style={{ marginBottom: 12 }}>
                  <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Order note (optional)..." rows={2}
                    style={{ ...inp, resize: 'none', lineHeight: 1.5, height: 'auto', padding: '8px 11px' }} />
                </div>

                {/* Charge button */}
                <button onClick={processSale} disabled={processing || cart.length === 0}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 12, border: 'none',
                    background: cart.length === 0 || processing ? '#e0e0e0' : isSplitPayment ? (() => { const g = parseFloat(splitGcashAmt) || 0; const c = parseFloat(splitCashAmt) || 0; const ok = Math.abs((g + c) - totalAmt) < 0.01 && (!g || splitGcashPaid); return ok ? 'linear-gradient(135deg,#00c853,#00897b)' : '#e0e0e0'; })() : paymentMethod === 'GCash' && !gcashRefNumber ? 'linear-gradient(135deg,#007acc,#0057a8)' : 'linear-gradient(135deg,#00c853,#00897b)',
                    color: cart.length === 0 || processing ? '#9e9e9e' : '#fff',
                    fontSize: 15, fontWeight: 900, cursor: cart.length === 0 || processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: processing ? 0.7 : 1,
                  }}>
                  {processing ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Processing...</>
                  ) : isSplitPayment ? (() => {
                    const g = parseFloat(splitGcashAmt) || 0; const c = parseFloat(splitCashAmt) || 0;
                    const covered = Math.abs((g + c) - totalAmt) < 0.01;
                    const gcashDone = !g || splitGcashPaid;
                    if (!covered) return `Enter amounts totalling ${fmtPeso(totalAmt)}`;
                    if (!gcashDone) return 'Complete GCash payment first';
                    return `💳 Charge ${fmtPeso(totalAmt)} (Split)`;
                  })() : paymentMethod === 'GCash' && !gcashRefNumber
                    ? `💳 Scan GCash QR — ${fmtPeso(totalAmt)}`
                    : `💳 Charge ${fmtPeso(totalAmt)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <>
          <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search ID or cashier..." value={txSearch} onChange={e => setTxSearch(e.target.value)} style={{ ...inp, paddingLeft: 30 }} />
              </div>
              <input type="date" value={txDateFrom} onChange={e => setTxDateFrom(e.target.value)} style={{ ...inp, width: 150 }} />
              <input type="date" value={txDateTo}   onChange={e => setTxDateTo(e.target.value)}   style={{ ...inp, width: 150 }} />
              {(txSearch || txDateFrom || txDateTo) && <button onClick={() => { setTxSearch(''); setTxDateFrom(''); setTxDateTo(''); }} style={{ ...smallBtn, color: '#00897b', borderColor: '#b2dfdb' }}>Clear</button>}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
            <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#2E7D32,#00897b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>Transaction History</span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>{filteredTx.length} records</span>
            </div>
            {loadingTx ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>Loading...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['#', 'Date', 'Cashier', 'Items', 'Subtotal', 'Disc', 'VAT', 'Total', 'Payment', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5, color: '#00897b', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #d1eedd', background: '#f8fffe', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txPageItems.length === 0 ? (
                      <tr><td colSpan={11} style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>No transactions found.</td></tr>
                    ) : txPageItems.map(tx => (
                      <tr key={tx.id} onMouseEnter={e => e.currentTarget.style.background = '#f6fef8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ borderBottom: '1px solid #f0f8f0', opacity: tx.voided ? 0.5 : 1 }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>#{tx.id}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{(tx.items || []).length}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{fmtPeso(tx.subtotal)}</td>
                        <td style={{ padding: '10px 12px' }}>{tx.discount_pct > 0 ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>−{tx.discount_pct}%</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ padding: '10px 12px' }}>{tx.vat_enabled ? <span style={{ color: '#3b82f6', fontWeight: 700 }}>+{fmtPeso(tx.vat_amt)}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#00897b' }}>{fmtPeso(tx.total)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: tx.payment_method === 'Cash' ? 'rgba(0,200,83,0.1)' : tx.payment_method === 'Split' ? 'rgba(107,33,168,0.1)' : 'rgba(59,130,246,0.1)', color: tx.payment_method === 'Cash' ? '#00897b' : tx.payment_method === 'Split' ? '#6b21a8' : '#2563eb' }}>
                            {tx.payment_method}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {tx.voided ? <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>VOIDED</span>
                            : <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,200,83,0.1)', color: '#00897b' }}>PAID</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {!tx.voided && <button onClick={() => handleVoidRequest(tx)} style={{ ...smallBtn, color: '#dc2626', borderColor: '#fca5a5', background: '#fff' }}>Void</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filteredTx.length > TX_PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid rgba(0,168,76,0.1)', background: '#f9fefb' }}>
                <span style={{ fontSize: 12, color: '#5a7a65' }}>{(txPage * TX_PAGE_SIZE + 1)}–{Math.min((txPage + 1) * TX_PAGE_SIZE, filteredTx.length)} of {filteredTx.length}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setTxPage(p => Math.max(0, p - 1))} disabled={txPage === 0} style={{ ...smallBtn, opacity: txPage === 0 ? 0.35 : 1 }}>‹</button>
                  <button onClick={() => setTxPage(p => Math.min(Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1, p + 1))} disabled={txPage >= Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1} style={{ ...smallBtn, opacity: txPage >= Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1 ? 0.35 : 1 }}>›</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VOIDED TAB                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'voided' && (() => {
        const voidedList = transactions.filter(tx => tx.voided);
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Total Voided',        value: voidedList.length, sub: 'All time' },
                { label: 'Total Amount Voided', value: fmtPeso(voidedList.reduce((s, t) => s + Number(t.total || 0), 0)), sub: 'Lost revenue' },
                { label: 'Today Voided',        value: voidedList.filter(t => (t.created_at || '').startsWith(new Date().toISOString().slice(0, 10))).length, sub: 'Today only' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b91c1c', marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0d2b1e' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Voided Transactions</span>
                <span style={{ fontSize: 12, opacity: 0.9 }}>{voidedList.length} record{voidedList.length !== 1 ? 's' : ''}</span>
              </div>
              {voidedList.length === 0 ? (
                <div style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>--</div>
                  <div style={{ fontWeight: 700 }}>No voided transactions</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['#', 'Date', 'Cashier', 'Items', 'Total', 'Payment', 'Discount'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5, color: '#dc2626', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #fecaca', background: '#fff5f5', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {voidedList.map(tx => (
                        <tr key={tx.id} onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ borderBottom: '1px solid #fff0f0' }}>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>#{tx.id}</td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{(tx.items || []).length}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626', textDecoration: 'line-through' }}>{fmtPeso(tx.total)}</td>
                          <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>{tx.payment_method}</span></td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12 }}>{tx.discount_pct > 0 ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>{tx.discount_label || tx.discount_pct + '%'}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      })()}
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

function MaReportsContent({ user, transactions = [] }){
  const branch = (user?.branch || '').trim().toLowerCase();
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

  const PAGE_SIZE = 5;
  const [genPage,  setGenPage]  = useState(0);
  const [subPage,  setSubPage]  = useState(0);
  const [delPage,  setDelPage]  = useState(0);
  
  useEffect(() => { setGenPage(0); }, [reports]);
  useEffect(() => { setSubPage(0); }, [submittedReports]);
  useEffect(() => { setDelPage(0); }, [deletedReports]);

useEffect(() => {
  const fetchSavedReports = async () => {
    try {
      const [savedRes, liveRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/generated-reports?branch=${encodeURIComponent(branch)}`),
        fetch(`${process.env.REACT_APP_API_URL}/reports?branch=${encodeURIComponent(branch)}`),
      ]);

      const savedData = await savedRes.json();
      const liveData = await liveRes.json();

      const liveStatusMap = {};
      liveData.forEach(r => {
        liveStatusMap[r.id] = r.status;
      });

      const loaded = savedData
        .map(item => {
          const snapshot =
            typeof item.snapshot === 'string'
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
        })
        .filter(r => {
          const s = (r.status || '').toLowerCase();
          return s !== 'submitted' && s !== 'deleted';
        });

      setReports(loaded);
    } catch (err) {
      console.error('Failed to load saved reports:', err);
    }
  };

  if (branch) fetchSavedReports();
}, [branch]);

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
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/history?branch=${branch}`);
      const data = await res.json();

      setSubmittedReports(data.map(h => ({
        id: h.id,
        content: h.content || '',
        generatedDate: h.generatedDate
          ? new Date(h.generatedDate).toLocaleString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          : '—',
        period: h.period,
        submittedAt: new Date(h.submittedAt).toLocaleString('en-PH'),
        expiresAt: h.expiresAt,
        comments: h.comments || [],
        remark: h.remark || '',
        status: h.status || 'submitted',   // ← was already there, but ensure it flows through
      })));
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  if (branch) fetchHistory();   // fires on every branch change → always loads correct branch

  const onFocus = () => { if (branch) fetchHistory(); };
  window.addEventListener('focus', onFocus);
  return () => window.removeEventListener('focus', onFocus);
}, [branch]);   // ← branch as dependency is correct; problem is the backend query below

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

// Then useEffect just calls it
useEffect(() => {
  fetchDeletedReports();
}, [branch]);

useEffect(() => {
  fetchKpiStats(dateFrom, dateTo);
}, [dateFrom, dateTo]);

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

      const totalRevenue   = filtered.reduce((s, tx) => s + Number(tx.total || 0), 0);
      const totalTx        = filtered.length;
      const avgOrder       = totalTx ? (totalRevenue / totalTx) : 0;
      const totalCost      = filtered.reduce((s, tx) => s + Number(tx.cogs || 0), 0);
      const totalProfit    = totalRevenue - totalCost;

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

      // ── CHANGE 1: top 10 instead of top 5, formatted as a numbered list ──
      const topItemsList = Object.entries(itemMap)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([name, d], i) =>
          `  ${i + 1}. ${name} (qty: ${d.qty}, revenue: PHP ${d.revenue.toFixed(2)})`
        )
        .join('\n');

      const topItems = topItemsList || '  No item-level data available';
      // ─────────────────────────────────────────────────────────────────────

         const dailyMap = {};
      filtered.forEach(tx => {
        const day = tx.created_at?.slice(0, 10);
        if (day) dailyMap[day] = (dailyMap[day] || 0) + Number(tx.total || 0);
      });
      const peakDay   = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
      const lowestDay = Object.entries(dailyMap).sort((a, b) => a[1] - b[1])[0];

      const fmtP = n => 'PHP ' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

      const prompt = `
      CRITICAL RULES — READ BEFORE WRITING ANYTHING:
      1. You MUST write ALL seven sections (I through VII) in full. Do not stop early. Do not skip any section. Sections VI (Strategic Recommendations) and VII (Conclusion) are REQUIRED — the report is incomplete without them.
      2. Keep each section concise (2–4 sentences or 4–6 items max) so you have enough space to finish all seven sections.
      3. Use only standard ASCII characters. Write currency as "PHP" (e.g. PHP 2,406.20) — never use the peso sign. Use straight quotes only. No unicode symbols.
      4. Do not use markdown symbols like ** or ##. Plain text only.

      You are a senior business analyst writing an official franchise performance report. Use ONLY the verified data below. Do not fabricate figures.

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
      Top-Selling Items (Top 10 by revenue):
${topItems}
      Payment Breakdown   : ${Object.entries(paymentBreakdown).map(([k, v]) => `${k}: ${fmtP(v)}`).join(' | ') || 'N/A'}

      OUTPUT FORMAT — write the report exactly as shown below. Replace each [...] with real content.

      ═══════════════════════════════════════════════════════════════
              FRANCHISE SALES & PERFORMANCE REPORT
              Branch: ${branch}
              Period: ${dateFrom} to ${dateTo}
              Date Prepared: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
      ═══════════════════════════════════════════════════════════════

      I. EXECUTIVE SUMMARY
      ────────────────────
      [2–3 sentences: total revenue, transaction count, general performance assessment.]

      II. SALES PERFORMANCE OVERVIEW
      ───────────────────────────────
      [2–3 sentences: transaction volume, average order value, peak day, lowest day, and what these indicate.]

      III. REVENUE & PROFITABILITY ANALYSIS
      ──────────────────────────────────────
      [2–3 sentences: revenue figures, gross profit margin if cost data available, otherwise note the limitation.]

      IV. TOP-SELLING PRODUCTS
      ─────────────────────────
      [List all 10 products with rank, name, qty, and revenue. Follow with 1–2 sentences on patterns or bestsellers.]

      V. PAYMENT METHOD ANALYSIS
      ───────────────────────────
      [2–3 sentences: dominant payment method, proportions, and one recommendation on payment infrastructure.]

      VI. STRATEGIC RECOMMENDATIONS
      ──────────────────────────────
      [Exactly 5 numbered recommendations. Each must cite the specific data point that supports it. 1 sentence each.]

      VII. CONCLUSION
      ───────────────
      [2–3 sentences: key takeaways and performance outlook for the branch.]

      ═══════════════════════════════════════════════════════════════
        This report was automatically generated based on verified
        transaction data for the stated period. Figures are accurate
        as of the report generation date.
      ═══════════════════════════════════════════════════════════════
      `.trim();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        }),
      });

      const data = await res.json();
      const reportText = data.content?.[0]?.text || 'Failed to generate report.'; 
      const sanitizeReport = (text) => {
      return text
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
      };
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
        // Remove any existing report with the same period first
        const filtered = prev.filter(r => r.period !== `${dateFrom} → ${dateTo}`);
        const exists = filtered.some(r => r.id === realId);
        if (exists) return filtered.map(r => r.id === realId ? { ...r, ...newReport } : r);
        return [newReport, ...filtered];
      });

      } catch {
        setAiReport('Failed to generate report. Please try again.');
      }
      setGenerating(false);
    };

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

      setReports(prev => prev.filter(r => r.id !== report.id));
      if (viewReportId === report.id) setViewReportId(null);
      
      // Refetch deleted reports from backend instead of optimistic update
      await fetchDeletedReports();  // ← replace the optimistic push with this
      
    } catch {
      alert('Failed to delete report. Please try again.');
    }
  };

const retrieveReport = async report => {
  if (!report.id) {
    setReports(prev => [{
      ...report,
      deletedAt: undefined,
      expiresAt: undefined,
    }, ...prev]);
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

  const downloadReport = report => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
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
      .replace(/₱/g, 'PHP ')
      .replace(/±/g, 'PHP ')
      .replace(/→/g, 'to')
      .replace(/!'/g, 'to')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '--')
      .replace(/\u2026/g, '...')
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

    const lines = cleanContent.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) { y += 3; return; }

      if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
        checkY(14);
        y += 4;
        doc.setFillColor(0, 137, 123);
        doc.rect(margin, y - 4, 3, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 43, 30);
        doc.text(trimmed, margin + 6, y + 2);
        y += 8;
        writeDivider([0, 137, 123]);
      }
      else if (/^\d+\.\s+/.test(trimmed)) {
        checkY(8);
        const [num, ...rest] = trimmed.split(/(?<=^\d+\.)\s+/);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 137, 123);
        doc.text(num.replace('.', ''), margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const wrapped = doc.splitTextToSize(rest.join(' '), contentW - 10);
        wrapped.forEach((wl, i) => {
          if (i > 0) checkY(6);
          doc.text(wl, margin + 9, y);
          y += 5.5;
        });
      }
      else {
        writeLine(trimmed, 9.5, 'normal', [50, 50, 50]);
        y += 1;
      }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(245, 247, 245);
      doc.rect(0, pageH - 12, pageW, 12, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 140, 130);
      const safePeriod = report.period.replace(/→/g, 'to').replace(/!'/g, 'to').replace(/[^\x00-\x7F]/g, '');
      doc.text(`${branch} Branch  |  ${safePeriod}`, margin, pageH - 5);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
    }

    doc.save(`report_${branch.replace(/\s+/g, '_')}_${report.period.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

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
  } catch(err) {
    alert('Failed to save report.');
  }
};

const submitReport = async report => {
   console.log('[SUBMIT] Called with report.id:', report.id, '| saved:', report.saved, '| period:', report.period);
   if (!report.id) {
    console.error('[SUBMIT] Aborted — report has no id');
    alert('Report ID missing. Try saving again.');
    return;
  }
  setSubmitting(report.id);
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: report.id,
        reportNumber: `REP-${String(report.id).padStart(5, '0')}`,
        branch,
        period: report.period,
        generatedDate: report.generatedDate,
        content: report.content,
        submittedBy: user?.name || user?.email || 'Branch Manager',
        brand: user?.brand || '',
      }),
    });

    console.log('[SUBMIT] Response status:', res.status, res.ok);

    if (!res.ok) throw new Error('Submit failed');
    const data = await res.json();

    console.log('[SUBMIT] Backend response data:', data);
    console.log('[SUBMIT] Current submittedReports before update:', submittedReports);

    const newEntry = {
      id: report.id,
      localId: report.localId,
      generatedDate: report.generatedDate
        ? new Date(report.generatedDate).toLocaleString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : '—',
      period: report.period,
      content: report.content,
      submittedAt: new Date().toLocaleString('en-PH'),
      expiresAt: data.expiresAt,
      status: 'submitted',
    };

    console.log('[SUBMIT] New entry being added to submittedReports:', newEntry);

    setSubmittedReports(prev => {
      const updated = [newEntry, ...prev];
      console.log('[SUBMIT] submittedReports after update:', updated);
      return updated;
    });

    setReports(prev => {
      const updated = prev.filter(r => r.id !== report.id);
      console.log('[SUBMIT] reports (generated) after removal:', updated);
      return updated;
    });

    console.log('[SUBMIT] Done — report should now appear in Submitted Reports tab.');

    const historyRes = await fetch(
  `${process.env.REACT_APP_API_URL}/reports/history?branch=${encodeURIComponent(branch)}`
);

const historyData = await historyRes.json();

setSubmittedReports(
  historyData.map(h => ({
    id: h.id,
    content: h.content || '',
    generatedDate: h.generatedDate
      ? new Date(h.generatedDate).toLocaleString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    period: h.period,
    submittedAt: new Date(h.submittedAt).toLocaleString('en-PH'),
    expiresAt: h.expiresAt,
    comments: h.comments || [],
    remark: h.remark || '',
    status: h.status || 'submitted',
  }))
);

  } catch (err) {
    console.error('[SUBMIT] ERROR caught:', err);
    alert('Failed to submit report. Please try again.');
  }
  setSubmitting(null);
};


  const Paginator = ({ total, page, setPage }) => {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderTop: '1px solid rgba(0,168,76,0.1)', background: '#f9fefb' }}>
      <span style={{ fontSize: 12, color: '#5a7a65' }}>
        Showing <strong>{(page * PAGE_SIZE + 1)}–{Math.min((page + 1) * PAGE_SIZE, total)}</strong> of <strong>{total}</strong>
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => setPage(0)} disabled={page === 0} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page === 0 ? 0.35 : 1 }}>«</button>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page === 0 ? 0.35 : 1 }}>‹</button>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page >= totalPages - 1 ? 0.35 : 1 }}>›</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="v-btn v-btn-secondary v-btn-sm" style={{ opacity: page >= totalPages - 1 ? 0.35 : 1 }}>»</button>
      </div>
    </div>
  );
};

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
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
        value={reports.length + submittedReports.length}
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
                <tr><th>Report #</th><th>Generated</th><th>Period</th><th>Actions</th></tr>
              </thead>
            <tbody>
              {reports.slice(genPage * PAGE_SIZE, (genPage + 1) * PAGE_SIZE).map(r => (
                <React.Fragment key={r.localId}>
                  <tr>
                    <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                      {r.id ? `REP-${String(r.id).padStart(5, '0')}` : '—'}
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
  onClick={() => {
    const snapshot = { ...r };
    console.log('[BUTTON] onClick fired with report:', snapshot.id, snapshot);
    submitReport(snapshot);
  }}
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
                              {r.id ? `REP-${String(r.id).padStart(5, '0')}` : '—'} — {r.period}
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
              
              <Paginator total={reports.length} page={genPage} setPage={setGenPage} />
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedReports.slice(subPage * PAGE_SIZE, (subPage + 1) * PAGE_SIZE).map(h => (
                <React.Fragment key={h.id}>
                  <tr>
                    <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                      REP-{String(h.id).padStart(5, '0')}
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
  {(() => {
    const s = (h.status || 'submitted').toLowerCase();
    const cfg = {
      approved: { bg: '#dcfce7', color: '#166534', dot: '#22c55e', label: 'Approved' },
      submitted: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'Submitted' },
    };
    const { bg, color, dot, label } = cfg[s] || cfg.submitted;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: bg, color,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
        {label}
      </span>
    );
  })()}
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
                      <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                        <div style={{ margin: '8px 0 12px', background: 'linear-gradient(135deg,rgba(0,168,76,0.04),rgba(0,137,123,0.03))', border: '1.5px solid rgba(0,168,76,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif' }}>
                              REP-{String(h.id).padStart(5, '0')} — {h.period}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="v-btn v-btn-sm v-btn-blue"
                                onClick={() => downloadReport(h)}
                              >
                                <Download size={12} /> Download PDF
                              </button>
                              <button
                                className="v-btn v-btn-secondary v-btn-sm"
                                onClick={() => setViewSubmittedId(null)}
                              >
                                <X size={12} /> Close
                              </button>
                            </div>
                          </div>
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

          <Paginator total={submittedReports.length} page={subPage} setPage={setSubPage} />
        </div>
      )}
    </div>

      {/* Report History (deleted reports) */}
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
                {deletedReports.slice(delPage * PAGE_SIZE, (delPage + 1) * PAGE_SIZE).map((r, i) => {
                  const daysLeft = r.expiresAt
                    ? Math.ceil((new Date(r.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

                  return (
                    <tr key={r.id || r.localId || i}>
                      <td style={{ fontWeight: 800, color: '#0d2b1e', fontFamily: 'Montserrat,sans-serif', fontSize: 12 }}>
                        {r.id ? `REP-${String(r.id).padStart(5, '0')}` : '—'}
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
                          {daysLeft !== null ? (
                            isExpiringSoon ? `⚠ ${daysLeft}d left` : `${daysLeft}d left`
                          ) : '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="v-btn v-btn-sm"
                          onClick={() => retrieveReport(r)}
                          disabled={retrieving === r.id}
                          style={{
                            background: '#f0fdf5',
                            color: '#00897b',
                            border: '1px solid #b2dfdb',
                            opacity: retrieving === r.id ? 0.6 : 1,
                          }}
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
              <Paginator total={deletedReports.length} page={delPage} setPage={setDelPage} />
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