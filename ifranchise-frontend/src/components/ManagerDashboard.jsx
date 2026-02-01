import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/iFranchise_logo.png';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // GET USER DATA FROM LOCALSTORAGE
  const getUserFromStorage = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    navigate('/login');
    return null;
  };

  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  // Mock inventory data
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Paracetamol 500mg', category: 'Medicine', stock: 500, minStock: 100, price: 5.99, branch: 'Branch A' },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 45, minStock: 50, price: 12.99, branch: 'Branch A' },
    { id: 3, name: 'Vitamin C 1000mg', category: 'Supplement', stock: 300, minStock: 150, price: 8.99, branch: 'Branch A' },
    { id: 4, name: 'Ibuprofen 200mg', category: 'Medicine', stock: 250, minStock: 100, price: 6.99, branch: 'Branch A' },
    { id: 5, name: 'Multivitamins', category: 'Supplement', stock: 80, minStock: 100, price: 15.99, branch: 'Branch A' },
  ]);

  const navigation = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'inventory', icon: '📦', label: 'Inventory Management' },
    { id: 'reports', icon: '📈', label: 'Sales & Reports' },
    { id: 'profile', icon: '⚙️', label: 'Edit Profile' },
    { id: 'logout', icon: '🚪', label: 'Logout', action: handleLogout },
  ];

  return (
    <div className="manager-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --green-primary: #2E7D32;
          --green-dark: #1B5E20;
          --green-light: #4CAF50;
          --green-accent: #d4df33;
          --green-bg: #ccfcc7;
          --white: #FFFFFF;
          --off-white: #F9FAFB;
          --gray-100: #F3F4F6;
          --gray-200: #E5E7EB;
          --gray-300: #D1D5DB;
          --gray-400: #9CA3AF;
          --gray-500: #6B7280;
          --gray-600: #4B5563;
          --gray-700: #374151;
          --gray-800: #1F2937;
          --text-dark: #1A1A1A;
          --text-gray: #004d00;
          --shadow: rgba(46, 125, 50, 0.1);
          --shadow-strong: rgba(46, 125, 50, 0.2);
          --blue: #3B82F6;
          --red: #EF4444;
          --orange: #F59E0B;
          --success: #10B981;
        }

        .manager-dashboard {
          font-family: 'Poppins', sans-serif;
          display: flex;
          min-height: 100vh;
          background: var(--gray-100);
        }

        /* Sidebar */
        .sidebar {
          width: ${sidebarCollapsed ? '80px' : '280px'};
          background: var(--white);
          box-shadow: 2px 0 10px var(--shadow);
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          transition: width 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar-logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--green-primary);
          display: ${sidebarCollapsed ? 'none' : 'block'};
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--gray-500);
          transition: color 0.3s ease;
        }

        .sidebar-toggle:hover {
          color: var(--green-primary);
        }

        .sidebar-nav {
          padding: 1rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: var(--gray-600);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
          font-weight: 500;
        }

        .nav-item:hover {
          background: var(--gray-100);
          color: var(--green-primary);
        }

        .nav-item.active {
          background: rgba(46, 125, 50, 0.08);
          color: var(--green-primary);
          border-left-color: var(--green-primary);
        }

        .nav-icon {
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .nav-label {
          display: ${sidebarCollapsed ? 'none' : 'block'};
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: ${sidebarCollapsed ? '80px' : '280px'};
          transition: margin-left 0.3s ease;
        }

        /* Top Bar */
        .top-bar {
          background: var(--white);
          padding: 1.2rem 2rem;
          box-shadow: 0 2px 8px var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .top-bar-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--green-primary);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-dark);
          font-size: 0.95rem;
        }

        .user-role {
          font-size: 0.8rem;
          color: var(--gray-500);
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.1);
        }

        /* Content Area */
        .content-area {
          padding: 2rem;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--white);
          padding: 1.8rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px var(--shadow);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px var(--shadow-strong);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: var(--blue); }
        .stat-icon.green { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .stat-icon.orange { background: rgba(245, 158, 11, 0.1); color: var(--orange); }
        .stat-icon.red { background: rgba(239, 68, 68, 0.1); color: var(--red); }

        .stat-value {
          font-family: 'Montserrat', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.3rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--gray-500);
        }

        .stat-change {
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .stat-change.positive { color: var(--success); }
        .stat-change.negative { color: var(--red); }

        /* Section */
        .section {
          background: var(--white);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px var(--shadow);
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--gray-200);
        }

        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--green-primary);
        }

        .btn {
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: var(--green-primary);
          color: var(--white);
        }

        .btn-primary:hover {
          background: var(--green-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow-strong);
        }

        .btn-secondary {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .btn-secondary:hover {
          background: var(--gray-300);
        }

        .btn-danger {
          background: var(--red);
          color: var(--white);
        }

        .btn-danger:hover {
          background: #DC2626;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        /* Table */
        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          text-align: left;
          padding: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }

        th {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          color: var(--gray-700);
          background: var(--gray-100);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td {
          color: var(--gray-600);
        }

        tr:hover {
          background: var(--gray-50);
        }

        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
        }

        .status-low {
          background: rgba(239, 68, 68, 0.1);
          color: var(--red);
        }

        .status-ok {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: var(--white);
          padding: 2.5rem;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          margin-bottom: 2rem;
        }

        .modal-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--green-primary);
          margin-bottom: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 0.9rem;
          border: 2px solid var(--gray-300);
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--green-primary);
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-actions .btn {
          flex: 1;
        }

        /* Chart Placeholder */
        .chart-placeholder {
          background: var(--gray-100);
          height: 300px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-400);
          font-weight: 600;
          margin-top: 1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            width: ${sidebarCollapsed ? '0' : '280px'};
            transform: translateX(${sidebarCollapsed ? '-100%' : '0'});
          }

          .main-content {
            margin-left: 0;
          }

          .top-bar {
            padding: 1rem;
          }

          .content-area {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <img src={logo} alt="iFranchise" />
            </div>
            <span className="sidebar-logo-text">iFranchise</span>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
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
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1 className="top-bar-title">
            {navigation.find(n => n.id === activeModule)?.label || 'Dashboard'}
          </h1>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-name">{user?.name || 'Manager User'}</div>
              <div className="user-role">Manager</div>
            </div>
            <div className="user-avatar">👤</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeModule === 'dashboard' && <DashboardContent />}
          {activeModule === 'inventory' && <InventoryManagementContent inventory={inventory} setInventory={setInventory} />}
          {activeModule === 'reports' && <ReportsContent />}
          {activeModule === 'profile' && <ProfileContent user={user} />}
        </div>
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent() {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">💰</div>
          </div>
          <div className="stat-value">₱450K</div>
          <div className="stat-label">Branch Sales (Month)</div>
          <div className="stat-change positive">↑ 12.5% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">📦</div>
          </div>
          <div className="stat-value">342</div>
          <div className="stat-label">Inventory Items</div>
          <div className="stat-change negative">↓ 2 items low stock</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">📈</div>
          </div>
          <div className="stat-value">₱5.2M</div>
          <div className="stat-label">Revenue (YTD)</div>
          <div className="stat-change positive">↑ 18% growth</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">⚠️</div>
          </div>
          <div className="stat-value">2</div>
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-change">Requires attention</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Branch Overview</h2>
        </div>
        <div className="chart-placeholder">
          📊 Branch Performance Chart
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="btn btn-primary">Add Inventory Item</button>
          <button className="btn btn-primary">Generate Report</button>
          <button className="btn btn-secondary">View Stock Alerts</button>
          <button className="btn btn-secondary">Update Prices</button>
        </div>
      </div>
    </>
  );
}

