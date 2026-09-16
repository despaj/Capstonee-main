import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";


import card1Img from "../assets/cards.png";
import card3Img from "../assets/cards (1).png";
import card2Img from "../assets/cards (2).png";

const CARDS = [
  {
    icon: "scan",
    eyebrow: "Prescriptive Analysis",
    title: "Prescriptive & Ghost Stock Analysis",
    text: "provides data-driven insights into inventory and revenue discrepancies by identifying potential ghost stock, unusual branch-level activity, and supply-to-POS inconsistencies. It analyzes recorded HQ supply and POS sales to detect possible loss risks, highlights branches that exceed the expected 12% variance threshold, and provides actionable recommendations to support inventory reconciliation and corrective decision-making.",
    image: card3Img,
    imageAlt: "Analysis",
  },
  {
    icon: "chart",
    eyebrow: "Business Intelligence",
    title: "Sales Trend Analysis Dashboard",
    text: "Monitor your franchise brand by Revenue Overview, Key Performance Indicator cards, and Sales Analysis — all in one live dashboard built for fast decisions.",
    image: card1Img,
    imageAlt: "Sales trend analysis dashboard",
  },
  {
    icon: "phone",
    eyebrow: "On-the-go Access",
    title: "Mobile Application",
    text: "A companion app that lets franchisees place supply orders instantly without manual requests, and monitor current sales in real time — quick, easy access to performance anytime, anywhere.",
    image: card2Img,
    imageAlt: "iFranchise mobile application",
  },
];

const STATS = [
  { value: 100, suffix: "+", label: "Active franchises" },
  { value: 90, suffix: "%", label: "Success rate" },
 
  { value: 5, suffix: "+", label: "Years of experience" },
];

const MARQUEE_ITEMS = [
  "AI POWERED PRESCRIPTIVE ANALYSIS",
  "SALES ANALYTICS",
  "MOBILE ORDERING",
  "REAL-TIME REPORTING",
  "ROLE DASHBOARDS",
];

