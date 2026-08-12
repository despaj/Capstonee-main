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
  ArrowUpRight, ArrowDownRight, BarChart, RefreshCw, Eye, Clock, Info,
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
const MANAGER_PASSWORD = 'Admin123';

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
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

// ─── BrandCard (Screen 1) ──────────────────────────────────────────────────────
function BrandCard({ brand, branchCount, itemCount, lowCount, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor:"pointer", background:C.white, border:"1px solid rgba(0,168,76,0.15)",
        borderRadius:18, padding:"22px 20px", boxShadow:"0 2px 14px rgba(0,140,60,0.06)",
        transition:"transform .15s, box-shadow .15s",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(0,140,60,0.15)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 14px rgba(0,140,60,0.06)"; }}
    >
      <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:"0 4px 14px rgba(0,180,90,0.28)" }}>
        <StoreIcon size={22} color="#fff"/>
      </div>
      <div style={{ fontSize:16, fontWeight:800, color:C.ink, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{brand.name}</div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{branchCount} branch{branchCount!==1?"es":""}</div>
      <div style={{ display:"flex", gap:8 }}>
        <div style={{ flex:1, background:C.greenLt, borderRadius:10, padding:"8px 10px" }}>
          <div style={{ fontSize:17, fontWeight:800, color:C.greenDk }}>{itemCount}</div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Items</div>
        </div>
        <div style={{ flex:1, background:lowCount>0?C.warnBg:C.okBg, borderRadius:10, padding:"8px 10px" }}>
          <div style={{ fontSize:17, fontWeight:800, color:lowCount>0?C.warn:C.ok }}>{lowCount}</div>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Low Stock</div>
        </div>
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
          onChange={e=>{setQuery(e.target.value);setOpen(true);}} 
          onFocus={()=>setOpen(true)}
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

function DeleteConfirmModal({ target, onConfirm, onClose, deleting = false }) {
  return (
    <div onClick={deleting ? undefined : onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Trash2 size={22} color="#dc2626"/>
        </div>
        <h2 style={{ textAlign:"center", fontSize:17, fontWeight:800, color:C.ink, marginBottom:8 }}>Delete item?</h2>
        <p style={{ textAlign:"center", fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:16 }}>
          You are about to delete <strong>"{target.name}"</strong>{target.branch ? <> from <strong>{target.branch}</strong></> : null}.
        </p>
        {target.ingredientCount > 0 && (
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#c2410c", textAlign:"center", marginBottom:16 }}>
            ⚠ This item has {target.ingredientCount} linked ingredient{target.ingredientCount!==1?"s":""}.
          </div>
        )}
        <p style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginBottom:20 }}>You can recover this from Delete History.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button type="button" onClick={onClose} disabled={deleting} style={{ padding:"9px 22px", borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.muted, fontSize:13, fontWeight:700, cursor:deleting?"not-allowed":"pointer", fontFamily:"inherit", opacity:deleting?0.5:1 }}>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={deleting} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#dc2626,#ef4444)", color:"#fff", fontSize:13, fontWeight:700, cursor:deleting?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(220,38,38,0.35)", opacity:deleting?0.7:1 }}>
            {deleting ? <RefreshCw size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={14}/>}
            {deleting ? "Deleting…" : "Delete item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete History Panel ─────────────────────────────────────────────────────
function InventoryDeleteHistoryPanel({ history, onRestore, restoringId, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

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
                  <button onClick={() => onRestore(entry)} disabled={restoringId === entry.id}
                   style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:`1.5px solid ${C.green}`, background:"#e0f2f1", color:C.greenDk, fontSize:12, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap",
                      opacity: restoringId === entry.id ? 0.7 : 1, cursor: restoringId === entry.id ? "not-allowed" : "pointer" }}>
                    {restoringId === entry.id
                      ? <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>
                      : <RestoreIcon/>}
                    {restoringId === entry.id ? "Restoring…" : "Restore"}
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
function InventoryActivityLogPanel({ log, onClose }) {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = log.filter(entry => {
    if (typeFilter !== "all" && entry.action !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!entry.itemName?.toLowerCase().includes(q) &&
          !(entry.performedBy||"").toLowerCase().includes(q) &&
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
              <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.itemName}</div>
                {entry.changes && <div style={{ fontSize:10, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.changes}</div>}
              </div>
              <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.branch || "—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.performedBy || "System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.timestamp ? fmtTs(entry.timestamp) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── InventoryTable ───────────────────────────────────────────────────────────
function InventoryTable({ items, onEdit, onRequestDelete, deletingId, page, setPage }) {
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
function VoidModal({ show, tx, onClose, onConfirm }) {
  const [pw,  setPw]  = useState('');
  const [err, setErr] = useState('');

  const handleConfirm = () => {
    if (!pw) { setErr('Please enter the manager password.'); return; }
    if (pw !== MANAGER_PASSWORD) { setErr('Incorrect manager password.'); return; }
    onConfirm(tx); setPw(''); setErr('');
  };
  const handleClose = () => { setPw(''); setErr(''); onClose(); };
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
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }} placeholder="Enter manager password to authorize"
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${err ? '#fca5a5' : '#b2dfdb'}`, background: '#f0fdf5', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            {err && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 5, fontWeight: 600 }}>{err}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleConfirm} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Void Transaction</button>
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`);
      const d   = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch { setTransactions([]); }
    finally { setLoadingTx(false); }
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
  const confirmDiscountAuth = () => {
    if (discountAuthInput !== MANAGER_PASSWORD) {
      setDiscountAuthErr('Incorrect manager password.');
      return;
    }
    if (pendingDiscount.label === 'Others') {
      const pct = parseFloat(customDiscountInput);
      if (!pct || pct <= 0 || pct > 100) {
        setDiscountAuthErr('Enter a valid discount % (1–100).');
        return;
      }
      setDiscountPct(pct);
      setDiscountType('Others');
    } else {
      setDiscountPct(pendingDiscount.pct);
      setDiscountType(pendingDiscount.label);
    }
    setShowDiscountAuth(false);
    setDiscountAuthInput('');
    setDiscountAuthErr('');
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${tx.id}/void`, { method: 'PUT' });
      const d   = await res.json();
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
      <VoidModal show={showVoidModal} tx={voidTarget}
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
      {totalPages > 1 && <Pagination page={page} setPage={setPage} total={sorted.length} pageSize={PAGE_SIZE}/>}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MenuInventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Super Admin";
  const userBranch = user?.branch || "";
  const userName   = user?.name   || "Unknown";

  const brandList   = propBrands.length > 0 ? propBrands : [];
  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches||[]).forEach(br => {
      const name = typeof br==="string"?br:br.name;
      if (!out.find(x=>x.branch===name)) out.push({ brand:b.name, branch:name });
    }));
    return out;
  }, [brandList]);

  // ── Screen state: "brands" (card grid) → "inventory" (table + filters) ───────
  // Non-admin users only have one branch, so they skip straight to inventory.
  const [screen, setScreen] = useState(isAdmin ? "brands" : "inventory");

  // ── Core state ──────────────────────────────────────────────────────────────
  const [inventory,       setInventory]       = useState([]);
  const [stockItems,      setStockItems]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [filterBrand,     setFilterBrand]     = useState(null);
  const [filterBranch,    setFilterBranch]    = useState(null);
  const [filterCategory,  setFilterCategory]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingItem,     setEditingItem]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page,            setPage]            = useState(0);

  const [saving,          setSaving]          = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);
  const [restoringId,     setRestoringId]     = useState(null);
  const [toast,           setToast]           = useState(null);
  const showToast = (type, title, message) => setToast({ type, title, message });

  // ── History / log state ─────────────────────────────────────────────────────
  const [deleteHistory,     setDeleteHistory]     = useState([]);
  const [showDeleteHistory, setShowDeleteHistory] = useState(false);
  const [activityLog,       setActivityLog]       = useState([]);
  const [showActivityLog,   setShowActivityLog]   = useState(false);

  // ── Ingredient picker state ─────────────────────────────────────────────────
  const [ingSearch,   setIngSearch]   = useState("");
  const [ingQty,      setIngQty]      = useState("1");
  const [ingUnit,     setIngUnit]     = useState("");
  const [ingPicked,   setIngPicked]   = useState(null);
  const [ingDropOpen, setIngDropOpen] = useState(false);
  const ingRef = useRef(null);
  
const emptyForm = useCallback(() => ({
  name:"", category:"", branch:isAdmin?"":userBranch,
  cost:"", stock:0, minStock:0, price:"", ingredients:[], image_url:"",
}), [isAdmin, userBranch]);
  const excelRef = useRef(null);

  const [formData,    setFormData]    = useState(emptyForm);
  const [formBrandId, setFormBrandId] = useState("");

  // ── Category helpers ────────────────────────────────────────────────────────
  const inventoryCategories = useMemo(() => {
    if (filterBrand) {
      const brand = brandList.find(b => b.id === filterBrand);
      return brand?.categories || [];
    }
    return [...new Set(brandList.flatMap(b => b.categories || []).filter(Boolean))].sort();
  }, [filterBrand, brandList]);

  const formBrand = useMemo(() => {
    if (!formData.branch) return null;
    return brandList.find(b =>
      (b.branches || []).some(br => (typeof br === "string" ? br : br.name) === formData.branch)
    );
  }, [formData.branch, brandList]);

  const [formCategories, setFormCategories] = useState([]);
  useEffect(() => {
    const cats = formBrand?.categories || inventoryCategories;
    setFormCategories(cats.length ? cats : []);
  }, [formBrand, inventoryCategories]);

  useEffect(() => {
    const fn = e => { if(ingRef.current && !ingRef.current.contains(e.target)) setIngDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Fetch helpers ───────────────────────────────────────────────────────────
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

  const fetchStockItems = useCallback(async (branch) => {
    try {
      const effectiveBranch = !isAdmin ? userBranch : (branch || "");
      const q = effectiveBranch ? `?branch=${encodeURIComponent(effectiveBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
      const d   = await res.json();
      setStockItems(Array.isArray(d) ? d : []);
    } catch { setStockItems([]); }
  }, [isAdmin, userBranch]);

  const fetchDeleteHistory = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/inventory-delete-history`);
      const data = await res.json();
      setDeleteHistory(Array.isArray(data) ? data.map(row => ({
        id:               row.id,
        inventory_data:   row.inventory_data,
        ingredients_data: row.ingredients_data || [],
        deleted_at:       row.deleted_at,
        deleted_by:       row.deleted_by,
      })) : []);
    } catch (err) { console.error("Failed to fetch inventory delete history:", err); }
  }, []);

const fetchActivityLog = useCallback(async () => {
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/menu-activity-log`);
    const data = await res.json();
    setActivityLog(Array.isArray(data) ? data.map(row => ({
      id: row.id, action: row.action,
      itemName: row.item_name ?? row.itemName,
      performedBy: row.performed_by ?? row.performedBy,
      branch: row.branch,
      performedBy: row.performed_by ?? row.performedBy,
      role: row.role,
      changes: row.changes,
      location: row.location,
      timestamp: row.created_at ?? row.timestamp,
    })) : []);
  } catch (err) {
    console.error("Failed to fetch menu activity log:", err);
  }
}, []);

useEffect(() => {
  fetchActivityLog();
}, [fetchActivityLog]);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) { fetchInventory(userBranch); return; }
    fetchInventory(filterBranch||undefined);
  }, [filterBranch, isAdmin, userBranch, fetchInventory]);

  useEffect(() => { fetchStockItems(); }, [fetchStockItems]);
  useEffect(() => { fetchDeleteHistory(); fetchActivityLog(); }, [fetchDeleteHistory, fetchActivityLog]);
  useEffect(() => { setPage(0); }, [searchQuery, filterBrand, filterBranch, filterCategory, filterStatus]);

  const refetch = () => fetchInventory(isAdmin ? filterBranch||undefined : userBranch);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q) && !i.branch.toLowerCase().includes(q)) return false;
      if (filterBranch) { if (i.branch!==filterBranch) return false; }
      else if (filterBrand) {
        const b = brandList.find(x=>x.id===filterBrand);
        if (b) { const names=(b.branches||[]).map(br=>typeof br==="string"?br:br.name); if (!names.includes(i.branch)) return false; }
      }
      if (filterCategory && i.category!==filterCategory) return false;
      if (filterStatus==="low" && Number(i.stock) >  Number(i.min_stock)) return false;
      if (filterStatus==="ok"  && Number(i.stock) <= Number(i.min_stock)) return false;
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

  // ── Computed cost from ingredients ──────────────────────────────────────────
  const computedCost = useMemo(() => {
    if (!formData.ingredients || formData.ingredients.length === 0) return 0;
    return formData.ingredients.reduce((total, ing) => {
      const stock = stockItems.find(s => s.id === ing.stock_item_id);
      if (!stock) return total;
      return total + (parseFloat(stock.cost_per_unit||0) * parseFloat(ing.qty_required||0));
    }, 0);
  }, [formData.ingredients, stockItems]);

  useEffect(() => {
    const cost  = computedCost.toFixed(2);
    const price = cost > 0 ? (parseFloat(cost) * (1 + DEFAULT_PROFIT_MARGIN / 100)).toFixed(2) : "";
    setFormData(prev => ({ ...prev, cost, price }));
  }, [computedCost]);

  const lowCount   = filteredItems.filter(i => Number(i.stock) <= Number(i.min_stock)).length;
  const totalValue = filteredItems.reduce((s,i) => s+(i.price||0)*(i.stock||0), 0);

