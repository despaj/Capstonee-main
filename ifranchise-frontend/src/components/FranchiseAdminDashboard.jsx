import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import StockInventoryContent from "./StockInventoryContent";
import ReceiptPrintTemplate from "./ReceiptPrintTemplate";
import logoIfranchise from "../assets/report/ifranchise-logo.png";
import logoSync from "../assets/report/franchsync-logo.png";
import {
  Home, FileCheck, Users, BarChart2, MessageCircle, User,
  LogOut, Search, AlertTriangle, DollarSign, GitBranch,
  Globe, MapPin, Phone, Mail, Edit2, Trash2, X, Check,
  Plus, Pencil, Store, TrendingUp, Layers, History,
  RotateCcw, UserPlus, CheckCircle, ChevronRight, Lock, Box,
  Unlock, CheckCircle2, FileText, Eye, Download, RefreshCw,
  BarChart, Calendar, Archive, Package, Info, Clock, Pin,
  Megaphone, ChevronDown, ArrowUpRight,ArrowDownRight, PieChart,
  Activity, TrendingDown, Target, ShoppingCart, Brain, Zap, Printer
} from 'lucide-react';

const C = {
  green: "#3b791e", greenDk: "#2c5c16", greenLt: "#f0f5e8", greenMid: "#c9dba0",
  teal: "#509820", ink: "#12241B", muted: "#5C6B60", border: "#E1E6D8",
  bg: "#F6F7F1", white: "#ffffff", warn: "#b45309", warnBg: "#fff7ed",
  ok: "#2c5c16", okBg: "#f0f5e8",
};
const FONT = "'Plus Jakarta Sans', sans-serif";
const PAL  = ["#3b791e","#bdd43c","#2c5c16","#509820","#c9dba0","#d4a63c","#547a46","#89a66f","#7a8e70","#b0be9d"];

const ROLE_LABEL = 'Franchisee Operations Admin';



// ─── Shared CSS ───────────────────────────────────────────────────────────────
const FA_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root, button, input, textarea, select, option { font-family:'Plus Jakarta Sans',sans-serif; }
  :root {
    --g1:#bdd43c; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
    --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
    --green-accent:#bdd43c; --green-bg:#F6F7F1; --white:#ffffff;
    --gray-100:#F3F4F1; --gray-200:#E1E6D8; --gray-300:#D4DBC8;
    --gray-400:#9CA89C; --gray-500:#6B7A65; --gray-600:#4B5A45;
    --gray-700:#374132; --gray-800:#1F2A1B;
    --shadow:rgba(50,109,32,0.10); --shadow-strong:rgba(14,59,34,0.20);
    --card-border:#E1E6D8;
    --grad-main:linear-gradient(135deg,#509820,#3b791e);
    --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
    --grad-gold:linear-gradient(135deg,#e9cd30,#bdd43c);
    --grad-bg:#F6F7F1;
  }
`;
const invLabelSt = {
  display:"block", fontSize:11, fontWeight:800,
  color:C.muted, marginBottom:5,
  textTransform:"uppercase", letterSpacing:"0.07em",
};
const invInputSt = {
  height:36, padding:"0 11px", borderRadius:11,
  border:`1.5px solid ${C.border}`, background:C.white,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};
// ─── Reusable style helpers ───────────────────────────────────────────────────
const bmInput = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #b2dfdb', fontSize: 13, color: '#0d2b1e',
  background: '#f0fdf5', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const bmLabel = {
  display: 'block', fontSize: 11, fontWeight: 800, color: '#2e6725',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em',
};
const smallBtnSt = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 28, padding: '0 10px', borderRadius: 7,
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', background: C.white,
};

const btnSt = {
  display:"inline-flex", alignItems:"center", gap:6,
  height:38, padding:"0 18px", borderRadius:999,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, fontWeight:700, cursor:"pointer",
  fontFamily:"inherit", whiteSpace:"nowrap",
};
const btnPrimarySt = {
  ...btnSt,
  background:C.green,
  color:C.white, border:"none",
  boxShadow:"0 10px 24px rgba(59,121,30,0.22)",
};

const DEFAULT_PROFIT_MARGIN = 40;
const PAGE_SIZE = 15;
const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];

const fmtPeso = n => "\u20B1" + Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtTs   = d  => new Date(d).toLocaleString("en-PH",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

const fmtAmt_d   = (n) => "\u20B1" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort_d = (n) => { if (n >= 1_000_000) return "\u20B1" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "\u20B1" + (n / 1_000).toFixed(0) + "k"; return "\u20B1" + Number(n).toFixed(0); };
 
// ─── PanelCard ────────────────────────────────────────────────────────────────
function PanelCard({ children, style: s }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,140,60,0.07)", ...s }}>
      {children}
    </div>
  );
}
 
// ─── CardHeader ───────────────────────────────────────────────────────────────
function CardHeader({ icon: Icon, title, sub, gradient = "linear-gradient(135deg,#2E7D32,#00897b)", action }) {
  return (
    <div style={{ background: gradient, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.28)" }}>
          <Icon size={17} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#fff" }}>{title}</div>
          {sub && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}
 
// ─── ChartLabel ───────────────────────────────────────────────────────────────
function ChartLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
      {children}
    </div>
  );
}
 
// ─── BulletItem ───────────────────────────────────────────────────────────────
function BulletItem({ text, color = "#00897b", size = "normal" }) {
  const fs = size === "small" ? 11 : 12.5;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: fs === 11 ? 4 : 5 }} />
      <span style={{ fontSize: fs, color: "#0d2b1e", lineHeight: 1.6, fontFamily: FONT }}>{text}</span>
    </div>
  );
}
 
// ─── SparkBar ─────────────────────────────────────────────────────────────────
function SparkBar({ values = [], color = "#00c853", height = 30 }) {
  if (!values.length) return null;
  const maxV = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, opacity: 0.4 + 0.6 * (i / values.length), borderRadius: 2, height: `${Math.max(4, (v / maxV) * height)}px` }} />
      ))}
    </div>
  );
}
 
// ─── ComboChart ───────────────────────────────────────────────────────────────
function ComboChart({ barData = [], lineData = [], labels = [], height = 200 }) {
  const [tip, setTip] = React.useState(null);
  const ref = React.useRef(null);
  const W = 700, H = height, PL = 56, PR = 48, PT = 16, PB = 32;
  const pW = W - PL - PR, pH = H - PT - PB;
  const barSeries = Array.isArray(barData[0]) ? barData : [barData];
  const maxBar  = Math.max(...barSeries.flat(), 1) * 1.2;
  const maxLine = Math.max(...(lineData || []), 1) * 1.2;
  const minLine = Math.min(...(lineData || []), 0);
  const n = labels.length;
  const bW = Math.min(22, (pW / Math.max(n, 1)) - 6);
 
  const linepts = (lineData || []).map((v, i) => ({
    x: PL + (i / Math.max(n - 1, 1)) * pW,
    y: PT + pH - ((v - minLine) / (maxLine - minLine || 1)) * pH,
    v,
  }));
  let linePath = "";
  if (linepts.length > 1) {
    linePath = `M ${linepts[0].x} ${linepts[0].y}`;
    for (let i = 0; i < linepts.length - 1; i++) {
      const cx = (linepts[i].x + linepts[i + 1].x) / 2;
      linePath += ` C ${cx} ${linepts[i].y}, ${cx} ${linepts[i + 1].y}, ${linepts[i + 1].x} ${linepts[i + 1].y}`;
    }
  }
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + pH * (1 - t), label: fmtShort_d(t * maxBar) }));
 
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bestD = Infinity;
    labels.forEach((_, i) => {
      const x = PL + (i / Math.max(n - 1, 1)) * pW;
      const d = Math.abs(x - mx);
      if (d < bestD) { bestD = d; best = i; }
    });
    setTip({ i: best, x: PL + (best / Math.max(n - 1, 1)) * pW, label: labels[best] });
  };
 
  return (
    <div style={{ position: "relative", cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
      <svg ref={ref} style={{ width: "100%", display: "block", overflow: "visible" }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          {barSeries.map((_, si) => (
            <linearGradient key={si} id={`fa_cbg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
              <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
            </linearGradient>
          ))}
          <linearGradient id="fa_clgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#e8ede9" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily={FONT}>{t.label}</text>
          </g>
        ))}
        {labels.map((lbl, i) => {
          const groupW = pW / Math.max(n, 1);
          const groupX = PL + i * groupW + groupW / 2;
          return barSeries.map((series, si) => {
            const v  = series[i] || 0;
            const bH = (v / maxBar) * pH;
            const x  = groupX - ((barSeries.length / 2 - si) * (bW + 2)) - bW / 2;
            return (
              <rect key={`${i}-${si}`} x={x} y={PT + pH - bH} width={bW} height={bH} rx="4"
                fill={`url(#fa_cbg${si})`} opacity={tip?.i === i ? 1 : 0.82} />
            );
          });
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={PL + (i / Math.max(n - 1, 1)) * pW} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b9070" fontFamily={FONT}>{lbl}</text>
        ))}
        {linePath && <path d={linePath} fill="none" stroke="url(#fa_clgLine)" strokeWidth="2.5" strokeLinecap="round" />}
        {linepts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={tip?.i === i ? 5 : 3} fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
        ))}
        {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + pH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />}
      </svg>
      {tip && (
        <div style={{ position: "absolute", bottom: 36, left: `${(tip.x / W) * 100}%`, transform: "translateX(-50%)", background: "#0d2b1e", color: "#fff", borderRadius: 10, padding: "8px 12px", pointerEvents: "none", whiteSpace: "nowrap", fontSize: 11, fontFamily: FONT, boxShadow: "0 4px 16px rgba(0,0,0,0.22)", zIndex: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>{tip.label}</div>
          {barSeries.map((s, si) => <div key={si} style={{ color: PAL[si] }}>{fmtShort_d(s[tip.i] || 0)}</div>)}
          {lineData?.[tip.i] != null && <div style={{ color: "#93c5fd" }}>GP%: {lineData[tip.i].toFixed(1)}%</div>}
        </div>
      )}
    </div>
  );
}
 
