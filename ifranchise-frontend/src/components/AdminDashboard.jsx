import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import {
  Home, Box, FileText, FileCheck, Users, BarChart2, MessageCircle,
  User, ShoppingCart, LogOut, Search, Package, AlertTriangle,
  DollarSign, Grid3X3, ChevronDown, Plus, Pencil, Trash2, X, Check,
  Building2, Store, TrendingDown, TrendingUp, Layers, GitBranch,
  Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar, BarChart, RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem('user'); window.location.reload(); };

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
    { id: 'dashboard',    label: 'Dashboard',            icon: <Home size={20} /> },
    { id: 'inventory',    label: 'Inventory Management', icon: <Box size={20} /> },
    { id: 'mobileShop',   label: 'Mobile Shop Supplies', icon: <ShoppingCart size={20} /> },
    { id: 'receipts',     label: 'View Liquidation',     icon: <FileText size={20} /> },
    { id: 'applications', label: 'View Applications',    icon: <FileCheck size={20} /> },
    { id: 'users',        label: 'User Management',      icon: <Users size={20} /> },
    { id: 'reports',      label: 'Sales & Reports',      icon: <BarChart2 size={20} /> },
    { id: 'communication',label: 'Communication',        icon: <MessageCircle size={20} /> },
    { id: 'brandBranch',  label: 'Brand & Branch',       icon: <GitBranch size={20} /> },
    { id: 'profile',      label: 'Edit Profile',         icon: <User size={20} /> },
    { id: 'logout',       label: 'Logout',               icon: <LogOut size={20} />, action: handleLogout },
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
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:1.5rem; margin-bottom:2rem; }
        .stat-card { background:var(--white); padding:1.8rem; border-radius:12px; box-shadow:0 2px 8px var(--shadow); transition:all 0.3s ease; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 6px 16px var(--shadow-strong); }
        .stat-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
        .stat-icon { width:50px; height:50px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
        .stat-icon.blue { background:rgba(59,130,246,0.1); color:var(--blue); }
        .stat-icon.green { background:rgba(16,185,129,0.1); color:var(--success); }
        .stat-icon.orange { background:rgba(245,158,11,0.1); color:var(--orange); }
        .stat-icon.red { background:rgba(239,68,68,0.1); color:var(--red); }
        .stat-value { font-family:'Montserrat',sans-serif; font-size:2rem; font-weight:700; color:var(--text-dark); margin-bottom:0.3rem; }
        .stat-label { font-size:0.9rem; color:var(--gray-500); }
        .stat-change { font-size:0.85rem; font-weight:600; margin-top:0.5rem; }
        .stat-change.positive { color:var(--success); } .stat-change.negative { color:var(--red); }
        .section { background:var(--white); padding:2rem; border-radius:12px; box-shadow:0 2px 8px var(--shadow); margin-bottom:2rem; }
        .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid var(--gray-200); }
        .section-title { font-family:'Montserrat',sans-serif; font-size:1.5rem; font-weight:700; color:var(--green-primary); }
        .btn { padding:0.7rem 1.5rem; border-radius:8px; border:none; font-weight:600; cursor:pointer; transition:all 0.3s ease; font-family:'Montserrat',sans-serif; font-size:0.9rem; }
        .btn-primary { background:var(--green-primary); color:var(--white); }
        .btn-primary:hover { background:var(--green-dark); transform:translateY(-2px); box-shadow:0 4px 12px var(--shadow-strong); }
        .btn-secondary { background:var(--gray-200); color:var(--gray-700); }
        .btn-secondary:hover { background:var(--gray-300); }
        .btn-success { background:var(--success); color:var(--white); }
        .btn-success:hover { background:#059669; }
        .btn-danger { background:var(--red); color:var(--white); }
        .btn-danger:hover { background:#DC2626; }
        .btn-sm { padding:0.5rem 1rem; font-size:0.85rem; text-align:center; white-space:nowrap; }
        .table-container { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; }
        th,td { text-align:left; padding:1rem; border-bottom:1px solid var(--gray-200); }
        th { font-family:'Montserrat',sans-serif; font-weight:600; color:var(--gray-700); background:var(--gray-100); font-size:0.9rem; text-transform:uppercase; letter-spacing:0.05em; }
        td { color:var(--gray-600); }
        tr:hover { background:var(--gray-50); }
        .status-badge { padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:600; display:inline-block; }
        .status-pending { background:rgba(245,158,11,0.1); color:var(--orange); }
        .status-approved { background:rgba(16,185,129,0.1); color:var(--success); }
        .status-rejected { background:rgba(239,68,68,0.1); color:var(--red); }
        .status-low { background:rgba(239,68,68,0.1); color:var(--red); }
        .status-ok { background:rgba(16,185,129,0.1); color:var(--success); }
        .action-buttons { display:flex; gap:0.5rem; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000; animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal { background:var(--white); padding:2.5rem; border-radius:16px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3); animation:slideUp 0.3s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .modal-header { margin-bottom:2rem; }
        .modal-title { font-family:'Montserrat',sans-serif; font-size:1.6rem; font-weight:700; color:var(--green-primary); margin-bottom:0.5rem; }
        .form-group { margin-bottom:1.5rem; }
        .form-label { display:block; font-weight:600; color:var(--gray-700); margin-bottom:0.5rem; font-size:0.9rem; }
        .form-input,.form-select { width:100%; padding:0.9rem; border:2px solid var(--gray-300); border-radius:8px; font-family:'Poppins',sans-serif; font-size:1rem; transition:all 0.3s ease; }
        .form-input:focus,.form-select:focus { outline:none; border-color:var(--green-primary); box-shadow:0 0 0 3px rgba(46,125,50,0.1); }
        .modal-actions { display:flex; gap:1rem; margin-top:2rem; }
        .modal-actions .btn { flex:1; }
        .chart-placeholder { background:var(--gray-100); height:300px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--gray-400); font-weight:600; margin-top:1rem; }
        @media(max-width:768px){
          .sidebar{width:${sidebarCollapsed?'0':'280px'};transform:translateX(${sidebarCollapsed?'-100%':'0'});}
          .main-content{margin-left:0;}
          .top-bar{padding:1rem;}
          .content-area{padding:1rem;}
          .stats-grid{grid-template-columns:1fr;}
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
          {activeModule === 'dashboard'     && <DashboardContent />}
          {activeModule === 'inventory'     && <InventoryContent user={user} brands={brands} />}
          {activeModule === 'mobileShop'    && <MobileShopContent />}
          {activeModule === 'receipts'      && <Receipts />}
          {activeModule === 'applications'  && (
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
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowLogoutModal(false)}>
          <div className="modal" style={{ maxWidth:'400px', textAlign:'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>🚪</div>
            <h2 className="modal-title" style={{ color:'var(--gray-800)' }}>Log out?</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', margin:'0.5rem 0 2rem' }}>You'll need to sign in again to access your account.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmLogout}>Log out</button>
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

  const emptyBrand  = { name:'', region:'', categories:[], contact_email:'', contact_phone:'', description:'' };
  const emptyBranch = { name:'', brand_id:'', region:'', manager:'', contact:'', address:'', status:'Active' };

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
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); }
      else alert(data.error || 'Failed to update branch');
    } catch { alert('Failed to update branch'); }
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
  const allRegions    = [...new Set(brands.flatMap(b => [b.region, ...(b.branches?.map(br => br.region) || [])]).filter(Boolean))];

  const filteredBrands = brands
    .map(brand => ({
      ...brand,
      branches: (brand.branches || []).filter(br =>
        (!searchQuery || br.name.toLowerCase().includes(searchQuery.toLowerCase()) || (br.manager || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterRegion === 'all' || br.region === filterRegion || brand.region === filterRegion)
      ),
    }))
    .filter(brand =>
      (!searchQuery || brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || brand.branches.length > 0) &&
      (filterRegion === 'all' || brand.region === filterRegion || brand.branches.length > 0)
    );

  const StatusBadge = ({ status }) => {
    const styles = {
      Active:   { bg:'rgba(16,185,129,0.1)',  color:'#059669' },
      Review:   { bg:'rgba(245,158,11,0.1)',  color:'#d97706' },
      Inactive: { bg:'rgba(239,68,68,0.1)',   color:'#dc2626' },
    };
    const s = styles[status] || styles['Active'];
    return (
      <span style={{ background:s.bg, color:s.color, padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>
        {status}
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
        <div style={{ marginBottom:26 }}>
          <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'#00897b', marginBottom:4 }}>Brand & Branch Settings</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'#0d2b1e', letterSpacing:'-0.7px', margin:0 }}>Brand & Branch Management</h1>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Total Brands',    value:brands.length,  icon:<Globe size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'Registered brands'    },
            { label:'Total Branches',  value:totalBranches,  icon:<Store size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Across all brands'    },
            { label:'Active Branches', value:totalActive,    icon:<Check size={20} color="#065f46"/>,        bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'Operational'          },
            { label:'Needs Review',    value:totalReview,    icon:<AlertTriangle size={20} color="#92400e"/>, bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Pending attention'    },
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
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={11} /> {brand.region}</span>
                    {brand.contact_email && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, opacity:0.85, fontWeight:600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? 'branch' : 'branches'}</span>
                <button onClick={() => { setSelectedBrand(brand); setBrandForm({ name:brand.name, region:brand.region, categories:brand.categories||[], contact_email:brand.contact_email, contact_phone:brand.contact_phone, description:brand.description }); setShowEditBrandModal(true); }}
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
                {['Branch Name','Region','Manager','Contact','Address','Status','Actions'].map(h => (
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
                  <div><StatusBadge status={branch.status || 'Active'} /></div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="bm-action-btn" style={{ borderColor:'#b2dfdb', background:'#e0f2f1', color:'#00695c' }}
                      onClick={() => { setSelectedBranch(branch); setBranchForm({ name:branch.name, brand_id:brand.id, region:branch.region, manager:branch.manager, contact:branch.contact, address:branch.address, status:branch.status }); setShowEditBranchModal(true); }}>
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
  const f      = (field) => ({ value:form[field], onChange:e => setForm(p => ({ ...p, [field]:e.target.value })) });
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
      <div><label style={lbl}>Region *</label>
        <select style={{ ...inputSt, appearance:'none', cursor:'pointer' }} {...f('region')} required>
          <option value="">Select region</option>
          {['NCR','Region 3','Region 4A','Region 4B','Region 5','Region 7','Region 11'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
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
  const f      = (field) => ({ value:form[field], onChange:e => setForm(p => ({ ...p, [field]:e.target.value })) });
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
        <div><label style={lbl}>Status</label>
          <select style={{ ...inputSt, appearance:'none', cursor:'pointer' }} {...f('status')}>
            <option>Active</option><option>Review</option><option>Inactive</option>
          </select>
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function DashboardContent() {
  const today   = new Date();
  const fmt8    = (d) => d.toISOString().slice(0, 10);
  const fmtAmt  = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtShort= (n) => { if(n>=1_000_000) return '₱'+(n/1_000_000).toFixed(1)+'M'; if(n>=1_000) return '₱'+(n/1_000).toFixed(0)+'k'; return '₱'+n; };

  const [rangeMode,      setRangeMode]      = useState('preset');
  const [preset,         setPreset]         = useState('month');
  const [customFrom,     setCustomFrom]     = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo,       setCustomTo]       = useState(fmt8(today));
  const [appliedRange,   setAppliedRange]   = useState(null);
  const [archives,       setArchives]       = useState(() => { try { return JSON.parse(localStorage.getItem('dashboardArchives')||'[]'); } catch { return []; } });
  const [showArchivePanel,   setShowArchivePanel]   = useState(false);
  const [viewingArchive,     setViewingArchive]     = useState(null);
  const [archiveYearInput,   setArchiveYearInput]   = useState(String(today.getFullYear()));
  const [archiveConfirm,     setArchiveConfirm]     = useState(false);
  const [tooltip,            setTooltip]            = useState(null);
  const svgRef = useRef(null);

  const getRangeLabel = () => {
    if (viewingArchive) return `Archive: ${viewingArchive.year}`;
    if (rangeMode === 'custom' && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
    const map = { day:'Today', week:'This Week', month:'This Month', year:'This Year' };
    return map[preset] || 'This Month';
  };

  const chartData = useMemo(() => {
    if (viewingArchive) return viewingArchive.chartData;
    const configs = {
      day:   { labels:['6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM'],   base:8000,    noise:5000   },
      week:  { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],            base:45000,   noise:30000  },
      month: { labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], base:280000, noise:180000 },
      year:  { labels:['2020','2021','2022','2023','2024','2025'],            base:2500000, noise:1800000 },
      custom:{ labels:['Week 1','Week 2','Week 3','Week 4'],                  base:120000,  noise:80000  },
    };
    const key = rangeMode === 'custom' ? 'custom' : preset;
    const { labels, base, noise } = configs[key];
    const seed   = key.charCodeAt(0) * 7;
    const values = labels.map((_, i) => Math.round(base + noise * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.4 + seed)))));
    return { labels, values };
  }, [preset, rangeMode, viewingArchive]);

  const values    = chartData.values;
  const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg       = useMemo(() => Math.round(total / values.length), [total, values.length]);
  const peak      = useMemo(() => Math.max(...values), [values]);
  const low       = useMemo(() => Math.min(...values), [values]);
  const peakLabel = chartData.labels[values.indexOf(peak)];
  const pctChange = values.length > 1 ? (((values[values.length-1] - values[0]) / values[0]) * 100).toFixed(1) : '0.0';
  const trending  = Number(pctChange) >= 0;

  const SVG_W = 820, SVG_H = 260, PAD_L = 64, PAD_R = 16, PAD_T = 18, PAD_B = 36;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const maxV  = peak * 1.18;

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
    if (!svgRef.current) return;
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
    const snapshot = { year, label:`Full Year ${year}`, savedAt:new Date().toLocaleString(), chartData, kpis:{ totalSales:total, avgSales:avg, peakSales:peak, lowSales:low } };
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
    { label:'Sales Revenue', value:null },
    { label:'Sales Profit',  value:null },
    { label:'Cost of Sales', value:null },
    { label:'Total Sales',   value:total, note:getRangeLabel() },
  ];

  return (
    <div style={{ fontFamily:"'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        .db-root * { box-sizing:border-box; }
        .db-eyebrow { font-family:'Montserrat',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:#00897b; margin-bottom:4px; }
        .db-heading { font-family:'Montserrat',sans-serif; font-size:28px; font-weight:700; color:#0d2b1e; letter-spacing:-0.7px; margin-bottom:20px; }
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
      `}</style>

      <div className="db-root">
        <div className="db-eyebrow">DASHBOARD</div>
        <h1 className="db-heading">Sales Trend Analysis</h1>

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

        <div className="db-kpi-grid">
          {kpiCards.map((k, i) => (
            <div key={i} className="db-kpi-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#5a7a65', marginBottom:5 }}>{k.label}</div>
                  {k.value !== null && k.value !== undefined
                    ? <div style={{ fontSize:22, fontWeight:800, color:'#0d2b1e' }}>{fmtAmt(k.value)}</div>
                    : <div className="db-placeholder-val">— Pending connection</div>}
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{k.note}</span>
            </div>
          ))}
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
            </div>
            <div style={{ fontSize:11, color:'#94a3b8', display:'flex', alignItems:'center', gap:5 }}>
              <RefreshCw size={11}/> Placeholder data — connect POS &amp; Inventory
            </div>
          </div>

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
        </div>

        <div className="db-ins-grid">
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Peak Performance</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              Highest revenue on <strong>{peakLabel}</strong> ({getRangeLabel()}). Outperformed average by <strong>{fmtAmt(peak - avg)}</strong>.
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:'#00897b' }}>{fmtAmt(peak)}</div>
          </div>
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Trend Direction</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              Sales are <strong>{trending ? 'trending upward ↑' : 'trending downward ↓'}</strong> with a <strong>{Math.abs(pctChange)}% change</strong> from start to end of selected range.
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:trending?'#00897b':'#d97706' }}>
              {trending ? '+' : '-'}{Math.abs(pctChange)}%
            </div>
          </div>
          <div className="db-ins-card">
            <div style={{ fontWeight:700, color:'#0d2b1e', fontSize:13, marginBottom:6 }}>Revenue Summary</div>
            <p style={{ fontSize:12, color:'#5a7a65', lineHeight:1.65 }}>
              Average: <strong>{fmtAmt(avg)}</strong> · Total: <strong>{fmtAmt(total)}</strong><br/>
              <span style={{ color:'#94a3b8', fontSize:11 }}>Sales Profit, Revenue &amp; Cost of Sales will reflect once POS &amp; Inventory are connected.</span>
            </p>
            <div style={{ marginTop:10, fontSize:19, fontWeight:800, color:'#00897b' }}>{fmtAmt(avg)}</div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { label:'Sales Revenue',  desc:'Total income from sales. Will pull from POS transactions.',      icon:'💰' },
            { label:'Sales Profit',   desc:'Net profit after deducting cost of sales from revenue.',         icon:'📈' },
            { label:'Cost of Sales',  desc:'Total cost of goods sold. Will pull from Inventory movements.',  icon:'🧾' },
          ].map((k, i) => (
            <div key={i} style={{ background:'#fff', border:'1.5px dashed #a7f3d0', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 8px rgba(0,140,60,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{k.icon}</span>
                <span style={{ fontWeight:800, fontSize:13, color:'#0d2b1e' }}>{k.label}</span>
              </div>
              <p style={{ fontSize:11.5, color:'#5a7a65', lineHeight:1.6, marginBottom:12 }}>{k.desc}</p>
              <div style={{ background:'#f0fdf5', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700, color:'#94a3b8', display:'flex', alignItems:'center', gap:6 }}>
                <RefreshCw size={11} color="#b2dfdb"/> Awaiting POS / Inventory connection
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE SHOP
// ─────────────────────────────────────────────────────────────────────────────
const msInputStyle = { width:"100%", padding:"0.75rem", borderRadius:"8px", border:"1px solid var(--gray-300)", marginTop:"0.3rem", fontSize:"0.9rem" };

function MobileShopContent() {
  const [items,   setItems]   = useState([]);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name:"", price:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });

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

  const addItem = async () => {
    if (loading || !validate()) return;
    setLoading(true);
    await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name:newItem.name, price:Number(newItem.price), image_url:newItem.image_url, shop:newItem.shop, brand:newItem.brand, stock:Number(newItem.stock) }),
    });
    setNewItem({ name:"", price:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });
    setErrors({});
    setLoading(false);
    fetchItems();
  };

  const deleteItem       = async (id) => { await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}`, { method:"DELETE" }); fetchItems(); };
  const toggleVisibility = async (id) => { await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${id}/toggle`, { method:"PUT" }); fetchItems(); };

  const vStyle = { fontWeight:"600", marginBottom:"0.3rem" };
  const lStyle = { fontSize:"0.8rem", color:"var(--gray-500)", marginTop:"0.5rem" };

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ background:"#fff", padding:"2rem", borderRadius:"12px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color:"var(--green-primary)", marginBottom:"1.5rem" }}>Mobile Shop</h2>
        <div style={{ marginBottom:"2rem" }}>
          <h3 style={{ color:"var(--green-primary)", fontSize:"1.1rem", marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--gray-200)" }}>Add New Item</h3>
          <div style={{ display:"grid", gap:"1rem" }}>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Shop</label>
              <select value={newItem.shop} onChange={e => setNewItem({...newItem, shop:e.target.value})} style={msInputStyle}>
                <option value="Coffee Spot">Coffee Spot</option>
                <option value="iPharma">iPharma</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Item Name</label>
              <input value={newItem.name} onChange={e => setNewItem({...newItem, name:e.target.value})} style={{ ...msInputStyle, border:errors.name?"1px solid red":msInputStyle.border }}/>
              {errors.name && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.name}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Brand (Optional)</label>
              <input value={newItem.brand} onChange={e => setNewItem({...newItem, brand:e.target.value})} style={msInputStyle}/>
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Price</label>
              <input value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})} style={{ ...msInputStyle, border:errors.price?"1px solid red":msInputStyle.border }}/>
              {errors.price && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.price}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Stock</label>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock:e.target.value})} style={{ ...msInputStyle, border:errors.stock?"1px solid red":msInputStyle.border }}/>
              {errors.stock && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.stock}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Image URL</label>
              <input value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url:e.target.value})} style={{ ...msInputStyle, border:errors.image_url?"1px solid red":msInputStyle.border }}/>
              {errors.image_url && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.image_url}</p>}
              {newItem.image_url && !errors.image_url && (
                <img src={newItem.image_url} alt="preview" style={{ marginTop:"10px", width:"120px", height:"120px", objectFit:"cover", borderRadius:"8px", border:"1px solid #ddd" }} onError={e => (e.target.style.display="none")}/>
              )}
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop:"1.5rem", opacity:loading?0.6:1 }} onClick={addItem} disabled={loading}>{loading?"Adding...":"Add Item"}</button>
        </div>
        <div>
          <h3 style={{ color:"var(--green-primary)", fontSize:"1.1rem", marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--gray-200)" }}>Shop Items</h3>
          {items.map(item => (
            <div key={item.id} style={{ marginBottom:"1.5rem", padding:"1rem", border:"1px solid var(--gray-200)", borderRadius:"10px" }}>
              <div style={{ display:"flex", gap:"1rem" }}>
                <img src={item.image_url} alt="" style={{ width:"100px", height:"100px", borderRadius:"8px", objectFit:"cover" }}/>
                <div style={{ flex:1 }}>
                  <p style={lStyle}>Shop</p><p style={vStyle}>{item.shop}</p>
                  <p style={lStyle}>Item Name</p><p style={vStyle}>{item.name}</p>
                  {item.brand && <><p style={lStyle}>Brand</p><p style={vStyle}>{item.brand}</p></>}
                  <p style={lStyle}>Price</p><p style={vStyle}>₱{item.price}</p>
                  <p style={lStyle}>Stock</p><p style={vStyle}>{item.stock}</p>
                  <p style={lStyle}>Status</p><p style={vStyle}>{item.is_visible?"Visible":"Hidden"}</p>
                </div>
              </div>
              <div style={{ marginTop:"1rem", display:"flex", gap:"0.5rem" }}>
                <button className="btn btn-secondary" onClick={() => toggleVisibility(item.id)}>{item.is_visible?"Hide":"Show"}</button>
                <button className="btn btn-danger"    onClick={() => deleteItem(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationsContent({ applications, onView, onDelete, onApprove, onCreateAccount }) {
  return (
    <div className="section" style={{ width:'fit-content', maxWidth:'100%' }}>
      <div className="section-header">
        <h2 className="section-title">Franchise Applications</h2>
        <button className="btn btn-secondary">Export to CSV</button>
      </div>
      <div className="table-container">
        <table style={{ minWidth:'900px' }}>
          <thead>
            <tr><th>Applicant Name</th><th>Email</th><th>Phone</th><th>Franchise Interest</th><th>Date Applied</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td><strong>{app.name}</strong></td>
                <td>{app.email}</td><td>{app.phone}</td><td>{app.franchise}</td><td>{app.date}</td>
                <td><span className={`status-badge status-${app.status}`}>{app.status.toUpperCase()}</span></td>
                <td>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', width:'170px' }}>
                    <div style={{ display:'flex', gap:'0.3rem', width:'100%' }}>
                      <button className="btn btn-secondary btn-sm" style={{ width:'50%' }} onClick={() => onView(app)}>View</button>
                      <button className="btn btn-success btn-sm"   style={{ width:'60%' }} onClick={() => onCreateAccount(app)}>+Account</button>
                    </div>
                    <div style={{ display:'flex', gap:'0.3rem', width:'100%' }}>
                      <button className="btn btn-primary btn-sm" style={{ width:'50%' }} onClick={() => onApprove(app.id)}>Approve</button>
                      <button className="btn btn-danger btn-sm"  style={{ width:'50%' }} onClick={() => onDelete(app.id)}>Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PROFIT_MARGIN = 40;
const PAGE_SIZE = 50;
const DEFAULT_CATEGORIES = ["Medicine","Vitamins","Supplements","Coffee","Sports Drink","Equipment","Personal Care","Other"];

const fmtPeso = (n) => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

function findMatchingBranch(sheetName, allBranches) {
  const s = sheetName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let best = null, bestScore = 0;
  allBranches.forEach(({ branch }) => {
    const b = branch.toLowerCase().replace(/[^a-z0-9]/g, "");
    let score = 0;
    if (s === b) score = 100;
    else if (s.includes(b) || b.includes(s)) score = 70;
    else { for (let i = 0; i < b.length; i++) if (s.includes(b[i])) score++; }
    if (score > bestScore) { bestScore = score; best = branch; }
  });
  return bestScore > 3 ? best : null;
}

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
const invLabelSt = {
  display:"block", fontSize:11, fontWeight:800,
  color:C.muted, marginBottom:5,
  textTransform:"uppercase", letterSpacing:"0.07em",
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

const SearchIcon   = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const PlusIcon     = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon    = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon     = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const EditIcon     = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon    = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const TagIcon      = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const XIcon        = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronIcon  = ({ size=12, dir="down", ...p }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d={d[dir]}/></svg>; };
const FilterIcon   = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const SortAscIcon  = ({ size=12, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon = ({ size=12, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>;

function InvField({ label, style: s, children }) {
  return (
    <div style={{ marginBottom:13, ...s }}>
      {label && <label style={invLabelSt}>{label}</label>}
      {children}
    </div>
  );
}

function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
  const [brandQ,  setBrandQ]  = useState("");
  const [branchQ, setBranchQ] = useState("");
  const [openB,   setOpenB]   = useState(false);
  const [openBr,  setOpenBr]  = useState(false);
  const brandRef  = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setOpenB(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBr(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selectedBrand    = brands.find(b => b.id === activeBrand);
  const branchList       = selectedBrand ? (selectedBrand.branches||[]).map(br => typeof br==="string"?br:br.name) : [];
  const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = (active) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8, transition:"background .08s" });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:180 }}>
        <div onClick={() => { setOpenB(v=>!v); setBrandQ(""); }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <FilterIcon size={12} color={C.green}/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {selectedBrand ? `${selectedBrand.emoji||"🏪"} ${selectedBrand.name}` : "All Brands"}
          </span>
          <ChevronIcon dir={openB?"up":"down"} style={{ position:"absolute", right:10, color:C.muted, flexShrink:0 }}/>
        </div>
        {openB && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <div style={{ position:"relative" }}>
                <SearchIcon size={11} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}/>
                <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)} placeholder="Search brand…" onClick={e => e.stopPropagation()}
                  style={{ ...invInputSt, height:30, fontSize:12, paddingLeft:26 }}/>
              </div>
            </div>
            <div style={optSt(!activeBrand)} onMouseDown={() => { onChangeBrand(null); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>All Brands</div>
            {filteredBrands.map(b => (
              <div key={b.id} style={optSt(activeBrand===b.id)} onMouseDown={() => { onChangeBrand(b.id); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>
                <span style={{ fontSize:16 }}>{b.emoji||"🏪"}</span> {b.name}
                <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches||[]).length} branches</span>
              </div>
            ))}
            {filteredBrands.length===0 && <div style={{ padding:"12px 14px", fontSize:13, color:C.muted, fontStyle:"italic" }}>No brands found</div>}
          </div>
        )}
      </div>

      <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand?1:0.45, transition:"opacity .15s" }}>
        <div onClick={() => { if(activeBrand){setOpenBr(v=>!v);setBranchQ("");} }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
          <StoreIcon size={12} color={activeBrand?C.green:C.muted}/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {activeBranch||(activeBrand?"All Branches":"Select brand first")}
          </span>
          {activeBrand && <ChevronIcon dir={openBr?"up":"down"} style={{ position:"absolute", right:10, color:C.muted, flexShrink:0 }}/>}
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <div style={{ position:"relative" }}>
                <SearchIcon size={11} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}/>
                <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)} placeholder="Search branch…" onClick={e => e.stopPropagation()}
                  style={{ ...invInputSt, height:30, fontSize:12, paddingLeft:26 }}/>
              </div>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={() => { onChangeBranch(null); setBranchQ(""); setOpenBr(false); }}>All Branches</div>
            {filteredBranches.map(br => (
              <div key={br} style={optSt(activeBranch===br)} onMouseDown={() => { onChangeBranch(br); setBranchQ(""); setOpenBr(false); }}>
                <StoreIcon size={12} color={C.green}/> {br}
              </div>
            ))}
            {filteredBranches.length===0 && <div style={{ padding:"12px 14px", fontSize:13, color:C.muted, fontStyle:"italic" }}>No branches found</div>}
          </div>
        )}
      </div>

      {(activeBrand || activeBranch) && (
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {activeBrand && !activeBranch && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px 3px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:C.greenLt, color:C.greenDk, border:`1px solid ${C.greenMid}` }}>
              {selectedBrand?.emoji} {selectedBrand?.name}
              <XIcon size={10} style={{ cursor:"pointer" }} onClick={() => { onChangeBrand(null); onChangeBranch(null); }}/>
            </span>
          )}
          {activeBranch && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px 3px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:"#e0f7fa", color:"#00695c", border:"1px solid #b2ebf2" }}>
              <StoreIcon size={10}/> {activeBranch}
              <XIcon size={10} style={{ cursor:"pointer" }} onClick={() => onChangeBranch(null)}/>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function BranchSearchSelect({ value, onChange, allBranches }) {
  const [query, setQuery] = useState(value||"");
  const [open,  setOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value||""); }, [value]);
  useEffect(() => {
    const fn = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = allBranches.filter(({ branch, brand }) =>
    !query || branch.toLowerCase().includes(query.toLowerCase()) || brand.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <SearchIcon size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}/>
        <input type="text" value={query} placeholder="Search branch…"
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
          onFocus={() => setOpen(true)}
          style={{ ...invInputSt, paddingLeft:30 }}/>
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:400, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.1)", maxHeight:190, overflowY:"auto" }}>
          {filtered.map(({ branch, brand }) => (
            <div key={branch} onMouseDown={e => { e.preventDefault(); onChange(branch); setQuery(branch); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background=C.bg}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
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
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...invInputSt, flex:1 }}>
          <option value="">Select category…</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" title="Add new category" onClick={() => setAdding(v=>!v)}
          style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:`1px solid ${C.border}`, color:adding?C.green:C.muted }}>
          <TagIcon size={14}/>
        </button>
      </div>
      {adding && (
        <div style={{ display:"flex", gap:6, marginTop:6 }}>
          <input autoFocus type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"){e.preventDefault();handleAdd();} }}
            placeholder="New category…" style={{ ...invInputSt, flex:1 }}/>
          <button type="button" onClick={handleAdd} style={{ ...btnPrimarySt, padding:"0 14px" }}>Add</button>
          <button type="button" onClick={() => { setAdding(false); setNewCat(""); }}
            style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:"1px solid #ffcdd2", color:"#e53935" }}>
            <XIcon size={13}/>
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:accent||C.green, marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function InventoryTable({ items, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, page, setPage }) {
  const [sort, setSort] = useState({ col:"name", asc:true });

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      let va = a[sort.col]??""; let vb = b[sort.col]??"";
      if (typeof va==="string") va=va.toLowerCase();
      if (typeof vb==="string") vb=vb.toLowerCase();
      if (va<vb) return sort.asc?-1:1;
      if (va>vb) return sort.asc?1:-1;
      return 0;
    });
  }, [items, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems  = sorted.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);

  const handleSort = (col) => { setSort(s => ({ col, asc:s.col===col?!s.asc:true })); setPage(0); };

  const Th = ({ col, label, style:s }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => handleSort(col)} style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#f0fdf5", ...s }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label}
          {active ? (sort.asc?<SortAscIcon/>:<SortDescIcon/>) : <span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };

  if (!items.length) return <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No inventory items match your current filters.</div>;

  return (
    <div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <Th col="name"      label="Item Name"  style={{ minWidth:160 }}/>
              <Th col="category"  label="Category"   style={{ minWidth:110 }}/>
              <Th col="branch"    label="Branch"     style={{ minWidth:130 }}/>
              <Th col="stock"     label="Stock"      style={{ minWidth:72  }}/>
              <Th col="min_stock" label="Min Stock"  style={{ minWidth:80  }}/>
              <Th col="cost"      label="Cost"       style={{ minWidth:90  }}/>
              <Th col="price"     label="Price"      style={{ minWidth:90  }}/>
              <th style={{ padding:"9px 12px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}`, minWidth:150 }}/>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(item => {
              const low       = item.stock < item.min_stock;
              const isConfirm = confirmDeleteId === item.id;
              return (
                <tr key={item.id} style={{ borderBottom:`1px solid #f2faf5` }}
                  onMouseEnter={e => e.currentTarget.style.background="#fafffe"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
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
                      {low && <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:C.warn }}/>}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", color:C.muted }}>{item.min_stock}</td>
                  <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPeso(item.cost||0)}</td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                      <button onClick={() => onEdit(item)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}><EditIcon size={12}/> Edit</button>
                      <button onClick={() => { if(isConfirm){onDelete(item.id);setConfirmDeleteId(null);}else setConfirmDeleteId(item.id); }}
                        style={{ ...smallBtnSt, border:isConfirm?"none":"1px solid #ffcdd2", color:isConfirm?C.white:"#e53935", background:isConfirm?"#e53935":C.white }}>
                        <TrashIcon size={12}/> {isConfirm?"Confirm?":"Delete"}
                      </button>
                      {isConfirm && <button onClick={() => setConfirmDeleteId(null)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderTop:`1px solid ${C.border}`, background:"#f9fefb" }}>
          <span style={{ fontSize:12, color:C.muted }}>
            Showing <strong style={{ color:C.ink }}>{(page*PAGE_SIZE+1).toLocaleString()}–{Math.min((page+1)*PAGE_SIZE, sorted.length).toLocaleString()}</strong> of <strong style={{ color:C.ink }}>{sorted.length.toLocaleString()}</strong> items
          </span>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            {[{label:"«",action:()=>setPage(0),disabled:page===0},{label:"‹",action:()=>setPage(p=>Math.max(0,p-1)),disabled:page===0}].map(({label,action,disabled})=>(
              <button key={label} onClick={action} disabled={disabled} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:disabled?0.35:1 }}>{label}</button>
            ))}
            {Array.from({length:totalPages},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
              <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?`linear-gradient(135deg,${C.teal},${C.green})`:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
            ))}
            {[{label:"›",action:()=>setPage(p=>Math.min(totalPages-1,p+1)),disabled:page>=totalPages-1},{label:"»",action:()=>setPage(totalPages-1),disabled:page>=totalPages-1}].map(({label,action,disabled})=>(
              <button key={label} onClick={action} disabled={disabled} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:disabled?0.35:1 }}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InvModal({ title, onClose, onSubmit, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:20, padding:"26px 26px 20px", width:500, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 10px 48px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.ink }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
        </div>
        <form onSubmit={onSubmit}>{children}</form>
      </div>
    </div>
  );
}

function FormFields({
  formData, handleInputChange, handleCostChange, setFormData,
  isAdmin, userBranch, brandList, formBrandId, setFormBrandId,
  categoryOptions, nonAdminCategoryOptions, nonAdminBrand,
  formBranchOptions, onCancel,
}) {
  const catOptions     = isAdmin ? categoryOptions : nonAdminCategoryOptions;
  const brandSelected  = !!formBrandId;
  const branchSelected = !!formData.branch;

  // ── ingredient search state ──
  const [ingSearch,       setIngSearch]       = useState("");
  const [ingResults,      setIngResults]      = useState([]);
  const [ingSearching,    setIngSearching]    = useState(false);
  const [selectedIngs,    setSelectedIngs]    = useState(formData.ingredients || []);
  const [showIngDropdown, setShowIngDropdown] = useState(false);
  const ingRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ingRef.current && !ingRef.current.contains(e.target)) setShowIngDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // search ingredients from server
  useEffect(() => {
    if (!ingSearch.trim()) { setIngResults([]); setShowIngDropdown(false); return; }
    const timeout = setTimeout(async () => {
      setIngSearching(true);
      try {
        const branch = isAdmin ? formData.branch : userBranch;
        const q = branch ? `?branch=${encodeURIComponent(branch)}` : "";
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
        const data = await res.json();
        const filtered = (Array.isArray(data) ? data : []).filter(i =>
          i.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
          !selectedIngs.find(s => s.ingredient_id === i.id)
        );
        setIngResults(filtered);
        setShowIngDropdown(true);
      } catch { setIngResults([]); }
      finally { setIngSearching(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [ingSearch, formData.branch, isAdmin, userBranch, selectedIngs]);

  const addIngredient = (ing) => {
    const newList = [...selectedIngs, { ingredient_id: ing.id, name: ing.name, unit: ing.unit, quantity: "", cost_per_unit: ing.cost_per_unit }];
    setSelectedIngs(newList);
    setFormData(p => ({ ...p, ingredients: newList }));
    setIngSearch("");
    setIngResults([]);
    setShowIngDropdown(false);
  };

  const removeIngredient = (ingredient_id) => {
    const newList = selectedIngs.filter(i => i.ingredient_id !== ingredient_id);
    setSelectedIngs(newList);
    setFormData(p => ({ ...p, ingredients: newList }));
  };

  const updateIngQty = (ingredient_id, quantity) => {
    const newList = selectedIngs.map(i => i.ingredient_id === ingredient_id ? { ...i, quantity } : i);
    setSelectedIngs(newList);
    setFormData(p => ({ ...p, ingredients: newList }));
  };

  // compute total ingredient cost per product
  const totalIngCost = selectedIngs.reduce((sum, i) => {
    const qty  = parseFloat(i.quantity) || 0;
    const cost = parseFloat(i.cost_per_unit) || 0;
    return sum + qty * cost;
  }, 0);

  return (
    <>
      {/* 1. Item Name */}
      <InvField label="Item Name">
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={invInputSt} placeholder="Product name"/>
      </InvField>

      {/* 2. Ingredients */}
      <InvField label="Ingredients">
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

          {/* search box */}
          <div ref={ingRef} style={{ position:"relative" }}>
            <div style={{ position:"relative" }}>
              <SearchIcon size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted, pointerEvents:"none" }}/>
              <input
                type="text"
                value={ingSearch}
                onChange={e => setIngSearch(e.target.value)}
                onFocus={() => ingResults.length > 0 && setShowIngDropdown(true)}
                placeholder="Search ingredients to add…"
                style={{ ...invInputSt, paddingLeft:30 }}
              />
              {ingSearching && (
                <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.muted }}>searching…</span>
              )}
            </div>

            {/* dropdown results */}
            {showIngDropdown && ingResults.length > 0 && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", zIndex:200, maxHeight:180, overflowY:"auto" }}>
                {ingResults.map(ing => (
                  <div key={ing.id} onMouseDown={() => addIngredient(ing)}
                    style={{ padding:"9px 13px", cursor:"pointer", fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid #f2faf5` }}
                    onMouseEnter={e => e.currentTarget.style.background="#f0fdf5"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontWeight:600, color:C.ink }}>{ing.name}</span>
                    <span style={{ fontSize:11, color:C.muted }}>{ing.unit} · ₱{parseFloat(ing.cost_per_unit||0).toFixed(4)}/{ing.unit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* no results */}
            {showIngDropdown && ingResults.length === 0 && ingSearch.trim() && !ingSearching && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", zIndex:200, padding:"10px 13px", fontSize:12, color:C.muted, fontStyle:"italic" }}>
                No ingredients found for "{ingSearch}"
              </div>
            )}
          </div>

          {/* selected ingredients list */}
          {selectedIngs.length > 0 && (
            <div style={{ border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
              {/* header */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 24px", gap:8, padding:"6px 10px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>Ingredient</span>
                <span style={{ fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>Qty / Unit</span>
                <span style={{ fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>Cost</span>
                <span/>
              </div>

              {/* rows */}
              {selectedIngs.map(ing => {
                const lineCost = (parseFloat(ing.quantity)||0) * (parseFloat(ing.cost_per_unit)||0);
                return (
                  <div key={ing.ingredient_id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 24px", gap:8, padding:"7px 10px", alignItems:"center", borderBottom:`1px solid #f2faf5` }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{ing.name}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ing.quantity}
                        onChange={e => updateIngQty(ing.ingredient_id, e.target.value)}
                        placeholder="0"
                        style={{ ...invInputSt, padding:"5px 7px", width:58, fontSize:12 }}
                      />
                      <span style={{ fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>{ing.unit}</span>
                    </div>
                    <span style={{ fontSize:12, color:C.muted }}>
                      {lineCost > 0 ? `₱${lineCost.toFixed(2)}` : "—"}
                    </span>
                    <button type="button" onClick={() => removeIngredient(ing.ingredient_id)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#e53935", padding:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <XIcon size={13}/>
                    </button>
                  </div>
                );
              })}

              {/* total ingredient cost */}
              <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6, padding:"7px 10px", background:"#f9fefb", borderTop:`1px solid ${C.border}` }}>
                <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Total ingredient cost per unit:</span>
                <span style={{ fontSize:13, fontWeight:800, color:C.green }}>₱{totalIngCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          {selectedIngs.length === 0 && (
            <div style={{ fontSize:12, color:C.muted, fontStyle:"italic", padding:"6px 2px" }}>
              No ingredients added yet. Search above to add.
            </div>
          )}
        </div>
      </InvField>

      {/* 3. Brand */}
      {isAdmin ? (
        <InvField label="Brand">
          <select
            style={{ ...invInputSt, cursor:"pointer" }}
            value={formBrandId}
            onChange={e => { setFormBrandId(e.target.value); setFormData(p => ({ ...p, branch:"", category:"" })); }}
            required
          >
            <option value="">Select brand...</option>
            {brandList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </InvField>
      ) : (
        <InvField label="Brand">
          <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700 }}>{nonAdminBrand?.name||"—"}</div>
        </InvField>
      )}

      {/* 4. Branch */}
      {isAdmin ? (
        <InvField label="Branch">
          <select
            style={{ ...invInputSt, cursor:brandSelected?"pointer":"not-allowed", opacity:brandSelected?1:0.55 }}
            name="branch"
            value={formData.branch}
            onChange={e => setFormData(p => ({ ...p, branch:e.target.value, category:"" }))}
            required
            disabled={!brandSelected}
          >
            <option value="">{brandSelected ? "Select branch..." : "Select a brand first"}</option>
            {formBranchOptions.map(br => <option key={br} value={br}>{br}</option>)}
          </select>
        </InvField>
      ) : (
        <InvField label="Branch">
          <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700 }}>{userBranch||"—"}</div>
        </InvField>
      )}

      {/* 5. Category */}
      <InvField label="Category">
        <select
          style={{ ...invInputSt, cursor:(isAdmin&&!branchSelected)?"not-allowed":"pointer", opacity:(isAdmin&&!branchSelected)?0.55:1 }}
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          disabled={isAdmin && !branchSelected}
        >
          <option value="">{isAdmin&&!branchSelected ? "Select a branch first" : "Select category..."}</option>
          {catOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </InvField>

      {/* 6. Cost + Margin */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <InvField label="Product Cost (₱)">
          <input type="number" name="cost" value={formData.cost} onChange={handleCostChange} step="0.01" min="0" style={invInputSt} placeholder="0.00"/>
        </InvField>
        <InvField label="Profit Margin (%)">
          <input type="number" value={DEFAULT_PROFIT_MARGIN} readOnly disabled style={{ ...invInputSt, background:"#f5f5f5", color:C.muted, cursor:"not-allowed" }} title="Fixed at 40%"/>
        </InvField>
      </div>
      {formData.cost !== "" && parseFloat(formData.cost) > 0 && (
        <div style={{ background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:9, padding:"9px 13px", marginBottom:13, fontSize:12, display:"flex", gap:8, alignItems:"center", color:C.ok }}>
          Cost: <strong>{fmtPeso(formData.cost)}</strong>
          <span style={{ color:C.muted }}>+</span>
          <strong>{DEFAULT_PROFIT_MARGIN}%</strong>
          <span style={{ color:C.muted }}>=</span>
          Selling price: <strong style={{ color:C.green, fontSize:13 }}>{fmtPeso(formData.price)}</strong>
        </div>
      )}

      {/* 7. Stock / Min Stock / Price */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <InvField label="Stock Qty"><input type="number" name="stock"    value={formData.stock}    onChange={handleInputChange} min="0" style={invInputSt}/></InvField>
        <InvField label="Min Stock"><input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} min="0" style={invInputSt}/></InvField>
        <InvField label="Selling Price (₱)"><input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" style={invInputSt} placeholder="Auto-calc"/></InvField>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <button type="button" onClick={onCancel} style={btnSt}>Cancel</button>
        <button type="submit" style={btnPrimarySt}>Save Item</button>
      </div>
    </>
  );
}

function InventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";

  const brandList = propBrands.length > 0 ? propBrands : [
    { id:"ipharma",     name:"iPharma",      emoji:"💊", branches:["Main Branch","Alabang","Makati","Pasay","Paranaque"] },
    { id:"coffeesport", name:"Coffee Sport", emoji:"☕", branches:["HQ","BGC Branch","Ortigas","Cubao"] },
  ];

  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => {
      (b.branches||[]).forEach(br => {
        const name = typeof br==="string"?br:br.name;
        if (!out.find(x => x.branch===name)) out.push({ brand:b.name, branch:name });
      });
    });
    return out;
  }, [brandList]);

  const [inventory,       setInventory]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [categories,      setCategories]      = useState(DEFAULT_CATEGORIES);
  const [filterBrand,     setFilterBrand]     = useState(null);
  const [filterBranch,    setFilterBranch]    = useState(null);
  const [filterCategory,  setFilterCategory]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingItem,     setEditingItem]     = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page,            setPage]            = useState(0);
  // ── NEW: tracks which brand is selected in the form ──
  const [formBrandId,     setFormBrandId]     = useState("");

  const emptyForm = useCallback(() => ({
    name:"", category:"", branch:isAdmin?"":userBranch, cost:"", stock:0, minStock:0, price:"",
  }), [isAdmin, userBranch]);
  const [formData, setFormData] = useState(emptyForm);

  const fetchInventory = useCallback(async (branch) => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${q}`);
      const d   = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err); setInventory([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isAdmin) { fetchInventory(userBranch); return; }
    fetchInventory(filterBranch||undefined);
  }, [filterBranch, isAdmin, userBranch, fetchInventory]);

  useEffect(() => { setPage(0); }, [searchQuery, filterBrand, filterBranch, filterCategory, filterStatus]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q) && !i.branch.toLowerCase().includes(q)) return false;
      if (filterBranch) { if (i.branch!==filterBranch) return false; }
      else if (filterBrand) {
        const brand = brandList.find(b => b.id===filterBrand);
        if (brand) { const names=(brand.branches||[]).map(br=>typeof br==="string"?br:br.name); if (!names.includes(i.branch)) return false; }
      }
      if (filterCategory && i.category!==filterCategory) return false;
      if (filterStatus==="low" && i.stock>=i.min_stock) return false;
      if (filterStatus==="ok"  && i.stock< i.min_stock) return false;
      return true;
    });
  }, [inventory, searchQuery, filterBrand, filterBranch, filterCategory, filterStatus, brandList]);

  const lowCount   = filteredItems.filter(i => i.stock < i.min_stock).length;
  const totalValue = filteredItems.reduce((s, i) => s + (i.price||0)*(i.stock||0), 0);

  const refetch = () => fetchInventory(isAdmin ? filterBranch||undefined : userBranch);

  const handleAddItem = async (e) => {
  e.preventDefault();
  const payload = { ...formData, branch:isAdmin?formData.branch:userBranch, min_stock:formData.minStock };
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const d   = await res.json();
    if (d.success) {
      // save ingredients recipe if any were added
      if (formData.ingredients?.length > 0) {
        await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ ingredients: formData.ingredients.map(i => ({ ingredient_id:i.ingredient_id, quantity:parseFloat(i.quantity)||0, unit:i.unit })) })
        });
      }
      await refetch(); setShowAddModal(false); setFormData(emptyForm()); setFormBrandId("");
    } else alert(d.error||"Failed to add item");
  } catch { alert("Failed to add item"); }
};

const handleEditItem = async (e) => {
  e.preventDefault();
  const payload = { ...formData, branch:isAdmin?formData.branch:userBranch, min_stock:formData.minStock };
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const d   = await res.json();
    if (d.success) {
      // always save ingredients (even empty = clears recipe)
      await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}/ingredients`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ingredients: (formData.ingredients||[]).map(i => ({ ingredient_id:i.ingredient_id, quantity:parseFloat(i.quantity)||0, unit:i.unit })) })
      });
      await refetch(); setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); setFormBrandId("");
    } else alert(d.error||"Failed to update item");
  } catch { alert("Failed to update item"); }
};

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${id}`, { method:"DELETE" });
      const d   = await res.json();
      if (d.success) { await refetch(); setConfirmDeleteId(null); }
      else alert(d.error||"Failed to delete");
    } catch { alert("Failed to delete"); }
  };

  const openEditModal = async (item) => {
  setEditingItem(item);
  const ownerBrand = brandList.find(b =>
    (b.branches||[]).some(br => (typeof br==="string"?br:br.name) === item.branch)
  );
  setFormBrandId(ownerBrand ? String(ownerBrand.id) : "");

  // fetch existing recipe for this item
  let ingredients = [];
  try {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${item.id}/ingredients`);
    const data = await res.json();
    ingredients = Array.isArray(data) ? data.map(r => ({
      ingredient_id : r.ingredient_id,
      name          : r.ingredient_name,
      unit          : r.unit,
      quantity      : r.quantity,
      cost_per_unit : r.cost_per_unit,
    })) : [];
  } catch { ingredients = []; }

  setFormData({ name:item.name, category:item.category, branch:item.branch, cost:item.cost||"", stock:item.stock, minStock:item.min_stock, price:item.price, ingredients });
  setShowEditModal(true);
};

  const handleCostChange = (e) => {
    const cost  = e.target.value;
    const price = cost !== "" ? (parseFloat(cost) * (1 + DEFAULT_PROFIT_MARGIN/100)).toFixed(2) : "";
    setFormData(p => ({ ...p, cost, price }));
  };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]:value })); };

  const excelRef = useRef(null);
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const wb       = XLSX.read(ev.target.result, { type:"array" });
      const newItems = [];
      wb.SheetNames.forEach(sheetName => {
        const ws   = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval:"" });
        const matchedBranch = findMatchingBranch(sheetName, allBranches);
        const brandName     = matchedBranch ? (allBranches.find(x => x.branch===matchedBranch)?.brand||"") : "";
        const sheetCats = [...new Set(rows.map(r => String(r.category||r.Category||r.CATEGORY||"").trim()).filter(Boolean))];
        sheetCats.forEach(c => setCategories(prev => prev.includes(c)?prev:[...prev,c]));
        rows.forEach(row => {
          const name = String(row.name||row.Name||row["ITEM NAME"]||row["Item Name"]||row.item_name||"").trim();
          if (!name) return;
          const category = String(row.category||row.Category||row.CATEGORY||"Other").trim();
          const cost     = parseFloat(row.cost||row.Cost||row.COST||0)||0;
          const rawPrice = parseFloat(row.price||row.Price||row.PRICE||row.selling_price||0)||0;
          const price    = rawPrice>0?rawPrice:(cost>0?parseFloat((cost*1.4).toFixed(2)):0);
          const stock    = parseInt(row.stock||row.Stock||row.STOCK||row.qty||row.Qty||0)||0;
          const minStock = parseInt(row.min_stock||row["Min Stock"]||row.minstock||0)||0;
          const branch   = String(row.branch||row.Branch||matchedBranch||"").trim();
          newItems.push({ name, category, branch:branch||"Unknown", brand:brandName, cost, stock, min_stock:minStock, price });
        });
      });
      let saved = 0;
      for (const item of newItems) {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(item) });
          const d   = await res.json();
          if (d.success) saved++;
        } catch { /* skip */ }
      }
      e.target.value = "";
      alert(`Parsed ${newItems.length} row(s). Saved ${saved} to server.`);
      refetch();
    };
    reader.readAsArrayBuffer(file);
  };

  const anyFilter = filterBrand||filterBranch||filterCategory||filterStatus||searchQuery;
  const clearAll  = () => { setFilterBrand(null); setFilterBranch(null); setFilterCategory(""); setFilterStatus(""); setSearchQuery(""); };

  const viewLabel = (() => {
    if (filterBranch) return `${brandList.find(b=>b.id===filterBrand)?.name||""} – ${filterBranch}`;
    if (filterBrand)  return `${brandList.find(b=>b.id===filterBrand)?.name||""} – All Branches`;
    return "All Inventory";
  })();

  // ── derive selected brand object from formBrandId ──
  const activeBrandForForm = useMemo(() => {
    if (!formBrandId) return null;
    return brandList.find(b => String(b.id) === String(formBrandId)) || null;
  }, [formBrandId, brandList]);

  // ── branches that belong to the selected brand ──
  const formBranchOptions = useMemo(() => {
    if (!activeBrandForForm) return [];
    return (activeBrandForForm.branches || []).map(br => typeof br === "string" ? br : br.name);
  }, [activeBrandForForm]);

  // ── categories that belong to the selected brand ──
  const categoryOptions = useMemo(() => {
    if (activeBrandForForm?.categories?.length > 0) return activeBrandForForm.categories;
    return categories;
  }, [activeBrandForForm, categories]);

  // ── for non-admin: resolve their brand once ──
  const nonAdminBrand = useMemo(() => {
    if (isAdmin) return null;
    return brandList.find(b =>
      (b.branches||[]).some(br => (typeof br==="string"?br:br.name) === userBranch)
    ) || null;
  }, [isAdmin, userBranch, brandList]);

  const nonAdminCategoryOptions = useMemo(() => {
    if (nonAdminBrand?.categories?.length > 0) return nonAdminBrand.categories;
    return categories;
  }, [nonAdminBrand, categories]);

 
  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif", background:"linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight:"100vh", padding:"24px 30px 48px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:C.green, marginBottom:3 }}>Stock Management</div>
        <h1 style={{ fontSize:26, fontWeight:900, color:C.ink, letterSpacing:"-0.6px", margin:0 }}>Inventory Management</h1>
      </div>

      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
            <SearchIcon size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}/>
            <input type="text" placeholder="Search name, category, branch…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
            {searchQuery && <XIcon size={12} onClick={() => setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.muted }}/>}
          </div>
          {isAdmin && (
            <BrandBranchFilter brands={brandList} activeBrand={filterBrand} activeBranch={filterBranch}
              onChangeBrand={id => { setFilterBrand(id); setFilterBranch(null); }} onChangeBranch={setFilterBranch}/>
          )}
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...invInputSt, width:150 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...invInputSt, width:130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <div style={{ flex:1 }}/>
          <label style={{ ...btnSt, cursor:"pointer" }}>
            <FileIcon size={13}/> Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>
          <button onClick={() => { setFormData({ ...emptyForm(), branch:isAdmin?(filterBranch||""):userBranch }); setFormBrandId(isAdmin?(filterBrand||""):(nonAdminBrand?String(nonAdminBrand.id):"")); setShowAddModal(true); }} style={btnPrimarySt}>
            <PlusIcon size={13}/> Add New Item
          </button>
        </div>
        {anyFilter && (
          <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Active:</span>
            {searchQuery    && <Chip label={`"${searchQuery}"`} color="#3949ab" bg="#e8eaf6" onRemove={() => setSearchQuery("")}/>}
            {filterBrand && !filterBranch && <Chip label={`${brandList.find(b=>b.id===filterBrand)?.emoji||""} ${brandList.find(b=>b.id===filterBrand)?.name}`} color={C.greenDk} bg={C.greenLt} onRemove={() => { setFilterBrand(null); setFilterBranch(null); }}/>}
            {filterBranch   && <Chip label={filterBranch}   color="#00695c" bg="#e0f7fa" onRemove={() => setFilterBranch(null)}/>}
            {filterCategory && <Chip label={filterCategory} color="#00695c" bg="#e0f2f1" onRemove={() => setFilterCategory("")}/>}
            {filterStatus   && <Chip label={filterStatus==="low"?"Low Stock":"In Stock"} color={filterStatus==="low"?C.warn:C.ok} bg={filterStatus==="low"?C.warnBg:C.okBg} onRemove={() => setFilterStatus("")}/>}
            <button onClick={clearAll} style={{ ...smallBtnSt, height:24, border:`1px solid ${C.border}`, fontSize:11, color:C.muted, marginLeft:"auto" }}>Clear all</button>
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <StatCard label="Showing"    value={filteredItems.length.toLocaleString()} sub={`of ${inventory.length.toLocaleString()} total`}/>
        <StatCard label="Low Stock"  value={lowCount} sub="Needs reorder" accent={C.warn}/>
        <StatCard label="Est. Value" value={fmtPeso(totalValue)} sub="Filtered selection"/>
        <StatCard label="Categories" value={categories.length} sub="Product types" accent="#1565c0"/>
      </div>

      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
          <span style={{ fontWeight:800, fontSize:13, display:"flex", alignItems:"center", gap:7 }}><StoreIcon size={14}/> {viewLabel}</span>
          <span style={{ fontSize:12, opacity:0.9 }}>{filteredItems.length.toLocaleString()} items – {lowCount} low stock</span>
        </div>
        {loading ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading inventory…</div>
        ) : (
          <InventoryTable items={filteredItems} onEdit={openEditModal} onDelete={handleDeleteItem} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} page={page} setPage={setPage}/>
        )}
      </div>

      {showAddModal && (
        <InvModal title="Add New Inventory Item" onClose={() => { setShowAddModal(false); setFormData(emptyForm()); setFormBrandId(""); }} onSubmit={handleAddItem}>
          <FormFields
            formData={formData} handleInputChange={handleInputChange} handleCostChange={handleCostChange} setFormData={setFormData}
            isAdmin={isAdmin} userBranch={userBranch} brandList={brandList} formBrandId={formBrandId} setFormBrandId={setFormBrandId}
            categoryOptions={categoryOptions} nonAdminCategoryOptions={nonAdminCategoryOptions} nonAdminBrand={nonAdminBrand}
            formBranchOptions={formBranchOptions}
            onCancel={() => { setShowAddModal(false); setFormData(emptyForm()); setFormBrandId(""); }}
          />
        </InvModal>
      )}
      {showEditModal && (
      <InvModal title="Edit Inventory Item" onClose={() => { setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); setFormBrandId(""); }} onSubmit={handleEditItem}>
        <FormFields
          formData={formData} handleInputChange={handleInputChange} handleCostChange={handleCostChange} setFormData={setFormData}
          isAdmin={isAdmin} userBranch={userBranch} brandList={brandList} formBrandId={formBrandId} setFormBrandId={setFormBrandId}
          categoryOptions={categoryOptions} nonAdminCategoryOptions={nonAdminCategoryOptions} nonAdminBrand={nonAdminBrand}
          formBranchOptions={formBranchOptions}
          onCancel={() => { setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); setFormBrandId(""); }}
        />
      </InvModal>
      )}
    </div>
  );
}