/* ---------- Icons (inline, no extra deps) ---------- */
function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" };
  if (name === "scan") {
    return (
      <svg {...common}>
        <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 3.2" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="7" y="3" width="10" height="18" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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

/* ---------- Magnetic button ---------- */
function MagneticButton({ children, className, onClick, as = 'button', to }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const node = btnRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    node.style.transform = `translate(${x * 0.16}px, ${y * 0.26}px)`;
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

/* ---------- Feature card ---------- */
function FeatureCard({ card, index, visible, onSelect }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = useCallback((e) => {
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    node.style.setProperty('--glow-x', `${x}px`);
    node.style.setProperty('--glow-y', `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card"
      style={{
        transitionDelay: `${index * 100}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(index)}
      aria-label={`Preview ${card.title}`}
    >
      <div className="feature-card-glow" />
      <div className="feature-icon"><Icon name={card.icon} /></div>
      <span className="feature-eyebrow">{card.eyebrow}</span>
      <h3 className="feature-title">{card.title}</h3>
      <p className="feature-text">{card.text}</p>
      <span className="feature-link">
        Preview
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const [featuresRef, featuresVisible] = useReveal(0.1);
  const [statsRef, statsVisible] = useReveal(0.3);
  const [ctaRef, ctaVisible] = useReveal(0.2);
  const heroVisualRef = useRef(null);

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

  useEffect(() => {
    document.body.style.overflow = selectedCard !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedCard]);

  const handleHeroMove = useCallback((e) => {
    const node = heroVisualRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setHeroTilt({ x, y });
  }, []);

  const resetHeroTilt = useCallback(() => setHeroTilt({ x: 0, y: 0 }), []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --cream: #F6F7F1;
          --white: #FFFFFF;
          --ink: #12241B;
          --muted: #5C6B60;
          --green-900: #3b791e;
          --green-700: #438f1a;
          --green-600: #509820;
          --green-500: #3f811e;
          --lime: #bdd43c;
          --lime-ink: #24310C;
          --line: #E1E6D8;
          --shadow: rgba(50, 109, 32, 0.12);
          --shadow-strong: rgba(14, 59, 34, 0.24);
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
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          background: var(--cream);
          color: var(--ink);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .scroll-progress {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          background: var(--lime);
          z-index: 1100;
          transition: width 0.1s ease-out;
        }

        /* Ambient shapes */
        .field-dot {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--line) 1.4px, transparent 1.4px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 78% 20%, #000 0%, transparent 70%);
          mask-image: radial-gradient(ellipse 60% 50% at 78% 20%, #000 0%, transparent 70%);
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.5;
          pointer-events: none;
        }

        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 0.9rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${scrolled ? 'rgba(246,247,241,0.92)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(14px)' : 'none'};
          box-shadow: ${scrolled ? '0 1px 0 var(--line)' : 'none'};
        }

        .logo-icon { display: flex; align-items: center; gap: 0.6rem; }
        .logo-icon img { width: 200px; height: 80px; object-fit: contain; }
        .logo-wordmark {
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: -0.01em;
          color: var(--green-900);
        }

        .nav-links { display: flex; gap: 2.2rem; align-items: center; }

        .nav-link {
          position: relative;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--green-900);
          text-decoration: none;
          cursor: pointer;
          padding: 0.4rem 0;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          background: var(--green-600);
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .nav-link:hover::after { width: 100%; }
        .nav-link:focus-visible { outline: 2px solid var(--green-600); outline-offset: 4px; border-radius: 4px; }

        .nav-link.apply-btn {
          background: var(--green-900);
          color: var(--white);
          padding: 0.7rem 1.5rem;
          border-radius: 999px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link.apply-btn::after { display: none; }
        .nav-link.apply-btn:hover { background: var(--green-700); transform: translateY(-2px); }

        .menu-toggle { display: none; flex-direction: column; gap: 6px; cursor: pointer; z-index: 1001; }
        .menu-toggle span { width: 24px; height: 2.5px; background: var(--green-900); transition: all 0.3s ease; border-radius: 3px; }
        .menu-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
        .menu-toggle.active span:nth-child(2) { opacity: 0; }
        .menu-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

        /* ---------- Hero ---------- */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 9rem 5% 4rem;
          position: relative;
          z-index: 1;
        }

        .hero-grid {
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-copy {
          opacity: ${visible ? 1 : 0};
          transform: translateY(${visible ? '0' : '24px'});
          transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--green-700);
          margin-bottom: 1.2rem;
        }
        .eyebrow::before {
          content: '';
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--lime);
          box-shadow: 0 0 0 4px rgba(216,242,76,0.35);
        }

        .hero-title {
          font-size: clamp(2.4rem, 5.6vw, 4.3rem);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: var(--green-900);
          margin-bottom: 1.4rem;
        }

        .hero-title .highlight {
          position: relative;
          white-space: nowrap;
          display: inline-block;
        }
        .hero-title .highlight::after {
          content: '';
          position: absolute;
          left: -0.06em; right: -0.06em; bottom: 0.06em;
          height: 0.34em;
          background: var(--lime);
          z-index: -1;
          border-radius: 3px;
        }

        .hero-subtitle {
          font-size: 1.08rem;
          color: var(--muted);
          font-weight: 500;
          max-width: 480px;
          margin-bottom: 2.2rem;
          line-height: 1.7;
        }

        .hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-bottom: 2.6rem; }

        .cta-button {
          padding: 1rem 2.1rem;
          font-size: 0.98rem;
          font-weight: 700;
          font-family: inherit;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          will-change: transform;
        }

        .cta-primary {
          background: var(--green-900);
          color: var(--white);
          box-shadow: 0 10px 24px var(--shadow);
        }
        .cta-primary:hover { background: var(--green-700); box-shadow: 0 14px 30px var(--shadow-strong); }
        .cta-primary:active { transform: scale(0.96) !important; }

        .cta-ghost {
          background: transparent;
          color: var(--green-900);
          border: 1.5px solid var(--line);
        }
        .cta-ghost:hover { border-color: var(--green-600); background: var(--white); }

        .hero-trust { display: flex; align-items: center; gap: 0.9rem; }
        .trust-stack { display: flex; }
        .trust-dot {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--green-500), var(--green-700));
          border: 2px solid var(--cream);
          margin-left: -10px;
        }
        .trust-stack .trust-dot:first-child { margin-left: 0; }
        .hero-trust-text { font-size: 0.85rem; color: var(--muted); font-weight: 500; }
        .hero-trust-text b { color: var(--green-900); }

        /* Hero visual with floating badges — signature element */
        .hero-visual {
          position: relative;
          opacity: ${visible ? 1 : 0};
          transform: translateY(${visible ? '0' : '30px'});
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.25s;
        }

        .hero-visual-frame {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 4 / 4.6;
          background: var(--green-900);
          transform: rotateX(${heroTilt.y * -4}deg) rotateY(${heroTilt.x * 4}deg);
          transition: transform 0.25s ease-out;
          box-shadow: 0 30px 60px var(--shadow-strong);
        }

        .hero-visual-frame img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.92;
        }

        .hero-visual-frame::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(14,59,34,0) 40%, rgba(14,59,34,0.55) 100%);
        }

        .badge-card {
          position: absolute;
          background: var(--white);
          border-radius: 16px;
          padding: 0.85rem 1.1rem;
          box-shadow: 0 16px 32px var(--shadow);
          display: flex;
          align-items: center;
          gap: 0.7rem;
          animation: floatBadge 5s ease-in-out infinite;
        }

        .badge-1 {
          top: 10%; left: -8%;
          transform: translate(${heroTilt.x * -10}px, ${heroTilt.y * -10}px) rotate(-4deg);
          animation-delay: 0s;
        }
        .badge-2 {
          bottom: 9%; right: -7%;
          transform: translate(${heroTilt.x * 10}px, ${heroTilt.y * 10}px) rotate(3deg);
          animation-delay: -2.4s;
        }

        @keyframes floatBadge {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -10px; }
        }

        .badge-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: var(--lime);
          color: var(--lime-ink);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .badge-label { font-size: 0.72rem; color: var(--muted); font-weight: 600; }
        .badge-value { font-size: 1.05rem; font-weight: 800; color: var(--green-900); }

        /* ---------- Marquee ---------- */
        .marquee-strip {
          position: relative;
          z-index: 1;
          background: var(--green-900);
          padding: 1.1rem 0;
          overflow: hidden;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 26s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          display: flex; align-items: center; gap: 0.9rem;
          padding: 0 1.6rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.8);
          white-space: nowrap;
        }
        .marquee-item::after { content: '●'; color: var(--lime); font-size: 0.55rem; }

        /* ---------- Features ---------- */
        .features {
          padding: 7rem 5% 5rem;
          position: relative;
          z-index: 1;
        }

        .features-header {
          max-width: 640px;
          margin: 0 auto 3.2rem;
          text-align: center;
          opacity: ${featuresVisible ? 1 : 0};
          transform: translateY(${featuresVisible ? '0' : '24px'});
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .features-header .eyebrow { justify-content: center; }

        .features-title {
          font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          font-weight: 800;
          color: var(--green-900);
          letter-spacing: -0.02em;
          margin-bottom: 0.85rem;
        }
        .features-subtitle { font-size: 1.02rem; color: var(--muted); line-height: 1.6; }

        .features-grid {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.4rem;
        }

        .feature-card {
          background: var(--white);
          border: 1px solid var(--line);
          padding: 2rem 1.8rem;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          border-color: var(--green-600);
          box-shadow: 0 20px 40px var(--shadow);
          transform: translateY(-6px);
        }
        .feature-card:active { transform: translateY(-2px) scale(0.99); }
        .feature-card:focus-visible { outline: 3px solid var(--lime); outline-offset: 2px; }

        .feature-card-glow {
          position: absolute; inset: 0;
          background: radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(46,139,79,0.08), transparent 70%);
          opacity: 0; transition: opacity 0.35s ease; pointer-events: none;
        }
        .feature-card:hover .feature-card-glow { opacity: 1; }

        .feature-icon {
          width: 46px; height: 46px;
          border-radius: 12px;
          background: var(--green-900);
          color: var(--lime);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.3rem;
        }

        .feature-eyebrow {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--green-600);
          margin-bottom: 0.5rem;
        }

        .feature-title { font-size: 1.12rem; font-weight: 700; color: var(--ink); margin-bottom: 0.6rem; letter-spacing: -0.01em; }
        .feature-text { color: var(--muted); line-height: 1.6; font-size: 0.92rem; margin-bottom: 1.2rem; }

        .feature-link {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.82rem; font-weight: 700; color: var(--green-700);
          transition: gap 0.25s ease;
        }
        .feature-card:hover .feature-link { gap: 0.55rem; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(14,36,25,0.55);
          backdrop-filter: blur(0px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(6px); } }

        .modal-box {
          background: var(--white);
          border-radius: 20px;
          max-width: 600px; width: 100%; max-height: 88vh; overflow-y: auto;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(36px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .modal-img { width: 100%; max-height: 320px; object-fit: cover; display: block; }
        .modal-body { padding: 1.8rem 2rem 2rem; }
        .modal-eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green-600); margin-bottom: 0.5rem; display: block; }
        .modal-title { font-size: 1.35rem; font-weight: 800; color: var(--green-900); margin-bottom: 0.75rem; letter-spacing: -0.01em; }
        .modal-text { color: var(--muted); line-height: 1.75; font-size: 1rem; }

        .modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px; border-radius: 50%; border: none;
          background: rgba(14,36,25,0.55); color: #fff; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease; z-index: 10;
        }
        .modal-close:hover { background: var(--green-900); transform: rotate(90deg); }

        /* ---------- Stats ---------- */
        .stats {
          padding: 5.5rem 5%;
          background: var(--green-900);
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .stats::before {
          content: '';
          position: absolute;
          width: 480px; height: 480px;
          border-radius: 50%;
          background: var(--lime);
          opacity: 0.12;
          filter: blur(90px);
          top: -180px; right: -120px;
        }

        .stats-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          position: relative;
        }

        .stat-item {
          text-align: center;
          padding: 0 1rem;
          border-left: 1px solid rgba(255,255,255,0.14);
          opacity: ${statsVisible ? 1 : 0};
          transform: translateY(${statsVisible ? '0' : '18px'});
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-item:first-child { border-left: none; }

        .stat-number {
          font-size: clamp(2rem, 4.2vw, 2.7rem);
          font-weight: 800;
          margin-bottom: 0.4rem;
          color: var(--lime);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .stat-label { font-size: 0.92rem; color: rgba(255,255,255,0.75); font-weight: 500; }

        /* ---------- CTA ---------- */
        .cta-section { padding: 6.5rem 5%; position: relative; z-index: 1; }

        .cta-card {
          max-width: 1000px;
          margin: 0 auto;
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: 28px;
          padding: 4rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          opacity: ${ctaVisible ? 1 : 0};
          transform: translateY(${ctaVisible ? '0' : '24px'});
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cta-card::before {
          content: '';
          position: absolute;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: var(--lime);
          opacity: 0.16;
          filter: blur(80px);
          bottom: -160px; left: -100px;
        }

        .cta-section-title {
          font-size: clamp(1.8rem, 4vw, 2.7rem);
          font-weight: 800;
          color: var(--green-900);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          position: relative;
        }
        .cta-section-text {
          font-size: 1.05rem;
          color: var(--muted);
          margin-bottom: 2.2rem;
          line-height: 1.7;
          max-width: 520px;
          margin-left: auto; margin-right: auto;
          position: relative;
        }

        /* ---------- Footer ---------- */
        footer { padding: 2.6rem 5%; background: var(--green-900); color: rgba(255,255,255,0.85); position: relative; z-index: 1; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-text { font-size: 0.88rem; }
        .footer-links { display: flex; gap: 1.8rem; flex-wrap: wrap; }
        .footer-link { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.88rem; transition: color 0.3s ease; }
        .footer-link:hover { color: var(--lime); }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 3.5rem; }
          .hero-visual { max-width: 420px; margin: 0 auto; order: -1; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); row-gap: 2.2rem; }
          .stat-item:nth-child(3) { border-left: none; }
        }

        @media (max-width: 768px) {
          nav { padding: 1rem 5%; }
          .nav-links {
            position: fixed; top: 0; right: -100%; width: 75%; height: 100vh;
            background: var(--cream);
            flex-direction: column; justify-content: center; gap: 2rem;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -10px 0 30px var(--shadow);
          }
          .nav-links.active { right: 0; }
          .menu-toggle { display: flex; }
          .hero { padding: 7rem 5% 3rem; }
          .hero-cta { flex-direction: column; align-items: stretch; }
          .cta-button { justify-content: center; }
          .badge-card { padding: 0.65rem 0.85rem; }
          .badge-1, .badge-2 { position: absolute; }
          .cta-card { padding: 2.8rem 1.6rem; }
          .footer-content { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Modal */}
      {selectedCard !== null && (
        <div className="modal-backdrop" onClick={() => setSelectedCard(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCard(null)} aria-label="Close preview">✕</button>
            <img src={CARDS[selectedCard].image} alt={CARDS[selectedCard].imageAlt} className="modal-img" />
            <div className="modal-body">
              <span className="modal-eyebrow">{CARDS[selectedCard].eyebrow}</span>
              <h3 className="modal-title">{CARDS[selectedCard].title}</h3>
              <p className="modal-text">{CARDS[selectedCard].text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav>
        <div className="logo-icon">
          <img src={logo} alt="iFranchise logo" />
          
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/admin-login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/apply-franchise" className="nav-link apply-btn" onClick={() => setMenuOpen(false)}>Apply now</Link>
        </div>
        <div className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen((o) => !o)} role="button" tabIndex={0} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="field-dot" />
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Welcome, Partner!</span>
            <h1 className="hero-title">
              Run your franchise business on <span className="highlight">FranchiSync</span>.
            </h1>
            <p className="hero-subtitle">
              AI recommendations, live sales analytics, and mobile ordering — the operating layer behind a growing network of partner outlets.
            </p>
            <div className="hero-cta">
              <MagneticButton
                className="cta-button cta-primary"
                onClick={() => window.open("https://www.facebook.com/iFranchiseBusinessServicesCorp", "_blank")}
              >
                Visit our page
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </MagneticButton>
              <MagneticButton className="cta-button cta-ghost" onClick={scrollToFeatures}>
                See what's inside
              </MagneticButton>
            </div>
            <div className="hero-trust">
              <div className="trust-stack">
                <span className="trust-dot" />
                <span className="trust-dot" />
                <span className="trust-dot" />
              </div>
              <span className="hero-trust-text"><b>400+</b> franchises already onboard</span>
            </div>
          </div>

          <div
            className="hero-visual"
            ref={heroVisualRef}
            onMouseMove={handleHeroMove}
            onMouseLeave={resetHeroTilt}
          >
            <div className="hero-visual-frame">
              <img src={welcome} alt="iFranchise platform preview" />
            </div>
            <div className="badge-card badge-1">
              <div className="badge-icon"><Icon name="scan" /></div>
              <div>
                <div className="badge-value">AI Powered</div>
                <div className="badge-label">Prescriptive Analysis</div>
              </div>
            </div>
            <div className="badge-card badge-2">
              <div className="badge-icon"><Icon name="chart" /></div>
              <div>
                <div className="badge-value">Live</div>
                <div className="badge-label">Sales reporting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span className="marquee-item" key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="features" id="features" ref={featuresRef}>
        <div className="features-header">
          <span className="eyebrow">What's inside</span>
          <h2 className="features-title">Built to simplify franchise operations</h2>
          <p className="features-subtitle">Three tools that replace manual encoding, scattered spreadsheets, and delayed reporting with one connected system.</p>
        </div>
        <div className="features-grid">
          {CARDS.map((card, index) => (
            <FeatureCard key={index} card={card} index={index} visible={featuresVisible} onSelect={setSelectedCard} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats" id="stats" ref={statsRef}>
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div className="stat-item" key={stat.label}>
              <div className="stat-number">
                <Counter value={stat.value} suffix={stat.suffix} start={statsVisible} duration={1200 + i * 150} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="apply" ref={ctaRef}>
        <div className="cta-card">
          <h2 className="cta-section-title">Ready to grow with iFranchise?</h2>
          <p className="cta-section-text">
            Join a network of franchisees who run their outlets on one connected platform — from receipt to report.
          </p>
          <MagneticButton
            as="link"
            to="/apply-franchise"
            className="cta-button cta-primary"
          >
            Apply now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </MagneticButton>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p className="footer-text">© 2026 iFranchise. All rights reserved.</p>
          <div className="footer-links">
            
            <a href="mailto:ifranchisebusiness.ph@gmail.com" className="footer-link">Contact us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}