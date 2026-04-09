import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import Receipts from './Receipts';
import {
  Home,
  Box,
  FileText,
  FileCheck,
  Users,
  BarChart2,
  MessageCircle,
  User,
  ShoppingCart,
  LogOut,
  Search, Package, AlertTriangle, DollarSign, Grid3X3,
  ChevronDown, Plus, Pencil, Trash2, X, Check, Building2,
  Store, TrendingDown, TrendingUp, Layers,
  GitBranch, Globe, MapPin, Phone, Mail, Edit2,
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
    fetch("http://localhost:5001/brands")
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch brands:", err));
  }, []);

  const [applications, setApplications] = useState([]);
  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5001/applications');
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
        const response = await fetch(`http://localhost:5001/applications/${id}`, { method: 'DELETE' });
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
      const response = await fetch(`http://localhost:5001/applications/${id}/status`, {
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
    // ── NEW ──
    { id: 'brandBranch',  label: 'Brand & Branch',       icon: <GitBranch size={20} /> },
    { id: 'profile',      label: 'Edit Profile',         icon: <User size={20} /> },
    { id: 'logout',       label: 'Logout',               icon: <LogOut size={20} />, action: handleLogout },
  ];

  const handleCreateAccount  = (applicant) => { setSelectedApplicant(applicant); setShowCreateAccountModal(true); };
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

        /* Sidebar */
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

        /* Main */
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

        /* Shared section/table styles */
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
        .insights-grid { display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); }
        .insight-card { background:linear-gradient(135deg,rgba(46,125,50,0.05),rgba(212,223,51,0.05)); padding:1.8rem; border-radius:12px; border:1px solid rgba(46,125,50,0.1); }
        .insight-header { display:flex; align-items:center; gap:0.8rem; margin-bottom:1rem; }
        .insight-icon { font-size:1.8rem; }
        .insight-title { font-weight:600; color:var(--green-primary); font-size:1.1rem; }
        .insight-text { color:var(--gray-600); line-height:1.6; font-size:0.95rem; }
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

      {/* Sidebar */}
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
                if (item.action) {
                  item.action();
                } else {
                  setActiveModule(item.id);
                  if (item.id === 'applications') fetchApplications();
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <h1 className="top-bar-title"></h1>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">Admin — {user?.branch}</div>
            </div>
            <div className="user-avatar">{user.avatar}</div>
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
          {/* ── NEW ── */}
          {activeModule === 'brandBranch'   &&<BrandManagementContent brands={brands} onBrandsChange={setBrands} />}
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
        <div className="modal-overlay" style={{zIndex:3000}} onClick={() => setShowLogoutModal(false)}>
          <div className="modal" style={{maxWidth:'400px',textAlign:'center'}} onClick={e => e.stopPropagation()}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2rem'}}>🚪</div>
            <h2 className="modal-title" style={{color:'var(--gray-800)'}}>Log out?</h2>
            <p style={{color:'var(--gray-500)',fontSize:'0.9rem',margin:'0.5rem 0 2rem'}}>You'll need to sign in again to access your account.</p>
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

function BrandManagementContent({ brands: propBrands, onBrandsChange }) {
  const [brands, setBrands] = useState(propBrands || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  // Modals
  const [showAddBrandModal,   setShowAddBrandModal]   = useState(false);
  const [showEditBrandModal,  setShowEditBrandModal]  = useState(false);
  const [showAddBranchModal,  setShowAddBranchModal]  = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBrand,   setSelectedBrand]   = useState(null);
  const [selectedBranch,  setSelectedBranch]  = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const emptyBrand  = { name: '', region: '', contact_email: '', contact_phone: '', description: '' };
  const emptyBranch = { name: '', brand_id: '', region: '', manager: '', contact: '', address: '', status: 'Active' };

  const [brandForm,  setBrandForm]  = useState(emptyBrand);
  const [branchForm, setBranchForm] = useState(emptyBranch);
  
  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5001/brands");
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
    try {
      const res  = await fetch('http://localhost:5001/brands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBrandModal(false); setBrandForm(emptyBrand); }
      else alert(data.error || 'Failed to add brand');
    } catch { alert('Failed to add brand'); }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`http://localhost:5001/brands/${selectedBrand.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBrandModal(false); setSelectedBrand(null); }
      else alert(data.error || 'Failed to update brand');
    } catch { alert('Failed to update brand'); }
  };

  const handleDeleteBrand = async (id) => {
    if (confirmDeleteId !== `brand-${id}`) { setConfirmDeleteId(`brand-${id}`); return; }
    try {
      const res  = await fetch(`http://localhost:5001/brands/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setConfirmDeleteId(null); }
      else alert(data.error || 'Failed to delete brand');
    } catch { alert('Failed to delete brand'); }
  };

  /* ── BRANCH CRUD ── */
  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch('http://localhost:5001/branches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowAddBranchModal(false); setBranchForm(emptyBranch); }
      else alert(data.error || 'Failed to add branch');
    } catch { alert('Failed to add branch'); }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`http://localhost:5001/branches/${selectedBranch.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm),
      });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setShowEditBranchModal(false); setSelectedBranch(null); }
      else alert(data.error || 'Failed to update branch');
    } catch { alert('Failed to update branch'); }
  };

  const handleDeleteBranch = async (id) => {
    if (confirmDeleteId !== `branch-${id}`) { setConfirmDeleteId(`branch-${id}`); return; }
    try {
      const res  = await fetch(`http://localhost:5001/branches/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchBrands(); setConfirmDeleteId(null); }
      else alert(data.error || 'Failed to delete branch');
    } catch { alert('Failed to delete branch'); }
  };

  /* ── derived stats ── */
  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const totalActive   = brands.reduce((s, b) => s + (b.branches?.filter(br => br.status === 'Active').length || 0), 0);
  const totalReview   = brands.reduce((s, b) => s + (b.branches?.filter(br => br.status === 'Review').length || 0), 0);

  const allRegions = [...new Set(brands.flatMap(b => [b.region, ...(b.branches?.map(br => br.region) || [])]).filter(Boolean))];

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

  /* ── status badge helper ── */
  const StatusBadge = ({ status }) => {
    const styles = {
      Active:   { bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
      Review:   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
      Inactive: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
    };
    const s = styles[status] || styles['Active'];
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
        {/* ── Page header ── */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#00897b', marginBottom: 4 }}>
            Brand & Branch Settings
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0d2b1e', letterSpacing: '-0.7px', margin: 0 }}>
            Brand & Branch Management
          </h1>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Brands',    value: brands.length,  icon: <Globe size={20} color="#065f46" />,   bg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub: 'Registered brands'    },
            { label: 'Total Branches',  value: totalBranches,  icon: <Store size={20} color="#065f46" />,   bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub: 'Across all brands'    },
            { label: 'Active Branches', value: totalActive,    icon: <Check size={20} color="#065f46" />,   bg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub: 'Operational'          },
            { label: 'Needs Review',    value: totalReview,    icon: <AlertTriangle size={20} color="#92400e" />, bg: 'linear-gradient(135deg,#fef9c3,#fde68a)', sub: 'Pending attention' },
          ].map((s, i) => (
            <div key={i} className="bm-stat">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0d2b1e' }}>{s.value}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5a7a65' }}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#5a7a65" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text" placeholder="Search brands or branches..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bm-input"
              style={{ paddingLeft: 32, width: 260 }}
            />
          </div>

          {/* Region filter */}
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bm-select" style={{ width: 180 }}>
            <option value="all">All Regions</option>
            {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {/* Add Branch button */}
            <button
              onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                borderRadius: 11, border: '1.5px solid #00897b', background: '#fff',
                color: '#00897b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Plus size={14} /> Add Branch
            </button>

            {/* Add Brand button */}
            <button
              onClick={() => { setBrandForm(emptyBrand); setShowAddBrandModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px',
                borderRadius: 11, border: 'none',
                background: 'linear-gradient(135deg,#2E7D32,#00897b)',
                color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 10px rgba(0,180,90,0.35)',
              }}
            >
              <Plus size={15} /> Add Brand
            </button>
          </div>
        </div>

        {/* ── Brand + Branch sections ── */}
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 14, fontWeight: 600 }}>
            Loading brands & branches...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 14, fontWeight: 600 }}>
            No brands found. Add your first brand above.
          </div>
        ) : filteredBrands.map(brand => (
          <div key={brand.id} className="bm-brand-card">

            {/* Brand header */}
            <div className="bm-brand-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {brand.region}</span>
                    {brand.contact_email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>
                  {brand.branches?.length || 0} {brand.branches?.length === 1 ? 'branch' : 'branches'}
                </span>
                {/* Edit brand */}
                <button
                  onClick={() => {
                    setSelectedBrand(brand);
                    setBrandForm({ name: brand.name, region: brand.region, contact_email: brand.contact_email, contact_phone: brand.contact_phone, description: brand.description });
                    setShowEditBrandModal(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Edit2 size={12} /> Edit Brand
                </button>
                {/* Delete brand */}
                <button
                  onClick={() => handleDeleteBrand(brand.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1.5px solid rgba(255,150,150,0.5)', background: 'rgba(255,80,80,0.15)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {confirmDeleteId === `brand-${brand.id}` ? <><Check size={12} /> Confirm</> : <><Trash2 size={12} /> Delete</>}
                </button>
              </div>
            </div>

            {/* Branches table */}
            <div>
              {/* Column headers */}
              <div className="bm-branch-row" style={{ background: '#f8fffe', borderBottom: '2px solid #d1eedd' }}>
                {['Branch Name', 'Region', 'Manager', 'Contact', 'Address', 'Status', 'Actions'].map(h => (
                  <div key={h} className="bm-col-head">{h}</div>
                ))}
              </div>

              {brand.branches?.length === 0 ? (
                <div style={{ padding: '24px 20px', color: '#5a7a65', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
                  No branches yet.{' '}
                  <span
                    style={{ color: '#00897b', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
                    onClick={() => { setBranchForm({ ...emptyBranch, brand_id: brand.id }); setShowAddBranchModal(true); }}
                  >
                    Add the first branch
                  </span>
                </div>
              ) : brand.branches.map(branch => (
                <div key={branch.id} className="bm-branch-row">
                  <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: 13 }}>{branch.name}</div>
                  <div style={{ fontSize: 12, color: '#5a7a65' }}>{branch.region}</div>
                  <div style={{ fontSize: 12, color: '#0d2b1e', fontWeight: 600 }}>{branch.manager || '—'}</div>
                  <div style={{ fontSize: 12, color: '#5a7a65' }}>{branch.contact || '—'}</div>
                  <div style={{ fontSize: 12, color: '#5a7a65' }}>{branch.address || '—'}</div>
                  <div><StatusBadge status={branch.status || 'Active'} /></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Edit branch */}
                    <button
                      className="bm-action-btn"
                      style={{ borderColor: '#b2dfdb', background: '#e0f2f1', color: '#00695c' }}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager, contact: branch.contact, address: branch.address, status: branch.status });
                        setShowEditBranchModal(true);
                      }}
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    {/* Delete branch */}
                    <button
                      className="bm-action-btn"
                      style={{ borderColor: confirmDeleteId === `branch-${branch.id}` ? '#f87171' : '#fecaca', background: confirmDeleteId === `branch-${branch.id}` ? '#fee2e2' : '#fff', color: confirmDeleteId === `branch-${branch.id}` ? '#dc2626' : '#ef4444' }}
                      onClick={() => handleDeleteBranch(branch.id)}
                    >
                      {confirmDeleteId === `branch-${branch.id}` ? <><Check size={11} /> Confirm</> : <><Trash2 size={11} /> Delete</>}
                    </button>
                    {confirmDeleteId === `branch-${branch.id}` && (
                      <button className="bm-action-btn" style={{ borderColor: '#d1d5db', background: '#f9fafb', color: '#6b7280' }} onClick={() => setConfirmDeleteId(null)}>
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

      {/* ── ADD BRAND MODAL ── */}
      {showAddBrandModal && (
        <BmModal title="Add New Brand" onClose={() => setShowAddBrandModal(false)} onSubmit={handleAddBrand}>
          <BrandFormFields form={brandForm} setForm={setBrandForm} />
        </BmModal>
      )}

      {/* ── EDIT BRAND MODAL ── */}
      {showEditBrandModal && (
        <BmModal title="Edit Brand" onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}>
          <BrandFormFields form={brandForm} setForm={setBrandForm} />
        </BmModal>
      )}

      {/* ── ADD BRANCH MODAL ── */}
      {showAddBranchModal && (
        <BmModal title="Add New Branch" onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}>
          <BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} />
        </BmModal>
      )}

      {/* ── EDIT BRANCH MODAL ── */}
      {showEditBranchModal && (
        <BmModal title="Edit Branch" onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}>
          <BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} />
        </BmModal>
      )}
    </div>
  );
}

/* ── Reusable modal shell for BrandManagement ── */
function BmModal({ title, onClose, onSubmit, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)' }}>
              <Check size={14} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Brand form fields ── */
function BrandFormFields({ form, setForm }) {
  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) });
  const inputSt = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #b2dfdb', fontSize: 13, color: '#0d2b1e', background: '#f0fdf5', fontFamily: 'inherit', outline: 'none', marginTop: 4, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 800, color: '#5a7a65', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label style={lbl}>Brand Name *</label><input style={inputSt} {...f('name')} required /></div>
      <div><label style={lbl}>Region *</label>
        <select style={{ ...inputSt, appearance: 'none', cursor: 'pointer' }} {...f('region')} required>
          <option value="">Select region</option>
          {['NCR', 'Region 3', 'Region 4A', 'Region 4B', 'Region 5', 'Region 7', 'Region 11'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={lbl}>Contact Email</label><input type="email" style={inputSt} {...f('contact_email')} /></div>
        <div><label style={lbl}>Contact Phone</label><input type="tel" style={inputSt} {...f('contact_phone')} /></div>
      </div>
      <div><label style={lbl}>Description</label><textarea style={{ ...inputSt, resize: 'vertical', minHeight: 72 }} {...f('description')} /></div>
    </div>
  );
}

/* ── Branch form fields ── */
function BranchFormFields({ form, setForm, brands }) {
  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) });
  const inputSt = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #b2dfdb', fontSize: 13, color: '#0d2b1e', background: '#f0fdf5', fontFamily: 'inherit', outline: 'none', marginTop: 4, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 800, color: '#5a7a65', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label style={lbl}>Parent Brand *</label>
        <select style={{ ...inputSt, appearance: 'none', cursor: 'pointer' }} {...f('brand_id')} required>
          <option value="">Select brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div><label style={lbl}>Branch Name *</label><input style={inputSt} {...f('name')} required /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={lbl}>Region *</label>
          <select style={{ ...inputSt, appearance: 'none', cursor: 'pointer' }} {...f('region')} required>
            <option value="">Select region</option>
            {['NCR', 'Region 3', 'Region 4A', 'Region 4B', 'Region 5', 'Region 7', 'Region 11'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Status</label>
          <select style={{ ...inputSt, appearance: 'none', cursor: 'pointer' }} {...f('status')}>
            <option>Active</option><option>Review</option><option>Inactive</option>
          </select>
        </div>
      </div>
      <div><label style={lbl}>Branch Manager</label><input style={inputSt} {...f('manager')} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={lbl}>Contact Number</label><input type="tel" style={inputSt} {...f('contact')} /></div>
        <div><label style={lbl}>Address</label><input style={inputSt} {...f('address')} /></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL EXISTING COMPONENTS BELOW (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => { if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k"; return "₱" + n; };

function smoothPath(pts) {
  if (!pts.length) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i].x + pts[i + 1].x) / 2;
    d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function genData(period) {
  const configs = {
    Day:   { labels: ["6AM","8AM","10AM","12PM","2PM","4PM","6PM","8PM","10PM"], base: 8000,    noise: 5000 },
    Week:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],               base: 45000,   noise: 30000 },
    Month: { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], base: 280000, noise: 180000 },
    Year:  { labels: ["2020","2021","2022","2023","2024","2025"],               base: 2500000, noise: 1800000 },
  };
  const { labels, base, noise } = configs[period];
  const seed = period.charCodeAt(0) * 7;
  const values = labels.map((_, i) => Math.round(base + noise * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.4 + seed)) + 0.25 * Math.random())));
  return { labels, values };
}