function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label}
      <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────
function ReportsContent() {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Sales & Reports</h2>
        <button className="btn btn-primary">Generate AI Report</button>
      </div>
      <div className="chart-placeholder">Sales Analytics Dashboard (Placeholder - Connect to Database)</div>
      <div style={{ marginTop:'2rem' }}>
        <h3 style={{ marginBottom:'1rem', color:'var(--green-primary)' }}>Report History</h3>
        <table>
          <thead><tr><th>Report Type</th><th>Generated Date</th><th>Period</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Monthly Sales Summary</td><td>2026-01-27 14:30</td><td>January 2026</td><td><span className="status-badge status-approved">COMPLETED</span></td><td><button className="btn btn-primary btn-sm">Download PDF</button></td></tr>
            <tr><td>Inventory Analysis</td><td>2026-01-25 09:15</td><td>Q1 2026</td><td><span className="status-badge status-approved">COMPLETED</span></td><td><button className="btn btn-primary btn-sm">Download PDF</button></td></tr>
          </tbody>
        </table>
      </div>
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

  const openEditModal   = (user) => { setEditingUser(user); setFormData({ name:user.name, email:user.email, role:user.role, branch:user.branch, password:'' }); setShowEditModal(true); };
  const resetForm       = () => { setFormData({ name:'', email:'', role:'', branch:'', password:'' }); setShowPasswordValidation(false); setPasswordErrors([]); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]:value })); };

  const PasswordValidation = ({ errors }) => (
    <div style={{ marginTop:'8px', fontSize:'12px', padding:'10px', backgroundColor:'#f8f9fa', borderRadius:'4px', border:'1px solid #dee2e6' }}>
      <div style={{ marginBottom:'6px', fontWeight:'600', color:'#495057' }}>Password must contain:</div>
      {[['minLength','At least 8 characters'],['uppercase','At least one uppercase letter (A-Z)'],['lowercase','At least one lowercase letter (a-z)'],['number','At least one number (0-9)'],['specialChar','At least one special character (!@#$%^&*...)']].map(([key,text]) => (
        <div key={key} style={{ color:errors.includes(key)?'#dc3545':'#28a745', marginBottom:'4px' }}>{errors.includes(key)?'✗':'✓'} {text}</div>
      ))}
    </div>
  );

  const pwChange = (e) => {
    handleInputChange(e);
    const v = e.target.value;
    if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
    else   { setShowPasswordValidation(false); setPasswordErrors([]); }
  };

  return (
    <>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">User Management</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add New User</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.role}</td><td>{user.branch}</td>
                  <td><span className="status-badge status-approved">{user.status?user.status.toUpperCase():'ACTIVE'}</span></td>
                  <td><div className="action-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => openEditModal(user)}>Edit</button>
                    <button className="btn btn-danger btn-sm"  onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Add New User</h2></div>
            <form onSubmit={handleAddUser}>
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required/></div>
              <div className="form-group"><label className="form-label">Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required/></div>
              <div className="form-group"><label className="form-label">Role</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleInputChange} required>
                  <option value="">Select Role</option><option>Administrator</option><option>Franchisor</option><option>Franchisee</option><option>Manager</option><option>Staff</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Branch</label>
                <select name="branch" className="form-select" value={formData.branch} onChange={handleInputChange} required>
                  <option value="">Select Branch</option><option>Head Office</option><option>Branch A</option><option>Branch B</option><option>Branch C</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Password</label><input type="password" name="password" className="form-input" value={formData.password} onChange={pwChange} required/>{showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}</div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add User</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Edit User</h2></div>
            <form onSubmit={handleEditUser}>
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required/></div>
              <div className="form-group"><label className="form-label">Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required/></div>
              <div className="form-group"><label className="form-label">Role</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleInputChange} required>
                  <option>Administrator</option><option>Franchisor</option><option>Franchisee</option><option>Manager</option><option>Staff</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Branch</label>
                <select name="branch" className="form-select" value={formData.branch} onChange={handleInputChange} required>
                  <option>Head Office</option><option>Branch A</option><option>Branch B</option><option>Branch C</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">New Password (leave blank to keep current)</label><input type="password" name="password" className="form-input" placeholder="Enter new password or leave blank" value={formData.password} onChange={pwChange}/>{showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}</div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNICATION
