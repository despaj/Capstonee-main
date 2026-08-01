import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";

// 👇 Replace these with your actual image imports
import card1Img from "../assets/cards.png";
import card3Img from "../assets/cards (1).png";
import card2Img from "../assets/cards (2).png";

const CARDS = [
   {
    title: "Optical Character Recognition (OCR)",
    text: "An OCR-powered receipt scanner that makes liquidation faster, smarter, and fully digital. Simply scan receipts and the system automatically extracts and records the details with high accuracy—no manual encoding needed.",
    image: card3Img,
    imageAlt: "Business Intelligence",
  },
  
  {
    title: "Sales Trend Analysis Dashboard",
    text: "Monitor your franchise brand by Revenue Overview, Key Performance Indicator Cards, and Sales Analysis!",
    image: card1Img,
    imageAlt: "Sales Trend Analysis",
  },
  {
    title: "Mobile Application",
    text: "Also comes with a mobile app that lets franchisees place supply orders instantly without manual requests. It also enables real-time monitoring of current sales, giving users quick and easy access to performance anytime, anywhere.",
    image: card2Img,
    imageAlt: "Rapid Deployment",
  },
 

];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    setVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelectedCard(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="landing-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

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

        body { overflow-x: hidden; }

        .landing-page {
          font-family: 'Poppins', -apple-system, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .bg-image-container {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .bg-image {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.80;
          animation: subtleFloat 20s ease-in-out infinite;
        }

        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-20px) scale(1.08); }
        }

        .bg-overlay {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%);
          pointer-events: none;
        }

        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 0.85rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${scrolled ? 'rgba(255,255,255,0.98)' : 'var(--white)'};
          backdrop-filter: blur(12px);
          box-shadow: ${scrolled ? '0 4px 20px var(--shadow)' : '0 2px 10px rgba(0,0,0,0.05)'};
        }

        .logo-container { transition: transform 0.3s ease; }
        .logo-container:hover { transform: translateY(-2px); }
        .logo-container:hover .logo-icon { box-shadow: 0 6px 20px var(--shadow-strong); }

        .logo-icon img { width: 40%; height: 50%; object-fit: cover; }

        .nav-links { display: flex; gap: 2.5rem; align-items: center; }

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
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: var(--green-accent);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .nav-link:hover { color: var(--green-dark); }
        .nav-link:hover::after { width: 100%; }

        .nav-link.apply-btn {
          background:  linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          padding: 0.75rem 1.8rem;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px var(--shadow);
        }

        .nav-link.apply-btn::after { display: none; }

        .nav-link.apply-btn:hover {
          background:  linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow-strong);
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          z-index: 1001;
        }

        .menu-toggle span {
          width: 28px; height: 3px;
          background: var(--green-primary);
          transition: all 0.3s ease;
          border-radius: 3px;
        }

        .menu-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .menu-toggle.active span:nth-child(2) { opacity: 0; }
        .menu-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(8px, -8px); }

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
          text-shadow: 2px 4px 8px rgba(0,0,0,0.08);
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
          background:  linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          box-shadow: 0 6px 20px var(--shadow);
        }

        .cta-primary:hover {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
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
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          padding: 3rem 2.5rem;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.45s ease;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 4px;
          background: linear-gradient(90deg, var(--green-primary), var(--green-accent));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          filter: brightness(1.06);
        }

        .feature-card:hover::before { transform: scaleX(1); }
        .feature-card:active { transform: translateY(-8px) scale(0.99); }

        .click-hint {
          display: inline-block;
          margin-top: 1.2rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'Montserrat', sans-serif;
        }

        .feature-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.6rem;
          color: var(--off-white);
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .feature-text {
          color: var(--off-white);
          line-height: 1.8;
          font-size: 1rem;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal-box {
          background: var(--white);
          border-radius: 16px;
          max-width: 620px;
          width: 100%;
          overflow: hidden;
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .modal-img {
          width: 100%;
          max-height: 340px;
          object-fit: cover;
          display: block;
        }

        .modal-body {
          padding: 1.8rem 2rem 2rem;
        }

        .modal-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--green-primary);
          margin-bottom: 0.75rem;
        }

        .modal-text {
          color: var(--text-gray);
          line-height: 1.75;
          font-size: 1rem;
        }

        .modal-close {
          position: absolute;
          top: 12px; right: 14px;
          width: 34px; height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.45);
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 10;
        }

        .modal-close:hover { background: rgba(0,0,0,0.72); }

        .stats {
          padding: 5rem 5%;
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
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

        .stat-item { color: var(--white); }

        .stat-number {
          font-family: 'Montserrat', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--green-accent);
        }

        .stat-label { font-size: 1.1rem; opacity: 0.95; font-weight: 500; }

        .cta-section {
          padding: 7rem 5%;
          background: var(--off-white);
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta-section-content { max-width: 800px; margin: 0 auto; }

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

        footer {
          padding: 3rem 5%;
          background:  linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-text { opacity: 0.9; margin-bottom: 1rem; }

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

        .footer-link:hover { opacity: 1; text-decoration: underline; }

        @media (max-width: 768px) {
          nav { padding: 1rem 5%; }

          .nav-links {
            position: fixed;
            top: 0; right: -100%;
            width: 75%; height: 100vh;
            background: var(--white);
            flex-direction: column;
            justify-content: center;
            gap: 2rem;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -5px 0 25px var(--shadow);
          }

          .nav-links.active { right: 0; }
          .menu-toggle { display: flex; }

          .hero { padding: 6rem 5% 3rem; }
          .hero-cta { flex-direction: column; gap: 1rem; }
          .cta-button { width: 100%; max-width: 320px; }
          .features, .stats, .cta-section { padding: 4rem 5%; }
          .stats-grid { gap: 2rem; }
        }

        @media (max-width: 480px) {
          .logo-text { font-size: 1.2rem; }
          .logo-icon { width: 42px; height: 42px; }
          .feature-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* Modal */}
      {selectedCard !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedCard(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedCard(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <img
              src={CARDS[selectedCard].image}
              alt={CARDS[selectedCard].imageAlt}
              className="modal-img"
            />
            <div className="modal-body">
              <h3 className="modal-title">{CARDS[selectedCard].title}</h3>
              <p className="modal-text">{CARDS[selectedCard].text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="bg-image-container">
        <img src={welcome} alt="Background" className="bg-image" />
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
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h3 className="hero-title">
            Discover the perfect blend of opportunity and taste!
          </h3>
          <p className="hero-subtitle">
            Innovating centralized business-to-business operations with prescriptive and sales trend analysis.
          </p>
          <div className="hero-cta">
            <button
              className="cta-button cta-primary"
              onClick={() => window.open("https://www.facebook.com/iFranchiseBusinessServicesCorp", "_blank")}
            >
              Visit our page!
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-header">
          <h2 className="features-title">Why Choose iFranchise?</h2>
          <p className="features-subtitle">
            Solutions built to simplify franchise operations and deliver clear, measurable results.
          </p>
        </div>
        <div className="features-grid">
          {CARDS.map((card, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => setSelectedCard(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedCard(index)}
              aria-label={`Learn more about ${card.title}`}
            >
              <h3 className="feature-title">{card.title}</h3>
              <p className="feature-text">{card.text}</p>
              <span className="click-hint">Click to preview feature →</span>
            </div>
          ))}
        </div>  
      </section>

      {/* Stats */}
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

            Apply now!
            
          </p>
          </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p className="footer-text">© 2026 iFranchise. All rights reserved.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy & Terms of Service</a>
            
           <a 
  href="mailto:ifranchisebusiness.ph@gmail.com" 
  className="footer-link"
>
  Contact Us
</a>
  
          </div>
        </div>
      </footer>
    </div>
  );
}