import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const STATS = [
  { value: 500, suffix: "+", label: "Active Franchises" },
  { value: 98, suffix: "%", label: "Success Rate" },
  { value: 24, suffix: "/7", label: "Support Available" },
  { value: 15, suffix: "+", label: "Years Experience" },
];

/* ---------- Reusable scroll-reveal hook ---------- */
function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ---------- Animated number counter ---------- */
function Counter({ value, suffix = '', duration = 1400, start }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const startTime = performance.now();
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [start, value, duration]);

  return <>{display}{suffix}</>;
}

/* ---------- Feature card with subtle tilt + magnetic hover ---------- */
function FeatureCard({ card, index, onSelect }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = useCallback((e) => {
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`);
    node.style.setProperty('--glow-x', `${x}px`);
    node.style.setProperty('--glow-y', `${y}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform('');
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card"
      style={{ transform, transitionDelay: `${index * 90}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(index)}
      aria-label={`Learn more about ${card.title}`}
    >
      <div className="feature-card-glow" />
      <span className="feature-index">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="feature-title">{card.title}</h3>
      <p className="feature-text">{card.text}</p>
      <span className="click-hint">
        Click to preview feature
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6, verticalAlign: -2 }}>
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/* ---------- Magnetic CTA button ---------- */
function MagneticButton({ children, className, onClick, as = 'button', to }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const node = btnRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    node.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  };

  const handleMouseLeave = () => {
    const node = btnRef.current;
    if (node) node.style.transform = '';
  };

  const props = {
    ref: btnRef,
    className,
    onClick,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  if (as === 'link') {
    return <Link to={to} {...props}>{children}</Link>;
  }
  return <button {...props}>{children}</button>;
}

/* ---------- Reusable scroll cue: pill button that jumps to the next section ---------- */
function ScrollCue({ targetId, label = 'Explore', variant = 'light' }) {
  const scrollToTarget = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      className={`scroll-cue scroll-cue--${variant}`}
      onClick={scrollToTarget}
      aria-label={`Scroll to ${label}`}
    >
      <span className="scroll-cue-label">{label}</span>
      <span className="scroll-cue-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [featuresRef, featuresVisible] = useReveal(0.1);
  const [statsRef, statsVisible] = useReveal(0.3);
  const [ctaRef, ctaVisible] = useReveal(0.2);

  useEffect(() => {
    setVisible(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelectedCard(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = selectedCard !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedCard]);

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

        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        .landing-page {
          font-family: 'Poppins', -apple-system, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Scroll progress bar */
        .scroll-progress {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--green-accent), var(--green-light));
          z-index: 1100;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 8px var(--shadow-strong);
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
          will-change: transform;
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

        /* Ambient floating blobs for depth */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
          animation: drift 16s ease-in-out infinite;
        }
        .blob-1 {
          width: 380px; height: 380px;
          background: var(--green-accent);
          top: -100px; right: -80px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 320px; height: 320px;
          background: var(--green-light);
          bottom: 10%; left: -100px;
          animation-delay: -6s;
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
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

        .logo-icon img {
          width: 40%; height: 50%; object-fit: cover;
        }

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
        .nav-link:focus-visible {
          outline: 2px solid var(--green-accent);
          outline-offset: 4px;
          border-radius: 4px;
        }

        .nav-link.apply-btn {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          padding: 0.75rem 1.8rem;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .nav-link.apply-btn::after { display: none; }

        .nav-link.apply-btn:hover {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px var(--shadow-strong);
        }
        .nav-link.apply-btn:active { transform: translateY(0) scale(0.98); }

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
          opacity: ${visible ? '1' : '0'};
          transform: translateY(${visible ? '0' : '24px'});
          transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
        }

        .hero-subtitle {
          font-family: 'Poppins', sans-serif;
          font-size: 20px;
          color: var(--text-gray);
          font-weight: 400;
          max-width: 750px;
          margin: 0 auto 3rem;
          line-height: 1.7;
          opacity: ${visible ? '1' : '0'};
          transform: translateY(${visible ? '0' : '24px'});
          transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.32s;
        }

        .hero-cta {
          display: inline-flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
          opacity: ${visible ? '1' : '0'};
          transform: translateY(${visible ? '0' : '24px'});
          transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.48s;
        }

        .cta-button {
          padding: 1.2rem 3rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: inline-block;
          letter-spacing: 0.02em;
          will-change: transform;
        }

        .cta-primary {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          box-shadow: 0 6px 20px var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .cta-primary:hover::before { left: 120%; }

        .cta-primary:hover {
          box-shadow: 0 12px 34px var(--shadow-strong);
        }
        .cta-primary:active { transform: scale(0.97) !important; }

        .cta-secondary {
          background: transparent;
          color: var(--green-primary);
          border: 2px solid var(--green-primary);
        }

        .cta-secondary:hover {
          background: var(--green-primary);
          color: var(--white);
          box-shadow: 0 6px 20px var(--shadow);
        }

        /* ---------- Scroll cue (redesigned): a self-contained pill, icon + label together ---------- */
        .scroll-cue {
          margin-top: 3.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1.4rem 0.7rem 1.6rem;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s ease,
                      background 0.3s ease;
          animation: cuePulse 3s ease-in-out infinite;
        }

        .scroll-cue-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px; height: 26px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .scroll-cue:hover .scroll-cue-icon-wrap { transform: translateY(3px); }
        .scroll-cue:hover { animation-play-state: paused; }
        .scroll-cue:active { transform: scale(0.96) !important; }
        .scroll-cue:focus-visible { outline: 2px solid var(--green-accent); outline-offset: 3px; }

        @keyframes cuePulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Light variant: frosted glass pill, used on white/light backgrounds (features section) */
        .scroll-cue--light {
          background: rgba(120, 130, 125, 0.08);
          backdrop-filter: blur(14px) saturate(140%);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          color: var(--green-dark);
          box-shadow: 0 8px 26px rgba(46, 125, 50, 0.1),
                      inset 0 0 0 1.5px rgba(120, 130, 125, 0.16),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        .scroll-cue--light .scroll-cue-icon-wrap {
          background: rgba(46, 125, 50, 0.12);
          color: var(--green-primary);
          backdrop-filter: blur(4px);
        }
        .scroll-cue--light:hover {
          background: rgba(120, 130, 125, 0.14);
          box-shadow: 0 12px 32px rgba(46, 125, 50, 0.18),
                      inset 0 0 0 1.5px rgba(120, 130, 125, 0.26),
                      inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        /* Solid variant: used over the hero photo */
        .scroll-cue--solid {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          color: var(--white);
          box-shadow: 0 10px 26px var(--shadow);
        }
        .scroll-cue--solid .scroll-cue-icon-wrap {
          background: rgba(255,255,255,0.22);
          color: var(--white);
        }
        .scroll-cue--solid:hover {
          box-shadow: 0 14px 34px var(--shadow-strong);
        }

        /* On-dark variant: used over the green stats section */
        .scroll-cue--onDark {
          background: rgba(255,255,255,0.14);
          color: var(--white);
          box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.4);
          backdrop-filter: blur(6px);
        }
        .scroll-cue--onDark .scroll-cue-icon-wrap {
          background: var(--green-accent);
          color: var(--green-dark);
        }
        .scroll-cue--onDark:hover {
          background: rgba(255,255,255,0.24);
          box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.65);
        }

        .section-cue-row {
          display: flex;
          justify-content: center;
        }

        .features {
          min-height: 100vh;
          padding: 6rem 5% 3rem;
          background: var(--white);
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .features-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 2.5rem;
          opacity: ${featuresVisible ? 1 : 0};
          transform: translateY(${featuresVisible ? '0' : '28px'});
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .features-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.7rem, 3.6vw, 2.5rem);
          font-weight: 800;
          color: var(--green-primary);
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .features-subtitle {
          font-size: 1rem;
          color: var(--text-gray);
          line-height: 1.6;
        }

        .features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          padding: 1.75rem 1.6rem;
          border-radius: 14px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          opacity: ${featuresVisible ? 1 : 0};
          transform: ${featuresVisible ? 'translateY(0)' : 'translateY(36px)'};
          transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.35s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          will-change: transform;
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

        .feature-card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,255,255,0.22), transparent 70%);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .feature-card:hover {
          box-shadow: 0 24px 50px rgba(0,0,0,0.28);
        }

        .feature-card:hover .feature-card-glow { opacity: 1; }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-card:active { transform: scale(0.985) translateY(-4px) !important; }
        .feature-card:focus-visible {
          outline: 3px solid var(--green-accent);
          outline-offset: 3px;
        }

        .feature-index {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.65);
          margin-bottom: 0.5rem;
        }

        .click-hint {
          display: inline-flex;
          align-items: center;
          margin-top: 0.75rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'Montserrat', sans-serif;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .feature-card:hover .click-hint {
          color: #fff;
          transform: translateX(4px);
        }

        .feature-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.15rem;
          color: var(--off-white);
          margin-bottom: 0.6rem;
          font-weight: 700;
        }

        .feature-text {
          color: var(--off-white);
          line-height: 1.55;
          font-size: 0.88rem;
        }

        .features-footer {
          margin-top: 2rem;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(0px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(4px); }
        }

        .modal-box {
          background: var(--white);
          border-radius: 16px;
          max-width: 620px;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
          transition: background 0.2s ease, transform 0.2s ease;
          z-index: 10;
        }

        .modal-close:hover { background: rgba(0,0,0,0.72); transform: rotate(90deg); }

        .stats {
          min-height: 100vh;
          padding: 3rem 5%;
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
          position: relative;
          z-index: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stats-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.75rem 2rem;
          text-align: center;
        }

        .stat-item {
          color: var(--white);
          opacity: ${statsVisible ? 1 : 0};
          transform: translateY(${statsVisible ? '0' : '20px'});
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-number {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4.5vw, 2.75rem);
          font-weight: 800;
          margin-bottom: 0.35rem;
          color: var(--green-accent);
          font-variant-numeric: tabular-nums;
        }

        .stat-label { font-size: 0.95rem; opacity: 0.95; font-weight: 500; }

        .stats-footer {
          margin-top: 2rem;
          opacity: ${statsVisible ? 1 : 0};
          transform: translateY(${statsVisible ? '0' : '16px'});
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
        }

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
          opacity: ${ctaVisible ? 1 : 0};
          transform: translateY(${ctaVisible ? '0' : '26px'});
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
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

        footer {
          padding: 3rem 5%;
          background: linear-gradient(135deg, var(--green-primary), var(--green-light));
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
          .features, .stats { min-height: auto; padding: 3.5rem 5%; }
          .cta-section { padding: 4rem 5%; }
          .stats-grid { gap: 1.5rem; }
          .blob { display: none; }
          .scroll-cue { margin-top: 2.5rem; }
        }

        @media (max-width: 480px) {
          .logo-text { font-size: 1.2rem; }
          .logo-icon { width: 42px; height: 42px; }
          .feature-card { padding: 1.5rem 1.25rem; }
        }
      `}</style>

      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Modal */}
      {selectedCard !== null && (
        <div className="modal-backdrop" onClick={() => setSelectedCard(null)}>
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
        <div className="logo-container">
          <div className="logo-icon">
            <img src={logo} alt="iFranchise Logo" />
          </div>
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/admin-login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/apply-franchise" className="nav-link apply-btn" onClick={() => setMenuOpen(false)}>Apply</Link>
        </div>
        <div
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
        >
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
            <MagneticButton
              className="cta-button cta-primary"
              onClick={() => window.open("https://www.facebook.com/iFranchiseBusinessServicesCorp", "_blank")}
            >
              Visit our page!
            </MagneticButton>
          </div>
          <div className="section-cue-row">
            <ScrollCue targetId="features" label="Explore" variant="solid" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features" ref={featuresRef}>
        <div className="features-header">
          <h2 className="features-title">Why Choose iFranchise?</h2>
          <p className="features-subtitle">
            Solutions built to simplify franchise operations and deliver clear, measurable results.
          </p>
        </div>
        <div className="features-grid">
          {CARDS.map((card, index) => (
            <FeatureCard key={index} card={card} index={index} onSelect={setSelectedCard} />
          ))}
        </div>
        <div className="section-cue-row features-footer">
          <ScrollCue targetId="stats" label="Our Numbers" variant="light" />
        </div>
      </section>

      {/* Stats */}
      <section className="stats" id="stats" ref={statsRef}>
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div className="stat-item" key={stat.label} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="stat-number">
                <Counter value={stat.value} suffix={stat.suffix} start={statsVisible} duration={1200 + i * 150} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="section-cue-row stats-footer">
          <ScrollCue targetId="apply" label="Get Started" variant="onDark" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="apply" ref={ctaRef}>
        <div className="cta-section-content">
          <h2 className="cta-section-title">Ready to Transform Your Business?</h2>
          <p className="cta-section-text">
            Join hundreds of successful franchisees who trust iFranchise to power their operations.
            Start your journey today and unlock your business potential.
            <br />
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
            <a href="mailto:ifranchisebusiness.ph@gmail.com" className="footer-link">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}