const handleAddItem = async e => {
  e.preventDefault();
  const branch    = isAdmin ? formData.branch : userBranch;
  const duplicate = findDuplicate(formData.name, branch, inventory);
  if (duplicate) { showToast("error", "Duplicate item", `"${duplicate.name}" already exists in this branch.`); return; }
  
  setSaving(true);
  const coords = await getBrowserLocation();
  const payload = {
    ...formData,
    branch,
    min_stock: formData.minStock,
    performed_by: userName,
    performed_by_role: user?.role || "Unknown",
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
   try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        if (formData.ingredients && formData.ingredients.length > 0) {
          await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              ingredients: formData.ingredients.map(ing => ({
                ingredient_id: ing.stock_item_id,
                quantity:      ing.qty_required,
                unit:          ing.unit,
              }))
            })
          });
        }
        await refetch();
        await fetchActivityLog();
        setShowAddModal(false); setFormData(emptyForm()); resetIngPicker();
      showToast("success", "Item added", `"${formData.name}" was added.`);
      } else showToast("error", "Failed to add item", d.error || "Something went wrong.");
    } catch { showToast("error", "Failed to add item", "Something went wrong. Please try again."); }
    finally { setSaving(false); }
  };

const handleEditItem = async e => {
  e.preventDefault();
  const branch     = isAdmin ? formData.branch : userBranch;
  const otherItems = inventory.filter(i => i.id !== editingItem.id);
  const duplicate  = findDuplicate(formData.name, branch, otherItems);
  if (duplicate) { showToast("error", "Duplicate item", `"${duplicate.name}" already exists in this branch.`); return; }
  setSaving(true);
  const coords = await getBrowserLocation();
  const payload = {
    ...formData,
    branch,
    min_stock: formData.minStock,
    performed_by: userName,
    performed_by_role: user?.role || "Unknown", 
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}/ingredients`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            ingredients: (formData.ingredients||[]).map(ing => ({
              ingredient_id: ing.stock_item_id,
              quantity:      ing.qty_required,
              unit:          ing.unit,
            }))
          })
        });

        // Build human-readable changes string
        const changed = [];
        if (String(editingItem.stock)     !== String(formData.stock))    changed.push(`stock: ${editingItem.stock} → ${formData.stock}`);
        if (String(editingItem.min_stock) !== String(formData.minStock)) changed.push(`min: ${editingItem.min_stock} → ${formData.minStock}`);
        if (String(editingItem.price)     !== String(formData.price))    changed.push(`price: ₱${editingItem.price} → ₱${formData.price}`);
        if (editingItem.category          !== formData.category)         changed.push(`category: ${editingItem.category} → ${formData.category}`);
        const changesStr = changed.length > 0 ? changed.join("; ") : "Minor update";

        await refetch();
        await fetchActivityLog();
        setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); resetIngPicker();
      showToast("success", "Item updated", `"${formData.name}" was saved.`);
      } else showToast("error", "Failed to update item", d.error || "Something went wrong.");
    } catch { showToast("error", "Failed to update item", "Something went wrong. Please try again."); }
    finally { setSaving(false); }
  };

const handleDeleteItem = async id => {
  setDeletingId(id);
  try {
    const coords = await getBrowserLocation();
   const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deleted_by: userName,
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      }),
    });
    const d = await res.json();
    if (d.success) {
      await refetch();
      await fetchDeleteHistory();
      await fetchActivityLog();
      showToast("success", "Item deleted", "The item was removed.");
        } else showToast("error", "Failed to delete", d.error || "Something went wrong.");
      } catch { showToast("error", "Failed to delete", "Something went wrong. Please try again."); }
      finally { setDeletingId(null); }
};

const handleRestore = async (entry) => {
  setRestoringId(entry.id);
  try {
    const d    = entry.inventory_data;
    const ings = entry.ingredients_data || [];
    const coords = await getBrowserLocation();

    const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        name:      d.name,
        category:  d.category,
        branch:    d.branch,
        brand:     d.brand,
        stock:     d.stock,
        min_stock: d.min_stock,
        cost:      d.cost,
        price:     d.price,
        performed_by: userName,
        performed_by_role: user?.role || "Unknown",
        latitude:  coords?.latitude,
        longitude: coords?.longitude,
        restored:  true,
      }),
    });
    const result = await res.json();
    if (result.success) {
      if (ings.length > 0) {
        await fetch(`${process.env.REACT_APP_API_URL}/inventory/${result.item.id}/ingredients`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            ingredients: ings.map(ing => ({
              ingredient_id: ing.stock_item_id,
              quantity:      ing.qty_required,
              unit:          ing.unit,
            })),
          }),
        });
      }
      await fetch(`${process.env.REACT_APP_API_URL}/inventory-delete-history/${entry.id}`, { method:"DELETE" });
      await refetch();
      await fetchDeleteHistory();
      await fetchActivityLog();
      showToast("success", "Item restored", `"${d.name}" is back with ${ings.length} ingredient(s).`);
    } else showToast("error", "Failed to restore", result.error || "Something went wrong.");
  } catch { showToast("error", "Failed to restore", "Something went wrong. Please try again."); }
  finally { setRestoringId(null); }
};

  const openEditModal = item => {
    setEditingItem(item);
    setFormData({
      name:item.name, category:item.category, branch:item.branch,
      cost:item.cost||"", stock:item.stock, minStock:item.min_stock, price:item.price,
      image_url: item.image_url || "",
      ingredients: (item.ingredients||[]).map(ing => ({
        stock_item_id: ing.stock_item_id || ing.id,
        name:          ing.name,
        qty_required:  ing.qty_required,
        unit:          ing.unit,
      })),
    });
    fetchStockItems(item.branch);
    setShowEditModal(true);
  };

  // ── Input handlers ──────────────────────────────────────────────────────────
  const handleInputChange = e => {
    let { name, value } = e.target;
    if (name === "name") value = value.replace(/\b\w/g, c => c.toUpperCase());
    setFormData(p => ({ ...p, [name]: value }));
  };

  const resetIngPicker = () => { setIngSearch(""); setIngQty("1"); setIngUnit(""); setIngPicked(null); setIngDropOpen(false); };

  const addIngredient = () => {
    if (!ingPicked) return;
    if ((formData.ingredients||[]).find(x=>x.stock_item_id===ingPicked.id)) { alert("Already added"); return; }
    setFormData(f => ({
      ...f, ingredients:[...(f.ingredients||[]), {
        stock_item_id: ingPicked.id,
        name:          ingPicked.name,
        qty_required:  parseFloat(ingQty)||1,
        unit:          ingUnit||ingPicked.unit,
      }],
    }));
    resetIngPicker();
  };

  const removeIngredient = idx => setFormData(f=>({...f, ingredients:f.ingredients.filter((_,i)=>i!==idx)}));
  const updateIngQty     = (idx,qty) => setFormData(f=>({...f, ingredients:f.ingredients.map((ing,i)=>i===idx?{...ing,qty_required:parseFloat(qty)||0}:ing)}));

  const ingFiltered = stockItems.filter(s => {
    const matchesSearch = !ingSearch || s.name.toLowerCase().includes(ingSearch.toLowerCase());
    const matchesBranch = formData.branch && s.branch === formData.branch;
    return matchesSearch && matchesBranch;
  });

  // ── Excel import ─────────────────────────────────────────────────────────────
  const importExcel = e => {
    const file = e.target.files[0];
    const toTitleCase = str => str.replace(/\b\w/g, c => c.toUpperCase());
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb    = XLSX.read(ev.target.result, { type:"array" });
      const items = [];
      wb.SheetNames.forEach(sheetName => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:"" });
        rows.forEach(row => {
          const name = toTitleCase(String(row.name || row.Name || row["ITEM NAME"] || "").trim());
          if (!name) return;
          const category  = toTitleCase(String(row.category || row.Category || "Other").trim());
          const cost      = parseFloat(row.cost  || row.Cost  || 0) || 0;
          const rawPrice  = parseFloat(row.price || row.Price || 0) || 0;
          const price     = rawPrice > 0 ? rawPrice : (cost > 0 ? parseFloat((cost * 1.4).toFixed(2)) : 0);
          const stock     = parseInt(row.stock     || row.Stock     || 0) || 0;
          const minStock  = parseInt(row.min_stock || row["Min Stock"] || 0) || 0;
          const branch    = String(row.branch || row.Branch || "").trim();
          const rawIng    = String(row.ingredients || row.Ingredients || "").trim();
          const ingredients = rawIng
            ? rawIng.split("|").map(seg => {
                const [ingName, qty, unit] = seg.split(":").map(s => s.trim());
                return ingName ? { name:ingName, qty_required:parseFloat(qty)||1, unit:unit||"" } : null;
              }).filter(Boolean)
            : [];
          items.push({ name, category, branch:branch||"Unknown", cost, stock, min_stock:minStock, price, ingredients });
        });
      });

      let currentInventory = [...inventory];
      let saved = 0, skipped = 0;
      const skippedNames = [];

      for (const item of items) {
        const combined  = [...currentInventory];
        const duplicate = findDuplicate(item.name, item.branch, combined);
        if (duplicate) { skipped++; skippedNames.push(`${item.name} (${item.branch})`); continue; }

        try {
          const { ingredients, ...itemData } = item;
          const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
            method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(itemData)
          });
          const d = await res.json();
          if (d.success) {
            saved++;
            currentInventory.push({ ...itemData, id:d.item.id });
            if (ingredients.length > 0) {
              const ingPayload = ingredients.map(ing => {
                const match = stockItems.find(s => s.name.toLowerCase()===ing.name.toLowerCase() && s.branch===itemData.branch);
                return match ? { ingredient_id:match.id, quantity:ing.qty_required, unit:ing.unit||match.unit } : null;
              }).filter(Boolean);
              if (ingPayload.length > 0) {
                await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
                  method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ ingredients:ingPayload })
                });
              }
            }
          }
        } catch {}
      }

      e.target.value = "";
      let msg = `Parsed ${items.length} row(s).\n✅ Saved: ${saved}`;
      if (skipped > 0) msg += `\n⚠️ Skipped ${skipped} duplicate(s):\n• ${skippedNames.join("\n• ")}`;
      alert(msg);
      await refetch();
      await fetchActivityLog();
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Render helpers ───────────────────────────────────────────────────────────
  const renderIngredientPicker = () => (
    <div style={{ background:"#f0fdf5", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginTop:4 }}>
      <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Ingredients Required</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px auto", gap:8, marginBottom:10 }}>
        <div ref={ingRef} style={{ position:"relative" }}>
          <input style={invInputSt} value={ingSearch}
            onChange={e=>{setIngSearch(e.target.value);setIngPicked(null);setIngDropOpen(true);}}
            onFocus={()=>setIngDropOpen(true)}
            placeholder="Search stock ingredient…"/>
          {ingDropOpen && ingFiltered.length > 0 && (
            <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:500, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.10)", maxHeight:160, overflowY:"auto" }}>
              {ingFiltered.map(s=>(
                <div key={s.id}
                  onMouseDown={e=>{e.preventDefault();setIngPicked(s);setIngSearch(s.name);setIngUnit(s.unit);setIngDropOpen(false);}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0fdf5"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  style={{ padding:"8px 12px", cursor:"pointer", fontSize:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:C.ink }}>{s.name}</span>
                  <span style={{ fontSize:11, color:C.muted, background:"#dcfce7", padding:"2px 8px", borderRadius:20 }}>{s.unit} · {s.branch}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="number" style={invInputSt} value={ingQty} min="0" step="any" onChange={e=>setIngQty(e.target.value)} placeholder="Qty"/>
        <select style={invInputSt} value={ingUnit} onChange={e=>setIngUnit(e.target.value)}>
          <option value="">unit</option>
          {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
        <button type="button" onClick={addIngredient} style={{ ...btnPrimarySt, height:36, padding:"0 14px", flexShrink:0 }}>
          <PlusIcon/> Add
        </button>
      </div>
      {(!formData.ingredients || formData.ingredients.length === 0) ? (
        <div style={{ textAlign:"center", padding:"12px 0", color:C.muted, fontSize:12, fontStyle:"italic" }}>No ingredients linked yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {formData.ingredients.map((ing,idx)=>(
            <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px auto", gap:8, alignItems:"center", background:C.white, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px" }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.ink }}>{ing.name}</span>
              <input type="number" value={ing.qty_required} min="0" step="any"
                onChange={e=>updateIngQty(idx,e.target.value)}
                style={{ ...invInputSt, textAlign:"center" }}/>
              <span style={{ fontSize:11, color:C.muted, background:"#f0fdf5", padding:"3px 8px", borderRadius:20, textAlign:"center" }}>{ing.unit}</span>
              <button type="button" onClick={()=>removeIngredient(idx)}
                style={{ ...smallBtnSt, height:28, width:28, justifyContent:"center", border:"1px solid #ffcdd2", color:"#e53935", flexShrink:0 }}>
                <XIcon size={11}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFormFields = () => (
    <>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Item Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={invInputSt} placeholder="Product name"/>
      </div>
      {/* Image Upload */}
<div style={{ marginBottom:13 }}>
  <label style={invLabelSt}>Product Image</label>
  <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
    <div style={{ flex:1 }}>
      <input
        type="text"
        placeholder="Paste image URL or upload below…"
        value={formData.image_url || ""}
        onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
        style={invInputSt}
      />
    </div>
    <label style={{ ...btnSt, cursor:"pointer", flexShrink:0 }}>
      <FileIcon size={13}/> Upload
      <input
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={async e => {
          const file = e.target.files[0];
          if (!file) return;
          const fd = new FormData();
          fd.append("image", file);
          try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/upload-image`, {
              method: "POST",
              body: fd,
            });
            const d = await res.json();
            if (d.url) setFormData(p => ({ ...p, image_url: d.url }));
            else alert("Upload failed");
          } catch { alert("Upload failed"); }
        }}
      />
    </label>
  </div>

  {/* Preview */}
  {formData.image_url && (
    <div style={{ marginTop:8, position:"relative", display:"inline-block" }}>
      <img
        src={formData.image_url}
        alt="preview"
        style={{ width:80, height:80, objectFit:"cover", borderRadius:10, border:`1px solid ${C.border}` }}
        onError={e => e.target.style.display="none"}
      />
      <button
        type="button"
        onClick={() => setFormData(p => ({ ...p, image_url: "" }))}
        style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", border:"none", background:"#e53935", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
        <XIcon size={9}/>
      </button>
    </div>
  )}