// Inventory Management Content Component  
function InventoryManagementContent({ inventory, setInventory }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    branch: '',
    stock: 0,
    minStock: 0,
    price: 0
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItem = {
      id: inventory.length + 1,
      ...formData,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      price: parseFloat(formData.price)
    };
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
    resetForm();
    alert('Item added successfully!');
  };

  const handleEditItem = (e) => {
    e.preventDefault();
    setInventory(inventory.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            ...formData,
            stock: parseInt(formData.stock),
            minStock: parseInt(formData.minStock),
            price: parseFloat(formData.price)
          }
        : item
    ));
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
    alert('Item updated successfully!');
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
      alert('Item deleted successfully!');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      branch: item.branch,
      stock: item.stock,
      minStock: item.minStock,
      price: item.price
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      branch: '',
      stock: 0,
      minStock: 0,
      price: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">📦</div>
          <div className="stat-value">{inventory.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-value">
            {inventory.filter(item => item.stock < item.minStock).length}
          </div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Inventory Management</h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add New Item
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>{item.branch}</td>
                  <td>{item.stock}</td>
                  <td>{item.minStock}</td>
                  <td>₱{item.price}</td>
                  <td>
                    <span className={`status-badge ${item.stock < item.minStock ? 'status-low' : 'status-ok'}`}>
                      {item.stock < item.minStock ? 'LOW STOCK' : 'OK'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-primary btn-sm" onClick={() => openEditModal(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Inventory Item</h2>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  placeholder="e.g., Paracetamol 500mg"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Supplement">Supplement</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select 
                  name="branch"
                  className="form-select"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Branch A">Branch A</option>
                  <option value="Branch B">Branch B</option>
                  <option value="Branch C">Branch C</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input 
                  type="number" 
                  name="stock"
                  className="form-input" 
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock</label>
                <input 
                  type="number" 
                  name="minStock"
                  className="form-input" 
                  placeholder="0"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₱)</label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01" 
                  className="form-input" 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Inventory Item</h2>
            </div>
            <form onSubmit={handleEditItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Supplement">Supplement</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select 
                  name="branch"
                  className="form-select"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Branch A">Branch A</option>
                  <option value="Branch B">Branch B</option>
                  <option value="Branch C">Branch C</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Stock</label>
                <input 
                  type="number" 
                  name="stock"
                  className="form-input"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock</label>
                <input 
                  type="number" 
                  name="minStock"
                  className="form-input"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₱)</label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01" 
                  className="form-input"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Reports Content Component
function ReportsContent() {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Sales & Reports</h2>
        <button className="btn btn-primary">Generate Report</button>
      </div>

      <div className="chart-placeholder">
        📊 Sales Analytics Dashboard
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--green-primary)' }}>Report History</h3>
        <table>
          <thead>
            <tr>
              <th>Report Type</th>
              <th>Generated Date</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Branch Sales Summary</td>
              <td>2026-01-27 14:30</td>
              <td>January 2026</td>
              <td>
                <button className="btn btn-primary btn-sm">Download PDF</button>
              </td>
            </tr>
            <tr>
              <td>Inventory Report</td>
              <td>2026-01-25 09:15</td>
              <td>Q1 2026</td>
              <td>
                <button className="btn btn-primary btn-sm">Download PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Profile Content Component
// Profile Content Component
function ProfileContent({ user }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    personalEmail: '',
    role: user.role,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Show validation when user starts typing new password
    if (name === 'newPassword') {
      if (value) {
        setShowPasswordValidation(true);
        const validation = validatePasswordStrength(value);
        setPasswordErrors(validation.errors);
      } else {
        setShowPasswordValidation(false);
        setPasswordErrors([]);
      }
    }
  };

  // Password strength validation function
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push('minLength');
    }
    if (!hasUpperCase) {
      errors.push('uppercase');
    }
    if (!hasLowerCase) {
      errors.push('lowercase');
    }
    if (!hasNumber) {
      errors.push('number');
    }
    if (!hasSpecialChar) {
      errors.push('specialChar');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      console.log('Sending OTP to email:', emailToSend);
      
      const response = await fetch("http://localhost:5001/send-otp-password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToSend
        }),
      });

      const data = await response.json();
      console.log('Send OTP response:', data);

      if (data.success) {
        setOtpSent(true);
        alert(`OTP has been sent to ${emailToSend}`);
      } else {
        alert(data.message || data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError(''); // Clear previous errors
      const emailToVerify = formData.personalEmail || formData.email;
      console.log('Changing password with OTP for email:', emailToVerify);
      console.log('OTP entered:', otp);
      
      const response = await fetch(`http://localhost:5001/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          email: emailToVerify,
          otp: otp.trim()
        }),
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (data.success) {
        // Close OTP modal
        setShowOtpModal(false);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Clear user data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('tempUser');

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = '/admin-login';
        }, 3000);
      } else {
        // Show error in OTP modal
        setOtpError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setOtpError("Failed to change password. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if password change is requested
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    
    if (isPasswordChange) {
      // Validate password fields
      if (!formData.currentPassword) {
        alert('Please enter your current password');
        return;
      }
      
      if (!formData.newPassword) {
        alert('Please enter a new password');
        return;
      }
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(formData.newPassword);
      if (!passwordValidation.isValid) {
        alert('Please ensure your password meets all the requirements shown below the password field');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }

      // Check if personal email is provided for OTP
      if (!formData.personalEmail && !formData.email) {
        alert('Please provide an email address to receive OTP');
        return;
      }

      // Send OTP and show verification modal
      sendOtp();
      setShowOtpModal(true);
    } else {
      // Just update profile without password change
      updateProfile();
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          branch: user.branch
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile updated successfully!');
        // Update local storage with new user data
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      setFormData({
        name: user.name,
        email: user.email,
        personalEmail: '',
        role: user.role,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOtp('');
      setOtpSent(false);
      setShowOtpModal(false);
    }
  };

  return (
    <>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Work Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Email Address (Optional)</label>
            <input 
              type="email" 
              name="personalEmail"
              className="form-input" 
              placeholder="your.personal@email.com"
              value={formData.personalEmail}
              onChange={handleInputChange}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
              💡 OTP for password changes will be sent to this email (or work email if not provided)
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input 
              type="text" 
              name="role"
              className="form-input" 
              value={formData.role} 
              disabled 
              style={{ background: 'var(--gray-200)', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--green-primary)' }}>Change Password</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
              🔐 An OTP will be sent to your email for verification
            </p>
            
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                className="form-input" 
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                className="form-input" 
                placeholder="Enter new password (min. 8 characters)"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              
              {/* Password Validation Display */}
              {showPasswordValidation && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ marginBottom: '6px', fontWeight: '600', color: '#495057' }}>
                    Password must contain:
                  </div>
                  <div style={{ 
                    color: passwordErrors.includes('minLength') ? '#dc3545' : '#28a745',
                    marginBottom: '4px'
                  }}>
                    {passwordErrors.includes('minLength') ? '✗' : '✓'} At least 8 characters
                  </div>
                  <div style={{ 
                    color: passwordErrors.includes('uppercase') ? '#dc3545' : '#28a745',
                    marginBottom: '4px'
                  }}>
                    {passwordErrors.includes('uppercase') ? '✗' : '✓'} At least one uppercase letter (A-Z)
                  </div>
                  <div style={{ 
                    color: passwordErrors.includes('lowercase') ? '#dc3545' : '#28a745',
                    marginBottom: '4px'
                  }}>
                    {passwordErrors.includes('lowercase') ? '✗' : '✓'} At least one lowercase letter (a-z)
                  </div>
                  <div style={{ 
                    color: passwordErrors.includes('number') ? '#dc3545' : '#28a745',
                    marginBottom: '4px'
                  }}>
                    {passwordErrors.includes('number') ? '✗' : '✓'} At least one number (0-9)
                  </div>
                  <div style={{ 
                    color: passwordErrors.includes('specialChar') ? '#dc3545' : '#28a745'
                  }}>
                    {passwordErrors.includes('specialChar') ? '✗' : '✓'} At least one special character (!@#$%^&*...)
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className="form-input" 
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🔐 Verify OTP</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                We've sent a verification code to:
              </p>
              <p style={{ color: 'var(--green-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                {formData.personalEmail || formData.email}
              </p>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setOtpError(''); // Clear error when user types
                  }}
                  maxLength={6}
                  style={{ 
                    fontSize: '1.5rem', 
                    textAlign: 'center', 
                    letterSpacing: '0.5rem',
                    fontFamily: 'monospace'
                  }}
                  autoFocus
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Please check your email for the verification code
                </p>
              </div>

              {otpSent && !otpError && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(46, 125, 50, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--green-primary)'
                }}>
                  ✅ OTP sent successfully
                </div>
              )}

              {otpError && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--red)'
                }}>
                  ❌ {otpError}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--green-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                  setOtpSent(false);
                  setOtpError('');
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={verifyOtpAndChangePassword}
                disabled={otp.length !== 6}
                style={{ opacity: otp.length !== 6 ? 0.5 : 1 }}
              >
                Verify & Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ padding: '2rem 0' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'rgba(46, 125, 50, 0.1)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '3rem'
              }}>
                ✅
              </div>
              
              <h2 style={{ 
                color: 'var(--green-primary)', 
                fontSize: '1.8rem', 
                marginBottom: '1rem',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '700'
              }}>
                Password Changed Successfully!
              </h2>
              
              <p style={{ 
                color: 'var(--gray-600)', 
                fontSize: '1rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Your password has been updated successfully.<br />
                You will be redirected to the login page shortly.
              </p>

              <p style={{ 
                color: 'var(--gray-500)', 
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                Redirecting in 3 seconds...
              </p>

              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--gray-100)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--gray-600)'
              }}>
                💡 Please use your new password on the next login
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}