function DashboardContent({ posData }) {
  const TABS = ["Day", "Week", "Month", "Year"];
  const [activeTab, setActiveTab] = useState("Month");
  const [chartData, setChartData] = useState(() => genData("Month"));
  const [tooltip, setTooltip] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const svgRef = useRef(null);

  useEffect(() => {
    if (posData && posData[activeTab]) setChartData(posData[activeTab]);
    else setChartData(genData(activeTab));
    setAnimKey(k => k + 1);
    setTooltip(null);
  }, [activeTab, posData]);

  const values = chartData.values;
  const total = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / values.length);
  const peak = Math.max(...values);
  const peakLabel = chartData.labels[values.indexOf(peak)];
  const low = Math.min(...values);
  const pctChange = values.length > 1 ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : "0.0";
  const trending = Number(pctChange) >= 0;

  const SVG_W = 820, SVG_H = 260, PAD_L = 58, PAD_R = 16, PAD_T = 18, PAD_B = 36;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const maxV = peak * 1.18;

  const pts = values.map((v, i) => ({ x: PAD_L + (i / Math.max(values.length - 1, 1)) * plotW, y: PAD_T + plotH - (v / maxV) * plotH, v, label: chartData.labels[i] }));
  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${PAD_T + plotH} L ${pts[0].x} ${PAD_T + plotH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PAD_T + plotH - t * plotH, label: fmtShort(t * maxV) }));

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * SVG_W;
    let best = pts[0], bestDist = Infinity;
    for (const p of pts) { const d = Math.abs(p.x - mx); if (d < bestDist) { bestDist = d; best = p; } }
    setTooltip({ x: best.x, y: best.y, label: best.label, value: best.v });
  }, [pts]);

  const insightLabel = { Day: "today", Week: "this week", Month: "this month", Year: "this year" }[activeTab];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "transparent" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .sta-root { background:linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%); min-height:50vh; padding:5px; font-family:'Montserrat',sans-serif; }
        .sta-eyebrow { margin-top:0%; font-size:11px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#00897b; margin-bottom:3px; }
        .sta-heading { font-size:28px; font-weight:600; color:#0d2b1e; letter-spacing:-0.7px; margin-bottom:22px; }
        .sta-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
        .sta-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:18px 20px; box-shadow:0 2px 14px rgba(0,140,60,0.07); animation:fadeUp 0.45s ease both; transition:transform 0.2s,box-shadow 0.2s; }
        .sta-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); }
        .sta-stat:nth-child(1){animation-delay:.05s}.sta-stat:nth-child(2){animation-delay:.10s}.sta-stat:nth-child(3){animation-delay:.15s}.sta-stat:nth-child(4){animation-delay:.20s}
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
        .stat-lbl { font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:.06em; color:#5a7a65; margin-bottom:5px; }
        .stat-val { font-size:19px; font-weight:400; color:#0d2b1e; letter-spacing:-0.4px; }
        .stat-badge { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:300; border-radius:20px; }
        .b-green{color:#43aa51} .b-teal{color:#43aa51} .b-yellow{color:#ff2a13} .b-blue{color:#ff2a13}
        .sta-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:22px; padding:22px 24px 16px; box-shadow:0 2px 20px rgba(0,140,60,0.07); margin-bottom:18px; animation:fadeUp 0.45s 0.22s ease both; }
        .card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .card-title { font-size:15px; font-weight:600; color:#0d2b1e; display:flex; align-items:center; gap:8px; }
        .sta-tabs { display:flex; gap:3px; background:#f0faf4; border-radius:12px; padding:4px; }
        .sta-tab { padding:6px 14px; border-radius:9px; border:none; background:transparent; font-size:12px; font-weight:300; color:#5a7a65; cursor:pointer; transition:all .15s; font-family:inherit; }
        .sta-tab.active { background:linear-gradient(135deg,#00c853,#00897b); color:#fff; box-shadow:0 2px 8px rgba(0,180,90,.35); }
        .sta-tab:hover:not(.active) { color:#0d2b1e; background:#ddf5e6; }
        .chart-wrap { position:relative; cursor:crosshair; user-select:none; }
        .chart-svg { width:100%; display:block; overflow:visible; font-weight:400; }
        .sta-tooltip { position:absolute; background:linear-gradient(135deg,#0d2b1e,#1a4a2e); color:#fff; border-radius:12px; padding:9px 14px; pointer-events:none; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.22); transform:translate(-50%,-100%) translateY(-12px); z-index:10; }
        .sta-tooltip::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#1a4a2e; border-bottom:none; }
        .tt-lbl { font-size:10.5px; opacity:.6; margin-bottom:2px; } .tt-val { font-size:15px; font-weight:800; color:#a7f3d0; }
        .ins-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; animation:fadeUp 0.45s 0.3s ease both; }
        .ins-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:18px 20px; box-shadow:0 2px 12px rgba(0,140,60,0.06); transition:transform .2s; }
        .ins-card:hover { transform:translateY(-2px); }
        .ins-head { display:flex; align-items:center; gap:9px; margin-bottom:9px; }
        .ins-icon { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:17px; background:linear-gradient(135deg,#d1fae5,#a7f3d0); }
        .ins-title { font-size:13px; font-weight:400; color:#0d2b1e; }
        .ins-body { font-size:12.5px; color:#5a7a65; line-height:1.65; }
        .ins-metric { margin-top:10px; font-size:19px; font-weight:400; color:#00897b; }
        @media(max-width:900px){ .sta-stats{grid-template-columns:repeat(2,1fr);} .ins-grid{grid-template-columns:1fr;} }
      `}</style>
      <div className="sta-root" key={animKey}>
        <div className="sta-eyebrow">DASHBOARD</div>
        <div className="sta-heading">Sales Trend Analysis</div>
        <div className="sta-stats">
          {[
            { lbl:"Total Sales",  val:fmt(total), badge:"b-green", badgeTxt:`${trending?"↑":"↓"} ${Math.abs(pctChange)}% vs start` },
            { lbl:"Average",      val:fmt(avg),   badge:"b-teal",  badgeTxt:`per ${activeTab.toLowerCase()}` },
            { lbl:"Peak Sales",   val:fmt(peak),  badge:"b-green", badgeTxt:`on ${peakLabel}` },
            { lbl:"Lowest Sales", val:fmt(low),   badge:"b-yellow",badgeTxt:"needs attention" },
          ].map((s,i) => (
            <div className="sta-stat" key={i}>
              <div className="stat-top">
                <div><div className="stat-lbl">{s.lbl}</div><div className="stat-val">{s.val}</div></div>
              </div>
              <span className={`stat-badge ${s.badge}`}>{s.badgeTxt}</span>
            </div>
          ))}
        </div>
        <div className="sta-card">
          <div className="card-header">
            <div className="card-title">Revenue Overview</div>
            <div className="sta-tabs">
              {TABS.map(t => <button key={t} className={`sta-tab${activeTab===t?" active":""}`} onClick={() => setActiveTab(t)}>{t}</button>)}
            </div>
          </div>
          <div className="chart-wrap" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
            <svg ref={svgRef} className="chart-svg" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#e9cd30"/><stop offset="100%" stopColor="#ffa875"/></linearGradient>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00c853" stopOpacity="0.20"/><stop offset="100%" stopColor="#00c853" stopOpacity="0.01"/></linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {yTicks.map((t,i) => (
                <g key={i}>
                  <line x1={PAD_L} y1={t.y} x2={SVG_W-PAD_R} y2={t.y} stroke="#e2ede6" strokeWidth="1" strokeDasharray="5 4"/>
                  <text x={PAD_L-8} y={t.y+4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily="Plus Jakarta Sans,sans-serif">{t.label}</text>
                </g>
              ))}
              <path d={areaPath} fill="url(#gArea)"/>
              <path d={linePath} fill="none" stroke="url(#gLine)" strokeWidth="3" strokeLinecap="round" filter="url(#glow)"/>
              {pts.map((p,i) => <text key={i} x={p.x} y={SVG_H-6} textAnchor="middle" fontSize="10.5" fill="#6b9070" fontFamily="Plus Jakarta Sans,sans-serif">{p.label}</text>)}
              {tooltip && <>
                <line x1={tooltip.x} y1={tooltip.y+7} x2={tooltip.x} y2={PAD_T+plotH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55"/>
                <circle cx={tooltip.x} cy={tooltip.y} r="6" fill="#00c853" stroke="#fff" strokeWidth="2.5" filter="url(#glow)"/>
              </>}
            </svg>
            {tooltip && (
              <div className="sta-tooltip" style={{ left:`${(tooltip.x/SVG_W)*100}%`, top:`${(tooltip.y/SVG_H)*100}%` }}>
                <div className="tt-lbl">{tooltip.label}</div>
                <div className="tt-val">{fmt(tooltip.value)}</div>
              </div>
            )}
          </div>
        </div>
        <div className="ins-grid">
          <div className="ins-card">
            <div className="ins-head"><div className="ins-title">Peak Performance</div></div>
            <p className="ins-body">Highest revenue on <strong>{peakLabel}</strong> {insightLabel}. Outperformed the average by <strong>{fmt(peak - avg)}</strong>.</p>
            <div className="ins-metric">{fmt(peak)}</div>
          </div>
          <div className="ins-card">
            <div className="ins-head"><div className="ins-title">Trend Direction</div></div>
            <p className="ins-body">Sales are <strong>{trending ? "trending upward ↑" : "trending downward ↓"}</strong> {insightLabel} with a <strong>{Math.abs(pctChange)}% change</strong> from first to last data point.</p>
            <div className="ins-metric" style={{ color: trending ? "#00897b" : "#d97706" }}>{trending ? "+" : "-"}{Math.abs(pctChange)}%</div>
          </div>
          <div className="ins-card">
            <div className="ins-head"><div className="ins-title">Revenue Summary</div></div>
            <p className="ins-body">Average revenue per {activeTab.toLowerCase()} is <strong>{fmt(avg)}</strong>. Total accumulated {insightLabel}: <strong>{fmt(total)}</strong>.</p>
            <div className="ins-metric">{fmt(avg)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width:"100%", padding:"0.75rem", borderRadius:"8px", border:"1px solid var(--gray-300)", marginTop:"0.3rem", fontSize:"0.9rem" };
const labelStyle = { fontSize:"0.8rem", color:"var(--gray-500)", marginTop:"0.5rem" };
const valueStyle = { fontWeight:"600", marginBottom:"0.3rem" };

function MobileShopContent() {
  const [items, setItems] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ name:"", price:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });

  React.useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await fetch("http://localhost:5001/shop-items");
    const data = await res.json();
    setItems(data);
  };

  const validate = () => {
    let newErrors = {};
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
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    await fetch("http://localhost:5001/shop-items", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name:newItem.name, price:Number(newItem.price), image_url:newItem.image_url, shop:newItem.shop, brand:newItem.brand, stock:Number(newItem.stock) }),
    });
    setNewItem({ name:"", price:"", image_url:"", shop:"Coffee Spot", brand:"", stock:"" });
    setErrors({});
    setLoading(false);
    fetchItems();
  };

  const deleteItem    = async (id) => { await fetch(`http://localhost:5001/shop-items/${id}`, { method:"DELETE" }); fetchItems(); };
  const toggleVisibility = async (id) => { await fetch(`http://localhost:5001/shop-items/${id}/toggle`, { method:"PUT" }); fetchItems(); };

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ background:"#fff", padding:"2rem", borderRadius:"12px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color:"var(--green-primary)", marginBottom:"1.5rem" }}>Mobile Shop</h2>
        <div style={{ marginBottom:"2rem" }}>
          <h3 style={{ color:"var(--green-primary)", fontSize:"1.1rem", marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid var(--gray-200)" }}>Add New Item</h3>
          <div style={{ display:"grid", gap:"1rem" }}>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Shop</label>
              <select value={newItem.shop} onChange={e => setNewItem({...newItem, shop:e.target.value})} style={inputStyle}>
                <option value="Coffee Spot">Coffee Spot</option>
                <option value="iPharma">iPharma</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Item Name</label>
              <input value={newItem.name} onChange={e => setNewItem({...newItem, name:e.target.value})} style={{ ...inputStyle, border:errors.name?"1px solid red":inputStyle.border }} />
              {errors.name && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.name}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Brand (Optional)</label>
              <input value={newItem.brand} onChange={e => setNewItem({...newItem, brand:e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Price</label>
              <input value={newItem.price} onChange={e => setNewItem({...newItem, price:e.target.value})} style={{ ...inputStyle, border:errors.price?"1px solid red":inputStyle.border }} />
              {errors.price && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.price}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Stock</label>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock:e.target.value})} style={{ ...inputStyle, border:errors.stock?"1px solid red":inputStyle.border }} />
              {errors.stock && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.stock}</p>}
            </div>
            <div>
              <label style={{ fontSize:"0.85rem", color:"var(--gray-500)" }}>Image URL</label>
              <input value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url:e.target.value})} style={{ ...inputStyle, border:errors.image_url?"1px solid red":inputStyle.border }} />
              {errors.image_url && <p style={{ color:"red", fontSize:"0.75rem" }}>{errors.image_url}</p>}
              {newItem.image_url && !errors.image_url && (
                <img src={newItem.image_url} alt="preview" style={{ marginTop:"10px", width:"120px", height:"120px", objectFit:"cover", borderRadius:"8px", border:"1px solid #ddd" }} onError={e => (e.target.style.display="none")} />
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
                <img src={item.image_url} alt="" style={{ width:"100px", height:"100px", borderRadius:"8px", objectFit:"cover" }} />
                <div style={{ flex:1 }}>
                  <p style={labelStyle}>Shop</p><p style={valueStyle}>{item.shop}</p>
                  <p style={labelStyle}>Item Name</p><p style={valueStyle}>{item.name}</p>
                  {item.brand && <><p style={labelStyle}>Brand</p><p style={valueStyle}>{item.brand}</p></>}
                  <p style={labelStyle}>Price</p><p style={valueStyle}>₱{item.price}</p>
                  <p style={labelStyle}>Stock: </p><p style={valueStyle}>{item.stock}</p>
                  <p style={labelStyle}>Status</p><p style={valueStyle}>{item.is_visible?"Visible":"Hidden"}</p>
                </div>
              </div>
              <div style={{ marginTop:"1rem", display:"flex", gap:"0.5rem" }}>
                <button className="btn btn-secondary" onClick={() => toggleVisibility(item.id)}>{item.is_visible?"Hide":"Show"}</button>
                <button className="btn btn-danger" onClick={() => deleteItem(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationsContent({ applications, onView, onDelete, onApprove, onCreateAccount }) {
  return (
    <div className="section" style={{ width:'fit-content', maxWidth:'100%' }}>
      <div className="section-header">
        <h2 className="section-title">Franchise Applications</h2>
        <button className="btn btn-secondary">Export to CSV</button>
      </div>
      <div className="table-container">
        <table style={{ minWidth:'900px' }}/>
        <table>
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
                      <button className="btn btn-success btn-sm" style={{ width:'60%' }} onClick={() => onCreateAccount(app)}>+Account</button>
                    </div>
                    <div style={{ display:'flex', gap:'0.3rem', width:'100%' }}>
                      <button className="btn btn-primary btn-sm" style={{ width:'50%' }} onClick={() => onApprove(app.id)}>Approve</button>
                      <button className="btn btn-danger btn-sm" style={{ width:'50%' }} onClick={() => onDelete(app.id)}>Delete</button>
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

function BranchSelect({ value, onChange, name, required, disabled, placeholder }) {
  const [branches, setBranches] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newBranch, setNewBranch] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchBranches(); }, []);

  const fetchBranches = async () => {
    try {
      const res = await fetch("http://localhost:5001/branches");
      const data = await res.json();
      setBranches(data);
    } catch (err) { console.error("Failed to fetch branches", err); }
  };

  const handleAddBranch = async () => {
    if (!newBranch.trim()) return;
    setAdding(true); setError("");
    try {
      const res = await fetch("http://localhost:5001/branches", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:newBranch.trim() }) });
      const data = await res.json();
      if (data.success) { await fetchBranches(); onChange({ target:{ name, value:newBranch.trim() } }); setNewBranch(""); setShowAddInput(false); }
      else setError(data.error || "Failed to add branch");
    } catch { setError("Failed to add branch"); }
    finally { setAdding(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <select name={name} className="form-select" value={value} onChange={onChange} required={required} disabled={disabled} style={disabled?{background:"var(--gray-200)",cursor:"not-allowed",flex:1}:{flex:1}}>
          {placeholder && <option value="">{placeholder}</option>}
          {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
        {!disabled && (
          <button type="button" onClick={() => { setShowAddInput(!showAddInput); setError(""); setNewBranch(""); }}
            style={{ width:36, height:36, borderRadius:8, border:"2px solid var(--green-primary)", background:showAddInput?"var(--green-primary)":"#fff", color:showAddInput?"#fff":"var(--green-primary)", fontSize:20, fontWeight:"bold", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
            {showAddInput ? "✕" : "+"}
          </button>
        )}
      </div>
      {showAddInput && !disabled && (
        <div style={{ marginTop:8, padding:"12px 14px", backgroundColor:"#f9fbe7", borderRadius:8, border:"1px dashed #a5d6a7" }}>
          <p style={{ margin:"0 0 8px", fontSize:12, color:"var(--green-primary)", fontWeight:600 }}>New Branch Name</p>
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" className="form-input" placeholder="e.g. Branch E" value={newBranch} onChange={e => { setNewBranch(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter" && handleAddBranch()} style={{ flex:1, padding:"8px 10px", fontSize:13 }} autoFocus />
            <button type="button" className="btn btn-primary" onClick={handleAddBranch} disabled={adding || !newBranch.trim()} style={{ padding:"8px 16px", fontSize:13, opacity:!newBranch.trim()?0.5:1 }}>{adding?"Adding...":"Add"}</button>
          </div>
          {error && <p style={{ margin:"6px 0 0", fontSize:12, color:"var(--red)" }}>⚠ {error}</p>}
        </div>
      )}
    </div>
  );
}

const fmtPeso = (n) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });
const CATEGORIES = ["Medicine", "Supplement", "Antibiotic", "Personal Care"];

function BrandBranchSelect({ value, onChange, brands = [], disabled = false, placeholder = "All Branches" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  let label = placeholder;
  if (value && value !== "all") {
    for (const brand of brands) { const found = brand.branches?.find(b => b.name === value); if (found) { label = `${brand.name} — ${found.name}`; break; } }
  }
  const select = (val) => { onChange(val); setOpen(false); };
  return (
    <div ref={ref} style={{ position:"relative", minWidth:240 }}>
      <button type="button" disabled={disabled} onClick={() => !disabled && setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:10, border:"1px solid #b2dfdb", background:disabled?"#f5f5f5":"#f0fdf5", color:disabled?"#aaa":"#0d2b1e", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:disabled?"not-allowed":"pointer", outline:"none", gap:8 }}>
        <span style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Store size={14} color="#00897b" />
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{label}</span>
        </span>
        <ChevronDown size={14} color="#5a7a65" style={{ flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:200, background:"#fff", border:"1px solid #b2dfdb", borderRadius:12, boxShadow:"0 8px 28px rgba(0,140,60,0.14)", maxHeight:280, overflowY:"auto" }}>
          <div onClick={() => select("all")} style={{ padding:"9px 14px", cursor:"pointer", fontSize:13, fontWeight:700, color:value==="all"||!value?"#00897b":"#0d2b1e", background:value==="all"||!value?"#f0fdf5":"transparent", borderBottom:"1px solid #e8f5e0", display:"flex", alignItems:"center", gap:8 }}
            onMouseEnter={e => e.currentTarget.style.background="#f0fdf5"} onMouseLeave={e => e.currentTarget.style.background=value==="all"||!value?"#f0fdf5":"transparent"}>
            <Layers size={13} color="#00897b" /> All Branches
          </div>
          {brands.length === 0 && <div style={{ padding:"12px 14px", fontSize:12, color:"#94a3b8" }}>No brands added yet.</div>}
          {brands.map(brand => (
            <div key={brand.id}>
              <div style={{ padding:"7px 14px", fontSize:10.5, fontWeight:800, color:"#00897b", textTransform:"uppercase", letterSpacing:"0.08em", background:"#f8fffe", borderTop:"1px solid #e8f5e0", display:"flex", alignItems:"center", gap:6 }}>
                <Building2 size={11} color="#00897b" /> {brand.name}
              </div>
              {brand.branches?.length === 0 && <div style={{ padding:"7px 22px", fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No branches</div>}
              {brand.branches?.map(branch => (
                <div key={branch.id||branch.name} onClick={() => select(branch.name)}
                  style={{ padding:"8px 22px", cursor:"pointer", fontSize:13, fontWeight:600, color:value===branch.name?"#00897b":"#1a3a2a", background:value===branch.name?"#e8fdf0":"transparent", display:"flex", alignItems:"center", gap:7, borderLeft:value===branch.name?"3px solid #00c853":"3px solid transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background="#f0fdf5"} onMouseLeave={e => e.currentTarget.style.background=value===branch.name?"#e8fdf0":"transparent"}>
                  <Store size={12} color={value===branch.name?"#00897b":"#5a7a65"} /> {branch.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BranchTable({ items, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId }) {
  if (!items.length) return <div style={{ padding:"40px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontWeight:600 }}>No items found.</div>;
  const cols = ["Item Name","Category","Branch","Stock","Min Stock","Price","Status","Actions"];
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
      <thead>
        <tr style={{ background:"#f0faf4" }}>
          {cols.map(h => <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontWeight:800, fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.07em", color:"#00897b", borderBottom:"1.5px solid #d1eedd", whiteSpace:"nowrap" }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => {
          const isLow = item.stock < item.min_stock;
          return (
            <tr key={item.id} style={{ background:idx%2===0?"#fff":"#fafffe" }} onMouseEnter={e => e.currentTarget.style.background="#f4fef8"} onMouseLeave={e => e.currentTarget.style.background=idx%2===0?"#fff":"#fafffe"}>
              <td style={{ padding:"12px 16px", color:"#0d2b1e", fontWeight:700, whiteSpace:"nowrap" }}>{item.name}</td>
              <td style={{ padding:"12px 16px" }}><span style={{ background:"#e0f2f1", color:"#00695c", fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20, whiteSpace:"nowrap" }}>{item.category}</span></td>
              <td style={{ padding:"12px 16px", color:"#5a7a65", fontWeight:600 }}>{item.branch}</td>
              <td style={{ padding:"12px 16px", fontWeight:800, color:isLow?"#d97706":"#0d2b1e" }}>{item.stock}</td>
              <td style={{ padding:"12px 16px", color:"#5a7a65" }}>{item.min_stock}</td>
              <td style={{ padding:"12px 16px", color:"#0d2b1e", fontWeight:700 }}>{fmtPeso(item.price)}</td>
              <td style={{ padding:"12px 16px" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:20, background:isLow?"#fef3c7":"#d1fae5", color:isLow?"#92400e":"#065f46" }}>
                  {isLow ? <><TrendingDown size={11}/> Low Stock</> : <><TrendingUp size={11}/> In Stock</>}
                </span>
              </td>
              <td style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <button onClick={() => onEdit(item)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1px solid #b2dfdb", background:"#e0f2f1", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }} onMouseEnter={e => e.currentTarget.style.background="#b2dfdb"} onMouseLeave={e => e.currentTarget.style.background="#e0f2f1"}>
                    <Pencil size={11}/> Edit
                  </button>
                  <button onClick={() => onDelete(item.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontFamily:"inherit", border:`1px solid ${confirmDeleteId===item.id?"#f87171":"#fecaca"}`, background:confirmDeleteId===item.id?"#fee2e2":"#fff", color:confirmDeleteId===item.id?"#dc2626":"#ef4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    {confirmDeleteId===item.id ? <><Check size={11}/> Confirm</> : <><Trash2 size={11}/> Delete</>}
                  </button>
                  {confirmDeleteId===item.id && <button onClick={() => setConfirmDeleteId(null)} style={{ display:"flex", alignItems:"center", padding:"5px 10px", borderRadius:8, border:"1px solid #d1d5db", background:"#f9fafb", color:"#6b7280", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}><X size={11}/></button>}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:800, color:"#5a7a65", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
      <input {...props} style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #b2dfdb", fontSize:13.5, color:"#0d2b1e", background:"#f0fdf5", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} onFocus={e => e.target.style.border="1.5px solid #00897b"} onBlur={e => e.target.style.border="1px solid #b2dfdb"} />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:800, color:"#5a7a65", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
      <select {...props} style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1px solid #b2dfdb", fontSize:13.5, color:"#0d2b1e", background:"#f0fdf5", outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", boxSizing:"border-box" }}>{children}</select>
    </div>
  );
}

function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:500, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", maxHeight:"92vh", overflowY:"auto", animation:"modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#0d2b1e", margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid #b2dfdb", background:"#e0f2f1", cursor:"pointer", color:"#00695c", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={15}/></button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 22px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#00c853,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(0,180,90,0.35)" }}><Check size={14}/> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconBg, badge, badgeBg, badgeColor }) {
  return (
    <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.12)", borderRadius:18, padding:"20px 22px", boxShadow:"0 2px 14px rgba(0,140,60,0.07)", transition:"transform 0.2s,box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,140,60,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 14px rgba(0,140,60,0.07)"; }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:"#5a7a65", marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#0d2b1e", letterSpacing:"-0.5px" }}>{value}</div>
        </div>
        <div style={{ width:44, height:44, borderRadius:13, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={20} color="#065f46"/></div>
      </div>
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20, background:badgeBg, color:badgeColor }}>{badge}</span>
    </div>
  );
}

function InventoryContent({ user, brands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";
  const [inventory, setInventory]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedBranch, setSelectedBranch]   = useState("all");
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [editingItem, setEditingItem]         = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery]         = useState("");
  const [formData, setFormData] = useState({ name:"", category:"", branch:isAdmin?"":userBranch, stock:0, minStock:0, price:0 });

  useEffect(() => { fetchInventory(isAdmin ? selectedBranch : userBranch); }, [selectedBranch, isAdmin, userBranch]);

  const fetchInventory = async (branch) => {
  setLoading(true);
  try {
    const query = branch && branch !== "all" 
      ? `?branch=${encodeURIComponent(branch)}` 
      : ""; // no query param = return everything
    const res = await fetch(`http://localhost:5001/inventory${query}`);
    const data = await res.json();
    setInventory(Array.isArray(data) ? data : []);
  } catch (err) { 
    console.error("Error fetching inventory:", err); 
  } finally { 
    setLoading(false); 
  }
};


  const handleAddItem = async (e) => {
    e.preventDefault();
    const payload = { ...formData, branch:isAdmin?formData.branch:userBranch };
    try {
      const res = await fetch("http://localhost:5001/inventory", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { await fetchInventory(isAdmin?selectedBranch:userBranch); setShowAddModal(false); resetForm(); }
      else alert(data.error || "Failed to add item");
    } catch { alert("Failed to add item"); }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    const payload = { ...formData, branch:isAdmin?formData.branch:userBranch };
    try {
      const res = await fetch(`http://localhost:5001/inventory/${editingItem.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { await fetchInventory(isAdmin?selectedBranch:userBranch); setShowEditModal(false); setEditingItem(null); resetForm(); }
      else alert(data.error || "Failed to update item");
    } catch { alert("Failed to update item"); }
  };

  const handleDeleteItem = async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    try {
      const res = await fetch(`http://localhost:5001/inventory/${id}`, { method:"DELETE" });
      const data = await res.json();
      if (data.success) { await fetchInventory(isAdmin?selectedBranch:userBranch); setConfirmDeleteId(null); }
      else alert(data.error || "Failed to delete item");
    } catch { alert("Failed to delete item"); }
  };

  const openEditModal = (item) => { setEditingItem(item); setFormData({ name:item.name, category:item.category, branch:item.branch, stock:item.stock, minStock:item.min_stock, price:item.price }); setShowEditModal(true); };
  const resetForm = () => setFormData({ name:"", category:"", branch:isAdmin?"":userBranch, stock:0, minStock:0, price:0 });
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]:value })); };

  const lowStockCount = inventory.filter(i => i.stock < i.min_stock).length;
  const totalValue    = inventory.reduce((s, i) => s + i.price * i.stock, 0);

  const searchFiltered = inventory.filter(i =>
    !searchQuery ||
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Used when a specific branch is selected
  const filteredInv = searchFiltered.filter(i =>
    selectedBranch === "all" || i.branch === selectedBranch
  );

  const grouped = brands.reduce((acc, brand) => {
    (brand.branches || []).forEach(branch => {
      const key = `${brand.name} — ${branch.name}`;
      // fill with matching inventory items, or empty array if none
      acc[key] = searchFiltered.filter(i => i.branch === branch.name);
    });
    return acc;
  }, {});

  const FormFields = () => (
    <>
      <InputField label="Item Name" type="text" name="name" value={formData.name} onChange={handleInputChange} required />
      <SelectField label="Category" name="category" value={formData.category} onChange={handleInputChange} required>
        <option value="">Select category</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </SelectField>
      {isAdmin ? (
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:800, color:"#5a7a65", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>Branch</label>
          <BrandBranchSelect value={formData.branch} onChange={val => setFormData(p => ({ ...p, branch:val==="all"?"":val }))} brands={brands} placeholder="Select a branch" />
        </div>
      ) : (
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:800, color:"#5a7a65", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>Branch</label>
          <div style={{ padding:"9px 12px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f5f5f5", fontSize:13.5, color:"#5a7a65", fontWeight:600 }}>{userBranch || "—"}</div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <InputField label="Stock" type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
        <InputField label="Min Stock" type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} required />
        <InputField label="Price (₱)" type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
      </div>
    </>
  );

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif", background:"linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight:"100vh", padding:"24px 32px 40px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap'); *{font-family:'Montserrat',sans-serif!important;box-sizing:border-box;}`}</style>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.16em", textTransform:"uppercase", color:"#00897b", marginBottom:4 }}>Stock Management</div>
        <h1 style={{ fontSize:28, fontWeight:600, color:"#0d2b1e", letterSpacing:"-0.7px", margin:0 }}>Inventory Management</h1>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Items" value={inventory.length} icon={Package} iconBg="linear-gradient(135deg,#d1fae5,#6ee7b7)" badge={selectedBranch==="all"?"All branches":selectedBranch} badgeColor="#065f46" />
        <StatCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} iconBg="linear-gradient(135deg,#fef9c3,#fde68a)" badge="Needs reorder" badgeColor="#92400e" />
        <StatCard label="Total Est. Value" value={fmtPeso(totalValue)} icon={DollarSign} iconBg="linear-gradient(135deg,#d1fae5,#a7f3d0)" badge="Current stock" badgeColor="#065f46" />
        <StatCard label="Categories" value={CATEGORIES.length} icon={Grid3X3} iconBg="linear-gradient(135deg,#ccfbf1,#99f6e4)" badge="Product types" badgeColor="#1e40af" />
      </div>
      <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.12)", borderRadius:22, padding:"24px 28px", boxShadow:"0 2px 20px rgba(0,140,60,0.07)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
              <input type="text" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft:32, paddingRight:12, paddingTop:9, paddingBottom:9, borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", fontSize:13, color:"#0d2b1e", outline:"none", fontFamily:"inherit", width:220 }} />
            </div>
            {isAdmin && <BrandBranchSelect value={selectedBranch} onChange={setSelectedBranch} brands={brands} placeholder="All Branches" />}
            {!isAdmin && userBranch && <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 16px", background:"linear-gradient(135deg,#d1fae5,#a7f3d0)", color:"#065f46", borderRadius:20, fontSize:12, fontWeight:700 }}><Store size={12}/>{userBranch}</span>}
          </div>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#00c853,#00897b)", color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(0,180,90,0.35)", letterSpacing:"0.02em" }} onMouseEnter={e => e.currentTarget.style.opacity="0.88"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
            <Plus size={15}/> Add New Item
          </button>
        </div>
        {loading ? (
          <div style={{ padding:"48px 0", textAlign:"center", color:"#5a7a65", fontSize:14, fontWeight:600 }}>Loading inventory...</div>
        ) : selectedBranch === "all" ? (
  Object.entries(grouped)
    .sort(([a],[b]) => {
      if (a === "Head Office") return -1;
      if (b === "Head Office") return 1;
      return a.localeCompare(b);
    })
    .map(([branchKey, items]) => (
  <div key={branchKey} style={{ marginBottom:28 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", background:"linear-gradient(135deg,#00c853,#00897b)", borderRadius:"14px 14px 0 0", color:"#fff" }}>
      <span style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, fontSize:14 }}>
        <Store size={15}/> {branchKey}
      </span>
      <span style={{ fontSize:12, opacity:0.85, fontWeight:600 }}>
        {items.length} items · {items.filter(i => i.stock < i.min_stock).length} low stock
      </span>
    </div>
    <div style={{ border:"1px solid #d1eedd", borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
      {items.length === 0 ? (
        <div style={{ padding:"24px", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>
          No inventory items for this branch yet.
        </div>
      ) : (
        <BranchTable
          items={items}
          onEdit={openEditModal}
          onDelete={handleDeleteItem}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
        />
      )}
    </div>
  </div>
))
) : (
          <div style={{ border:"1px solid #d1eedd", borderRadius:14, overflow:"hidden" }}>
    <BranchTable items={filteredInv} onEdit={openEditModal} onDelete={handleDeleteItem} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} />
  </div>
        )}
      </div>
      {showAddModal && <Modal title="Add New Inventory Item" onClose={() => setShowAddModal(false)} onSubmit={handleAddItem}><FormFields/></Modal>}
      {showEditModal && <Modal title="Edit Inventory Item" onClose={() => { setShowEditModal(false); setEditingItem(null); }} onSubmit={handleEditItem}><FormFields/></Modal>}
    </div>
  );
}

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

function UsersContent() {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name:'', email:'', role:'', branch:'', password:'' });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const response = await fetch("http://localhost:5001/users"); const data = await response.json(); setUsers(data); }
    catch (error) { console.error("Error fetching users:", error); alert("Failed to load users"); }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password)) errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
    return { isValid: errors.length === 0, errors };
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const passwordCheck = validatePasswordStrength(formData.password);
    if (!passwordCheck.isValid) { alert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character"); return; }
    try {
      const response = await fetch("http://localhost:5001/users", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(formData) });
      const data = await response.json();
      if (data.success) { await fetchUsers(); setShowAddModal(false); resetForm(); alert('User added successfully!'); }
      else alert(data.error || 'Failed to add user');
    } catch (error) { console.error("Error adding user:", error); alert("Failed to add user"); }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/users/${editingUser.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(formData) });
      const data = await response.json();
      if (data.success) { await fetchUsers(); setShowEditModal(false); setEditingUser(null); resetForm(); alert('User updated successfully!'); }
      else alert(data.error || 'Failed to update user');
    } catch (error) { console.error("Error updating user:", error); alert("Failed to update user"); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5001/users/${id}`, { method:"DELETE" });
        const data = await response.json();
        if (data.success) { await fetchUsers(); alert('User deleted successfully!'); }
        else alert(data.error || 'Failed to delete user');
      } catch (error) { console.error("Error deleting user:", error); alert("Failed to delete user"); }
    }
  };

  const openEditModal = (user) => { setEditingUser(user); setFormData({ name:user.name, email:user.email, role:user.role, branch:user.branch, password:'' }); setShowEditModal(true); };
  const resetForm = () => { setFormData({ name:'', email:'', role:'', branch:'', password:'' }); setShowPasswordValidation(false); setPasswordErrors([]); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]:value })); };

  const PasswordValidation = ({ errors }) => (
    <div style={{ marginTop:'8px', fontSize:'12px', padding:'10px', backgroundColor:'#f8f9fa', borderRadius:'4px', border:'1px solid #dee2e6' }}>
      <div style={{ marginBottom:'6px', fontWeight:'600', color:'#495057' }}>Password must contain:</div>
      {[['minLength','At least 8 characters'],['uppercase','At least one uppercase letter (A-Z)'],['lowercase','At least one lowercase letter (a-z)'],['number','At least one number (0-9)'],['specialChar','At least one special character (!@#$%^&*...)']].map(([key,text]) => (
        <div key={key} style={{ color:errors.includes(key)?'#dc3545':'#28a745', marginBottom:'4px' }}>{errors.includes(key)?'✗':'✓'} {text}</div>
      ))}
    </div>
  );

  const pwChange = (e) => { handleInputChange(e); const v = e.target.value; if(v){setShowPasswordValidation(true);setPasswordErrors(validatePasswordStrength(v).errors);}else{setShowPasswordValidation(false);setPasswordErrors([]);} };

  const BranchOptions = () => <><option value="">Select Branch</option><option value="Head Office">Head Office</option><option value="Branch A">Branch A</option><option value="Branch B">Branch B</option><option value="Branch C">Branch C</option></>;
  const RoleOptions   = () => <><option value="">Select Role</option><option value="Administrator">Administrator</option><option value="Franchisor">Franchisor</option><option value="Franchisee">Franchisee</option><option value="Manager">Manager</option><option value="Staff">Staff</option></>;

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
                  <td><div className="action-buttons"><button className="btn btn-primary btn-sm" onClick={() => openEditModal(user)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>Delete</button></div></td>
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
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required /></div>
              <div className="form-group"><label className="form-label">Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required /></div>
              <div className="form-group"><label className="form-label">Role</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange} required><RoleOptions/></select></div>
              <div className="form-group"><label className="form-label">Branch</label><select name="branch" className="form-select" value={formData.branch} onChange={handleInputChange} required><BranchOptions/></select></div>
              <div className="form-group"><label className="form-label">Password</label><input type="password" name="password" className="form-input" value={formData.password} onChange={pwChange} required />{showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}</div>
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
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required /></div>
              <div className="form-group"><label className="form-label">Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required /></div>
              <div className="form-group"><label className="form-label">Role</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange} required><option value="Administrator">Administrator</option><option value="Franchisor">Franchisor</option><option value="Franchisee">Franchisee</option><option value="Manager">Manager</option><option value="Staff">Staff</option></select></div>
              <div className="form-group"><label className="form-label">Branch</label><select name="branch" className="form-select" value={formData.branch} onChange={handleInputChange} required><option value="Head Office">Head Office</option><option value="Branch A">Branch A</option><option value="Branch B">Branch B</option><option value="Branch C">Branch C</option></select></div>
              <div className="form-group"><label className="form-label">New Password (leave blank to keep current)</label><input type="password" name="password" className="form-input" placeholder="Enter new password or leave blank" value={formData.password} onChange={pwChange} required />{showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}</div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

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

function ProfileContent({ user }) {
  const [formData, setFormData] = useState({ name:user.name, email:user.email, personalEmail:'', role:user.role, currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]:value }));
    if (name === 'newPassword') { if(value){setShowPasswordValidation(true);setPasswordErrors(validatePasswordStrength(value).errors);}else{setShowPasswordValidation(false);setPasswordErrors([]);} }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('minLength');
    if (!/[A-Z]/.test(password)) errors.push('uppercase');
    if (!/[a-z]/.test(password)) errors.push('lowercase');
    if (!/\d/.test(password)) errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('specialChar');
    return { isValid:errors.length===0, errors };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const response = await fetch("http://localhost:5001/send-otp-password-change", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:emailToSend }) });
      const data = await response.json();
      if (data.success) { setOtpSent(true); alert(`OTP has been sent to ${emailToSend}`); }
      else alert(data.message || data.error || 'Failed to send OTP');
    } catch (error) { console.error("Error sending OTP:", error); alert("Failed to send OTP. Please try again."); }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError('');
      const emailToVerify = formData.personalEmail || formData.email;
      const response = await fetch(`http://localhost:5001/users/${user.id}/password`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ currentPassword:formData.currentPassword, newPassword:formData.newPassword, email:emailToVerify, otp:otp.trim() }) });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false); setShowSuccessModal(true);
        localStorage.removeItem('user'); localStorage.removeItem('tempUser');
        setTimeout(() => { window.location.href = '/admin-login'; }, 3000);
      } else setOtpError(data.error || 'Failed to change password');
    } catch (error) { console.error("Error changing password:", error); setOtpError("Failed to change password. Please try again."); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (isPasswordChange) {
      if (!formData.currentPassword) { alert('Please enter your current password'); return; }
      if (!formData.newPassword) { alert('Please enter a new password'); return; }
      const pv = validatePasswordStrength(formData.newPassword);
      if (!pv.isValid) { alert('Please ensure your password meets all the requirements'); return; }
      if (formData.newPassword !== formData.confirmPassword) { alert('New passwords do not match!'); return; }
      if (!formData.personalEmail && !formData.email) { alert('Please provide an email address to receive OTP'); return; }
      sendOtp(); setShowOtpModal(true);
    } else updateProfile();
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/users/${user.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:formData.name, email:formData.email, role:formData.role, branch:user.branch }) });
      const data = await response.json();
      if (data.success) { alert('Profile updated successfully!'); const updatedUser = {...user,name:formData.name,email:formData.email}; localStorage.setItem('user',JSON.stringify(updatedUser)); }
      else alert(data.error || 'Failed to update profile');
    } catch (error) { console.error("Error updating profile:", error); alert("Failed to update profile. Please try again."); }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) { setFormData({ name:user.name, email:user.email, personalEmail:'', role:user.role, currentPassword:'', newPassword:'', confirmPassword:'' }); setOtp(''); setOtpSent(false); setShowOtpModal(false); }
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
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required /></div>
          <div className="form-group"><label className="form-label">Work Email Address</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required /></div>
          <div className="form-group"><label className="form-label">Personal Email Address (Optional)</label><input type="email" name="personalEmail" className="form-input" placeholder="your.personal@email.com" value={formData.personalEmail} onChange={handleInputChange} /><p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginTop:'0.5rem' }}>OTP for password changes will be sent here</p></div>
          <div className="form-group"><label className="form-label">Role</label><input type="text" name="role" className="form-input" value={formData.role} disabled style={{ background:'var(--gray-200)', cursor:'not-allowed' }} /></div>
          <div style={{ marginTop:'2rem', paddingTop:'2rem', borderTop:'2px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom:'0.5rem', color:'var(--green-primary)' }}>Change Password</h3>
            <p style={{ fontSize:'0.9rem', color:'var(--gray-500)', marginBottom:'1.5rem' }}>🔐 An OTP will be sent to your email for verification</p>
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" name="currentPassword" className="form-input" placeholder="Enter current password" value={formData.currentPassword} onChange={handleInputChange} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" name="newPassword" className="form-input" placeholder="Enter new password (min. 8 characters)" value={formData.newPassword} onChange={handleInputChange} />{showPasswordValidation && <PwValidation/>}</div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" name="confirmPassword" className="form-input" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleInputChange} /></div>
          </div>
          <div className="modal-actions" style={{ marginTop:'2rem' }}><button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🔐 Verify OTP</h2>
              <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', marginTop:'0.5rem' }}>We've sent a verification code to:</p>
              <p style={{ color:'var(--green-primary)', fontWeight:'600', fontSize:'0.95rem' }}>{formData.personalEmail || formData.email}</p>
            </div>
            <div style={{ padding:'1rem 0' }}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <input type="text" className="form-input" placeholder="000000" value={otp} onChange={e => { const v=e.target.value.replace(/\D/g,'').slice(0,6); setOtp(v); setOtpError(''); }} maxLength={6} style={{ fontSize:'1.5rem', textAlign:'center', letterSpacing:'0.5rem', fontFamily:'monospace' }} autoFocus />
                <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginTop:'0.5rem', textAlign:'center' }}>Please check your email for the verification code</p>
              </div>
              {otpSent && !otpError && <div style={{ textAlign:'center', marginTop:'1rem', padding:'0.75rem', background:'rgba(46,125,50,0.1)', borderRadius:'8px', color:'var(--green-primary)' }}>✅ OTP sent successfully</div>}
              {otpError && <div style={{ textAlign:'center', marginTop:'1rem', padding:'0.75rem', background:'rgba(239,68,68,0.1)', borderRadius:'8px', color:'var(--red)' }}>❌ {otpError}</div>}
              <div style={{ textAlign:'center', marginTop:'1.5rem' }}><button type="button" style={{ background:'none', border:'none', color:'var(--green-primary)', cursor:'pointer', textDecoration:'underline', fontSize:'0.9rem' }} onClick={sendOtp}>Resend OTP</button></div>
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

function CreateAccountModal({ applicant, onClose }) {
  const handleSubmit = (e) => { e.preventDefault(); alert(`Account created for ${applicant.name}!`); onClose(); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2 className="modal-title">Create Account</h2><p style={{ color:'var(--gray-500)', fontSize:'0.9rem' }}>Creating account for: <strong>{applicant?.name}</strong></p></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" defaultValue={applicant?.name} required /></div>
          <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" defaultValue={applicant?.email} required /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input type="tel" className="form-input" defaultValue={applicant?.phone} required /></div>
          <div className="form-group"><label className="form-label">Role</label><select className="form-select" required><option value="">Select Role</option><option value="franchisor">Franchisor</option><option value="franchisee">Franchisee</option><option value="manager">Manager</option><option value="staff">Staff</option></select></div>
          <div className="form-group"><label className="form-label">Assigned Branch</label><select className="form-select" required><option value="">Select Branch</option><option value="branch-a">Branch A</option><option value="branch-b">Branch B</option><option value="branch-c">Branch C</option></select></div>
          <div className="form-group"><label className="form-label">Temporary Password</label><input type="password" className="form-input" placeholder="Enter temporary password" required /></div>
          <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-success">Create Account</button></div>
        </form>
      </div>
    </div>
  );
}

function ViewApplicationModal({ application, onClose }) {
  if (!application) return null;
  const isIPharma = application.franchise === 'iPharma Mart';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'700px', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">📋 Franchise Application Details</h2>
          <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', marginTop:'0.5rem' }}>Application ID: #{application.id} | Status: <span className={`status-badge status-${application.status}`} style={{ marginLeft:'0.5rem' }}>{application.status.toUpperCase()}</span></p>
        </div>
        <div style={{ padding:'1rem 0' }}>
          {/* Basic Information */}
          <Section title="Basic Information">
            <Grid2><Field label="Date Applied" value={application.date}/><Field label="Payment Mode" value={application.paymentMode}/><div style={{ gridColumn:'1/-1' }}><Field label="Chosen Concept" value={application.franchise} highlight/></div></Grid2>
          </Section>
          {/* Applicant */}
          <Section title="Applicant Information">
            <Grid2>
              <div style={{ gridColumn:'1/-1' }}><Field label="Full Name" value={application.name} large/></div>
              <Field label="Date of Birth" value={application.dob}/><Field label="Civil Status" value={application.civilStatus}/>
              {!isIPharma && <><Field label="Gender" value={application.gender}/><Field label="Nationality" value={application.nationality}/></>}
              <Field label="No. of Dependents" value={application.dependents||'N/A'}/><Field label="Mobile Number" value={application.phone}/>
              {isIPharma && application.telephone && <Field label="Telephone" value={application.telephone}/>}
              <div style={{ gridColumn:'1/-1' }}><Field label="Email Address" value={application.email}/></div>
              <div style={{ gridColumn:'1/-1' }}><Field label="Present Address" value={application.address}/></div>
            </Grid2>
          </Section>
          {isIPharma && application.education && <Section title="Education"><Field label="Educational Background" value={application.education}/></Section>}
          {application.spouseName && <Section title="Spouse Information"><Grid2><Field label="Spouse Name" value={application.spouseName}/><Field label="Spouse Occupation" value={application.spouseOccupation}/>{isIPharma && application.spouseDob && <Field label="Spouse Date of Birth" value={application.spouseDob}/>}</Grid2></Section>}
          {!isIPharma && <Section title="Employment Information"><Grid2><Field label="Employment Type" value={application.employmentType}/><Field label="Years with Employer" value={`${application.yearsEmployer} years`}/><Field label="Monthly Income" value={`₱${parseInt(application.income).toLocaleString()}`} highlight/><Field label="Position" value={application.position}/><div style={{ gridColumn:'1/-1' }}><Field label="Employer / Business Name" value={application.employerName}/></div><div style={{ gridColumn:'1/-1' }}><Field label="Business Address" value={application.businessAddress}/></div><div style={{ gridColumn:'1/-1' }}><Field label="Nature of Business" value={application.businessNature}/></div></Grid2></Section>}
        </div>
        <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Close</button><button type="button" className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Application</button></div>
      </div>
    </div>
  );
}

// ViewApplicationModal helpers
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:'2rem' }}>
      <h3 style={{ color:'var(--green-primary)', fontSize:'1.2rem', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--green-accent)' }}>{title}</h3>
      {children}
    </div>
  );
}
function Grid2({ children }) { return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>{children}</div>; }
function Field({ label, value, highlight, large }) {
  return (
    <div>
      <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginBottom:'0.3rem' }}>{label}</p>
      <p style={{ fontWeight:'600', fontSize:large?'1.1rem':'1rem', color:highlight?'var(--green-primary)':'inherit' }}>{value}</p>
    </div>
  );
}