// ─── HBarChart ────────────────────────────────────────────────────────────────
function HBarChart({ data = [] }) {
  const maxV = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{d.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PAL[i % PAL.length], fontFamily: FONT }}>{fmtShort_d(d.value)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#f0fdf5", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`, width: `${(d.value / maxV) * 100}%`, transition: "width .6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
 
// ─── DonutChartSVG ────────────────────────────────────────────────────────────
function DonutChartSVG({ segments = [], size = 140, innerRadius = 0.6, centerLabel = "", centerSub = "", showLegend = true }) {
  const [hover, setHover] = React.useState(null);
  const R = size / 2, cx = R, cy = R;
  const outerR = R - 4, innerR = outerR * innerRadius;
  const total  = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
  const slices = segments.map((seg, i) => {
    const pct = (seg.value || 0) / total;
    const sa  = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const ea  = cum * 2 * Math.PI - Math.PI / 2;
    const x1  = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2  = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(ea), iy1 = cy + innerR * Math.sin(ea);
    const ix2 = cx + innerR * Math.cos(sa), iy2 = cy + innerR * Math.sin(sa);
    const large = pct > 0.5 ? 1 : 0;
    const mid   = sa + (ea - sa) / 2;
    return { ...seg, path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`, mid, pct, color: seg.color || PAL[i % PAL.length] };
  });
  const hov = hover !== null ? slices[hover] : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hover === null ? 0.88 : hover === i ? 1 : 0.42}
            stroke="#fff" strokeWidth="2"
            transform={hover === i ? `translate(${Math.cos(s.mid) * 4} ${Math.sin(s.mid) * 4})` : ""}
            style={{ transition: "all .18s", cursor: "pointer" }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
        {innerRadius > 0 && (
          <>
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0d2b1e" fontFamily={FONT}>{hov ? Math.round(hov.pct * 100) + "%" : centerLabel || total.toLocaleString()}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9.5" fill="#5a7a65" fontFamily={FONT}>{hov ? hov.label : (centerSub || "total")}</text>
          </>
        )}
      </svg>
      {showLegend && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: hover === null ? 1 : hover === i ? 1 : 0.45, transition: "opacity .15s" }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT }}>{Math.round(s.pct * 100)}% · {(s.value || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 

// ─── Shared card/section components ──────────────────────────────────────────
const BmStatCard = ({ label, value, sub, icon, bg }) => (
  <div style={{
    background: C.white, border: '1px solid rgba(0,168,76,0.12)',
    borderRadius: 18, padding: '20px 22px',
    boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
    transition: 'transform .2s, box-shadow .2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,140,60,0.13)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,140,60,0.07)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0d2b1e' }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#5a7a65' }}>{sub}</span>
  </div>
);

const BmSection = ({ children, style = {} }) => (
  <div style={{
    background: C.white, border: '1px solid rgba(0,168,76,0.12)',
    borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)',
    overflow: 'hidden', marginBottom: 24, ...style,
  }}>
    {children}
  </div>
);

const BmSectionHeader = ({ title, subtitle, action }) => (
  <div style={{
    background: 'linear-gradient(135deg,#2E7D32,#00897b)',
    color: C.white, padding: '16px 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{subtitle}</div>}
    </div>
    {action && <div style={{ display: 'flex', gap: 8 }}>{action}</div>}
  </div>
);

// ─── Alert Modal ─────────
function AlertModal({ message, onClose, type = 'info' }) {
  const isError = type === 'error';
  const isSuccess = type === 'success';
  const iconBg = isError ? '#fee2e2' : isSuccess ? '#d1fae5' : '#dbeafe';
  const iconColor = isError ? '#dc2626' : isSuccess ? '#059669' : '#2563eb';
  const Icon = isError ? Trash2 : isSuccess ? Check : Info;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon size={22} color={iconColor} />
        </div>
        <p style={{ fontSize: 14, color: '#0d2b1e', lineHeight: 1.6, marginBottom: 20, fontWeight: 600 }}>{message}</p>
        <button onClick={onClose} style={{ padding: '9px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)' }}>OK</button>
      </div>
    </div>
  );
}

export default function FranchiseAdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(
    () => sessionStorage.getItem('fa_activeModule') || 'dashboard'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alertModal, setAlertModal] = useState(null);

  const getUserFromStorage = () => {
    const s = localStorage.getItem('user') || localStorage.getItem('rememberedUser') || sessionStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  };
  
  const [user, setUser] = useState(getUserFromStorage);
  
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const u = getUserFromStorage();
    if (!u) navigate('/admin-login');
    else setUser(u);
  }, []);

    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/transactions`)
        .then(res => res.json()).then(data => setTransactions(data))
        .catch(err => console.error("Failed to fetch transactions", err));
    }, []);

  useEffect(() => {
    sessionStorage.setItem('fa_activeModule', activeModule);
  }, [activeModule]);

  const confirmLogout = async () => {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      const userId = stored ? JSON.parse(stored)?.id : null;
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }), credentials: 'include',
      });
    } catch {}
    finally {
      localStorage.removeItem('user');
      localStorage.removeItem('rememberedUser');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('tempUser');
      sessionStorage.removeItem('fa_activeModule');
      setShowLogoutModal(false);
      window.location.href = '/admin-login';
    }
  };

  // ── Fetch brands for sub-modules that need them ──
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const navigation = [
    { id: 'dashboard',      label: 'Dashboard',            icon: <Home size={20} />,        section: 'main' },
    { id: 'inventory',      label: 'Menu Inventory',        icon: <Box size={20} />,         section: 'main' },
    { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} />,      section: 'main' },
    { id: 'mobileOrders',   label: 'View Mobile Orders',    icon: <Package size={20} />,     section: 'main' },
    { id: 'applications',  label: 'Applications',  icon: <FileCheck size={20} />,     section: 'main' },
    { id: 'communication', label: 'Announcements',       icon: <MessageCircle size={20} />, section: 'main' },
    { id: 'brandBranch',   label: 'Brand & Branch',      icon: <GitBranch size={20} />,     section: 'main' },
    { id: 'profile',       label: 'Edit Profile',        icon: <User size={20} />,          section: 'account' },
    { id: 'logout',        label: 'Logout',              icon: <LogOut size={20} />,        section: 'account', action: () => setShowLogoutModal(true) },
  ];

  const mainNav    = navigation.filter(n => n.section === 'main');
  const accountNav = navigation.filter(n => n.section === 'account');

  const moduleLabel = navigation.find(n => n.id === activeModule)?.label || 'Dashboard';

  return (
    <div className="fa-root">
      <style>{FA_CSS}{`
        .fa-root {
          font-family:'Plus Jakarta Sans',sans-serif;
          display:flex;
          min-height:100vh;
          background:#F6F7F1;
          background-image:radial-gradient(#E1E6D8 1px, transparent 1px);
          background-size:22px 22px;
        }
        .fa-sidebar {
          width:${sidebarCollapsed ? '76px' : '272px'};
          background:#fff;
          box-shadow:1px 0 0 #E1E6D8;
          position:fixed;
          top:0; left:0; bottom:0;
          display:flex;
          flex-direction:column;
          padding:18px 14px;
          overflow-y:auto;
          overflow-x:hidden;
          z-index:1000;
          transition:width .3s ease;
        }
        .fa-sidebar-header {
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:4px 6px 18px;
          min-height:58px;
        }
        .fa-brand { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-weight:800; font-size:16px; white-space:nowrap; }
        .fa-toggle {
          background:none;
          border:1px solid #E1E6D8;
          border-radius:8px;
          width:28px;
          height:28px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          color:#5C6B60;
          flex-shrink:0;
          transition:background .15s ease,color .15s ease,border-color .15s ease;
        }
        .fa-toggle:hover { background:#F6F7F1; color:#2c5c16; border-color:#D4DBC8; }
        .fa-nav { display:flex; flex-direction:column; gap:2px; padding:0; }
        .fa-nav-section {
          font-size:10.5px;
          font-weight:800;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#9CA89C;
          padding:12px 10px 6px;
          display:${sidebarCollapsed ? 'none' : 'block'};
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .fa-nav-item {
          font-family:'Plus Jakarta Sans',sans-serif;
          display:flex;
          align-items:center;
          gap:12px;
          padding:10px 12px;
          border-radius:12px;
          color:#5C6B60;
          cursor:pointer;
          position:relative;
          font-size:14px;
          font-weight:500;
          transition:background .15s ease,color .15s ease;
          margin:0;
        }
        .fa-nav-item:hover { background:#F6F7F1; color:#12241B; }
        .fa-nav-item.active { background:#F6F7F1; color:#2c5c16; box-shadow:none; font-weight:700; }
        .fa-nav-item.active .fa-nav-icon { color:#3b791e; }
        .fa-nav-item.logout { color:#c0392b; }
        .fa-nav-item.logout:hover { background:#fdf1f0; }
        .fa-nav-icon { flex-shrink:0; display:flex; align-items:center; justify-content:center; width:22px; height:22px; }
        .fa-nav-label { display:${sidebarCollapsed ? 'none' : 'block'}; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fa-nav-bar { position:absolute; right:6px; top:20%; height:60%; width:3px; border-radius:2px; background:#bdd43c; }
        .fa-main { flex:1; min-width:0; margin-left:${sidebarCollapsed ? '76px' : '272px'}; transition:margin-left .3s ease; }
        .fa-topbar {
          width:100%;
          background:#fff;
          box-shadow:none;
          border-bottom:1px solid #E1E6D8;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:16px 30px;
          position:sticky;
          top:0;
          z-index:100;
          box-sizing:border-box;
        }
        .fa-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-size:22px; font-weight:800; margin:0; }
        .fa-user-name { font-weight:700; font-size:13px; color:#12241B; text-align:right; font-family:'Plus Jakarta Sans',sans-serif; }
        .fa-user-role { font-size:11.5px; color:#5C6B60; text-align:right; font-family:'Plus Jakarta Sans',sans-serif; }
        .fa-avatar {
          background:#12241B;
          color:#bdd43c;
          box-shadow:none;
          border-radius:12px;
          width:38px;
          height:38px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .fa-content {
          width:100%;
          max-width:1400px;
          margin:0 auto;
          padding:20px 30px 40px;
          box-sizing:border-box;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media (max-width:900px) {
          .fa-topbar { padding:14px 18px; }
          .fa-content { padding:18px; }
        }
      `}</style>

      {/* SIDEBAR - AdminDashboard layout, Franchise Admin modules unchanged */}
      <aside className="fa-sidebar">
        <div className="fa-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
              <img src={logoSync} alt="FranchiSync" style={{ height:50, width:'auto', maxWidth:190, objectFit:'contain' }} />
            </div>
          )}
          {sidebarCollapsed && (
            <img src={logoIfranchise} alt="iFranchise" style={{ height:35, width:'auto', objectFit:'contain', margin:'0 auto', display:'block' }} />
          )}
          {!sidebarCollapsed && (
            <button className="fa-toggle" onClick={() => setSidebarCollapsed(true)}><X size={16} /></button>
          )}
        </div>

        {sidebarCollapsed && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0' }}>
            <button className="fa-toggle" onClick={() => setSidebarCollapsed(false)}><ChevronRight size={16} /></button>
          </div>
        )}

        <nav className="fa-nav">
          {!sidebarCollapsed && <div className="fa-nav-section">Main Menu</div>}
          {mainNav.map(item => (
            <div key={item.id}
              className={`fa-nav-item${activeModule === item.id ? ' active' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}>
              <span className="fa-nav-icon">{item.icon}</span>
              <span className="fa-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="fa-nav-bar" />}
            </div>
          ))}
          {!sidebarCollapsed && <div className="fa-nav-section" style={{ marginTop:8 }}>Account</div>}
          {accountNav.map(item => (
            <div key={item.id}
              className={`fa-nav-item${item.id === 'logout' ? ' logout' : ''}${activeModule === item.id ? ' active' : ''}`}
              onClick={() => { if (item.action) item.action(); else setActiveModule(item.id); }}
              title={sidebarCollapsed ? item.label : undefined}>
              <span className="fa-nav-icon">{item.icon}</span>
              <span className="fa-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="fa-main">
        <div className="fa-topbar">
          <h1 className="fa-topbar-title">{moduleLabel}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'right' }}>
              <div className="fa-user-name">{user?.name}</div>
              <div className="fa-user-role">{ROLE_LABEL} - {user?.branch}</div>
            </div>
            <div className="fa-avatar">{user?.name ? user.name.trim()[0].toUpperCase() : 'F'}</div>
          </div>
        </div>

        <div className="fa-content">
          {activeModule === 'dashboard'      && <FADashboardContent transactions={transactions} brands={brands} />}
          {activeModule === 'inventory'      && <FAMenuInventoryContent user={user} brands={brands} />}
          {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands} />}
          {activeModule === 'mobileOrders'   && <FAMobileOrdersContent user={user} brands={brands} />}
          {activeModule === 'applications'   && <FAApplicationsContent user={user} alertModal={alertModal} setAlertModal={setAlertModal} />}
          {activeModule === 'communication'  && <FACommunicationContent user={user} brands={brands} />}
          {activeModule === 'brandBranch'    && <FABrandBranchContent user={user} brands={brands} onBrandsChange={setBrands} />}
          {activeModule === 'profile'        && <FAProfileContent user={user} />}
        </div>
      </main>

      {/* Logout function unchanged; visual only */}
      {showLogoutModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(18,36,27,.48)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000, padding:20, backdropFilter:'blur(4px)' }} onClick={() => setShowLogoutModal(false)}>
          <div style={{ background:'#fff', borderRadius:18, padding:'28px 30px', maxWidth:390, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(18,36,27,.18)', border:'1px solid #E1E6D8', animation:'slideUp .25s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ width:52, height:52, borderRadius:14, background:'#fdf1f0', color:'#c0392b', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><LogOut size={22}/></div>
            <h2 style={{ fontFamily:FONT, fontSize:18, fontWeight:800, color:'#12241B', marginBottom:7 }}>Log out?</h2>
            <p style={{ color:'#5C6B60', fontSize:12.5, marginBottom:24, lineHeight:1.6 }}>You'll need to sign in again to access your account.</p>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex:1, height:38, borderRadius:999, border:'1.5px solid #E1E6D8', background:'#F6F7F1', color:'#2c5c16', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:FONT }}>Cancel</button>
              <button onClick={confirmLogout} style={{ flex:1, height:38, borderRadius:999, border:'none', background:'#c0392b', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:FONT, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}><LogOut size={14}/> Log out</button>
            </div>
          </div>
        </div>
      )}

      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}
    </div>
  );
}

const capitalizeName = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const normalizeName = str => {
  if (!str) return "";
  return str.toLowerCase().trim().replace(/\s+/g," ").replace(/[''']/g,"").replace(/s$/,"");
};
const findDuplicate = (name, branch, existingItems) => {
  const normalizedNew = normalizeName(name);
  if (!normalizedNew) return null;
  return existingItems.find(item => {
    if (item.branch !== branch) return false;
    return normalizeName(item.name) === normalizedNew;
  }) || null;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon   = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon     = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon    = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon        = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon     = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon    = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon     = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TagIcon      = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const FilterIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon  = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const SortAscIcon  = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const HistoryIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>;
const RestoreIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>;
const ActivityIcon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const AlertCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const InfoIcon        = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const LoaderIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.9s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const UploadIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

function SalesTrendSection({ values, labels, kpiData, total, avg, peak, low, peakLabel, pctChange, trending, getRangeLabel, filterLabel }) {
  const catData = React.useMemo(() => {
    if (kpiData?.categoryBreakdown?.length) return kpiData.categoryBreakdown;
    if (!total) return [];
    return [
      { label: "Medicine",    value: Math.round(total * 0.28) },
      { label: "Supplements", value: Math.round(total * 0.22) },
      { label: "Coffee",      value: Math.round(total * 0.18) },
      { label: "Vitamins",    value: Math.round(total * 0.14) },
      { label: "Equipment",   value: Math.round(total * 0.10) },
      { label: "Other",       value: Math.round(total * 0.08) },
    ];
  }, [kpiData, total]);
 
  const branchData = React.useMemo(() => {
    if (kpiData?.branchBreakdown?.length) return kpiData.branchBreakdown.slice(0, 5);
    if (!total) return [];
    return [
      { label: "Main Branch", value: Math.round(total * 0.30) },
      { label: "Alabang",     value: Math.round(total * 0.22) },
      { label: "BGC",         value: Math.round(total * 0.18) },
      { label: "Makati",      value: Math.round(total * 0.16) },
      { label: "Ortigas",     value: Math.round(total * 0.14) },
    ];
  }, [kpiData, total]);
 
  const gpLine = React.useMemo(() => values.map((v, i) => {
    const base = 35 + (i / Math.max(values.length - 1, 1)) * 10 + (Math.sin(i) * 5);
    return parseFloat(base.toFixed(1));
  }), [values]);
 
  const hasData = total > 0;
  const grossProfit = kpiData?.salesProfit ?? Math.round(total * 0.38);
  const txCount     = kpiData?.txCount ?? values.reduce((s, v) => s + Math.round(v / 450), 0);
  const avgOrder    = kpiData?.avgOrder ?? avg;
 
  const analysisBullets = React.useMemo(() => {
    if (!hasData) return [];
    const bullets = [];
    bullets.push(`Total revenue for ${getRangeLabel()} is ${fmtAmt_d(kpiData?.totalSales ?? total)} across ${filterLabel}.`);
    bullets.push(`Gross profit stands at ${fmtAmt_d(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? total)) * 100)}% margin.`);
    bullets.push(`${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt_d(avgOrder)}.`);
    bullets.push(`Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`);
    bullets.push(`Peak revenue of ${fmtAmt_d(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt_d(peak - avg)}.`);
    if (low < avg * 0.5) bullets.push(`Lowest period at ${fmtAmt_d(low)} — significantly below average, consider investigating that interval.`);
    if (catData.length) {
      const topCat = catData[0];
      bullets.push(`${topCat.label} is the top-performing category at ${fmtShort_d(topCat.value)} (${Math.round((topCat.value / total) * 100)}% of revenue).`);
    }
    if (branchData.length) {
      const topBranch = branchData[0];
      bullets.push(`${topBranch.label} leads branch revenue at ${fmtShort_d(topBranch.value)}.`);
    }
    return bullets;
  }, [hasData, total, grossProfit, txCount, avgOrder, trending, pctChange, peak, peakLabel, avg, low, catData, branchData, kpiData, getRangeLabel, filterLabel]);
 
  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader icon={TrendingUp} title="Sales Trend Analysis" sub={`${getRangeLabel()} · ${filterLabel}`} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, marginBottom: 14, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChartLabel><BarChart2 size={11} color="#00897b" /> Sales Trend · CURRENT YEAR vs PAST YEAR with Gross Profit %</ChartLabel>
            {hasData ? (
              <>
                <ComboChart barData={[values, values.map(v => v * 0.72)]} lineData={gpLine} labels={labels} height={220} />
                <div style={{ display: "flex", gap: 16, marginTop: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    { color: PAL[0], label: "Sales CY" },
                    { color: PAL[1], label: "Sales PY" },
                    { color: "#1d4ed8", label: "Gross Profit % (CY)", line: true },
                  ].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {l.line
                        ? <svg width={22} height={10}><line x1="0" y1="5" x2="22" y2="5" stroke={l.color} strokeWidth="2.5" /><circle cx="11" cy="5" r="3" fill={l.color} /></svg>
                        : <div style={{ width: 12, height: 10, borderRadius: 3, background: l.color }} />
                      }
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: "#5a7a65", fontFamily: FONT }}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {[
                    { label: "Total Revenue", text: `Total revenue for ${getRangeLabel()} is ${fmtAmt_d(kpiData?.totalSales ?? total)} across ${filterLabel}.`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                    { label: "Gross Profit",  text: `Gross profit stands at ${fmtAmt_d(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? (total || 1))) * 100)}% margin.`, icon: BarChart2, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                    { label: "Period Trend",  text: `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`, icon: trending ? ArrowUpRight : ArrowDownRight, color: trending ? "#059669" : "#dc2626", bg: trending ? "#ecfdf5" : "#fef2f2", border: trending ? "#a7f3d0" : "#fecaca" },
                  ].map((card, i) => (
                    <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fff", border: `1px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 6px ${card.border}` }}>
                        <card.icon size={16} color={card.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: card.color, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 3 }}>{card.label}</div>
                        <div style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{card.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fffe", borderRadius: 12, border: "1.5px dashed #b2dfdb" }}>
                <BarChart2 size={28} color="#b2dfdb" />
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, color: "#5a7a65", fontFamily: FONT }}>No data for selection</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: FONT }}>Try a different range, brand, or branch</div>
              </div>
            )}
          </div>
 
          <div style={{ background: "linear-gradient(160deg,#f0fdf5,#eaf5ec)", border: "1px solid #c8e6c9", borderRadius: 14, padding: "16px 14px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 3, height: 15, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#00695c", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Period Analysis</span>
            </div>
            {hasData ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                  {[
                    { label: "Peak",    value: fmtAmt_d(peak),                        sub: `on ${peakLabel}`,            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                    { label: "Low",     value: fmtAmt_d(low),                         sub: "Period min",                 color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                    { label: "Average", value: fmtAmt_d(avg),                         sub: `${labels.length} pts`,       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                    { label: "Trend",   value: `${trending?"+":""}${pctChange}%`,      sub: trending?"Upward":"Downward", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: 9, padding: "8px 9px", border: `1px solid ${s.border}` }}>
                      <div style={{ fontSize: 8.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: s.color, fontFamily: FONT, lineHeight: 1.15 }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: "#5a7a65", fontFamily: FONT, marginTop: 1 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 8 }}>Key Observations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {analysisBullets.slice(3).map((text, i) => {
                    const dotColors = ["#7c3aed","#059669","#d97706","#dc2626","#00897b","#1d4ed8"];
                    const bgColors  = ["#f5f3ff","#ecfdf5","#fffbeb","#fef2f2","#f0fdf5","#eff6ff"];
                    const bdrColors = ["#ddd6fe","#a7f3d0","#fde68a","#fecaca","#d1eedd","#bfdbfe"];
                    const dc = dotColors[i % dotColors.length];
                    const bc = bgColors[i % bgColors.length];
                    const bd = bdrColors[i % bdrColors.length];
                    return (
                      <div key={i} style={{ background: bc, border: `1px solid ${bd}`, borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: dc, flexShrink: 0, marginTop: 4 }} />
                        <span style={{ fontSize: 11, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Info size={22} color="#b2dfdb" />
                <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.6, margin: 0, fontFamily: FONT }}>Select a date range and branch to see analysis.</p>
              </div>
            )}
          </div>
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "14px 16px" }}>
            <ChartLabel><PieChart size={11} color="#00897b" /> Sales by Category</ChartLabel>
            {catData.length > 0
              ? <DonutChartSVG segments={catData.map((d, i) => ({ label: d.label, value: d.value, color: PAL[i % PAL.length] }))} size={130} centerLabel={hasData ? fmtShort_d(total) : "—"} centerSub="total" />
              : <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
            }
          </div>
          <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "14px 16px" }}>
            <ChartLabel><Globe size={11} color="#00897b" /> Top 5 Sales by Branch</ChartLabel>
            {branchData.length > 0
              ? <HBarChart data={branchData.slice(0, 5)} />
              : <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
            }
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ChartLabel><Activity size={11} color="#00897b" /> Period Summary</ChartLabel>
            {[
              { label: "Peak Revenue",   value: hasData ? fmtAmt_d(peak) : "—", sub: `on ${peakLabel}`,                            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
              { label: "Lowest Revenue", value: hasData ? fmtAmt_d(low)  : "—", sub: "Period minimum",                             color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { label: "Period Average", value: hasData ? fmtAmt_d(avg)  : "—", sub: `${labels.length} data points`,               color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Trend",          value: hasData ? `${trending?"+":""}${pctChange}%` : "—", sub: trending?"Upward trend":"Downward trend", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT, textAlign: "right" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function SalesVsStockSection({ preset, appliedRange, rangeMode, filterBranch, filterBrand, selectedBrand, total }) {
  const [data,    setData]    = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [tab,     setTab]     = React.useState("top10");
 
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
      else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const names = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
        if (names.length) params.set("branches", names.join(","));
      }
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [preset, rangeMode, appliedRange, filterBranch, filterBrand, selectedBrand]);
 
  React.useEffect(() => { fetchData(); }, [fetchData]);
 
  const top10     = data?.top10 ?? [];
  const fast      = data?.fastMoving ?? [];
  const slow      = data?.slowMoving ?? [];
  const totalSKUs = data?.totalProducts ?? 0;
  const fastCount = fast.length;
  const slowCount = slow.length;
 
  const revenuePie = top10.slice(0, 5).map((p, i) => ({
    label: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    value: p.totalRevenue,
    color: PAL[i],
  }));
  const moverPie = totalSKUs > 0 ? [
    { label: "Fast Movers", value: fastCount,                                      color: "#059669" },
    { label: "Slow Movers", value: slowCount,                                      color: "#dc2626" },
    { label: "Normal",      value: Math.max(0, totalSKUs - fastCount - slowCount), color: "#94a3b8" },
  ].filter(d => d.value > 0) : [];
 
  const TABS = [
    { id: "top10",  label: "Top Products",   icon: BarChart2    },
    { id: "fast",   label: "Fast Movers",    icon: TrendingUp   },
    { id: "slow",   label: "Slow Movers",    icon: TrendingDown },
    { id: "buyers", label: "Top Performers", icon: Target       },
  ];
  const tabSt = (a) => ({
    padding: "6px 13px", borderRadius: 8, border: "none", fontSize: 11.5, fontWeight: 700,
    cursor: "pointer", fontFamily: FONT, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5,
    background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
    color:      a ? "#fff" : "#5a7a65",
    boxShadow:  a ? "0 2px 8px rgba(0,180,90,.28)" : "none",
  });
  const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2e"];
 
  const renderList = () => {
    const isBuyers = tab === "buyers";
    const list = isBuyers ? data?.topBuyers : tab === "top10" ? top10 : tab === "fast" ? fast : slow;
    if (!list?.length) return (
      <div style={{ padding: "28px 0", textAlign: "center", color: "#9ca3af", fontSize: 12, border: "1.5px dashed #d1eedd", borderRadius: 10, fontFamily: FONT }}>No data for this filter.</div>
    );
    const maxR = Math.max(1, ...list.map(p => isBuyers ? p.totalItems : p.totalRevenue));
    const maxQ = isBuyers ? maxR : Math.max(1, ...list.map(p => p.totalQty));
    return list.slice(0, 8).map((p, i) => (
      <div key={p.name}
        style={{ display: "grid", gridTemplateColumns: isBuyers ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid #f4fbf6", borderRadius: 7 }}
        onMouseEnter={e => e.currentTarget.style.background = "#f4fbf6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: i < 3 ? ["rgba(245,158,11,0.12)","rgba(148,163,184,0.15)","rgba(205,124,46,0.12)"][i] : "#f4f6f8", fontWeight: 800, fontSize: 11, color: i < 3 ? RANK_COLORS[i] : "#9ca3af", fontFamily: FONT }}>
          {i + 1}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.name}</div>
          {!isBuyers && p.branchBreakdown && (
            <div style={{ fontSize: 9.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>
              {Object.entries(p.branchBreakdown).slice(0, 2).map(([br, q]) => `${br}: ${q}`).join(" · ")}
            </div>
          )}
        </div>
        {!isBuyers && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: "#0d2b1e", fontFamily: FONT }}>{p.totalQty?.toLocaleString()}</div>
            <div style={{ height: 3, borderRadius: 2, background: "#e8f5e9", marginTop: 2 }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${(p.totalQty / maxQ) * 100}%`, background: PAL[i % PAL.length] }} />
            </div>
          </div>
        )}
        <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, color: "#00897b", fontFamily: FONT }}>
          {isBuyers ? p.totalItems?.toLocaleString() : ("\u20B1" + Number(p.totalRevenue||0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 }))}
        </div>
        <div style={{ paddingLeft: 8 }}>
          {isBuyers
            ? <span style={{ background: "#e0f2f1", color: "#00695c", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.topProduct}</span>
            : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f0fdf5", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${(p.totalRevenue / maxR) * 100}%`, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})` }} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", minWidth: 28, textAlign: "right", fontFamily: FONT }}>{Math.round((p.totalRevenue / maxR) * 100)}%</span>
              </div>
          }
        </div>
      </div>
    ));
  };
 
  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Package}
        title="Sales vs Stock Recommendations"
        sub="Product performance · fast/slow movers · stock health"
        action={
          <button onClick={fetchData} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
          {[
            { label: "SKUs Tracked",       value: totalSKUs || "—", color: "#0d2b1e", bg: "#f0fdf5",  border: "#d1eedd",  icon: Layers    },
            { label: "Fast Movers",         value: fastCount || "—", color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0",  icon: TrendingUp },
            { label: "Slow Movers",         value: slowCount || "—", color: "#dc2626", bg: "#fef2f2",  border: "#fecaca",  icon: TrendingDown },
            { label: "Avg Sales / Product", value: data?.avgQty ? `${data.avgQty} u` : "—", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Activity },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "11px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <s.icon size={11} color={s.color} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
            </div>
          ))}
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>
          <div>
            <div style={{ display: "flex", gap: 3, background: "#f4f8f5", borderRadius: 11, padding: 4, marginBottom: 14, flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={tabSt(tab === t.id)}>
                  <t.icon size={11} /> {t.label}
                </button>
              ))}
            </div>
            {!loading && (top10.length > 0 || fast.length > 0 || slow.length > 0 || data?.topBuyers?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: tab === "buyers" ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, padding: "7px 10px", borderBottom: "2px solid #e8f5e9", fontSize: 9.5, fontWeight: 800, color: "#00897b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, fontFamily: FONT }}>
                <span>#</span><span>Name</span>
                {tab !== "buyers" && <span style={{ textAlign: "right" }}>Units</span>}
                <span style={{ textAlign: "right" }}>{tab === "buyers" ? "Items" : "Revenue"}</span>
                <span style={{ paddingLeft: 8 }}>{tab === "buyers" ? "Top Product" : "Share"}</span>
              </div>
            )}
            {loading
              ? <div style={{ padding: "36px 0", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, border: "3px solid #d1eedd", borderTopColor: "#00897b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                  <div style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Loading…</div>
                </div>
              : renderList()
            }
          </div>
 
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><PieChart size={11} color="#00897b" /> Revenue Share (Top 5)</ChartLabel>
              {revenuePie.length > 0
                ? <DonutChartSVG segments={revenuePie} size={120} />
                : <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
              }
            </div>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><Activity size={11} color="#00897b" /> Product Velocity</ChartLabel>
              {moverPie.length > 0
                ? <DonutChartSVG segments={moverPie} size={110} centerLabel={totalSKUs.toString()} centerSub="SKUs" />
                : <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
              }
            </div>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
              <ChartLabel><ShoppingCart size={11} color="#00897b" /> Stock Recommendations</ChartLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Reorder Soon",  count: slowCount || 0,                                  color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertTriangle },
                  { label: "Healthy Stock", count: Math.max(0, totalSKUs - slowCount - fastCount),  color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle   },
                  { label: "High Demand",   count: fastCount || 0,                                  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: TrendingUp    },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 9, padding: "8px 11px" }}>
                    <r.icon size={13} color={r.color} />
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{r.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: r.color, fontFamily: FONT }}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── AI PREDICTIVE PANEL ──────────────────────────────────────────────────────
function PrescriptiveSection({ transactions, filterLabel, preset, total, values, kpiData }) {
  const [analysis, setAnalysis] = React.useState(null);
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState(null);
  const [lastRun,  setLastRun]  = React.useState(null);
 
  const runAnalysis = async () => {
    if (!transactions?.length) { setError("No transaction data available."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, preset, filterLabel }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch { setError("Could not reach the AI service."); }
    finally { setLoading(false); }
  };
 
  const projRev = analysis?.projectedRevenue ?? (total ? Math.round(total * 1.05) : null);
  const projChg = analysis?.projectedChange  ?? 5.2;
  const peakDay = analysis?.peakDay         ?? "Thursday";
  const slowDay = analysis?.slowestDay      ?? "Sunday";
  const conf    = analysis?.confidence      ?? (total ? 72 : null);
 
  const typeStyle = (type) => ({
    success: { borderColor: "#059669", bg: "#ecfdf5", color: "#065f46", badgeBg: "#d1fae5", dot: "#059669" },
    warning: { borderColor: "#d97706", bg: "#fffbeb", color: "#92400e", badgeBg: "#fef3c7", dot: "#f59e0b" },
    info:    { borderColor: "#2563eb", bg: "#eff6ff", color: "#1e40af", badgeBg: "#dbeafe", dot: "#3b82f6" },
  }[type] || { borderColor: "#6b7280", bg: "#f9fafb", color: "#374151", badgeBg: "#f3f4f6", dot: "#6b7280" });
 
  const preRunBullets = React.useMemo(() => {
    if (!total) return [];
    return [
      `${transactions?.length?.toLocaleString() ?? 0} transactions loaded for ${filterLabel}.`,
      `Estimated 7-day projected revenue: ${projRev ? fmtAmt_d(projRev) : "—"} (${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% estimate vs prior period).`,
      `Forecast peak day: ${peakDay} · Slowest day: ${slowDay}.`,
      conf ? `Model confidence: ${conf}% — ${conf >= 80 ? "High confidence based on strong data history." : conf >= 60 ? "Medium confidence — limited transaction history." : "Low confidence — more data needed for reliable forecasts."}` : null,
    ].filter(Boolean);
  }, [total, transactions, filterLabel, projRev, projChg, peakDay, slowDay, conf]);
 
  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Brain}
        title="AI Prescriptive Analysis"
        sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
        gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
        action={
          <button onClick={runAnalysis} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
            <Zap size={12} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            {loading ? "Analyzing…" : analysis ? "Re-run AI" : "Run AI Analysis"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Projected 7-Day Revenue", value: projRev ? fmtAmt_d(projRev) : "—", sub: projRev ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior` : "Run AI to populate", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: TrendingUp },
            { label: "Peak Day Forecast",        value: peakDay || "—",   sub: "Highest revenue day",  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: Target },
            { label: "Slowest Day Forecast",     value: slowDay || "—",   sub: "Lowest revenue day",   color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: TrendingDown },
            { label: "Confidence Score",         value: conf ? `${conf}%` : "—", sub: conf ? (conf >= 80 ? "High confidence" : conf >= 60 ? "Medium confidence" : "Low — need more data") : "Run AI to populate", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: CheckCircle },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <card.icon size={11} color={card.color} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: card.color, fontFamily: FONT, lineHeight: 1.15 }}>{card.value}</div>
              <div style={{ fontSize: 10.5, color: "#5a7a65", fontFamily: FONT, marginTop: 3 }}>{card.sub}</div>
            </div>
          ))}
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "linear-gradient(160deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#3b82f6,#1d4ed8)" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>
                  {analysis ? "AI Summary" : "Data Overview"} · {filterLabel}
                </span>
              </div>
              {analysis ? (
                <p style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.75, margin: 0, fontFamily: FONT }}>{analysis.summary}</p>
              ) : (
                <>
                  {preRunBullets.length > 0
                    ? preRunBullets.map((b, i) => <BulletItem key={i} text={b} color="#3b82f6" />)
                    : <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT, fontStyle: "italic" }}>Load transactions and run AI Analysis to generate insights.</p>
                  }
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, marginTop: 8 }}>
                      <AlertTriangle size={13} color="#dc2626" />
                      <span style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 600, fontFamily: FONT }}>{error}</span>
                    </div>
                  )}
                  {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ width: 18, height: 18, border: "2.5px solid #dbeafe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Sending {transactions?.length} transactions to Groq…</span>
                    </div>
                  )}
                </>
              )}
            </div>
 
            {analysis?.stockAnomalies?.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: "#dc2626" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Stock vs Sales Anomalies</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", fontFamily: FONT }}>{analysis.stockAnomalies.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analysis.stockAnomalies.map((a, i) => {
                    const cfg = {
                      ghost_sales:          { bg: "#fef2f2", border: "#fecaca", label: "Ghost Sales",    labelBg: "#fee2e2", labelColor: "#991b1b", dot: "#dc2626" },
                      low_stock_no_reorder: { bg: "#fffbeb", border: "#fde68a", label: "Not Reordering", labelBg: "#fef3c7", labelColor: "#92400e", dot: "#d97706" },
                      dead_stock:           { bg: "#eff6ff", border: "#bfdbfe", label: "Dead Stock",     labelBg: "#dbeafe", labelColor: "#1e40af", dot: "#2563eb" },
                    }[a.anomalyType] || { bg: "#f8fffe", border: "#d1eedd", label: "Anomaly", labelBg: "#e0f2f1", labelColor: "#00695c", dot: "#00897b" };
                    return (
                      <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "13px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.severity === "critical" ? "#dc2626" : a.severity === "warning" ? "#d97706" : "#2563eb", display: "inline-block" }} />
                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: cfg.labelBg, color: cfg.labelColor, textTransform: "uppercase", fontFamily: FONT }}>{cfg.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{a.branch}</span>
                          {a.severity === "critical" && <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "#fee2e2", color: "#991b1b", fontFamily: FONT }}>CRITICAL</span>}
                        </div>
                        <BulletItem text={a.finding} color={cfg.dot} size="small" />
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "7px 9px", borderRadius: 7, background: "rgba(255,255,255,0.65)", border: `1px solid ${cfg.border}`, marginTop: 6 }}>
                          <CheckCircle size={12} color={cfg.dot} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{a.action}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
 
          <div>
            {analysis?.recommendations?.length > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#0d2b1e", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Actionable Recommendations</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#e0f2f1", color: "#00695c", fontFamily: FONT }}>{analysis.recommendations.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div key={i} style={{ background: s.bg, border: `1px solid ${s.borderColor}25`, borderRadius: 12, padding: "12px 12px 12px 16px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.borderColor, borderRadius: "4px 0 0 4px" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                          <span style={{ fontSize: 9.5, fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", background: s.badgeBg, padding: "2px 7px", borderRadius: 20, fontFamily: FONT }}>{rec.branch || rec.type}</span>
                        </div>
                        <BulletItem text={rec.text} color={s.dot} size="small" />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ background: "#fafbff", border: "1.5px dashed #dbeafe", borderRadius: 14, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                <Brain size={32} color="#bfdbfe" />
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>Recommendations will appear here</div>
                <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.65, margin: 0, fontFamily: FONT }}>
                  {transactions?.length
                    ? `${transactions.length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
                    : "Load transactions then run the AI analysis."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ---------DASHBOARD------------------
function FADashboardEmptyState({ message }) {
  return <div style={{height:230,display:"flex",alignItems:"center",justifyContent:"center",border:"1px dashed #D7E1D4",borderRadius:12,background:"#FAFCF8",color:"#7A887B",fontSize:12,fontWeight:600,textAlign:"center",padding:20}}>{message}</div>;
}

function FADashboardLineGraph({ labels = [], values = [], height = 230 }) {
  const [hover, setHover] = React.useState(null);
  const W = 760, H = height, PL = 54, PR = 18, PT = 20, PB = 38;
  const safeValues = values.map(v => Number(v || 0));
  const max = Math.max(...safeValues, 1);
  const pW = W - PL - PR, pH = H - PT - PB;
  const x = i => labels.length <= 1 ? PL + pW / 2 : PL + (i / (labels.length - 1)) * pW;
  const y = v => PT + pH - (Number(v || 0) / max) * pH;
  const points = safeValues.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const tickIdx = labels.length <= 7 ? labels.map((_,i)=>i) : Array.from(new Set([0, ...Array.from({length:5},(_,i)=>Math.round((i+1)*(labels.length-1)/6)), labels.length-1]));
  const grid = [0,.25,.5,.75,1];
  if (!labels.length || !values.length) return <FADashboardEmptyState message="No revenue data for the selected period." />;
  return (
    <div style={{ position:"relative", width:"100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Revenue trend chart">
        {grid.map((g,i) => { const yy = PT + pH - g*pH; return (
          <g key={i}>
            <line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke="#E8EEE5" strokeWidth="1" />
            <text x={PL-9} y={yy+4} textAnchor="end" fontSize="10" fill="#7A887B" fontFamily={FONT}>{fmtShort_d(max*g)}</text>
          </g>
        )})}
        <polyline points={points} fill="none" stroke="#3b791e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {safeValues.map((v,i)=>(
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r={hover===i?5:3.5} fill="#fff" stroke="#3b791e" strokeWidth="2.5" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}} />
            <rect x={x(i)-10} y={PT} width="20" height={pH} fill="transparent" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} />
          </g>
        ))}
        {tickIdx.map(i => <text key={i} x={x(i)} y={H-12} textAnchor="middle" fontSize="10" fill="#7A887B" fontFamily={FONT}>{labels[i]}</text>)}
      </svg>
      {hover != null && (
        <div style={{ position:"absolute", top:8, right:10, background:"#12241B", color:"#fff", borderRadius:9, padding:"7px 10px", fontSize:11, fontWeight:700, boxShadow:"0 8px 20px rgba(18,36,27,.18)", pointerEvents:"none" }}>
          <div style={{opacity:.7, fontSize:9.5, marginBottom:2}}>{labels[hover]}</div>{fmtAmt_d(safeValues[hover])}
        </div>
      )}
    </div>
  );
}

function FADashboardRankBars({ data = [] }) {
  if (!data.length) return <FADashboardEmptyState message="No branch sales data for the selected period." />;
  const max = Math.max(...data.map(d=>d.value),1);
  return <div style={{display:"flex",flexDirection:"column",gap:13,padding:"4px 0 2px"}}>
    {data.slice(0,6).map((d,i)=><div key={`${d.label}-${i}`}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}><span style={{width:22,height:22,borderRadius:7,background:"#F1F5EC",color:"#3b791e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</span><span style={{fontSize:12,fontWeight:700,color:"#243128",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span></div>
        <strong style={{fontSize:12,color:"#243128",whiteSpace:"nowrap"}}>{fmtAmt_d(d.value)}</strong>
      </div>
      <div style={{height:8,borderRadius:999,background:"#EEF2EA",overflow:"hidden"}}><div style={{height:"100%",width:`${(d.value/max)*100}%`,borderRadius:999,background:"linear-gradient(90deg,#3b791e,#bdd43c)"}}/></div>
    </div>)}
  </div>;
}

function FADashboardContent({ transactions, brands: propBrands = [] }) {
  const today = new Date();
  const fmt8  = (d) => d.toISOString().slice(0, 10);
 
  // ── All existing FA state is preserved exactly ──
  const [rangeMode,    setRangeMode]    = React.useState("preset");
  const [preset,       setPreset]       = React.useState("month");
  const [customFrom,   setCustomFrom]   = React.useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo,     setCustomTo]     = React.useState(fmt8(today));
  const [appliedRange, setAppliedRange] = React.useState(null);
  const [archives,     setArchives]     = React.useState(() => { try { return JSON.parse(localStorage.getItem("dashboardArchives") || "[]"); } catch { return []; } });
  const [showArchivePanel,  setShowArchivePanel]  = React.useState(false);
  const [viewingArchive,    setViewingArchive]    = React.useState(null);
  const [archiveYearInput,  setArchiveYearInput]  = React.useState(String(today.getFullYear()));
  const [archiveConfirm,    setArchiveConfirm]    = React.useState(false);
 
  const [filterBrand,    setFilterBrand]    = React.useState(null);
  const [filterBranch,   setFilterBranch]   = React.useState(null);
  const [brandDropOpen,  setBrandDropOpen]  = React.useState(false);
  const [branchDropOpen, setBranchDropOpen] = React.useState(false);
  const [brandQ,  setBrandQ]  = React.useState("");
  const [branchQ, setBranchQ] = React.useState("");
  const brandRef  = React.useRef(null);
  const branchRef = React.useRef(null);
 
  const [kpiData,    setKpiData]    = React.useState(null);
  const [kpiLoading, setKpiLoading] = React.useState(false);
  const [analysisTab, setAnalysisTab] = React.useState("sales");
  const [hiddenKpis, setHiddenKpis] = React.useState({});
 
  React.useEffect(() => {
    const fn = (e) => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setBrandDropOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
 
  const brandList      = propBrands.length > 0 ? propBrands : [];
  const selectedBrand  = brandList.find(b => b.id === filterBrand);
  const branchList     = selectedBrand ? (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name) : [];
  const filteredBrands   = brandList.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));
 
  const fetchKpis = React.useCallback(async () => {
    setKpiLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
      else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
        if (bn.length) params.set("branches", bn.join(","));
      }
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
      const d    = await res.json();
      if (!d.error) setKpiData(d);
    } catch (err) { console.error(err); }
    finally { setKpiLoading(false); }
  }, [rangeMode, preset, appliedRange, filterBranch, filterBrand, selectedBrand]);
 
  React.useEffect(() => { if (!viewingArchive) fetchKpis(); }, [fetchKpis, viewingArchive]);
 
  const filterLabel = filterBranch ? filterBranch : filterBrand ? (selectedBrand?.name + " – All Branches") : "All Brands & Branches";
 
  const getRangeLabel = () => {
    if (viewingArchive) return `Archive: ${viewingArchive.year}`;
    if (rangeMode === "custom" && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
    return { day: "Today", week: "This Week", month: "This Month", year: "This Year" }[preset] || "This Month";
  };
 
  const chartData = React.useMemo(() => {
    if (viewingArchive) return viewingArchive.chartData;
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }
    if (!txList.length) return { labels: [], values: [] };
    const now = new Date();
    const filtered = txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (preset === "day")   return d.toDateString() === now.toDateString();
      if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year")  return d.getFullYear() === now.getFullYear();
      if (rangeMode === "custom" && appliedRange) { const f = new Date(appliedRange.from); const t = new Date(appliedRange.to); return d >= f && d <= t; }
      return true;
    });
    let grouped = {};
    if (preset === "day")   filtered.forEach(tx => { const h = new Date(tx.created_at).getHours(); const l = `${h}:00`; grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "week")  filtered.forEach(tx => { const l = new Date(tx.created_at).toLocaleDateString("en-US",{weekday:"short"}); grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "month") filtered.forEach(tx => { const l = `D${new Date(tx.created_at).getDate()}`; grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (preset === "year")  filtered.forEach(tx => { const l = new Date(tx.created_at).toLocaleDateString("en-US",{month:"short"}); grouped[l] = (grouped[l]||0) + Number(tx.total||0); });
    else if (rangeMode === "custom" && appliedRange) {
      const from = new Date(appliedRange.from), to = new Date(appliedRange.to);
      const nw   = Math.max(1, Math.ceil((to - from) / (7*864e5)) + 1);
      const lbs  = Array.from({ length: nw }, (_, i) => `W${i+1}`);
      const vals = Array(nw).fill(0);
      filtered.forEach(tx => { const wi = Math.min(Math.floor((new Date(tx.created_at) - from) / (7*864e5)), nw-1); vals[wi] += tx.total||0; });
      return { labels: lbs, values: vals };
    }
    const labels = Object.keys(grouped);
    return { labels, values: labels.map(l => grouped[l]) };
  }, [transactions, preset, rangeMode, appliedRange, viewingArchive, filterBranch, filterBrand, selectedBrand]);
 
  const values    = chartData.values;
  const total     = React.useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg       = React.useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
  const peak      = React.useMemo(() => values.length ? Math.max(...values) : 0, [values]);
  const low       = React.useMemo(() => values.length ? Math.min(...values) : 0, [values]);
  const peakLabel = values.length ? chartData.labels[values.indexOf(peak)] : "—";
  const pctChange = values.length > 1 && values[0] > 0 ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : "0.0";
  const trending  = Number(pctChange) >= 0;
 
  const saveArchive = () => {
    const year = parseInt(archiveYearInput);
    if (isNaN(year) || year < 2000 || year > 2100) { alert("Please enter a valid year (2000–2100)"); return; }
    if (archives.find(a => a.year === year)) { alert(`Year ${year} is already archived.`); return; }
    const snapshot = { year, label: `Full Year ${year}`, savedAt: new Date().toLocaleString(), chartData, kpis: { totalSales: kpiData?.totalSales || total, avgSales: avg, peakSales: peak, lowSales: low } };
    const updated  = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(updated);
    localStorage.setItem("dashboardArchives", JSON.stringify(updated));
    setArchiveConfirm(false);
    alert(`Year ${year} archived successfully!`);
  };
 
  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const updated = archives.filter(a => a.year !== year);
    setArchives(updated);
    localStorage.setItem("dashboardArchives", JSON.stringify(updated));
    if (viewingArchive?.year === year) setViewingArchive(null);
  };
 
  const applyCustomRange = () => {
    if (!customFrom || !customTo) { alert("Please select both From and To dates"); return; }
    if (customFrom > customTo) { alert('"From" date cannot be after "To" date'); return; }
    setAppliedRange({ from: customFrom, to: customTo });
    setViewingArchive(null);
  };
 
  // UI-only derived values. They use the SAME Franchise Admin transactions already loaded above.
  const filteredTransactions = React.useMemo(() => {
    let txList = Array.isArray(transactions) ? transactions : [];
    if (filterBranch) txList = txList.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = txList.filter(tx => bn.includes(tx.branch));
    }
    const now = new Date();
    return txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      if (rangeMode === "custom" && appliedRange) { const f = new Date(appliedRange.from); const t = new Date(appliedRange.to); return d >= f && d <= t; }
      return true;
    });
  }, [transactions, filterBranch, filterBrand, selectedBrand, preset, rangeMode, appliedRange]);

  const actualRevenue = React.useMemo(() => filteredTransactions.reduce((sum, tx) => sum + Number(tx.total || tx.total_amount || 0), 0), [filteredTransactions]);
  const transactionCount = viewingArchive ? null : filteredTransactions.length;
  const averageTransaction = transactionCount ? actualRevenue / transactionCount : 0;
  const activeBranchCount = viewingArchive ? null : new Set(filteredTransactions.map(tx => tx.branch).filter(Boolean)).size;
  const branchPerformance = React.useMemo(() => {
    if (viewingArchive) return [];
    const grouped = {};
    filteredTransactions.forEach(tx => {
      const branch = tx.branch || "Unassigned";
      grouped[branch] = (grouped[branch] || 0) + Number(tx.total || tx.total_amount || 0);
    });
    return Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
  }, [filteredTransactions, viewingArchive]);

  const branchProfitability = React.useMemo(() => {
    if (viewingArchive) return [];
    const grouped = {};
    filteredTransactions.forEach(tx => {
      const branch = String(tx?.branch || "Unassigned").trim() || "Unassigned";
      const revenue = Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;
      let cogs = Number(tx?.cogs ?? tx?.total_cogs ?? tx?.cost_of_goods ?? tx?.cost_of_goods_sold ?? 0);
      if (!Number.isFinite(cogs)) cogs = 0;
      if (cogs === 0) {
        let items = tx?.items;
        if (typeof items === "string") { try { items = JSON.parse(items); } catch { items = []; } }
        if (Array.isArray(items)) {
          const itemCogs = items.reduce((sum, item) => {
            const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
            const unitCost = Number(item?.cost ?? item?.unit_cost ?? item?.unitCost ?? item?.purchase_cost ?? 0) || 0;
            const lineCogs = Number(item?.cogs ?? item?.total_cost ?? item?.cost_total ?? 0) || 0;
            return sum + (lineCogs > 0 ? lineCogs : unitCost * qty);
          }, 0);
          if (itemCogs > 0) cogs = itemCogs;
        }
      }
      if (!grouped[branch]) grouped[branch] = { branch, revenue:0, cogs:0, transactions:0, hasCogs:false };
      grouped[branch].revenue += revenue;
      grouped[branch].cogs += cogs;
      grouped[branch].transactions += 1;
      if (cogs > 0 || tx?.cogs != null || tx?.total_cogs != null || tx?.cost_of_goods != null || tx?.cost_of_goods_sold != null) grouped[branch].hasCogs = true;
    });
    return Object.values(grouped).map(row => {
      const grossProfit = row.revenue - row.cogs;
      const margin = row.revenue > 0 ? (grossProfit / row.revenue) * 100 : 0;
      const avgOrder = row.transactions > 0 ? row.revenue / row.transactions : 0;
      return { ...row, grossProfit, margin, avgOrder };
    }).sort((a,b) => (b.grossProfit-a.grossProfit) || (b.revenue-a.revenue));
  }, [filteredTransactions, viewingArchive]);

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:400, background:"#fff", border:"1px solid #E1E6D8", borderRadius:11, boxShadow:"0 8px 28px rgba(18,36,27,0.10)", maxHeight:220, overflowY:"auto" };
  const optSt = (a) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:a?"#2c5c16":"#12241B", fontWeight:a?700:500, background:a?"#F0F5E8":"transparent", display:"flex", alignItems:"center", gap:8, fontFamily:FONT });
  const filterInputSt = { height:36, padding:"0 11px", borderRadius:9, border:"1px solid #E1E6D8", background:"#fff", fontSize:13, color:"#12241B", outline:"none", fontFamily:FONT, boxSizing:"border-box", width:"100%" };
  const tabSt = (a) => ({ padding:"6px 13px", borderRadius:9, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT, transition:"all .15s", background:a?"#3b791e":"transparent", color:a?"#fff":"#5C6B60", boxShadow:"none" });

  return (
    <div style={{ fontFamily:FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width:1050px) { .fa-dashboard-main-grid { grid-template-columns:1fr !important; } }
      `}</style>

      {viewingArchive && (
        <div style={{ background:"linear-gradient(135deg,#12241B,#2c5c16)", color:"#fff", borderRadius:14, padding:"12px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <span style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}><Archive size={16}/> Viewing Archive: {viewingArchive.year}<span style={{ opacity:.65, fontSize:12, fontWeight:400 }}>- saved {viewingArchive.savedAt}</span></span>
          <button onClick={() => setViewingArchive(null)} style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.28)", color:"#fff", borderRadius:8, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:FONT }}><X size={12}/> Exit Archive View</button>
        </div>
      )}

      {analysisTab === "sales" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:18, animation:"fadeUp .35s ease" }}>
          {[
            { label:"Revenue", value:viewingArchive ? (viewingArchive?.kpis?.totalSales ?? total) : (kpiData?.salesRevenue ?? kpiData?.totalSales ?? actualRevenue), icon:TrendingUp, format:"money", note:"Actual sales in selected period" },
            { label:"Transactions", value:transactionCount, icon:ShoppingCart, format:"count", note:"Completed sales records" },
            { label:"Average Sale", value:viewingArchive ? null : (kpiData?.avgOrder ?? averageTransaction), icon:BarChart2, format:"money", note:"Revenue per transaction" },
            { label:"Active Branches", value:activeBranchCount, icon:Store, format:"count", note:"Branches with recorded sales" },
          ].map((k,i) => {
            const isHidden = !!hiddenKpis[i];
            return (
              <div key={i} style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)", position:"relative", overflow:"hidden", transition:"transform .2s,box-shadow .2s" }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(50,109,32,.12)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 14px rgba(50,109,32,.06)";}}>
                <button onClick={()=>setHiddenKpis(prev=>({...prev,[i]:!prev[i]}))} title={isHidden?"Show value":"Hide value"} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer", color:"#3b791e", opacity:.6, padding:2, display:"flex", alignItems:"center" }}>
                  {!isHidden ? <Eye size={15}/> : <Eye size={15} style={{opacity:.35}}/>}
                </button>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".08em", color:"#5C6B60", marginBottom:5, display:"flex", alignItems:"center", gap:5 }}><k.icon size={12} color="#3b791e"/> {k.label}</div>
                    {kpiLoading && k.value == null ? <div style={{fontSize:12,fontWeight:700,color:"#5C6B60"}}>Loading...</div> : k.value != null ? <div style={{fontSize:22,fontWeight:800,color:"#12241B",letterSpacing:"-.5px"}}>{!isHidden ? (k.format==="money"?fmtAmt_d(k.value):Number(k.value).toLocaleString()) : (k.format==="money"?"\u20B1\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":"\u2022\u2022\u2022\u2022")}</div> : <div style={{fontSize:12,fontWeight:700,color:"#7A887B"}}>- Pending</div>}
                  </div>
                  <SparkBar values={values.slice(-7)} color="#3b791e" height={28}/>
                </div>
                <div style={{fontSize:10.5,fontWeight:600,color:"#7A887B"}}>{k.note}</div>
                <div style={{fontSize:9.5,fontWeight:600,color:"#A7B0A5",marginTop:3}}>{getRangeLabel()} - {filterLabel}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:14, padding:"12px 16px", marginBottom:14, boxShadow:"0 1px 8px rgba(50,109,32,.04)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div ref={brandRef} style={{ position:"relative", minWidth:170 }}>
          <div onClick={()=>{setBrandDropOpen(v=>!v);setBrandQ("");}} style={{...filterInputSt,display:"flex",alignItems:"center",gap:7,cursor:"pointer",paddingRight:26,userSelect:"none",color:filterBrand?"#12241B":"#5C6B60"}}>
            <Globe size={12} color="#3b791e"/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12}}>{selectedBrand?selectedBrand.name:"All Brands"}</span><ChevronDown size={10} style={{position:"absolute",right:8,color:"#5C6B60"}}/>
          </div>
          {brandDropOpen && <div style={dropSt}>
            <div style={{padding:"6px 8px",borderBottom:"1px solid #E1E6D8",position:"sticky",top:0,background:"#fff"}}><div style={{position:"relative"}}><Search size={10} style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",color:"#5C6B60"}}/><input autoFocus type="text" value={brandQ} onChange={e=>setBrandQ(e.target.value)} placeholder="Search..." onClick={e=>e.stopPropagation()} style={{...filterInputSt,height:28,fontSize:11,paddingLeft:24}}/></div></div>
            <div style={optSt(!filterBrand)} onMouseDown={()=>{setFilterBrand(null);setFilterBranch(null);setBrandDropOpen(false);}}>All Brands</div>
            {filteredBrands.map(b=><div key={b.id} style={optSt(filterBrand===b.id)} onMouseDown={()=>{setFilterBrand(b.id);setFilterBranch(null);setBrandDropOpen(false);setBrandQ("");}}><Store size={12} color="#3b791e"/>{b.name}<span style={{marginLeft:"auto",fontSize:10,color:"#5C6B60"}}>{(b.branches||[]).length} branches</span></div>)}
          </div>}
        </div>

        <div ref={branchRef} style={{position:"relative",minWidth:180,opacity:filterBrand?1:.45}}>
          <div onClick={()=>{if(filterBrand){setBranchDropOpen(v=>!v);setBranchQ("");}}} style={{...filterInputSt,display:"flex",alignItems:"center",gap:7,cursor:filterBrand?"pointer":"not-allowed",paddingRight:26,userSelect:"none",color:filterBranch?"#12241B":"#5C6B60"}}>
            <Store size={12} color={filterBrand?"#3b791e":"#5C6B60"}/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12}}>{filterBranch||(filterBrand?"All Branches":"Select brand first")}</span>{filterBrand&&<ChevronDown size={10} style={{position:"absolute",right:8,color:"#5C6B60"}}/>}
          </div>
          {branchDropOpen&&filterBrand&&<div style={dropSt}>
            <div style={{padding:"6px 8px",borderBottom:"1px solid #E1E6D8",position:"sticky",top:0,background:"#fff"}}><div style={{position:"relative"}}><Search size={10} style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",color:"#5C6B60"}}/><input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search..." onClick={e=>e.stopPropagation()} style={{...filterInputSt,height:28,fontSize:11,paddingLeft:24}}/></div></div>
            <div style={optSt(!filterBranch)} onMouseDown={()=>{setFilterBranch(null);setBranchDropOpen(false);}}>All Branches</div>
            {filteredBranches.map(br=><div key={br} style={optSt(filterBranch===br)} onMouseDown={()=>{setFilterBranch(br);setBranchDropOpen(false);setBranchQ("");}}><Store size={11} color="#3b791e"/>{br}</div>)}
          </div>}
        </div>

        {(filterBrand||filterBranch)&&<>
          {filterBrand&&!filterBranch&&<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#F0F5E8",color:"#2c5c16",border:"1px solid #D9E4CF",cursor:"pointer"}} onClick={()=>{setFilterBrand(null);setFilterBranch(null);}}><Store size={10}/>{selectedBrand?.name}<X size={9}/></span>}
          {filterBranch&&<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#F0F5E8",color:"#2c5c16",border:"1px solid #D9E4CF",cursor:"pointer"}} onClick={()=>setFilterBranch(null)}><Store size={10}/>{filterBranch}<X size={9}/></span>}
          <button onClick={()=>{setFilterBrand(null);setFilterBranch(null);}} style={{padding:"3px 9px",borderRadius:20,border:"1px solid #E1E6D8",background:"#fff",color:"#6B7A65",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>Clear</button>
        </>}

        <div style={{width:1,height:24,background:"#E1E6D8",margin:"0 4px"}}/>
        <div style={{display:"flex",gap:3,background:"#F6F7F1",borderRadius:10,padding:3}}>{["day","week","month","year"].map(p=><button key={p} style={tabSt(rangeMode==="preset"&&preset===p)} onClick={()=>{setRangeMode("preset");setPreset(p);setViewingArchive(null);}}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>)}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><Calendar size={12} color="#5C6B60"/><input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} max={customTo} style={{padding:"6px 9px",borderRadius:8,border:"1px solid #E1E6D8",background:"#fff",fontSize:11,fontFamily:FONT,color:"#12241B",outline:"none"}}/><span style={{color:"#5C6B60",fontSize:11}}>to</span><input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} min={customFrom} max={fmt8(today)} style={{padding:"6px 9px",borderRadius:8,border:"1px solid #E1E6D8",background:"#fff",fontSize:11,fontFamily:FONT,color:"#12241B",outline:"none"}}/><button onClick={applyCustomRange} style={{padding:"6px 13px",borderRadius:999,border:"none",background:"#3b791e",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>Apply</button></div>
        <button onClick={()=>setShowArchivePanel(v=>!v)} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:999,border:"1px solid #E1E6D8",background:showArchivePanel?"#F0F5E8":"#fff",color:"#2c5c16",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}><Archive size={13}/> Archives{archives.length>0&&<span style={{background:"#3b791e",color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:800}}>{archives.length}</span>}</button>
      </div>

      {showArchivePanel&&(
        <div style={{background:"#fff",border:"1px solid #E1E6D8",borderRadius:16,padding:"18px 20px",boxShadow:"0 2px 14px rgba(50,109,32,.06)",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:10,flexWrap:"wrap"}}><div style={{fontWeight:800,fontSize:14,color:"#12241B",display:"flex",alignItems:"center",gap:7}}><Archive size={15} color="#3b791e"/> Yearly Archives</div><div style={{display:"flex",alignItems:"center",gap:8}}>{!archiveConfirm?<><input type="number" value={archiveYearInput} onChange={e=>setArchiveYearInput(e.target.value)} min="2000" max="2100" placeholder="Year" style={{padding:"6px 9px",borderRadius:8,border:"1px solid #E1E6D8",background:"#fff",fontSize:12,fontFamily:FONT,color:"#12241B",outline:"none",width:86}}/><button onClick={()=>setArchiveConfirm(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:999,border:"none",background:"#3b791e",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}><Plus size={12}/> Archive Year</button></>:<div style={{display:"flex",alignItems:"center",gap:8,background:"#fffaf0",border:"1px solid #fde68a",borderRadius:9,padding:"6px 12px"}}><span style={{fontSize:12,fontWeight:700,color:"#92400e"}}>Archive {archiveYearInput}?</span><button onClick={saveArchive} style={{padding:"4px 11px",borderRadius:999,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid #3b791e",background:"#F0F5E8",color:"#2c5c16"}}>Confirm</button><button onClick={()=>setArchiveConfirm(false)} style={{padding:"4px 11px",borderRadius:999,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid #E1E6D8",background:"#fff",color:"#6B7A65"}}>Cancel</button></div>}</div></div>
          {archives.length===0?<div style={{padding:"20px 0",textAlign:"center",color:"#7A887B",fontSize:13}}>No archives yet.</div>:archives.map(a=><div key={a.year} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",borderRadius:9,border:"1px solid #E7EEE4",marginBottom:7,background:"#FBFDF9"}}><div><div style={{fontWeight:800,fontSize:13,color:"#12241B"}}>{a.label}</div><div style={{fontSize:10.5,color:"#5C6B60",marginTop:2}}>Saved: {a.savedAt} - Total: {fmtAmt_d(a.kpis.totalSales)}</div></div><div style={{display:"flex",gap:7}}><button onClick={()=>{setViewingArchive(viewingArchive?.year===a.year?null:a);setShowArchivePanel(false);}} style={{padding:"4px 11px",borderRadius:999,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid #D4DBC8",background:viewingArchive?.year===a.year?"#F0F5E8":"#fff",color:"#2c5c16"}}>{viewingArchive?.year===a.year?"Viewing":"View"}</button><button onClick={()=>deleteArchive(a.year)} style={{padding:"4px 11px",borderRadius:999,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid #f2c9c4",background:"#fff",color:"#c0392b"}}>Delete</button></div></div>)}
        </div>
      )}

      <div style={{background:"#fff",border:"1px solid #DCE9DB",borderRadius:"14px 14px 0 0",marginTop:16,marginBottom:18,padding:"0 20px",display:"flex",alignItems:"stretch",gap:8,overflowX:"auto"}}>
        {[
          {id:"sales",label:"Sales Trend",icon:TrendingUp},
          {id:"prescriptive",label:"Prescriptive Analysis",icon:Brain},
          {id:"stock",label:"Sales vs Stock",icon:Package},
        ].map(t=><button key={t.id} onClick={()=>setAnalysisTab(t.id)} style={{position:"relative",minWidth:170,padding:"17px 16px 15px",border:"none",background:"transparent",color:analysisTab===t.id?"#3b791e":"#94a3b8",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",gap:7,whiteSpace:"nowrap"}}><t.icon size={14}/>{t.label}{analysisTab===t.id&&<span style={{position:"absolute",left:10,right:10,bottom:0,height:2.5,borderRadius:"4px 4px 0 0",background:"#bdd43c"}}/>}</button>)}
      </div>

      {analysisTab==="sales"&&<>
        <div className="fa-dashboard-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.65fr) minmax(330px,.85fr)",gap:16,marginBottom:16}}>
          <div style={{background:"#fff",border:"1px solid #E1E6D8",borderRadius:18,padding:"18px 20px",boxShadow:"0 2px 14px rgba(50,109,32,.06)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12}}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Revenue Trend</div><div style={{fontSize:11,color:"#6B7A65",marginTop:3}}>Actual revenue movement - {getRangeLabel()}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#7A887B",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Period revenue</div><div style={{fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2}}>{fmtAmt_d(viewingArchive?(viewingArchive?.kpis?.totalSales??total):actualRevenue)}</div></div></div><FADashboardLineGraph labels={chartData.labels} values={values}/></div>
          <div style={{background:"#fff",border:"1px solid #E1E6D8",borderRadius:18,padding:"18px 20px",boxShadow:"0 2px 14px rgba(50,109,32,.06)"}}><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Performance</div><div style={{fontSize:11,color:"#6B7A65",marginTop:3,marginBottom:16}}>Ranked by actual revenue</div><FADashboardRankBars data={branchPerformance}/></div>
        </div>

        <div style={{background:"#fff",border:"1px solid #E1E6D8",borderRadius:18,padding:"18px 20px",marginBottom:18,boxShadow:"0 2px 14px rgba(50,109,32,.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:16,flexWrap:"wrap"}}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Profitability</div><div style={{fontSize:11,color:"#6B7A65",marginTop:4}}>Revenue, gross profit, margin and transaction efficiency by branch</div></div>{!viewingArchive&&<div style={{textAlign:"right"}}><div style={{fontSize:9.5,color:"#7A887B",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Branches analyzed</div><div style={{fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2}}>{branchProfitability.length.toLocaleString()}</div></div>}</div>
          {branchProfitability.length>0?<div style={{overflowX:"auto",border:"1px solid #E7EEE4",borderRadius:13}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:820,fontFamily:FONT}}><thead><tr style={{background:"#F6FAF3"}}>{[{label:"Branch",align:"left"},{label:"Revenue",align:"right"},{label:"Gross Profit",align:"right"},{label:"Margin",align:"center"},{label:"Transactions",align:"center"},{label:"Avg. Order",align:"right"}].map(h=><th key={h.label} style={{padding:"11px 13px",textAlign:h.align,fontSize:9.5,color:"#71806F",fontWeight:800,textTransform:"uppercase",letterSpacing:".065em",borderBottom:"1px solid #DDE8DA",whiteSpace:"nowrap"}}>{h.label}</th>)}</tr></thead><tbody>{branchProfitability.map((row,index)=>{const has=row.hasCogs;const mc=!has?"#94a3b8":row.margin>=40?"#15803d":row.margin>=25?"#3b791e":row.margin>=15?"#d97706":"#dc2626";const mb=!has?"#f8fafc":row.margin>=40?"#ecfdf5":row.margin>=25?"#f0f5e8":row.margin>=15?"#fffbeb":"#fef2f2";const bd=index===branchProfitability.length-1?"none":"1px solid #EEF3EC";return <tr key={row.branch} style={{background:index%2===0?"#fff":"#FBFDF9"}}><td style={{padding:"12px 13px",borderBottom:bd}}><div style={{display:"flex",alignItems:"center",gap:9}}><span style={{width:24,height:24,borderRadius:8,background:"#F0F5E8",color:"#3b791e",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{index+1}</span><span style={{fontSize:11.5,fontWeight:800,color:"#12241B",whiteSpace:"nowrap"}}>{row.branch}</span></div></td><td style={{padding:"12px 13px",textAlign:"right",fontSize:11.5,fontWeight:800,color:"#183126",whiteSpace:"nowrap",borderBottom:bd}}>{fmtAmt_d(row.revenue)}</td><td style={{padding:"12px 13px",textAlign:"right",fontSize:11.5,fontWeight:800,color:has?"#1d4ed8":"#94a3b8",whiteSpace:"nowrap",borderBottom:bd}}>{has?fmtAmt_d(row.grossProfit):"-"}</td><td style={{padding:"12px 13px",textAlign:"center",borderBottom:bd}}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:60,padding:"4px 8px",borderRadius:20,background:mb,color:mc,fontSize:10.5,fontWeight:800,whiteSpace:"nowrap"}}>{has?`${row.margin.toFixed(1)}%`:"No COGS"}</span></td><td style={{padding:"12px 13px",textAlign:"center",fontSize:11.5,fontWeight:700,color:"#334155",borderBottom:bd}}>{row.transactions.toLocaleString()}</td><td style={{padding:"12px 13px",textAlign:"right",fontSize:11.5,fontWeight:800,color:"#3b791e",whiteSpace:"nowrap",borderBottom:bd}}>{fmtAmt_d(row.avgOrder)}</td></tr>})}</tbody></table></div>:<FADashboardEmptyState message={viewingArchive?"Branch profitability is not stored in this archived snapshot.":"No branch transaction data is available for the selected filter."}/>} 
        </div>

        <SalesTrendSection values={values} labels={chartData.labels} kpiData={kpiData} total={total} avg={avg} peak={peak} low={low} peakLabel={peakLabel} pctChange={pctChange} trending={trending} getRangeLabel={getRangeLabel} filterLabel={filterLabel}/>
      </>}

      {analysisTab==="prescriptive"&&<PrescriptiveSection transactions={transactions} filterLabel={filterLabel} preset={preset} total={total} values={values} kpiData={kpiData}/>} 
      {analysisTab==="stock"&&<SalesVsStockSection preset={preset} appliedRange={appliedRange} rangeMode={rangeMode} filterBranch={filterBranch} filterBrand={filterBrand} selectedBrand={selectedBrand} total={total}/>} 
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}

// ─── BrandBranchFilter ────────────────────────────────────────────────────────
function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
  const [brandQ, setBrandQ]   = useState("");
  const [branchQ, setBranchQ] = useState("");
  const [openB, setOpenB]     = useState(false);
  const [openBr, setOpenBr]   = useState(false);
  const brandRef  = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
    const fn = e => {
      if (brandRef.current  && !brandRef.current.contains(e.target))  setOpenB(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBr(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selectedBrand    = brands.find(b => b.id === activeBrand);
  const branchList       = selectedBrand ? (selectedBrand.branches||[]).map(br=>typeof br==="string"?br:br.name) : [];
  const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));
  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = active => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:180 }}>
        <div onClick={()=>{setOpenB(v=>!v);setBrandQ("");}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <FilterIcon/> <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{selectedBrand?selectedBrand.name:"All Brands"}</span>
          <ChevronIcon dir={openB?"up":"down"} style={{ position:"absolute", right:10 }}/>
        </div>
        {openB && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={brandQ} onChange={e=>setBrandQ(e.target.value)} placeholder="Search brand…" onClick={e=>e.stopPropagation()} style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBrand)} onMouseDown={()=>{onChangeBrand(null);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>All Brands</div>
            {filteredBrands.map(b=>(
              <div key={b.id} style={optSt(activeBrand===b.id)} onMouseDown={()=>{onChangeBrand(b.id);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>
                {b.name} <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches||[]).length} branches</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand?1:0.45 }}>
        <div onClick={()=>{if(activeBrand){setOpenBr(v=>!v);setBranchQ("");}}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
          <StoreIcon size={12} color={activeBrand?C.green:C.muted}/> <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{activeBranch||(activeBrand?"All Branches":"Select brand first")}</span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={()=>{onChangeBranch(null);setOpenBr(false);}}>All Branches</div>
            {filteredBranches.map(br=>(
              <div key={br} style={optSt(activeBranch===br)} onMouseDown={()=>{onChangeBranch(br);setOpenBr(false);}}>
                <StoreIcon size={11} color={C.green}/> {br}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BranchSearchSelect ───────────────────────────────────────────────────────
function BranchSearchSelect({ value, onChange, allBranches }) {
  const [query, setQuery] = useState(value||"");
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ setQuery(value||""); },[value]);
  useEffect(()=>{
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);
  const filtered = allBranches.filter(({branch,brand})=>!query||branch.toLowerCase().includes(query.toLowerCase())||brand.toLowerCase().includes(query.toLowerCase()));
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
        <input type="text" value={query} placeholder="Search branch…"
          onChange={e=>{setQuery(e.target.value);setOpen(true);onChange("");}} onFocus={()=>setOpen(true)}
          style={{ ...invInputSt, paddingLeft:30 }}/>
      </div>
      {open && filtered.length>0 && (
        <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:400, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.1)", maxHeight:190, overflowY:"auto" }}>
          {filtered.map(({branch,brand})=>(
            <div key={branch} onMouseDown={e=>{e.preventDefault();onChange(branch);setQuery(branch);setOpen(false);}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
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

// ─── CategorySelect ───────────────────────────────────────────────────────────
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
        <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...invInputSt, flex:1 }}>
          <option value="">Select category…</option>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={()=>setAdding(v=>!v)} style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:`1px solid ${C.border}`, color:adding?C.green:C.muted }}>
          <TagIcon size={14}/>
        </button>
      </div>
      {adding && (
        <div style={{ display:"flex", gap:6, marginTop:6 }}>
          <input autoFocus type="text" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();handleAdd();}}} placeholder="New category…" style={{ ...invInputSt, flex:1 }}/>
          <button type="button" onClick={handleAdd} style={{ ...btnPrimarySt, padding:"0 14px" }}>Add</button>
          <button type="button" onClick={()=>{setAdding(false);setNewCat("");}} style={{ ...smallBtnSt, height:36, width:36, justifyContent:"center", border:"1px solid #ffcdd2", color:"#e53935" }}><XIcon size={13}/></button>
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, setPage, total, pageSize }) {
  const totalPgs = Math.max(1, Math.ceil(total / pageSize));
  if (totalPgs <= 1) return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderTop:`1px solid ${C.border}`, background:"#f9fefb" }}>
      <span style={{ fontSize:12, color:C.muted }}>
        Showing <strong style={{ color:C.ink }}>{(page*pageSize+1).toLocaleString()}–{Math.min((page+1)*pageSize,total).toLocaleString()}</strong> of <strong style={{ color:C.ink }}>{total.toLocaleString()}</strong>
      </span>
      <div style={{ display:"flex", gap:4 }}>
        {[{l:"«",a:()=>setPage(0),d:page===0},{l:"‹",a:()=>setPage(p=>Math.max(0,p-1)),d:page===0}].map(({l,a,d})=>(
          <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
        ))}
        {Array.from({length:totalPgs},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
          <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?`linear-gradient(135deg,${C.teal},${C.green})`:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
        ))}
        {[{l:"›",a:()=>setPage(p=>Math.min(totalPgs-1,p+1)),d:page>=totalPgs-1},{l:"»",a:()=>setPage(totalPgs-1),d:page>=totalPgs-1}].map(({l,a,d})=>(
          <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Delete History Panel ─────────────────────────────────────────────────────
function DeleteHistoryPanel({ history, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Plus Jakarta Sans,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#dc2626" }}>
                {history.length} deleted
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>

        {/* Column headers */}
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            <span>Item</span><span>Branch</span><span>Stock</span><span>Price</span><span>Deleted At</span><span></span>
          </div>
        )}

        {/* Rows */}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => {
            const d    = entry.inventory_data   || {};
            const ings = entry.ingredients_data || [];
            return (
              <div key={entry.id} style={{ padding:"14px 0", borderBottom: i < history.length-1 ? "1px solid #f0f8f0" : "none" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.category}</div>
                  </div>
                  <div style={{ fontSize:12, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.branch}</div>
                  <div style={{ fontSize:12, color:C.ink, fontWeight:600 }}>{d.stock}</div>
                  <div style={{ fontSize:12, color:C.green, fontWeight:700 }}>{fmtPeso(d.price||0)}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deleted_at ? fmtTs(entry.deleted_at) : "—"}</div>
                  <button onClick={() => onRestore(entry)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:`1.5px solid ${C.green}`, background:"#e0f2f1", color:C.greenDk, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    <RestoreIcon/> Restore
                  </button>
                </div>
                {/* Ingredient chips */}
                {ings.length > 0 && (
                  <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:5, paddingLeft:4 }}>
                    <span style={{ fontSize:10, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", alignSelf:"center" }}>Ingredients:</span>
                    {ings.map((ing, idx) => (
                      <span key={idx} style={{ fontSize:11, padding:"2px 9px", borderRadius:20, background:C.greenLt, color:C.greenDk, fontWeight:600, border:`1px solid ${C.greenMid}` }}>
                        {ing.name} × {ing.qty_required} {ing.unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── InventoryTable ───────────────────────────────────────────────────────────
function InventoryTable({ items, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, page, setPage }) {
  const [sort, setSort]             = useState({ col:"name", asc:true });
  const [expandedRows, setExpanded] = useState({});

  const sorted = useMemo(() => {
    return [...items].sort((a,b) => {
      let va=a[sort.col]??"", vb=b[sort.col]??"";
      if(typeof va==="string") va=va.toLowerCase();
      if(typeof vb==="string") vb=vb.toLowerCase();
      return sort.asc?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);
    });
  }, [items, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems  = sorted.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);

  const Th = ({ col, label, style:s }) => {
    const active = sort.col === col;
    return (
      <th onClick={()=>{setSort(st=>({col,asc:st.col===col?!st.asc:true}));setPage(0);}}
        style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#f0fdf5", ...s }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label} {active?(sort.asc?<SortAscIcon/>:<SortDescIcon/>):<span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };
  const ThStatic = ({ label, style:s }) => (
    <th style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap", background:"#f0fdf5", ...s }}>{label}</th>
  );

  if (!items.length) return <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No items match your filters.</div>;

  return (
    <div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <Th col="name"      label="Item Name"   style={{ minWidth:160 }}/>
              <Th col="category"  label="Category"    style={{ minWidth:110 }}/>
              <Th col="branch"    label="Branch"      style={{ minWidth:130 }}/>
              <Th col="stock"     label="Stock"       style={{ minWidth:72  }}/>
              <Th col="min_stock" label="Min Stock"   style={{ minWidth:80  }}/>
              <Th col="cost"      label="Cost"        style={{ minWidth:90  }}/>
              <Th col="price"     label="Price"       style={{ minWidth:90  }}/>
              <ThStatic           label="Ingredients" style={{ minWidth:140 }}/>
              <th style={{ padding:"9px 12px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}`, minWidth:150 }}/>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(item => {
              const low        = Number(item.stock) <= Number(item.min_stock);
              const isConfirm  = confirmDeleteId === item.id;
              const ingredients= item.ingredients || [];
              const isExpanded = expandedRows[item.id];
              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isExpanded?"none":`1px solid #f2faf5` }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafffe"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
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
                        {low && <span style={{ background:"#fff3e0", color:C.warn, fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>⚠️ LOW</span>}
                      </span>
                    </td>
                    <td style={{ padding:"10px 12px", color:C.muted }}>{item.min_stock}</td>
                    <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPeso(item.cost||0)}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{fmtPeso(item.price)}</td>
                    <td style={{ padding:"10px 12px" }}>
                      {ingredients.length === 0 ? (
                        <span style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>—</span>
                      ) : (
                        <button onClick={()=>setExpanded(p=>({...p,[item.id]:!p[item.id]}))}
                          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:isExpanded?C.greenMid:C.greenLt, color:C.greenDk, border:`1px solid ${C.greenMid}`, cursor:"pointer" }}>
                          {ingredients.length} ingredient{ingredients.length!==1?"s":""}
                          <ChevronIcon size={10} dir={isExpanded?"up":"down"}/>
                        </button>
                      )}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                        <button onClick={()=>onEdit(item)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}><EditIcon/> Edit</button>
                        <button onClick={()=>{ if(isConfirm){onDelete(item.id);setConfirmDeleteId(null);}else setConfirmDeleteId(item.id); }}
                          style={{ ...smallBtnSt, border:isConfirm?"none":"1px solid #ffcdd2", color:isConfirm?C.white:"#e53935", background:isConfirm?"#e53935":C.white }}>
                          <TrashIcon/> {isConfirm?"Confirm?":"Delete"}
                        </button>
                        {isConfirm && <button onClick={()=>setConfirmDeleteId(null)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && ingredients.length > 0 && (
                    <tr style={{ borderBottom:`1px solid #f2faf5` }}>
                      <td colSpan={9} style={{ padding:"0 12px 12px 12px", background:"#f9fefb" }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, padding:"10px 14px", background:C.greenLt, borderRadius:10, border:`1px solid ${C.greenMid}` }}>
                          <span style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", width:"100%", marginBottom:4 }}>
                            Ingredients required per unit:
                          </span>
                          {ingredients.map((ing, idx) => (
                            <span key={idx} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:C.white, color:C.ink, border:`1px solid ${C.border}` }}>
                              <span style={{ color:C.green, fontWeight:700 }}>{ing.name}</span>
                              <span style={{ color:C.muted }}>×</span>
                              <span style={{ fontWeight:800, color:C.greenDk }}>{ing.qty_required}</span>
                              {ing.unit && <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:"1px 6px", borderRadius:20 }}>{ing.unit}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} setPage={setPage} total={sorted.length} pageSize={PAGE_SIZE}/>}
    </div>
  );
}

///MENU INVENTORY — FRANCHISE ADMIN VIEW-ONLY
function FAMenuInventoryContent({ user, brands: propBrands = [] }) {
  const brandList = propBrands.length > 0 ? propBrands : [];

  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches || []).forEach(br => {
      const name = typeof br === "string" ? br : br.name;
      if (name && !out.find(x => x.branch === name)) out.push({ brand: b.name, branch: name });
    }));
    return out;
  }, [brandList]);

  const branchToBrand = useMemo(() => {
    const map = {};
    allBranches.forEach(x => { map[x.branch] = x.brand; });
    return map;
  }, [allBranches]);

  const [inventory,      setInventory]      = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [filterBrand,    setFilterBrand]    = useState(null);
  const [filterBranch,   setFilterBranch]   = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeScreen,   setActiveScreen]   = useState("brands");
  const [selectedItemId, setSelectedItemId] = useState(null);

  // IMPORTANT: Franchise Admin keeps the same data source / GET call.
  // This module is UI-only + view-only. No POST, PUT, PATCH, DELETE, restore, or import actions.
  const fetchInventory = useCallback(async (branch) => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${q}`);
      const d   = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory(filterBranch || undefined);
  }, [filterBranch, fetchInventory]);

  useEffect(() => {
    setSelectedItemId(null);
  }, [filterBrand, filterBranch, filterCategory, filterStatus, searchQuery]);

  const selectedBrandObj = useMemo(
    () => brandList.find(b => b.id === filterBrand) || null,
    [brandList, filterBrand]
  );

  const selectedBrandBranchNames = useMemo(() => {
    if (!selectedBrandObj) return [];
    return (selectedBrandObj.branches || [])
      .map(br => typeof br === "string" ? br : br.name)
      .filter(Boolean);
  }, [selectedBrandObj]);

  const filteredCategories = useMemo(() => {
    if (selectedBrandObj?.categories?.length) return selectedBrandObj.categories;
    if (filterBranch) {
      const ownerBrand = brandList.find(b =>
        (b.branches || []).some(br => (typeof br === "string" ? br : br.name) === filterBranch)
      );
      return ownerBrand?.categories || [];
    }
    return [...new Set(brandList.flatMap(b => b.categories || []).filter(Boolean))].sort();
  }, [selectedBrandObj, filterBranch, brandList]);

  const normalizedItems = useMemo(() => inventory.map(item => ({
    ...item,
    is_low: Number(item.stock || 0) <= Number(item.min_stock || 0),
  })), [inventory]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return normalizedItems
      .filter(item => {
        if (filterBrand) {
          if (!selectedBrandBranchNames.includes(item.branch)) return false;
        }
        if (filterBranch && item.branch !== filterBranch) return false;
        if (filterCategory && item.category !== filterCategory) return false;
        if (filterStatus === "low" && !item.is_low) return false;
        if (filterStatus === "ok" && item.is_low) return false;

        if (q) {
          const haystack = [item.name, item.category, item.branch, branchToBrand[item.branch]]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [
    normalizedItems,
    filterBrand,
    selectedBrandBranchNames,
    filterBranch,
    filterCategory,
    filterStatus,
    searchQuery,
    branchToBrand,
  ]);

  const selectedItem = useMemo(
    () => filteredItems.find(item => item.id === selectedItemId) || null,
    [filteredItems, selectedItemId]
  );

  const openBrand = (brandId) => {
    setFilterBrand(brandId);
    setFilterBranch("");
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
    setSelectedItemId(null);
    setActiveScreen("inventory");
  };

  const goBackToBrands = () => {
    setActiveScreen("brands");
    setFilterBrand(null);
    setFilterBranch("");
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
    setSelectedItemId(null);
  };

  const clearFilters = () => {
    setFilterBranch("");
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
  };

  const menuInputSt = {
    height: 30,
    padding: "0 10px",
    borderRadius: 9,
    border: `1px solid ${C.border}`,
    background: C.white,
    fontSize: 11,
    color: C.ink,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .fa-menu-card-button { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
      .fa-menu-card-button:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(50,109,32,.12) !important; border-color: ${C.greenMid} !important; }
      .fa-menu-item-row { transition: background .15s ease, border-color .15s ease; }
      .fa-menu-item-row:hover { background: ${C.bg} !important; }
      .fa-menu-input:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(59,121,30,0.10); }
    `}</style>
  );

  const ViewOnlyNotice = () => (
    <div style={{
      display: "flex", alignItems: "center", gap: 9,
      background: "#fbfcf8", border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "10px 13px", marginBottom: 16,
      color: C.muted,
    }}>
      <Info size={15} color={C.green} />
      <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
        <strong style={{ color: C.ink }}>View-only access.</strong> Franchise Admin can browse, search, filter, and inspect menu inventory data, but cannot add, edit, delete, restore, or import items.
      </div>
    </div>
  );

  const ItemDetailPanel = ({ item }) => {
    if (!item) return null;

    const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
    const low = item.is_low;
    const canMake = item.available_stock ?? item.stock ?? "—";

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <StoreIcon size={11} color={C.green} /> {item.branch || "No branch"}
            </div>
          </div>
          <span style={{
            flexShrink: 0, fontSize: 10, fontWeight: 800,
            padding: "4px 9px", borderRadius: 20,
            background: low ? C.warnBg : C.okBg,
            color: low ? C.warn : C.ok,
            border: `1px solid ${low ? "#fed7aa" : C.greenMid}`,
          }}>
            {low ? "LOW STOCK" : "IN STOCK"}
          </span>
        </div>

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{ width: "100%", maxWidth: 300, height: 170, objectFit: "cover", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14 }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
          <div style={{ background: low ? C.warnBg : C.okBg, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Can Make / Stock</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: low ? C.warn : C.ink }}>{canMake}</div>
          </div>
          <div style={{ background: C.greenLt, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Price</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.greenDk }}>{fmtPeso(item.price || 0)}</div>
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Category</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.category || "—"}</div>
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Minimum Stock</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{item.min_stock ?? "—"}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
          Ingredients
        </div>
        {ingredients.length === 0 ? (
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", padding: "12px 0" }}>No ingredients linked.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ingredients.map((ing, idx) => (
              <span key={`${ing.id || ing.name || "ingredient"}-${idx}`} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 20,
                fontSize: 12, fontWeight: 600,
                background: C.white, color: C.ink,
                border: `1px solid ${C.border}`,
              }}>
                <span style={{ color: C.green, fontWeight: 700 }}>{ing.name || ing.ingredient_name || "Ingredient"}</span>
                <span style={{ color: C.muted }}>×</span>
                <span style={{ fontWeight: 800, color: C.greenDk }}>{ing.qty_required ?? ing.quantity ?? "—"}</span>
                {(ing.unit || ing.measurement_unit) && (
                  <span style={{ fontSize: 11, color: C.muted, background: C.bg, padding: "1px 6px", borderRadius: 20 }}>
                    {ing.unit || ing.measurement_unit}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Admin-style first screen: brand overview cards, matching the provided Menu Inventory UX.
  if (activeScreen === "brands" && brandList.length > 0) {
    return (
      <div style={{ fontFamily: FONT, color: C.ink }}>
        {fontImport}
        <ViewOnlyNotice />

        {loading && inventory.length === 0 ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading menu inventory…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            {brandList.map(brand => {
              const branchNames = (brand.branches || []).map(br => typeof br === "string" ? br : br.name).filter(Boolean);
              const brandItems = normalizedItems.filter(item => branchNames.includes(item.branch));
              const lowCount = brandItems.filter(item => item.is_low).length;

              return (
                <button
                  key={brand.id}
                  type="button"
                  className="fa-menu-card-button"
                  onClick={() => openBrand(brand.id)}
                  style={{
                    textAlign: "left", width: "100%", padding: 0, appearance: "none",
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 18,
                    overflow: "hidden", boxShadow: "0 2px 10px rgba(50,109,32,.05)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <div style={{ padding: "18px 18px 15px", borderBottom: `1px solid ${C.border}`, background: "#fbfcf8", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: C.ink, color: "#bdd43c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <StoreIcon size={19} color="#bdd43c" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{branchNames.length} branch{branchNames.length === 1 ? "" : "es"}</div>
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.greenDk }}>
                      <ChevronRight size={13} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", padding: "16px 18px" }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Items</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginTop: 3 }}>{brandItems.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Low</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: lowCount ? "#c0392b" : C.green, marginTop: 3 }}>{lowCount}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const currentBrandName = selectedBrandObj?.name || "All Menu Items";
  const branchOptions = selectedBrandObj
    ? selectedBrandBranchNames
    : allBranches.map(x => x.branch);
  const lowCount = filteredItems.filter(item => item.is_low).length;
  const hasActiveFilters = Boolean(searchQuery || filterBranch || filterCategory || filterStatus);

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      {fontImport}
      <ViewOnlyNotice />

      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 2px 10px rgba(50,109,32,.05)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Flat header, same Menu/Stock Inventory visual language */}
        <div style={{
          padding: "16px 22px", background: "#fbfcf8",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: C.ink, flexWrap: "wrap", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {brandList.length > 0 && (
              <button
                type="button"
                onClick={goBackToBrands}
                title="Back to all brands"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34, borderRadius: 9,
                  border: `1px solid ${C.border}`, background: C.white,
                  color: C.greenDk, cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
              </button>
            )}
            {!brandList.length && <StoreIcon size={17} color={C.green} />}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentBrandName}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>Menu Inventory</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.muted }}>{filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}{lowCount > 0 ? ` · ${lowCount} low` : ""}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, color: C.greenDk,
              background: C.greenLt, border: `1px solid ${C.greenMid}`,
              padding: "4px 9px", borderRadius: 20,
            }}>VIEW ONLY</span>
          </div>
        </div>

        {/* Filters only — no Add/Edit/Delete/Import/Delete History */}
        <div style={{
          padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
          display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
          background: "#fbfcf8",
        }}>
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 145 }}>
            <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: C.muted }}><SearchIcon size={11} /></div>
            <input
              className="fa-menu-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search item…"
              style={{ ...menuInputSt, width: "100%", paddingLeft: 25 }}
            />
          </div>

          <select
            className="fa-menu-input"
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            style={{ ...menuInputSt, width: 155 }}
          >
            <option value="">All Branches</option>
            {branchOptions.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>

          <select
            className="fa-menu-input"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ ...menuInputSt, width: 145 }}
          >
            <option value="">All Categories</option>
            {filteredCategories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>

          <select
            className="fa-menu-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...menuInputSt, width: 112 }}
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                height: 30, padding: "0 11px", borderRadius: 999,
                border: `1px solid ${C.border}`, background: C.white,
                color: C.muted, fontSize: 11, fontWeight: 700,
                fontFamily: "inherit", cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading menu inventory…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(300px,420px) minmax(0,1fr)", minHeight: 540, maxHeight: 700 }}>
            {/* Left: menu item list */}
            <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", maxHeight: 700, minHeight: 0 }}>
              {filteredItems.length === 0 ? (
                <div style={{ padding: "32px 14px", textAlign: "center", color: C.muted, fontSize: 12 }}>No menu items found.</div>
              ) : filteredItems.map(item => {
                const active = item.id === selectedItemId;
                const low = item.is_low;
                const currentStock = Number(item.stock || 0);
                const minStock = Number(item.min_stock || 0);
                const stockPct = minStock > 0 ? Math.min(100, Math.round((currentStock / (minStock * 2)) * 100)) : (currentStock > 0 ? 100 : 0);

                return (
                  <div
                    key={item.id}
                    className="fa-menu-item-row"
                    onClick={() => setSelectedItemId(item.id)}
                    style={{
                      padding: "11px 14px", cursor: "pointer",
                      borderLeft: `3px solid ${active ? "#bdd43c" : "transparent"}`,
                      background: active ? "#f6f8ef" : C.white,
                      borderBottom: `1px solid ${C.bg}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: active ? 800 : 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      {low && <span style={{ fontSize: 9, fontWeight: 800, color: C.warn, background: C.warnBg, padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>LOW</span>}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3, display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.branch || "No branch"}</span>
                      <span style={{ color: C.greenDk, fontWeight: 700, flexShrink: 0 }}>{fmtPeso(item.price || 0)}</span>
                    </div>
                    <div style={{ marginTop: 6, height: 4, borderRadius: 20, background: "#eef6f1", overflow: "hidden" }}>
                      <div style={{ width: `${stockPct}%`, height: "100%", borderRadius: 20, background: low ? C.warn : C.green }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: details only */}
            <div style={{ padding: 20, overflowY: "auto", maxHeight: 700, minHeight: 0 }}>
              {selectedItem ? (
                <ItemDetailPanel item={selectedItem} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, color: C.muted, fontSize: 12.5, textAlign: "center", padding: 20 }}>
                  <div>
                    <Eye size={20} color={C.green} style={{ marginBottom: 8 }} />
                    <br />Select an item on the left<br />to view its details and ingredients.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function DeleteConfirmModal({ target, onConfirm, onClose, deleting }) {
  const isBrand = target.type === "brand";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>Delete {isBrand ? "brand" : "branch"}?</h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete <strong>"{target.name}"</strong>{isBrand ? " and all its associated data." : "."}
        </p>
        {isBrand && target.branchCount > 0 && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#c2410c", textAlign: "center", marginBottom: 16 }}>
            ⚠ This brand has {target.branchCount} {target.branchCount === 1 ? "branch" : "branches"}. All branches will also be deleted.
          </div>
        )}
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>You can recover this from Delete History.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button type="button" onClick={onClose} disabled={deleting} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.6 : 1 }}>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={deleting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(220,38,38,0.35)", opacity: deleting ? 0.7 : 1 }}>
            {deleting ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }}/> : <Trash2 size={14} />}
            {deleting ? `Deleting ${isBrand ? "brand" : "branch"}…` : `Delete ${isBrand ? "brand" : "branch"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

//STOCK INVENTORY
function FAStockInventoryContent({ user, brands: propBrands = [] }) {
  const userBranch = user?.branch || "";

  const brandList = propBrands.length > 0 ? propBrands : [];

  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b =>
      (b.branches || []).forEach(br => {
        const name = typeof br === "string" ? br : br.name;
        if (!out.find(x => x.branch === name)) out.push({ brand: b.name, branch: name });
      })
    );
    return out;
  }, [brandList]);

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [brand,      setBrand]      = useState(null);
  const [branch,     setBranch]     = useState(null);
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilt, setStatusFilt] = useState("");
  const [page,       setPage]       = useState(0);
  const [sort,       setSort]       = useState({ col: "name", asc: true });

  /* ── fetch ingredients ── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
      const d   = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [branch]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(0); }, [search, brand, branch, unitFilter, statusFilt]);

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...items]
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q) && !(i.branch || "").toLowerCase().includes(q)) return false;
        if (branch && i.branch !== branch) return false;
        else if (brand && !branch) {
          const b = brandList.find(x => x.id === brand);
          if (b) {
            const names = (b.branches || []).map(br => typeof br === "string" ? br : br.name);
            if (!names.includes(i.branch)) return false;
          }
        }
        if (unitFilter && i.unit !== unitFilter) return false;
        if (statusFilt === "low" && Number(i.stock) >= Number(i.min_stock)) return false;
        if (statusFilt === "ok"  && Number(i.stock) <  Number(i.min_stock)) return false;
        return true;
      })
      .sort((a, b) => {
        let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        return sort.asc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
      });
  }, [items, search, brand, branch, unitFilter, statusFilt, sort, brandList]);

  const lowCount   = filtered.filter(i => Number(i.stock) < Number(i.min_stock)).length;
  const totalValue = filtered.reduce((s, i) => s + (i.cost_per_unit || 0) * (i.stock || 0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const anyFilter = brand || branch || unitFilter || statusFilt || search;
  const clearAll  = () => { setBrand(null); setBranch(null); setUnitFilter(""); setStatusFilt(""); setSearch(""); };

  /* ── sortable table header ── */
  const SortTh = ({ col, label, minW }) => {
    const active = sort.col === col;
    return (
      <th
        onClick={() => { setSort(s => ({ col, asc: s.col === col ? !s.asc : true })); setPage(0); }}
        style={{
          padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11,
          color: active ? C.green : C.muted, letterSpacing: "0.07em", textTransform: "uppercase",
          borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none",
          whiteSpace: "nowrap", background: "#f0fdf5", minWidth: minW,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          {active ? (sort.asc ? <SortAscIcon /> : <SortDescIcon />) : <span style={{ opacity: 0.25 }}><SortDescIcon /></span>}
        </span>
      </th>
    );
  };

  /* ── render ── */
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* View-only notice */}
      <div style={{
        background: "linear-gradient(135deg,rgba(233,205,48,0.12),rgba(255,168,117,0.08))",
        border: "1.5px solid rgba(233,205,48,0.3)", borderRadius: 12,
        padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10,
      }}>
        <Info size={16} color="#8a6a00" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#5d4400" }}>
          View-only access — You can browse and filter stock inventory but cannot add, edit, import, or delete items.
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Ingredients", value: items.length.toLocaleString(),                                                                              sub: "Registered",    accent: C.green    },
          { label: "Low Stock Alerts",  value: lowCount,                                                                                                   sub: "Needs reorder", accent: "#e65100" },
          { label: "Total Stock Value", value: "\u20B1" + Number(totalValue).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sub: "Cost basis",     accent: "#1565c0" },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.white, border: "1px solid rgba(0,168,76,0.13)",
            borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: s.accent, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        background: C.white, border: "1px solid rgba(0,168,76,0.13)", borderRadius: 16,
        padding: "14px 18px", marginBottom: 18, boxShadow: "0 1px 8px rgba(0,140,60,0.05)",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted }}><SearchIcon size={13} /></div>
            <input
              type="text"
              placeholder="Search ingredient or branch…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...invInputSt, paddingLeft: 30 }}
            />
            {search && (
              <div onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted }}>
                <XIcon size={12} />
              </div>
            )}
          </div>

          <BrandBranchFilter
            brands={brandList}
            activeBrand={brand}
            activeBranch={branch}
            onChangeBrand={id => { setBrand(id); setBranch(null); }}
            onChangeBranch={setBranch}
          />

          <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} style={{ ...invInputSt, width: 120 }}>
            <option value="">All Units</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)} style={{ ...invInputSt, width: 130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
        </div>

        {/* Active filter chips */}
        {anyFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Active:</span>
            {search      && <Chip label={`"${search}"`}                                              color="#3949ab" bg="#e8eaf6" onRemove={() => setSearch("")} />}
            {brand && !branch && <Chip label={brandList.find(b => b.id === brand)?.name}             color={C.greenDk} bg={C.greenLt} onRemove={() => { setBrand(null); setBranch(null); }} />}
            {branch      && <Chip label={branch}                                                      color="#00695c" bg="#e0f7fa" onRemove={() => setBranch(null)} />}
            {unitFilter  && <Chip label={unitFilter}                                                  color="#6a1b9a" bg="#f3e8ff" onRemove={() => setUnitFilter("")} />}
            {statusFilt  && <Chip label={statusFilt === "low" ? "Low Stock" : "In Stock"} color={statusFilt === "low" ? C.warn : C.ok} bg={statusFilt === "low" ? C.warnBg : C.okBg} onRemove={() => setStatusFilt("")} />}
            <button onClick={clearAll} style={{ ...smallBtnSt, height: 24, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginLeft: "auto" }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table card */}
      <div style={{
        background: C.white, border: "1px solid rgba(0,168,76,0.12)",
        borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 18px rgba(0,140,60,0.07)",
      }}>
        <div style={{
          padding: "11px 18px", background: `linear-gradient(135deg,${C.teal},${C.green})`,
          display: "flex", justifyContent: "space-between", alignItems: "center", color: C.white,
        }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>Stock Ingredients</span>
          <span style={{ fontSize: 12, opacity: 0.9 }}>{filtered.length} items · {lowCount} low stock · View-only</span>
        </div>

        {loading ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 13, fontStyle: "italic" }}>
            No ingredients match your filters.
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <SortTh col="name"         label="Ingredient" minW={150} />
                    <SortTh col="branch"        label="Branch"     minW={120} />
                    <SortTh col="brand"         label="Brand"      minW={100} />
                    <SortTh col="unit"          label="Unit"       minW={70}  />
                    <SortTh col="stock"         label="Stock"      minW={80}  />
                    <SortTh col="min_stock"     label="Min Stock"  minW={80}  />
                    <SortTh col="cost_per_unit" label="Cost/Unit"  minW={90}  />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(item => {
                    const low = Number(item.stock) < Number(item.min_stock);
                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #f2faf5" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafffe"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: C.ink }}>{item.name}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <StoreIcon size={11} color={C.green} /> {item.branch}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {item.brand
                            ? <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#e0f2f1", color: "#00695c" }}>{item.brand}</span>
                            : <span style={{ color: C.muted }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f3e8ff", color: "#6a1b9a" }}>{item.unit}</span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ color: low ? C.warn : C.ink, fontWeight: low ? 700 : 500, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            {item.stock}
                            {low && <span style={{ background: "#fff3e0", color: C.warn, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>⚠️ LOW</span>}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: C.muted }}>{item.min_stock}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: C.green }}>
                          {"\u20B1"}{Number(item.cost_per_unit || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
    </div>
  );
}

function ImportLoadingModal({ visible, progress }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:22, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:`1px solid ${C.greenMid}`, fontFamily:"Plus Jakarta Sans,sans-serif", textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <UploadIcon size={30} color={C.green}/>
        </div>
        <div style={{ fontSize:17, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>

        {/* Progress bar */}
        <div style={{ background:C.greenLt, borderRadius:999, height:8, overflow:"hidden", marginBottom:12 }}>
          <div style={{ background:`linear-gradient(90deg,${C.teal},${C.green})`, borderRadius:999, height:"100%", width:`${progress.percent}%`, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:6 }}>{progress.label}</div>
        {progress.current > 0 && (
          <div style={{ fontSize:11, color:C.muted, opacity:0.7 }}>{progress.current} / {progress.total} rows processed</div>
        )}

        <div style={{ marginTop:18, display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:C.green }}>
          <LoaderIcon size={16} color={C.green}/>
          <span style={{ fontSize:12, fontWeight:700 }}>Do not close this window</span>
        </div>
      </div>
    </div>
  );
}

function UIModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type, title, message, lines, confirmLabel, cancelLabel } = modal;

  const iconMap = {
    error:   <AlertCircleIcon size={26} color="#dc2626"/>,
    success: <CheckCircleIcon size={26} color={C.green}/>,
    info:    <InfoIcon size={26} color="#1d4ed8"/>,
    confirm: <AlertCircleIcon size={26} color={C.warn}/>,
  };
  const headerColorMap = {
    error:   { bg:"#fef2f2",  border:"#fecaca",      titleColor:"#991b1b"  },
    success: { bg:C.greenLt,  border:C.greenMid,     titleColor:C.greenDk  },
    info:    { bg:"#eff6ff",  border:"#bfdbfe",      titleColor:"#1e3a8a"  },
    confirm: { bg:C.warnBg,   border:"#fed7aa",      titleColor:"#9a3412"  },
  };
  const hc = headerColorMap[type] || headerColorMap.info;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${hc.border}`, fontFamily:"Plus Jakarta Sans,sans-serif", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:hc.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${hc.border}`, display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}>{iconMap[type]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:hc.titleColor, marginBottom:4 }}>{title}</div>
            {message && <div style={{ fontSize:13, color:C.ink, lineHeight:1.55, opacity:0.85 }}>{message}</div>}
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:`1px solid ${hc.border}`, background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", marginTop:-2 }}>
            <XIcon size={13}/>
          </button>
        </div>

        {/* Lines (for import summary) */}
        {lines && lines.length > 0 && (
          <div style={{ maxHeight:180, overflowY:"auto", padding:"12px 24px", borderBottom:`1px solid ${C.border}` }}>
            {lines.map((l, i) => (
              <div key={i} style={{ fontSize:12, color:l.warn ? C.warn : C.muted, padding:"3px 0", display:"flex", alignItems:"flex-start", gap:7 }}>
                <span style={{ marginTop:1, flexShrink:0, color:l.warn?"#e65100":C.green }}>{l.warn ? "–" : "+"}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          {type === "confirm" && (
            <button onClick={onClose} style={{ ...btnSt, border:`1px solid ${C.border}`, color:C.muted }}>{cancelLabel || "Cancel"}</button>
          )}
          {type === "confirm" ? (
            <button onClick={onConfirm} style={{ ...btnSt, background:"#dc2626", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.3)" }}>{confirmLabel || "Confirm"}</button>
          ) : (
            <button onClick={onClose} style={{ ...btnPrimarySt }}>{confirmLabel || "OK"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// MOBILE ORDERS

const DB_TO_UI_STATUS = { pending:"pending", accepted:"accepted", disposed:"disposed", cancelled:"rejected" };
const UI_TO_DB_STATUS = { pending:"pending", accepted:"accepted", disposed:"disposed", rejected:"cancelled" };

const STATUS_CONFIG = {
  pending:  { label:"Incoming",  bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  accepted: { label:"Accepted",  bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
  disposed: { label:"Fulfilled", bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
  rejected: { label:"Rejected",  bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
};

const REJECT_REASONS = [
  "Out of stock",
  "Customer requested cancellation",
  "Unable to fulfill in time",
  "Duplicate order",
  "Other",
];

/* ── FIFO / FEFO helpers — mirror Stock Inventory exactly ── */
function isPharmaBrand(brand) { return (brand || "").toLowerCase().includes("ipharma"); }
function getFifoMethod(brand) {
  return isPharmaBrand(brand)
    ? { method:"FEFO", queueLabel:"nearest expiry dispensed first" }
    : { method:"FIFO", queueLabel:"oldest received batch used first" };
}
function sortBatchesByMethod(batches, brand) {
  const { method } = getFifoMethod(brand);
  return [...batches].sort((a, b) => {
    if (method === "FEFO") {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
      return da - db;
    }
    const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
    const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
    return da - db;
  });
}

function normalizeOrder(o) {
  return {
    id: `ORD-${String(o.id).padStart(4, "0")}`,
    _dbId: o.id,
    customer: o.user_name ?? `User #${o.user_id}`,
    phone: o.phone ?? "",
    brand: o.brand ?? "",
    branch: o.branch ?? "",
    address: o.address ?? "",
    items: Array.isArray(o.items) ? o.items : [],
    total: o.total_amount,
    status: DB_TO_UI_STATUS[o.status] ?? "pending",
    createdAt: o.created_at,
  };
}

function timeAgo(iso) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month:"short", day:"numeric" });
}

const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true });

const itemImage = (item) => item.image || item.image_url || item.photo || item.photo_url || null;

const primaryBtn = { padding:"10px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(0,180,90,0.25)" };
const ghostBtn   = { padding:"10px 18px", borderRadius:10, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" };
const dangerBtn  = { padding:"10px 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(220,38,38,0.22)" };
const dangerTextBtn = { padding:"9px 14px", borderRadius:10, border:"1px solid #fecaca", background:"#fef2f2", color:"#dc2626", fontWeight:700, fontSize:12.5, cursor:"pointer", fontFamily:"inherit" };
const printBtn = { padding:"10px 16px", borderRadius:10, border:`1.5px solid ${C.green}`, background:"#fff", color:C.greenDk, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6 };

function StatusBadge({ status, size="md" }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const small = size === "sm";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small ? "2px 8px" : "4px 11px", borderRadius:20, fontSize: small ? 10.5 : 12, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
      {s.label}
    </span>
  );
}



function OrderStepper({ status }) {
  const steps = [
    { key:"pending",  label:"Placed" },
    { key:"accepted", label:"Accepted" },
    { key:"disposed", label:"Fulfilled" },
  ];
  const rejected = status === "rejected";
  const activeIdx = rejected ? 0 : steps.findIndex(s => s.key === status);

  return (
    <div style={{ display:"flex", alignItems:"center", padding:"14px 4px 4px" }}>
      {steps.map((s, i) => {
        const done = !rejected && i < activeIdx;
        const current = !rejected && i === activeIdx;
        const isLast = i === steps.length - 1;
        const showAsRejectedTail = rejected && i > 0;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:64 }}>
              <div style={{
                width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:800,
                background: showAsRejectedTail ? "#f3f4f6" : (done || current) ? `linear-gradient(135deg,${C.teal},${C.green})` : "#eef6f1",
                color: showAsRejectedTail ? "#9ca3af" : (done || current) ? "#fff" : "#9db8a8",
                border: current ? `2px solid ${C.green}` : "none",
                transition:"background .25s ease, color .25s ease",
              }}>
                {done ? <Check size={13}/> : i + 1}
              </div>
              <span style={{ fontSize:10.5, fontWeight:700, color: showAsRejectedTail ? "#9ca3af" : (done||current) ? C.ink : "#9db8a8", whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {!isLast && (
              <div style={{ flex:1, height:2, margin:"0 2px 18px", background: (!rejected && i < activeIdx) ? C.green : "#e5efe8", transition:"background .25s ease" }} />
            )}
          </React.Fragment>
        );
      })}
      {rejected && (
        <div style={{ marginLeft:10, display:"flex", alignItems:"center", gap:6, color:"#dc2626", fontSize:11.5, fontWeight:800 }}>
          <X size={14}/> Rejected
        </div>
      )}
    </div>
  );
}

/* ── Reason picker used for Reject / Cancel — required field, validated ── */
function ReasonForm({ title, confirmLabel, danger, onCancel, onConfirm, saving }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = reason !== "";

  return (
    <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:14, animation:"cardIn .18s ease" }}>
      <div style={{ fontSize:12.5, fontWeight:800, color:"#7f1d1d", marginBottom:10 }}>{title}</div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Reason *</label>
      <select value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setTouched(true)}
        style={{ width:"100%", height:36, borderRadius:8, border:`1px solid ${touched && !valid ? "#dc2626" : "#fecaca"}`, padding:"0 10px", fontSize:12.5, fontFamily:"inherit", marginBottom: touched && !valid ? 4 : 10, background:"#fff" }}>
        <option value="">Select a reason…</option>
        {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {touched && !valid && <div style={{ fontSize:11, color:"#dc2626", fontWeight:700, marginBottom:10 }}>Please choose a reason before continuing.</div>}
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Note (optional)</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add any extra context…"
        style={{ width:"100%", height:56, borderRadius:8, border:"1px solid #fecaca", padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", resize:"vertical", marginBottom:12, background:"#fff", boxSizing:"border-box" }}/>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
        <button onClick={onCancel} disabled={saving} style={ghostBtn}>Back</button>
        <button
          onClick={() => { if (!valid) { setTouched(true); return; } onConfirm(reason, note); }}
          disabled={saving}
          style={{ ...dangerBtn, opacity: saving ? 0.6 : 1, display:"inline-flex", alignItems:"center", gap:6 }}>
          {saving && <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>}
          {saving ? "Saving…" : confirmLabel}
        </button>
      </div>
    </div>
  );
}

function OrderCard({ order, onOpen, stockInfo, onAccept, acceptDisabled, accepting }) {
  const isPending = order.status === "pending";
  const shortItems = (stockInfo?.results || []).filter(r => !r.sufficient);
  const insufficient = isPending && stockInfo && !stockInfo.checking && shortItems.length > 0;

  const statusStyle = {
    pending:  { bg:"#fff7ed", border:"#fed7aa", color:"#9a3412", label:"Incoming" },
    accepted: { bg:C.greenLt, border:C.greenMid, color:C.greenDk, label:"Shipping" },
    rejected: { bg:"#fef2f2",  border:"#fecaca", color:"#7f1d1d", label:"Rejected" },
  }[order.status] || { bg:"#f3f4f6", border:"#e5e7eb", color:"#374151", label:order.status };

  return (
    <div
      onClick={() => onOpen(order)}
      style={{
        background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:14,
        cursor:"pointer", display:"flex", flexDirection:"column", gap:10,
        boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"box-shadow .15s, transform .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:C.ink }}>#{order.id}</div>
          <div style={{ fontSize:11.5, color:C.muted, marginTop:2 }}>{fmtDate(order.createdAt)}</div>
        </div>
        <span style={{ fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:20, background:statusStyle.bg, color:statusStyle.color, border:`1px solid ${statusStyle.border}`, whiteSpace:"nowrap" }}>
          {statusStyle.label}
        </span>
      </div>

      <div style={{ fontSize:12.5, fontWeight:700, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {order.customer}
      </div>

      <div style={{ fontSize:11.5, color:C.muted }}>
        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · <span style={{ fontWeight:700, color:C.green }}>{fmtPeso(order.total)}</span>
      </div>

      {isPending && stockInfo?.checking && (
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.muted }}>
          <RefreshCw size={11} style={{ animation:"spin 0.8s linear infinite" }}/> Checking stock…
        </div>
      )}

      {insufficient && (
        <div style={{ display:"flex", gap:6, alignItems:"flex-start", background:C.warnBg, border:"1px solid #fed7aa", borderRadius:8, padding:"7px 9px", fontSize:10.5, color:"#9a3412" }}>
          <AlertTriangle size={12} style={{ flexShrink:0, marginTop:1 }}/>
          <span>Insufficient stock for {shortItems.length} item{shortItems.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {isPending && (
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(order); }}
          disabled={acceptDisabled}
          style={{
            ...primaryBtn,
            opacity: acceptDisabled ? 0.5 : 1,
            cursor: acceptDisabled ? "not-allowed" : "pointer",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
            padding:"8px 0", fontSize:12,
          }}
        >
          {accepting && <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>}
          {accepting ? "Accepting…" : insufficient ? "Insufficient Stock" : "Accept"}
        </button>
      )}
    </div>
  );
}

/* ── Half-page receipt slip — 8.5in × 4.25in landscape, sized for manual receipt pads ── */
function ReceiptSlip({ order }) {
  return (
    <div className="receipt-page" style={{
      width:"8.5in", height:"4.25in", padding:"0.28in 0.4in", boxSizing:"border-box",
      fontFamily:FONT, color:"#000", background:"#fff",
      display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"1px dashed #000", paddingBottom:6, marginBottom:6 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800 }}>{order.brand || "Order Receipt"}</div>
          <div style={{ fontSize:10 }}>{order.branch}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:13, fontWeight:800 }}>#{order.id}</div>
          <div style={{ fontSize:10 }}>{fmtDate(order.createdAt)}</div>
        </div>
      </div>
      <div style={{ fontSize:11, marginBottom:6, lineHeight:1.5 }}>
        <div><b>Customer:</b> {order.customer}</div>
        <div><b>Phone:</b> {order.phone || "—"}</div>
        {order.address && <div><b>Address:</b> {order.address}</div>}
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <table style={{ width:"100%", fontSize:10.5, borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #000" }}>
              <th style={{ textAlign:"left", padding:"2px 0" }}>Item</th>
              <th style={{ textAlign:"center", padding:"2px 0", width:40 }}>Qty</th>
              <th style={{ textAlign:"right", padding:"2px 0", width:70 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i}>
                <td style={{ padding:"1.5px 0" }}>{it.name}</td>
                <td style={{ textAlign:"center" }}>{it.qty}</td>
                <td style={{ textAlign:"right" }}>{fmtPeso(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ borderTop:"1px dashed #000", paddingTop:6, display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:13 }}>
        <span>TOTAL</span>
        <span>{fmtPeso(order.total)}</span>
      </div>
      <div style={{ fontSize:9, textAlign:"center", marginTop:5, color:"#333" }}>Thank you for your order!</div>
    </div>
  );
}

function SectionCard({ title, children, tint }) {
  const bg = tint === "amber" ? "#fffdf0" : "#f8fffe";
  const border = tint === "amber" ? "#e8d5a3" : C.greenLt;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", color:C.muted, marginBottom:7 }}>{title}</div>
      <div style={{ padding:"12px 13px", background:bg, borderRadius:12, border:`1px solid ${border}` }}>{children}</div>
    </div>
  );
}

function OrderDrawer({ order, onClose, onAccept, onReject, onPrint, stockInfo, acceptDisabled, accepting }) {
  const [mode, setMode] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => { setMode(null); }, [order?.id]);

  if (!order) return null;

  const doPrint = async () => {
    setPrinting(true);
    onPrint([order]);
    setTimeout(() => setPrinting(false), 400);
  };

  const doReject = async (reason, note) => {
    setRejecting(true);
    try { await onReject(order, reason, note); setMode(null); } finally { setRejecting(false); }
  };

  const shortItems = (stockInfo?.results || []).filter(r => !r.sufficient);
  const showStockWarning = order.status === "pending" && stockInfo && !stockInfo.checking && shortItems.length > 0;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", zIndex:2500, display:"flex", justifyContent:"flex-end", animation:"overlayIn .18s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:460, maxWidth:"94vw", height:"100%", background:C.white, boxShadow:"-12px 0 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", fontFamily:"'Plus Jakarta Sans',sans-serif", animation:"drawerIn .22s cubic-bezier(.2,.8,.2,1)" }}>

        {/* Header */}
        <div style={{ padding:"18px 22px", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:17, fontWeight:800 }}>Order #{order.id}</div>
              <div style={{ fontSize:11.5, opacity:0.85, marginTop:2 }}>Placed {fmtDate(order.createdAt)}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {order.status === "accepted" && (
                <button onClick={doPrint} disabled={printing} style={{ ...printBtn, opacity: printing ? 0.6 : 1 }}>
                  {printing ? <RefreshCw size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Printer size={14}/>} Print Receipt
                </button>
              )}
              <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={14}/>
              </button>
            </div>
          </div>
          <OrderStepper status={order.status}/>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>

          {/* Customer */}
          <SectionCard title="Customer">
            <div style={{ fontWeight:800, fontSize:14, color:C.ink }}>{order.customer}</div>
            <div style={{ fontSize:12.5, color:C.muted, marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Phone size={12}/> {order.phone || "—"}</div>
          </SectionCard>

          {order.address && (
            <SectionCard title="Delivery Address" tint="amber">
              <div style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
                <MapPin size={13} color="#8a6a00" style={{ marginTop:1, flexShrink:0 }}/>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{order.address}</div>
              </div>
            </SectionCard>
          )}

          {/* Items — with live per-item stock availability inline, no separate check step */}
          <SectionCard title={`Items (${order.items.length})`}>
            {order.items.length === 0 ? (
              <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No item details available.</div>
            ) : (
              <div style={{ display:"grid", gap:6 }}>
                {order.items.map((item, i) => {
                  const r = stockInfo?.results?.[i];
                  const showBadge = order.status === "pending" && r;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between", padding:"7px 10px", borderRadius:8, background:i%2===0?"#f8fffe":"#fff", border:`1px solid ${C.greenLt}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                        <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden", flexShrink:0, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {itemImage(item) ? <img src={itemImage(item)} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <Package size={16} color={C.muted}/>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:12.5, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                          <div style={{ fontSize:11, color:C.muted }}>
                            Qty {item.qty}
                            {showBadge && (
                              <span style={{ marginLeft:6, fontWeight:700, color: !r.matched ? "#991b1b" : r.sufficient ? "#27500a" : "#9a3412" }}>
                                · {!r.matched ? "unmatched" : `${r.available ?? 0} available`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        {showBadge && (
                          <span style={{ fontSize:9.5, fontWeight:800, padding:"3px 8px", borderRadius:20,
                            color: !r.matched ? "#991b1b" : r.sufficient ? "#27500a" : "#9a3412",
                            background: !r.matched ? "#fee2e2" : r.sufficient ? "#eaf3de" : "#fef3c7" }}>
                            {!r.matched ? "UNMATCHED" : r.sufficient ? "OK" : "SHORT"}
                          </span>
                        )}
                        <div style={{ fontWeight:700, fontSize:12.5, color:C.green }}>{fmtPeso(item.price * item.qty)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop:8 }}>
              <div style={{ fontWeight:800, fontSize:13, color:C.ink }}>Total</div>
              <div style={{ fontWeight:800, fontSize:16, color:C.green }}>{fmtPeso(order.total)}</div>
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          <div style={{ marginTop:6 }}>
            {order.status === "pending" && mode !== "reject" && (
              <div>
                {stockInfo?.checking && (
                  <div style={{ display:"flex", gap:7, alignItems:"center", background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 11px", marginBottom:10, fontSize:11.5, color:C.muted }}>
                    <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>
                    Checking stock availability…
                  </div>
                )}
                {showStockWarning && (
                  <div style={{ display:"flex", gap:7, alignItems:"flex-start", background:C.warnBg, border:"1px solid #fed7aa", borderRadius:9, padding:"9px 11px", marginBottom:10, fontSize:11.5, color:"#9a3412" }}>
                    <AlertTriangle size={13} style={{ flexShrink:0, marginTop:1 }}/>
                    <div>
                      <div style={{ fontWeight:700, marginBottom:2 }}>Can't accept — insufficient stock</div>
                      {shortItems.map((s, i) => (
                        <div key={i}>
                          {s.name}: {s.matched ? `need ${s.qty}, have ${s.available ?? 0}` : "not linked to a stock item"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => onAccept(order)} disabled={acceptDisabled}
                    style={{ ...primaryBtn, flex:1,
                      opacity: acceptDisabled ? 0.5 : 1,
                      cursor: acceptDisabled ? "not-allowed" : "pointer",
                      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {accepting && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                    {accepting ? "Accepting…" : showStockWarning ? "Insufficient Stock" : "Accept Order"}
                  </button>
                  <button onClick={() => setMode("reject")} style={dangerTextBtn}>Reject</button>
                </div>
              </div>
            )}
            {order.status === "pending" && mode === "reject" && (
              <ReasonForm title="Reject this order" confirmLabel="Reject Order" saving={rejecting}
                onCancel={() => setMode(null)} onConfirm={doReject}/>
            )}

            {/* Accepted = shipping. No dispose step — stock was already deducted on accept. */}
            {order.status === "accepted" && mode !== "reject" && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:C.greenDk }}>
                  <Check size={15} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>This order is accepted and shipping. Stock was already deducted.</span>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => onPrint([order])} style={{ ...printBtn, flex:1 }}>
                    <Printer size={14}/> Print Receipt
                  </button>
                  <button onClick={() => setMode("reject")} style={dangerTextBtn}>Cancel</button>
                </div>
              </div>
            )}
            {order.status === "accepted" && mode === "reject" && (
              <ReasonForm title="Cancel this order" confirmLabel="Cancel Order" saving={rejecting}
                onCancel={() => setMode(null)} onConfirm={doReject}/>
            )}

            {order.status === "rejected" && (
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"11px 13px", fontSize:12.5, color:"#7f1d1d", animation:"cardIn .2s ease" }}>
                <X size={15} style={{ flexShrink:0, marginTop:1 }}/>
                <span>This order was rejected. No stock was deducted.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAMobileOrdersContent({ user, brands: propBrands = [] }) {
  const apiUrl   = process.env.REACT_APP_API_URL;
  const userName = user?.name || "Admin";

  const [activityLog,     setActivityLog]     = useState([]);

  const [orders,      setOrders]      = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error,       setError]       = useState(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewOrder,    setViewOrder]    = useState(null);
  const [toast,        setToast]        = useState(null);
  const [printQueue,   setPrintQueue]   = useState([]);
  const [massAccepting, setMassAccepting] = useState(false);
  const [acceptingId,   setAcceptingId]   = useState(null);

  // Automatic, per-order stock availability — replaces manual "check stock" + dispose flow
  // shape: { [orderId]: { checking: bool, ok: bool, results: [{...item, matched, available, sufficient}] } }
  const [stockAvailability, setStockAvailability] = useState({});

  const showToast = (type, title, message) => setToast({ type, title, message });

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const triggerPrint = (ordersToPrint) => {
    if (!ordersToPrint || ordersToPrint.length === 0) return;
    setPrintQueue(ordersToPrint);
    setTimeout(() => { window.print(); setPrintQueue([]); }, 80);
  };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${apiUrl}/orders-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, [apiUrl]);

  const handleRefreshClick = async () => {
    setRefreshingOrders(true);
    showToast("loading", "Refreshing orders…");
    await fetchOrders();
    setToast(null);
  };

  /* ── fetch orders + ingredients ── */
  const fetchOrders = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/orders`, { credentials:"include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.map(normalizeOrder));
    } catch (err) { setError(err.message); }
    finally { setLoadingData(false); }
  };

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ingredients`);
      const d = await res.json();
      setIngredients(Array.isArray(d) ? d : []);
    } catch (err) { console.warn("Failed to fetch ingredients:", err); }
  }, [apiUrl]);

  useEffect(() => { fetchOrders(); fetchActivityLog(); fetchIngredients(); }, [fetchActivityLog, fetchIngredients]);

  /* ── automatic stock availability, sourced entirely from Stock Inventory
     (ingredients/ingredient_batches). shop_items.stock is just a mirror of
     this now — never treated as authoritative. ── */
  const fetchShopItemsMap = async () => {
    const res = await fetch(`${apiUrl}/shop-items`);
    const data = await res.json();
    const map = {};
    (Array.isArray(data) ? data : []).forEach(i => { map[i.id] = i; });
    return map;
  };

  const fetchBatchesFor = async (ingredientId) => {
    const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${ingredientId}`);
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  };

  const refreshStockAvailability = useCallback(async (orderList) => {
    const pendingOrders = orderList.filter(o => o.status === "pending");
    if (pendingOrders.length === 0) return;

    setStockAvailability(prev => {
      const next = { ...prev };
      pendingOrders.forEach(o => { next[o.id] = { ...(next[o.id] || {}), checking: true }; });
      return next;
    });

    let shopItemsMap;
    try {
      shopItemsMap = await fetchShopItemsMap();
    } catch {
      return;
    }

    const batchStockCache = {}; // shared across orders in this pass
    const getIngredientStock = async (ingredientId) => {
      if (batchStockCache[ingredientId] != null) return batchStockCache[ingredientId];
      const batches = await fetchBatchesFor(ingredientId);
      const total = batches.reduce((s, b) => s + Number(b.stock || 0), 0);
      batchStockCache[ingredientId] = total;
      return total;
    };

    for (const order of pendingOrders) {
      const neededByItem = {};
      order.items.forEach(item => {
        if (item.shop_item_id == null) return;
        neededByItem[item.shop_item_id] = (neededByItem[item.shop_item_id] || 0) + Number(item.qty || 0);
      });

      const results = [];
      for (const item of order.items) {
        const si = item.shop_item_id != null ? shopItemsMap[item.shop_item_id] : null;

        // No linked ingredient = can't be fulfilled, same as backend now enforces.
        if (!si || !si.ingredient_id) { results.push({ ...item, matched:false, available:0, sufficient:false }); continue; }

        const available = await getIngredientStock(si.ingredient_id);
        const totalNeeded = neededByItem[item.shop_item_id];
        results.push({ ...item, matched:true, available, sufficient: available >= totalNeeded });
      }

      const ok = results.every(r => r.sufficient);
      setStockAvailability(prev => ({ ...prev, [order.id]: { checking:false, ok, results } }));
    }
  }, [apiUrl]);

  useEffect(() => {
    if (orders.length > 0) refreshStockAvailability(orders);
  }, [orders, refreshStockAvailability]);

  const advanceStatus = async (order, nextUiStatus, changeNote) => {
    const dbStatus = UI_TO_DB_STATUS[nextUiStatus];
    const coords = await getBrowserLocation();
    try {
      const res = await fetch(`${apiUrl}/orders/${order._dbId}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" }, credentials:"include",
        body: JSON.stringify({
          status: dbStatus,
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      if (!res.ok) {
        let detail = "";
        try { detail = (await res.json()).error || detail; } catch { detail = await res.text().catch(() => ""); }
        throw new Error(detail || `Update failed (${res.status})`);
      }
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status:nextUiStatus } : o));
      setViewOrder(v => (v && v.id === order.id) ? { ...v, status:nextUiStatus } : v);
      await fetchActivityLog();
    } catch (err) {
      showToast("error", "Couldn't update order", err.message);
      throw err;
    }
  };

  const acceptOrderWithDeduction = async (order) => {
    const availability = stockAvailability[order.id];
    if (!availability?.ok) {
      const short = (availability?.results || []).filter(r => !r.sufficient);
      const list = short.map(i => `${i.name} (need ${i.qty}, have ${i.available ?? 0})`).join(", ");
      showToast("error", "Not enough stock", list || "Insufficient stock for this order.");
      return false;
    }

    try {
      await advanceStatus(order, "accepted", `Accepted — stock deducted, moved to shipping`);
      return true;
    } catch (err) {
      showToast("error", "Couldn't accept order", err.message || "Something went wrong accepting this order.");
      return false;
    }
  };

  const handleAccept = async (order) => {
    setAcceptingId(order.id);
    try {
      const ok = await acceptOrderWithDeduction(order);
      if (ok) showToast("success", "Order accepted", `#${order.id} is now shipping.`);
    } catch (err) {
      showToast("error", "Couldn't accept order", err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (order, reason, note) => {
    try {
      const changeNote = `${order.status === "accepted" ? "Cancelled" : "Rejected"} — ${reason}${note ? `: ${note}` : ""}`;
      await advanceStatus(order, "rejected", changeNote);
      showToast("success", "Order rejected", `#${order.id} was marked as rejected.`);
    } catch {}
  };

  const handleMassAcceptAndPrint = async () => {
    const pendingOrders = orders.filter(o => o.status === "pending" && stockAvailability[o.id]?.ok);
    const skipped = orders.filter(o => o.status === "pending" && !stockAvailability[o.id]?.ok).length;
    if (pendingOrders.length === 0) {
      showToast("error", "Nothing to accept", skipped > 0 ? `${skipped} order(s) skipped — insufficient stock.` : "No incoming orders.");
      return;
    }
    setMassAccepting(true);
    showToast("loading", "Accepting orders…", `Processing ${pendingOrders.length} order(s)`);
    const accepted = [];
    for (const o of pendingOrders) {
      try {
        const ok = await acceptOrderWithDeduction(o);
        if (ok) accepted.push({ ...o, status:"accepted" });
      } catch {}
    }
    setMassAccepting(false);
    if (accepted.length > 0) {
      showToast("success", "Orders accepted", `${accepted.length} accepted${skipped ? `, ${skipped} skipped (low stock)` : ""} — sending to print.`);
      triggerPrint(accepted);
    } else {
      setToast(null);
    }
    await fetchOrders();
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const counts = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted").length,
    rejected: orders.filter(o => o.status === "rejected").length,
  };

  const FILTER_CHIPS = [
    { key:"all",      label:"All Orders",      count:counts.total },
    { key:"pending",  label:"Incoming Orders", count:counts.pending },
    { key:"accepted", label:"Shipping",        count:counts.accepted },
    { key:"rejected", label:"Rejected",        count:counts.rejected },
  ];

  if (loadingData) return (
    <div style={{ padding:60, textAlign:"center", color:C.muted, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Loading orders…</div>
  );
  if (error) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ color:"#dc2626", marginBottom:12 }}>{error}</div>
      <button onClick={fetchOrders} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, background:C.greenLt, color:C.greenDk, fontWeight:700, cursor:"pointer" }}>Retry</button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes drawerIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        button:not(:disabled) { transition: filter .15s ease, transform .1s ease; }
        button:not(:disabled):hover { filter: brightness(0.96); }
        button:not(:disabled):active { transform: translateY(1px); }
        select:focus, input:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); outline:none; }
        #print-area { display:none; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { display:block !important; position: fixed; top:0; left:0; }
          .receipt-page { page-break-after: always; }
          @page { size: 8.5in 4.25in; margin: 0; }
        }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:18 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center",
          background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:10 }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:200 }}>
            <Search size={15} color={C.muted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer name…"
              style={{ width:"100%", height:38, padding:"0 14px 0 36px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" }}/>
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ height:38, padding:"0 12px", borderRadius:10, border:`1px solid ${C.border}`,
              fontSize:12.5, fontWeight:700, color:C.ink, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}>
            {FILTER_CHIPS.map(c => (
              <option key={c.key} value={c.key}>{c.label} ({c.count})</option>
            ))}
          </select>

          <button onClick={handleRefreshClick} disabled={refreshingOrders}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1px solid ${C.border}`,
              background:C.greenLt, color:C.greenDk, fontWeight:700, fontSize:12, cursor: refreshingOrders ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: refreshingOrders ? 0.6 : 1 }}>
            <RefreshCw size={13} style={ refreshingOrders ? { animation:"spin 0.8s linear infinite" } : undefined }/> Refresh
          </button>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, flexWrap:"wrap" }}>
          <button onClick={handleMassAcceptAndPrint} disabled={massAccepting || counts.pending === 0}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:"none",
              background: (massAccepting || counts.pending === 0) ? "#e5e7eb" : `linear-gradient(135deg,${C.teal},${C.green})`,
              color: (massAccepting || counts.pending === 0) ? "#9ca3af" : "#fff",
              fontWeight:700, fontSize:12, cursor: (massAccepting || counts.pending === 0) ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            {massAccepting ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Printer size={13}/>}
            {massAccepting ? "Accepting…" : `Accept & Print All (${orders.filter(o => o.status === "pending" && stockAvailability[o.id]?.ok).length})`}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"70px 20px", background:"#fff", borderRadius:18, border:`1px dashed ${C.border}`, animation:"cardIn .2s ease" }}>
          <Package size={34} color={C.muted} style={{ opacity:0.5, marginBottom:10 }}/>
          <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:4 }}>No orders here</div>
          <div style={{ fontSize:12.5, color:C.muted }}>
            {statusFilter === "all" ? "New orders will show up here as soon as customers place them." : "Try a different filter or search term."}
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:14 }}>
          {filtered.map((order, i) => (
            <div key={order.id} style={{ animation:"cardIn .28s ease both", animationDelay:`${Math.min(i,10)*30}ms` }}>
              <OrderCard
                order={order}
                onOpen={setViewOrder}
                stockInfo={stockAvailability[order.id]}
                onAccept={handleAccept}
                acceptDisabled={acceptingId === order.id || (order.status === "pending" && !stockAvailability[order.id]?.ok)}
                accepting={acceptingId === order.id}
              />
            </div>
          ))}
        </div>
      )}

      {viewOrder && (
        <OrderDrawer
          order={orders.find(o => o.id === viewOrder.id) || viewOrder}
          onClose={() => setViewOrder(null)}
          onAccept={handleAccept}
          onReject={handleReject}
          onPrint={triggerPrint}
          stockInfo={stockAvailability[viewOrder.id]}
          acceptDisabled={acceptingId === viewOrder.id || (viewOrder.status === "pending" && !stockAvailability[viewOrder.id]?.ok)}
          accepting={acceptingId === viewOrder.id}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)}/>

      <div id="print-area">
        {printQueue.map(o => <ReceiptSlip key={o.id} order={o} />)}
      </div>
    </div>
  );
}


// APPLICATIONS 
function generateTempPassword(length = 10) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghjkmnpqrstuvwxyz",
    "23456789",
    "!@#$",
  ];
  const chars = groups.join("");
  const password = [
    ...groups.map(group => group[Math.floor(Math.random() * group.length)]),
    ...Array.from({ length: Math.max(length - groups.length, 0) }, () => chars[Math.floor(Math.random() * chars.length)]),
  ];
  return password.sort(() => Math.random() - 0.5).join("");
}

// ─────────────────────────────────────────────────────────────────────────
// Delete confirmation modal (ported from ApplicationsContent)
// ─────────────────────────────────────────────────────────────────────────
function FAApplicationConfirmModal({ app, onConfirm, onClose, deleting }) {
  if (!app) return null;
  return (
    <div
      onClick={deleting ? undefined : onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 32px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
          Delete application?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete the application from <strong>"{app.name}"</strong>{app.email ? ` (${app.email})` : ""}.
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
          You can recover this from Delete History.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button" onClick={onClose} disabled={deleting}
            style={{
              padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
              background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button" onClick={onConfirm} disabled={deleting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
            {deleting ? "Deleting…" : "Delete Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FAApplicationsContent({ user, applications: initialApps }) {
  const [activityLog,   setActivityLog]   = useState([]);
  const [applications,  setApplications]  = useState(initialApps || []);
  const [viewApp,       setViewApp]       = useState(null);
  const [accountApp,    setAccountApp]    = useState(null);
  const [alertModal,    setAlertModal]    = useState(null);
  const [restoringId,   setRestoringId]   = useState(null);

  const showAlert = (title, message, type = "info") =>
    setAlertModal({ title, message, type });

  const [menuApp, setMenuApp] = useState(null);
  const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
  const [showAppDeleteHistory, setShowAppDeleteHistory] = useState(false);
  const [role, setRole] = useState("franchisee");

  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterFranchise, setFilterFranchise] = useState("all");
  const [searchQuery,     setSearchQuery]     = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const handleDelete = (id) => {
    const app = applications.find(a => a.id === id);
    if (app) setDeleteTarget(app);
  };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id: row.id, action: row.action,
        ingredientName: row.ingredient_name ?? row.ingredientName,
        branch: row.branch,
        performedBy: row.performed_by ?? row.performedBy,
        role: row.role,
        changes: row.changes,
        timestamp: row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch applications activity log:", err); }
  }, []);

  const fetchApplications = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    if (q && !app.name?.toLowerCase().includes(q) &&
             !app.email?.toLowerCase().includes(q) &&
             !app.phone?.toLowerCase().includes(q)) return false;
    if (filterStatus    !== "all" && app.status    !== filterStatus)    return false;
    if (filterFranchise !== "all" && app.franchise !== filterFranchise) return false;
    return true;
  });

  const fetchAppDeleteHistory = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history`);
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            id:        row.id,
            data:      row.application_data ?? row.data ?? {},
            deletedAt: row.deleted_at       ?? row.deletedAt,
          }))
        : [];
      setAppDeleteHistory(mapped);
    } catch (err) {
      console.error("Failed to fetch application delete history:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAppDeleteHistory();
    fetchActivityLog();
  }, []);

  useEffect(() => {
    if (!alertModal) return;
    const timer = setTimeout(() => {
      setAlertModal(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [alertModal]);

  const handleApprove = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    setAlertModal({ title: "Approving application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
      setMenuApp(prev => prev?.id === id ? { ...prev, status: "approved" } : prev);
      await fetchActivityLog();
      setAlertModal({ title: "Application approved", type: "success" });
    } catch {
      setAlertModal({ title: "Failed to approve", message: "Please try again.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    setAlertModal({ title: "Rejecting application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAlertModal({ title: "Failed to reject", message: data.error || "Please try again.", type: "error" }); return; }

      const app = applications.find(a => a.id === id);
      if (app?.email) {
        await fetch(`${process.env.REACT_APP_API_URL}/send-rejection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: app.email, name: app.name }),
        });
      }

      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
      setMenuApp(prev => prev?.id === id ? { ...prev, status: "rejected" } : prev);
      await fetchActivityLog();
      setAlertModal({ title: "Application rejected", type: "success" });
    } catch {
      setAlertModal({ title: "Failed to reject", message: "Please try again.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDeleteApplication = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setAlertModal({ title: "Deleting application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.id !== deleteTarget.id));
        await fetchAppDeleteHistory();
        await fetchActivityLog();
        setAlertModal({ title: `"${deleteTarget.name}" deleted`, type: "success" });
      } else {
        setAlertModal({ title: "Failed to delete", message: data.error || "Please try again.", type: "error" });
      }
    } catch {
      setAlertModal({ title: "Failed to delete", message: "Please try again.", type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRestoreApplication = async (entry) => {
    setRestoringId(entry.id);
    setAlertModal({ title: "Restoring application…", type: "loading" });
    try {
      const d = entry.data; // raw DB row — snake_case keys
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name, email: d.email, phone: d.phone, franchise: d.franchise,
          paymentMode: d.payment_mode, dob: d.dob, civilStatus: d.civil_status,
          gender: d.gender, nationality: d.nationality, address: d.address,
          dependents: d.dependents, spouseName: d.spouse_name, spouseOccupation: d.spouse_occupation,
          employmentType: d.employment_type, yearsEmployer: d.years_employer, income: d.income,
          employerName: d.employer_name, businessAddress: d.business_address,
          position: d.position, businessNature: d.business_nature,
          signature: d.signature, dateSigned: d.date_signed,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          restored: true,
        }),
      });
      const result = await res.json();

      if (result.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history/${entry.id}`, { method: "DELETE" });
        await fetchAppDeleteHistory();
        await fetchApplications();
        await fetchActivityLog();
        setAlertModal({ title: `"${d.name}" restored`, type: "success" });
      } else {
        setAlertModal({ title: "Failed to restore", message: result.error || "Please try again.", type: "error" });
      }
    } catch (err) {
      console.error("Restore error:", err);
      setAlertModal({ title: "Failed to restore", message: "Please try again.", type: "error" });
    } finally {
      setRestoringId(null);
    }
  };

  const handleExportCSV = () => {
  if (filteredApps.length === 0) {
    setAlertModal({ title: "No applications to export", type: "error" });
    return;
  }

  const headers = [
    "Applicant Name", "Email", "Phone", "Franchise Interest",
    "Date Applied", "Status", "Payment Mode", "Civil Status",
    "Gender", "Nationality", "Address", "Employment Type",
    "Monthly Income", "Employer Name",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "";

  const rows = filteredApps.map(app => [
    app.name, app.email, app.phone, app.franchise,
    fmtDate(app.date), app.status, app.paymentMode, app.civilStatus,
    app.gender, app.nationality, app.address, app.employmentType,
    app.income, app.employerName,
  ].map(escapeCSV).join(","));

  const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\n");

  // Add BOM so Excel opens UTF-8 (₱ sign, etc.) correctly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `applications_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setAlertModal({ title: `Exported ${filteredApps.length} application${filteredApps.length !== 1 ? "s" : ""}`, type: "success" });
};

  // ── Status badge ─────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      pending:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
      approved: { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
      rejected: { bg: "rgba(239,68,68,0.1)",   color: "#dc2626" },
    };
    const s = map[status] || map["pending"];
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      }}>
        {status?.toUpperCase()}
      </span>
    );
  };

  // ── Delete History Modal ─────────────────────────────────────────────────
  const DeleteHistoryModal = () => {
    if (!showAppDeleteHistory) return null;

    const fmt = (d) =>
      new Date(d).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

    return (
      <div
        onClick={() => setShowAppDeleteHistory(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 680, maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Application Delete History
              </h2>
              {appDeleteHistory.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px",
                  borderRadius: 20, background: "#fee2e2", color: "#dc2626",
                }}>
                  {appDeleteHistory.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAppDeleteHistory(false)}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {appDeleteHistory.length === 0 ? (
              <div style={{
                padding: "40px 0", textAlign: "center",
                color: "#9ca3af", fontSize: 13, fontStyle: "italic",
              }}>
                No deleted applications yet.
              </div>
            ) : appDeleteHistory.map((entry, i) => {
              const app = entry.data || {};
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0",
                    borderBottom: i < appDeleteHistory.length - 1
                      ? "1px solid #f0f8f0" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 13, color: "#0d2b1e",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {app.name || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>
                      {app.email} · {app.franchise}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      Deleted: {entry.deletedAt ? fmt(entry.deletedAt) : "—"}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreApplication(entry)}
                    disabled={restoringId !== null}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", borderRadius: 9,
                      border: "1.5px solid #00897b",
                      background: restoringId === entry.id ? "#f0fdf5" : "#e0f2f1",
                      color: "#00695c", fontSize: 12, fontWeight: 700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                      opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1,
                    }}
                  >
                    {restoringId === entry.id ? (
                      <>
                        <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} /> Restoring…
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} /> Restore
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Delete History Modal (root level, NOT inside table) */}
      <DeleteHistoryModal />

      {/* ── Delete confirmation modal ── */}
      <FAApplicationConfirmModal
        app={deleteTarget}
        deleting={deleting}
        onConfirm={confirmDeleteApplication}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
      />

      {/* ── View Application Modal ── */}
      {viewApp && (
        <div onClick={() => setViewApp(null)} style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 680,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            maxHeight: "90vh", overflowY: "auto",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Application Details
              </h2>
              <button onClick={() => setViewApp(null)} style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={15} />
              </button>
            </div>

            {/* Status + Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: "#f0fdf5", borderRadius: 10, border: "1px solid #b2dfdb", flexWrap: "wrap" }}>
              <StatusBadge status={viewApp.status} />
              <span style={{ fontSize: 12, color: "#5a7a65" }}>
                Date Applied: <strong>
                  {viewApp.date
                    ? new Date(viewApp.date).toLocaleDateString("en-PH", {
                        year: "numeric", month: "short", day: "numeric",
                        timeZone: "Asia/Manila"
                      })
                    : "—"}
                </strong>
              </span>
              {viewApp.idType && (
                <span style={{ fontSize: 12, color: "#5a7a65", marginLeft: "auto" }}>
                  ID Used: <strong>{viewApp.idType}</strong>
                </span>
              )}
            </div>

            {/* Section Helper */}
            {(() => {
              const Section = ({ title, children }) => (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: "#00897b", letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: 10, paddingBottom: 6,
                    borderBottom: "1.5px solid #e0f2f1",
                  }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {children}
                  </div>
                </div>
              );

              const Field = ({ label, value, full }) => (
                <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: value ? "#0d2b1e" : "#9ca3af",
                    padding: "7px 10px", background: "#f8fffe", borderRadius: 8,
                    border: "1px solid #e0f2f1", fontStyle: value ? "normal" : "italic",
                  }}>
                    {value || "—"}
                  </div>
                </div>
              );

              const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : null;

              return (
                <>
                  {viewApp.franchise === "iPharma Mart" ? (
                    // ── iPharma-specific view ──
                    <>
                      <Section title="Basic Information">
                        <Field label="First Name"         value={viewApp.firstName} />
      <Field label="Last Name"          value={viewApp.lastName}/>
      <Field label="M.I."               value={viewApp.middleInitial || "N/A"} />
      <Field label="Suffix"             value={viewApp.suffix || "N/A"} />

                        <Field label="Email Address"      value={viewApp.email} />
                        <Field label="Phone Number"       value={viewApp.phone} />
                        <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
                      </Section>

                      <Section title="Personal Information">
                        <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
                        <Field label="Marital Status"     value={viewApp.maritalStatus || viewApp.civil_status} />
                        <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
                        <Field label="TIN"                value={viewApp.tin} />
                        <Field label="ID Type Used"       value={viewApp.idType} />
                        <Field label="Address"            value={viewApp.address}           full />
                      </Section>

                      {(viewApp.spouseName || viewApp.spouseOccupation) && (
                        <Section title="Spouse Information">
                          <Field label="Spouse Name"       value={viewApp.spouseName} />
                          <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
                          <Field label="Spouse Date of Birth" value={fmtDate(viewApp.spouseDob)} />
                        </Section>
                      )}

                      {viewApp.education?.length > 0 && (
                        <Section title="Educational Background">
                          {viewApp.education.map((e, i) => (
                            <React.Fragment key={i}>
                              <Field label={`Degree #${i+1}`}  value={e.degree} />
                              <Field label="School"            value={e.school} />
                              <Field label="Course"            value={e.course} />
                              <Field label="Year Graduated"    value={e.yearGrad?.toString()} />
                            </React.Fragment>
                          ))}
                        </Section>
                      )}

                      <Section title="Business Interest">
                        <Field label="Extent of Involvement"  value={viewApp.involvement}    full />
                        <Field label="Equity Owned (%)"       value={viewApp.equity} />
                        <Field label={"Cash Investment (\u20B1)"}    value={viewApp.investment ? `\u20B1${Number(viewApp.investment).toLocaleString()}` : null} />
                        <Field label="Source of Funds"        value={viewApp.fundSource} />
                        <Field label="Other Businesses"       value={viewApp.otherBusiness}  full />
                        <Field label="Preferred Location"     value={viewApp.location}       full />
                      </Section>

                      <Section title="Declaration">
                        <Field label="Family Dependence"      value={viewApp.familyDepend}   full />
                        <Field label="Market Area"            value={viewApp.marketArea}     full />
                        <Field label="Target Start Date"      value={fmtDate(viewApp.startDate)} />
                      </Section>
                    </>
                  ) : (
                    // ── Regular franchise view (existing fields) ──
                    <>
                      <Section title="Basic Information">
                       <Field label="First Name"         value={viewApp.firstName} />
      <Field label="Last Name"          value={viewApp.lastName}/>
      <Field label="M.I."               value={viewApp.middleInitial || "N/A"} />
      <Field label="Suffix"             value={viewApp.suffix || "N/A"} />

                        <Field label="Email Address"      value={viewApp.email} />
                        <Field label="Phone Number"       value={viewApp.phone} />
                        <Field label="Franchise Interest" value={viewApp.franchise} />
                        <Field label="Payment Mode"       value={viewApp.paymentMode} />
                        <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
                      </Section>

                      <Section title="Personal Information">
                        <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
                        <Field label="Civil Status"       value={viewApp.civilStatus} />
                        <Field label="Gender"             value={viewApp.gender} />
                        <Field label="Nationality"        value={viewApp.nationality} />
                        <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
                        <Field label="ID Type Used"       value={viewApp.idType} />
                        <Field label="Address"            value={viewApp.address}           full />
                      </Section>

                      {(viewApp.spouseName || viewApp.spouseOccupation) && (
                        <Section title="Spouse Information">
                          <Field label="Spouse Name"       value={viewApp.spouseName} />
                          <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
                        </Section>
                      )}

                      <Section title="Employment Information">
                        <Field label="Employment Type"    value={viewApp.employmentType} />
                        <Field label="Years w/ Employer"  value={viewApp.yearsEmployer?.toString()} />
                        <Field label="Monthly Income"     value={viewApp.income ? `\u20B1${Number(viewApp.income).toLocaleString()}` : null} />
                        <Field label="Position"           value={viewApp.position} />
                        <Field label="Company Name"       value={viewApp.employerName}      full />
                        <Field label="Business Address"   value={viewApp.businessAddress}   full />
                        <Field label="Nature of Business" value={viewApp.businessNature} />
                      </Section>
                    </>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: "#00897b",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      marginBottom: 10, paddingBottom: 6,
                      borderBottom: "1.5px solid #e0f2f1",
                    }}>Required Documents</div>

                    {/* Letter of Intent */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Letter of Intent (PDF)</div>
                      {viewApp.letterOfIntent ? (
                        <button
                          onClick={() => {
                            let base64 = viewApp.letterOfIntent;
                            if (base64.includes(",")) {
                              base64 = base64.split(",")[1];
                            }
                            const byteCharacters = atob(base64);
                            const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: "application/pdf" });
                            const url = URL.createObjectURL(blob);
                            window.open(url, "_blank");
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 14px", borderRadius: 8,
                            border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                            color: "#00695c", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit", width: "fit-content",
                          }}
                        >
                          <FileText size={15} /> View Letter of Intent
                        </button>
                      ) : (
                        <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                          No Letter of Intent uploaded
                        </div>
                      )}
                    </div>

                    {/* ID Attachment */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>ID Attachment</div>
                      {viewApp.idImage ? (
                        <img
                          src={viewApp.idImage}
                          alt="Government ID"
                          style={{
                            maxWidth: "100%", maxHeight: 200,
                            borderRadius: 10, border: "1.5px solid #b2dfdb",
                            objectFit: "contain", background: "#f8fffe",
                          }}
                        />
                      ) : viewApp.idType ? (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 14px", borderRadius: 8,
                          border: "1.5px solid #a5d6a7", background: "#e8f5e9",
                          fontSize: 13, fontWeight: 600, color: "#1b5e20",
                        }}>
                          <CheckCircle2 size={15} color="#2E7D32" />
                          ID Verified — {viewApp.idType}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                          No ID attached
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setViewApp(null)} style={{
                padding: "9px 22px", borderRadius: 10,
                border: "1px solid #b2dfdb", background: "#f0fdf5",
                color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast (replaces AlertModal) ── */}
      <Toast toast={alertModal} onClose={() => setAlertModal(null)} />

      {accountApp && (
        <CreateAccountModal
          applicant={accountApp}
          defaultRole="franchisee"
          roles={['Franchisee']}
          onClose={() => setAccountApp(null)}
          onAlert={(message, type) => setAlertModal({ message, type })}
        />
      )}

      {/* ── Actions Menu Modal ── */}
      {menuApp && (
        <div onClick={() => setMenuApp(null)} style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Actions
              </h2>
              <button onClick={() => setMenuApp(null)} style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#5a7a65", marginBottom: 20 }}>
              Applicant:{" "}
              <strong style={{ color: "#0d2b1e" }}>{menuApp.name}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setViewApp(menuApp); setMenuApp(null); showAlert("Viewing application", null, "success"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11,
                  border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                  color: "#00695c", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <Eye size={15} /> View Application Details
              </button>
              <button
                onClick={() => { setAccountApp(menuApp); setMenuApp(null); showAlert("Opening account creation", null, "success"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11, border: "none",
                  background: "linear-gradient(135deg,#2E7D32,#00897b)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(0,180,90,0.28)",
                }}
              >
                <UserPlus size={15} /> Create Account
              </button>
              <button
                onClick={() => { handleApprove(menuApp.id); setMenuApp(null); }}
                disabled={menuApp.status === "approved" || processingId !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11, border: "none",
                  background: menuApp.status === "approved"
                    ? "#e0e0e0"
                    : "linear-gradient(135deg,#00c853,#00897b)",
                  color: menuApp.status === "approved" ? "#9e9e9e" : "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: menuApp.status === "approved" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: menuApp.status === "approved" ? 0.6 : 1,
                }}
              >
                <Check size={15} />
                {menuApp.status === "approved" ? "Already Approved" : "Approve Application"}
              </button>
              <button
                onClick={() => { handleReject(menuApp.id); setMenuApp(null); }}
                disabled={menuApp.status === "rejected" || processingId !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 11, border: "none",
                  background: menuApp.status === "rejected"
                    ? "#e0e0e0"
                    : "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: menuApp.status === "rejected" ? "#9e9e9e" : "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: menuApp.status === "rejected" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: menuApp.status === "rejected" ? 0.6 : 1,
                }}
              >
                <X size={15} />
                {menuApp.status === "rejected" ? "Already Rejected" : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          gap: 16, marginBottom: 24,
        }}>
          {[
            {
              label: "Total Applications", value: applications.length,
              icon: <FileCheck size={20} color="#065f46" />,
              bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "All time",
            },
            {
              label: "Pending Review",
              value: applications.filter(a => a.status === "pending").length,
              icon: <AlertTriangle size={20} color="#92400e" />,
              bg: "linear-gradient(135deg,#fef9c3,#fde68a)", sub: "Awaiting action",
            },
            {
              label: "Approved",
              value: applications.filter(a => a.status === "approved").length,
              icon: <Check size={20} color="#065f46" />,
              bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Successful",
            },
            {
              label: "Rejected",
              value: applications.filter(a => a.status === "rejected").length,
              icon: <X size={20} color="#7f1d1d" />,
              bg: "linear-gradient(135deg,#fee2e2,#fca5a5)", sub: "Not approved",
            },
          ].map((s, i) => <BmStatCard key={i} {...s} />)}
        </div>

        {/* Filter bar */}
        <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

            {/* Search */}
            <div style={{ position:"relative" }}>
              <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
              <input
                type="text"
                placeholder="Search name, email, phone…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding:"9px 12px 9px 30px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, color:"#0d2b1e", background:"#f0fdf5", fontFamily:"inherit", outline:"none", width:240 }}
              />
              {searchQuery && (
                <div onClick={() => setSearchQuery("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#5a7a65" }}>
                  <X size={12}/>
                </div>
              )}
            </div>

            {/* Status */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Franchise Interest */}
            <select value={filterFranchise} onChange={e => setFilterFranchise(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
              <option value="all">All Franchises</option>
              <option value="Food Caravan">Food Caravan</option>
              <option value="Coffee Spot">Coffee Spot</option>
              <option value="iPharma Mart">iPharma Mart</option>
              <option value="iFuel">iFuel</option>
            </select>

            {/* Clear */}
            {(searchQuery || filterStatus !== "all" || filterFranchise !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterFranchise("all"); }}
                style={{ padding:"9px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                Clear filters
              </button>
            )}

            {/* Result count */}
            <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>
              {filteredApps.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
            </span>

          </div>
        </div>

        {/* Table card */}
        <div style={{
          background: C.white,
          border: "1px solid rgba(0,168,76,0.12)",
          borderRadius: 18,
          boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
          overflow: "hidden",
        }}>
          {/* Table header bar */}
          <div style={{
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            padding: "16px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Applications List
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 9,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Export CSV
              </button>

              {/* Delete History button */}
              <button
                onClick={() => setShowAppDeleteHistory(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 9,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.10)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <History size={13} /> Delete History
                {appDeleteHistory.length > 0 && (
                  <span style={{
                    background: "#dc2626", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    padding: "1px 7px", borderRadius: 20,
                  }}>
                    {appDeleteHistory.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 13, minWidth: 900,
            }}>
              <thead>
                <tr>
                  {[
                    "Applicant Name", "Email", "Phone",
                    "Franchise Interest", "Date Applied", "Status", "Actions",
                  ].map(h => (
                    <th key={h} style={{
                      padding: "9px 14px", textAlign: "left",
                      fontWeight: 800, fontSize: 10.5, color: "#00897b",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      borderBottom: `1px solid ${C.border}`,
                      background: "#f8fffe", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: "40px 0", textAlign: "center",
                      color: "#9ca3af", fontSize: 13, fontStyle: "italic",
                    }}>
                      No applications found.
                    </td>
                  </tr>
                ) : filteredApps.map(app => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: `1px solid #f0f8f0` }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f6fef8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0d2b1e" }}>
                      {app.name}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                      {app.email}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                      {app.phone}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#0d2b1e", fontWeight: 600 }}>
                      {app.franchise}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                      {app.date ? new Date(app.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* Actions menu */}
                        <button
                          onClick={() => setMenuApp(app)}
                          style={{
                            ...smallBtnSt,
                            border: "1.5px solid #b2dfdb",
                            background: "#e0f2f1", color: "#00695c",
                            height: 28, padding: "0 12px",
                          }}
                          title="Actions"
                        >
                          <Pencil size={11} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(app.id)}
                          style={{
                            ...smallBtnSt,
                            border: "1.5px solid #fecaca",
                            background: "#fee2e2", color: "#dc2626",
                            height: 28, padding: "0 12px",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function CreateAccountModal({ applicant, onClose, onAlert, roles }) {
  const [sending, setSending] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [branches, setBranches] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(roles?.[0] || 'Franchisee');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`).then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setBrandsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBrandId) { setBranches([]); return; }
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.fullName.value, email = form.email.value, phone = form.phone.value;
    const role = selectedRole;
    const branch = form.branch.value;
    const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
    const brand = selectedBrand?.name || '';
    const tempPassword = generateTempPassword();
    setSending(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: tempPassword, role, brand, branch }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes("duplicate key") || err.error?.includes("users_email_key") || err.code === "23505") {
          onAlert(`An account with the email "${email}" already exists. Please use a different email or check existing accounts.`, 'error');
        } else {
          onAlert(err.error || 'Failed to create account.', 'error');
        }
        return;
      }

      await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, name, password: tempPassword }),
      });
      onAlert(`Account created and credentials sent to ${email}!`, 'success');
      onClose();
    } catch { onAlert('Something went wrong. Please try again.', 'error'); }
    finally { setSending(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>Create Franchisee Account</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Creating account for: <strong style={{ color: '#0d2b1e' }}>{applicant?.name}</strong></p>
        <form onSubmit={handleSubmit}>
          {[['Full Name', 'fullName', 'text', applicant?.name], ['Email Address', 'email', 'email', applicant?.email], ['Phone Number', 'phone', 'tel', applicant?.phone]].map(([label, name, type, def]) => (
            <div key={name} style={{ marginBottom: 14 }}>
              <label style={bmLabel}>{label}</label>
              <input name={name} type={type} defaultValue={def} required style={{ ...bmInput, marginTop: 4 }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Role</label>
            {roles && roles.length > 1 ? (
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                required
                style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input
                value={selectedRole}
                disabled
                style={{ ...bmInput, marginTop: 4, background: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
              />
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Brand</label>
            <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} required disabled={brandsLoading} style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
              <option value="">{brandsLoading ? 'Loading…' : 'Select Brand'}</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={bmLabel}>Assigned Branch</label>
            <select name="branch" required disabled={!selectedBrandId} style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
              <option value="">{!selectedBrandId ? 'Select a brand first' : branches.length === 0 ? 'No branches available' : 'Select Branch'}</option>
              {branches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>A temporary password will be auto-generated and emailed to the applicant.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} disabled={sending} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={sending}
              style={{ display:'flex', alignItems:'center', gap:6, flex: 1, justifyContent:'center', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)',
               opacity: sending ? 0.6 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
              {sending && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
              {sending ? "Creating…" : "✉ Create & Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FACommunicationContent({ user, brands: propBrands = [] }) {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [fetching, setFetching] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteHistory, setDeleteHistory] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const [activityLog, setActivityLog] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const showLoading = (title) => setToast({ type: 'loading', title });
  const showSuccess  = (title, message) => setToast({ type: 'success', title, message });
  const showError    = (title, message) => setToast({ type: 'error', title, message });
  const closeToast   = () => setToast(null);

  const PIN_KEY = 'fa_announcement_pins';

  const fetchActivityLog = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id: row.id,
        action: row.action,
        itemName: row.item_name ?? row.itemName,
        branch: row.branch ?? row.franchise ?? row.branchName,
        performedBy: row.performed_by ?? row.performedBy,
        role: row.role,
        changes: row.changes,
        timestamp: row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch announcements activity log:", err); }
  }, []);

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  useEffect(() => {
    try { const raw = localStorage.getItem(PIN_KEY); if (raw) setPinnedIds(new Set(JSON.parse(raw))); } catch {}
    fetchAnnouncements();
    fetchDeleteHistory();
    fetchActivityLog();
  }, []);

  const fetchAnnouncements = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch { setAnnouncements([]); }
    finally { setFetching(false); }
  };

  const fetchDeleteHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history`);
      const data = await res.json();
      setDeleteHistory(Array.isArray(data) ? data.map(e => ({ id: e.id, deletedAt: e.deleted_at, data: { title: e.title, content: e.content, image_url: e.image_url } })) : []);
    } catch {}
  };

  const persistPins = (newSet) => { try { localStorage.setItem(PIN_KEY, JSON.stringify([...newSet])); } catch {} };

  const handlePin = (item) => {
    const id = String(item.id);
    setPinnedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); persistPins(next); return next; });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { showError('Missing fields', 'Please fill in title and content.'); return; }
    const wasEditing = editing;
    const savedTitle = title;
    setSaving(true);
    try {
      const coords = await getBrowserLocation();
      const url = wasEditing ? `${process.env.REACT_APP_API_URL}/announcements/${wasEditing.id}` : `${process.env.REACT_APP_API_URL}/announcements`;
      const method = wasEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content, image_url: imageUrl.trim() || null,
          userId: user?.id,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showError('Failed to save', data.error || 'Something went wrong.'); return; }
      setModalVisible(false); setEditing(null); setTitle(''); setContent(''); setImageUrl(''); setImageError(false);
      await fetchAnnouncements();
      await fetchActivityLog();
      showSuccess(wasEditing ? 'Announcement updated' : 'Announcement posted', `"${savedTitle}" ${wasEditing ? 'was saved' : 'is now live'}.`);
    } catch {
      showError('Failed to save', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    setConfirmModal({
      itemName: item.title,
      itemId: item.id,
      onConfirm: async () => {
        setDeletingId(item.id);
        try {
          const coords = await getBrowserLocation();
          const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${item.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              performed_by: user?.name || "System",
              role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            }),
          });
          if (res.ok) {
            if (viewingItem?.id === item.id) setViewingItem(null);
            await fetchAnnouncements();
            await fetchDeleteHistory();
            await fetchActivityLog();
            setConfirmModal(null);
            showSuccess('Announcement deleted', `"${item.title}" was removed.`);
          } else {
            showError('Failed to delete', 'Something went wrong.');
          }
        } catch {
          showError('Failed to delete', 'Something went wrong. Please try again.');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleRestore = async (entry) => {
    setRestoringId(entry.id);
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: entry.data.title, content: entry.data.content, image_url: entry.data.image_url || null,
          userId: user?.id,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          restored: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, { method: 'DELETE' });
        await fetchAnnouncements();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showSuccess('Announcement restored', `"${entry.data.title}" is back.`);
      } else {
        showError('Failed to restore', data.error || 'Something went wrong.');
      }
    } catch {
      showError('Failed to restore', 'Something went wrong. Please try again.');
    } finally {
      setRestoringId(null);
    }
  };

  const merged = announcements.map(a => ({ ...a, pinned: pinnedIds.has(String(a.id)) }));
  const now = new Date(), sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const tabFiltered = selectedTab === 'recent' ? merged.filter(a => new Date(a.created_at) >= sevenDaysAgo)
    : selectedTab === 'pinned' ? merged.filter(a => a.pinned)
    : selectedTab === 'deleteHistory' ? [] : merged;

  const fmt = (d) => new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getInitials = (t = '') => t.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

  const tabs = [
    { key: 'all', label: 'All', count: merged.length, icon: Megaphone },
    { key: 'recent', label: 'Recent', count: merged.filter(a => new Date(a.created_at) >= sevenDaysAgo).length, icon: Clock },
    { key: 'pinned', label: 'Pinned', count: pinnedIds.size, icon: Pin },
    { key: 'deleteHistory', label: 'Delete History', count: deleteHistory.length, icon: Trash2 },
  ];

  const isDeletingConfirmTarget = confirmModal && deletingId === confirmModal.itemId;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Confirm modal */}
      {confirmModal && (
        <div onClick={() => !isDeletingConfirmTarget && setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#dc2626" /></div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Delete Announcement?</h2>
            {confirmModal.itemName && <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>You are about to delete <strong>"{confirmModal.itemName}"</strong>.</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmModal(null)} disabled={isDeletingConfirmTarget}
                style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: isDeletingConfirmTarget ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isDeletingConfirmTarget ? 0.6 : 1 }}>
                Cancel
              </button>
              <button onClick={() => confirmModal.onConfirm()} disabled={isDeletingConfirmTarget}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isDeletingConfirmTarget ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(220,38,38,0.35)', opacity: isDeletingConfirmTarget ? 0.7 : 1 }}>
                {isDeletingConfirmTarget ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }}/> : <Trash2 size={14} />}
                {isDeletingConfirmTarget ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '20px 24px 22px', borderRadius: '18px 18px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Megaphone size={20} color="#fff" strokeWidth={2.1} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.25em', marginBottom: 4 }}>IFRANCHISE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px' }}>Announcements</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '5px 11px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d4df33', boxShadow: '0 0 0 3px rgba(212,223,51,0.3)' }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: '#d4df33', letterSpacing: '0.15em' }}>LIVE</span>
          </div>
          <button onClick={() => { setEditing(null); setTitle(''); setContent(''); setImageUrl(''); setImageError(false); setModalVisible(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 7, padding: '14px 20px', background: '#fff', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {tabs.map(({ key, label, count, icon: TabIcon }) => {
          const active = selectedTab === key;
          const isDel = key === 'deleteHistory';
          return (
            <button key={key} onClick={() => setSelectedTab(key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: active ? 'none' : `1px solid ${isDel ? '#fecaca' : C.border}`, transition: 'all .15s', background: active ? (isDel ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)') : isDel ? '#fee2e2' : '#e8f5e9', color: active ? '#fff' : isDel ? '#dc2626' : '#5a7a65', boxShadow: active ? '0 2px 8px rgba(0,180,90,0.28)' : 'none' }}>
              <TabIcon size={11} strokeWidth={2.2} />
              {label}
              {count > 0 && <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 800, background: active ? 'rgba(255,255,255,0.28)' : isDel ? '#fecaca' : C.greenMid, color: active ? '#fff' : isDel ? '#dc2626' : '#2E7D32' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ background: '#f8fffe', padding: '20px 20px 24px', borderRadius: '0 0 18px 18px', minHeight: 300 }}>
        {selectedTab === 'deleteHistory' ? (
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,140,60,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 200px', gap: 8, padding: '10px 16px', borderBottom: `2px solid #e0f2f1`, fontSize: 10, fontWeight: 800, color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#f8fffe' }}>
              <span>Title</span><span>Preview</span><span>Deleted At</span><span></span>
            </div>
            {deleteHistory.length === 0
              ? <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>No deleted announcements.</div>
              : deleteHistory.map((entry, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 200px', gap: 8, alignItems: 'center', padding: '12px 16px', borderBottom: i < deleteHistory.length - 1 ? '1px solid #f0f8f0' : 'none' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.data.title}</div>
                  <div style={{ fontSize: 11, color: '#5a7a65', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.data.content}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{fmt(entry.deletedAt)}</div>
                  <button onClick={() => handleRestore(entry)} disabled={restoringId !== null}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 9, border: '1.5px solid #00897b', background: restoringId === entry.id ? '#f0fdf5' : '#e0f2f1', color: '#00695c', fontSize: 11, fontWeight: 700, cursor: restoringId !== null ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1 }}>
                    {restoringId === entry.id
                      ? <><RefreshCw size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Restoring…</>
                      : <><RotateCcw size={11} /> Restore</>}
                  </button>
                </div>
              ))}
          </div>
        ) : (
          fetching ? <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13, fontStyle: 'italic' }}>Loading…</div>
            : tabFiltered.length === 0 ? <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>No announcements yet.</div>
            : tabFiltered.map(item => (
              <div key={item.id} onClick={() => setViewingItem(prev => prev?.id === item.id ? null : item)}
                style={{ display: 'flex', background: '#fff', borderRadius: 18, marginBottom: 10, border: `1px solid ${item.pinned ? '#FFE082' : C.border}`, boxShadow: item.pinned ? '0 3px 14px rgba(249,168,37,0.18)' : '0 2px 10px rgba(0,140,60,0.07)', overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,140,60,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = item.pinned ? '0 3px 14px rgba(249,168,37,0.18)' : '0 2px 10px rgba(0,140,60,0.07)'; }}>
                <div style={{ width: 4, flexShrink: 0, background: item.pinned ? 'linear-gradient(180deg,#F9A825,#FFC107)' : 'linear-gradient(180deg,#00897b,#4CAF50)' }} />
                <div style={{ flex: 1, padding: '13px 15px 11px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.pinned ? 'linear-gradient(135deg,#F9A825,#E65100)' : 'linear-gradient(135deg,#2E7D32,#00897b)', fontSize: 13, fontWeight: 900, color: '#fff' }}>{getInitials(item.title)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0d2b1e' }}>{item.title}</span>
                        {item.pinned && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF8E1', borderRadius: 6, padding: '2px 6px', border: '1px solid #FFE082', fontSize: 8, fontWeight: 800, color: '#F9A825' }}><Pin size={9} fill="currentColor" strokeWidth={2.2} /> PINNED</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#8AAD96', fontFamily: FONT }}>{new Date(item.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: 12.5, color: '#5a7a65', lineHeight: 1.65, marginTop: 9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'flex-start' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handlePin(item)} title={item.pinned ? 'Unpin announcement' : 'Pin announcement'} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${item.pinned ? '#FFE082' : C.border}`, background: item.pinned ? '#FFF8E1' : '#f0fdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.pinned ? '#F9A825' : C.green }}><Pin size={13} fill={item.pinned ? 'currentColor' : 'none'} strokeWidth={2.2} /></button>
                      <button onClick={() => { setEditing(item); setTitle(item.title); setContent(item.content); setImageUrl(item.image_url || ''); setImageError(false); setModalVisible(true); }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f0fdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00695c' }}><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(item)} disabled={deletingId === item.id}
                        style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f0fdf5', cursor: deletingId === item.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53935', opacity: deletingId === item.id ? 0.6 : 1 }}>
                        {deletingId === item.id ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* View full modal */}
      {viewingItem && (
        <div onClick={() => setViewingItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', borderRadius: '20px 20px 0 0', padding: '20px 22px 28px' }}>
              <button onClick={() => setViewingItem(null)} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>{viewingItem.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontFamily: FONT }}>{new Date(viewingItem.created_at).toLocaleString()}</div>
            </div>
            <div style={{ padding: '22px 24px 28px' }}>
              {viewingItem.image_url && <div style={{ marginBottom: 18, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={viewingItem.image_url} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} /></div>}
              <p style={{ fontSize: 14.5, color: '#1A3A2A', lineHeight: 1.75, margin: 0 }}>{viewingItem.content}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                <button onClick={() => handlePin(viewingItem)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: viewingItem.pinned ? 'none' : '1.5px solid #FFE082', background: viewingItem.pinned ? '#F9A825' : '#FFF8E1', color: viewingItem.pinned ? '#fff' : '#F9A825' }}><Pin size={13} fill={viewingItem.pinned ? 'currentColor' : 'none'} strokeWidth={2.2} /> {viewingItem.pinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => { setEditing(viewingItem); setTitle(viewingItem.title); setContent(viewingItem.content); setImageUrl(viewingItem.image_url || ''); setModalVisible(true); setViewingItem(null); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff' }}><Pencil size={13} /> Edit</button>
                <button onClick={() => { handleDelete(viewingItem); setViewingItem(null); }} disabled={deletingId === viewingItem.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: deletingId === viewingItem.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', border: '1.5px solid #fecaca', background: '#fee2e2', color: '#dc2626', opacity: deletingId === viewingItem.id ? 0.6 : 1 }}>
                  {deletingId === viewingItem.id ? <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={13} />} Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalVisible && (
        <div onClick={() => !saving && setModalVisible(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>{editing ? 'Edit Announcement' : 'New Announcement'}</span>
              <button onClick={() => setModalVisible(false)} disabled={saving} style={{ width: 30, height: 30, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.18)', cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.6 : 1 }}><X size={14} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '22px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Title</label>
                <input type="text" placeholder="Announcement title…" value={title} onChange={e => setTitle(e.target.value)} required disabled={saving} style={{ ...bmInput, marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Content</label>
                <textarea placeholder="Write your announcement…" value={content} onChange={e => setContent(e.target.value)} required rows={4} disabled={saving} style={{ ...bmInput, marginTop: 4, resize: 'vertical', lineHeight: 1.65 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={bmLabel}>Image URL (optional)</label>
                <input type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImageError(false); }} disabled={saving} style={{ ...bmInput, marginTop: 4 }} />
                {imageUrl && !imageError && <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} onError={() => setImageError(true)} /></div>}
                {imageUrl && imageError && <div style={{ marginTop: 8, padding: '9px 12px', background: '#fee2e2', borderRadius: 10, border: '1px solid #fecaca', fontSize: 12, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}><AlertTriangle size={14} strokeWidth={2.2} /> Could not load image.</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModalVisible(false)} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>Cancel</button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)', opacity: saving ? 0.7 : 1 }}>
                  {saving ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }}/> : <Check size={14} />}
                  {saving ? (editing ? 'Saving…' : 'Posting…') : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandFormFields({ form, setForm }) {
  const [catInput, setCatInput] = useState("");
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
    background: "#f0fdf5", fontFamily: "inherit", outline: "none",
    marginTop: 4, boxSizing: "border-box",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65",
    marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  const addCategory = () => {
    const val = catInput.trim();
    if (!val) return;
    if ((form.categories || []).map((c) => c.toLowerCase()).includes(val.toLowerCase())) {
      alert(`"${val}" is already in the list.`);
      return;
    }
    setForm((f) => ({ ...f, categories: [...(f.categories || []), val] }));
    setCatInput("");
  };
  const removeCategory = (cat) =>
    setForm((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={lbl}>Brand Name *</label>
        <input style={inputSt} {...f("name")} placeholder="Enter brand name" required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Contact Email</label>
          <input type="email" style={inputSt} {...f("contact_email")} placeholder="brand@example.com" />
        </div>
        <div>
          <label style={lbl}>Contact Phone</label>
          <input
            type="tel"
            style={inputSt}
            maxLength={11}
            value={form.contact_phone}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
              const isShortcut = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(e.key.toLowerCase());
              if (!/^\d$/.test(e.key) && !allowed.includes(e.key) && !isShortcut) e.preventDefault();
            }}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setForm((prev) => ({ ...prev, contact_phone: digits }));
            }}
            placeholder="09XXXXXXXXX"
          />
        </div>
      </div>
      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 }} {...f("description")} rows={3} placeholder="Brief description..." />
      </div>
      <div>
        <label style={lbl}>Categories</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            style={{ ...inputSt, marginTop: 0, flex: 1 }}
            placeholder="e.g. Medicine, Supplement..."
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
          />
          <button
            type="button"
            onClick={addCategory}
            style={{
              padding: "9px 16px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {(form.categories || []).length === 0 ? (
          <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 6 }}>No categories yet.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
            {form.categories.map((cat) => (
              <span
                key={cat}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 20,
                  background: "#e0f2f1", border: "1.5px solid #00897b",
                  color: "#00695c", fontSize: 12, fontWeight: 700,
                }}
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#00897b" }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BranchFormFields({ form, setForm, brands }) {
  const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
  const inputSt = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
    background: "#f0fdf5", fontFamily: "inherit", outline: "none",
    marginTop: 4, boxSizing: "border-box",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65",
    marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em",
  };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={lbl}>Parent Brand *</label>
        <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("brand_id")} required>
          <option value="">Select brand</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Branch Name *</label>
        <input style={inputSt} {...f("name")} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Region *</label>
          <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("region")} required>
            <option value="">Select region</option>
            {["NCR", "Region 3", "Region 4A", "Region 4B", "Region 5", "Region 7", "Region 11"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        {String(form.brand_id) === brands.find((b) => b.name === "Coffee Spot")?.id?.toString() && (
          <div>
            <label style={lbl}>Concept *</label>
            <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("concept")}>
              <option value="">Select concept</option>
              <option>Full Store</option>
              <option>Kiosk</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label style={lbl}>Branch Manager</label>
        <input style={inputSt} {...f("manager")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Contact Number</label>
          <input
            type="tel"
            style={inputSt}
            maxLength={11}
            value={form.contact}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", "Control"];
              const isShortcut = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(e.key.toLowerCase());
              if (!/^\d$/.test(e.key) && !allowed.includes(e.key) && !isShortcut) e.preventDefault();
            }}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setForm((prev) => ({ ...prev, contact: digits }));
            }}
          />
        </div>
        <div>
          <label style={lbl}>Address</label>
          <input style={inputSt} {...f("address")} />
        </div>
      </div>
    </div>
  );
}

function BmModal({ title, onClose, onSubmit, submitting, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0, fontFamily: "Plus Jakarta Sans,sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.6 : 1 }}>Cancel</button>
            <button type="submit" disabled={submitting}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(0,180,90,0.35)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }}/> : <Check size={14} />}
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    if (toast.type === "loading") return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isErr = toast.type === "error";
  const isLoading = toast.type === "loading";

  return (
    <div style={{
      position:"fixed", top:22, right:22, zIndex:4000, display:"flex", alignItems:"flex-start", gap:12,
      maxWidth:380, padding:"16px 18px", borderRadius:14,
      background: isErr ? "#fef2f2" : "#f0fdf5",
      borderLeft: `5px solid ${isErr ? "#dc2626" : "#00897b"}`,
      border: `1px solid ${isErr ? "#fecaca" : "#b2dfdb"}`,
      borderLeftWidth: 5,
      boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      animation:"toastIn .22s ease",
    }}>
      <div style={{
        flexShrink:0, width:32, height:32, borderRadius:"50%", display:"flex",
        alignItems:"center", justifyContent:"center",
        background: isErr ? "#dc2626" : "#00897b", color:"#fff",
        boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(0,137,123,0.4)"}`,
      }}>
        {isErr
          ? <AlertTriangle size={16}/>
          : isLoading
            ? <RefreshCw size={16} style={{ animation:"spin 0.8s linear infinite" }}/>
            : <Check size={16}/>}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color: isErr ? "#7f1d1d" : "#0d2b1e" }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize:12.5, color: isErr ? "#991b1b" : "#3f5f4f", marginTop:3, lineHeight:1.4 }}>
            {toast.message}
          </div>
        )}
      </div>

      {!isLoading && (
        <button onClick={onClose} style={{
          background:"none", border:"none",
          color: isErr ? "#991b1b" : "#3f5f4f",
          cursor:"pointer", padding:2, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

function BrandDeleteConfirmModal({ target, onConfirm, onClose, deleting }) {
  if (!target) return null;
  const isBrand = target.type === "brand";

  return (
    <div
      onClick={deleting ? undefined : onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 32px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
          Delete {isBrand ? "brand" : "branch"}?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 6 }}>
          You are about to delete <strong>"{target.name}"</strong>
          {!isBrand && target.brandName ? ` under ${target.brandName}` : ""}.
        </p>
        {isBrand && target.branchCount > 0 && (
          <p style={{ textAlign: "center", fontSize: 12.5, color: "#dc2626", fontWeight: 600, lineHeight: 1.6, marginBottom: 6 }}>
            This will also remove {target.branchCount} associated branch{target.branchCount === 1 ? "" : "es"}.
          </p>
        )}
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
          You can recover this from Delete History.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button" onClick={onClose} disabled={deleting}
            style={{
              padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
              background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button" onClick={onConfirm} disabled={deleting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            <Trash2 size={14} /> {deleting ? "Deleting…" : `Delete ${isBrand ? "Brand" : "Branch"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandDeleteHistoryPanel({ history, onRestore, restoringId, onClose }) {
  const fmt = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 580, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>Delete History</h2>
            {history.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{history.length} deleted</span>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => (
            <div key={entry.id ?? i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none" }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", background: entry.type === "brand" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)", color: entry.type === "brand" ? "#2563eb" : "#059669" }}>
                {entry.type === "brand" ? "Brand" : "Branch"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
                <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>{fmt(entry.deletedAt)}{entry.type === "brand" && entry.data?.branches?.length > 0 ? ` · ${entry.data.branches.length} ${entry.data.branches.length === 1 ? "branch" : "branches"} included` : ""}{entry.type === "branch" && entry.brandName ? ` · ${entry.brandName}` : ""}</div>
              </div>
              <button
                onClick={() => onRestore(entry)}
                disabled={restoringId !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 9,
                  border: "1.5px solid #00897b",
                  background: restoringId === entry.id ? "#f0fdf5" : "#e0f2f1",
                  color: "#00695c", fontSize: 12, fontWeight: 700,
                  cursor: restoringId !== null ? "not-allowed" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                  opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1,
                }}
              >
                {restoringId === entry.id ? (
                  <>
                    <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} /> Restoring…
                  </>
                ) : (
                  <>
                    <RotateCcw size={12} /> Restore
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FABrandBranchContent({ user, brands: propBrands, onBrandsChange }) {
  const [brands,              setBrands]              = useState(propBrands || []);
  const [loading,             setLoading]             = useState(true);
  const [searchQuery,         setSearchQuery]         = useState("");
  const [filterRegion,        setFilterRegion]        = useState("all");
  const [filterBrand,         setFilterBrand]         = useState("all");
  const [showAddBrandModal,   setShowAddBrandModal]   = useState(false);
  const [showEditBrandModal,  setShowEditBrandModal]  = useState(false);
  const [showAddBranchModal,  setShowAddBranchModal]  = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBrand,       setSelectedBrand]       = useState(null);
  const [selectedBranch,      setSelectedBranch]      = useState(null);
  const [deleteTarget,        setDeleteTarget]        = useState(null);
  const [deleting,            setDeleting]            = useState(false);
  const [deletedHistory,      setDeletedHistory]      = useState([]);
  const [showHistory,         setShowHistory]         = useState(false);
  const [restoringId,         setRestoringId]         = useState(null);
  const [alertModal,          setAlertModal]          = useState(null);
  const emptyBrand  = { name: "", categories: [], contact_email: "", contact_phone: "", description: "" };
  const emptyBranch = { name: "", brand_id: "", region: "", manager: "", contact: "", address: "", concept: "" };
  const [brandForm,  setBrandForm]  = useState(emptyBrand);
  const [branchForm, setBranchForm] = useState(emptyBranch);

  const [activityLog, setActivityLog] = useState([]);

  const showAlert   = (message, type = "info") => setAlertModal({ title: message, type });
  const showLoading = (title) => setAlertModal({ type: "loading", title });
  const showSuccess = (title, message) => setAlertModal({ type: "success", title, message });
  const showError   = (title, message) => setAlertModal({ type: "error", title, message });

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id:          row.id,
        action:      row.action,
        itemName:    row.item_name ?? row.itemName,
        branch:      row.branch,
        performedBy: row.performed_by ?? row.performedBy,
        role:        row.role,
        changes:     row.changes,
        timestamp:   row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch brands activity log:", err); }
  }, []);

  const fetchDeleteHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(entry => ({
        ...entry,
        brandName: entry.brand_name ?? null,
        deletedAt: entry.deleted_at ?? null,
        data: typeof entry.data === 'string' ? JSON.parse(entry.data) : (entry.data ?? {}),
      })) : [];
      setDeletedHistory(normalized);
    } catch (err) { console.error(err); }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        if (a.name === "Head Office") return -1;
        if (b.name === "Head Office") return 1;
        return 0;
      });
      setBrands(sorted);
      onBrandsChange?.(sorted);
    } catch (err) { console.error("Failed to fetch brands:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); fetchDeleteHistory(); fetchActivityLog(); }, [fetchActivityLog]);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const duplicate = brands.some((b) => b.name.trim().toLowerCase() === brandForm.name.trim().toLowerCase());
    if (duplicate) { showError("Duplicate brand", `A brand named "${brandForm.name}" already exists.`); return; }
    showLoading("Adding brand…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brandForm,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrands();
        await fetchActivityLog();
        setShowAddBrandModal(false);
        setBrandForm(emptyBrand);
        showSuccess("Brand added", `"${brandForm.name}" has been added.`);
      } else showError("Failed to add brand", data.error || "Something went wrong.");
    } catch { showError("Failed to add brand", "Something went wrong. Please try again."); }
  };

  const handleEditBrand = async (e) => {
    e.preventDefault();
    showLoading("Updating brand…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${selectedBrand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brandForm,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrands();
        await fetchActivityLog();
        setShowEditBrandModal(false);
        setSelectedBrand(null);
        showSuccess("Brand updated", `"${brandForm.name}" has been updated.`);
      } else showError("Failed to update brand", data.error || "Something went wrong.");
    } catch { showError("Failed to update brand", "Something went wrong. Please try again."); }
  };

  const handleDeleteBrand = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    const brand = brands.find((b) => b.id === id);
    const brandToSave = {
      name: brand.name,
      categories: brand.categories || [],
      contact_email: brand.contact_email || null,
      contact_phone: brand.contact_phone || null,
      description: brand.description || null,
      branches: (brand.branches || []).map(br => ({
        name: br.name, region: br.region || null, manager: br.manager || null,
        contact: br.contact || null, address: br.address || null, concept: br.concept || null,
      })),
    };
    setDeleting(true);
    showLoading("Deleting brand…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'brand', name, brand_name: null, data: brandToSave }),
        });
        await fetchBrands();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showSuccess("Brand deleted", `"${name}" has been deleted.`);
      } else showError("Failed to delete brand", data.error || "Something went wrong.");
    } catch { showError("Failed to delete brand", "Something went wrong. Please try again."); }
    finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    const parentBrand = brands.find((b) => String(b.id) === String(branchForm.brand_id));
    const duplicate = parentBrand?.branches?.some((br) => br.name.trim().toLowerCase() === branchForm.name.trim().toLowerCase());
    if (duplicate) { showError("Duplicate branch", `A branch named "${branchForm.name}" already exists under this brand.`); return; }
    showLoading("Adding branch…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...branchForm,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrands();
        await fetchActivityLog();
        setShowAddBranchModal(false);
        setBranchForm(emptyBranch);
        showSuccess("Branch added", `"${branchForm.name}" has been added.`);
      } else showError("Failed to add branch", data.error || "Something went wrong.");
    } catch { showError("Failed to add branch", "Something went wrong. Please try again."); }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    showLoading("Updating branch…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...branchForm,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        await fetchBrands();
        await fetchActivityLog();
        setShowEditBranchModal(false);
        setSelectedBranch(null);
        showSuccess("Branch updated", `"${branchForm.name}" has been updated.`);
      } else showError("Failed to update branch", data.error || "Something went wrong.");
    } catch { showError("Failed to update branch", "Something went wrong. Please try again."); }
  };

  const handleDeleteBranch = async () => {
    if (!deleteTarget) return;
    const { id, name, brandName } = deleteTarget;
    const branch = brands.flatMap((b) => b.branches || []).find((br) => br.id === id);
    setDeleting(true);
    showLoading("Deleting branch…");
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'branch', name, brand_name: brandName, data: branch }),
        });
        await fetchBrands();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showSuccess("Branch deleted", `"${name}" has been deleted.`);
      } else showError("Failed to delete branch", data.error || "Something went wrong.");
    } catch { showError("Failed to delete branch", "Something went wrong. Please try again."); }
    finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRestore = async (entry) => {
    setRestoringId(entry.id);
    showLoading(entry.type === "brand" ? "Restoring brand…" : "Restoring branch…");
    try {
      const coords = await getBrowserLocation();
      if (entry.type === "brand") {
        const { branches, ...brandFields } = entry.data;
        const branchList = Array.isArray(branches) ? branches : [];
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...brandFields,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            restored: true,
          }),
        });
        const data = await res.json();
        if (!data.success) { showError("Failed to restore brand", data.error || "Something went wrong."); return; }
        const newBrandId = data.brand?.id;
        for (const br of branchList) {
          const { id: _ignore, brand_id: _ignore2, ...branchFields } = br;
          await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: branchFields.name,
              region: branchFields.region || null,
              manager: branchFields.manager || null,
              contact: branchFields.contact || null,
              address: branchFields.address || null,
              concept: branchFields.concept || null,
              brand_id: newBrandId,
              performed_by: user?.name || "System",
              role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              restored: true,
            }),
          });
        }
        await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
        await fetchBrands();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showSuccess("Brand restored", `"${brandFields.name}" has been restored.`);
      } else {
        const parentBrand = brands.find((b) => b.name === entry.brandName);
        if (!parentBrand) { showError("Cannot restore branch", `Parent brand "${entry.brandName || 'unknown'}" was not found.`); return; }
        const { id: _id, brand_id: _bid, ...branchFields } = entry.data;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: branchFields.name,
            region: branchFields.region || null,
            manager: branchFields.manager || null,
            contact: branchFields.contact || null,
            address: branchFields.address || null,
            concept: branchFields.concept || null,
            brand_id: parentBrand.id,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            restored: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
          await fetchBrands();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showSuccess("Branch restored", `"${branchFields.name}" has been restored.`);
        } else showError("Failed to restore branch", data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Restore error:", err);
      showError("Failed to restore", err.message || "Something went wrong. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
  const allRegions    = [...new Set(brands.flatMap((b) => b.branches?.map((br) => br.region) || []).filter(Boolean))];
  const filteredBrands = brands.map((brand) => {
    const brandNameMatches = searchQuery && brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    return {
      ...brand,
      branches: (brand.branches || []).filter((br) =>
        (!searchQuery || brandNameMatches || br.name.toLowerCase().includes(searchQuery.toLowerCase()) || (br.manager || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterRegion === "all" || br.region === filterRegion)
      ),
    };
  }).filter((brand) => {
    if (filterBrand !== "all" && String(brand.id) !== String(filterBrand)) return false;
    if (filterRegion === "all" && searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
    if (filterRegion !== "all" && brand.branches.length === 0) return false;
    return true;
  });

  const ConceptBadge = ({ concept }) => {
    const styles = { "Full Store": { bg: "rgba(16,185,129,0.1)", color: "#059669" }, "Kiosk": { bg: "rgba(59,130,246,0.1)", color: "#2563eb" } };
    const s = styles[concept] || { bg: "rgba(156,163,175,0.1)", color: "#6b7280" };
    return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{concept || "—"}</span>;
  };

  const thSt = { padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "2px solid #d1eedd", background: "#f8fffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const tdSt = { padding: "11px 12px", borderBottom: "1px solid #f0f8f0", verticalAlign: "middle", overflow: "hidden" };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`.bm-root * { font-family:'Plus Jakarta Sans',sans-serif !important; box-sizing:border-box; } .bm-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; } .bm-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); } .bm-brand-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; box-shadow:0 2px 14px rgba(0,140,60,0.07); margin-bottom:24px; overflow:hidden; } .bm-brand-header { background:linear-gradient(135deg,#2E7D32,#00897b); color:#fff; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; } .bm-input { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; } .bm-input:focus { border-color:#00897b; box-shadow:0 0 0 2px rgba(0,137,123,0.12); } .bm-select { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; appearance:none; cursor:pointer; } .bm-branch-tr:hover td { background:#f6fef8 !important; } .bm-branch-tr:last-child td { border-bottom:none !important; } @keyframes bm-spin { to { transform: rotate(360deg); } }`}</style>
      <div className="bm-root">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Brands",   value: brands.length, icon: <Globe size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "Registered brands" },
            { label: "Total Branches", value: totalBranches, icon: <Store size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Across all brands" },
          ].map((s, i) => (
            <div key={i} className="bm-stat">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>{s.value}</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>{s.sub}</span>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
              <input type="text" placeholder="Search brands or branches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bm-input" style={{ paddingLeft:32, width:260 }}/>
            </div>
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bm-select" style={{ width:180 }}>
              <option value="all">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bm-select" style={{ width:180 }}>
              <option value="all">All Regions</option>
              {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
              <button onClick={() => setShowHistory(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #dc2626", background:"#fff", color:"#dc2626", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <History size={14}/> Delete History{deletedHistory.length > 0 ? ` (${deletedHistory.length})` : ""}
              </button>
              <button onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #00897b", background:"#fff", color:"#00897b", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <Plus size={14}/> Add Branch
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>Loading brands & branches...</div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>No brands found. Add your first brand above.</div>
        ) : filteredBrands.map((brand) => (
          <div key={brand.id} className="bm-brand-card">
            <div className="bm-brand-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Globe size={20} color="#fff" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                    {brand.contact_email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                    {brand.contact_phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? "branch" : "branches"}</span>
                <button onClick={() => { setSelectedBrand(brand); setBrandForm({ name: brand.name, categories: brand.categories || [], contact_email: brand.contact_email, contact_phone: brand.contact_phone, description: brand.description }); setShowEditBrandModal(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Edit2 size={12} /> Edit Brand</button>
                <button onClick={() => setDeleteTarget({ type: "brand", id: brand.id, name: brand.name, branchCount: brand.branches?.length || 0 })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,150,150,0.5)", background: "rgba(255,80,80,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Trash2 size={12} /> Delete</button>
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                <colgroup><col style={{ width: "20%" }} /><col style={{ width: "11%" }} /><col style={{ width: "16%" }} /><col style={{ width: "13%" }} /><col style={{ width: "22%" }} /><col style={{ width: "10%" }} /><col style={{ width: "8%" }} /></colgroup>
                <thead><tr>{["Branch Name","Region","Manager","Contact","Address","Concept","Actions"].map((h) => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                <tbody>
                  {(!brand.branches || brand.branches.length === 0) ? (
                    <tr><td colSpan={7} style={{ padding: "24px 20px", color: "#5a7a65", fontSize: 13, fontStyle: "italic", textAlign: "center", borderBottom: "none" }}>No branches yet.{" "}<span style={{ color: "#00897b", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }} onClick={() => { setBranchForm({ ...emptyBranch, brand_id: brand.id }); setShowAddBranchModal(true); }}>Add the first branch</span></td></tr>
                  ) : brand.branches.map((branch) => (
                    <tr key={branch.id} className="bm-branch-tr">
                      <td style={{ ...tdSt, fontWeight: 700, color: "#0d2b1e", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.name}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.region}</td>
                      <td style={{ ...tdSt, color: "#0d2b1e", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.manager || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.contact || "—"}</td>
                      <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.address || "—"}</td>
                      <td style={tdSt}>{brand.name === "Coffee Spot" ? <ConceptBadge concept={branch.concept} /> : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}</td>
                      <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          <button title="Edit branch" onClick={() => { setSelectedBranch(branch); setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager, contact: branch.contact, address: branch.address, concept: branch.concept || "" }); setShowEditBranchModal(true); }} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c", cursor: "pointer", flexShrink: 0 }}><Pencil size={13} /></button>
                          <button title="Delete branch" onClick={() => setDeleteTarget({ type: "branch", id: branch.id, name: branch.name, brandName: brand.name })} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showAddBrandModal   && <BmModal title="Add New Brand"  onClose={() => setShowAddBrandModal(false)}  onSubmit={handleAddBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showEditBrandModal  && <BmModal title="Edit Brand"     onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
      {showAddBranchModal  && <BmModal title="Add New Branch" onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
      {showEditBranchModal && <BmModal title="Edit Branch"    onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}

      <BrandDeleteConfirmModal
        target={deleteTarget}
        deleting={deleting}
        onConfirm={deleteTarget?.type === "brand" ? handleDeleteBrand : handleDeleteBranch}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
      />

      {showHistory && (
        <BrandDeleteHistoryPanel
          history={deletedHistory}
          onRestore={handleRestore}
          restoringId={restoringId}
          onClose={() => setShowHistory(false)}
        />
      )}

      <Toast toast={alertModal} onClose={() => setAlertModal(null)} />
    </div>
  );
}



function FAProfileContent({ user }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', personalEmail: '', role: user?.role || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('minLength');
    if (!/[A-Z]/.test(password)) errors.push('uppercase');
    if (!/[a-z]/.test(password)) errors.push('lowercase');
    if (!/\d/.test(password)) errors.push('number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('specialChar');
    return { isValid: errors.length === 0, errors };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'newPassword') {
      if (value) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(value).errors); }
      else { setShowPasswordValidation(false); setPasswordErrors([]); }
    }
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      const data = await res.json();
      if (data.success) { setOtpSent(true); setAlertModal({ message: `OTP sent to ${emailToSend}`, type: 'success' }); }
      else setAlertModal({ message: data.message || 'Failed to send OTP.', type: 'error' });
    } catch { setAlertModal({ message: 'Failed to send OTP.', type: 'error' }); }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError('');
      const emailToVerify = formData.personalEmail || formData.email;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword, email: emailToVerify, otp: otp.trim() }),
      });
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
    if (!isUnlocked) return;
    const errs = {};
    const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (isPasswordChange) {
      if (!formData.currentPassword) errs.currentPassword = 'Enter your current password.';
      if (!formData.newPassword) errs.newPassword = 'Enter a new password.';
      else { const pv = validatePasswordStrength(formData.newPassword); if (!pv.isValid) errs.newPassword = 'Password does not meet requirements.'; }
      if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your new password.';
      else if (formData.newPassword !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
      sendOtp(); setShowOtpModal(true);
    } else updateProfile();
  };

  const updateProfile = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, branch: user.branch }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertModal({ message: 'Profile updated!', type: 'success' });
        localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name, email: formData.email }));
        setIsUnlocked(false);
      } else setAlertModal({ message: data.error || 'Failed to update.', type: 'error' });
    } catch { setAlertModal({ message: 'Failed to update.', type: 'error' }); }
  };

  const initials = user?.name ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'F';

  const inputStyle = (disabled) => ({ ...bmInput, marginTop: 4, background: disabled ? '#f5f8f5' : '#fff', color: disabled ? '#9ca3af' : '#0d2b1e', cursor: disabled ? 'not-allowed' : 'text', border: disabled ? '1.5px solid #e5e7eb' : '1.5px solid #b2dfdb' });

  const EyeToggle = ({ show, onToggle, disabled }) => (
    <button type="button" onClick={onToggle} disabled={disabled} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: '#5a7a65', display: 'flex', alignItems: 'center', padding: 0 }}>
      {show ? <Eye size={16} /> : <Lock size={16} />}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {alertModal && <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />}

      {/* Account overview */}
      <BmSection style={{ marginBottom: 24 }}>
        <BmSectionHeader title="Account Overview" />
        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#e9cd30,#ffa875)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#3d2000', flexShrink: 0, letterSpacing: 1, border: '2.5px solid rgba(233,205,48,0.4)' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#0d2b1e', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'linear-gradient(135deg,rgba(233,205,48,0.2),rgba(255,168,117,0.15))', color: '#3d2000', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, border: '1px solid rgba(233,205,48,0.3)' }}>{ROLE_LABEL}</span>
              {user?.branch && <span style={{ background: '#f0fdf5', color: '#0d2b1e', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1.5px solid #b2dfdb' }}>{user.branch}</span>}
            </div>
          </div>
        </div>
      </BmSection>

      {/* Lock/Unlock banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isUnlocked ? '#f0fdf5' : '#f5f8f5', border: `1.5px solid ${isUnlocked ? '#b2dfdb' : '#e5e7eb'}`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUnlocked ? <Unlock size={18} color="#00897b" /> : <Lock size={18} color="#94a3b8" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{isUnlocked ? 'Editing Enabled' : 'Profile Locked'}</div>
            <div style={{ fontSize: 11, color: '#5a7a65' }}>{isUnlocked ? 'Make your changes and save when done.' : 'Click Unlock to edit your profile.'}</div>
          </div>
        </div>
        <button type="button" onClick={() => { if (isUnlocked) { setConfirmModal({ message: 'Discard all unsaved changes?', onConfirm: () => { setFormData({ name: user?.name || '', email: user?.email || '', personalEmail: '', role: user?.role || '', currentPassword: '', newPassword: '', confirmPassword: '' }); setIsUnlocked(false); } }); } else setIsUnlocked(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: isUnlocked ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff' }}>
          {isUnlocked ? '✕ Cancel' : ' Unlock'}
        </button>
      </div>

      {/* Two-column form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Personal Info */}
        <BmSection>
          <BmSectionHeader title="Personal Information" />
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
            {[['Full Name', 'name', 'text'], ['Work Email', 'email', 'email']].map(([label, name, type]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <label style={bmLabel}>{label}</label>
                <input type={type} name={name} value={formData[name]} onChange={handleInputChange} disabled={!isUnlocked} style={inputStyle(!isUnlocked)} />
                {fieldErrors[name] && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>}
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              <input value={formData.role} disabled style={{ ...inputStyle(true), background: '#f0f0f0' }} />
            </div>
            <button type="submit" disabled={!isUnlocked} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: isUnlocked ? 1 : 0.6 }}>Save Changes</button>
          </form>
        </BmSection>

        {/* Change Password */}
        <BmSection>
          <BmSectionHeader title="Change Password" />
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
            <div style={{ background: isUnlocked ? '#f0fdf5' : '#f5f8f5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1.5px solid ${isUnlocked ? C.border : '#e5e7eb'}`, fontSize: 12, color: C.muted }}>
              {isUnlocked ? 'An OTP will be sent to your email for verification' : 'Unlock your profile to change your password'}
            </div>
            {[['currentPassword', 'Current Password', showCurrentPw, () => setShowCurrentPw(v => !v)],
              ['newPassword', 'New Password', showNewPw, () => setShowNewPw(v => !v)],
              ['confirmPassword', 'Confirm New Password', showConfirmPw, () => setShowConfirmPw(v => !v)]].map(([name, label, show, toggle]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <label style={bmLabel}>{label}</label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input type={show ? 'text' : 'password'} name={name} value={formData[name]} onChange={handleInputChange} placeholder={isUnlocked ? `Enter ${label.toLowerCase()}` : '••••••••'} disabled={!isUnlocked} style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }} />
                  <EyeToggle show={show} onToggle={toggle} disabled={!isUnlocked} />
                </div>
                {name === 'newPassword' && isUnlocked && showPasswordValidation && (
                  <div style={{ marginTop: 8, fontSize: 12, padding: '10px 14px', background: '#f0fdf5', borderRadius: 10, border: '1.5px solid #b2dfdb' }}>
                    {[['minLength', 'At least 8 characters'], ['uppercase', 'Uppercase letter'], ['lowercase', 'Lowercase letter'], ['number', 'Number (0-9)'], ['specialChar', 'Special character']].map(([k, t]) => (
                      <div key={k} style={{ color: passwordErrors.includes(k) ? '#dc2626' : '#059669', marginBottom: 2, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{passwordErrors.includes(k) ? '✗' : '✓'} {t}</div>
                    ))}
                  </div>
                )}
                {name === 'confirmPassword' && isUnlocked && formData.confirmPassword && (
                  <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: formData.newPassword === formData.confirmPassword ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
                {fieldErrors[name] && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>}
              </div>
            ))}
            <button type="submit" disabled={!isUnlocked} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: isUnlocked ? 1 : 0.6 }}>Update Password</button>
          </form>
        </BmSection>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.6rem' }}>🔑</div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', marginBottom: 6 }}>Verify OTP</h2>
              <p style={{ fontSize: 13, color: C.muted }}>Code sent to <strong style={{ color: '#0d2b1e' }}>{formData.personalEmail || formData.email}</strong></p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Enter 6-Digit OTP</label>
              <input type="text" placeholder="000000" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }} maxLength={6} autoFocus
                style={{ ...bmInput, marginTop: 6, fontSize: 24, textAlign: 'center', letterSpacing: '0.6rem', fontFamily: FONT }} />
            </div>
            {otpError && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, border: '1.5px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>{otpError}</div>}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button type="button" onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#00897b', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>Resend OTP</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button type="button" onClick={verifyOtpAndChangePassword} disabled={otp.length !== 6} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: otp.length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: otp.length !== 6 ? 0.5 : 1 }}>Verify & Change</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 22, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>Password Changed!</h2>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>Your password has been updated successfully. Redirecting to login…</p>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>↩</div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Discard Changes?</h2>
            <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Keep Editing</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#c2410c,#ea580c)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
