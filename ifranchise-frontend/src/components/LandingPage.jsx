import React, { useState, useEffect, Image } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";


export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
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
          --text-dark: #1A1A1A;
          --text-gray: #004d00;
          --shadow: rgba(46, 125, 50, 0.15);
          --shadow-strong: rgba(46, 125, 50, 0.25);
        }

        body {
          overflow-x: hidden;
        }

        .landing-page {
          font-family: 'Poppins', -apple-system, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
      
        }

        /* Background Image with Overlay */
        .bg-image-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity:0.80;
          animation: subtleFloat 20s ease-in-out infinite;
        }

        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-20px) scale(1.08); }
        }

        .bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 100%);
          pointer-events: none;
        }

        /* Navbar */
        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.2rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${scrolled ? 'rgba(255, 255, 255, 0.98)' : 'var(--white)'};
          backdrop-filter: blur(10px);
          box-shadow: ${scrolled ? '0 4px 20px var(--shadow)' : '0 2px 10px rgba(0, 0, 0, 0.05)'};
        }

      

        .logo-container:hover {
          transform: translateY(-2px);
        }

   
        .logo-container:hover .logo-icon {
          box-shadow: 0 6px 20px var(--shadow-strong);
        }

        .logo-icon img {
          width: 40%;
          height: 70%;
          object-fit: cover;
        }

    

        .nav-links {
          display: flex;
          gap: 2.5rem;
          align-items: center;
        }

        .nav-link {
          position: relative;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--green-primary);
          text-decoration: none;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--green-accent);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .nav-link:hover {
          color: var(--green-dark);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link.apply-btn {
          background: var(--green-primary);
          color: var(--white);
          padding: 0.75rem 1.8rem;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px var(--shadow);
        }

        .nav-link.apply-btn::after {
          display: none;
        }

        .nav-link.apply-btn:hover {
          background: var(--green-dark);
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow-strong);
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          z-index: 1001;
        }

        .menu-toggle span {
          width: 28px;
          height: 3px;
          background: var(--green-primary);
          transition: all 0.3s ease;
          border-radius: 3px;
        }

        .menu-toggle.active span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .menu-toggle.active span:nth-child(2) {
          opacity: 0;
        }

        .menu-toggle.active span:nth-child(3) {
          transform: rotate(-45deg) translate(8px, -8px);
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 5% 4rem;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          max-width: 1000px;
          text-align: center;
          opacity: ${visible ? '1' : '0'};
          transform: translateY(${visible ? '0' : '40px'});
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 60px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--green-primary);
          margin-bottom: 1.8rem;
          letter-spacing: -0.02em;
          text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.08);
        }

        .hero-subtitle {
          font-family: 'Poppins', sans-serif;
          font-size: 20px;
          color: var(--text-gray);
          font-weight: 400;
          max-width: 750px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .hero-cta {
          display: inline-flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
        }

        .cta-button {
          padding: 1.2rem 3rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          letter-spacing: 0.02em;
        }

        .cta-primary {
          background: var(--green-primary);
          color: var(--white);
          box-shadow: 0 6px 20px var(--shadow);
        }

        .cta-primary:hover {
          background: var(--green-dark);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px var(--shadow-strong);
        }

        .cta-secondary {
          background: transparent;
          color: var(--green-primary);
          border: 2px solid var(--green-primary);
        }

        .cta-secondary:hover {
          background: var(--green-primary);
          color: var(--white);
          transform: translateY(-4px);
          box-shadow: 0 6px 20px var(--shadow);
        }

        /* Features Section */
        .features {
          padding: 7rem 5%;
          background: var(--white);
          position: relative;
          z-index: 1;
        }

        .features-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 5rem;
        }

        .features-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--green-primary);
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
        }

        .features-subtitle {
          font-size: 1.2rem;
          color: var(--text-gray);
          line-height: 1.7;
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          background: var(--off-white);
          padding: 3rem 2.5rem;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, var(--green-primary), var(--green-accent));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px var(--shadow-strong);
          border-color: var(--green-accent);
          background: var(--white);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 6px 20px var(--shadow);
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.6rem;
          color: var(--green-primary);
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .feature-text {
          color: var(--text-gray);
          line-height: 1.8;
          font-size: 1rem;
        }

        /* Stats Section */
        .stats {
          padding: 5rem 5%;
          background: var(--green-primary);
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          text-align: center;
        }

        .stat-item {
          color: var(--white);
        }

        .stat-number {
          font-family: 'Montserrat', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--green-accent);
        }

        .stat-label {
          font-size: 1.1rem;
          opacity: 0.95;
          font-weight: 500;
        }

        /* CTA Section */
        .cta-section {
          padding: 7rem 5%;
          background: var(--off-white);
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta-section-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--green-primary);
          margin-bottom: 1.5rem;
        }

        .cta-section-text {
          font-size: 1.2rem;
          color: var(--text-gray);
          margin-bottom: 3rem;
          line-height: 1.7;
        }

        /* Footer */
        footer {
          padding: 3rem 5%;
          background: var(--green-dark);
          color: var(--white);
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-text {
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .footer-link {
          color: var(--white);
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .footer-link:hover {
          opacity: 1;
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          nav {
            padding: 1rem 5%;
          }

          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 75%;
            height: 100vh;
            background: var(--white);
            flex-direction: column;
            justify-content: center;
            gap: 2rem;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -5px 0 25px var(--shadow);
          }

          .nav-links.active {
            right: 0;
          }

          .menu-toggle {
            display: flex;
          }

          .hero {
            padding: 6rem 5% 3rem;
          }

          .hero-cta {
            flex-direction: column;
            gap: 1rem;
          }

          .cta-button {
            width: 100%;
            max-width: 320px;
          }

          .features, .stats, .cta-section {
            padding: 4rem 5%;
          }

          .stats-grid {
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1.2rem;
          }

          .logo-icon {
            width: 42px;
            height: 42px;
          }

          .feature-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      {/* Background Image */}
                <div className="bg-image-container">
                  <img
            src={welcome}
            alt="Background"
            className="bg-image"
          />

        <div className="bg-overlay"></div>
      </div>

      {/* Navbar */}
      <nav>
       
          <div className="logo-icon">
            <img src={logo} alt="iFranchise Logo" />
          </div>
   
        <div className="nav-links">
          <Link to="/admin-login" className="nav-link">Login</Link>
          <Link to="/apply-franchise" className="nav-link apply-btn">Apply</Link>
        </div>

        <div className="menu-toggle" onClick={(e) => {
          e.currentTarget.classList.toggle('active');
          document.querySelector('.nav-links').classList.toggle('active');
        }}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h3 className="hero-title">
            Discover the perfect blend of opportunity and taste!
          </h3>
          <p className="hero-subtitle">
            Centralizing franchise operations through intelligent design. 
            Empowering entrepreneurs with cutting-edge tools and proven strategies for sustainable growth.
          </p>
          <div className="hero-cta">
            <button className="cta-button cta-primary">Get Started</button>
            <button className="cta-button cta-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2 className="features-title">Why Choose iFranchise?</h2>
          <p className="features-subtitle">
            Comprehensive solutions designed to streamline your franchise operations and drive measurable results.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Centralized Dashboard</h3>
            <p className="feature-text">
              Monitor all your franchise locations from a single, intuitive platform with real-time analytics and insights.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Rapid Deployment</h3>
            <p className="feature-text">
              Launch new franchise locations quickly with our proven systems and comprehensive training programs.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3 className="feature-title">Business Intelligence</h3>
            <p className="feature-text">
              Make data-driven decisions with advanced reporting, forecasting, and performance tracking tools.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3 className="feature-title">Partner Support</h3>
            <p className="feature-text">
              Dedicated support team available 24/7 to ensure your franchise operates at peak performance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Compliant</h3>
            <p className="feature-text">
              Enterprise-grade security and compliance measures to protect your business and customer data.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3 className="feature-title">Growth Analytics</h3>
            <p className="feature-text">
              Track performance metrics and identify growth opportunities with powerful analytics dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Franchises</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years Experience</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="apply">
        <div className="cta-section-content">
          <h2 className="cta-section-title">Ready to Transform Your Business?</h2>
          <p className="cta-section-text">
            Join hundreds of successful franchisees who trust iFranchise to power their operations. 
            Start your journey today and unlock your business potential.
          </p>
          <div className="hero-cta">
            <Link to="/admin-login" className="cta-button cta-primary">Get Started Now</Link>
            <button className="cta-button cta-secondary">Schedule a Demo</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p className="footer-text">© 2026 iFranchise. All rights reserved.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
            <a href="#" className="footer-link">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}