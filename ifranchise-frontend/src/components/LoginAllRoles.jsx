import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Make API call to your backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data including role in localStorage
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role, // Administrator, Franchisor, Franchisee, Manager, or Staff
          branch: data.user.branch,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate based on role
        switch (data.user.role) {
          case 'Administrator':
            navigate('/admin-dashboard');
            break;
          case 'Franchisor':
            navigate('/franchisor-dashboard');
            break;
          case 'Franchisee':
            navigate('/franchisee-dashboard');
            break;
          case 'Manager':
            navigate('/manager-dashboard');
            break;
          case 'Staff':
            navigate('/staff-dashboard');
            break;
          default:
            // If role is unknown, go to generic dashboard which will handle routing
            navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2E7D32, #4CAF50);
          font-family: 'Poppins', sans-serif;
        }

        .login-box {
          background: white;
          padding: 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 450px;
        }

        .login-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #2E7D32;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .login-subtitle {
          color: #6B7280;
          text-align: center;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.9rem;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #2E7D32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .login-btn:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .role-info {
          margin-top: 2rem;
          padding: 1rem;
          background: #F3F4F6;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #6B7280;
        }

        .role-info strong {
          color: #2E7D32;
          display: block;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <div className="login-box">
        <h1 className="login-title">iFranchise Login</h1>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="role-info">
          <strong>📋 User Roles:</strong>
          Administrator • Franchisor • Franchisee • Manager • Staff
        </div>
      </div>
    </div>
  );
}

export default Login;