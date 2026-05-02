import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import StockInventoryContent from './StockInventoryContent';
import MenuInventoryContent from './MenuInventoryContent';
import {
  Home, Box, FileText, FileCheck, Users, BarChart2, MessageCircle,
  User, ShoppingCart, LogOut, Search, Package, AlertTriangle,
  DollarSign, Grid3X3, ChevronDown, Plus, Pencil, Trash2, X, Check,
  Building2, Store, TrendingDown, TrendingUp, Layers, GitBranch,
  Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar, BarChart, RefreshCw, Eye,  Clock, Download
} from 'lucide-react';

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

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

// Shared section wrapper used across all modules
const BmSection = ({ children, style = {} }) => (
  <div style={{
    background: C.white,
    border: `1px solid rgba(0,168,76,0.12)`,
    borderRadius: 18,
    boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
    overflow: "hidden",
    marginBottom: 24,
    ...style,
  }}>
    {children}
  </div>
);

const BmSectionHeader = ({ title, subtitle, action }) => (
  <div style={{
    background: `linear-gradient(135deg,#2E7D32,#00897b)`,
    color: C.white,
    padding: "16px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    background: C.white,
    border: `1px solid rgba(0,168,76,0.12)`,
    borderRadius: 18,
    padding: "20px 22px",
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
  display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65",
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
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [preset, setPreset] = useState("month");
  const [stats, setStats] = useState(null);
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem('user'); window.location.reload(); };
  const [transactions, setTransactions] = useState([]);
  const getUserFromStorage = () => {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString);
    navigate('/login');
    return null;
  };

  useEffect(() => {
    fetch(`http://localhost:5001/dashboard/stats?preset=${preset}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, [preset]);

  useEffect(() => {
    fetch("http://localhost:5001/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Failed to fetch transactions", err));
  }, []);

  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) navigate('/login');
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
    { id: 'dashboard',      label: 'Dashboard',            icon: <Home size={20} /> },
    { id: 'inventory',      label: 'Menu Inventory',        icon: <Box size={20} /> },
    { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} /> },
    { id: 'pos',            label: 'POS',                   icon: <DollarSign size={20} /> },
    { id: 'mobileShop',     label: 'Mobile Shop Supplies',  icon: <ShoppingCart size={20} /> },
    { id: 'mobileOrders',   label: 'View Mobile Orders',    icon: <Package size={20} /> },
    { id: 'receipts',       label: 'View Liquidation',      icon: <FileText size={20} /> },
    { id: 'applications',   label: 'View Applications',     icon: <FileCheck size={20} /> },
    { id: 'users',          label: 'User Management',       icon: <Users size={20} /> },
    { id: 'reports',        label: 'Sales & Reports',       icon: <BarChart2 size={20} /> },
    { id: 'communication',  label: 'Announcements',         icon: <MessageCircle size={20} /> },
    { id: 'brandBranch',    label: 'Brand & Branch',        icon: <GitBranch size={20} /> },
    { id: 'profile',        label: 'Edit Profile',          icon: <User size={20} /> },
    { id: 'logout',         label: 'Logout',                icon: <LogOut size={20} />, action: handleLogout },
  ];

  const handleCreateAccount   = (applicant) => { setSelectedApplicant(applicant); setShowCreateAccountModal(true); };
  const handleViewApplication = (applicant) => { setSelectedApplicant(applicant); setShowViewApplicationModal(true); };

  return (
    <div className="admin-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --green-primary:#2E7D32; --green-dark:#1B5E20; --green-light:#4CAF50;
          --green-accent:#d4df33; --green-bg:#ccfcc7; --white:#ffffff;
          --off-white:#F0EFE7; --gray-100:#F3F4F6; --gray-200:#E5E7EB;
          --gray-300:#D1D5DB; --gray-400:#9CA3AF; --gray-500:#6B7280;
          --gray-600:#4B5563; --gray-700:#374151; --gray-800:#1F2937;
          --text-dark:#1A1A1A; --text-gray:#004d00;
          --shadow:rgba(46,125,50,0.1); --shadow-strong:rgba(46,125,50,0.2);
          --blue:#3B82F6; --red:#EF4444; --orange:#F59E0B; --success:#10B981;
        }
        .admin-dashboard { font-family:'Poppins',sans-serif; display:flex; min-height:100vh; background:linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%); }
        .sidebar {
          width:${sidebarCollapsed ? '80px' : '280px'};
          background:var(--white); box-shadow:2px 0 10px var(--shadow);
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease; z-index:1000; overflow-y:auto;
        }
        .sidebar-header { padding:1.5rem; border-bottom:1px solid var(--gray-200); display:flex; align-items:center; justify-content:space-between; }
        .sidebar-logo { display:flex; align-items:center; gap:0.75rem; }
        .sidebar-logo-icon { width:0%; height:70%; margin-left:10%; overflow:hidden; flex-shrink:0; }
        .sidebar-logo-icon img { width:100%; height:100%; object-fit:cover; }
        .sidebar-toggle { background:none; border:none; font-size:1rem; cursor:pointer; padding:0.5rem; color:var(--gray-500); transition:color 0.3s ease; }
        .sidebar-toggle:hover { color:var(--green-primary); }
        .sidebar-nav { padding:1rem 0; }
        .nav-item { display:flex; align-items:center; gap:1rem; padding:0.75rem 1rem; color:var(--gray-600); cursor:pointer; transition:all 0.3s ease; border-left:3px solid transparent; font-weight:500; border-radius:80px; position:relative; }
        .nav-item:hover { background:var(--gray-100); color:var(--green-primary); }
        .nav-item.active { background:rgba(46,125,50,0.15); color:var(--green-primary); border-left-color:var(--green-primary); border-radius:20px; }
        .nav-icon { font-size:1.3rem; flex-shrink:0; display:flex; justify-content:center; width:24px; }
        .nav-label { display:${sidebarCollapsed ? 'none' : 'block'}; font-size:0.9rem; }
        .main-content { flex:1; margin-left:${sidebarCollapsed ? '80px' : '280px'}; transition:margin-left 0.3s ease; }
        .top-bar { background:var(--white); padding:1.2rem 2rem; box-shadow:0 2px 8px var(--shadow); display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; }
        .top-bar-title { font-family:'Montserrat',sans-serif; font-size:1.6rem; font-weight:700; color:#00897b; }
        .user-menu { display:flex; align-items:center; gap:1rem; }
        .user-info { text-align:right; }
        .user-name { font-weight:600; color:var(--text-dark); font-size:0.95rem; }
        .user-role { font-size:0.8rem; color:var(--gray-500); }
        .user-avatar { width:45px; height:45px; border-radius:50%; background:linear-gradient(135deg,var(--green-primary),var(--green-light)); display:flex; align-items:center; justify-content:center; font-size:1.3rem; cursor:pointer; transition:transform 0.3s ease; }
        .user-avatar:hover { transform:scale(1.1); }
        .content-area { padding:2rem; }
        @media(max-width:768px){
          .sidebar{width:${sidebarCollapsed?'0':'280px'};transform:translateX(${sidebarCollapsed?'-100%':'0'});}
          .main-content{margin-left:0;}
          .top-bar{padding:1rem;}
          .content-area{padding:1rem;}
          .user-info{display:none;}
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <img src={logo} alt="iFranchise" />
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navigation.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.action) { item.action(); }
                else { setActiveModule(item.id); if (item.id === 'applications') fetchApplications(); }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <h1 className="top-bar-title"></h1>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Admin — {user?.branch}</div>
            </div>
            <div className="user-avatar">{user?.avatar}</div>
          </div>
        </div>

        <div className="content-area">
          {activeModule === 'dashboard' && <DashboardContent transactions={transactions} brands={brands} />}
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

      {showCreateAccountModal && (
        <CreateAccountModal
          applicant={selectedApplicant}
          onClose={() => { setShowCreateAccountModal(false); setSelectedApplicant(null); }}
        />
      )}

      {showLogoutModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000 }}
          onClick={() => setShowLogoutModal(false)}>
          <div style={{ background:C.white, borderRadius:20, padding:'32px 36px', maxWidth:400, width:'90%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2rem' }}>🚪</div>
            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:800, color:'#0d2b1e', marginBottom:8 }}>Log out?</h2>
            <p style={{ color:'#5a7a65', fontSize:13, marginBottom:28 }}>You'll need to sign in again to access your account.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLogoutModal(false)}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button onClick={confirmLogout}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#dc2626', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
                Log out
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
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// BRAND MANAGEMENT 
// ─────────────────────────────────────────────────────────────────────────────
function BrandManagementContent({ brands: propBrands, onBrandsChange }) {
  const [brands, setBrands] = useState(propBrands || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  const [showAddBrandModal,   setShowAddBrandModal]   = useState(false);
  const [showEditBrandModal,  setShowEditBrandModal]  = useState(false);
  const [showAddBranchModal,  setShowAddBranchModal]  = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBrand,   setSelectedBrand]   = useState(null);
  const [selectedBranch,  setSelectedBranch]  = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filterBrand, setFilterBrand] = useState('all');

  const emptyBrand  = { name:'', categories:[], contact_email:'', contact_phone:'', description:'' };
  const emptyBranch = { name:'', brand_id:'', region:'', manager:'', contact:'', address:'', concept:'' };

  const [brandForm,  setBrandForm]  = useState(emptyBrand);
  const [branchForm, setBranchForm] = useState(emptyBranch);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBrands(list);
      onBrandsChange?.(list);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const duplicate = brands.some(b => b.name.trim().toLowerCase() === brandForm.name.trim().toLowerCase());
    if (duplicate) { alert(`A brand named "${brandForm.name}" already exists.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBrandModal(false); setBrandForm(emptyBrand); }
      else alert(data.error || 'Failed to add brand');
    } catch { alert('Failed to add brand'); }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands/${selectedBrand.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBrandModal(false); setSelectedBrand(null); }
      else alert(data.error || 'Failed to update brand');
    } catch { alert('Failed to update brand'); }
  };

  const handleDeleteBrand = async (id) => {
    if (confirmDeleteId !== `brand-${id}`) { setConfirmDeleteId(`brand-${id}`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands/${id}`, { method:'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setConfirmDeleteId(null); }
      else alert(data.error || 'Failed to delete brand');
    } catch { alert('Failed to delete brand'); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const parentBrand = brands.find(b => String(b.id) === String(branchForm.brand_id));
    const duplicate   = parentBrand?.branches?.some(br => br.name.trim().toLowerCase() === branchForm.name.trim().toLowerCase());
    if (duplicate) { alert(`A branch named "${branchForm.name}" already exists under this brand.`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBranchModal(false); setBranchForm(emptyBranch); }
      else alert(data.error || 'Failed to add branch');
    } catch { alert('Failed to add branch'); }
  };

  const handleEditBranch = async (e) => {
  e.preventDefault();
  console.log('Editing branch ID:', selectedBranch.id);
  console.log('Payload:', JSON.stringify(branchForm));
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchForm),
    });
    
    // Log the raw response text before parsing
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', text);
    
    const data = JSON.parse(text);
    if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); }
    else alert(data.error || 'Failed to update branch');
  } catch (err) {
     console.error('Update branch error:', err);
    alert('Failed to update branch');
  }
};

  const handleDeleteBranch = async (id) => {
    if (confirmDeleteId !== `branch-${id}`) { setConfirmDeleteId(`branch-${id}`); return; }
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${id}`, { method:'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setConfirmDeleteId(null); }
      else alert(data.error || 'Failed to delete branch');
    } catch { alert('Failed to delete branch'); }
  };

  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const totalActive   = brands.reduce((s, b) => s + (b.branches?.filter(br => br.status === 'Active').length || 0), 0);
  const totalReview   = brands.reduce((s, b) => s + (b.branches?.filter(br => br.status === 'Review').length || 0), 0);
  const allRegions = [...new Set(brands.flatMap(b => b.branches?.map(br => br.region) || []).filter(Boolean))];

  const filteredBrands = brands
  .map(brand => ({
    ...brand,
    branches: (brand.branches || []).filter(br =>
      (!searchQuery ||
        br.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (br.manager || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterRegion === 'all' || br.region === filterRegion)
    ),
  }))
  .filter(brand => {
    if (filterBrand !== 'all' && String(brand.id) !== String(filterBrand)) return false;
    if (filterRegion !== 'all' && brand.branches.length === 0) return false;
    if (searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
    return true;
  });

  const ConceptBadge = ({ concept }) => {
  const styles = {
    'Full Store': { bg:'rgba(16,185,129,0.1)', color:'#059669' },
    'Kiosk':      { bg:'rgba(59,130,246,0.1)', color:'#2563eb' },
  };
  const s = styles[concept] || { bg:'rgba(156,163,175,0.1)', color:'#6b7280' };
  return (
    <span style={{ background:s.bg, color:s.color, padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>
      {concept || '—'}
    </span>
  );
};

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        .bm-root * { font-family:'Montserrat',sans-serif !important; box-sizing:border-box; }
        .bm-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; }
        .bm-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); }
        .bm-brand-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; box-shadow:0 2px 14px rgba(0,140,60,0.07); margin-bottom:24px; overflow:hidden; }
        .bm-brand-header { background:linear-gradient(135deg,#2E7D32,#00897b); color:#fff; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; }
        .bm-branch-row { display:grid; grid-template-columns:1.4fr 1fr 1.2fr 1fr 1.2fr 0.8fr auto; align-items:center; gap:10px; padding:14px 20px; border-bottom:1px solid #f0f8f0; transition:background .12s; }
        .bm-branch-row:last-child { border-bottom:none; }
        .bm-branch-row:hover { background:#f6fef8; }
        .bm-col-head { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:#00897b; }
        .bm-input { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; }
        .bm-input:focus { border-color:#00897b; box-shadow:0 0 0 2px rgba(0,137,123,0.12); }
        .bm-select { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; appearance:none; cursor:pointer; }
        .bm-action-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; border:1px solid; transition:background .15s; }
      `}</style>

      <div className="bm-root">
       

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Total Brands',    value:brands.length,  icon:<Globe size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'Registered brands'    },
            { label:'Total Branches',  value:totalBranches,  icon:<Store size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Across all brands'    },
          ].map((s, i) => (
            <div key={i} className="bm-stat">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a7a65', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:'#0d2b1e' }}>{s.value}</div>
                </div>
                <div style={{ width:44, height:44, borderRadius:13, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {s.icon}
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#5a7a65' }}>{s.sub}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Search size={14} color="#5a7a65" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }} />
            <input type="text" placeholder="Search brands or branches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bm-input" style={{ paddingLeft:32, width:260 }} />
          </div>
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bm-select" style={{ width:180 }}>
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
           <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bm-select" style={{ width:180 }}>
            <option value="all">All Regions</option>
            {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
            <button onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:11, border:'1.5px solid #00897b', background:'#fff', color:'#00897b', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <Plus size={14} /> Add Branch
            </button>
            <button onClick={() => { setBrandForm(emptyBrand); setShowAddBrandModal(true); }}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 22px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)' }}>
              <Plus size={15} /> Add Brand
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding:'48px 0', textAlign:'center', color:'#5a7a65', fontSize:14, fontWeight:600 }}>Loading brands & branches...</div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding:'48px 0', textAlign:'center', color:'#5a7a65', fontSize:14, fontWeight:600 }}>No brands found. Add your first brand above.</div>
        ) : filteredBrands.map(brand => (
          <div key={brand.id} className="bm-brand-card">
            <div className="bm-brand-header">
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Globe size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:16 }}>{brand.name}</div>
                  <div style={{ fontSize:12, opacity:0.8, display:'flex', alignItems:'center', gap:10, marginTop:2 }}>
                    {brand.contact_email && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, opacity:0.85, fontWeight:600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? 'branch' : 'branches'}</span>
                <button onClick={() => { setSelectedBrand(brand); setBrandForm({ name:brand.name, categories:brand.categories||[], contact_email:brand.contact_email, contact_phone:brand.contact_phone, description:brand.description }); setShowEditBrandModal(true); }}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, border:'1.5px solid rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  <Edit2 size={12} /> Edit Brand
                </button>
                <button onClick={() => handleDeleteBrand(brand.id)}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, border:'1.5px solid rgba(255,150,150,0.5)', background:'rgba(255,80,80,0.15)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  {confirmDeleteId === `brand-${brand.id}` ? <><Check size={12} /> Confirm</> : <><Trash2 size={12} /> Delete</>}
                </button>
              </div>
            </div>

            <div>
              <div className="bm-branch-row" style={{ background:'#f8fffe', borderBottom:'2px solid #d1eedd' }}>
                {['Branch Name','Region','Manager','Contact','Address','Concept','Actions'].map(h => (
                  <div key={h} className="bm-col-head">{h}</div>
                ))}
              </div>
              {brand.branches?.length === 0 ? (
                <div style={{ padding:'24px 20px', color:'#5a7a65', fontSize:13, fontStyle:'italic', textAlign:'center' }}>
                  No branches yet.{' '}
                  <span style={{ color:'#00897b', cursor:'pointer', textDecoration:'underline', fontWeight:700 }}
                    onClick={() => { setBranchForm({ ...emptyBranch, brand_id:brand.id }); setShowAddBranchModal(true); }}>
                    Add the first branch
                  </span>
                </div>
              ) : brand.branches.map(branch => (
                <div key={branch.id} className="bm-branch-row">
                  <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13 }}>{branch.name}</div>
                  <div style={{ fontSize:12, color:'#5a7a65' }}>{branch.region}</div>
                  <div style={{ fontSize:12, color:'#0d2b1e', fontWeight:600 }}>{branch.manager || '—'}</div>
                  <div style={{ fontSize:12, color:'#5a7a65' }}>{branch.contact || '—'}</div>
                  <div style={{ fontSize:12, color:'#5a7a65' }}>{branch.address || '—'}</div>
                  <div>
                    {brand.name === 'Coffee Spot'
                      ? <ConceptBadge concept={branch.concept} />
                      : '—'}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="bm-action-btn" style={{ borderColor:'#b2dfdb', background:'#e0f2f1', color:'#00695c' }}
                      onClick={() => { setSelectedBranch(branch); setBranchForm({ name:branch.name, brand_id:brand.id, region:branch.region, manager:branch.manager, contact:branch.contact, address:branch.address, concept: branch.concept || '' }); setShowEditBranchModal(true); }}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button className="bm-action-btn"
                      style={{ borderColor:confirmDeleteId===`branch-${branch.id}`?'#f87171':'#fecaca', background:confirmDeleteId===`branch-${branch.id}`?'#fee2e2':'#fff', color:confirmDeleteId===`branch-${branch.id}`?'#dc2626':'#ef4444' }}
                      onClick={() => handleDeleteBranch(branch.id)}>
                      {confirmDeleteId === `branch-${branch.id}` ? <><Check size={11} /> Confirm</> : <><Trash2 size={11} /> Delete</>}
                    </button>
                    {confirmDeleteId === `branch-${branch.id}` && (
                      <button className="bm-action-btn" style={{ borderColor:'#d1d5db', background:'#f9fafb', color:'#6b7280' }} onClick={() => setConfirmDeleteId(null)}>
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddBrandModal  && <BmModal title="Add New Brand"   onClose={() => setShowAddBrandModal(false)}  onSubmit={handleAddBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showEditBrandModal && <BmModal title="Edit Brand"      onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showAddBranchModal && <BmModal title="Add New Branch"  onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
      {showEditBranchModal&& <BmModal title="Edit Branch"     onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
    </div>
  );
}

function BmModal({ title, onClose, onSubmit, children }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)', maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#0d2b1e', margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #b2dfdb', background:'#e0f2f1', cursor:'pointer', color:'#00695c', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 22px', borderRadius:10, border:'1px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)' }}>
              <Check size={14} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BrandFormFields({ form, setForm }) {
  const [catInput, setCatInput] = useState('');
  const f       = (field) => ({ value:form[field], onChange:e => setForm(p => ({ ...p, [field]:e.target.value })) });
  const inputSt = { width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, color:'#0d2b1e', background:'#f0fdf5', fontFamily:'inherit', outline:'none', marginTop:4, boxSizing:'border-box' };
  const lbl     = { display:'block', fontSize:11, fontWeight:800, color:'#5a7a65', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.07em' };

  const addCategory = () => {
    const val = catInput.trim();
    if (!val) return;
    if ((form.categories || []).map(c => c.toLowerCase()).includes(val.toLowerCase())) { alert(`"${val}" is already in the list.`); return; }
    setForm(f => ({ ...f, categories:[...(f.categories||[]), val] }));
    setCatInput('');
  };
  const removeCategory = (cat) => setForm(f => ({ ...f, categories:f.categories.filter(c => c !== cat) }));

  return (
    <div style={{ display:'grid', gap:14 }}>
      <div><label style={lbl}>Brand Name *</label><input style={inputSt} {...f('name')} placeholder="Enter brand name" required /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><label style={lbl}>Contact Email</label><input type="email" style={inputSt} {...f('contact_email')} placeholder="brand@example.com" /></div>
        <div><label style={lbl}>Contact Phone</label>
          <input type="tel" style={inputSt} maxLength={11} value={form.contact_phone}
            onKeyDown={e => { const allowed=['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End']; const isShortcut=(e.ctrlKey||e.metaKey)&&['a','c','v','x','z','y'].includes(e.key.toLowerCase()); if(!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
            onChange={e => { const digits=e.target.value.replace(/\D/g,'').slice(0,11); setForm(prev=>({...prev,contact_phone:digits})); }}
            placeholder="09XXXXXXXXX" />
        </div>
      </div>
      <div><label style={lbl}>Description</label><textarea style={{ ...inputSt, resize:'vertical', lineHeight:1.5 }} {...f('description')} rows={3} placeholder="Brief description..." /></div>
      <div>
        <label style={lbl}>Categories</label>
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <input style={{ ...inputSt, marginTop:0, flex:1 }} placeholder="e.g. Medicine, Supplement..." value={catInput}
            onChange={e => setCatInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addCategory();} }} />
          <button type="button" onClick={addCategory} style={{ padding:'9px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
            <Plus size={13} /> Add
          </button>
        </div>
        {(form.categories||[]).length === 0 ? (
          <div style={{ fontSize:12, color:'#9ca3af', fontStyle:'italic', marginTop:6 }}>No categories yet.</div>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:8 }}>
            {form.categories.map(cat => (
              <span key={cat} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'#e0f2f1', border:'1.5px solid #00897b', color:'#00695c', fontSize:12, fontWeight:700 }}>
                {cat}
                <button type="button" onClick={() => removeCategory(cat)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', color:'#00897b' }}><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BranchFormFields({ form, setForm, brands }) {
  const f       = (field) => ({ value:form[field], onChange:e => setForm(p => ({ ...p, [field]:e.target.value })) });
  const inputSt = { width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid #b2dfdb', fontSize:13, color:'#0d2b1e', background:'#f0fdf5', fontFamily:'inherit', outline:'none', marginTop:4, boxSizing:'border-box' };
  const lbl     = { display:'block', fontSize:11, fontWeight:800, color:'#5a7a65', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.07em' };
  return (
    <div style={{ display:'grid', gap:14 }}>
      <div><label style={lbl}>Parent Brand *</label>
        <select style={{ ...inputSt, appearance:'none', cursor:'pointer' }} {...f('brand_id')} required>
          <option value="">Select brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div><label style={lbl}>Branch Name *</label><input style={inputSt} {...f('name')} required /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><label style={lbl}>Region *</label>
          <select style={{ ...inputSt, appearance:'none', cursor:'pointer' }} {...f('region')} required>
            <option value="">Select region</option>
            {['NCR','Region 3','Region 4A','Region 4B','Region 5','Region 7','Region 11'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        {String(form.brand_id) === brands.find(b => b.name === 'Coffee Spot')?.id?.toString()  && (
          <div><label style={lbl}>Concept *</label>
            <select style={{ ...inputSt, appearance:'none', cursor:'pointer' }} {...f('concept')}>
              <option value="">Select concept</option>
              <option>Full Store</option>
              <option>Kiosk</option>
            </select>
          </div>
        )}
      </div>
      <div><label style={lbl}>Branch Manager</label><input style={inputSt} {...f('manager')} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><label style={lbl}>Contact Number</label>
          <input type="tel" style={inputSt} maxLength={11}
            value={form.contact}
            onKeyDown={e => { const allowed=['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','Control']; const isShortcut=(e.ctrlKey||e.metaKey)&&['a','c','v','x','z','y'].includes(e.key.toLowerCase()); if(!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
            onChange={e => { const digits=e.target.value.replace(/\D/g,'').slice(0,11); setForm(prev=>({...prev,contact:digits})); }} />
        </div>
        <div><label style={lbl}>Address</label><input style={inputSt} {...f('address')} /></div>
      </div>
    </div>
  );
}

// ---------DASHBOARD------------------
function DashboardContent({ transactions, brands: propBrands = [] }) {
  const today   = new Date();
  const fmt8    = (d) => d.toISOString().slice(0, 10);
  const fmtAmt  = (n) => '₱' + Number(n||0).toLocaleString('en-PH', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtShort= (n) => { if(n>=1_000_000) return '₱'+(n/1_000_000).toFixed(1)+'M'; if(n>=1_000) return '₱'+(n/1_000).toFixed(0)+'k'; return '₱'+n; };

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
                      <span style={{ fontSize:16 }}>{b.emoji||'🏪'}</span> {b.name}
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
            { label:'Sales Revenue',  value: kpiData ? kpiData.salesRevenue : null, desc:'Total income from sales pulled from POS transactions.', icon:'💰' },
            { label:'Sales Profit',   value: kpiData ? kpiData.salesProfit  : null, desc:'Net profit after deducting cost of sales from revenue.', icon:'📈' },
            { label:'Cost of Sales',  value: kpiData ? kpiData.cogs         : null, desc:'Total cost of goods sold from Inventory movements.', icon:'🧾' },
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
  const [newItem,       setNewItem]       = useState({ name:"", price:"", unit:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });

  const excelRef = useRef(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
    const data = await res.json();
    setItems(data);
  };

  const validate = () => {
    const newErrors = {};
    if (!newItem.name.trim()) newErrors.name = "Item name is required";
    if (!newItem.price) newErrors.price = "Price is required";
    else if (isNaN(newItem.price) || Number(newItem.price) <= 0) newErrors.price = "Price must be greater than 0";
    if (!newItem.stock) newErrors.stock = "Stock is required";
    else if (isNaN(newItem.stock) || Number(newItem.stock) < 0) newErrors.stock = "Stock must be 0 or more";
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
    if (editingItem.stock === "" || editingItem.stock === undefined) errs.stock = "Stock is required";
    else if (isNaN(editingItem.stock) || Number(editingItem.stock) < 0) errs.stock = "Stock must be 0 or more";
    if (!editingItem.image_url.trim()) errs.image_url = "Image URL is required";
    else { try { new URL(editingItem.image_url); } catch { errs.image_url = "Invalid URL"; } }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addItem = async () => {
    if (loading || !validate()) return;
    setLoading(true);
    await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name, price: Number(newItem.price), unit: newItem.unit,
        image_url: newItem.image_url, shop: newItem.shop, brand: newItem.brand,
        stock: Number(newItem.stock),
      }),
    });
    setNewItem({ name:"", price:"", unit:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });
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
        name: editingItem.name, price: Number(editingItem.price), unit: editingItem.unit || "",
        image_url: editingItem.image_url, shop: editingItem.shop, brand: editingItem.brand,
        stock: Number(editingItem.stock), is_visible: editingItem.is_visible,
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
          rows_to_save.push({
            name, price,
            unit:      String(row.unit      || row.Unit      || "").trim(),
            stock:     parseInt(row.stock   || row.Stock     || 0) || 0,
            shop:      String(row.shop      || row.Shop      || "Coffee Spot").trim(),
            brand:     String(row.brand     || row.Brand     || "").trim(),
            image_url: String(row.image_url || row["Image URL"] || "").trim(),
          });
        });
      });
      let saved = 0;
      for (const item of rows_to_save) {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          const d = await res.json();
          if (d.success) saved++;
        } catch {}
      }
      e.target.value = "";
      alert(`Parsed ${rows_to_save.length} row(s). Saved ${saved}.`);
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
                <Field label="Shop">
                  <select value={editingItem.shop} onChange={e => setEditingItem({...editingItem, shop:e.target.value})} style={msInputStyle}>
                    <option value="Coffee Spot">Coffee Spot</option>
                    <option value="iPharma">iPharma</option>
                  </select>
                </Field>
                <Field label="Item Name" error={editErrors.name}>
                  <input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.name ? "#e53935" : C.border}` }} placeholder="e.g. Espresso"/>
                </Field>
                <Field label="Brand (Optional)">
                  <input value={editingItem.brand || ""} onChange={e => setEditingItem({...editingItem, brand:e.target.value})} style={msInputStyle} placeholder="e.g. Nescafé"/>
                </Field>
                <Field label="Price" error={editErrors.price}>
                  <input value={editingItem.price} onChange={e => setEditingItem({...editingItem, price:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
                </Field>
                <Field label="Unit (Optional)">
                  <input value={editingItem.unit || ""} onChange={e => setEditingItem({...editingItem, unit:e.target.value})}
                    style={msInputStyle} placeholder="e.g. per cup, per bottle"/>
                </Field>
                <Field label="Stock" error={editErrors.stock}>
                  <input type="number" value={editingItem.stock} onChange={e => setEditingItem({...editingItem, stock:e.target.value})}
                    style={{ ...msInputStyle, border:`1px solid ${editErrors.stock ? "#e53935" : C.border}` }} placeholder="0"/>
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
            <Field label="Shop">
              <select value={newItem.shop} onChange={e => setNewItem({...newItem, shop:e.target.value})} style={msInputStyle}>
                <option value="Coffee Spot">Coffee Spot</option>
                <option value="iPharma">iPharma</option>
              </select>
            </Field>
            <Field label="Item Name" error={errors.name}>
              <input value={newItem.name} onChange={e => setNewItem({...newItem, name:e.target.value})}
                style={{ ...msInputStyle, border:`1px solid ${errors.name ? "#e53935" : C.border}` }} placeholder="e.g. Espresso"/>
            </Field>
            <Field label="Brand (Optional)">
              <input value={newItem.brand} onChange={e => setNewItem({...newItem, brand:e.target.value})} style={msInputStyle} placeholder="e.g. Nescafé"/>
            </Field>
            <Field label="Price" error={errors.price}>
              <input value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})}
                style={{ ...msInputStyle, border:`1px solid ${errors.price ? "#e53935" : C.border}` }} placeholder="0.00"/>
            </Field>
            <Field label="Unit (Optional)">
              <input value={newItem.unit} onChange={e => setNewItem({...newItem, unit:e.target.value})}
                style={msInputStyle} placeholder="e.g. per cup, per bottle"/>
            </Field>
            <Field label="Stock" error={errors.stock}>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock:e.target.value})}
                style={{ ...msInputStyle, border:`1px solid ${errors.stock ? "#e53935" : C.border}` }} placeholder="0"/>
            </Field>
            <Field label="Image URL" error={errors.image_url}>
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
            Excel columns: <strong>name</strong>, <strong>price</strong>, <strong>stock</strong> — <em>shop</em>, <em>brand</em>, <em>unit</em>, <em>image_url</em> optional.
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
                  {["Image","Shop","Item Name","Brand","Price","Unit","Stock","Status",""].map((label, i) => (
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
                        <img src={item.image_url} alt="" style={{ width:48, height:48, borderRadius:8, objectFit:"cover", border:`1px solid ${C.border}`, display:"block" }} onError={e => (e.target.style.display="none")}/>
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c" }}>{item.shop}</span>
                      </td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>{item.name}</td>
                      <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.brand || <span style={{ fontStyle:"italic" }}>—</span>}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                      <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.unit || <span style={{ fontStyle:"italic" }}>—</span>}</td>
                      <td style={{ padding:"10px 12px", fontWeight:500, color:C.ink }}>{item.stock}</td>
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
function ApplicationsContent({ applications: initialApps }) {
  const [applications, setApplications] = useState(initialApps);
  const [viewApp,      setViewApp]      = useState(null);
  const [accountApp,   setAccountApp]   = useState(null);

  const handleApprove = async (id) => {
    try {
      await fetch(`/applications/${id}/approve`, { method: "PUT" });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
    } catch { alert("Failed to approve application."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await fetch(`/applications/${id}`, { method: "DELETE" });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { alert("Failed to delete application."); }
  };

  const StatusBadge = ({ status }) => {
    const map = {
      pending:  { bg:'rgba(245,158,11,0.1)',  color:'#d97706' },
      approved: { bg:'rgba(16,185,129,0.1)',  color:'#059669' },
      rejected: { bg:'rgba(239,68,68,0.1)',   color:'#dc2626' },
    };
    const s = map[status] || map['pending'];
    return <span style={{ background:s.bg, color:s.color, padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>{status?.toUpperCase()}</span>;
  };

  return (
    <>
      {viewApp && (
        <div onClick={() => setViewApp(null)} style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:500, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, fontWeight:800, color:'#0d2b1e', margin:0 }}>Application Details</h2>
              <button onClick={() => setViewApp(null)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #b2dfdb', background:'#e0f2f1', cursor:'pointer', color:'#00695c', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
            </div>
            <p style={{ fontSize:13, color:'#5a7a65', marginBottom:20 }}>Viewing details for: <strong style={{ color:'#0d2b1e' }}>{viewApp.name}</strong></p>
            {[['Full Name',viewApp.name],['Email Address',viewApp.email],['Phone Number',viewApp.phone],['Franchise Interest',viewApp.franchise],['Date Applied',viewApp.date],['Status',viewApp.status?.toUpperCase()]].map(([label, val]) => (
              <div key={label} style={{ marginBottom:14 }}>
                <label style={bmLabel}>{label}</label>
                <div style={{ ...bmInput, background:'#f8fffe', cursor:'default', color:'#0d2b1e', display:'flex', alignItems:'center' }}>{val}</div>
              </div>
            ))}
            {viewApp.message && (
              <div style={{ marginBottom:14 }}>
                <label style={bmLabel}>Message</label>
                <div style={{ ...bmInput, background:'#f8fffe', minHeight:70, whiteSpace:'pre-wrap', lineHeight:1.6 }}>{viewApp.message}</div>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:22 }}>
              <button onClick={() => setViewApp(null)} style={{ padding:'9px 22px', borderRadius:10, border:'1px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {accountApp && <CreateAccountModal applicant={accountApp} onClose={() => setAccountApp(null)} />}

      <div style={{ fontFamily:"'Montserrat', sans-serif" }}>


        {/* stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {[
            { label:'Total Applications', value:applications.length,                                           icon:<FileCheck size={20} color="#065f46"/>, bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'All time' },
            { label:'Pending Review',     value:applications.filter(a=>a.status==='pending').length,           icon:<AlertTriangle size={20} color="#92400e"/>, bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Awaiting action' },
            { label:'Approved',           value:applications.filter(a=>a.status==='approved').length,          icon:<Check size={20} color="#065f46"/>, bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Successful' },
            { label:'Rejected',           value:applications.filter(a=>a.status==='rejected').length,          icon:<X size={20} color="#7f1d1d"/>, bg:'linear-gradient(135deg,#fee2e2,#fca5a5)', sub:'Not approved' },
          ].map((s, i) => <BmStatCard key={i} {...s} />)}
        </div>

        <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Applications List</span>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Export CSV
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:900 }}>
              <thead>
                <tr>
                  {['Applicant Name','Email','Phone','Franchise Interest','Date Applied','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:800, fontSize:10.5, color:'#00897b', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:`1px solid ${C.border}`, background:'#f8fffe', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                    onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:'#0d2b1e' }}>{app.name}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{app.email}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{app.phone}</td>
                    <td style={{ padding:'12px 14px', color:'#0d2b1e', fontWeight:600 }}>{app.franchise}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{app.date}</td>
                    <td style={{ padding:'12px 14px' }}><StatusBadge status={app.status} /></td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={() => setViewApp(app)} style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:28, padding:'0 10px' }}>View</button>
                          <button onClick={() => setAccountApp(app)} style={{ ...smallBtnSt, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', height:28, padding:'0 10px' }}>+ Account</button>
                        </div>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={() => handleApprove(app.id)} disabled={app.status==="approved"}
                            style={{ ...smallBtnSt, border:'none', background:app.status==="approved"?'#e0e0e0':'linear-gradient(135deg,#00c853,#00897b)', color:app.status==="approved"?'#9e9e9e':'#fff', height:28, padding:'0 10px', opacity:app.status==="approved"?0.6:1 }}>
                            Approve
                          </button>
                          <button onClick={() => handleDelete(app.id)} style={{ ...smallBtnSt, border:'1.5px solid #fecaca', background:'#fee2e2', color:'#dc2626', height:28, padding:'0 10px' }}>Delete</button>
                        </div>
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
  returned: { label:"Returned", bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
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
  const [returnReport,  setReturnReport]  = useState(null);
  const [remarkText,    setRemarkText]    = useState("");
  const [commentText,   setCommentText]   = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

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

  // ── Return ──────────────────────────────────────────────────────
  const handleReturn = async (id) => {
    if (!remarkText.trim()) { alert("Please enter a return reason."); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/reports/${id}/return`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ remark: remarkText.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      patchReport(updated);
      setReturnReport(null);
      setRemarkText("");
    } catch {
      alert("Failed to return report. Please try again.");
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
        onClick:() => { setViewReport(report); setOpenDropdown(null); },
      },
      {
        label:"Approve", icon:<Check size={13}/>, bg:"linear-gradient(135deg,#2E7D32,#00897b)", border:"none", textColor:"#fff",
        disabled: report.status === "approved",
        onClick:() => { setApproveReport(report); setOpenDropdown(null); },
      },
      {
        label:"Comment", icon:<MessageCircle size={13}/>, color:"#1e40af", bg:"#dbeafe", border:"#93c5fd",
        badge: report.comments?.length || 0,
        onClick:() => { setCommentReport(report); setOpenDropdown(null); },
      },
      {
        label:"Return", icon:<X size={13}/>, color:"#dc2626", bg:"#fff", border:"#fecaca",
        disabled: report.status === "returned" || report.status === "approved",
        onClick:() => { setReturnReport(report); setRemarkText(""); setOpenDropdown(null); },
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
        <ModalShell title={`Report #${viewReport.id}`} subtitle={viewReport.brand + " · " + viewReport.branch} icon={<FileText size={16} color="#fff"/>} onClose={() => setViewReport(null)}>
          <ReportMetaGrid report={viewReport}/>
          <div style={{ marginBottom:16, padding:"14px", background:"#f8fffe", borderRadius:12, border:"1.5px dashed #b2dfdb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#6ee7b7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <FileText size={17} color="#00897b"/>
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Report #{viewReport.id}</div>
                <div style={{ fontSize:11, color:"#5a7a65" }}>{viewReport.period}</div>
              </div>
            </div>
            <button
              onClick={() => handleExport()}
              style={{ ...bmActionBtn, background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", border:"none" }}>
              <Download size={11}/> Export CSV
            </button>
          </div>
          {viewReport.remark && (
            <div style={{ marginBottom:16, padding:"12px 14px", background:"#fff3e0", borderRadius:12, border:"1px solid #ffcc80" }}>
              <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#e65100", marginBottom:4 }}>Return Remark</div>
              <div style={{ fontSize:13, color:"#bf360c" }}>{viewReport.remark}</div>
            </div>
          )}
          {viewReport.comments?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:8 }}>Comments ({viewReport.comments.length})</div>
              {viewReport.comments.slice(-2).map((c, i) => (
                <div key={c.id || i} style={{ padding:"9px 12px", background:"#f0fdf5", borderRadius:10, border:"1px solid #d1eedd", marginBottom:6, fontSize:12, color:"#0d2b1e" }}>
                  <span style={{ fontWeight:700, color:"#00897b" }}>{c.author}</span>
                  <span style={{ color:"#5a7a65", marginLeft:8, fontSize:11 }}>{fmtDate(c.postedAt)}</span>
                  <div style={{ marginTop:4 }}>{c.text}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <StatusBadge status={viewReport.status}/>
            <button onClick={() => setViewReport(null)} style={{ padding:"8px 20px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Close</button>
          </div>
        </ModalShell>
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

      {/* RETURN modal */}
      {returnReport && (
        <ModalShell title={`Return Report #${returnReport.id}`} subtitle={returnReport.brand + " · " + returnReport.branch} icon={<X size={16} color="#fff"/>} onClose={() => setReturnReport(null)} maxWidth={440}>
          <ReportMetaGrid report={returnReport}/>
          <div style={{ marginBottom:18 }}>
            <label style={bmLabel}>Reason for Return</label>
            <textarea value={remarkText} onChange={e => setRemarkText(e.target.value)} placeholder="Explain what needs to be corrected or resubmitted..." rows={4}
              style={{ ...bmInput, marginTop:4, resize:"vertical", lineHeight:1.6 }}/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => setReturnReport(null)} style={{ padding:"9px 20px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={() => handleReturn(returnReport.id)} disabled={actionLoading}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontSize:13, fontWeight:700, cursor:actionLoading?"not-allowed":"pointer", opacity:actionLoading?0.7:1, fontFamily:"inherit" }}>
              {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <X size={13}/>} Confirm Return
            </button>
          </div>
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
                      <td style={{ padding:"11px 14px", fontWeight:800, color:"#0d2b1e", fontSize:12 }}>#{report.id}</td>
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
function UsersContent() {
  const [users,        setUsers]        = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal,setShowEditModal]= useState(false);
  const [editingUser,  setEditingUser]  = useState(null);
  const [formData,     setFormData]     = useState({ name:'', email:'', role:'', branch:'', password:'' });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordErrors,         setPasswordErrors]         = useState([]);
  const [showPassword,           setShowPassword]           = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const response = await fetch(`${process.env.REACT_APP_API_URL}/users`); const data = await response.json(); setUsers(data); }
    catch (error) { console.error("Error fetching users:", error); alert("Failed to load users"); }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password))    errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
    return { isValid:errors.length===0, errors };
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const passwordCheck = validatePasswordStrength(formData.password);
    if (!passwordCheck.isValid) { alert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character"); return; }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(formData) });
      const data = await response.json();
      if (data.success) { await fetchUsers(); setShowAddModal(false); resetForm(); alert('User added successfully!'); }
      else alert(data.error||'Failed to add user');
    } catch (error) { console.error("Error adding user:", error); alert("Failed to add user"); }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${editingUser.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(formData) });
      const data = await response.json();
      if (data.success) { await fetchUsers(); setShowEditModal(false); setEditingUser(null); resetForm(); alert('User updated successfully!'); }
      else alert(data.error||'Failed to update user');
    } catch (error) { console.error("Error updating user:", error); alert("Failed to update user"); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, { method:"DELETE" });
        const data = await response.json();
        if (data.success) { await fetchUsers(); alert('User deleted successfully!'); }
        else alert(data.error||'Failed to delete user');
      } catch (error) { console.error("Error deleting user:", error); alert("Failed to delete user"); }
    }
  };

  const openEditModal     = (user) => { setEditingUser(user); setFormData({ name:user.name, email:user.email, role:user.role, branch:user.branch, password:'' }); setShowEditModal(true); setShowPassword(false); };
  const resetForm         = () => { setFormData({ name:'', email:'', role:'', branch:'', password:'' }); setShowPasswordValidation(false); setPasswordErrors([]); setShowPassword(false); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]:value })); };

  const handleGeneratePassword = () => {
    const generated = generateTempPassword();
    setFormData(prev => ({ ...prev, password: generated }));
    setShowPasswordValidation(true);
    setPasswordErrors([]);
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

  const pwChange = (e) => {
    handleInputChange(e);
    const v = e.target.value;
    if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
    else   { setShowPasswordValidation(false); setPasswordErrors([]); }
  };

  const UserModal = ({ title, onSubmit, onClose, isEdit }) => (
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
              <input type={type} name={name} value={formData[name]} onChange={handleInputChange} required
                style={{ ...bmInput, marginTop:4 }} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Role</label>
            <select name="role" value={formData.role} onChange={handleInputChange} required style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
              <option value="">Select Role</option>
              {['Administrator','Franchisor','Franchisee','Manager','Staff'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={bmLabel}>Branch</label>
            <select name="branch" value={formData.branch} onChange={handleInputChange} required style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
              <option value="">Select Branch</option>
              {['Head Office','Branch A','Branch B','Branch C'].map(b => <option key={b}>{b}</option>)}
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
              <Check size={14}/> {isEdit ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
 

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Users',    value:users.length,                                                    icon:<Users size={20} color="#065f46"/>,       bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'All accounts' },
          { label:'Administrators', value:users.filter(u=>u.role==='Administrator').length,                icon:<User size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
          { label:'Franchisees',    value:users.filter(u=>u.role==='Franchisee').length,                   icon:<Store size={20} color="#065f46"/>,       bg:'linear-gradient(135deg,#dbeafe,#93c5fd)', sub:'Branch owners' },
          { label:'Staff',          value:users.filter(u=>u.role==='Staff'||u.role==='Manager').length,    icon:<Users size={20} color="#92400e"/>,       bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Operational' },
        ].map((s, i) => <BmStatCard key={i} {...s} />)}
      </div>

      <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>User Accounts</span>
          <button onClick={() => setShowAddModal(true)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            <Plus size={14}/> Add New User
          </button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['Name','Email','Role','Branch','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:800, fontSize:10.5, color:'#00897b', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:`1px solid ${C.border}`, background:'#f8fffe' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                  onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:'12px 14px', fontWeight:700, color:'#0d2b1e' }}>{user.name}</td>
                  <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.email}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ background:'#e0f2f1', color:'#00695c', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{user.role}</span>
                  </td>
                  <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.branch}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ background:'rgba(16,185,129,0.1)', color:'#059669', padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                      {user.status ? user.status.toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEditModal(user)} style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:28, padding:'0 12px' }}>
                        <Pencil size={11}/> Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} style={{ ...smallBtnSt, border:'1.5px solid #fecaca', background:'#fee2e2', color:'#dc2626', height:28, padding:'0 12px' }}>
                        <Trash2 size={11}/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal  && <UserModal title="Add New User" onSubmit={handleAddUser}  onClose={() => setShowAddModal(false)}  isEdit={false} />}
      {showEditModal && <UserModal title="Edit User"    onSubmit={handleEditUser} onClose={() => { setShowEditModal(false); setEditingUser(null); }} isEdit={true} />}
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
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [viewingItem, setViewingItem]     = useState(null);

  // Load user from localStorage (mirrors AsyncStorage.getItem("user"))
  const [commUser, setCommUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const isAdminUser = (u) => u?.role?.toLowerCase() === "administrator";

  // ── Persist pins in localStorage (mirrors AsyncStorage PIN_STORAGE_KEY) ──
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
  pending:    { label:"Pending",    bg:"#faeeda", color:"#633806", dot:"#BA7517" },
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

  useEffect(() => {fetchOrders(); }, []);

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

  const allBrands   = [...new Set(orders.map(o => o.brand))];
  const allBranches = [...new Set(orders.map(o => o.branch))];

  const fmtPeso = (n) => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true });

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
    pending:    orders.filter(o => o.status === "pending").length,
    in_transit: orders.filter(o => o.status === "in_transit").length,
    received:   orders.filter(o => o.status === "received").length,
  };

  const StatusBadge = ({ status }) => {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
        {s.label}
      </span>
    );
  };

  const ActionButtons = ({ order }) => {
    const flow = STATUS_FLOW[order.status];
    if (!flow) return <span style={{ fontSize:11, color:"#5a7a65", fontWeight:600 }}>Completed</span>;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <button
          onClick={() => advanceStatus(order.id, flow.nextStatus)}
          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff" }}>
          <Check size={11} /> {flow.nextAction}
        </button>
        {flow.secondAction && (
          <button
            onClick={() => advanceStatus(order.id, flow.secondStatus)}
            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"1px solid #fecaca", background:"#fff", color:"#dc2626" }}>
            <X size={11} /> {flow.secondAction}
          </button>
        )}
      </div>
    );
  };

  if (loadingData) return (
    <div style={{ padding:60, textAlign:"center", color:"#5a7a65", fontFamily:"'Montserrat',sans-serif" }}>
      Loading orders…
    </div>
  );

  if (error) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ color:"#dc2626", marginBottom:12 }}>{error}</div>
      <button onClick={fetchOrders}
        style={{ padding:"8px 20px", borderRadius:8, border:"1px solid #d1eedd", background:"#e0f2f1", color:"#00695c", fontWeight:700, cursor:"pointer" }}>
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif" }}>

      {/* ── View Order Modal ── */}
      {viewOrder && (
        <div onClick={() => setViewOrder(null)}
          style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", maxHeight:"92vh", overflowY:"auto" }}>

            {/* Modal header */}
            <div style={{ background:"linear-gradient(135deg,#2E7D32,#00897b)", borderRadius:"20px 20px 0 0", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <Package size={16} color="#fff" />
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Order #{viewOrder.id}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 }}>{fmtDate(viewOrder.createdAt)}</div>
                </div>
              </div>
              <button onClick={() => setViewOrder(null)}
                style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding:"22px 24px" }}>
              {/* Customer */}
              <div style={{ marginBottom:18, padding:"12px 14px", background:"#f0fdf5", borderRadius:12, border:"1px solid #d1eedd" }}>
                <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:6 }}>Customer</div>
                <div style={{ fontWeight:800, fontSize:14, color:"#0d2b1e" }}>{viewOrder.customer}</div>
                <div style={{ fontSize:12, color:"#5a7a65", marginTop:2 }}>{viewOrder.phone}</div>
              </div>
              {/* Delivery Address */}
              <div style={{ marginBottom:18, padding:"12px 14px", background:"#fffdf0", borderRadius:12, border:"1px solid #e8d5a3", display:"flex", gap:8, alignItems:"flex-start" }}>
                <MapPin size={14} color="#8a6a00" style={{ marginTop:2, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#8a6a00", marginBottom:4 }}>Delivery Address</div>
                  <div style={{ fontWeight:600, fontSize:13, color:"#0d2b1e" }}>{viewOrder.address || "—"}</div>
                </div>
              </div>

              {/* Brand / Branch */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                {[{ label:"Brand", value:viewOrder.brand }, { label:"Branch", value:viewOrder.branch }].map(({ label, value }, i) => (
                    <div key={label} style={{ padding:"10px 12px", background: i === 0 ? "#e0f2f1" : "#f8fffe", borderRadius:10, border: i === 0 ? "1px solid #b2dfdb" : "1px solid #e0f2f1" }}>
                      <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:3 }}>{label}</div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{value}</div>
                    </div>
                  ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:8 }}>Order Items</div>
                {viewOrder.items.length === 0 ? (
                  <div style={{ fontSize:12, color:"#5a7a65", fontStyle:"italic", padding:"10px 12px" }}>No item details available.</div>
                ) : viewOrder.items.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:8, background:i%2===0?"#f8fffe":"#fff", border:"1px solid #e0f2f1", marginBottom:4 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#5a7a65" }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:13, color:"#00897b" }}>{fmtPeso(item.price * item.qty)}</div>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop:8 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Total</div>
                  <div style={{ fontWeight:800, fontSize:16, color:"#00897b" }}>{fmtPeso(viewOrder.total)}</div>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <StatusBadge status={viewOrder.status} />
                <ActionButtons order={viewOrder} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.16em", textTransform:"uppercase", color:"#00897b", marginBottom:4 }}>Orders</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#0d2b1e", margin:0 }}>Mobile Orders</h1>
        </div>
        <button onClick={fetchOrders}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"1px solid #d1eedd", background:"#e0f2f1", color:"#00695c", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <BmStatCard label="Total Orders"  value={counts.total}      icon={<Package size={20} color="#065f46"/>}       bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All time" />
        <BmStatCard label="Pending"       value={counts.pending}    icon={<AlertTriangle size={20} color="#92400e"/>}  bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting action" />
        <BmStatCard label="In Transit"    value={counts.in_transit} icon={<TrendingUp size={20} color="#1e40af"/>}     bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="On the way" />
        <BmStatCard label="Received"      value={counts.received}   icon={<Check size={20} color="#065f46"/>}          bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed" />
      </div>

      {/* ── Order list ── */}
      <BmSection>
        <BmSectionHeader title="Order List" icon={<Package size={16} color="#fff" />} />

        {/* Filters */}
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f8f0", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", background:"#f8fffe" }}>
          <div style={{ position:"relative" }}>
            <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search order # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...bmInput, paddingLeft:30, width:220, height:34 }}
            />
          </div>
          {[
            { label:"Brand",  value:filterBrand,  set:setFilterBrand,  options:allBrands },
            { label:"Branch", value:filterBranch, set:setFilterBranch, options:allBranches },
            { label:"Status", value:filterStatus, set:setFilterStatus, options:["pending","accepted","in_transit","received","rejected"], labelMap: k => STATUS_CONFIG[k]?.label || k },
          ].map(({ label, value, set, options, labelMap }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65" }}>{label}</span>
              <select value={value} onChange={e => set(e.target.value)}
                style={{ ...bmInput, width:"auto", height:34, paddingRight:12, appearance:"none", cursor:"pointer" }}>
                <option value="all">All</option>
                {options.map(o => <option key={o} value={o}>{labelMap ? labelMap(o) : o}</option>)}
              </select>
            </div>
          ))}
          <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:900 }}>
            <thead>
              <tr>
                {["Order #","Customer","Brand","Branch","Items","Total","Date Placed","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:"1px solid #d1eedd", background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding:"48px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>
                    No orders match the current filters.
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr key={order.id}
                  onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  style={{ borderBottom:"1px solid #f0f8f0" }}>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:"#0d2b1e", fontSize:12 }}>#{order.id}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontWeight:700, color:"#0d2b1e", fontSize:13 }}>{order.customer}</div>
                    <div style={{ fontSize:11, color:"#5a7a65" }}>{order.phone}</div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:400, background:"#f8fffe", color:"#5a7a65" }}>{order.brand}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:"#e0f2f1", color:"#00695c" }}>{order.branch}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <button
                      onClick={() => setViewOrder(order)}
                      style={{ ...bmActionBtn, borderColor:"#b2dfdb", background:"#e0f2f1", color:"#00695c", fontSize:11 }}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} →
                    </button>
                  </td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:"#00897b" }}>{fmtPeso(order.total)}</td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ padding:"11px 14px" }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding:"11px 14px" }}><ActionButtons order={order} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BmSection>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function ProfileContent({ user }) {
  const [formData, setFormData] = useState({ name:user.name, email:user.email, personalEmail:'', role:user.role, currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showOtpModal,     setShowOtpModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp,              setOtp]              = useState('');
  const [otpSent,          setOtpSent]          = useState(false);
  const [otpError,         setOtpError]         = useState('');
  const [passwordErrors,   setPasswordErrors]   = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]:value }));
    if (name === 'newPassword') {
      if (value) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(value).errors); }
      else       { setShowPasswordValidation(false); setPasswordErrors([]); }
    }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('minLength');
    if (!/[A-Z]/.test(password)) errors.push('uppercase');
    if (!/[a-z]/.test(password)) errors.push('lowercase');
    if (!/\d/.test(password))    errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('specialChar');
    return { isValid:errors.length===0, errors };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:emailToSend }) });
      const data = await response.json();
      if (data.success) { setOtpSent(true); alert(`OTP has been sent to ${emailToSend}`); }
      else alert(data.message||data.error||'Failed to send OTP');
    } catch (error) { console.error("Error sending OTP:", error); alert("Failed to send OTP. Please try again."); }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError('');
      const emailToVerify = formData.personalEmail || formData.email;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/password`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ currentPassword:formData.currentPassword, newPassword:formData.newPassword, email:emailToVerify, otp:otp.trim() }) });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false); setShowSuccessModal(true);
        localStorage.removeItem('user'); localStorage.removeItem('tempUser');
        setTimeout(() => { window.location.href = '/admin-login'; }, 3000);
      } else setOtpError(data.error||'Failed to change password');
    } catch (error) { console.error("Error changing password:", error); setOtpError("Failed to change password. Please try again."); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (isPasswordChange) {
      if (!formData.currentPassword) { alert('Please enter your current password'); return; }
      if (!formData.newPassword)     { alert('Please enter a new password'); return; }
      const pv = validatePasswordStrength(formData.newPassword);
      if (!pv.isValid) { alert('Please ensure your password meets all the requirements'); return; }
      if (formData.newPassword !== formData.confirmPassword) { alert('New passwords do not match!'); return; }
      if (!formData.personalEmail && !formData.email) { alert('Please provide an email address to receive OTP'); return; }
      sendOtp(); setShowOtpModal(true);
    } else updateProfile();
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:formData.name, email:formData.email, role:formData.role, branch:user.branch }) });
      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        const updatedUser = {...user, name:formData.name, email:formData.email};
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else alert(data.error||'Failed to update profile');
    } catch (error) { console.error("Error updating profile:", error); alert("Failed to update profile. Please try again."); }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      setFormData({ name:user.name, email:user.email, personalEmail:'', role:user.role, currentPassword:'', newPassword:'', confirmPassword:'' });
      setOtp(''); setOtpSent(false); setShowOtpModal(false);
    }
  };

  const PwValidation = () => (
    <div style={{ marginTop:8, fontSize:12, padding:'10px 14px', background:'#f0fdf5', borderRadius:10, border:'1.5px solid #b2dfdb' }}>
      <div style={{ marginBottom:6, fontWeight:700, color:'#0d2b1e', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em' }}>Password must contain:</div>
      {[['minLength','At least 8 characters'],['uppercase','Uppercase letter (A-Z)'],['lowercase','Lowercase letter (a-z)'],['number','Number (0-9)'],['specialChar','Special character (!@#$%^&*...)']].map(([key,text]) => (
        <div key={key} style={{ color:passwordErrors.includes(key)?'#dc2626':'#059669', marginBottom:3, fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
          <span>{passwordErrors.includes(key)?'✗':'✓'}</span> {text}
        </div>
      ))}
    </div>
  );

  const FormField = ({ label, name, type='text', placeholder='', disabled=false, hint }) => (
    <div style={{ marginBottom:16 }}>
      <label style={bmLabel}>{label}</label>
      <input type={type} name={name} value={formData[name]} onChange={handleInputChange}
        placeholder={placeholder} disabled={disabled}
        style={{ ...bmInput, marginTop:4, background:'#f0fdf5', color:disabled?C.muted:'#0d2b1e', cursor:disabled?'not-allowed':'text' }}/>
      {hint && <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>{hint}</p>}
    </div>
  );

  // Derive initials (up to 2 chars) for avatar
  const initials = user.name
    ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>

      {/* ── Account Overview Card ── */}
      <div style={{
        background: C.white,
        border: '1px solid rgba(0,168,76,0.12)',
        borderRadius: 18,
        boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Account Overview</span>
        </div>
        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>

          {/* Avatar */}
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#00695c',
            flexShrink: 0, letterSpacing: 1,
            border: '2.5px solid #a7f3d0',
          }}>
            {initials}
          </div>

          {/* Name + email + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#0d2b1e', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5a7a65" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
              </svg>
              {user.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(0,137,123,0.1)', color: '#00695c',
                padding: '3px 12px', borderRadius: 20,
                fontSize: 11, fontWeight: 700,
              }}>
                {user.role}
              </span>
              {user.branch && (
                <span style={{
                  background: '#f0fdf5', color: '#0d2b1e',
                  padding: '3px 12px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700,
                  border: '1.5px solid #b2dfdb',
                }}>
                  {user.branch}
                </span>
              )}
            </div>
          </div>

          {/* Right: stat pills */}
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

      {/* ── Two-column: Personal Info + Change Password ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>

        {/* Profile info card */}
        <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px' }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Personal Information</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding:'22px 24px' }}>
            <FormField label="Full Name" name="name" />
            <FormField label="Work Email Address" name="email" type="email" />
            <FormField label="Personal Email (Optional)" name="personalEmail" type="email" placeholder="your.personal@email.com"
              hint="OTP for password changes will be sent here" />
            <FormField label="Role" name="role" disabled />
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button type="button" onClick={handleCancel}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button type="submit"
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.28)' }}>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Password card */}
        <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px' }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Change Password</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding:'22px 24px' }}>
            <div style={{ background:'#f0fdf5', borderRadius:12, padding:'12px 16px', marginBottom:20, border:`1.5px solid ${C.border}`, fontSize:12, color:C.muted, display:'flex', alignItems:'center', gap:8 }}>
              🔐 An OTP will be sent to your email for verification
            </div>
            <FormField label="Current Password" name="currentPassword" type="password" placeholder="Enter current password" />
            <div style={{ marginBottom:16 }}>
              <label style={bmLabel}>New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}
                placeholder="Enter new password" style={{ ...bmInput, marginTop:4 }}/>
              {showPasswordValidation && <PwValidation/>}
            </div>
            <FormField label="Confirm New Password" name="confirmPassword" type="password" placeholder="Confirm new password" />
            <button type="submit"
              style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.28)' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:440, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#d1fae5,#6ee7b7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'1.6rem' }}>🔑</div>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, fontWeight:800, color:'#0d2b1e', marginBottom:6 }}>Verify OTP</h2>
              <p style={{ fontSize:13, color:C.muted }}>Code sent to <strong style={{ color:'#0d2b1e' }}>{formData.personalEmail||formData.email}</strong></p>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={bmLabel}>Enter 6-Digit OTP</label>
              <input type="text" placeholder="000000" value={otp}
                onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,6); setOtp(v); setOtpError(''); }}
                maxLength={6} autoFocus
                style={{ ...bmInput, marginTop:6, fontSize:24, textAlign:'center', letterSpacing:'0.6rem', fontFamily:'monospace' }}/>
            </div>
            {otpSent && !otpError && (
              <div style={{ padding:'10px 14px', background:'rgba(16,185,129,0.08)', borderRadius:10, border:'1px solid #a7f3d0', color:'#059669', fontSize:12, fontWeight:700, textAlign:'center', marginBottom:12 }}>
                ✅ OTP sent successfully
              </div>
            )}
            {otpError && (
              <div style={{ padding:'10px 14px', background:'#fee2e2', borderRadius:10, border:'1.5px solid #fecaca', color:'#dc2626', fontSize:12, fontWeight:700, textAlign:'center', marginBottom:12 }}>
                ❌ {otpError}
              </div>
            )}
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <button type="button" onClick={sendOtp} style={{ background:'none', border:'none', color:'#00897b', cursor:'pointer', fontSize:12, fontWeight:700, textDecoration:'underline' }}>Resend OTP</button>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={verifyOtpAndChangePassword} disabled={otp.length!==6}
                style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:800, cursor:otp.length!==6?'not-allowed':'pointer', fontFamily:'inherit', opacity:otp.length!==6?0.5:1 }}>
                Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
          <div style={{ background:C.white, borderRadius:20, padding:'40px 36px', maxWidth:420, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#d1fae5,#6ee7b7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2.2rem' }}>✅</div>
            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:22, fontWeight:800, color:'#0d2b1e', marginBottom:10 }}>Password Changed!</h2>
            <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:20 }}>Your password has been updated successfully.<br/>You'll be redirected to login shortly.</p>
            <div style={{ background:'#f0fdf5', borderRadius:12, padding:'10px 16px', fontSize:12, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              💡 Use your new password on the next login
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

function CreateAccountModal({ applicant, onClose }) {
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
    const brand  = form.brand.value; 
    const role   = form.role.value;
    const branch = form.branch.value;

    setSending(true);
    try {
      const userRes = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: tempPassword, role, brand, branch }),
      });
      if (!userRes.ok) {
        const err = await userRes.json();
        alert(err.error || "Failed to create account.");
        setSending(false);
        return;
      }
      await fetch(`${process.env.REACT_APP_API_URL}/api/send-credentials`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name, password: tempPassword }),
      });
      alert(`Account created and credentials sent to ${email}!`);
      onClose();
    } catch (err) {
      alert("Something went wrong. Please try again.");
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
                <option key={br.id} value={br.id}>{br.name}</option>
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
// POS
// ─────────────────────────────────────────────────────────────────────────────
function POSContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";

  const brandList = propBrands.length > 0 ? propBrands : [
    { id: "ipharma",     name: "iPharma",       branches: ["Main Branch","Alabang","Makati","Pasay","Paranaque"] },
    { id: "coffeespot", name: "Coffee Spot",  branches: ["HQ","BGC Branch","Ortigas","Cubao"] },
  ];

  const [menuItems,        setMenuItems]        = useState([]);
  const [shopItems,        setShopItems]        = useState([]);
  const [cart,             setCart]             = useState([]);
  const [transactions,     setTransactions]     = useState([]);
  const [loadingTx,        setLoadingTx]        = useState(false);
  const [activeShop,       setActiveShop]       = useState("Coffee Spot");
  const [activeBranch,     setActiveBranch]     = useState(isAdmin ? "" : userBranch);
  const [searchProduct,    setSearchProduct]    = useState("");
  const [txSearch,         setTxSearch]         = useState("");
  const [txDateFrom,       setTxDateFrom]       = useState("");
  const [txDateTo,         setTxDateTo]         = useState("");
  const [activeTab,        setActiveTab]        = useState("cashier");
  const [paymentMethod,    setPaymentMethod]    = useState("Cash");
  const [cashReceived,     setCashReceived]     = useState("");
  const [discountPct,      setDiscountPct]      = useState(0);
  const [vatEnabled,       setVatEnabled]       = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt,      setLastReceipt]      = useState(null);
  const [processing,       setProcessing]       = useState(false);
  const [txPage,           setTxPage]           = useState(0);
  const [noteInput,        setNoteInput]        = useState("");

  const VAT_RATE     = 0.12;
  const TX_PAGE_SIZE = 20;
  const fmtPHP       = n => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

  const fetchProducts = useCallback(async () => {
    try {
      const branchQ = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
      const menuRes = await fetch(`${process.env.REACT_APP_API_URL}/inventory${branchQ}`);
      const menuData = await menuRes.json();
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch { setMenuItems([]); }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const q   = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions${q}`);
      const d   = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch { setTransactions([]); }
    finally { setLoadingTx(false); }
  }, [activeBranch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setTxPage(0); }, [txSearch, txDateFrom, txDateTo]);

  const allProducts = useMemo(() => {
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
      if (existing) return prev.map(c => c.id === product.id && c.source === product.source ? { ...c, qty:c.qty+1 } : c);
      return [...prev, { ...product, qty:1 }];
    });
  };

  const updateQty = (id, source, delta) => {
    setCart(prev => prev.map(c => c.id===id && c.source===source ? { ...c, qty:Math.max(0,c.qty+delta) } : c).filter(c => c.qty > 0));
  };

  const removeFromCart = (id, source) => setCart(prev => prev.filter(c => !(c.id===id && c.source===source)));
  const clearCart = () => { setCart([]); setCashReceived(""); setDiscountPct(0); setNoteInput(""); };

  const subtotal      = cart.reduce((s, c) => s + (c.price||0)*c.qty, 0);
  const discountAmt   = subtotal * (discountPct/100);
  const discountedAmt = subtotal - discountAmt;
  const vatAmt        = vatEnabled ? discountedAmt * VAT_RATE : 0;
  const totalAmt      = discountedAmt + vatAmt;
  const changeDue     = paymentMethod==="Cash" ? Math.max(0, parseFloat(cashReceived||0) - totalAmt) : 0;
  const cashShortfall = paymentMethod==="Cash" && cashReceived!=="" ? parseFloat(cashReceived||0) - totalAmt : 0;

  const processSale = async () => {
    if (cart.length === 0) { alert("Cart is empty."); return; }
    if (paymentMethod==="Cash" && parseFloat(cashReceived||0) < totalAmt) { alert("Cash received is less than total amount."); return; }
    if (!activeBranch && isAdmin) { alert("Please select a branch first."); return; }
    setProcessing(true);
    try {
      const payload = {
        branch: activeBranch||userBranch, cashier:user?.name||"Staff", shop:activeShop,
        payment_method:paymentMethod, cash_received:paymentMethod==="Cash"?parseFloat(cashReceived):totalAmt,
        discount_pct:discountPct, subtotal, discount_amt:discountAmt, vat_enabled:vatEnabled,
        vat_amt:vatAmt, total:totalAmt, change_due:changeDue, note:noteInput,
        items:cart.map(c => ({ id:c.id, source:c.source, name:c.displayName, price:c.price, qty:c.qty, subtotal:c.price*c.qty })),
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const d   = await res.json();
      if (d.success) {
        setLastReceipt({ ...payload, id:d.id, date:new Date().toLocaleString() });
        setShowReceiptModal(true);
        clearCart(); fetchTransactions(); fetchProducts();
      } else alert(d.error||"Failed to process sale");
    } catch { alert("Failed to process sale. Check server connection."); }
    finally { setProcessing(false); }
  };

  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter(tx => {
      if (q && !String(tx.id).includes(q) && !(tx.cashier||"").toLowerCase().includes(q) && !(tx.branch||"").toLowerCase().includes(q)) return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo   && tx.created_at > txDateTo+"T23:59:59") return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const txTotalPages = Math.max(1, Math.ceil(filteredTx.length/TX_PAGE_SIZE));
  const txPageItems  = filteredTx.slice(txPage*TX_PAGE_SIZE, (txPage+1)*TX_PAGE_SIZE);

  const todayStr     = new Date().toISOString().slice(0,10);
  const todaySales   = transactions.filter(tx => (tx.created_at||"").startsWith(todayStr));
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total||0), 0);
  const todayCount   = todaySales.length;
  const todayAvg     = todayCount > 0 ? todayRevenue/todayCount : 0;

  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches||[]).forEach(br => { const name=typeof br==="string"?br:br.name; if(!out.includes(name)) out.push(name); }));
    return out;
  }, [brandList]);

  const printReceipt = () => window.print();

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

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif", background:"linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight:"100vh", padding:"24px 30px 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @media print { body > * { display: none !important; } .pos-receipt-print { display: block !important; } }
      `}</style>

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

      <div style={{ display:"flex", gap:4, background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:5, marginBottom:18, width:"fit-content", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
        {[{id:"cashier",label:"Cashier"},{id:"history",label:"Transaction History"}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{ padding:"8px 22px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              background:activeTab===tab.id?`linear-gradient(135deg,${C.teal},${C.green})`:"transparent",
              color:activeTab===tab.id?C.white:C.muted,
              boxShadow:activeTab===tab.id?"0 2px 10px rgba(0,180,90,0.28)":"none", transition:"all .15s" }}>
            {tab.label}
            {tab.id==="history" && transactions.length>0 && (
              <span style={{ marginLeft:7, background:"rgba(255,255,255,0.25)", padding:"1px 8px", borderRadius:20, fontSize:11 }}>{transactions.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "cashier" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:18, alignItems:"start" }}>
          <div>
            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:14, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                {isAdmin && (
                  <select value={activeBranch} onChange={e=>setActiveBranch(e.target.value)} style={{ ...invInputSt, width:180 }}>
                    <option value="">Select Branch…</option>
                    {allBranches.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                )}
                <div style={{ position:"relative", flex:"1 1 200px" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input type="text" placeholder="Search products…" value={searchProduct} onChange={e=>setSearchProduct(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
                </div>
              </div>
            </div>

            {allProducts.length === 0 ? (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"48px 0", textAlign:"center", color:C.muted }}>
                <div style={{ fontSize:"2rem", marginBottom:10 }}>🏪</div>
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
                        <img src={product.image_url} alt="" style={{ width:"100%", height:90, objectFit:"cover", borderRadius:9, marginBottom:10 }} onError={e=>e.target.style.display="none"}/>
                      ) : (
                        <div style={{ width:"100%", height:90, borderRadius:9, background:`linear-gradient(135deg,${C.greenLt},${C.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", marginBottom:10 }}>🛒</div>
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
                    <div style={{ fontSize:"2rem", marginBottom:8 }}>🛒</div>
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
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>Discount %</label>
                  <div style={{ display:"flex", gap:4 }}>
                    {[0,5,10,15,20].map(d=>(
                      <button key={d} onClick={()=>setDiscountPct(d)}
                        style={{ height:28, padding:"0 10px", borderRadius:7, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                          background:discountPct===d?`linear-gradient(135deg,${C.teal},${C.green})`:C.bg,
                          color:discountPct===d?C.white:C.muted }}>
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>VAT (12%)</label>
                  <div onClick={()=>setVatEnabled(v=>!v)}
                    style={{ width:44, height:24, borderRadius:12, cursor:"pointer", position:"relative", background:vatEnabled?`linear-gradient(135deg,${C.teal},${C.green})`:"#e0e0e0", transition:"background .2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:vatEnabled?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                  </div>
                </div>
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
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Payment Method</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["Cash","GCash","Card","Others"].map(m=>(
                      <button key={m} onClick={()=>setPaymentMethod(m)}
                        style={{ flex:1, height:32, border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                          background:paymentMethod===m?`linear-gradient(135deg,${C.teal},${C.green})`:C.bg,
                          color:paymentMethod===m?C.white:C.muted, transition:"all .12s" }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === "Cash" && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Cash Received</div>
                    <input type="number" value={cashReceived} onChange={e=>setCashReceived(e.target.value)} placeholder="0.00"
                      style={{ ...invInputSt, fontSize:16, fontWeight:800, textAlign:"right", color:C.ink }}/>
                    {cashReceived !== "" && (
                      <div style={{ marginTop:6, fontSize:13, fontWeight:700, textAlign:"right", color:cashShortfall<0?C.warn:C.ok }}>
                        {cashShortfall<0?`⚠ Short by ${fmtPHP(Math.abs(cashShortfall))}`:`Change: ${fmtPHP(changeDue)}`}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginBottom:12 }}>
                  <textarea value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Order note (optional)…" rows={2}
                    style={{ ...invInputSt, height:"auto", padding:"8px 11px", resize:"none", lineHeight:1.5 }}/>
                </div>
                <button onClick={processSale} disabled={processing||cart.length===0}
                  style={{ width:"100%", height:46, border:"none", borderRadius:12, fontSize:15, fontWeight:900, cursor:cart.length===0||processing?"not-allowed":"pointer", fontFamily:"inherit",
                    background:cart.length===0?"#e0e0e0":`linear-gradient(135deg,${C.teal},${C.green})`,
                    color:cart.length===0?"#9e9e9e":C.white,
                    boxShadow:cart.length===0?"none":"0 4px 16px rgba(0,180,90,0.35)", transition:"all .15s", opacity:processing?0.7:1 }}>
                  {processing ? "Processing…" : `💳 Charge ${fmtPHP(totalAmt)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
            <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
              <span style={{ fontWeight:800, fontSize:13 }}>📋 Transaction History</span>
              <span style={{ fontSize:12, opacity:0.9 }}>{filteredTx.length} records</span>
            </div>

            {loadingTx ? (
              <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading transactions…</div>
            ) : filteredTx.length === 0 ? (
              <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No transactions found.</div>
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr>
                        {["#","Date","Branch","Shop","Cashier","Items","Subtotal","Discount","VAT","Total","Payment","Status"].map(h=>(
                          <th key={h} style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txPageItems.map(tx=>(
                        <tr key={tx.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f6fef8"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"10px 12px", fontWeight:700, color:C.muted, fontSize:12 }}>#{tx.id}</td>
                          <td style={{ padding:"10px 12px", color:C.muted, fontSize:12, whiteSpace:"nowrap" }}>
                            {new Date(tx.created_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                          </td>
                          <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{tx.branch}</td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:tx.shop==="Coffee Spot"?"#fff8e1":"#e0f2f1", color:tx.shop==="Coffee Spot"?"#f57f17":"#00695c" }}>{tx.shop}</span>
                          </td>
                          <td style={{ padding:"10px 12px", color:C.ink, fontWeight:600, fontSize:12 }}>{tx.cashier}</td>
                          <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{(tx.items||[]).length} item{(tx.items||[]).length!==1?"s":""}</td>
                          <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPHP(tx.subtotal)}</td>
                          <td style={{ padding:"10px 12px" }}>
                            {tx.discount_pct>0?<span style={{ color:C.warn, fontWeight:700 }}>−{tx.discount_pct}%</span>:<span style={{ color:C.muted }}>—</span>}
                          </td>
                          <td style={{ padding:"10px 12px" }}>
                            {tx.vat_enabled?<span style={{ color:"#1565c0", fontWeight:700 }}>+{fmtPHP(tx.vat_amt)}</span>:<span style={{ color:C.muted }}>—</span>}
                          </td>
                          <td style={{ padding:"10px 12px", fontWeight:800, color:C.green }}>{fmtPHP(tx.total)}</td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600,
                              background:tx.payment_method==="Cash"?"#e8f5e9":tx.payment_method==="GCash"?"#e3f2fd":"#f3e5f5",
                              color:tx.payment_method==="Cash"?"#2e7d32":tx.payment_method==="GCash"?"#1565c0":"#6a1b9a" }}>
                              {tx.payment_method}
                            </span>
                          </td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(16,185,129,0.1)", color:"#059669" }}>Completed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <POSPagination page={txPage} setPage={setTxPage} total={filteredTx.length} pageSize={TX_PAGE_SIZE}/>
              </>
            )}
          </div>
        </>
      )}

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
    </div>
  );
}


// ActionDropdown — pencil button + scrollable dropdown
// ─────────────────────────────────────────────────────────────────────────────
function ActionDropdown({ application, onView, onApprove, onPending, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const close = () => setOpen(false);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* ── Primary edit button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "inherit",
          borderRadius: 8,
          border: "1.5px solid #b2dfdb",
          background: "#f0fdf5",
          color: "#00695c",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e0f2f1")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#f0fdf5")}
      >
        <Pencil size={13} />
        Edit
        <ChevronDown
          size={11}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* ── Scrollable dropdown ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            minWidth: 180,
            maxHeight: 220,
            overflowY: "auto",
            background: C.white,
            border: "0.5px solid #b2dfdb",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            zIndex: 1000,
          }}
        >
          <DropItem
            icon={<Eye size={14} />}
            label="View application"
            onClick={() => { onView(application); close(); }}
          />
          <DropItem
            icon={<Check size={14} />}
            label="Approve"
            onClick={() => { onApprove(application); close(); }}
          />
          <DropItem
            icon={<Clock size={14} />}
            label="Mark as pending"
            onClick={() => { onPending(application); close(); }}
          />
          <DropItem
            icon={<Download size={14} />}
            label="Download / Print"
            onClick={() => { window.print(); close(); }}
          />
          <div style={{ height: "0.5px", background: "#b2dfdb", margin: "4px 0" }} />
          <DropItem
            icon={<Trash2 size={14} />}
            label="Delete"
            onClick={() => { onDelete(application); close(); }}
            danger
          />
        </div>
      )}
    </div>
  );
}

// ─── Single dropdown item ─────────────────────────────────────────────────────
function DropItem({ icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 14px",
        fontSize: 13,
        fontFamily: "inherit",
        fontWeight: 600,
        color: danger ? "#a32d2d" : "#0d2b1e",
        background: hover
          ? danger
            ? "rgba(163,45,45,0.07)"
            : "rgba(0,137,123,0.07)"
          : "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        transition: "background 0.12s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewApplicationModal
// ─────────────────────────────────────────────────────────────────────────────
function ViewApplicationModal({ application, onClose }) {
  if (!application) return null;
  const isIPharma = application.franchise === "iPharma Mart";

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
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
        }}
      >
        {/* Header */}
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
              fontFamily: "Montserrat,sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "#0d2b1e",
              margin: 0,
            }}
          >
            📋 Franchise Application Details
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

        {/* Sub-header */}
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
          Application ID: <strong>#{application.id}</strong> · Status:{" "}
          <span
            style={{
              background:
                application.status === "approved"
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(245,158,11,0.1)",
              color:
                application.status === "approved" ? "#059669" : "#d97706",
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {application.status?.toUpperCase()}
          </span>
        </p>

        {/* Sections */}
        <div style={{ padding: "1rem 0" }}>
          <AppSection title="Basic Information">
            <AppGrid2>
              <AppField label="Date Applied"  value={application.date} />
              <AppField label="Payment Mode"  value={application.paymentMode} />
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
                <AppField label="Spouse Name"       value={application.spouseName} />
                <AppField label="Spouse Occupation" value={application.spouseOccupation} />
                {isIPharma && application.spouseDob && (
                  <AppField label="Spouse Date of Birth" value={application.spouseDob} />
                )}
              </AppGrid2>
            </AppSection>
          )}

          {!isIPharma && (
            <AppSection title="Employment Information">
              <AppGrid2>
                <AppField label="Employment Type"     value={application.employmentType} />
                <AppField label="Years with Employer" value={`${application.yearsEmployer} years`} />
                <AppField
                  label="Monthly Income"
                  value={`₱${parseInt(application.income).toLocaleString()}`}
                  highlight
                />
                <AppField label="Position" value={application.position} />
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 22,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 22px",
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
            Close
          </button>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 24px",
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
            🖨️ Print Application
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AppSection({ title, children }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          fontFamily: "Montserrat,sans-serif",
          fontWeight: 800,
          fontSize: 13,
          color: "#00897b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `2px solid ${C.border}`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function AppGrid2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      {children}
    </div>
  );
}

function AppField({ label, value, highlight, large }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#5a7a65",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontWeight: highlight || large ? 800 : 600,
          fontSize: large ? 15 : 13,
          color: highlight ? "#00897b" : "#0d2b1e",
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export { ActionDropdown, ViewApplicationModal, AppSection, AppGrid2, AppField };