// ─────────────────────────────────────────────────────────────────────────────
function CommunicationContent() {
  return (
    <div className="section">
      <div className="section-header"><h2 className="section-title">Communication Center</h2><button className="btn btn-primary">+ New Message</button></div>
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', minHeight:'500px' }}>
        <div style={{ background:'var(--gray-100)', padding:'1.5rem', borderRadius:'12px' }}>
          <h3 style={{ marginBottom:'1rem', color:'var(--green-primary)' }}>Conversations</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <div style={{ padding:'1rem', background:'var(--white)', borderRadius:'8px', cursor:'pointer' }}><strong>Branch A Manager</strong><div style={{ fontSize:'0.85rem', color:'var(--gray-500)' }}>Inventory request...</div></div>
            <div style={{ padding:'1rem', background:'var(--white)', borderRadius:'8px', cursor:'pointer' }}><strong>Franchisee - Sarah</strong><div style={{ fontSize:'0.85rem', color:'var(--gray-500)' }}>Training schedule...</div></div>
          </div>
        </div>
        <div style={{ background:'var(--gray-100)', padding:'1.5rem', borderRadius:'12px' }}><div className="chart-placeholder" style={{ height:'100%' }}>Message Thread (Placeholder)</div></div>
      </div>
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
    <div style={{ marginTop:'8px', fontSize:'12px', padding:'10px', backgroundColor:'#f8f9fa', borderRadius:'4px', border:'1px solid #dee2e6' }}>
      <div style={{ marginBottom:'6px', fontWeight:'600', color:'#495057' }}>Password must contain:</div>
      {[['minLength','At least 8 characters'],['uppercase','At least one uppercase letter (A-Z)'],['lowercase','At least one lowercase letter (a-z)'],['number','At least one number (0-9)'],['specialChar','At least one special character (!@#$%^&*...)']].map(([key,text]) => (
        <div key={key} style={{ color:passwordErrors.includes(key)?'#dc3545':'#28a745', marginBottom:'4px' }}>{passwordErrors.includes(key)?'✗':'✓'} {text}</div>
      ))}
    </div>
  );

  return (
    <>
      <div className="section">
        <div className="section-header"><h2 className="section-title">Edit Profile</h2></div>
        <form onSubmit={handleSubmit} style={{ maxWidth:'600px' }}>
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required/></div>
          <div className="form-group"><label className="form-label">Work Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required/></div>
          <div className="form-group"><label className="form-label">Personal Email Address (Optional)</label><input type="email" name="personalEmail" className="form-input" placeholder="your.personal@email.com" value={formData.personalEmail} onChange={handleInputChange}/><p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginTop:'0.5rem' }}>OTP for password changes will be sent here</p></div>
          <div className="form-group"><label className="form-label">Role</label><input type="text" name="role" className="form-input" value={formData.role} disabled style={{ background:'var(--gray-200)', cursor:'not-allowed' }}/></div>
          <div style={{ marginTop:'2rem', paddingTop:'2rem', borderTop:'2px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom:'0.5rem', color:'var(--green-primary)' }}>Change Password</h3>
            <p style={{ fontSize:'0.9rem', color:'var(--gray-500)', marginBottom:'1.5rem' }}>🔐 An OTP will be sent to your email for verification</p>
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" name="currentPassword" className="form-input" placeholder="Enter current password" value={formData.currentPassword} onChange={handleInputChange}/></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" name="newPassword" className="form-input" placeholder="Enter new password (min. 8 characters)" value={formData.newPassword} onChange={handleInputChange}/>{showPasswordValidation && <PwValidation/>}</div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" name="confirmPassword" className="form-input" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleInputChange}/></div>
          </div>
          <div className="modal-actions" style={{ marginTop:'2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🔐 Verify OTP</h2>
              <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', marginTop:'0.5rem' }}>We've sent a verification code to:</p>
              <p style={{ color:'var(--green-primary)', fontWeight:'600', fontSize:'0.95rem' }}>{formData.personalEmail||formData.email}</p>
            </div>
            <div style={{ padding:'1rem 0' }}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <input type="text" className="form-input" placeholder="000000" value={otp}
                  onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,6); setOtp(v); setOtpError(''); }}
                  maxLength={6} style={{ fontSize:'1.5rem', textAlign:'center', letterSpacing:'0.5rem', fontFamily:'monospace' }} autoFocus/>
                <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginTop:'0.5rem', textAlign:'center' }}>Please check your email for the verification code</p>
              </div>
              {otpSent  && !otpError && <div style={{ textAlign:'center', marginTop:'1rem', padding:'0.75rem', background:'rgba(46,125,50,0.1)', borderRadius:'8px', color:'var(--green-primary)' }}>✅ OTP sent successfully</div>}
              {otpError && <div style={{ textAlign:'center', marginTop:'1rem', padding:'0.75rem', background:'rgba(239,68,68,0.1)', borderRadius:'8px', color:'var(--red)' }}>❌ {otpError}</div>}
              <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
                <button type="button" style={{ background:'none', border:'none', color:'var(--green-primary)', cursor:'pointer', textDecoration:'underline', fontSize:'0.9rem' }} onClick={sendOtp}>Resend OTP</button>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={verifyOtpAndChangePassword} disabled={otp.length!==6} style={{ opacity:otp.length!==6?0.5:1 }}>Verify & Change Password</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'450px', textAlign:'center' }}>
            <div style={{ padding:'2rem 0' }}>
              <div style={{ width:'80px', height:'80px', background:'rgba(46,125,50,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'3rem' }}>✅</div>
              <h2 style={{ color:'var(--green-primary)', fontSize:'1.8rem', marginBottom:'1rem', fontFamily:'Montserrat,sans-serif', fontWeight:'700' }}>Password Changed Successfully!</h2>
              <p style={{ color:'var(--gray-600)', fontSize:'1rem', marginBottom:'1.5rem', lineHeight:'1.6' }}>Your password has been updated.<br/>You will be redirected to the login page shortly.</p>
              <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', fontStyle:'italic' }}>Redirecting in 3 seconds...</p>
              <div style={{ marginTop:'2rem', padding:'1rem', background:'var(--gray-100)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--gray-600)' }}>💡 Please use your new password on the next login</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ACCOUNT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CreateAccountModal({ applicant, onClose }) {
  const handleSubmit = (e) => { e.preventDefault(); alert(`Account created for ${applicant.name}!`); onClose(); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2 className="modal-title">Create Account</h2><p style={{ color:'var(--gray-500)', fontSize:'0.9rem' }}>Creating account for: <strong>{applicant?.name}</strong></p></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" defaultValue={applicant?.name} required/></div>
          <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" defaultValue={applicant?.email} required/></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input type="tel" className="form-input" defaultValue={applicant?.phone} required/></div>
          <div className="form-group"><label className="form-label">Role</label>
            <select className="form-select" required>
              <option value="">Select Role</option><option value="franchisor">Franchisor</option><option value="franchisee">Franchisee</option><option value="manager">Manager</option><option value="staff">Staff</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Assigned Branch</label>
            <select className="form-select" required>
              <option value="">Select Branch</option><option value="branch-a">Branch A</option><option value="branch-b">Branch B</option><option value="branch-c">Branch C</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Temporary Password</label><input type="password" className="form-input" placeholder="Enter temporary password" required/></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW APPLICATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ViewApplicationModal({ application, onClose }) {
  if (!application) return null;
  const isIPharma = application.franchise === 'iPharma Mart';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'700px', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">📋 Franchise Application Details</h2>
          <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', marginTop:'0.5rem' }}>
            Application ID: #{application.id} | Status:{' '}
            <span className={`status-badge status-${application.status}`} style={{ marginLeft:'0.5rem' }}>{application.status.toUpperCase()}</span>
          </p>
        </div>
        <div style={{ padding:'1rem 0' }}>
          <AppSection title="Basic Information">
            <AppGrid2>
              <AppField label="Date Applied"   value={application.date}/>
              <AppField label="Payment Mode"   value={application.paymentMode}/>
              <div style={{ gridColumn:'1/-1' }}><AppField label="Chosen Concept" value={application.franchise} highlight/></div>
            </AppGrid2>
          </AppSection>
          <AppSection title="Applicant Information">
            <AppGrid2>
              <div style={{ gridColumn:'1/-1' }}><AppField label="Full Name" value={application.name} large/></div>
              <AppField label="Date of Birth"   value={application.dob}/>
              <AppField label="Civil Status"    value={application.civilStatus}/>
              {!isIPharma && <><AppField label="Gender" value={application.gender}/><AppField label="Nationality" value={application.nationality}/></>}
              <AppField label="No. of Dependents" value={application.dependents||'N/A'}/>
              <AppField label="Mobile Number"     value={application.phone}/>
              {isIPharma && application.telephone && <AppField label="Telephone" value={application.telephone}/>}
              <div style={{ gridColumn:'1/-1' }}><AppField label="Email Address"    value={application.email}/></div>
              <div style={{ gridColumn:'1/-1' }}><AppField label="Present Address"  value={application.address}/></div>
            </AppGrid2>
          </AppSection>
          {isIPharma && application.education && <AppSection title="Education"><AppField label="Educational Background" value={application.education}/></AppSection>}
          {application.spouseName && (
            <AppSection title="Spouse Information">
              <AppGrid2>
                <AppField label="Spouse Name"       value={application.spouseName}/>
                <AppField label="Spouse Occupation" value={application.spouseOccupation}/>
                {isIPharma && application.spouseDob && <AppField label="Spouse Date of Birth" value={application.spouseDob}/>}
              </AppGrid2>
            </AppSection>
          )}
          {!isIPharma && (
            <AppSection title="Employment Information">
              <AppGrid2>
                <AppField label="Employment Type"        value={application.employmentType}/>
                <AppField label="Years with Employer"    value={`${application.yearsEmployer} years`}/>
                <AppField label="Monthly Income"         value={`₱${parseInt(application.income).toLocaleString()}`} highlight/>
                <AppField label="Position"               value={application.position}/>
                <div style={{ gridColumn:'1/-1' }}><AppField label="Employer / Business Name" value={application.employerName}/></div>
                <div style={{ gridColumn:'1/-1' }}><AppField label="Business Address"         value={application.businessAddress}/></div>
                <div style={{ gridColumn:'1/-1' }}><AppField label="Nature of Business"       value={application.businessNature}/></div>
              </AppGrid2>
            </AppSection>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary"   onClick={() => window.print()}>🖨️ Print Application</button>
        </div>
      </div>
    </div>
  );
}

// ViewApplicationModal helpers — prefixed with "App" to avoid naming conflicts
function AppSection({ title, children }) {
  return (
    <div style={{ marginBottom:'2rem' }}>
      <h3 style={{ color:'var(--green-primary)', fontSize:'1.2rem', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--green-accent)' }}>{title}</h3>
      {children}
    </div>
  );
}
function AppGrid2({ children }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>{children}</div>;
}
function AppField({ label, value, highlight, large }) {
  return (
    <div>
      <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginBottom:'0.3rem' }}>{label}</p>
      <p style={{ fontWeight:'600', fontSize:large?'1.1rem':'1rem', color:highlight?'var(--green-primary)':'inherit' }}>{value}</p>
    </div>
  );
}