</div>

      {isAdmin && (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Brand</label>
          <select value={formBrandId} onChange={e=>{ setFormBrandId(e.target.value); setFormData(p=>({...p,branch:"",category:""})); }} style={invInputSt}>
            <option value="">Select brand…</option>
            {brandList.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
      {isAdmin ? (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch</label>
          <BranchSearchSelect
            value={formData.branch}
            onChange={val=>setFormData(p=>({...p,branch:val,category:""}))}
            allBranches={formBrandId
              ? allBranches.filter(b=>{ const brand=brandList.find(x=>String(x.id)===String(formBrandId)); return brand?(brand.branches||[]).some(br=>(typeof br==="string"?br:br.name)===b.branch):true; })
              : allBranches}
          />
        </div>
      ) : (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch</label>
          <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>{userBranch||"—"}</div>
        </div>
      )}
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Category</label>
        <CategorySelect
          value={formData.category}
          onChange={val=>setFormData(p=>({...p,category:val}))}
          categories={formCategories}
          onAddCategory={cat=>setFormCategories(prev=>prev.includes(cat)?prev:[...prev,cat])}
        />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:13 }}>
        <div>
          <label style={invLabelSt}>Product Cost (₱)</label>
          <input type="number" name="cost" value={formData.cost} readOnly style={{ ...invInputSt, background:"#f5f5f5", color:C.muted }}/>
        </div>
        <div>
          <label style={invLabelSt}>Profit Markup (%)</label>
          <input type="number" value={DEFAULT_PROFIT_MARGIN} readOnly disabled style={{ ...invInputSt, background:"#f5f5f5", color:C.muted, cursor:"not-allowed" }}/>
        </div>
      </div>
      {formData.cost !== "" && parseFloat(formData.cost) > 0 && (
        <div style={{ background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:9, padding:"9px 13px", marginBottom:13, fontSize:12, display:"flex", gap:8, alignItems:"center", color:C.ok }}>
          Cost: <strong>{fmtPeso(formData.cost)}</strong> + <strong>{DEFAULT_PROFIT_MARGIN}%</strong> = Selling price: <strong style={{ color:C.green, fontSize:13 }}>{fmtPeso(formData.price)}</strong>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:13 }}>
        <div><label style={invLabelSt}>Stock Qty</label><input type="number" name="stock"    value={formData.stock}    onChange={handleInputChange} min="0" style={invInputSt}/></div>
        <div><label style={invLabelSt}>Min Stock</label><input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} min="0" style={invInputSt}/></div>
        <div><label style={invLabelSt}>Selling Price (₱)</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" style={invInputSt} placeholder="Auto-calc"/></div>
      </div>
     {["coffee spot", "food caravan"].some(b => formBrand?.name?.toLowerCase().includes(b)) && (
  <div style={{ marginBottom:13 }}>
    <label style={invLabelSt}>Ingredients</label>
    {renderIngredientPicker()}
  </div>
)}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <button type="button" disabled={saving} onClick={()=>{ setShowAddModal(false); setShowEditModal(false); setFormData(emptyForm()); setFormBrandId(""); resetIngPicker(); }} style={{ ...btnSt, opacity: saving ? 0.5 : 1, cursor: saving ? "not-allowed" : "pointer" }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimarySt, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
          {saving ? (showEditModal ? "Saving…" : "Adding…") : "Save Item"}
        </button>
      </div>
    </>
  );

  const selectedBrandObj = brandList.find(b => b.id === filterBrand) || null;

  // Clearing filters keeps the selected brand fixed (screen 2 is scoped to one brand).
  const anyFilter = filterBranch||filterCategory||filterStatus||searchQuery;
  const clearAll  = () => { setFilterBranch(null); setFilterCategory(""); setFilterStatus(""); setSearchQuery(""); };

  const goBackToBrands = () => {
    setScreen("brands");
    setFilterBrand(null);
    setFilterBranch(null);
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
  };

  const openBrand = brandId => {
    setFilterBrand(brandId);
    setFilterBranch(null);
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
    setScreen("inventory");
  };

  const fontImport = <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>;

  // ── Screen 1: Brand cards ─────────────────────────────────────────────────────
  if (screen === "brands" && isAdmin) {
    return (
      <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
        {fontImport}
        <div style={{ marginBottom:22 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:C.ink }}>Select a Brand</h2>
          <p style={{ margin:"5px 0 0", fontSize:13, color:C.muted }}>Choose a brand to manage its menu inventory across branches.</p>
        </div>

        {loading && brandList.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading brands…</div>
        ) : brandList.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No brands found.</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 }}>
            {brandList.map(b => {
              const branchNames = (b.branches||[]).map(br=>typeof br==="string"?br:br.name);
              const brandItems  = inventory.filter(i => branchNames.includes(i.branch));
              return (
                <BrandCard
                  key={b.id}
                  brand={b}
                  branchCount={branchNames.length}
                  itemCount={brandItems.length}
                  lowCount={brandItems.filter(i => Number(i.stock) <= Number(i.min_stock)).length}
                  onClick={() => openBrand(b.id)}
                />
              );
            })}
          </div>
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // ── Screen 2: Inventory table + filters (scoped to selected brand for admins) ─
  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      {fontImport}

      {/* Back to brands + brand context header */}
      {isAdmin && (
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <button onClick={goBackToBrands} style={{ ...btnSt, gap:6 }}>
            <ArrowLeftIcon size={13}/> All Brands
          </button>
          {selectedBrandObj && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:15, fontWeight:800, color:C.ink }}>
              <StoreIcon size={16} color={C.green}/> {selectedBrandObj.name}
            </span>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { label:"Showing",    value:filteredItems.length.toLocaleString(), sub:`of ${inventory.length.toLocaleString()} total`, accent:C.green },
          { label:"Low Stock",  value:lowCount,                              sub:"Needs reorder",      accent:C.warn },
          { label:"Est. Value", value:fmtPeso(totalValue),                  sub:"Filtered selection", accent:C.green },
          { label:"Categories", value:filteredCategories.length,            sub:"Product types",      accent:"#1565c0" },
        ].map((s,i)=>(
          <div key={i} style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:s.accent, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
            <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={13}/></div>
            <input type="text" placeholder="Search name, category, branch…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
            {searchQuery && <div onClick={()=>setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.muted }}><XIcon size={12}/></div>}
          </div>

          {/* Branch filter — scoped to the selected brand's own branches */}
          {isAdmin && selectedBrandObj && (
            <div style={{ position:"relative", minWidth:190 }}>
              <select value={filterBranch||""} onChange={e=>setFilterBranch(e.target.value||null)} style={{ ...invInputSt, paddingLeft:32 }}>
                <option value="">All Branches</option>
                {(selectedBrandObj.branches||[]).map(br=>{
                  const name = typeof br==="string"?br:br.name;
                  return <option key={name} value={name}>{name}</option>;
                })}
              </select>
              <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.green, pointerEvents:"none" }}><StoreIcon size={13}/></div>
            </div>
          )}

          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{ ...invInputSt, width:150 }}>
            <option value="">All Categories</option>
            {filteredCategories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...invInputSt, width:130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <div style={{ flex:1 }}/>

          {/* ── History buttons ── */}
          <button onClick={()=>setShowDeleteHistory(true)} style={{ ...btnSt, border:"1.5px solid #dc2626", color:"#dc2626", gap:6 }}>
            <HistoryIcon size={13}/> Delete History
            {deleteHistory.length > 0 && (
              <span style={{ background:"#dc2626", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{deleteHistory.length}</span>
            )}
          </button>
          <button onClick={()=>setShowActivityLog(true)} style={{ ...btnSt, border:`1.5px solid ${C.green}`, color:C.greenDk, gap:6 }}>
            <ActivityIcon size={13}/> Activity Log
            {activityLog.length > 0 && (
              <span style={{ background:C.green, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{activityLog.length}</span>
            )}
          </button>

          <label style={{ ...btnSt, cursor:"pointer" }}>
            <FileIcon size={13}/> Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>
          <button onClick={()=>{
            const branch = isAdmin ? (filterBranch||"") : userBranch;
            setFormData({...emptyForm(), branch});
            fetchStockItems(branch);
            setFormBrandId(selectedBrandObj ? String(selectedBrandObj.id) : "");
            setShowAddModal(true);
          }} style={btnPrimarySt}>
            <PlusIcon/> Add New Item
          </button>
        </div>

        {/* Active filter chips */}
        {anyFilter && (
          <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Active:</span>
            {searchQuery    && <Chip label={`"${searchQuery}"`}                                               color="#3949ab" bg="#e8eaf6" onRemove={()=>setSearchQuery("")}/>}
            {filterBranch   && <Chip label={filterBranch}                                                     color="#00695c" bg="#e0f7fa" onRemove={()=>setFilterBranch(null)}/>}
            {filterCategory && <Chip label={filterCategory}                                                   color="#00695c" bg="#e0f2f1" onRemove={()=>setFilterCategory("")}/>}
            {filterStatus   && <Chip label={filterStatus==="low"?"Low Stock":"In Stock"} color={filterStatus==="low"?C.warn:C.ok} bg={filterStatus==="low"?C.warnBg:C.okBg} onRemove={()=>setFilterStatus("")}/>}
            <button onClick={clearAll} style={{ ...smallBtnSt, height:24, border:`1px solid ${C.border}`, fontSize:11, color:C.muted, marginLeft:"auto" }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table card */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
          <span style={{ fontWeight:800, fontSize:13, display:"flex", alignItems:"center", gap:7 }}>
            <StoreIcon size={14} color="#fff"/> {selectedBrandObj ? `${selectedBrandObj.name} — Menu Inventory` : "Menu Inventory"}
          </span>
          <span style={{ fontSize:12, opacity:0.9 }}>{filteredItems.length.toLocaleString()} items – {lowCount} low stock</span>
        </div>
        {loading ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading inventory…</div>
        ) : (
        <InventoryTable
          items={filteredItems}
          onEdit={openEditModal}
          onRequestDelete={setDeleteTarget}
          deletingId={deletingId}
          page={page}
          setPage={setPage}
        />
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          target={{
            name: deleteTarget.name,
            branch: deleteTarget.branch,
            ingredientCount: (deleteTarget.ingredients || []).length,
          }}
          deleting={deletingId === deleteTarget.id}
          onClose={() => { if (deletingId !== deleteTarget.id) setDeleteTarget(null); }}
          onConfirm={async () => {
            await handleDeleteItem(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
        )}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={e=>{ if(e.target===e.currentTarget){setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());resetIngPicker();} }}>
          <div style={{ background:C.white, borderRadius:20, padding:"26px 26px 20px", width:560, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 10px 48px rgba(0,0,0,.18)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.ink }}>{showAddModal?"Add New Menu Item":"Edit Menu Item"}</h2>
              <button onClick={()=>{setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());setFormBrandId("");resetIngPicker();}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
            </div>
            <form onSubmit={showAddModal ? handleAddItem : handleEditItem}>
              {renderFormFields()}
            </form>
          </div>
        </div>
      )}

      {/* Delete History Panel */}
      {showDeleteHistory && (
        <InventoryDeleteHistoryPanel
          history={deleteHistory}
          onRestore={handleRestore}
          restoringId={restoringId}
          onClose={() => setShowDeleteHistory(false)}
        />
      )}

      {/* Activity Log Panel */}
      {showActivityLog && (
        <InventoryActivityLogPanel
          log={activityLog}
          onClose={() => setShowActivityLog(false)}
        />
      )}

       <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}