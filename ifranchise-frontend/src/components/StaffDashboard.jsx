import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { POSContent } from './AdminDashboard';

export default function StaffDashboard() {
  const navigate = useNavigate();
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

  const confirmLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Reuse the same brand list or fetch brands as needed
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch brands:', err));
  }, []);

  if (!user) return null;

  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* Top Bar */}
      <div style={{
        background: '#fff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(46,125,50,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#00897b',
        }}>
          Point of Sale
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#5a7a65' }}>Staff — {user.branch}</div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* POS Content */}
      <POSContent user={user} brands={brands} />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(13,43,30,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: '32px 36px',
              maxWidth: 400, width: '90%', textAlign: 'center',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,168,76,0.15)',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem',
            }}>🚪</div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 20,
              fontWeight: 800, color: '#0d2b1e', marginBottom: 8,
            }}>Log out?</h2>
            <p style={{ color: '#5a7a65', fontSize: 13, marginBottom: 28 }}>
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  border: '1.5px solid #b2dfdb', background: '#f0fdf5',
                  color: '#5a7a65', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Cancel</button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  border: 'none', background: '#dc2626', color: '#fff',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}