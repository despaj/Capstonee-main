import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('inventory');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem('user'); window.location.reload(); };

  const navigation = [
    { id: 'inventory',      label: 'Inventory Management' },
    { id: 'reports',        label: 'Sales & Reports' },
    { id: 'communication',  label: 'Communication' },
    { id: 'profile',        label: 'Edit Profile' },
    { id: 'logout',         label: 'Logout', action: handleLogout },
  ];

  return (
    <div className="manager-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --green-primary: #2E7D32; --green-dark: #1B5E20; --green-light: #4CAF50;
          --green-accent: #d4df33; --white: #FFFFFF; --gray-100: #F3F4F6;
          --gray-200: #E5E7EB; --gray-300: #D1D5DB; --gray-400: #9CA3AF;
          --gray-500: #6B7280; --gray-600: #4B5563; --gray-700: #374151;
          --gray-800: #1F2937; --text-dark: #1A1A1A;
          --shadow: rgba(46,125,50,0.1); --shadow-strong: rgba(46,125,50,0.2);
          --blue: #3B82F6; --red: #EF4444; --orange: #F59E0B; --success: #10B981;
        }
        .manager-dashboard { font-family: 'Poppins', sans-serif; display: flex; min-height: 100vh; background: var(--gray-100); }

        .sidebar { width: ${sidebarCollapsed ? '80px' : '280px'}; background: var(--white); box-shadow: 2px 0 10px var(--shadow); position: fixed; left: 0; top: 0; height: 100vh; transition: width 0.3s ease; z-index: 1000; overflow-y: auto; }
        .sidebar-header { padding: 1.5rem; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; justify-content: space-between; }
        .sidebar-logo { display: flex; align-items: center; gap: 0.75rem; }
        .sidebar-logo-icon { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
        .sidebar-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-logo-text { font-family: 'Montserrat', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--green-primary); display: ${sidebarCollapsed ? 'none' : 'block'}; }
        .sidebar-toggle { background: none; border: none; font-size: 1.3rem; cursor: pointer; padding: 0.5rem; color: var(--gray-500); transition: color 0.3s ease; }
        .sidebar-toggle:hover { color: var(--green-primary); }
        .sidebar-nav { padding: 1rem 0; }
        .nav-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; color: var(--gray-600); cursor: pointer; transition: all 0.3s ease; border-left: 3px solid transparent; font-weight: 500; }
        .nav-item:hover { background: var(--gray-100); color: var(--green-primary); }
        .nav-item.active { background: rgba(46,125,50,0.08); color: var(--green-primary); border-left-color: var(--green-primary); }
        .nav-label { display: ${sidebarCollapsed ? 'none' : 'block'}; }

        .main-content { flex: 1; margin-left: ${sidebarCollapsed ? '80px' : '280px'}; transition: margin-left 0.3s ease; }
        .top-bar { background: var(--white); padding: 1.2rem 2rem; box-shadow: 0 2px 8px var(--shadow); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .top-bar-title { font-family: 'Montserrat', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--green-primary); }
        .user-menu { display: flex; align-items: center; gap: 1rem; }
        .user-info { text-align: right; }
        .user-name { font-weight: 600; color: var(--text-dark); font-size: 0.95rem; }
        .user-role { font-size: 0.8rem; color: var(--gray-500); }
        .user-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--green-primary), var(--green-light)); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; cursor: pointer; transition: transform 0.3s ease; }
        .user-avatar:hover { transform: scale(1.1); }
        .content-area { padding: 2rem; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: var(--white); padding: 1.8rem; border-radius: 12px; box-shadow: 0 2px 8px var(--shadow); transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px var(--shadow-strong); }
        .stat-value { font-family: 'Montserrat', sans-serif; font-size: 2rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.3rem; }
        .stat-label { font-size: 0.9rem; color: var(--gray-500); }
        .stat-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
        .stat-icon.green { background: rgba(16,185,129,0.1); color: var(--success); }
        .stat-icon.orange { background: rgba(245,158,11,0.1); color: var(--orange); }

        .section { background: var(--white); padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px var(--shadow); margin-bottom: 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--gray-200); }
        .section-title { font-family: 'Montserrat', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--green-primary); }

        .btn { padding: 0.7rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; }
        .btn-primary { background: var(--green-primary); color: var(--white); }
        .btn-primary:hover { background: var(--green-dark); transform: translateY(-2px); box-shadow: 0 4px 12px var(--shadow-strong); }
        .btn-secondary { background: var(--gray-200); color: var(--gray-700); }
        .btn-secondary:hover { background: var(--gray-300); }
        .btn-danger { background: var(--red); color: var(--white); }
        .btn-danger:hover { background: #DC2626; }
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }

        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 1rem; border-bottom: 1px solid var(--gray-200); }
        th { font-family: 'Montserrat', sans-serif; font-weight: 600; color: var(--gray-700); background: var(--gray-100); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
        td { color: var(--gray-600); }
        tr:hover { background: var(--gray-50); }

        .status-badge { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
        .status-low { background: rgba(239,68,68,0.1); color: var(--red); }
        .status-ok { background: rgba(16,185,129,0.1); color: var(--success); }

        .action-buttons { display: flex; gap: 0.5rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: var(--white); padding: 2.5rem; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .modal-title { font-family: 'Montserrat', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--green-primary); margin-bottom: 0.5rem; }
        .modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
        .modal-actions .btn { flex: 1; }

        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem; font-size: 0.9rem; }
        .form-input, .form-select { width: 100%; padding: 0.9rem; border: 2px solid var(--gray-300); border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 1rem; transition: all 0.3s ease; }
        .form-input:focus, .form-select:focus { outline: none; border-color: var(--green-primary); box-shadow: 0 0 0 3px rgba(46,125,50,0.1); }

        .chart-placeholder { background: var(--gray-100); height: 300px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--gray-400); font-weight: 600; margin-top: 1rem; }

        @media (max-width: 768px) {
          .sidebar { width: ${sidebarCollapsed ? '0' : '280px'}; transform: translateX(${sidebarCollapsed ? '-100%' : '0'}); }
          .main-content { margin-left: 0; }
          .content-area { padding: 1rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .user-info { display: none; }
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><img src={logo} alt="iFranchise" /></div>
            <span className="sidebar-logo-text">iFranchise</span>
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
              onClick={() => item.action ? item.action() : setActiveModule(item.id)}
            >
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <h1 className="top-bar-title">
            {navigation.find(n => n.id === activeModule)?.label || 'Inventory Management'}
          </h1>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Manager — {user?.branch}</div>
            </div>
            <div className="user-avatar">👤</div>
          </div>
        </div>

        <div className="content-area">
          {activeModule === 'inventory'     && <InventoryContent user={user} />}
          {activeModule === 'reports'       && <ReportsContent />}
          {activeModule === 'communication' && <CommunicationContent />}
          {activeModule === 'profile'       && <ProfileContent user={user} />}
        </div>
      </main>

      {showLogoutModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowLogoutModal(false)}>
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>🚪</div>
            <h2 className="modal-title" style={{ color: 'var(--gray-800)' }}>Log out?</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.5rem 0 2rem' }}>You'll need to sign in again to access your account.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmLogout}>Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Full Inventory Management (branch-scoped) ────────────────────────────────
function InventoryContent({ user }) {
  const userBranch = user?.branch || '';

  const [inventory, setInventory]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [editingItem, setEditingItem]         = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', stock: 0, minStock: 0, price: 0 });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = userBranch ? `?branch=${encodeURIComponent(userBranch)}` : '';
      const res   = await fetch(`http://localhost:5001/inventory${query}`);
      const data  = await res.json();
      setInventory(data);
    } catch (err) { console.error('Error fetching inventory:', err); }
    finally { setLoading(false); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch('http://localhost:5001/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, branch: userBranch, stock: parseInt(formData.stock), minStock: parseInt(formData.minStock), price: parseFloat(formData.price) }),
      });
      const data = await res.json();
      if (data.success) { await fetchInventory(); setShowAddModal(false); resetForm(); }
      else alert(data.error || 'Failed to add item');
    } catch { alert('Failed to add item'); }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(`http://localhost:5001/inventory/${editingItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, branch: userBranch, stock: parseInt(formData.stock), minStock: parseInt(formData.minStock), price: parseFloat(formData.price) }),
      });
      const data = await res.json();
      if (data.success) { await fetchInventory(); setShowEditModal(false); setEditingItem(null); resetForm(); }
      else alert(data.error || 'Failed to update item');
    } catch { alert('Failed to update item'); }
  };

  const handleDeleteItem = async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    try {
      const res  = await fetch(`http://localhost:5001/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchInventory(); setConfirmDeleteId(null); }
      else alert(data.error || 'Failed to delete item');
    } catch { alert('Failed to delete item'); }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, category: item.category, stock: item.stock, minStock: item.min_stock, price: item.price });
    setShowEditModal(true);
  };

  const resetForm = () => setFormData({ name: '', category: '', stock: 0, minStock: 0, price: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const lowStockCount = inventory.filter(i => i.stock < i.min_stock).length;

  const InventoryForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">Item Name</label>
        <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select name="category" className="form-select" value={formData.category} onChange={handleInputChange} required>
          <option value="">Select Category</option>
          <option value="Medicine">Medicine</option>
          <option value="Supplement">Supplement</option>
          <option value="Antibiotic">Antibiotic</option>
          <option value="Personal Care">Personal Care</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Branch</label>
        <input type="text" className="form-input" value={userBranch} disabled style={{ background: 'var(--gray-200)', cursor: 'not-allowed' }} />
      </div>
      <div className="form-group">
        <label className="form-label">Stock</label>
        <input type="number" name="stock" className="form-input" value={formData.stock} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label className="form-label">Minimum Stock</label>
        <input type="number" name="minStock" className="form-input" value={formData.minStock} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label className="form-label">Price (₱)</label>
        <input type="number" name="price" step="0.01" className="form-input" value={formData.price} onChange={handleInputChange} required />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingItem(null); }}>Cancel</button>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">📦</div>
          <div className="stat-value">{inventory.length}</div>
          <div className="stat-label">Items in {userBranch}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Inventory Management</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ padding: '6px 14px', backgroundColor: 'rgba(46,125,50,0.1)', color: 'var(--green-primary)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              📍 {userBranch}
            </span>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>+ Add New Item</button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#888', padding: '1rem 0' }}>Loading inventory...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th><th>Category</th><th>Stock</th><th>Min Stock</th><th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '2rem' }}>No items found.</td></tr>
                ) : inventory.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.min_stock}</td>
                    <td>₱{parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${item.stock < item.min_stock ? 'status-low' : 'status-ok'}`}>
                        {item.stock < item.min_stock ? 'LOW STOCK' : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-primary btn-sm" onClick={() => openEditModal(item)}>Edit</button>
                        {confirmDeleteId === item.id ? (
                          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#c62828', fontWeight: 'bold' }}>Sure?</span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>Yes</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDeleteId(null)}>No</button>
                          </span>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>Delete</button>
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
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '2rem' }}><h2 className="modal-title">Add New Inventory Item</h2></div>
            <InventoryForm onSubmit={handleAddItem} submitLabel="Add Item" />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '2rem' }}><h2 className="modal-title">Edit Inventory Item</h2></div>
            <InventoryForm onSubmit={handleEditItem} submitLabel="Save Changes" />
          </div>
        </div>
      )}
    </>
  );
}

// ── Reports ──────────────────────────────────────────────────────────────────
function ReportsContent() {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Sales & Reports</h2>
        <button className="btn btn-primary">Generate Report</button>
      </div>
      <div className="chart-placeholder">📊 Branch Sales Analytics (Placeholder)</div>
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--green-primary)' }}>Report History</h3>
        <table>
          <thead>
            <tr><th>Report Type</th><th>Generated Date</th><th>Period</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {[
              { type: 'Monthly Sales Summary', date: '2026-01-27 14:30', period: 'January 2026' },
              { type: 'Inventory Analysis',    date: '2026-01-25 09:15', period: 'Q1 2026' },
            ].map(r => (
              <tr key={r.type}>
                <td>{r.type}</td>
                <td>{r.date}</td>
                <td>{r.period}</td>
                <td><span className="status-badge status-ok">COMPLETED</span></td>
                <td><button className="btn btn-primary btn-sm">Download PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Communication ────────────────────────────────────────────────────────────
function CommunicationContent() {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Communication Center</h2>
        <button className="btn btn-primary">+ New Message</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', minHeight: 500 }}>
        <div style={{ background: 'var(--gray-100)', padding: '1.5rem', borderRadius: 12 }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--green-primary)' }}>Conversations</h3>
          {[
            { name: 'Admin Team',    preview: 'Policy update...' },
            { name: 'Staff Group',   preview: 'Team meeting notes...' },
            { name: 'Franchisor',    preview: 'Performance review...' },
          ].map(c => (
            <div key={c.name} style={{ padding: '1rem', background: 'var(--white)', borderRadius: 8, cursor: 'pointer', marginBottom: 8 }}>
              <strong>{c.name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{c.preview}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--gray-100)', padding: '1.5rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Message Thread</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Select a conversation to view messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────
function ProfileContent({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '', personalEmail: '',
    role: user?.role || '', currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showOtpModal, setShowOtpModal]         = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp]                           = useState('');
  const [otpSent, setOtpSent]                   = useState(false);
  const [otpError, setOtpError]                 = useState('');
  const [passwordErrors, setPasswordErrors]     = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8)                              errors.push('minLength');
    if (!/[A-Z]/.test(password))                          errors.push('uppercase');
    if (!/[a-z]/.test(password))                          errors.push('lowercase');
    if (!/\d/.test(password))                             errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('specialChar');
    return { isValid: errors.length === 0, errors };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      if (value) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(value).errors); }
      else { setShowPasswordValidation(false); setPasswordErrors([]); }
    }
  };

  const sendOtp = async () => {
    const emailToSend = formData.personalEmail || formData.email;
    try {
      const res  = await fetch('http://localhost:5001/send-otp-password-change', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailToSend }) });
      const data = await res.json();
      if (data.success) { setOtpSent(true); alert(`OTP has been sent to ${emailToSend}`); }
      else alert(data.message || data.error || 'Failed to send OTP');
    } catch { alert('Failed to send OTP. Please try again.'); }
  };

  const verifyOtpAndChangePassword = async () => {
    setOtpError('');
    const emailToVerify = formData.personalEmail || formData.email;
    try {
      const res  = await fetch(`http://localhost:5001/users/${user.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword, email: emailToVerify, otp: otp.trim() }) });
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
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (isPasswordChange) {
      if (!formData.currentPassword) { alert('Please enter your current password'); return; }
      if (!formData.newPassword)     { alert('Please enter a new password'); return; }
      const v = validatePasswordStrength(formData.newPassword);
      if (!v.isValid) { alert('Please ensure your password meets all the requirements'); return; }
      if (formData.newPassword !== formData.confirmPassword) { alert('New passwords do not match!'); return; }
      sendOtp(); setShowOtpModal(true);
    } else updateProfile();
  };

  const updateProfile = async () => {
    try {
      const res  = await fetch(`http://localhost:5001/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, branch: user.branch }) });
      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name, email: formData.email }));
      } else alert(data.error || 'Failed to update profile');
    } catch { alert('Failed to update profile.'); }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      setFormData({ name: user.name, email: user.email, personalEmail: '', role: user.role, currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtp(''); setOtpSent(false); setShowOtpModal(false);
    }
  };

  const pwCheck = [
    { key: 'minLength',   label: 'At least 8 characters' },
    { key: 'uppercase',   label: 'At least one uppercase letter (A-Z)' },
    { key: 'lowercase',   label: 'At least one lowercase letter (a-z)' },
    { key: 'number',      label: 'At least one number (0-9)' },
    { key: 'specialChar', label: 'At least one special character (!@#$%^&*...)' },
  ];

  return (
    <>
      <div className="section">
        <div className="section-header"><h2 className="section-title">Edit Profile</h2></div>
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
          {[['name','Full Name','text'],['email','Work Email Address','email']].map(([name,label,type]) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <input type={type} name={name} className="form-input" value={formData[name]} onChange={handleInputChange} required />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Personal Email Address (Optional)</label>
            <input type="email" name="personalEmail" className="form-input" placeholder="your.personal@email.com" value={formData.personalEmail} onChange={handleInputChange} />
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>💡 OTP for password changes will be sent to this email (or work email if not provided)</p>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" name="role" className="form-input" value={formData.role} disabled style={{ background: 'var(--gray-200)', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--green-primary)' }}>Change Password</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>🔐 An OTP will be sent to your email for verification</p>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" name="currentPassword" className="form-input" placeholder="Enter current password" value={formData.currentPassword} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" name="newPassword" className="form-input" placeholder="Enter new password (min. 8 characters)" value={formData.newPassword} onChange={handleInputChange} />
              {showPasswordValidation && (
                <div style={{ marginTop: 8, fontSize: 12, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #dee2e6' }}>
                  <div style={{ marginBottom: 6, fontWeight: 600, color: '#495057' }}>Password must contain:</div>
                  {pwCheck.map(({ key, label }) => (
                    <div key={key} style={{ color: passwordErrors.includes(key) ? '#dc3545' : '#28a745', marginBottom: 4 }}>
                      {passwordErrors.includes(key) ? '✗' : '✓'} {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleInputChange} />
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="modal-title">🔐 Verify OTP</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>We've sent a verification code to:</p>
              <p style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{formData.personalEmail || formData.email}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Enter 6-Digit OTP</label>
              <input type="text" className="form-input" placeholder="000000" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpError(''); }} maxLength={6} style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', fontFamily: 'monospace' }} autoFocus />
            </div>
            {otpSent && !otpError && <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(46,125,50,0.1)', borderRadius: 8, color: 'var(--green-primary)', marginBottom: '1rem' }}>✅ OTP sent successfully</div>}
            {otpError && <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: 'var(--red)', marginBottom: '1rem' }}>❌ {otpError}</div>}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--green-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }} onClick={sendOtp}>Resend OTP</button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={verifyOtpAndChangePassword} disabled={otp.length !== 6} style={{ opacity: otp.length !== 6 ? 0.5 : 1 }}>Verify & Change Password</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, textAlign: 'center' }}>
            <div style={{ padding: '2rem 0' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(46,125,50,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '3rem' }}>✅</div>
              <h2 style={{ color: 'var(--green-primary)', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Password Changed Successfully!</h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Your password has been updated.<br />Redirecting to login shortly.</p>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', fontStyle: 'italic' }}>Redirecting in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}